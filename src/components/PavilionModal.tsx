import React from 'react';
import { SDBLogo } from './SDBLogo';
import { SDB_MOTOR_SHOW_CONFIG } from '../data/salaryRanges';
import {
  X,
  MapPin,
  Phone,
  MessageSquare,
  Gift,
  Clock,
  Sparkles,
  Award,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface PavilionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PavilionModal: React.FC<PavilionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005288] via-[#0077c8] to-[#0284c7] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
              Motor Show Pavilion
            </span>
          </div>

          <h2 className="text-xl font-bold font-heading">
            SDB Bank Pavilion (Booth A-04)
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            BMICH Colombo • Instant Leasing & Pre-Approval Consultation
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Location Card */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#0077c8] text-white shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Booth A-04 (Main Hall Entrance)
              </div>
              <div className="text-slate-600 mt-0.5">
                Sirimavo Bandaranaike Memorial Exhibition Centre (BMICH), Bauddhaloka Mawatha, Colombo 07.
              </div>
              <div className="text-[11px] text-[#0077c8] font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Open 9:00 AM – 8:00 PM Daily during Motor Show</span>
              </div>
            </div>
          </div>

          {/* Exhibition Special Privileges */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>Exclusive Motor Show On-Site Privileges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">13.25% p.a. Special Rate</div>
                  <div className="text-[11px] text-slate-500">Save up to Rs. 150,000 over 5-year lease tenure</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">0% Document Handling Fees</div>
                  <div className="text-[11px] text-slate-500">Full 100% waiver during event days</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Free GPS Tracker Voucher</div>
                  <div className="text-[11px] text-slate-500">1 year free real-time tracking subscription</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">30-Min Fast-Track Approval</div>
                  <div className="text-[11px] text-slate-500">Bring NIC, salary slip, and scanned pass token</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Direct Hotlines */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800">On-Site Leasing Assistance</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`tel:${SDB_MOTOR_SHOW_CONFIG.hotline}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                <Phone className="w-4 h-4 text-[#0077c8]" />
                <span>Call Hotline: {SDB_MOTOR_SHOW_CONFIG.hotline}</span>
              </a>

              <a
                href={`https://wa.me/94771234567?text=Hello%20SDB%20Bank,%20I%20am%20at%20the%20Motor%20Show%20and%20scanned%20a%20vehicle`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Leasing Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
