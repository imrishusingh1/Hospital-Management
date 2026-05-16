import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, ChevronRight, Activity, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

const PatientDashboard = () => {
  const { user, profile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter((a) => new Date(a.date) >= now && a.status !== 'Cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments]);

  const nextAppointment = upcoming[0] || null;
  const completed = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-container">
      <PageHeader
        title={`Hello, ${profile?.firstName || 'there'}`}
        subtitle="Your health overview and upcoming care."
        action={
          <Link to="/patient/book" className="btn-primary">
            <Plus size={18} /> Book appointment
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-icon bg-brand-500/10 text-brand-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Upcoming visits</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : upcoming.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-brand-800/10 text-brand-800">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Completed visits</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : completed}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-100 text-emerald-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Account status</p>
            <p className="text-2xl font-bold text-slate-900">Active</p>
          </div>
        </div>
      </div>

      <motion.div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Next appointment</h3>
          {loading ? (
            <LoadingSpinner />
          ) : !nextAppointment ? (
            <div className="card text-center py-12">
              <p className="text-slate-600 mb-4">No upcoming appointments.</p>
              <Link to="/patient/book" className="btn-primary inline-flex">
                Book now
              </Link>
            </div>
          ) : (
            <div className="card-hero">
              <motion.div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold">
                    Dr. {nextAppointment.doctorId?.firstName} {nextAppointment.doctorId?.lastName}
                  </h4>
                  <p className="text-white/70">{nextAppointment.doctorId?.specialization}</p>
                </div>
                <Badge variant={nextAppointment.status === 'Confirmed' ? 'success' : 'warning'}>
                  {nextAppointment.status}
                </Badge>
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-3">
                  <Calendar className="text-brand-300" size={20} />
                  <div>
                    <p className="text-xs text-white/60">Date</p>
                    <p className="font-semibold text-sm">{new Date(nextAppointment.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="text-brand-300" size={20} />
                  <div>
                    <p className="text-xs text-white/60">Time</p>
                    <p className="font-semibold text-sm">{nextAppointment.timeSlot}</p>
                  </div>
                </div>
              </div>
              <Link
                to="/patient/appointments"
                className="relative z-10 mt-6 inline-flex items-center text-sm font-bold text-white hover:underline"
              >
                View all appointments <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Quick links</h3>
          <div className="card space-y-2 p-4">
            {[
              { to: '/patient/prescriptions', label: 'My prescriptions', icon: FileText },
              { to: '/patient/records', label: 'Medical records', icon: FileText },
              { to: '/patient/profile', label: 'Edit profile', icon: Activity },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <item.icon size={18} className="text-brand-600" />
                  {item.label}
                </span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-brand-600" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboard;
