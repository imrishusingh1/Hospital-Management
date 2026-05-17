const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export function resolveMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

export function doctorDisplayName(d) {
  if (!d) return 'Doctor';
  return `Dr. ${d.firstName || ''} ${d.lastName || ''}`.trim();
}

export function doctorAvatar(d) {
  return resolveMediaUrl(d?.avatar);
}
