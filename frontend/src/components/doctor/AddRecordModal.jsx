import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddRecordModal = ({ isOpen, onClose, patientId, patientName, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    recordType: 'Lab Result',
    title: '',
    description: '',
    fileUrl: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true);
    try {
      await api.post('/records', { patientId, ...form });
      toast.success('Medical record added');
      setForm({ recordType: 'Lab Result', title: '', description: '', fileUrl: '' });
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add record — ${patientName || 'Patient'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Type</label>
          <select
            className="input-field"
            value={form.recordType}
            onChange={(e) => setForm({ ...form, recordType: e.target.value })}
          >
            <option>Lab Result</option>
            <option>Scan</option>
            <option>Diagnosis</option>
            <option>Prescription</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="label-field">Title</label>
          <input
            className="input-field"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Blood test — March 2026"
          />
        </div>
        <div>
          <label className="label-field">Description</label>
          <textarea
            className="input-field min-h-[80px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Notes for the patient…"
          />
        </div>
        <div>
          <label className="label-field">File URL (optional)</label>
          <input
            className="input-field"
            value={form.fileUrl}
            onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Saving…' : 'Save record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRecordModal;
