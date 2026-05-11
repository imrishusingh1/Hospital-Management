import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, FileText, ChevronRight, Activity, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { profile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?._id) return;
      try {
        const res = await api.get('/appointments', { params: { patientId: profile._id } });
        setAppointments(res.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [profile?._id]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter((a) => new Date(a.date) >= now && a.status !== 'Cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments]);

  const nextAppointment = upcoming[0] || null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#1db1d7]/10 flex items-center justify-center text-[#1db1d7]">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Upcoming Visits</p>
            <p className="text-2xl font-bold text-slate-900">{upcoming.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#0a3d52]/10 flex items-center justify-center text-[#0a3d52]">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Lab Reports</p>
            <p className="text-2xl font-bold text-slate-900">—</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Health Status</p>
            <p className="text-2xl font-bold text-slate-900">—</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upcoming Appointment */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Next Appointment</h3>
          <div className="bg-gradient-to-br from-[#073c52] to-[#107c9f] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            
            {loading ? (
              <div className="relative z-10 text-white/80">Loading appointments...</div>
            ) : !nextAppointment ? (
              <div className="relative z-10">
                <p className="text-xl font-bold">No upcoming appointments</p>
                <p className="text-white/70 mt-2">Book an appointment to see it here.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center">
                      <Heart size={24} className="text-white/80" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">
                        {nextAppointment.doctorId?.firstName ? `Dr. ${nextAppointment.doctorId.firstName} ${nextAppointment.doctorId.lastName}` : 'Doctor'}
                      </h4>
                      <p className="text-white/70">{nextAppointment.doctorId?.specialization || '—'}</p>
                    </div>
                  </div>
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold">
                    {nextAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-black/20 rounded-2xl p-4 flex items-center space-x-3">
                    <Calendar className="text-[#1db1d7]" size={20} />
                    <div>
                      <p className="text-xs text-white/60">Date</p>
                      <p className="font-semibold text-sm">{new Date(nextAppointment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 flex items-center space-x-3">
                    <Clock className="text-[#1db1d7]" size={20} />
                    <div>
                      <p className="text-xs text-white/60">Time</p>
                      <p className="font-semibold text-sm">{nextAppointment.timeSlot}</p>
                    </div>
                  </div>
                </div>
            
                <div className="mt-8 flex space-x-4 relative z-10">
                  <button
                    className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl opacity-60 cursor-not-allowed"
                    disabled
                  >
                    Reschedule
                  </button>
                  <button
                    className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl opacity-60 cursor-not-allowed"
                    disabled
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity / Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Recent Reports</h3>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              {[
                { name: 'Blood Test Results', date: 'Oct 15, 2026', type: 'PDF' },
                { name: 'ECG Scan', date: 'Oct 10, 2026', type: 'Image' },
                { name: 'General Checkup Notes', date: 'Sep 28, 2026', type: 'Doc' }
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#107c9f]">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{report.name}</p>
                      <p className="text-xs text-slate-500">{report.date}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-sm font-bold text-[#107c9f] hover:bg-slate-50 rounded-xl transition-colors">
              View All Reports
            </button>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};

export default PatientDashboard;
