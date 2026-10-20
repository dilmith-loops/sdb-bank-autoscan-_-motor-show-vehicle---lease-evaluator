import React from 'react';
import { SDBLogo } from './SDBLogo';
import { UserProfile } from '../types';
import { SDB_MOTOR_SHOW_CONFIG } from '../data/salaryRanges';
import { User, Car, Sparkles, MapPin, CheckCircle2, LogOut } from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile | null;
  totalSavedScans: number;
  onOpenProfile: () => void;
  onOpenSavedScans: () => void;
  onOpenPavilionInfo: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  totalSavedScans,
  onOpenProfile,
  onOpenSavedScans,
  onOpenPavilionInfo,
  onLogout,
}) => {
  const isProfileComplete = userProfile && !userProfile.isGuest;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-[#00558f] via-[#0077c8] to-[#0284c7] text-white px-3 py-1.5 text-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">
              Motor Show Exclusive: <strong className="font-semibold">{SDB_MOTOR_SHOW_CONFIG.promoInterestRate}% p.a.</strong> Special Lease Rate
            </span>
          </div>

          <button
            onClick={onOpenPavilionInfo}
            className="flex items-center gap-1 text-[11px] bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors"
          >
            <MapPin className="w-3 h-3 text-amber-300" />
            <span>Booth A-04</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand logo */}
        <div className="flex items-center gap-3">
          <SDBLogo size="sm" showSubtitle={true} />
          <div className="hidden sm:block h-6 w-px bg-slate-200" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-[#0077c8] tracking-wider uppercase">
              AutoScan AI
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Motor Show Lease Evaluator
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Saved cars button */}
          {totalSavedScans > 0 && (
            <button
              onClick={onOpenSavedScans}
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#0077c8] hover:bg-blue-50 transition-colors"
              title="Saved scans"
            >
              <Car className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#0077c8] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalSavedScans}
              </span>
            </button>
          )}

          {/* Profile / Guest Status Badge */}
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isProfileComplete
                ? 'bg-blue-50/80 border-blue-200 text-[#0077c8] hover:bg-blue-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isProfileComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0077c8]" />
                <span className="max-w-[100px] truncate">{userProfile?.name?.split(' ')[0] || 'Profile'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Guest Mode</span>
              </>
            )}
            <User className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
            title="Log out and return to onboarding screen"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
