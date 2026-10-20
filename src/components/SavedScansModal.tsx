import React, { useState } from 'react';
import { VehicleScanRecord } from '../types';
import { formatLKR } from '../utils/leasingCalculator';
import {
  X,
  Trash2,
  ExternalLink,
  Car,
  Fuel,
  ShieldCheck,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';

interface SavedScansModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedScans: VehicleScanRecord[];
  onRemoveScan: (id: string) => void;
  onSelectScan: (scan: VehicleScanRecord) => void;
  onClearAll: () => void;
}

export const SavedScansModal: React.FC<SavedScansModalProps> = ({
  isOpen,
  onClose,
  savedScans,
  onRemoveScan,
  onSelectScan,
  onClearAll,
}) => {
  const [compareMode, setCompareMode] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#005f9e] to-[#0077c8] p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold font-heading">
                Motor Show Scanned Vehicles ({savedScans.length})
              </h2>
              <p className="text-[11px] text-blue-100">
                Compare prices, fuel efficiency, and SDB monthly rentals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedScans.length >= 2 && (
              <button
                type="button"
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  compareMode ? 'bg-amber-400 text-slate-900' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{compareMode ? 'Exit Comparison' : 'Side-by-Side'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-slate-800 space-y-4">
          {savedScans.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Car className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <div className="font-semibold text-slate-700 text-sm">
                No vehicles saved yet
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Scan vehicles across the Motor Show floor to save and compare them here.
              </p>
            </div>
          ) : compareMode ? (
            /* Side-by-Side Comparison Grid */
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-[550px]">
                {savedScans.map((item) => (
                  <div
                    key={item.id}
                    className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-3 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-200">
                        <img
                          src={item.imageUrl}
                          alt={item.vehicle.model}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                          {item.vehicle.yearRange}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.vehicle.make} {item.vehicle.model}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.vehicle.variantTrim}
                        </div>
                      </div>

                      {/* Market Value */}
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">Market Value</span>
                        <div className="font-extrabold text-slate-900 text-xs">
                          {formatLKR(item.vehicle.estimatedMarketValueLKR.avg, true)}
                        </div>
                      </div>

                      {/* SDB Monthly Rental */}
                      <div className="p-2 bg-blue-50/70 rounded-xl border border-blue-100">
                        <span className="text-[9px] text-blue-800 uppercase font-semibold">SDB Lease Rental</span>
                        <div className="font-extrabold text-[#0077c8] text-xs">
                          {formatLKR(item.lease.monthlyInstallment)} /mo
                        </div>
                      </div>

                      {/* Fuel Economy */}
                      <div className="text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="text-slate-400">Fuel:</span>
                        <strong className="text-slate-700">{item.vehicle.fuelEfficiency.combinedKmPerLitre}</strong>
                      </div>

                      {/* Safety */}
                      <div className="text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="text-slate-400">Safety:</span>
                        <strong className="text-amber-500">{'★'.repeat(item.vehicle.safety.ratingStars)}</strong>
                      </div>

                      {/* Condition */}
                      <div className="text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="text-slate-400">Condition:</span>
                        <strong className="text-emerald-600">{item.vehicle.conditionScore}/10</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectScan(item);
                        onClose();
                      }}
                      className="w-full py-2 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {savedScans.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200/90 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.vehicle.model}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {item.vehicle.make} {item.vehicle.model}{' '}
                        <span className="text-[11px] font-normal text-slate-500">({item.vehicle.yearRange})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.vehicle.variantTrim} • {item.vehicle.bodyType}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-extrabold text-[#0077c8]">
                          {formatLKR(item.vehicle.estimatedMarketValueLKR.avg, true)}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-xs font-semibold text-emerald-700">
                          {formatLKR(item.lease.monthlyInstallment)}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onRemoveScan(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectScan(item);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      <span>Details & Lease</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedScans.length > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>{savedScans.length} car{savedScans.length > 1 ? 's' : ''} stored locally</span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-rose-600 hover:underline font-medium"
            >
              Clear All Scans
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
