import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Stethoscope, Activity, Eye, Bone, ArrowRight, Star, Calendar as CalendarIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const specialties = [
  { name: 'Cardiology', icon: Heart, color: 'bg-red-100 text-red-500' },
  { name: 'General', icon: Stethoscope, color: 'bg-blue-100 text-blue-500' },
  { name: 'Neurology', icon: Activity, color: 'bg-purple-100 text-purple-500' },
  { name: 'Ophthalmology', icon: Eye, color: 'bg-green-100 text-green-500' },
  { name: 'Orthopedics', icon: Bone, color: 'bg-orange-100 text-orange-500' },
];

const doctors = [
  { id: 1, name: 'Dr. James Carter', spec: 'Cardiologist', rating: 4.9, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { id: 2, name: 'Dr. Sarah Mitchell', spec: 'Dermatologist', rating: 4.8, img: 'https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { id: 3, name: 'Dr. Robert Elisson', spec: 'General Physician', rating: 4.7, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
];

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleBook = () => {
    toast.success('Appointment Request Sent!');
    setTimeout(() => {
      setStep(1);
      setSelectedDoctor(null);
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
              {doctors.map(doctor => (
                <div key={doctor.id} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1db1d7]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <img src={doctor.img} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt={doctor.name} />
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-xs font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>{doctor.rating}</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{doctor.name}</h4>
                    <p className="text-sm text-slate-500 mb-6">{doctor.spec}</p>
                    
                    <button 
                      onClick={() => { setSelectedDoctor(doctor); setStep(2); }}
                      className="w-full py-3 bg-slate-50 hover:bg-[#1db1d7] text-slate-900 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center"
                    >
                      Select <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
           {/* Booking Form for Selected Doctor */}
           <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-100">
              <img src={selectedDoctor?.img} className="w-20 h-20 rounded-full object-cover" alt="Doctor" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedDoctor?.name}</h3>
                <p className="text-slate-500">{selectedDoctor?.spec}</p>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><CalendarIcon size={16} className="mr-2" /> Select Date</label>
                <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1db1d7] text-slate-600" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center"><Clock size={16} className="mr-2" /> Select Time</label>
                <div className="grid grid-cols-3 gap-3">
                  {['09:00 AM', '10:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM'].map((time, i) => (
                    <button key={i} className="py-2 border border-gray-200 rounded-lg text-sm text-slate-600 hover:border-[#1db1d7] hover:bg-[#1db1d7]/5 hover:text-[#1db1d7] transition-colors focus:ring-2 focus:ring-[#1db1d7] focus:bg-[#1db1d7] focus:text-white">
                      {time}
                    </button>
                  ))}
                </div>
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
