import React, { useState, useEffect, useContext } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PrescriptionModal from './PrescriptionModal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, XCircle, FilePlus, Eye } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';

const DoctorAppointments = () => {
  const { profile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [prescriptionModal, setPrescriptionModal] = useState({ isOpen: false, appointmentId: null, patientName: '' });
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, appointmentId: null });
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState({ isOpen: false, prescription: null });

  const fetchAppointments = async () => {
    if (!profile?._id) return;
    setLoading(true);
    try {
      const res = await api.get('/appointments', { params: { doctorId: profile._id } });
      setAppointments(res.data.data);
    } catch (e) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [profile?._id]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/appointments/${cancelDialog.appointmentId}`, { data: { cancelReason: 'Cancelled by Doctor' } });
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) {
      toast.error('Failed to cancel appointment');
    }
  };

  const viewPrescription = async (appointmentId) => {
    try {
      const res = await api.get(`/appointments/${appointmentId}/prescription`);
      if (res.data.data) {
        setViewPrescriptionModal({ isOpen: true, prescription: res.data.data });
      } else {
        toast.error('Prescription not found');
      }
    } catch (e) {
      toast.error('Failed to fetch prescription');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const pName = `${a.patientId?.firstName} ${a.patientId?.lastName}`.toLowerCase();
    return pName.includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar src={row.patientId?.avatar} name={`${row.patientId?.firstName} ${row.patientId?.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-slate-800">{row.patientId?.firstName} {row.patientId?.lastName}</div>
            <div className="text-xs text-slate-500">{row.patientId?.userId?.email}</div>
          </div>
        </div>
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
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'Pending' && (
            <>
              <button onClick={() => updateStatus(row._id, 'Confirmed')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirm">
                <CheckCircle size={18} />
              </button>
              <button onClick={() => setCancelDialog({ isOpen: true, appointmentId: row._id })} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Cancel">
                <XCircle size={18} />
              </button>
            </>
          )}
          {row.status === 'Confirmed' && (
            <>
              <button 
                onClick={() => setPrescriptionModal({ isOpen: true, appointmentId: row._id, patientName: `${row.patientId?.firstName} ${row.patientId?.lastName}` })}
                className="px-3 py-1.5 text-xs font-bold text-[#1db1d7] bg-[#1db1d7]/10 hover:bg-[#1db1d7]/20 rounded-lg transition-colors flex items-center"
              >
                <FilePlus size={14} className="mr-1" /> Write Prescription
              </button>
              <button 
                onClick={() => updateStatus(row._id, 'Completed')}
                className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center"
              >
                <CheckCircle size={14} className="mr-1" /> Mark Completed
              </button>
            </>
          )}
          {row.status === 'Completed' && (
            <button 
              onClick={() => viewPrescription(row._id)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center"
            >
              <Eye size={14} className="mr-1" /> View Prescription
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
        <p className="text-slate-500 text-sm">Manage your patient appointments and write prescriptions.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name..." />
        
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading appointments...</div>
        ) : (
          <Table columns={columns} data={filteredAppointments} keyField="_id" />
        )}
      </div>

      <PrescriptionModal 
        isOpen={prescriptionModal.isOpen} 
        onClose={(success) => {
          setPrescriptionModal({ isOpen: false, appointmentId: null, patientName: '' });
          if(success) fetchAppointments();
        }}
        appointmentId={prescriptionModal.appointmentId}
        patientName={prescriptionModal.patientName}
      />

      <ConfirmDialog 
        isOpen={cancelDialog.isOpen} 
        onClose={() => setCancelDialog({ isOpen: false, appointmentId: null })}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        isDestructive={true}
        confirmText="Cancel Appointment"
      />

      {/* View Prescription Modal */}
      <Modal isOpen={viewPrescriptionModal.isOpen} onClose={() => setViewPrescriptionModal({ isOpen: false, prescription: null })} title="Prescription Details">
        {viewPrescriptionModal.prescription && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Medications</h4>
              <div className="space-y-3">
                {viewPrescriptionModal.prescription.medications.map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-sm text-slate-500">{m.dosage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-700">{m.frequency}</div>
                      <div className="text-xs text-slate-500">for {m.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {viewPrescriptionModal.prescription.instructions && (
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Instructions</h4>
                <div className="p-4 bg-amber-50 text-amber-900 rounded-xl text-sm border border-amber-100 whitespace-pre-wrap">
                  {viewPrescriptionModal.prescription.instructions}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
