/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { UserProfile, VehicleScanRecord, VehicleInfo } from './types';
import { SALARY_RANGES, SDB_MOTOR_SHOW_CONFIG } from './data/salaryRanges';
import { calculateSDBLease } from './utils/leasingCalculator';
import { withBasePath } from './utils/basePath';
import { Header } from './components/Header';
import { ScannerView } from './components/ScannerView';
import { ProfileModal } from './components/ProfileModal';
import { VehicleResultModal } from './components/VehicleResultModal';
import { PreApprovalPassModal } from './components/PreApprovalPassModal';
import { SavedScansModal } from './components/SavedScansModal';
import { PavilionModal } from './components/PavilionModal';
import { SDBLogo } from './components/SDBLogo';
import { OnboardingScreen } from './components/OnboardingScreen';
import {
  Sparkles,
  Camera,
  Coins,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Bookmark,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

const STORAGE_KEYS = {
  PROFILE: 'sdb_autoscan_user_profile',
  SAVED_SCANS: 'sdb_autoscan_saved_records',
};

export default function App() {
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored profile:', e);
    }
    return {
      name: '',
      email: '',
      phone: '',
      city: 'Colombo',
      salaryRange: SALARY_RANGES[1],
      familySize: 3,
      preferences: {
        fuelEfficiencyPriority: 'HIGH',
        preferredFuelType: 'HYBRID',
        safetyRatingPriority: '5_STAR',
        targetMonthlyInstallment: 80000,
      },
      isGuest: true,
    };
  });

  // Saved vehicles
  const [savedScans, setSavedScans] = useState<VehicleScanRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_SCANS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading saved scans:', e);
    }
    return [];
  });

  // Active / Working states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentScan, setCurrentScan] = useState<VehicleScanRecord | null>(null);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPreApprovalModalOpen, setIsPreApprovalModalOpen] = useState(false);
  const [isSavedScansModalOpen, setIsSavedScansModalOpen] = useState(false);
  const [isPavilionModalOpen, setIsPavilionModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('sdb_onboarding_seen');
    } catch {
      return true;
    }
  });

  const handleOnboardingFinish = (registeredName?: string) => {
    if (registeredName && registeredName.trim()) {
      const trimmed = registeredName.trim();
      const updated: UserProfile = {
        ...userProfile,
        name: trimmed,
        isGuest: false,
        registeredAt: new Date().toISOString(),
      };
      setUserProfile(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      showToast(`Welcome, ${trimmed}! Registration complete.`);
    }
    try {
      localStorage.setItem('sdb_onboarding_seen', '1');
    } catch {}
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    const defaultProfile: UserProfile = {
      name: '',
      email: '',
      phone: '',
      city: 'Colombo',
      salaryRange: SALARY_RANGES[1],
      familySize: 3,
      preferences: {
        fuelEfficiencyPriority: 'HIGH',
        preferredFuelType: 'HYBRID',
        safetyRatingPriority: '5_STAR',
        targetMonthlyInstallment: 80000,
      },
      isGuest: true,
    };
    setUserProfile(defaultProfile);

    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem('sdb_onboarding_seen');
    } catch (e) {
      console.warn('Error clearing stored data on logout:', e);
    }

    setIsProfileModalOpen(false);
    setIsResultModalOpen(false);
    setIsPreApprovalModalOpen(false);
    setIsSavedScansModalOpen(false);
    setIsPavilionModalOpen(false);

    setShowOnboarding(true);
    showToast('You have logged out. Returning to onboarding screen.');
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Save profile to localStorage
  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  };

  const isGuest = userProfile.isGuest;

  // Scan execution
  const handleScanImage = async (
    base64Data: string,
    mimeType = 'image/jpeg'
  ) => {
    setIsAnalyzing(true);

    try {
      // Call backend AI vehicle scan API
      const response = await fetch(withBasePath('/api/scan-vehicle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.details || errJson?.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const vehicleData: VehicleInfo = data.vehicle;

      if (
        vehicleData.estimatedMarketValueLKR?.avg === 0 ||
        vehicleData.make?.toLowerCase().includes('unidentified') ||
        vehicleData.bodyType?.toLowerCase().includes('non-vehicle')
      ) {
        showToast(
          'Vehicle could not be detected clearly in this photo. Please aim at the car exterior and try again.'
        );
        return;
      }

      // Calculate initial lease
      const initialLease = calculateSDBLease({
        vehiclePrice: vehicleData.estimatedMarketValueLKR.avg,
        downPaymentPercent: 30,
        tenureYears: 5,
        interestRate: SDB_MOTOR_SHOW_CONFIG.promoInterestRate,
        userProfile,
      });

      const newScanRecord: VehicleScanRecord = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl: base64Data,
        vehicle: vehicleData,
        lease: initialLease,
      };

      setCurrentScan(newScanRecord);
      setIsResultModalOpen(true);
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast(err?.message || 'Vehicle scan failed. Please check your photo or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle saving a scan
  const handleToggleSave = (scan: VehicleScanRecord) => {
    const exists = savedScans.some((s) => s.id === scan.id);
    let updated: VehicleScanRecord[];

    if (exists) {
      updated = savedScans.filter((s) => s.id !== scan.id);
    } else {
      updated = [scan, ...savedScans];
    }

    setSavedScans(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_SCANS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveScan = (id: string) => {
    const updated = savedScans.filter((s) => s.id !== id);
    setSavedScans(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_SCANS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllScans = () => {
    setSavedScans([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_SCANS);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Onboarding Screen — shown once per browser; AnimatePresence here
           ensures the exit animation completes before unmounting */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingScreen key="onboarding" onFinish={handleOnboardingFinish} />
        )}
      </AnimatePresence>

      {/* Top Header */}
      <Header
        userProfile={userProfile}
        totalSavedScans={savedScans.length}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSavedScans={() => setIsSavedScansModalOpen(true)}
        onOpenPavilionInfo={() => setIsPavilionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Motor Show Event Headline Banner */}
        <section className="bg-gradient-to-br from-[#005f9e] via-[#0077c8] to-[#0284c7] rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Colombo Motor Show Event Edition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight leading-tight">
              Instant AI Vehicle Valuation & SDB Leasing Evaluator
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Scan any vehicle anywhere in the exhibition hall. AutoScan AI inspects condition, estimates prevailing Sri Lankan market price in LKR, and calculates your personalized monthly lease rental.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsPavilionModalOpen(true)}
                className="bg-white hover:bg-slate-100 text-[#0077c8] font-bold px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Visit SDB Booth A-04</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2 rounded-xl backdrop-blur-xs transition-colors flex items-center gap-1.5"
              >
                <span>{userProfile.isGuest ? 'Set Financial Profile' : 'Edit Profile'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Scanner Viewport Section */}
        <section className="space-y-3">
          <ScannerView
            onScanImage={handleScanImage}
            isAnalyzing={isAnalyzing}
            isGuest={isGuest}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        </section>

        {/* How SDB AutoScan Works - Quick 3-Step Card */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            How It Works at the Motor Show
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077c8] font-black flex items-center justify-center shrink-0 border border-blue-200 text-sm">
                1
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">Scan 3 Free Cars</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Start scanning immediately without entering any financial data in guest mode.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077c8] font-black flex items-center justify-center shrink-0 border border-blue-200 text-sm">
                2
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">AI Valuation & Condition</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  AutoScan AI verifies paint, body gaps, fuel economy, and Sri Lanka market price (Ikman/Riyasewana).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077c8] font-black flex items-center justify-center shrink-0 border border-blue-200 text-sm">
                3
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">Fast-Track Lease Approval</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Generate your Pre-Approval Pass and claim 13.25% p.a. promo rates at Booth A-04!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Saved Scans Preview if any */}
        {savedScans.length > 0 && (
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#0077c8]">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {savedScans.length} Saved Exhibition Vehicle{savedScans.length > 1 ? 's' : ''}
                </div>
                <div className="text-[11px] text-slate-500">
                  Compare specs and monthly lease rentals side-by-side
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSavedScansModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0077c8] text-white text-xs font-semibold hover:bg-[#005f9e] transition-colors"
            >
              <span>Compare Scans</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </section>
        )}
      </main>

      {/* Footer with SDB Bank PLC official info */}
      <footer className="mt-8 border-t border-slate-200/80 bg-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <SDBLogo size="sm" showSubtitle={true} />
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <div>Colombo International Motor Show 2025/2026 • Official Financial Services Partner</div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
      />

      <VehicleResultModal
        scan={currentScan}
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        userProfile={userProfile}
        onOpenProfile={() => {
          setIsResultModalOpen(false);
          setIsProfileModalOpen(true);
        }}
        onOpenPreApproval={(scan) => {
          setCurrentScan(scan);
          setIsResultModalOpen(false);
          setIsPreApprovalModalOpen(true);
        }}
        onSaveScan={handleToggleSave}
        isSaved={Boolean(currentScan && savedScans.some((s) => s.id === currentScan.id))}
      />

      <PreApprovalPassModal
        scan={currentScan}
        userProfile={userProfile}
        isOpen={isPreApprovalModalOpen}
        onClose={() => setIsPreApprovalModalOpen(false)}
        onOpenProfile={() => {
          setIsPreApprovalModalOpen(false);
          setIsProfileModalOpen(true);
        }}
      />

      <SavedScansModal
        isOpen={isSavedScansModalOpen}
        onClose={() => setIsSavedScansModalOpen(false)}
        savedScans={savedScans}
        onRemoveScan={handleRemoveScan}
        onSelectScan={(scan) => {
          setCurrentScan(scan);
          setIsResultModalOpen(true);
        }}
        onClearAll={handleClearAllScans}
      />

      <PavilionModal
        isOpen={isPavilionModalOpen}
        onClose={() => setIsPavilionModalOpen(false)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <p className="leading-snug">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold p-1 shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
