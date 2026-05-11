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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <p className="text-2xl font-bold text-gray-800">{data.totalPatients}</p>
          </div>
        </div>
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
            <p className="text-2xl font-bold text-gray-800">{data.totalDoctors}</p>
          </div>
        </div>
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Appointments</p>
            <p className="text-2xl font-bold text-gray-800">{data.totalAppointments}</p>
          </div>
        </div>
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Users</p>
            <p className="text-2xl font-bold text-gray-800">{data.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments Trend (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
