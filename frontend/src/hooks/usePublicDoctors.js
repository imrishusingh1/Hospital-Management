import { useEffect, useState } from 'react';
import publicApi from '../services/publicApi';
import { doctorAvatar, doctorDisplayName } from '../utils/media';
import { formatDoctorAvailability } from '../constants/weekdays';

export const FALLBACK_DOCTOR_IMG =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

export function mapPublicDoctor(d) {
  const hasPhoto = Boolean(d.avatar);
  return {
    id: d._id,
    raw: d,
    name: doctorDisplayName(d),
    spec: d.specialization,
    img: hasPhoto ? doctorAvatar(d) : null,
    hasPhoto,
    bio: d.bio || `Experienced ${d.specialization} providing compassionate, patient-first care.`,
    experience: d.experienceYears ? `${d.experienceYears}+ Years` : '—',
    hospital: d.department || 'hospitalflow Clinic',
    availability: formatDoctorAvailability(d),
    isAvailable: d.isAvailable !== false,
    availableDays: d.availableDays || [],
    fee: d.consultationFee,
    averageRating: d.averageRating || 0,
    totalReviews: d.totalReviews || 0,
  };
}

export function usePublicDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .get('/public/doctors')
      .then((res) => setDoctors((res.data.data || []).map(mapPublicDoctor)))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  return { doctors, loading, count: doctors.length };
}
