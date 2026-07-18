import { memo, useState } from 'react';

function CompanyLogo({ logo, name, size = 'md', className = '' }) {
  const [hasError, setHasError] = useState(false);
  const initials = (name || 'SKY').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'SKY';
  return (
    <div className={`company-logo company-logo-${size} ${className}`}>
      {logo && !hasError ? (
        <img 
          src={logo} 
          alt={`${name || 'Company'} logo`} 
          decoding="async" 
          onError={() => setHasError(true)} 
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default memo(CompanyLogo);
