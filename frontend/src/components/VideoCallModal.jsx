import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoCallModal = ({ socket, currentUser, targetUser, isIncoming, incomingOffer, onClose }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const [callState, setCallState] = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const targetUserId = targetUser?.userId?.toString() || targetUser?.id?.toString();

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error('getUserMedia error:', err);
      return null;
    }
  };

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // ICE candidate
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('call:ice-candidate', { targetUserId, candidate: e.candidate });
      }
    };

    // Remote stream
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    return pc;
  };

  // Initiate call (caller side)
  const initiateCall = async () => {
    const stream = await startLocalStream();
    if (!stream) return;
    const pc = createPeerConnection(stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('call:offer', { targetUserId, offer });
    setCallState('ringing');
  };

  // Accept call (callee side)
  const acceptCall = async () => {
    setCallState('connected');
    const stream = await startLocalStream();
    if (!stream) return;
    const pc = createPeerConnection(stream);
    if (incomingOffer) {
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { targetUserId, answer });
    }
  };

  const rejectCall = () => {
    socket.emit('call:reject', { targetUserId });
    cleanup();
    onClose();
  };

  const endCall = () => {
    socket.emit('call:end', { targetUserId });
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsVideoOff(prev => !prev);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Caller: received answer from callee
    const onAnswer = async ({ answer }) => {
      setCallState('connected');
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    // Both sides: receive ICE candidates
    const onIceCandidate = async ({ candidate }) => {
      if (pcRef.current && candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const onCallEnd = () => { cleanup(); onClose(); };
    const onCallRejected = () => { cleanup(); onClose(); };

    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:end', onCallEnd);
    socket.on('call:rejected', onCallRejected);

    // Auto-initiate if caller
    if (!isIncoming) initiateCall();

    return () => {
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onIceCandidate);
      socket.off('call:end', onCallEnd);
      socket.off('call:rejected', onCallRejected);
    };
  }, [socket]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      {/* Remote Video (full screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Local Video (PiP) */}
      <div className="absolute top-6 right-6 w-32 h-44 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-10">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {isVideoOff && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <VideoOff size={24} className="text-white/60" />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 z-10 text-white">
        <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
          {callState === 'incoming' ? 'Incoming Call' : callState === 'ringing' ? 'Calling...' : callState === 'connected' ? 'Connected' : ''}
        </p>
        <h2 className="text-2xl font-bold">{targetUser?.name || 'Unknown'}</h2>
        {callState === 'connected' && (
          <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 z-10 flex items-center gap-6">
        {/* Incoming call controls */}
        {callState === 'incoming' ? (
          <>
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-xl transition-all"
            >
              <PhoneOff size={28} />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl transition-all animate-pulse"
            >
              <Phone size={28} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isMuted ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'}`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
              onClick={endCall}
              className="w-18 h-18 w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-2xl transition-all"
            >
              <PhoneOff size={30} />
            </button>

            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isVideoOff ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'}`}
            >
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>
          </>
        )}
      </div>

      {/* Calling animation (no remote video yet) */}
      {(callState === 'calling' || callState === 'ringing') && (
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-5xl">
              👤
            </div>
            <span className="absolute inset-0 rounded-full animate-ping border-2 border-white/20" />
          </div>
          <p className="text-white/60 text-sm animate-pulse">
            {callState === 'calling' ? 'Connecting...' : 'Waiting for answer...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoCallModal;
