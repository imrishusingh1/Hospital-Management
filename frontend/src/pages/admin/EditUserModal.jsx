import React, { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import ImageUpload from '../../components/ui/ImageUpload';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { WEEKDAYS } from '../../constants/weekdays';

const EditUserModal = ({ isOpen, onClose, userId, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (!isOpen || !userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${userId}/profile`);
        setUser(res.data.data.user);
        setProfile(res.data.data.profile || {});
      } catch {
        toast.error('Failed to load user');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, userId, onClose]);

  const setField = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  const toggleDay = (day) => {
    setProfile((p) => {
      const days = p.availableDays || [];
      const availableDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
      return { ...p, availableDays };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${userId}/profile`, {
        email: user.email,
        status: user.status,
        avatar: profile.avatar || user.avatar,
        profile,
      });
      toast.success('User updated');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit user">
        <p className="text-slate-500 py-8 text-center">{loading ? 'Loading…' : 'No user selected'}</p>
      </Modal>
    );
  }

  const name = profile.firstName ? `${profile.firstName} ${profile.lastName}` : user.email;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user.role}`} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2"
              value={user.status}
              onChange={(e) => setUser({ ...user, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {(user.role === 'Doctor' || user.role === 'Patient') && (
          <>
            <ImageUpload
              value={profile.avatar || user.avatar}
              onChange={(url) => setField('avatar', url)}
              name={name}
              label="Profile photo"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First name</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.firstName || ''} onChange={(e) => setField('firstName', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last name</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.lastName || ''} onChange={(e) => setField('lastName', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.contactNumber || ''} onChange={(e) => setField('contactNumber', e.target.value)} />
              </div>
            </div>

            {user.role === 'Doctor' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Specialization</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.specialization || ''} onChange={(e) => setField('specialization', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.department || ''} onChange={(e) => setField('department', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Experience (years)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.experienceYears ?? ''} onChange={(e) => setField('experienceYears', Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Consultation fee</label>
                  <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.consultationFee ?? ''} onChange={(e) => setField('consultationFee', Number(e.target.value))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
                  <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2" rows={3} value={profile.bio || ''} onChange={(e) => setField('bio', e.target.value)} />
                </div>
              </div>
            )}

            {user.role === 'Patient' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date of birth</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''} onChange={(e) => setField('dob', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.gender || 'Other'} onChange={(e) => setField('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.address || ''} onChange={(e) => setField('address', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Blood group</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-2" value={profile.bloodGroup || ''} onChange={(e) => setField('bloodGroup', e.target.value)} />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
