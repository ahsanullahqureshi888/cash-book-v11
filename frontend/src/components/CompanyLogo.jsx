import { memo, useState } from 'react';
import { resolveAvatarUrl } from '../utils/format';

function CompanyLogo({ logo, name, size = 'md', className = '' }) {
  const [hasError, setHasError] = useState(false);
  const initials = (name || 'BAWAR').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'BS';

  const sizeStyles = {
    sm: 'max-h-7 max-w-[80px]',
    md: 'max-h-9 max-w-[110px]',
    lg: 'max-h-12 max-w-[140px]',
    xl: 'max-h-16 max-w-[180px]'
  };

  const logoSrc = resolveAvatarUrl(logo);

  return (
    <div className={`company-logo company-logo-${size} inline-flex items-center justify-center ${className}`}>
      {logoSrc && !hasError ? (
        <img 
          src={logoSrc} 
          alt={`${name || 'Company'} logo`} 
          decoding="async"
          className={`${sizeStyles[size] || sizeStyles.md} object-contain rounded-md shrink-0`}
          onError={() => setHasError(true)} 
        />
      ) : (
        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
          {initials}
        </span>
      )}
    </div>
  );
}

export default memo(CompanyLogo);
