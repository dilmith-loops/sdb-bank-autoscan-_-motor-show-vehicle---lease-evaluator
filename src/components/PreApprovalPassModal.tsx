import React, { useRef } from 'react';
import { VehicleScanRecord, UserProfile } from '../types';
import { generatePreApprovalCertificate, formatLKR } from '../utils/leasingCalculator';
import { SDB_MOTOR_SHOW_CONFIG } from '../data/salaryRanges';
import { SDBLogo } from './SDBLogo';
import {
  X,
  Printer,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Calendar,
  Sparkles,
  QrCode,
  Download,
} from 'lucide-react';

interface PreApprovalPassModalProps {
  scan: VehicleScanRecord | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const PreApprovalPassModal: React.FC<PreApprovalPassModalProps> = ({
  scan,
  userProfile,
  isOpen,
  onClose,
  onOpenProfile,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !scan) return null;

  // If user has not filled basic details, prompt them to fill name/phone
  const hasBasicDetails = userProfile && userProfile.name && !userProfile.isGuest;

  const certificate = generatePreApprovalCertificate(
    scan.vehicle,
    scan.lease,
    userProfile || {
      name: 'Motor Show Visitor',
      email: '',
      phone: '077 000 0000',
      salaryRange: {
        id: '1',
        label: 'General',
        minLKR: 100000,
        maxLKR: 200000,
        typicalNetIncomeLKR: 150000,
      },
      familySize: 3,
      preferences: {
        fuelEfficiencyPriority: 'HIGH',
        preferredFuelType: 'HYBRID',
        safetyRatingPriority: '5_STAR',
        targetMonthlyInstallment: 80000,
      },
      isGuest: true,
    }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              SDB Bank Official Lease Pre-Approval Pass
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Printable Area */}
        <div ref={cardRef} className="p-5 sm:p-6 bg-slate-50 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-dashed border-blue-300 p-5 shadow-sm relative overflow-hidden">
            {/* Watermark / Seal */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-blue-50/70 pointer-events-none flex items-center justify-center opacity-40">
              <SDBLogo size="sm" />
            </div>

            {/* Header: SDB Logo & Event Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <SDBLogo size="sm" showSubtitle={true} />
                <div className="text-[10px] text-slate-400 font-medium mt-1">
                  Motor Show Fast-Track Leasing Desk
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Pre-Approved
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  ID: {certificate.certificateId}
                </div>
              </div>
            </div>

            {/* Applicant & Vehicle Summary */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Applicant Name</span>
                <div className="font-bold text-slate-900 truncate">
                  {userProfile?.name || 'Motor Show Guest'}
                </div>
                <div className="text-[11px] text-slate-500">{userProfile?.phone || '+94 (Pending)'}</div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium">Verified Vehicle</span>
                <div className="font-bold text-slate-900 truncate">{certificate.vehicleName}</div>
                <div className="text-[11px] text-slate-500">
                  Est. Value: {formatLKR(certificate.marketPrice)}
                </div>
              </div>
            </div>

            {/* Approved Financing Terms Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 text-xs">
              <div className="bg-blue-50/60 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500">Sanctioned Lease</span>
                <div className="font-extrabold text-[#0077c8] text-xs sm:text-sm mt-0.5">
                  {formatLKR(certificate.approvedLeaseAmount, true)}
                </div>
              </div>

              <div className="bg-emerald-50/60 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500">Monthly Rental</span>
                <div className="font-extrabold text-emerald-700 text-xs sm:text-sm mt-0.5">
                  {formatLKR(certificate.monthlyInstallment)}
                </div>
              </div>

              <div className="bg-amber-50/60 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500">Promo Rate</span>
                <div className="font-extrabold text-amber-700 text-xs sm:text-sm mt-0.5">
                  {certificate.interestRate}% p.a.
                </div>
              </div>
            </div>

            {/* Down payment & Tenure info */}
            <div className="flex items-center justify-between text-xs py-2 text-slate-600">
              <span>
                Down Payment: <strong>{formatLKR(certificate.downPayment)}</strong>
              </span>
              <span>
                Tenure: <strong>{certificate.tenureYears} Years ({certificate.tenureYears * 12} Months)</strong>
              </span>
            </div>

            {/* Barcode & Verification Token */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl">
              <div>
                <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0077c8]" />
                  <span>Present at Booth A-04 (BMICH)</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Token: <strong>{certificate.boothToken}</strong>
                </div>
              </div>

              {/* Simulated barcode graphic */}
              <div className="flex items-center gap-0.5 h-7">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4].map((width, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{ width: `${width}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Validity footnote */}
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Issued: {certificate.issuedAt}</span>
              <span>Valid Until: {certificate.validUntil}</span>
            </div>
          </div>

          {/* Pavilion guidance notice */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Motor Show Pavilion Perk:</span> Show this pass on your phone screen to any SDB Bank officer at Booth A-04 to receive instant formal documentation, 50% waiver on documentation fees, and a free 1-year GPS tracking voucher!
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          {!hasBasicDetails ? (
            <button
              onClick={onOpenProfile}
              className="text-xs font-semibold text-[#0077c8] hover:underline"
            >
              Complete Profile for Full Verification
            </button>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Profile</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
