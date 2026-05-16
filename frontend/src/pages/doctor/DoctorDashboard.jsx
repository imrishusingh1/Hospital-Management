import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Activity } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { profile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?._id) return;
      try {
        const res = await api.get('/appointments', { params: { doctorId: profile._id } });
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

  const todayCount = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= start && d < end && a.status !== 'Cancelled';
    }).length;
  }, [appointments]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h2>
        <p className="text-slate-500 text-sm">Overview of your daily schedule and patients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-blue-100 text-blue-600 mr-4 relative z-10">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Today</p>
            <p className="text-3xl font-black text-slate-900">{loading ? '—' : todayCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600 mr-4 relative z-10">
            <Activity className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Upcoming</p>
            <p className="text-3xl font-black text-slate-900">{loading ? '—' : upcoming.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-purple-100 text-purple-600 mr-4 relative z-10">
            <Users className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Total Appointments</p>
            <p className="text-3xl font-black text-slate-900">{loading ? '—' : appointments.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
        {loading ? (
          <div className="text-slate-500 py-8 text-center">Loading appointments...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-slate-500 py-8 text-center">No upcoming appointments.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.slice(0, 8).map((a) => (
              <div key={a._id} className="flex items-center justify-between py-4 hover:bg-slate-50 transition-colors px-4 -mx-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center font-bold">
                    <span className="text-xs text-blue-400 leading-none">{new Date(a.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg leading-none mt-1">{new Date(a.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {a.patientId?.firstName ? `${a.patientId.firstName} ${a.patientId.lastName}` : 'Patient'}
                    </div>
                    <div className="text-sm text-slate-500">{a.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full">
                    {a.timeSlot}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;

