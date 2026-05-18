import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

// ICE servers with both STUN and free TURN (OpenRelay) for production NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

const VideoCallModal = ({ socket, currentUser, targetUser, isIncoming, incomingOffer, onClose, onCallLog }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const streamPromiseRef = useRef(null);
  // Queue for ICE candidates that arrive before remoteDescription is set
  const iceCandidateQueue = useRef([]);
  const remoteDescSet = useRef(false);

  const [callState, setCallState] = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    if (callState === 'connected') setHasConnected(true);
  }, [callState]);

  const targetUserId = targetUser?.userId?.toString() || targetUser?.id?.toString();

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    iceCandidateQueue.current = [];
    remoteDescSet.current = false;
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

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
      console.error('getUserMedia error:', err);
      return null;
    } finally {
      streamPromiseRef.current = null;
    }
  };

  // Helper: safely set remote description and flush queued ICE candidates
  const setRemoteDescriptionAndFlush = async (pc, sdp) => {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    remoteDescSet.current = true;
    // Flush any ICE candidates that arrived before remote description
    for (const candidate of iceCandidateQueue.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add queued ICE candidate:', e);
      }
    }
    iceCandidateQueue.current = [];
  };

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    remoteDescSet.current = false;
    iceCandidateQueue.current = [];

    // Add all local tracks to the connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Send ICE candidates to the other peer
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('call:ice-candidate', { targetUserId, candidate: e.candidate });
      }
    };

    // Log ICE connection state changes for debugging
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallState('connected');
      }
      if (pc.iceConnectionState === 'failed') {
        console.error('[WebRTC] ICE failed — trying ICE restart');
        pc.restartIce();
      }
    };

    // When remote stream arrives, attach it to the remote video element
    pc.ontrack = (e) => {
      console.log('[WebRTC] Remote track received:', e.streams);
      if (remoteVideoRef.current && e.streams && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    return pc;
  };

  // Caller initiates the call
  const initiateCall = async () => {
    const stream = await startLocalStream();
    if (!stream) return;
    const pc = createPeerConnection(stream);
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    socket.emit('call:offer', { targetUserId, offer });
    setCallState('ringing');
  };

  // Callee accepts the call
  const acceptCall = async () => {
    setCallState('connected');
    const stream = await startLocalStream();
    if (!stream) return;
    const pc = createPeerConnection(stream);
    if (incomingOffer) {
      await setRemoteDescriptionAndFlush(pc, incomingOffer);
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
    if (!hasConnected && !isIncoming && onCallLog) onCallLog('Missed Video Call');
    if (hasConnected && onCallLog) onCallLog('Video Call Ended');
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

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Caller receives answer from callee
    const onAnswer = async ({ answer }) => {
      console.log('[WebRTC] Received answer');
      if (pcRef.current) {
        await setRemoteDescriptionAndFlush(pcRef.current, answer);
        setCallState('connected');
      }
    };

    // Both sides receive ICE candidates
    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current && remoteDescSet.current) {
        // Remote description is already set — add candidate immediately
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn('[WebRTC] Error adding ICE candidate:', e);
        }
      } else {
        // Remote description not yet set — queue the candidate
        console.log('[WebRTC] Queuing ICE candidate (remote desc not set yet)');
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

    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
    socket.on('call:end', onCallEnd);
    socket.on('call:rejected', onCallRejected);

    // Auto-initiate if this user is the caller
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
      {/* Remote Video (full screen background) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Local Video (Picture-in-Picture) */}
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
          {callState === 'incoming' ? 'Incoming Call'
            : callState === 'ringing' ? 'Calling...'
            : callState === 'connected' ? 'Connected' : ''}
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
              className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-2xl transition-all"
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

      {/* Waiting animation */}
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
