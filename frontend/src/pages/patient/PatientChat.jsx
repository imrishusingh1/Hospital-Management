import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Send, Paperclip, SmilePlus, Video, Search, Phone, ChevronLeft, X, Download, Image, File } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { initSocket } from '../../services/socket';
import VideoCallModal from '../../components/VideoCallModal';
import toast from 'react-hot-toast';

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const EMOJIS = ['😊','😂','❤️','👍','🙏','😢','😮','🔥','✅','😷','💊','🏥','👨‍⚕️','👩‍⚕️','💉','🩺','🩹','💪','😌','🤒','🤧','🌡️','😴','🥗','💧','☀️','🌿','🎉','👋','🤝'];

const ChatPage = () => {
  const { user, profile } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const [callState, setCallState] = useState(null); // null | { type: 'outgoing'|'incoming', offer?, targetUser }

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConvRef = useRef(activeConv);
  const conversationsRef = useRef(conversations);
  // Buffer the SDP offer so it is never lost even if call:offer arrives
  // before the VideoCallModal has mounted and registered its own listener.
  const pendingOfferRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]); // Add buffer for ICE candidates

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Init socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = initSocket(token);
    socketRef.current = socket;

    const onNewMessage = (msg) => {
      const isCurrentActive = activeConvRef.current?.conversationId === msg.conversationId;
      
      // 1. Add message if it belongs to current active chat
      if (isCurrentActive) {
        setMessages(prev => [...prev, msg]);
        api.post(`/chat/mark-read/${msg.conversationId}`).catch(() => {});
        socket.emit('message-read', { conversationId: msg.conversationId });
      }

      // 2. Update conversations list
      setConversations(prev => {
        const index = prev.findIndex(c => c.conversationId === msg.conversationId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: msg,
            unreadCount: isCurrentActive ? 0 : updated[index].unreadCount + 1
          };
          // Move to top
          const [moved] = updated.splice(index, 1);
          return [moved, ...updated];
        }
        return prev;
      });
    };

    socket.on('new-message', onNewMessage);

    socket.on('typing', () => setIsTyping(true));
    socket.on('stop-typing', () => setIsTyping(false));
    socket.on('messages-read', () => {
      setMessages(prev => prev.map(m => ({ ...m, readAt: m.readAt || new Date() })));
    });

    socket.on('call:incoming', ({ from, callerName, conversationId }) => {
      const conv = conversationsRef.current.find(c => c.conversationId === conversationId);
      const targetUser = conv?.participant
        ? { ...conv.participant, userId: conv.participant.userId || from }
        : { name: callerName, userId: from, id: from };
      setCallState({
        type: 'incoming',
        // Use the already-buffered offer (if call:offer arrived first), else null
        offer: pendingOfferRef.current || null,
        targetUser,
        targetUserId: from,
      });
      pendingOfferRef.current = null; // consumed
    });

    socket.on('call:offer', ({ from, offer }) => {
      // Buffer the offer. If the modal is already open, pass it in via state.
      // If the modal isn't open yet, store it so call:incoming can pick it up.
      pendingOfferRef.current = offer;
      setCallState(prev => prev ? { ...prev, offer } : null);
    });

    socket.on('call:ice-candidate', ({ from, candidate }) => {
      // Buffer the candidate so VideoCallModal can pick it up even if it hasn't mounted yet
      pendingIceCandidatesRef.current.push(candidate);
    });

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('messages-read');
      socket.off('call:incoming');
      socket.off('call:offer');
      socket.off('call:ice-candidate');
    };
  }, []); // Run ONCE, we use refs inside listeners to prevent stale closures

  // Fetch conversations
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.data || []);
      } catch (e) {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${activeConv.conversationId}`);
        setMessages(res.data.data || []);
        // Join socket room
        socketRef.current?.emit('join-room', activeConv.conversationId);
        // Mark read
        api.post(`/chat/mark-read/${activeConv.conversationId}`).catch(() => {});
        socketRef.current?.emit('message-read', { conversationId: activeConv.conversationId });
      } catch (e) {
        toast.error('Failed to load messages');
      }
    };
    fetchMessages();
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setShowMobileList(false);
    setIsTyping(false);
  };

  const handleTyping = (val) => {
    setInputText(val);
    if (!activeConv) return;
    socketRef.current?.emit('typing', { conversationId: activeConv.conversationId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { conversationId: activeConv.conversationId });
    }, 1500);
  };

  const sendMessage = async (textOverride, attachment, isCallLog = false) => {
    const text = textOverride ?? inputText.trim();
    if (!text && !attachment) return;
    if (!activeConv) return;

    const localMsg = {
      conversationId: activeConv.conversationId,
      senderId: user._id,
      senderRole: user.role,
      text: text || null,
      attachment: attachment || null,
      isCallLog,
      createdAt: new Date().toISOString(),
      _localId: `temp_${Date.now()}`,
    };

    setMessages(prev => [...prev, localMsg]);
    setInputText('');
    setShowEmoji(false);

    // Only send needed fields to server
    const payload = {
      conversationId: activeConv.conversationId,
      text: text || null,
      attachment: attachment || null,
      isCallLog,
    };

    try {
      const res = await api.post('/chat/send', payload);
      socketRef.current?.emit('send-message', res.data.data);
      setMessages(prev => prev.map(m => m._localId === localMsg._localId ? res.data.data : m));
      setConversations(prev =>
        prev.map(c => c.conversationId === activeConv.conversationId
          ? { ...c, lastMessage: res.data.data }
          : c
        )
      );
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m._localId !== localMsg._localId));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await sendMessage('', res.data.data);
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const startVideoCall = () => {
    if (!activeConv) return;
    const tUserId = activeConv.participant.userId?.toString()
      || activeConv.participant._id?.toString()
      || activeConv.participant.id?.toString();
    socketRef.current?.emit('call:initiate', {
      targetUserId: tUserId,
      callerName: profile ? `${profile.firstName} ${profile.lastName}` : user.email,
      conversationId: activeConv.conversationId,
    });
    setCallState({ type: 'outgoing', targetUser: activeConv.participant, targetUserId: tUserId });
  };

  const filteredConvs = conversations.filter(c =>
    c.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMe = (msg) => {
    if (!user?._id) return false;
    const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
    return senderId === user._id.toString();
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">

      {/* Video Call Modal */}
      {callState && (
        <VideoCallModal
          socket={socketRef.current}
          currentUser={user}
          targetUser={callState.targetUser}
          targetUserId={callState.targetUserId}
          isIncoming={callState.type === 'incoming'}
          incomingOffer={callState.offer}
          pendingIceCandidatesRef={pendingIceCandidatesRef}
          onClose={() => setCallState(null)}
          onCallLog={(text) => sendMessage(text, null, true)}
        />
      )}

      {/* LEFT — Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white shrink-0 ${!showMobileList && activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              {conversations.length === 0
                ? 'No confirmed appointments yet.\nChat unlocks after appointment confirmation.'
                : 'No conversations match your search.'}
            </div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeConv?.conversationId === conv.conversationId ? 'bg-brand-50 border-l-4 border-l-brand-500' : ''}`}
              >
                <div className="relative shrink-0">
                  {conv.participant.avatar ? (
                    <img src={resolveUrl(conv.participant.avatar)} className="w-11 h-11 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                      {conv.participant.name.charAt(0)}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900 text-sm truncate">{conv.participant.name}</span>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatTime(conv.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  {conv.participant.specialization && (
                    <p className="text-xs text-brand-600 font-medium">{conv.participant.specialization}</p>
                  )}
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.lastMessage
                      ? conv.lastMessage.attachment
                        ? `📎 ${conv.lastMessage.attachment.name || 'Attachment'}`
                        : conv.lastMessage.text
                      : 'Start a conversation'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT — Chat Window */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${showMobileList && !activeConv ? 'hidden md:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} className="text-brand-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Select a conversation</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Choose a doctor or patient from the list to start messaging.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm">
              <button onClick={() => setShowMobileList(true)} className="md:hidden text-slate-500 mr-1">
                <ChevronLeft size={22} />
              </button>
              <div className="relative shrink-0">
                {activeConv.participant.avatar ? (
                  <img src={resolveUrl(activeConv.participant.avatar)} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                    {activeConv.participant.name.charAt(0)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm">{activeConv.participant.name}</h3>
                <p className="text-xs text-slate-500">
                  {isTyping ? <span className="text-brand-500 animate-pulse">Typing...</span> : (activeConv.participant.specialization || activeConv.participant.role)}
                </p>
              </div>
              <button
                onClick={startVideoCall}
                className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Video Call"
              >
                <Video size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-8">
                  No messages yet. Say hello! 👋
                </div>
              )}
              {messages.map((msg, idx) => {
                const mine = isMe(msg);
                
                if (msg.isCallLog) {
                  return (
                    <div key={msg._id || idx} className="flex justify-center my-3">
                      <div className="px-4 py-1.5 bg-slate-200/60 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2">
                        <Phone size={12} className={msg.text.includes('Missed') ? 'text-rose-500' : 'text-slate-500'} />
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg._id || idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {msg.attachment ? (
                        <div className={`rounded-2xl overflow-hidden shadow-sm ${mine ? 'rounded-br-sm bg-brand-500' : 'rounded-bl-sm bg-white border border-slate-200'}`}>
                          {msg.attachment.type === 'image' ? (
                            <a href={resolveUrl(msg.attachment.url)} target="_blank" rel="noreferrer">
                              <img
                                src={resolveUrl(msg.attachment.url)}
                                alt={msg.attachment.name}
                                className="max-w-[240px] max-h-[180px] object-cover"
                              />
                            </a>
                          ) : (
                            <a
                              href={resolveUrl(msg.attachment.url)}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-3 p-3 ${mine ? 'text-white' : 'text-slate-700'}`}
                            >
                              <File size={20} className={mine ? 'text-white/80' : 'text-brand-500'} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[140px]">{msg.attachment.name}</p>
                                <p className="text-xs opacity-70">{msg.attachment.size ? `${(msg.attachment.size / 1024).toFixed(1)} KB` : 'File'}</p>
                              </div>
                              <Download size={16} className="opacity-70 shrink-0" />
                            </a>
                          )}
                          {msg.text && (
                            <p className={`px-3 pb-2 pt-1 text-sm ${mine ? 'text-white' : 'text-slate-800'}`}>{msg.text}</p>
                          )}
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${mine ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'}`}>
                          {msg.text}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</span>
                        {mine && msg.readAt && <span className="text-[10px] text-brand-400">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker */}
            {showEmoji && (
              <div className="mx-4 sm:mx-6 mb-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-lg">
                <div className="grid grid-cols-10 gap-1">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-xl hover:scale-125 transition-transform p-0.5">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100">
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
                {/* File upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-slate-400 hover:text-brand-500 transition-colors shrink-0 mb-1"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip size={20} />
                  )}
                </button>

                {/* Text input */}
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-slate-800 resize-none outline-none placeholder:text-slate-400 max-h-32 py-1"
                />

                {/* Emoji toggle */}
                <button
                  onClick={() => setShowEmoji(prev => !prev)}
                  className={`shrink-0 mb-1 transition-colors ${showEmoji ? 'text-brand-500' : 'text-slate-400 hover:text-brand-500'}`}
                >
                  <SmilePlus size={20} />
                </button>

                {/* Send */}
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim()}
                  className="w-9 h-9 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
