import React from 'react';
import classNames from 'classnames';

const Avatar = ({ src, name, size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className={classNames(
      'rounded-full flex items-center justify-center shrink-0 overflow-hidden font-bold',
      sizes[size],
      !src ? 'bg-[#1db1d7]/10 text-[#073c52]' : 'bg-gray-100',
      className
    )}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
