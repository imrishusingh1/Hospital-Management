import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, HeartPulse, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid or missing token');
      return;
    }
    
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-4 overflow-hidden font-sans">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/10 blur-3xl" />

      {/* Back to Login */}
      <Link to="/login" className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center transition-colors z-20">
        <ArrowLeft size={20} className="mr-2" /> Back to Login
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 shadow-lg border border-white/30">
              <HeartPulse size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Curalync</h2>
            <p className="text-white/70 mt-2 text-sm">
              Create a new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <input
                type="password"
                required
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <input
                type="password"
                required
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all text-sm"
              />
            </div>

            <button type="submit" className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-lg mt-4">
              Reset Password
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
