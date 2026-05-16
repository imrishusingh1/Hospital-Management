import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import api from '../services/api';
import toast from 'react-hot-toast';

const RescheduleModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !appointment) return;
    setDate('');
    setTimeSlot('');
    setSlots([]);
  }, [isOpen, appointment]);

  useEffect(() => {
    const load = async () => {
      if (!appointment?.doctorId?._id && !appointment?.doctorId) return;
      const doctorId = appointment.doctorId._id || appointment.doctorId;
      if (!date) return;
      try {
        const res = await api.get('/appointments/slots', { params: { doctorId, date } });
        setSlots(res.data.data || []);
      } catch {
        setSlots([]);
      }
    };
    load();
  }, [date, appointment]);

  const submit = async (e) => {
    e.preventDefault();
    if (!date || !timeSlot) {
      toast.error('Select date and time');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/appointments/${appointment._id}/reschedule`, { date, timeSlot });
      toast.success('Appointment rescheduled');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule appointment">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label-field">New date</label>
          <input
            type="date"
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-field">Time slot</label>
          <select className="input-field" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required>
            <option value="">Select slot</option>
            {slots.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleModal;
