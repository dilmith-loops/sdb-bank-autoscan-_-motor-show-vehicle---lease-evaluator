import React, { useState } from 'react';
import { UserProfile, SalaryRange } from '../types';
import { SALARY_RANGES, SDB_MOTOR_SHOW_CONFIG } from '../data/salaryRanges';
import { formatLKR } from '../utils/leasingCalculator';
import { SDBLogo } from './SDBLogo';
import {
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Fuel,
  Users,
  Coins,
  ArrowRight,
  Check,
  Info,
  Car,
  LogOut,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'basic' | 'financial'>(
    currentProfile && currentProfile.name ? 'financial' : 'basic'
  );

  const [name, setName] = useState(currentProfile?.name || '');
  const [email, setEmail] = useState(currentProfile?.email || '');
  const [phone, setPhone] = useState(currentProfile?.phone || '');
  const [city, setCity] = useState(currentProfile?.city || 'Colombo');

  const [selectedSalaryRange, setSelectedSalaryRange] = useState<SalaryRange>(
    currentProfile?.salaryRange || SALARY_RANGES[1]
  );
  const [familySize, setFamilySize] = useState<number>(
    currentProfile?.familySize || 3
  );
  const [fuelPriority, setFuelPriority] = useState<'HIGH' | 'MEDIUM' | 'ANY'>(
    currentProfile?.preferences?.fuelEfficiencyPriority || 'HIGH'
  );
  const [preferredFuelType, setPreferredFuelType] = useState<
    'ANY' | 'HYBRID' | 'PETROL' | 'DIESEL' | 'EV'
  >(currentProfile?.preferences?.preferredFuelType || 'HYBRID');
  const [safetyPriority, setSafetyPriority] = useState<
    '5_STAR' | '4_STAR_PLUS' | 'STANDARD'
  >(currentProfile?.preferences?.safetyRatingPriority || '5_STAR');
  const [targetInstallment, setTargetInstallment] = useState<number>(
    currentProfile?.preferences?.targetMonthlyInstallment || 80000
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: UserProfile = {
      name: name.trim() || 'Motor Show Guest',
      email: email.trim(),
      phone: phone.trim(),
      city,
      salaryRange: selectedSalaryRange,
      familySize,
      preferences: {
        fuelEfficiencyPriority: fuelPriority,
        preferredFuelType,
        safetyRatingPriority: safetyPriority,
        targetMonthlyInstallment: targetInstallment,
      },
      isGuest: false,
      registeredAt: new Date().toISOString(),
    };

    onSaveProfile(profile);
    onClose();
  };

  // CBSL Recommended monthly budget (40% max DBR)
  const maxRecommended = Math.round(selectedSalaryRange.typicalNetIncomeLKR * 0.40);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header pattern */}
        <div className="bg-gradient-to-br from-[#005288] via-[#0077c8] to-[#0284c7] p-5 text-white relative">
          {onLogout && currentProfile && !currentProfile.isGuest && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="absolute top-4 right-14 flex items-center gap-1 text-[11px] font-semibold bg-white/20 hover:bg-rose-500 hover:text-white text-white px-2.5 py-1 rounded-full transition-colors"
              title="Log out and return to onboarding"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide">
              Motor Show 2025/2026 Special
            </span>
          </div>

          <h2 className="text-xl font-bold font-heading">
            {step === 'basic' ? 'Welcome to SDB Bank AutoScan' : 'Your Vehicle & Financial Profile'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {step === 'basic'
              ? 'Enter basic details to personalize your vehicle valuation & leasing rates.'
              : 'Configure your budget & preferences for real-time lease affordability checks.'}
          </p>

          {/* Stepper indicators */}
          <div className="flex items-center gap-2 mt-4">
            <div
              onClick={() => setStep('basic')}
              className={`flex-1 h-1.5 rounded-full cursor-pointer transition-all ${
                step === 'basic' ? 'bg-amber-300' : 'bg-white/60'
              }`}
            />
            <div
              onClick={() => {
                if (name && phone) setStep('financial');
              }}
              className={`flex-1 h-1.5 rounded-full cursor-pointer transition-all ${
                step === 'financial' ? 'bg-amber-300' : 'bg-white/30'
              }`}
            />
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {step === 'basic' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kasun Jayawardena"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0077c8]/30 focus:border-[#0077c8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0077c8]/30 focus:border-[#0077c8]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Used for SDB Motor Show Pre-Approval SMS token.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kasun@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0077c8]/30 focus:border-[#0077c8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / District in Sri Lanka
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0077c8]/30 focus:border-[#0077c8]"
                >
                  <option value="Colombo">Colombo (Western Province)</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy (Central Province)</option>
                  <option value="Galle">Galle (Southern Province)</option>
                  <option value="Matara">Matara</option>
                  <option value="Kurunegala">Kurunegala (North Western)</option>
                  <option value="Ratnapura">Ratnapura</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Other">Other District</option>
                </select>
              </div>

              {/* Guest Scan notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Guest Mode Available:</span> You can scan vehicles right now without financial details. Providing your salary profile unlocks personalized lease approvals!
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 font-medium"
                >
                  Continue as Guest
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      setName('Motor Show Visitor');
                    }
                    if (!phone.trim()) {
                      setPhone('0770000000');
                    }
                    setStep('financial');
                  }}
                  className="ml-auto flex items-center gap-2 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <span>Next: Financial & Vehicle Needs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Financial and Vehicle preferences */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#0077c8]" />
                    Monthly Net Salary / Income Range
                  </label>
                  <span className="text-[10px] text-slate-500">Central Bank DBR guide</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {SALARY_RANGES.map((range) => {
                    const isSelected = selectedSalaryRange.id === range.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setSelectedSalaryRange(range)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-blue-50/90 border-[#0077c8] text-[#005f9e] font-semibold ring-1 ring-[#0077c8]'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div>{range.label}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                            Max CBSL 40% Lease Cap: ~{formatLKR(Math.round(range.typicalNetIncomeLKR * 0.40))} / mo
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0077c8] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Family Size */}
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0077c8]" />
                  Family Size
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { count: 1, label: 'Single / 1' },
                    { count: 2, label: 'Couple (2)' },
                    { count: 4, label: 'Family (3-4)' },
                    { count: 6, label: 'Large (5+)' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setFamilySize(item.count)}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        familySize === item.count
                          ? 'bg-[#0077c8] text-white border-[#0077c8]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Efficiency Preference */}
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                  Fuel Efficiency Priority
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'HIGH', label: 'High Priority (>18 km/l or EV)' },
                    { id: 'MEDIUM', label: 'Balanced (12-16 km/l)' },
                    { id: 'ANY', label: 'Performance / Any' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFuelPriority(p.id as any)}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        fuelPriority === p.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Fuel Type */}
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Car className="w-3.5 h-3.5 text-[#0077c8]" />
                  Preferred Powertrain
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'ANY', label: 'Any Fuel' },
                    { id: 'HYBRID', label: 'Hybrid (Vezel/Aqua/Stingray)' },
                    { id: 'EV', label: '100% Electric (BYD/Leaf)' },
                    { id: 'PETROL', label: 'Petrol' },
                    { id: 'DIESEL', label: 'Diesel (SUV/Van)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPreferredFuelType(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        preferredFuelType === f.id
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Rating Priority */}
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Safety Rating Expectation
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: '5_STAR', label: '5-Star NCAP (Top Tier)' },
                    { id: '4_STAR_PLUS', label: '4-Star+ Certified' },
                    { id: 'STANDARD', label: 'Standard Dual Airbags' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSafetyPriority(s.id as any)}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        safetyPriority === s.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Monthly Installment Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Comfortable Monthly Installment Target
                  </label>
                  <span className="text-sm font-extrabold text-[#0077c8]">
                    {formatLKR(targetInstallment)} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="350000"
                  step="5000"
                  value={targetInstallment}
                  onChange={(e) => setTargetInstallment(Number(e.target.value))}
                  className="w-full accent-[#0077c8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Rs. 30k</span>
                  <span>Rs. 100k</span>
                  <span>Rs. 200k</span>
                  <span>Rs. 350k+</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Based on your salary bracket, SDB recommends staying under{' '}
                  <strong className="text-slate-700">{formatLKR(maxRecommended)}</strong> to maintain comfortable living expenses.
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('basic')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile & Calculate Live Leases</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
