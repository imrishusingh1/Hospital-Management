import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Stethoscope, Shield, HeartPulse, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('Patient'); // Patient, Doctor, Admin
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login Flow
        const data = await login(email, password);
        toast.success(`Welcome back, ${data.user.role}!`);
        if (data.user.role === 'Admin') navigate('/admin');
        else if (data.user.role === 'Doctor') navigate('/doctor');
        else navigate('/patient');
      } else {
        // Register Flow
        // Mocking required fields to satisfy backend schema for quick registration
        const userData = {
          email,
          password,
          role,
          firstName,
          lastName,
          dob: '1990-01-01',
          gender: 'Other',
          contactNumber: '0000000000',
          ...(role === 'Doctor' && {
            specialization: 'General Practitioner',
            qualifications: ['MBBS'],
            experienceYears: 5,
            consultationFee: 150
          })
        };
        const data = await register(userData);
        toast.success('Account created successfully!');
        if (data.user.role === 'Admin') navigate('/admin');
        else if (data.user.role === 'Doctor') navigate('/doctor');
        else navigate('/patient');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#1db1d7] via-[#107c9f] to-[#073c52] p-4 overflow-hidden font-sans">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/10 blur-3xl" />

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Home
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
            <h2 className="text-3xl font-bold text-white tracking-tight">MediCareX</h2>
            <p className="text-white/70 mt-2 text-sm">
              {isLogin ? 'Welcome back to your healthcare portal' : 'Create your account to get started'}
            </p>
          </div>

          {/* Role Selector (Segmented Control) */}
          <div className="flex bg-black/20 p-1 rounded-full mb-8 relative">
            <button
              type="button"
              onClick={() => setRole('Patient')}
              className={`flex-1 py-2 text-sm font-semibold rounded-full flex items-center justify-center transition-all duration-300 ${role === 'Patient' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              <User size={16} className="mr-2" /> Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('Doctor')}
              className={`flex-1 py-2 text-sm font-semibold rounded-full flex items-center justify-center transition-all duration-300 ${role === 'Doctor' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              <Stethoscope size={16} className="mr-2" /> Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole('Admin')}
              className={`flex-1 py-2 text-sm font-semibold rounded-full flex items-center justify-center transition-all duration-300 ${role === 'Admin' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              <Shield size={16} className="mr-2" /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex space-x-4 overflow-hidden"
                >
                  <div className="flex-1 pb-1">
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all text-sm"
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all text-sm"
              />
            </div>

            <button type="submit" className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-lg mt-2">
              {isLogin ? `Sign In as ${role}` : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-white/70 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-white font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
