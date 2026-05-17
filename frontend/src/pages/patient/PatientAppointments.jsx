import React, { useState, useEffect, useContext } from 'react';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { XCircle, Calendar, Clock, RefreshCw } from 'lucide-react';
import RescheduleModal from '../../components/RescheduleModal';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import ReviewModal from '../../components/ReviewModal';
import { Star } from 'lucide-react';

const PatientAppointments = () => {
  const { profile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, appointmentId: null });
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reviewDialog, setReviewDialog] = useState({ isOpen: false, appointment: null });

  const fetchAppointments = async () => {
    if (!profile?._id) return;
    setLoading(true);
    try {
      const res = await api.get('/appointments', { params: { patientId: profile._id } });
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

  const handleCancel = async () => {
    try {
      await api.delete(`/appointments/${cancelDialog.appointmentId}`, { data: { cancelReason: 'Cancelled by Patient' } });
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) {
      toast.error('Failed to cancel appointment');
    }
  };

  const columns = [
    {
      header: 'Doctor',
      accessor: 'doctor',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar src={row.doctorId?.avatar} name={`${row.doctorId?.firstName} ${row.doctorId?.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-slate-800">Dr. {row.doctorId?.firstName} {row.doctorId?.lastName}</div>
            <div className="text-xs text-slate-500">{row.doctorId?.specialization || 'General'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800 flex items-center"><Calendar size={14} className="mr-1 text-slate-400" /> {new Date(row.date).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500 flex items-center mt-1"><Clock size={14} className="mr-1 text-slate-400" /> {row.timeSlot}</div>
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
          {(row.status === 'Pending' || row.status === 'Confirmed') && (
            <>
              <button
                type="button"
                onClick={() => setRescheduleAppt(row)}
                className="px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center"
              >
                <RefreshCw size={14} className="mr-1" /> Reschedule
              </button>
              <button 
                type="button"
                onClick={() => setCancelDialog({ isOpen: true, appointmentId: row._id })} 
                className="px-3 py-1.5 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center"
              >
                <XCircle size={14} className="mr-1" /> Cancel
              </button>
            </>
          )}
          {row.status === 'Completed' && (
             <button
               type="button"
               onClick={() => setReviewDialog({ isOpen: true, appointment: row })}
               className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center"
             >
               <Star size={14} className="mr-1 fill-amber-600" /> Review
             </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Appointments</h2>
        <p className="text-slate-500 text-sm">View and manage your upcoming and past appointments.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading appointments...</div>
        ) : (
          <Table columns={columns} data={appointments.sort((a,b) => new Date(b.date) - new Date(a.date))} keyField="_id" />
        )}
      </div>

      <ConfirmDialog 
        isOpen={cancelDialog.isOpen} 
        onClose={() => setCancelDialog({ isOpen: false, appointmentId: null })}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        isDestructive={true}
        confirmText="Cancel Appointment"
      />

      <RescheduleModal
        isOpen={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        appointment={rescheduleAppt}
        onSuccess={fetchAppointments}
      />

      <ReviewModal
        isOpen={reviewDialog.isOpen}
        onClose={() => setReviewDialog({ isOpen: false, appointment: null })}
        appointment={reviewDialog.appointment}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default PatientAppointments;
