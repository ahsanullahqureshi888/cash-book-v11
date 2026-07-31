import React from 'react';

export default function SkyArianaLogo({ size = 32, className = '' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 500" 
      width={size} 
      height={size} 
      className={`sky-ariana-logo ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id="skyBlueGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="50%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#0A192F" />
        </linearGradient>

        <linearGradient id="metallicBlueComp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="25%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="75%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="vividBlueComp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0052CC" />
          <stop offset="50%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#00BFFF" />
        </linearGradient>

        <linearGradient id="silverGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <filter id="dropShadowComp" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>

        <path id="archPathComp" d="M 120 120 A 320 180 0 0 1 680 120" fill="none" />
      </defs>

      <g opacity="0.3">
        <path d="M 150 70 Q 250 40 400 60 T 650 70 Q 720 120 680 160 Q 600 180 500 150 Q 300 200 200 160 Z" fill="#3B82F6" opacity="0.4" />
        <ellipse cx="400" cy="120" rx="280" ry="80" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="400" y1="30" x2="400" y2="210" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="4 4" />
      </g>

      <text font imperial-font-family="'Inter', 'Arial Black', sans-serif" fontWeight="900" fontSize="28" fill="#0F172A" letterSpacing="3">
        <textPath href="#archPathComp" startOffset="50%" textAnchor="middle">
          SKY ARIANA &amp; BALAM BAR BARAN
        </textPath>
      </text>

      <g transform="translate(0, 10)" filter="url(#dropShadowComp)">
        <text x="400" y="240" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="130" text-anchor="middle" fill="url(#metallicBlueComp)" stroke="url(#silverGradComp)" stroke-width="4" letter-spacing="6">
          SKY
        </text>
        <path d="M 410 155 L 470 215 L 435 215 L 390 170 Z" fill="url(#vividBlueComp)" />
        <path d="M 435 215 L 490 270 L 450 270 L 410 230 Z" fill="#00D2FF" />
      </g>

      <g transform="translate(0, 360)">
        <path d="M 50 40 Q 200 10 400 35 T 750 20 L 750 90 L 50 90 Z" fill="url(#skyBlueGradComp)" opacity="0.85" />
        <path d="M 50 60 Q 250 35 450 50 T 750 40 L 750 100 L 50 100 Z" fill="#0B2545" />
        <path d="M 70 45 Q 220 25 380 40 T 730 30" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.7" />
      </g>

      <g transform="translate(80, 230)" filter="url(#dropShadowComp)">
        <path d="M 20 100 L 40 160 Q 150 180 230 150 L 250 90 L 30 90 Z" fill="#0F172A" stroke="url(#silverGradComp)" strokeWidth="2" />
        <rect x="50" y="65" width="40" height="25" fill="#1E3A8A" rx="2" stroke="#FFFFFF" strokeWidth="1" />
        <rect x="95" y="60" width="35" height="30" fill="#2563EB" rx="2" stroke="#FFFFFF" strokeWidth="1" />
        <rect x="135" y="65" width="40" height="25" fill="#0284C7" rx="2" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 45 40 L 75 40 L 75 65 L 45 65 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="90" cy="120" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="90" y1="110" x2="90" y2="135" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="80" y1="120" x2="100" y2="120" stroke="#FFFFFF" strokeWidth="2" />
      </g>

      <g transform="translate(480, 240)" filter="url(#dropShadowComp)">
        <rect x="20" y="30" width="170" height="110" fill="#1D4ED8" rx="6" stroke="url(#silverGradComp)" strokeWidth="2.5" />
        <line x1="20" y1="65" x2="190" y2="65" stroke="#60A5FA" strokeWidth="2" />
        <path d="M 190 60 L 230 65 L 250 100 L 250 140 L 190 140 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
        <path d="M 200 70 L 225 73 L 238 95 L 200 95 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="60" cy="142" r="16" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
        <circle cx="60" cy="142" r="6" fill="#FFFFFF" />
        <circle cx="100" cy="142" r="16" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
        <circle cx="100" cy="142" r="6" fill="#FFFFFF" />
        <circle cx="140" cy="142" r="16" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
        <circle cx="140" cy="142" r="6" fill="#FFFFFF" />
        <circle cx="215" cy="142" r="16" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
        <circle cx="215" cy="142" r="6" fill="#FFFFFF" />
      </g>

      <g transform="translate(400, 310)" filter="url(#dropShadowComp)">
        <circle cx="0" cy="0" r="62" fill="url(#silverGradComp)" stroke="#0F172A" strokeWidth="3" />
        <circle cx="0" cy="0" r="54" fill="#0B2545" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="0" cy="0" r="46" fill="none" stroke="url(#silverGradComp)" strokeWidth="1.5" />
        <text x="0" y="16" font-family="'Arial Black', sans-serif" font-weight="900" font-size="44" text-anchor="middle" fill="#FFFFFF" letter-spacing="-1">
          BBB
        </text>
        <path d="M -90 -10 Q -60 -25 -45 -5 Q -60 10 -90 -10 Z" fill="url(#metallicBlueComp)" stroke="url(#silverGradComp)" strokeWidth="1.5" />
        <path d="M 90 -10 Q 60 -25 45 -5 Q 60 10 90 -10 Z" fill="url(#metallicBlueComp)" stroke="url(#silverGradComp)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
