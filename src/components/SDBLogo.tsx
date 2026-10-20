import React from 'react';
import { withBasePath } from '../utils/basePath';

const sdbLogoImg = withBasePath('/sdb-bank-logo.png');

interface SDBLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'white' | 'dark';
  showSubtitle?: boolean;
}

export const SDBLogo: React.FC<SDBLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'color',
  showSubtitle = false,
}) => {
  const heights = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  const subtextColor = variant === 'white' ? 'text-blue-100' : 'text-slate-500';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className={`flex items-center ${heights[size]}`}>
        <img
          src={sdbLogoImg}
          alt="SDB bank - SANASA Development Bank PLC"
          className={`h-full w-auto object-contain select-none ${
            variant === 'white' ? 'brightness-0 invert' : ''
          }`}
        />
      </div>

      {showSubtitle && (
        <span className={`text-[9px] sm:text-[10px] font-medium tracking-wider uppercase mt-0.5 ${subtextColor}`}>
          SANASA Development Bank PLC
        </span>
      )}
    </div>
  );
};

