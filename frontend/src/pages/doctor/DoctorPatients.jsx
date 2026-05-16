import React, { useState, useEffect, useContext } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Avatar from '../../components/ui/Avatar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const DoctorPatients = () => {
  const { profile } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      if (!profile?._id) return;
      try {
        // Find all unique patients from this doctor's appointments
        const res = await api.get('/appointments', { params: { doctorId: profile._id } });
        
        // Extract unique patients
        const patientMap = new Map();
        res.data.data.forEach(app => {
          if (app.patientId && !patientMap.has(app.patientId._id)) {
            patientMap.set(app.patientId._id, app.patientId);
          }
        });
        
        setPatients(Array.from(patientMap.values()));
      } catch (e) {
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [profile?._id]);

  const filteredPatients = patients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const columns = [
    {
      header: 'Patient Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar src={row.avatar} name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div className="font-semibold text-slate-800">{row.firstName} {row.lastName}</div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'contactNumber',
      render: (row) => <span className="text-slate-600">{row.contactNumber || 'N/A'}</span>
    },
    {
      header: 'Blood Group',
      accessor: 'bloodGroup',
      render: (row) => <span className="text-slate-600 font-medium">{row.bloodGroup || '—'}</span>
    },
    {
      header: 'Age/DOB',
      accessor: 'dob',
      render: (row) => {
        if (!row.dob) return '—';
        const age = new Date().getFullYear() - new Date(row.dob).getFullYear();
        return <span className="text-slate-600">{age} yrs</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Patients</h2>
        <p className="text-slate-500 text-sm">Directory of patients you have consulted.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name..." />
        
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading patients...</div>
        ) : (
          <Table columns={columns} data={filteredPatients} keyField="_id" />
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
