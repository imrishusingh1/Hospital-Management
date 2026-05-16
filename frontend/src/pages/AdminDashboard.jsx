import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Activity, Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>;

  const statusData = data.appointmentsByStatus.map(item => ({
    name: item._id,
    value: item.count
  }));

  const trendData = data.appointmentsTrend.map(item => ({
    name: item._id,
    Appointments: item.count
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm">System overview and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-blue-100 text-blue-600 mr-4 relative z-10">
            <Users className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Total Patients</p>
            <p className="text-3xl font-black text-slate-900">{data.totalPatients}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600 mr-4 relative z-10">
            <UserPlus className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Total Doctors</p>
            <p className="text-3xl font-black text-slate-900">{data.totalDoctors}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-purple-100 text-purple-600 mr-4 relative z-10">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Appointments</p>
            <p className="text-3xl font-black text-slate-900">{data.totalAppointments}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="p-4 rounded-2xl bg-orange-100 text-orange-600 mr-4 relative z-10">
            <Activity className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-bold mb-1">Active Users</p>
            <p className="text-3xl font-black text-slate-900">{data.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Appointments Trend (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="Appointments" fill="#1db1d7" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Appointments by Status</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
