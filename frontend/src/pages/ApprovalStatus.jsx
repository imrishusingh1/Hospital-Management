import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const ApprovalStatus = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const approveStarted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing approval token.');
      return;
    }
    if (approveStarted.current) return;
    approveStarted.current = true;

    const run = async () => {
      try {
        const res = await api.get(`/approvals/approve/${token}`, {
          responseType: 'text',
          transformResponse: [(d) => d],
        });
        setStatus('success');
        setMessage(typeof res.data === 'string' ? res.data : 'Request approved successfully.');
      } catch (e) {
        const msg =
          e.response?.data?.message ||
          (typeof e.response?.data === 'string' ? e.response.data : null) ||
          'Approval failed or link expired.';
        if (typeof msg === 'string' && /already approved/i.test(msg)) {
          setStatus('success');
          setMessage(msg);
          return;
        }
        setStatus('error');
        setMessage(msg);
      }
    };
    run();
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6"
    >
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-brand-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Processing approval…</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Approved</h1>
            <p className="text-slate-600 text-sm mb-6">{message}</p>
            <Link to="/login" className="btn-primary w-full">
              Go to login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Could not approve</h1>
            <p className="text-slate-600 text-sm mb-6">{message}</p>
            <Link to="/" className="btn-secondary w-full">
              Back to home
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ApprovalStatus;
