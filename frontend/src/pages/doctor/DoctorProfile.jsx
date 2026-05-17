import React, { useState, useContext, useEffect } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ui/ImageUpload';
import { WEEKDAYS } from '../../constants/weekdays';

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
    avatar: '',
    isAvailable: true,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
  });
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        specialization: profile.specialization || '',
        department: profile.department || '',
        experienceYears: profile.experienceYears ?? '',
        consultationFee: profile.consultationFee ?? '',
        contactNumber: profile.contactNumber || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        isAvailable: profile.isAvailable !== false,
        availableDays: profile.availableDays?.length
          ? [...profile.availableDays]
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: profile.availableTimeSlots?.length
          ? [...profile.availableTimeSlots]
          : ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const has = prev.availableDays.includes(day);
      const availableDays = has
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays };
    });
  };

  const handleAvatarUploaded = async (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    setSavingPhoto(true);
    try {
      await api.put('/users/doctors/profile', { avatar: url });
      await hydrateMe();
      toast.success('Profile photo saved');
    } catch {
      toast.error('Photo uploaded — click Save Profile to keep it');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleAddTimeSlot = () => {
    if (!newTime) return;
    // convert "14:30" to "02:30 PM"
    let [hours, minutes] = newTime.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const formatted = `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    if (!formData.availableTimeSlots.includes(formatted)) {
      setFormData(prev => ({
        ...prev,
        availableTimeSlots: [...prev.availableTimeSlots, formatted].sort((a,b) => {
           const timeA = new Date('1970/01/01 ' + a);
           const timeB = new Date('1970/01/01 ' + b);
           return timeA - timeB;
        })
      }));
    }
    setNewTime('');
  };

  const handleRemoveTimeSlot = (slot) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter(s => s !== slot)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.availableDays.length === 0) {
      toast.error('Select at least one available day');
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/doctors/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        department: formData.department,
        bio: formData.bio,
        avatar: formData.avatar,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
        contactNumber: formData.contactNumber,
        isAvailable: formData.isAvailable,
        availableDays: formData.availableDays,
        availableTimeSlots: formData.availableTimeSlots,
      });
      await hydrateMe();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        <p className="text-slate-500 text-sm">Update your photo, schedule, and public details.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="pb-8 border-b border-gray-100">
            <ImageUpload
              value={formData.avatar}
              onChange={handleAvatarUploaded}
              name={`${formData.firstName} ${formData.lastName}`}
              label="Profile photo"
            />
            {savingPhoto && <p className="text-xs text-slate-500 mt-2">Saving photo…</p>}
            <p className="text-xs text-slate-500 mt-2">
              Your photo is saved automatically after upload and appears only on your profile.
            </p>
          </div>

          <div className="pb-8 border-b border-gray-100 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Availability</h3>
              <p className="text-sm text-slate-500">
                Choose which days you work and whether you are accepting appointments right now.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-[#1db1d7] focus:ring-[#1db1d7]"
              />
              <span className="text-sm font-semibold text-slate-800">
                I am present and accepting appointments
              </span>
            </label>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Available days</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const selected = formData.availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                        selected
                          ? 'bg-[#1db1d7] text-white border-[#1db1d7]'
                          : 'bg-white text-slate-600 border-gray-200 hover:border-[#1db1d7]'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: {formData.availableDays.length ? formData.availableDays.join(', ') : 'None'}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center"><Clock size={16} className="mr-2"/> Daily Time Slots</p>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="time" 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1db1d7]" 
                />
                <button 
                  type="button" 
                  onClick={handleAddTimeSlot}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors flex items-center text-sm font-bold"
                >
                  <Plus size={16} className="mr-1"/> Add Slot
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.availableTimeSlots.map((slot) => (
                  <div key={slot} className="flex items-center bg-[#1db1d7]/10 text-[#1db1d7] border border-[#1db1d7]/20 px-3 py-1.5 rounded-full text-xs font-bold">
                    {slot}
                    <button type="button" onClick={() => handleRemoveTimeSlot(slot)} className="ml-2 hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {formData.availableTimeSlots.length === 0 && (
                  <span className="text-sm text-amber-500 font-medium">No time slots added. Patients won't be able to book you!</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input
                required
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input
                required
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
              <input
                required
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
              <input
                required
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Consultation Fee</label>
              <input
                required
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
              <input
                required
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / About Me</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#1db1d7] focus:outline-none"
                placeholder="Write a short biography..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#1db1d7] hover:bg-[#1db1d7]/90 text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
