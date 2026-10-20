import React, { useState } from 'react';
import { VehicleScanRecord, UserProfile, LeaseCalculation } from '../types';
import { calculateSDBLease, formatLKR } from '../utils/leasingCalculator';
import { SDB_MOTOR_SHOW_CONFIG } from '../data/salaryRanges';
import { SDBLogo } from './SDBLogo';
import {
  X,
  Sparkles,
  ShieldCheck,
  Fuel,
  Coins,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Bookmark,
  Share2,
  Calendar,
  Percent,
  Layers,
  ArrowUpRight,
  Sliders,
  Award,
  Wrench,
  Check,
} from 'lucide-react';

interface VehicleResultModalProps {
  scan: VehicleScanRecord | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenPreApproval: (scan: VehicleScanRecord) => void;
  onSaveScan: (scan: VehicleScanRecord) => void;
  isSaved: boolean;
}

export const VehicleResultModal: React.FC<VehicleResultModalProps> = ({
  scan,
  isOpen,
  onClose,
  userProfile,
  onOpenProfile,
  onOpenPreApproval,
  onSaveScan,
  isSaved,
}) => {
  if (!isOpen || !scan) return null;

  const vehicle = scan.vehicle;

  // Local state for interactive lease recalculation
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'leasing' | 'condition' | 'amortization' | 'specs'>('leasing');
  const [copiedLink, setCopiedLink] = useState(false);

  // Recalculate lease dynamically with interactive controls
  const activeLease: LeaseCalculation = calculateSDBLease({
    vehiclePrice: vehicle.estimatedMarketValueLKR.avg,
    downPaymentPercent,
    tenureYears,
    interestRate: SDB_MOTOR_SHOW_CONFIG.promoInterestRate,
    userProfile,
  });

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const affordability = activeLease.affordability;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Sticky Modal Header */}
        <div className="relative bg-slate-900 text-white shrink-0">
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
            <img
              src={scan.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                AI Verified
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                {vehicle.inspection.overallConditionGrade}
              </span>
            </div>

            {/* Bottom Vehicle Identity Title */}
            <div className="absolute bottom-3 left-4 right-4">
              <div className="text-xs font-semibold text-blue-300 tracking-wide uppercase">
                {vehicle.make} • {vehicle.yearRange} • {vehicle.bodyType}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight flex items-center justify-between">
                <span>
                  {vehicle.model} <span className="text-sm font-normal text-slate-300">{vehicle.variantTrim}</span>
                </span>
                <span className="text-lg sm:text-xl font-bold text-amber-300 font-heading">
                  {formatLKR(vehicle.estimatedMarketValueLKR.avg, true)}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick tab switch bar */}
          <div className="flex border-b border-slate-800 bg-slate-950/90 text-xs font-semibold px-4 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('leasing')}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'leasing'
                  ? 'border-[#0077c8] text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>SDB Leasing & Budget</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('condition')}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'condition'
                  ? 'border-[#0077c8] text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Condition Inspection ({vehicle.conditionScore}/10)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('amortization')}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'amortization'
                  ? 'border-[#0077c8] text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Settlement Plan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'border-[#0077c8] text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fuel className="w-4 h-4" />
              <span>Specs & Road Suitability</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 flex-1">
          {/* TAB 1: SDB LEASING & BUDGET */}
          {activeTab === 'leasing' && (
            <div className="space-y-4">
              {/* Market Value Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Sri Lankan Market Valuation (Ikman / Riyasewana)
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {formatLKR(vehicle.estimatedMarketValueLKR.min)} – {formatLKR(vehicle.estimatedMarketValueLKR.max)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Recommended Offer: {formatLKR(vehicle.estimatedMarketValueLKR.recommendedOffer)}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Resale: <strong className="text-slate-700">{vehicle.sriLankaContext.resaleValueTrend}</strong>
                  </div>
                </div>
              </div>

              {/* Affordability Gauge Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                  affordability.status === 'AFFORDABLE'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : affordability.status === 'STRETCH'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {affordability.status === 'AFFORDABLE' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : affordability.status === 'STRETCH' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}

                    <span className="font-extrabold text-sm uppercase tracking-wide">
                      {affordability.status === 'AFFORDABLE'
                        ? 'Well Within Budget Profile'
                        : affordability.status === 'STRETCH'
                        ? 'Moderate / Budget Stretch'
                        : 'Exceeds Standard DBR Threshold'}
                    </span>
                  </div>

                  {userProfile && !userProfile.isGuest ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 shadow-2xs">
                      DBR: {affordability.debtBurdenRatio}%
                    </span>
                  ) : (
                    <button
                      onClick={onOpenProfile}
                      className="text-xs font-bold text-[#0077c8] underline"
                    >
                      Add Salary Profile
                    </button>
                  )}
                </div>

                <p className="text-xs leading-relaxed">{affordability.message}</p>

                {affordability.tips.length > 0 && (
                  <ul className="text-xs space-y-1 list-disc list-inside opacity-90 pt-1">
                    {affordability.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Main Interactive Leasing Calculator */}
              <div className="p-4 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 rounded-2xl border border-blue-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#0077c8] text-white">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        SDB Bank Motor Show Leasing Plan
                      </h3>
                      <div className="text-[11px] text-slate-500">
                        Promo Rate: <strong className="text-[#0077c8]">{activeLease.annualInterestRate}% p.a.</strong> (Fixed)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500">Monthly Rental</span>
                    <div className="text-lg sm:text-xl font-extrabold text-[#0077c8] font-heading">
                      {formatLKR(activeLease.monthlyInstallment)}
                      <span className="text-xs font-normal text-slate-500"> /mo</span>
                    </div>
                  </div>
                </div>

                {/* Down Payment Control */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">
                      Down Payment: <strong className="text-[#0077c8]">{downPaymentPercent}%</strong> ({formatLKR(activeLease.downPaymentAmount)})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      CBSL Min 20% - 30%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-[#0077c8] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>20% (Max Lease)</span>
                    <span>30%</span>
                    <span>40%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Tenure Control */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Lease Tenure</span>
                    <span className="text-[11px] text-slate-500">
                      {tenureYears * 12} Monthly Rentals
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[3, 4, 5, 6, 7].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setTenureYears(yr)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          tenureYears === yr
                            ? 'bg-[#0077c8] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {yr} Years
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breakdown Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Financed Principal</div>
                    <div className="font-bold text-slate-800 mt-0.5">{formatLKR(activeLease.leaseAmount)}</div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Total Interest ({tenureYears}y)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{formatLKR(activeLease.totalInterestPayable)}</div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Special Motor Show Perk</div>
                    <div className="font-bold text-emerald-600 mt-0.5">0% Doc Charges</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI CONDITION INSPECTOR */}
          {activeTab === 'condition' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">
                    AI Visual Condition Score
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading mt-0.5 flex items-center gap-2">
                    <span>{vehicle.conditionScore} / 10.0</span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-[#0077c8] text-white rounded-full">
                      {vehicle.inspection.overallConditionGrade}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Wear & Tear Index</span>
                  <div className="text-base font-bold text-emerald-600">
                    {vehicle.inspection.wearAndTearScore} / 10
                  </div>
                </div>
              </div>

              {/* Summary note */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-slate-700 leading-relaxed">
                <strong className="text-[#0077c8] font-bold">Inspector Summary: </strong>
                {vehicle.conditionSummary}
              </div>

              {/* Detailed panel checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Visual Inspection Checklist
                </h4>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Paintwork & Clearcoat Quality</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-5">
                    {vehicle.inspection.paintCondition}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Panel Alignment & Body Gaps</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-5">
                    {vehicle.inspection.bodyworkNotes}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exhibition Detailing & Cleanliness</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-5">
                    {vehicle.inspection.exteriorCleanliness}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTLEMENT PLAN & AMORTIZATION */}
          {activeTab === 'amortization' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  Annual Amortization & Settlement Schedule
                </span>
                <span>{tenureYears}-Year Plan @ {activeLease.annualInterestRate}%</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Principal Paid</th>
                      <th className="py-2.5 px-3">Interest Paid</th>
                      <th className="py-2.5 px-3">Balance Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeLease.amortizationPreview.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">Year {row.year}</td>
                        <td className="py-2 px-3 text-slate-700">{formatLKR(row.principalPaid)}</td>
                        <td className="py-2 px-3 text-slate-500">{formatLKR(row.interestPaid)}</td>
                        <td className="py-2 px-3 font-bold text-[#0077c8]">{formatLKR(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SDB Bank Early Settlement Policy */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-[#0077c8] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>SDB Bank Early Settlement Advantage</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Under SDB Bank leasing guidelines in compliance with CBSL, customers can settle their lease at any time with a full future interest rebate (unaccrued interest is completely waived).
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SPECS & SRI LANKA ROAD SUITABILITY */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              {/* Fuel and economy */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-emerald-600" />
                    Fuel Economy (Sri Lankan Traffic Conditions)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">
                    {vehicle.fuelEfficiency.costRating}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400">City (Colombo)</span>
                    <div className="font-bold text-slate-800 mt-0.5">{vehicle.fuelEfficiency.cityKmPerLitre}</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400">Expressway</span>
                    <div className="font-bold text-slate-800 mt-0.5">{vehicle.fuelEfficiency.highwayKmPerLitre}</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400">Fuel Type</span>
                    <div className="font-bold text-emerald-700 mt-0.5">{vehicle.fuelEfficiency.fuelType}</div>
                  </div>
                </div>
              </div>

              {/* Safety Rating */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0077c8]" />
                    Safety & Crash Test Rating
                  </span>
                  <span className="font-bold text-amber-500">
                    {'★'.repeat(vehicle.safety.ratingStars)} ({vehicle.safety.ratingStars} / 5)
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span>Source: <strong>{vehicle.safety.ncapSource}</strong></span> • <span>Airbags: <strong>{vehicle.safety.airbagsCount}</strong></span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {vehicle.safety.keySafetyFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-blue-100 text-[11px] text-slate-700 font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sri Lanka Market Context */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  Sri Lankan Ownership & Maintenance Context
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400">Spare Parts Availability</span>
                    <div className="font-bold text-slate-800 mt-0.5">{vehicle.sriLankaContext.partsAvailability}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400">Resale Demand</span>
                    <div className="font-bold text-slate-800 mt-0.5">{vehicle.sriLankaContext.resaleValueTrend}</div>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed pt-1">
                  {vehicle.sriLankaContext.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSaveScan(scan)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-blue-50 border-[#0077c8] text-[#0077c8]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Scan Another
            </button>

            <button
              type="button"
              onClick={() => onOpenPreApproval(scan)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              <span>Get SDB Pre-Approval Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
