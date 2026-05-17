import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Heart, Shield, Save } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';
import ImageUpload from '../../components/ui/ImageUpload';
import PageHeader from '../../components/ui/PageHeader';

const PatientProfile = () => {
  const { user, profile, hydrateMe } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Other',
    contactNumber: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    avatar: '',
    insuranceProvider: '',
    insurancePolicy: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        gender: profile.gender || 'Other',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
        bloodGroup: profile.bloodGroup || '',
        allergies: (profile.allergies || profile.medicalHistory || []).join(', '),
        avatar: profile.avatar || user?.avatar || '',
        insuranceProvider: profile.insuranceDetails?.provider || '',
        insurancePolicy: profile.insuranceDetails?.policyNumber || '',
      });
    }
  }, [profile, user]);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email?.split('@')[0];

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/patients/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        gender: form.gender,
        contactNumber: form.contactNumber,
        address: form.address,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        avatar: form.avatar,
        insuranceDetails: {
          provider: form.insuranceProvider,
          policyNumber: form.insurancePolicy,
        },
      });
      await hydrateMe();
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-container max-w-4xl">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal and medical information"
        action={
          !editing ? (
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          )
        }
      />

      <div className="card-flat overflow-hidden p-0">
        <div className="h-40 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-500 relative">
          <div className="absolute -bottom-10 left-8 flex items-end gap-4">
            <Avatar src={form.avatar} name={displayName} size="xl" className="border-4 border-white shadow-lg" />
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white drop-shadow">{displayName}</h2>
              <p className="text-brand-100 font-medium">Patient</p>
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="pt-16 p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">First name</label>
                <input className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Last name</label>
                <input className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Date of birth</label>
                <input type="date" className="input-field" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Gender</label>
                <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label-field">Phone</label>
                <input className="input-field" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Blood group</label>
                <input className="input-field" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} placeholder="e.g. O+" />
              </div>
              <div className="md:col-span-2">
                <label className="label-field">Address</label>
                <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label-field">Allergies (comma separated)</label>
                <input className="input-field" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <ImageUpload
                  value={form.avatar}
                  onChange={(url) => setForm({ ...form, avatar: url })}
                  name={displayName}
                  label="Profile photo"
                />
              </div>
              <div>
                <label className="label-field">Insurance provider</label>
                <input className="input-field" value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} />
              </div>
              <div>
                <label className="label-field">Policy number</label>
                <input className="input-field" value={form.insurancePolicy} onChange={(e) => setForm({ ...form, insurancePolicy: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        ) : (
          <div className="pt-16 p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Personal</h3>
              <InfoRow icon={Mail} label="Email" value={user?.email} />
              <InfoRow icon={Phone} label="Phone" value={profile?.contactNumber} />
              <InfoRow icon={Calendar} label="Date of birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString() : '—'} />
              <InfoRow icon={MapPin} label="Address" value={profile?.address} />
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Medical</h3>
              <InfoRow icon={Heart} label="Blood group" value={profile?.bloodGroup || '—'} />
              <InfoRow icon={Shield} label="Insurance" value={profile?.insuranceDetails?.provider || '—'} />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {(profile?.allergies?.length ? profile.allergies : profile?.medicalHistory || ['None']).map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-slate-400 mt-0.5" size={18} />
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
      </div>
    </div>
  );
}

export default PatientProfile;
