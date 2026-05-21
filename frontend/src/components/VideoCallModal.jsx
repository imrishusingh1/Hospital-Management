import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

// ─── ICE Config ───────────────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80',              username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443',             username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
};

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
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0,    ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
        gain.gain.setValueAtTime(0.3,  ctx.currentTime + start + dur - 0.03);
        gain.gain.linearRampToValueAtTime(0,   ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime  + start + dur);
      });
      setTimeout(() => { try { ctx.close(); } catch (_) {} }, 1500);
    } catch (e) {
      console.warn('[Ringtone]', e);
    }
  }

  playOneCycle();
  intervalId = setInterval(playOneCycle, 2800);

  return function stop() {
    stopped = true;
    clearInterval(intervalId);
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
const VideoCallModal = ({
  socket,
  currentUser,
  targetUser,
  targetUserId: propTargetUserId,
  isIncoming,
  incomingOffer,
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
  const hasInitiatedRef  = useRef(false); // prevent double-call

  const [callState,    setCallState]    = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // ── KEY FIX: remote stream as React state ───────────────────────────────
  // Storing the MediaStream in state ensures the useEffect below runs AFTER
  // React has committed the video element to the DOM, eliminating all
  // race conditions between ontrack callbacks and ref availability.
  const [remoteStream, setRemoteStream] = useState(null);

  // Whenever remoteStream state changes, wire it to the video element.
  // This useEffect runs after React commits, so the DOM node is guaranteed ready.
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (!videoEl || !remoteStream) return;

    console.log('[WebRTC] Attaching remote stream to video element', remoteStream.id);
    videoEl.srcObject = remoteStream;

    // Some browsers (especially mobile) need an explicit play() call
    videoEl.play().catch((err) => {
      console.warn('[WebRTC] remoteVideo.play() was blocked:', err.name, err.message);
    });
  }, [remoteStream]);

  const targetUserId = propTargetUserId
    || targetUser?.userId?.toString()
    || targetUser?.id?.toString()
    || targetUser?._id?.toString();

  // Keep incomingOffer in a ref so acceptCall always reads the latest value
  const incomingOfferRef = useRef(incomingOffer);
  useEffect(() => {
    if (incomingOffer) incomingOfferRef.current = incomingOffer;
  }, [incomingOffer]);

  // ── Ringtone ─────────────────────────────────────────────────────────────
  const startRing = () => {
    if (stopRingtoneRef.current) return;
    stopRingtoneRef.current = createRingtone();
  };
  const stopRing = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
  };

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };
  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatDuration = (s) => {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopRing();
    stopTimer();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setRemoteStream(null); // clear state too
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    iceCandidateQueue.current = [];
    remoteDescSet.current = false;
  }, []); // eslint-disable-line

  useEffect(() => () => cleanup(), [cleanup]);

  // Ring on open
  useEffect(() => {
    startRing();
  }, []); // eslint-disable-line

  // ── Media helpers ─────────────────────────────────────────────────────────
  const startLocalStream = async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;
      if (streamPromiseRef.current) return await streamPromiseRef.current;
      streamPromiseRef.current = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const stream = await streamPromiseRef.current;
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error('[getUserMedia]', err);
      return null;
    } finally {
      streamPromiseRef.current = null;
    }
  };

  const setRemoteDescriptionAndFlush = async (pc, sdp) => {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    remoteDescSet.current = true;
    for (const c of iceCandidateQueue.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
    }
    iceCandidateQueue.current = [];
  };

  const createPeerConnection = (localStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    remoteDescSet.current = false;
    iceCandidateQueue.current = [];

    // Add local tracks
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('call:ice-candidate', { targetUserId, candidate: e.candidate });
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC] ICE failed, restarting...');
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };

    // ── THE FIX ────────────────────────────────────────────────────────────
    // Store the remote MediaStream in React state instead of imperatively
    // touching the DOM ref. The useEffect at the top of this component will
    // safely attach it to the <video> element after React commits the render.
    //
    // ontrack fires once per track (audio then video). Both events share the
    // same MediaStream object via e.streams[0]. We call setRemoteStream on
    // every track event so that the video track arrival also triggers the
    // useEffect, ensuring the video element picks it up.
    pc.ontrack = (e) => {
      console.log('[WebRTC] ontrack fired — kind:', e.track.kind, 'streams:', e.streams.length);
      const incoming = e.streams?.[0];
      if (incoming) {
        // Always update state so the useEffect re-fires and re-attaches srcObject.
        // Using the functional form avoids stale closure issues.
        setRemoteStream(incoming);
      } else {
        // Fallback: build a stream manually from the track if no stream bundle
        console.warn('[WebRTC] ontrack: no stream in event, building manually');
        setRemoteStream(prev => {
          if (prev) {
            prev.addTrack(e.track);
            return prev; // mutate and return same ref to preserve identity
          }
          const ms = new MediaStream([e.track]);
          return ms;
        });
      }
    };

    return pc;
  };

  // ── Call actions ──────────────────────────────────────────────────────────
  const initiateCall = async () => {
    const stream = await startLocalStream();
    if (!stream) return;
    const pc = createPeerConnection(stream);
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    socket.emit('call:offer', { targetUserId, offer });
    setCallState('ringing');
  };

  const acceptCall = async () => {
    stopRing();

    // Wait up to 5 s for the offer if it hasn't arrived yet
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
    startTimer();

    const stream = await startLocalStream();
    if (!stream) return;

    const pc = createPeerConnection(stream);

    if (incomingOfferRef.current) {
      await setRemoteDescriptionAndFlush(pc, incomingOfferRef.current);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { targetUserId, answer });
    } else {
      console.error('[WebRTC] No offer received — cannot complete handshake');
    }
  };

  const rejectCall = () => {
    socket.emit('call:reject', { targetUserId });
    cleanup();
    onClose();
  };

  const endCall = () => {
    socket.emit('call:end', { targetUserId });
    if (!hasConnected && !isIncoming && onCallLog) onCallLog('Missed Video Call');
    if (hasConnected && onCallLog) onCallLog(`Video Call Ended • ${formatDuration(callDuration)}`);
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(prev => !prev);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOff(prev => !prev);
  };

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onAnswer = async ({ answer }) => {
      console.log('[WebRTC] Got answer from callee');
      stopRing();
      if (pcRef.current) {
        await setRemoteDescriptionAndFlush(pcRef.current, answer);
        setCallState('connected');
        setHasConnected(true);
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

    const onCallEnd = () => {
      if (!hasConnected && isIncoming && onCallLog) onCallLog('Missed Video Call');
      cleanup();
      onClose();
    };

    const onCallRejected = () => {
      if (!isIncoming && onCallLog) onCallLog('Missed Video Call');
      cleanup();
      onClose();
    };

    socket.on('call:answer',        onAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:end',           onCallEnd);
    socket.on('call:rejected',      onCallRejected);

    // Initiate only once, even if socket ref changes
    if (!isIncoming && !hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      initiateCall();
    }

    return () => {
      socket.off('call:answer',        onAnswer);
      socket.off('call:ice-candidate', onIceCandidate);
      socket.off('call:end',           onCallEnd);
      socket.off('call:rejected',      onCallRejected);
    };
  }, [socket]); // eslint-disable-line

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">

      {/* Remote Video — always in DOM, srcObject is managed by useEffect above */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ background: 'black' }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Local Video PiP */}
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
          {callState === 'incoming'   ? 'Incoming Call'
           : callState === 'ringing'  ? 'Calling...'
           : callState === 'connected' ? 'Connected' : ''}
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

      {/* Controls */}
      <div className="absolute bottom-10 z-10 flex items-center gap-6">
        {callState === 'incoming' ? (
          <>
            <button onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-xl transition-all">
              <PhoneOff size={28} />
            </button>
            <button onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl transition-all animate-pulse">
              <Phone size={28} />
            </button>
          </>
        ) : (
          <>
            <button onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isMuted ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'}`}>
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button onClick={endCall}
              className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-2xl transition-all">
              <PhoneOff size={30} />
            </button>
            <button onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isVideoOff ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'}`}>
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>
          </>
        )}
      </div>

      {/* Waiting animation (only while not yet connected) */}
      {(callState === 'calling' || callState === 'ringing') && (
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
