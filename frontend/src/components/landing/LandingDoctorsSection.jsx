import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Camera,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Briefcase,
  Building2,
  Calendar,
  Star,
} from 'lucide-react';
import { usePublicDoctors } from '../../hooks/usePublicDoctors';
import DoctorPhoto from '../ui/DoctorPhoto';

const LandingDoctorsSection = () => {
  const { doctors, loading, count } = usePublicDoctors();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const list = doctors.length > 0 ? doctors : [];
  const featured = list[featuredIndex] || null;

  const prev = () => setFeaturedIndex((i) => (i - 1 + list.length) % list.length);
  const next = () => setFeaturedIndex((i) => (i + 1) % list.length);

  if (loading) {
    return (
      <section id="doctors" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8 text-center text-slate-500">Loading doctors…</div>
      </section>
    );
  }

  if (list.length === 0) {
    return (
      <section id="doctors" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Our doctors</h2>
          <p className="text-slate-500 mb-6">Doctor profiles will appear here once approved and active.</p>
          <Link to="/login" className="inline-block bg-[#0a3d52] text-white px-8 py-3 rounded-full font-bold">
            Join as a doctor
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="py-24 bg-[#FAFBFC]">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Specialized Doctors
            </div>
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Dedicated doctors,
              <br />
              committed to your care
            </h2>
            <p className="text-slate-500 mt-3">{count} active specialists on Curalync</p>
          </div>
          {list.length > 1 && (
            <div className="flex space-x-4 mt-8 md:mt-0 pb-4">
              <button
                type="button"
                onClick={prev}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-900 hover:bg-gray-50 shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={next}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-900 hover:bg-gray-50 shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Doctor tiles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {list.map((doc, idx) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setFeaturedIndex(idx)}
              className={`text-left rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                idx === featuredIndex
                  ? 'border-[#1db1d7] ring-2 ring-[#1db1d7]/30 shadow-md'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="aspect-[4/5] bg-slate-100 overflow-hidden">
                <DoctorPhoto src={doc.img} name={doc.name} className="w-full h-full" />
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-slate-900 text-sm truncate pr-2">{doc.name}</p>
                  <div className="flex items-center text-amber-500 text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                    <Star size={10} className="fill-amber-500 mr-0.5" /> {doc.averageRating > 0 ? doc.averageRating.toFixed(1) : 'New'}
                  </div>
                </div>
                <p className="text-xs text-slate-500 truncate">{doc.spec}</p>
                {!doc.isAvailable && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">Away</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Featured detail panel */}
        {featured && (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-0 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6">
            <div className="relative h-[500px] rounded-[1.5rem] overflow-hidden bg-slate-200">
              <DoctorPhoto src={featured.img} name={featured.name} className="w-full h-full" />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] bg-white rounded-full p-2 flex items-center shadow-xl">
                <DoctorPhoto
                  src={featured.img}
                  name={featured.name}
                  className="w-10 h-10 rounded-full shrink-0"
                  imgClassName="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <h4 className="text-slate-900 font-bold text-sm leading-tight truncate">{featured.name}</h4>
                  <p className="text-slate-500 text-xs truncate">{featured.spec}</p>
                </div>
                {featured.averageRating > 0 && (
                  <div className="flex flex-col items-end mr-3">
                    <div className="flex items-center text-amber-500 font-bold text-sm">
                      <Star size={14} className="fill-amber-500 mr-1" /> {featured.averageRating.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">({featured.totalReviews} reviews)</span>
                  </div>
                )}
                <div className="w-10 h-10 rounded-full bg-[#1db1d7] flex items-center justify-center text-white shrink-0">
                  <Camera size={18} />
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 flex flex-col">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">About {featured.name}:</h3>
              <p className="text-slate-500 text-lg mb-12 max-w-xl">{featured.bio}</p>

              <div className="grid grid-cols-2 gap-8 mb-auto">
                <Detail icon={Stethoscope} label="Specialty" value={featured.spec} />
                <Detail icon={Briefcase} label="Experience" value={featured.experience} />
                <Detail icon={Building2} label="Department" value={featured.hospital} />
                <Detail
                  icon={Calendar}
                  label="Availability"
                  value={featured.availability}
                  sub={featured.isAvailable ? 'Accepting appointments' : 'Not accepting right now'}
                />
              </div>

              <div className="mt-12 flex justify-start lg:justify-end">
                <Link
                  to="/login"
                  className="bg-[#0a3d52] text-white px-10 py-4 rounded-full font-bold hover:bg-[#104764] transition-colors w-full md:w-auto text-center"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

function Detail({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-slate-900 font-bold">{value}</p>
        {sub && <p className="text-xs text-[#107c9f] font-medium mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default LandingDoctorsSection;
