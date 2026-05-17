import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Stethoscope, Activity, Eye, Bone, ArrowRight, Star, Calendar as CalendarIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const specialties = [
  { name: 'Cardiology', icon: Heart, color: 'bg-red-100 text-red-500' },
  { name: 'General', icon: Stethoscope, color: 'bg-blue-100 text-blue-500' },
  { name: 'Neurology', icon: Activity, color: 'bg-purple-100 text-purple-500' },
  { name: 'Ophthalmology', icon: Eye, color: 'bg-green-100 text-green-500' },
  { name: 'Orthopedics', icon: Bone, color: 'bg-orange-100 text-orange-500' },
];

const BookAppointment = () => {
  const { profile } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await api.get('/users/doctors', { params: { limit: 100 } });
        setDoctors(res.data.data || []);
      } catch (e) {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctor?._id || !date) {
        setAvailableSlots([]);
        return;
      }
      setSlotsLoading(true);
      setTimeSlot('');
      try {
        const res = await api.get('/appointments/slots', {
          params: { doctorId: selectedDoctor._id, date },
        });
        setAvailableSlots(res.data.data || []);
      } catch {
        toast.error('Could not load time slots');
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [selectedDoctor?._id, date]);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => {
      const name = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase();
      const spec = String(d.specialization || '').toLowerCase();
      const email = String(d.userId?.email || '').toLowerCase();
      return name.includes(q) || spec.includes(q) || email.includes(q);
    });
  }, [doctors, query]);

  const handleBook = async () => {
    if (!profile?._id) {
      toast.error('Patient profile not loaded. Please re-login.');
      return;
    }
    if (!selectedDoctor?._id) {
      toast.error('Please select a doctor.');
      return;
    }
    if (!date || !timeSlot || !reason.trim()) {
      toast.error('Please select date/time and enter a reason.');
      return;
    }

    try {
      await api.post('/appointments', {
        patientId: profile._id,
        doctorId: selectedDoctor._id,
        date,
        timeSlot,
        reason: reason.trim(),
      });
      toast.success('Appointment booked!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to book appointment');
      return;
    }

    setTimeout(() => {
      setStep(1);
      setSelectedDoctor(null);
      setDate('');
      setTimeSlot('');
      setReason('');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Book Appointment</h2>
          <p className="text-slate-500">Select a specialty or doctor to continue</p>
        </div>
        
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="text-sm font-bold text-[#1db1d7] hover:underline"
          >
            &larr; Back to selection
          </button>
        )}
      </div>

      {step === 1 ? (
        <div className="space-y-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search doctors, specialties, clinics..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-[#1db1d7] focus:ring-1 focus:ring-[#1db1d7] shadow-sm"
            />
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Specialties</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {specialties.map((spec, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#1db1d7] hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${spec.color}`}>
                    <spec.icon size={24} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{spec.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Doctors */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended Doctors</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {loading ? (
                <div className="text-slate-500">Loading doctors...</div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-slate-500">No doctors found.</div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <div key={doctor._id} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1db1d7]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                      <Star size={20} />
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-xs font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>—</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h4>
                    <p className="text-sm text-slate-500 mb-6">{doctor.specialization}</p>
                    
                    <button 
                      onClick={() => { setSelectedDoctor(doctor); setStep(2); }}
                      className="w-full py-3 bg-slate-50 hover:bg-[#1db1d7] text-slate-900 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center"
                    >
                      Select <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
           {/* Booking Form for Selected Doctor */}
           <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Star size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedDoctor ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` : 'Doctor'}</h3>
                <p className="text-slate-500">{selectedDoctor?.specialization}</p>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><CalendarIcon size={16} className="mr-2" /> Select Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1db1d7] text-slate-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Clock size={16} className="mr-2" /> Select Time</label>
                {slotsLoading && <p className="text-sm text-slate-500 mb-2">Loading slots…</p>}
                {!slotsLoading && date && availableSlots.length === 0 && (
                  <p className="text-sm text-amber-600 mb-2">No slots available for this date.</p>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {(availableSlots.length ? availableSlots : []).map((time) => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setTimeSlot(time)}
                      className={`py-2 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-[#1db1d7] ${
                        timeSlot === time
                          ? 'border-[#1db1d7] bg-[#1db1d7] text-white'
                          : 'border-gray-200 text-slate-600 hover:border-[#1db1d7] hover:bg-[#1db1d7]/5 hover:text-[#1db1d7]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Fever, routine checkup..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1db1d7] text-slate-600"
                />
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleBook}
                  className="w-full bg-gradient-to-r from-[#073c52] to-[#107c9f] text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  Confirm Appointment
                </button>
              </div>
           </div>
        </div>
      )}

    </motion.div>
  );
};

export default BookAppointment;
