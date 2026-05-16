import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddDoctorModal = ({ isOpen, onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    specialization: '',
    department: '',
    experienceYears: '',
    contactNumber: '',
    consultationFee: '',
    qualifications: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        department: formData.department,
        experienceYears: Number(formData.experienceYears),
        contactNumber: formData.contactNumber,
        consultationFee: Number(formData.consultationFee),
        qualifications: formData.qualifications.split(',').map(q => q.trim())
      };
      
      const res = await api.post('/approvals/doctor', payload);
      toast.success(res.data.message || 'Doctor addition requested');
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Doctor" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Specialization</label>
            <input required type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
            <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Experience (Years)</label>
            <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Consultation Fee</label>
            <input required type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number</label>
            <input required type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Qualifications (comma separated)</label>
            <input required type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="e.g. MBBS, MD" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-50 font-bold rounded-xl border border-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[#1db1d7] hover:bg-[#1db1d7]/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDoctorModal;
