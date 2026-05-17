import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Award, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';
import api from '../services/api';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanBase = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function PublicDoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
          const { data } = await api.get('/public/doctors');
          const found = data.data.find(d => d._id === id);
          setDoctor(found);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-[#1db1d7] border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!doctor) return <div className="min-h-screen flex items-center justify-center font-display font-bold text-2xl">Doctor not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-[#0e4356] text-white pt-8 pb-32">
        <div className="max-w-[1000px] mx-auto px-6">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Home
          </Link>
          <div className="flex items-center space-x-2 text-sm text-white/60 mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span>Doctors</span>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Dr. {doctor.firstName} {doctor.lastName}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-6 -mt-24 pb-24">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-slate-100 flex flex-col md:flex-row gap-10">
          
          {/* Left Column - Photo & Actions */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-48 h-48 rounded-[2rem] overflow-hidden shadow-lg mb-6 bg-slate-100">
              {doctor.avatar ? (
                <img src={resolveMediaUrl(doctor.avatar)} alt={`Dr. ${doctor.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1db1d7] to-[#107c9f] flex items-center justify-center text-white text-5xl font-bold font-display">
                  {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                </div>
              )}
            </div>
            <Link to="/login" className="w-full py-4 bg-[#107c9f] hover:bg-[#0a5f7a] text-white rounded-xl font-bold transition-colors shadow-md text-center">
              Book Appointment
            </Link>
            <p className="text-xs text-slate-500 mt-3 text-center">Log in to book a consultation</p>
          </div>

          {/* Right Column - Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 font-display">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                <p className="text-[#107c9f] font-semibold text-lg">{doctor.specialization}</p>
              </div>
              <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl flex items-center shadow-sm">
                <Star fill="currentColor" size={18} className="mr-1.5" />
                <span className="font-bold">{doctor.rating || doctor.averageRating || 'New'}</span>
                <span className="text-sm text-amber-600/70 ml-1">({doctor.reviews || doctor.totalReviews || 0})</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 my-6 pb-6 border-b border-slate-100">
              <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-lg font-medium">
                <Award size={18} className="text-[#1db1d7] mr-2" />
                <span>{doctor.experienceYears} Years Experience</span>
              </div>
              <div className="flex items-center text-slate-600 bg-slate-50 px-4 py-2 rounded-lg font-medium">
                <Clock size={18} className="text-[#1db1d7] mr-2" />
                <span>Usually responds within 24h</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">About the Doctor</h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              {doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a highly qualified specialist dedicated to providing exceptional care and treatment. With extensive experience in ${doctor.specialization}, they focus on personalized patient care and the latest medical advancements.`}
            </p>

            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">Specialties</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-2 bg-[#1db1d7]/10 text-[#107c9f] rounded-full font-medium text-sm flex items-center">
                <CheckCircle2 size={16} className="mr-2" /> {doctor.department || 'General Medicine'}
              </span>
              <span className="px-4 py-2 bg-[#1db1d7]/10 text-[#107c9f] rounded-full font-medium text-sm flex items-center">
                <CheckCircle2 size={16} className="mr-2" /> {doctor.specialization}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display border-t border-slate-100 pt-8">Availability & Schedule</h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="mb-6">
                <h4 className="font-bold text-slate-700 flex items-center mb-3">
                  <Calendar size={18} className="mr-2 text-[#1db1d7]" /> Available Days
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.availableDays && doctor.availableDays.length > 0 ? doctor.availableDays.map(day => (
                    <span key={day} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium shadow-sm">
                      {day}
                    </span>
                  )) : (
                    <span className="text-slate-500">Not specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-700 flex items-center mb-3">
                  <Clock size={18} className="mr-2 text-[#1db1d7]" /> Time Slots
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.availableTimeSlots && doctor.availableTimeSlots.length > 0 ? doctor.availableTimeSlots.map(time => (
                    <span key={time} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium shadow-sm">
                      {time}
                    </span>
                  )) : (
                    <span className="text-slate-500">Not specified</span>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
