import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Eye, Download } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';

const PatientPrescriptions = () => {
  const { profile } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState({ isOpen: false, prescription: null, doctor: null, date: null });

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!profile?._id) return;
      setLoading(true);
      try {
        const res = await api.get('/appointments', { params: { patientId: profile._id } });
        // Only keep completed appointments that might have prescriptions
        const completed = res.data.data.filter(a => a.status === 'Completed').sort((a,b) => new Date(b.date) - new Date(a.date));
        setAppointments(completed);
      } catch (e) {
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [profile?._id]);

  const viewPrescription = async (appointment) => {
    try {
      const res = await api.get(`/appointments/${appointment._id}/prescription`);
      if (res.data.data) {
        setViewPrescriptionModal({ isOpen: true, prescription: res.data.data, doctor: appointment.doctorId, date: appointment.date });
      } else {
        toast.error('No prescription found for this appointment');
      }
    } catch (e) {
      toast.error('Failed to fetch prescription');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Prescriptions</h2>
        <p className="text-slate-500 text-sm">Access your medical prescriptions from past appointments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading prescriptions...</div>
        ) : appointments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">No prescriptions found.</div>
        ) : (
          appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1db1d7] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dr. {a.doctorId?.lastName}</h4>
                    <p className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Completed</span>
              </div>
              <p className="text-sm text-slate-600 mb-6 line-clamp-2">{a.reason}</p>
              
              <button 
                onClick={() => viewPrescription(a)}
                className="w-full py-2.5 bg-slate-50 hover:bg-[#1db1d7]/10 text-[#1db1d7] rounded-xl text-sm font-bold transition-colors flex items-center justify-center"
              >
                <Eye size={16} className="mr-2" /> View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* View Prescription Modal */}
      <Modal isOpen={viewPrescriptionModal.isOpen} onClose={() => setViewPrescriptionModal({ isOpen: false, prescription: null, doctor: null, date: null })} title="Prescription Details" maxWidth="max-w-2xl">
        {viewPrescriptionModal.prescription && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <div className="flex items-center space-x-4">
                <Avatar src={viewPrescriptionModal.doctor?.avatar} name={`Dr. ${viewPrescriptionModal.doctor?.lastName}`} size="lg" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Dr. {viewPrescriptionModal.doctor?.firstName} {viewPrescriptionModal.doctor?.lastName}</h3>
                  <p className="text-sm text-slate-500">{viewPrescriptionModal.doctor?.specialization}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Date</p>
                <p className="text-sm text-slate-500">{new Date(viewPrescriptionModal.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center"><FileText size={18} className="mr-2 text-[#1db1d7]" /> Medications</h4>
              <div className="space-y-3">
                {viewPrescriptionModal.prescription.medications.map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{m.name}</div>
                      <div className="text-sm font-medium text-[#1db1d7]">{m.dosage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 inline-block mb-1">{m.frequency}</div>
                      <div className="text-xs text-slate-500">for {m.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {viewPrescriptionModal.prescription.instructions && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Additional Instructions</h4>
                <div className="p-5 bg-amber-50 text-amber-900 rounded-xl text-sm border border-amber-100 whitespace-pre-wrap leading-relaxed">
                  {viewPrescriptionModal.prescription.instructions}
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
               <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
                 <Download size={16} className="mr-2" /> Download PDF
               </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientPrescriptions;
