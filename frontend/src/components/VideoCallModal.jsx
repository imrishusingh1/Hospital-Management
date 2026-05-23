import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone, Minimize2, Maximize2, SwitchCamera } from 'lucide-react';
import api from '../services/api';

// ─── Ringtone ─────────────────────────────────────────────────────────────────
function createRingtone() {
  let stopped = false;
  let intervalId = null;
  function playOneCycle() {
    if (stopped) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const tones = [
        { freq: 830,  start: 0.00, dur: 0.18 },
        { freq: 1047, start: 0.22, dur: 0.18 },
        { freq: 1319, start: 0.44, dur: 0.25 },
      ];
      tones.forEach(({ freq, start, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0,   ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start + dur - 0.03);
        gain.gain.linearRampToValueAtTime(0,   ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime  + start + dur);
      });
      setTimeout(() => { try { ctx.close(); } catch (_) {} }, 1500);
    } catch (e) { console.warn('[Ringtone]', e); }
  }
  playOneCycle();
  intervalId = setInterval(playOneCycle, 2800);
  return function stop() { stopped = true; clearInterval(intervalId); };
}

// ─── Fallback ICE config (STUN only) ─────────────────────────────────────────
const STUN_ONLY = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────
const VideoCallModal = ({
  socket,
  currentUser,
  targetUser,
  targetUserId: propTargetUserId,
  isIncoming,
  incomingOffer,
  pendingIceCandidatesRef,
  onClose,
  onCallLog,
}) => {
  const localVideoRef    = useRef(null);
  const remoteVideoRef   = useRef(null);
  const pcRef            = useRef(null);
  const localStreamRef   = useRef(null);
  const streamPromiseRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  const remoteDescSet    = useRef(false);
  const stopRingtoneRef  = useRef(null);
  const timerRef         = useRef(null);
  const hasInitiatedRef  = useRef(false);
  const iceConfigRef     = useRef(null); // cached ICE servers from backend
  const iceRestartTimer  = useRef(null);

  const [callState,    setCallState]    = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const hasConnectedRef = useRef(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Remote stream as React STATE — eliminates all ref timing races.
  // The useEffect below safely wires it to the video element post-commit.
  const [remoteStream, setRemoteStream] = useState(null);

  // Wire remoteStream → video element AFTER every React render commit
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl || !remoteStream) return;
    videoEl.srcObject = remoteStream;
    videoEl.play().catch(err =>
      console.warn('[WebRTC] remoteVideo.play() blocked:', err.name));
  }, [remoteStream]);

  const targetUserId = propTargetUserId
    || targetUser?.userId?.toString()
    || targetUser?.id?.toString()
    || targetUser?._id?.toString();

  const incomingOfferRef = useRef(incomingOffer);
  useEffect(() => { if (incomingOffer) incomingOfferRef.current = incomingOffer; }, [incomingOffer]);

  // ── Ringtone ─────────────────────────────────────────────────────────────
  const startRing = () => { if (!stopRingtoneRef.current) stopRingtoneRef.current = createRingtone(); };
  const stopRing  = () => { if (stopRingtoneRef.current) { stopRingtoneRef.current(); stopRingtoneRef.current = null; } };

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
  };
  const stopTimer = () => { clearInterval(timerRef.current); timerRef.current = null; };

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopRing(); stopTimer();
    clearTimeout(iceRestartTimer.current);
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setRemoteStream(null);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    iceCandidateQueue.current = [];
    remoteDescSet.current = false;
  }, []); // eslint-disable-line

  useEffect(() => () => cleanup(), [cleanup]);
  useEffect(() => { startRing(); }, []); // eslint-disable-line

  // ── Fetch ICE servers from backend (with TURN credentials) ───────────────
  const getIceConfig = async () => {
    if (iceConfigRef.current) return iceConfigRef.current;
    try {
      const res = await api.get('/chat/ice-servers');
      const config = { iceServers: res.data.iceServers };
      iceConfigRef.current = config;
      return config;
    } catch (err) {
      console.warn('[ICE] Could not fetch from backend, using STUN-only fallback:', err.message);
      return STUN_ONLY;
    }
  };

  // ── Media ─────────────────────────────────────────────────────────────────
  const startLocalStream = async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;
      if (streamPromiseRef.current) return await streamPromiseRef.current;
      streamPromiseRef.current = navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      const stream = await streamPromiseRef.current;
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      // Check if device has multiple cameras (to show/hide switch button)
      navigator.mediaDevices.enumerateDevices().then(devices => {
        setHasMultipleCameras(devices.filter(d => d.kind === 'videoinput').length > 1);
      }).catch(() => {});

      return stream;
    } catch (err) {
      console.error('[getUserMedia]', err);
      return null;
    } finally { streamPromiseRef.current = null; }
  };

  const setRemoteDescAndFlush = async (pc, sdp) => {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    remoteDescSet.current = true;
    for (const c of iceCandidateQueue.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
    }
    iceCandidateQueue.current = [];
  };

  const createPeerConnection = (localStream, iceConfig) => {
    const pc = new RTCPeerConnection(iceConfig);
    pcRef.current = pc;
    remoteDescSet.current = false;
    // DO NOT CLEAR iceCandidateQueue HERE! It might already contain buffered candidates
    // from the socket listener while the call was ringing!

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('call:ice-candidate', { targetUserId, candidate: e.candidate });
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log('[WebRTC] ICE state:', state);

      if (state === 'disconnected') {
        // Give it 3 s to self-recover before restarting ICE
        iceRestartTimer.current = setTimeout(() => {
          if (pcRef.current?.iceConnectionState === 'disconnected') {
            console.log('[WebRTC] ICE still disconnected, restarting...');
            pcRef.current.restartIce();
          }
        }, 3000);
      }

      if (state === 'failed') {
        console.warn('[WebRTC] ICE failed — attempting restart');
        pcRef.current?.restartIce();
      }

      if (state === 'connected' || state === 'completed') {
        clearTimeout(iceRestartTimer.current);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };

    // ── THE KEY FIX ──────────────────────────────────────────────────────
    // Store stream in React STATE, not directly in the DOM ref.
    // The useEffect at the top attaches it to <video> post-render-commit,
    // guaranteeing the DOM node is ready and the browser autoplay policy
    // is satisfied (element is visible in the document).
    pc.ontrack = (e) => {
      if (e.streams?.[0]) {
        setRemoteStream(e.streams[0]);
      } else if (e.track) {
        // Rare fallback: no stream bundle — build one from the track
        setRemoteStream(prev => {
          if (prev) { prev.addTrack(e.track); return prev; }
          return new MediaStream([e.track]);
        });
      }
    };

    return pc;
  };

  // ── Call flow ─────────────────────────────────────────────────────────────
  const initiateCall = async () => {
    const [stream, iceConfig] = await Promise.all([startLocalStream(), getIceConfig()]);
    if (!stream) return;
    const pc = createPeerConnection(stream, iceConfig);
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    socket.emit('call:offer', { targetUserId, offer });
    setCallState('ringing');
  };

  const acceptCall = async () => {
    stopRing();

    if (!incomingOfferRef.current) {
      console.log('[WebRTC] Waiting for offer...');
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (incomingOfferRef.current) { clearInterval(check); resolve(); }
        }, 100);
        setTimeout(() => { clearInterval(check); resolve(); }, 5000);
      });
    }

    setCallState('connected');
    setHasConnected(true);
    hasConnectedRef.current = true;
    startTimer();

    const [stream, iceConfig] = await Promise.all([startLocalStream(), getIceConfig()]);
    if (!stream) return;

    const pc = createPeerConnection(stream, iceConfig);

    if (incomingOfferRef.current) {
      await setRemoteDescAndFlush(pc, incomingOfferRef.current);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { targetUserId, answer });
    } else {
      console.error('[WebRTC] No offer received — cannot complete handshake');
    }
  };

  const rejectCall = () => { socket.emit('call:reject', { targetUserId }); cleanup(); onClose(); };

  const endCall = () => {
    socket.emit('call:end', { targetUserId });
    if (!hasConnectedRef.current && !isIncoming && onCallLog) onCallLog('Missed Video Call');
    if (hasConnectedRef.current && onCallLog) onCallLog(`Video Call Ended • ${formatDuration(callDuration)}`);
    cleanup(); onClose();
  };

  const toggleMute  = () => { localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setIsMuted(p => !p); };
  const toggleVideo = () => { localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; }); setIsVideoOff(p => !p); };

  const switchCamera = async () => {
    try {
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      const oldStream = localStreamRef.current;
      const oldVideoTrack = oldStream?.getVideoTracks()[0];
      
      // CRITICAL: On mobile (especially iOS), you must stop the active camera 
      // before the browser will allow you to switch to the other one.
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        oldStream.removeTrack(oldVideoTrack);
      }
      
      let newVideoStream;
      try {
        // Try exact facingMode first
        newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: newFacingMode } }
        });
      } catch (e) {
        // Fallback to non-exact if exact fails
        newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode }
        });
      }
      
      setFacingMode(newFacingMode);
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      
      if (oldStream && newVideoTrack) {
        oldStream.addTrack(newVideoTrack);
        if (isVideoOff) newVideoTrack.enabled = false;
      }
      
      if (pcRef.current && newVideoTrack) {
        const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }
    } catch (err) {
      console.error('Camera switch failed:', err);
      // Attempt recovery of original camera
      try {
        const recoveryStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        const recoveryTrack = recoveryStream.getVideoTracks()[0];
        if (localStreamRef.current && recoveryTrack) {
          localStreamRef.current.addTrack(recoveryTrack);
          if (pcRef.current) {
            const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender) await sender.replaceTrack(recoveryTrack);
          }
        }
      } catch (recoveryErr) {
        console.error('Camera recovery failed:', recoveryErr);
      }
    }
  };

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onAnswer = async ({ answer }) => {
      console.log('[WebRTC] Got answer from callee');
      stopRing();
      if (pcRef.current) {
        await setRemoteDescAndFlush(pcRef.current, answer);
        setCallState('connected');
        setHasConnected(true);
        hasConnectedRef.current = true;
        startTimer();
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current && remoteDescSet.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
      } else {
        iceCandidateQueue.current.push(candidate);
      }
    };

    const onCallEnd      = () => { if (!hasConnectedRef.current && isIncoming && onCallLog) onCallLog('Missed Video Call'); cleanup(); onClose(); };
    const onCallRejected = () => { if (!isIncoming && onCallLog) onCallLog('Missed Video Call'); cleanup(); onClose(); };

    socket.on('call:answer',        onAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:end',           onCallEnd);
    socket.on('call:rejected',      onCallRejected);

    // Flush any candidates that arrived before we mounted
    const flushInterval = setInterval(() => {
      if (pendingIceCandidatesRef?.current?.length > 0) {
        const candidates = [...pendingIceCandidatesRef.current];
        pendingIceCandidatesRef.current = [];
        candidates.forEach(c => onIceCandidate({ candidate: c }));
      }
    }, 200);

    if (!isIncoming && !hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      initiateCall();
    }

    return () => {
      clearInterval(flushInterval);
      socket.off('call:answer',        onAnswer);
      socket.off('call:ice-candidate', onIceCandidate);
      socket.off('call:end',           onCallEnd);
      socket.off('call:rejected',      onCallRejected);
    };
  }, [socket]); // eslint-disable-line

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div 
      className={`fixed z-[9999] flex flex-col items-center justify-center transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-36 h-52 sm:w-48 sm:h-72 rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer border border-slate-700 hover:border-brand-500' 
          : 'inset-0 bg-black'
      }`}
      onClick={() => isMinimized && setIsMinimized(false)}
    >
      {/* Remote video — always in DOM, srcObject managed by useEffect */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full scale-x-[-1] ${isMinimized ? 'object-cover' : 'object-contain'}`}
        style={{ background: '#000' }}
      />

      {isMinimized && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Maximize2 size={24} className="text-white drop-shadow-lg" />
        </div>
      )}

      {/* Overlay */}
      {!isMinimized && <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />}

      {/* Local video PiP */}
      {!isMinimized && (
        <div className="absolute top-6 right-6 w-32 h-44 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-10">
          <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
          {isVideoOff && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <VideoOff size={24} className="text-white/60" />
            </div>
          )}
        </div>
      )}

      {/* Header */}
      {!isMinimized && (
        <div className="absolute top-6 left-6 z-10 text-white flex gap-4 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
              {callState === 'incoming' ? 'Incoming Call' : callState === 'ringing' ? 'Calling...' : callState === 'connected' ? 'Connected' : ''}
            </p>
            <h2 className="text-2xl font-bold">{targetUser?.name || 'Unknown'}</h2>
            {callState === 'connected' && (
              <p className="text-sm text-emerald-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
                <span className="font-mono text-white/80 bg-white/10 px-2 py-0.5 rounded-full text-xs tracking-widest">
                  {formatDuration(callDuration)}
                </span>
              </p>
            )}
          </div>
          {callState === 'connected' && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
              className="mt-1 p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-white"
              title="Minimize to chat"
            >
              <Minimize2 size={20} />
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      {!isMinimized && (
        <div className="absolute bottom-10 z-10 flex items-center gap-6">
          {callState === 'incoming' ? (
            <>
              <button onClick={rejectCall} className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-xl transition-all">
                <PhoneOff size={28} />
              </button>
              <button onClick={acceptCall} className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl transition-all animate-pulse">
                <Phone size={28} />
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isMuted ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'}`}>
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button onClick={endCall} className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-2xl transition-all">
                <PhoneOff size={30} />
              </button>
              <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isVideoOff ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'}`}>
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
              {hasMultipleCameras && (
                <button onClick={switchCamera} className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all bg-white/20 hover:bg-white/30 backdrop-blur-md" title="Switch Camera">
                  <SwitchCamera size={22} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Waiting animation */}
      {!isMinimized && (callState === 'calling' || callState === 'ringing') && (
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-5xl">👤</div>
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
