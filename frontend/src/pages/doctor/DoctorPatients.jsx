import React, { useState, useEffect, useContext } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Avatar from '../../components/ui/Avatar';
import PageHeader from '../../components/ui/PageHeader';
import AddRecordModal from '../../components/doctor/AddRecordModal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { FilePlus } from 'lucide-react';

const DoctorPatients = () => {
  const { profile } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recordModal, setRecordModal] = useState({ open: false, patientId: null, patientName: '' });

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
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn-ghost text-xs py-1.5 px-3"
          onClick={() =>
            setRecordModal({
              open: true,
              patientId: row._id,
              patientName: `${row.firstName} ${row.lastName}`,
            })
          }
        >
          <FilePlus size={14} /> Add record
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="My Patients" subtitle="Directory of patients you have consulted." />

      <div className="card space-y-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name..." />
        
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading patients...</div>
        ) : (
          <Table columns={columns} data={filteredPatients} keyField="_id" />
        )}
      </div>

      <AddRecordModal
        isOpen={recordModal.open}
        onClose={() => setRecordModal({ open: false, patientId: null, patientName: '' })}
        patientId={recordModal.patientId}
        patientName={recordModal.patientName}
      />
    </div>
  );
};

export default DoctorPatients;
