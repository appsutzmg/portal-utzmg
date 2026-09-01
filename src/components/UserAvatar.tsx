'use client';

import React from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'sm',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const initial = (name?.charAt(0) || '?').toUpperCase();
  const sizeClass = sizeClasses[size];

  const showImage = avatarUrl && !imageError;

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 shadow-sm ${sizeClass} ${className} ${
        showImage ? 'bg-white' : 'bg-gradient-to-tr from-utzmg-green to-emerald-400 text-white flex items-center justify-center font-semibold'
      }`}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={`Foto de ${name}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};
