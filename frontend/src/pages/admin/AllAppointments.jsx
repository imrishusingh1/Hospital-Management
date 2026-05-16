import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data);
    } catch (e) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(a => {
    const pName = `${a.patientId?.firstName} ${a.patientId?.lastName}`.toLowerCase();
    const dName = `${a.doctorId?.firstName} ${a.doctorId?.lastName}`.toLowerCase();
    const matchesSearch = pName.includes(search.toLowerCase()) || dName.includes(search.toLowerCase());
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar name={`${row.patientId?.firstName} ${row.patientId?.lastName}`} size="sm" />
          <div className="font-semibold text-slate-800">{row.patientId?.firstName} {row.patientId?.lastName}</div>
        </div>
      )
    },
    {
      header: 'Doctor',
      accessor: 'doctor',
      render: (row) => (
        <div className="text-slate-600">Dr. {row.doctorId?.firstName} {row.doctorId?.lastName}</div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800">{new Date(row.date).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">{row.timeSlot}</div>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => <div className="max-w-[150px] truncate" title={row.reason}>{row.reason}</div>
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => <span className="text-xs font-semibold text-slate-500">{row.type || 'In-Person'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">All Appointments</h2>
        <p className="text-slate-500 text-sm">View and track all hospital appointments.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by patient or doctor name..." />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none bg-white text-sm font-semibold text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading appointments...</div>
        ) : (
          <Table columns={columns} data={filteredAppointments} keyField="_id" />
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
