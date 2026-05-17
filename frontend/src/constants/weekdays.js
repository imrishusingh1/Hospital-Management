export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function formatDoctorAvailability(doctor) {
  const days = doctor?.availableDays?.length
    ? doctor.availableDays.join(', ')
    : 'No days selected';
  if (doctor?.isAvailable === false) {
    return `${days} (currently not accepting appointments)`;
  }
  return days;
}
