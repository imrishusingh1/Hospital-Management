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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '—' : todayCount}</p>
          </div>
        </div>
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Upcoming</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '—' : upcoming.length}</p>
          </div>
        </div>
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '—' : appointments.length}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-gray-500">No upcoming appointments.</div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 8).map((a) => (
              <div key={a._id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <div className="font-semibold text-gray-800">
                    {a.patientId?.firstName ? `${a.patientId.firstName} ${a.patientId.lastName}` : 'Patient'}
                  </div>
                  <div className="text-sm text-gray-500">{a.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">{new Date(a.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{a.timeSlot}</div>
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

