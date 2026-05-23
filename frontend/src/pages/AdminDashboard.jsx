import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Activity, Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data.data);
        const appRes = await api.get('/approvals/pending');
        setApprovals(appRes.data.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/approvals/${id}/approve`);
      if (res.data.success) {
        setApprovals(approvals.filter(a => a._id !== id));
        // Refresh analytics if a doctor was approved
        const analyticsRes = await api.get('/analytics');
        setData(analyticsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to approve", error);
      alert(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await api.post(`/approvals/${id}/reject`);
      if (res.data.success) {
        setApprovals(approvals.filter(a => a._id !== id));
      }
    } catch (error) {
      console.error("Failed to reject", error);
      alert(error.response?.data?.message || 'Rejection failed');
    }
  };

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

      {/* Pending Approvals Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Pending Registrations</h3>
        {approvals.length === 0 ? (
          <p className="text-slate-500 text-sm">No pending approvals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-slate-500">
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Document</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.role === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-900">{item.payload?.email}</td>
                    <td className="py-4 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      {item.role === 'Doctor' && item.payload?.profileData?.verificationDocument ? (
                        <a href={item.payload.profileData.verificationDocument} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 text-sm font-medium underline">
                          View PDF
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button onClick={() => handleApprove(item._id)} className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-semibold transition-colors">
                        Approve
                      </button>
                      <button onClick={() => handleReject(item._id)} className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
