import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const PrescriptionModal = ({ isOpen, onClose, appointmentId, patientName }) => {
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medications.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      toast.error('Please fill all medication fields');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/appointments/${appointmentId}/prescription`, {
        medications,
        instructions
      });
      // Also update appointment status to Completed automatically
      await api.put(`/appointments/${appointmentId}/status`, { status: 'Completed' });
      
      toast.success('Prescription saved and appointment completed');
      onClose(true); // pass true to indicate success and trigger reload
    } catch (error) {
      toast.error('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title={`Prescription for ${patientName}`} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Medications</h4>
            <button type="button" onClick={handleAddMedication} className="text-sm font-bold text-[#1db1d7] hover:underline flex items-center">
              <Plus size={16} className="mr-1" /> Add Medication
            </button>
          </div>
          
          {medications.map((med, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-gray-100">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input required placeholder="Medicine Name (e.g., Paracetamol)" value={med.name} onChange={(e) => handleMedChange(i, 'name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
                <input required placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={(e) => handleMedChange(i, 'dosage', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
                <input required placeholder="Frequency (e.g., Twice a day)" value={med.frequency} onChange={(e) => handleMedChange(i, 'frequency', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
                <input required placeholder="Duration (e.g., 5 days)" value={med.duration} onChange={(e) => handleMedChange(i, 'duration', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
              </div>
              {medications.length > 1 && (
                <button type="button" onClick={() => handleRemoveMedication(i)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors mt-1">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="Take after meals, avoid cold water, etc."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => onClose(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-50 font-bold rounded-xl border border-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[#1db1d7] hover:bg-[#1db1d7]/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save & Complete'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PrescriptionModal;
