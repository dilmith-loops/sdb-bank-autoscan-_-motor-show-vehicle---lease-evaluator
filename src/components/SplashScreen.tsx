import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { withBasePath } from '../utils/basePath';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDuration?: number; // duration in ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDuration = 2200,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing AI Vision...');

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / minDuration) * 100));
      setProgress(currentProgress);

      if (currentProgress < 30) {
        setStatusText('Initializing AI Vehicle Scanner...');
      } else if (currentProgress < 65) {
        setStatusText('Loading Sri Lankan Market Price Models...');
      } else if (currentProgress < 90) {
        setStatusText('Connecting to SDB Bank Leasing System...');
      } else {
        setStatusText('Welcome to SDB Bank AutoScan');
      }

      if (elapsed >= minDuration) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          onFinish?.();
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDuration, onFinish]);

  const handleSkip = () => {
    setIsVisible(false);
    onFinish?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-[#03152e] to-slate-950 text-white overflow-hidden select-none"
        >
          {/* Ambient Lighting & High-Tech Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Skip Button */}
          <div className="w-full max-w-md px-6 pt-6 flex justify-end z-10">
            <button
              onClick={handleSkip}
              className="text-xs tracking-wider uppercase text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-md transition-all active:scale-95"
            >
              Skip
            </button>
          </div>

          {/* Central Logo & Brand Experience */}
          <div className="flex flex-col items-center justify-center text-center px-6 z-10 my-auto">
            {/* Animated Swirl Emblem Container */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* Outer Pulse Rings */}
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-blue-400/40 blur-[1px]"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full border border-cyan-400/30"
              />

              {/* Glowing Swirl Icon Badge */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-5 bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(0,114,188,0.45)] flex items-center justify-center">
                <motion.img
                  src={withBasePath('/sdb-favicon.png')}
                  alt="SDB Bank Swirl"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_16px_rgba(0,114,188,0.7)]"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>

            {/* SDB Bank Full Horizontal Logo */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-4 bg-white/95 px-6 py-2.5 rounded-2xl shadow-xl shadow-blue-950/50 backdrop-blur-md"
            >
              <img
                src={withBasePath('/sdb-bank-logo.png')}
                alt="SDB Bank - SANASA Development Bank PLC"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </motion.div>

            {/* Edition Badge */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide uppercase shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>AutoScan AI • Motor Show Edition</span>
            </motion.div>

            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-white/90"
            >
              Vehicle Valuation & Lease Evaluator
            </motion.h1>
          </div>

          {/* Bottom Progress & Status Bar */}
          <div className="w-full max-w-sm px-6 pb-8 z-10 flex flex-col items-center">
            {/* Status Text */}
            <div className="w-full flex items-center justify-between text-xs text-slate-300 font-medium mb-2.5 px-0.5">
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                {statusText}
              </span>
              <span className="font-mono text-cyan-300 ml-2">{progress}%</span>
            </div>

            {/* Sleek Gradient Loader Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {/* Footer Trust Disclaimer */}
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Financial Services Partner • CBSL Regulated</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
