import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';

const DoctorProfile = () => {
  const { user, profile, hydrateMe } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    department: '',
    experienceYears: '',
    consultationFee: '',
    contactNumber: '',
    bio: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        specialization: profile.specialization || '',
        department: profile.department || '',
        experienceYears: profile.experienceYears || '',
        consultationFee: profile.consultationFee || '',
        contactNumber: profile.contactNumber || '',
        bio: profile.bio || '',
        avatar: profile.avatar || user?.avatar || ''
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/doctors/profile', {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
      });
      await hydrateMe();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        <p className="text-slate-500 text-sm">Update your public profile and details.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex items-center space-x-6 pb-8 border-b border-gray-100">
            <Avatar src={formData.avatar} name={`${formData.firstName} ${formData.lastName}`} size="xl" className="border-4 border-white shadow-lg" />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Avatar Image URL</label>
              <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://..." className="w-full sm:w-96 border border-gray-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
              <p className="text-xs text-slate-500 mt-2">Provide a valid image URL for your profile picture.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
              <input required type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
              <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Consultation Fee</label>
              <input required type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
              <input required type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / About Me</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none" placeholder="Write a short biography..." />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#1db1d7] hover:bg-[#1db1d7]/90 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
