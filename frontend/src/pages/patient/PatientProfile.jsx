import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Heart, Shield, Edit3 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';

const PatientProfile = () => {
  const { user } = useContext(AuthContext);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        
        {/* Cover & Avatar Header */}
        <div className="h-48 bg-gradient-to-r from-[#073c52] to-[#1db1d7] relative">
          <div className="absolute -bottom-12 left-8 flex items-end space-x-6">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
              <img src="https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{user?.email?.split('@')[0] || 'John Doe'}</h2>
              <p className="text-[#107c9f] font-semibold">{user?.role || 'Patient'}</p>
            </div>
          </div>
          <button className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
            <Edit3 size={18} />
          </button>
        </div>

        {/* Profile Details */}
        <div className="pt-20 px-8 pb-8 grid md:grid-cols-2 gap-8">
          
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">Personal Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-medium text-slate-900">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm font-medium text-slate-900">January 15, 1990</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Address</p>
                  <p className="text-sm font-medium text-slate-900">123 Wellness Ave, San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Overview */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">Medical Overview</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Heart className="text-red-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Blood Group</p>
                  <p className="text-sm font-medium text-slate-900">O Positive (O+)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Shield className="text-green-500 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Insurance</p>
                  <p className="text-sm font-medium text-slate-900">Blue Cross Shield (Active)</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Known Allergies</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">Penicillin</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">Peanuts</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default PatientProfile;
