import React from 'react';
import classNames from 'classnames';
import { resolveMediaUrl } from '../../utils/media';

const DoctorPhoto = ({ src, name, className, imgClassName = 'w-full h-full object-cover object-top' }) => {
  const url = src ? resolveMediaUrl(src) : '';

  if (url) {
    return <img src={url} alt={name || 'Doctor'} className={classNames(imgClassName, className)} />;
  }

  const initials = (name || 'DR')
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={classNames(
        'flex items-center justify-center bg-gradient-to-br from-[#1db1d7]/30 to-[#073c52]/20 text-[#073c52] font-bold',
        className
      )}
    >
      <span className="text-2xl md:text-3xl">{initials}</span>
    </div>
  );
};

export default DoctorPhoto;
