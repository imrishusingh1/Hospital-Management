import React, { useRef, useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileUp } from 'lucide-react';

const AddRecordModal = ({ isOpen, onClose, patientId, patientName, onSuccess }) => {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [form, setForm] = useState({
    recordType: 'Lab Result',
    title: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('recordType', form.recordType);
      formData.append('title', form.title);
      formData.append('description', form.description || '');
      if (pdfFile) formData.append('file', pdfFile);

      await api.post('/records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Medical record added');
      setForm({ recordType: 'Lab Result', title: '', description: '' });
      setPdfFile(null);
      if (fileRef.current) fileRef.current.value = '';
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
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
          <label className="label-field">Test report PDF (optional)</label>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-xl py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FileUp size={18} />
            {pdfFile ? pdfFile.name : 'Choose PDF file'}
          </button>
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
