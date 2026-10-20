import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { withBasePath } from '../utils/basePath';
import {
  Camera,
  Coins,
  FileCheck,
  ChevronRight,
  Sparkles,
  User,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingScreenProps {
  onFinish: (registeredName?: string) => void;
}

const SLIDES = [
  {
    icon: Camera,
    iconColor: 'text-cyan-400',
    iconBg: 'from-cyan-500/20 to-blue-500/20',
    iconBorder: 'border-cyan-400/30',
    title: 'Scan Any Vehicle Instantly',
    description:
      'Point your camera at any car in the exhibition hall. AutoScan AI inspects body condition, paint quality, and fuel economy in seconds.',
    badge: 'Step 1 of 3',
  },
  {
    icon: Coins,
    iconColor: 'text-amber-400',
    iconBg: 'from-amber-500/20 to-orange-500/20',
    iconBorder: 'border-amber-400/30',
    title: 'Real Sri Lankan Market Price',
    description:
      'Instantly get LKR valuations sourced from Ikman.lk & Riyasewana. Know exactly what a vehicle is worth before you negotiate.',
    badge: 'Step 2 of 3',
  },
  {
    icon: FileCheck,
    iconColor: 'text-emerald-400',
    iconBg: 'from-emerald-500/20 to-teal-500/20',
    iconBorder: 'border-emerald-400/30',
    title: 'Fast-Track Lease Approval',
    description:
      'Generate your Pre-Approval Pass and claim the exclusive 13.25% p.a. promo rate at SDB Booth A-04 today!',
    badge: 'Step 3 of 3',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [view, setView] = useState<'slides' | 'register'>('slides');
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Auto-advance slides every 3.5s when on slides view
  useEffect(() => {
    if (view !== 'slides') return;
    const timer = setInterval(() => {
      setDirection(1);
      setSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [view, slide]);

  const goTo = (index: number) => {
    setDirection(index > slide ? 1 : -1);
    setSlide(index);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to register.');
      return;
    }
    setError('');
    onFinish(trimmed);
  };

  const current = SLIDES[slide];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-[#03152e] to-slate-950 text-white overflow-y-auto select-none py-6"
    >
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-md px-6 flex items-center justify-between z-10 shrink-0">
        <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
          AutoScan AI
        </span>
        <button
          onClick={() => onFinish()}
          className="text-xs tracking-wider uppercase text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-md transition-all active:scale-95"
        >
          Skip as Guest
        </button>
      </div>

      {/* Central Content */}
      <div className="my-auto flex flex-col items-center justify-center px-6 z-10 w-full max-w-md">
        {/* SDB Bank Logo Emblem */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-3 rounded-[2rem] border border-blue-400/30 blur-[2px]"
          />
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.05, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute -inset-1.5 rounded-[1.75rem] border border-cyan-400/20"
          />
          <motion.div
            className="relative px-7 py-3.5 bg-white/95 rounded-3xl shadow-[0_0_50px_rgba(0,114,188,0.5)] backdrop-blur-md border border-white/30"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={withBasePath('/sdb-bank-logo.png')}
              alt="SDB Bank - SANASA Development Bank PLC"
              className="h-9 sm:h-11 w-auto object-contain drop-shadow-sm"
            />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === 'slides' ? (
            <motion.div
              key="slides-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              {/* Edition Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide uppercase shadow-sm mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AutoScan AI • Motor Show Edition</span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white/90 mb-5 text-center">
                Vehicle Valuation &amp; Lease Evaluator
              </h1>

              {/* Slide Card */}
              <div className="relative w-full overflow-hidden" style={{ minHeight: 195 }}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={slide}
                    custom={direction}
                    initial={{ x: direction * 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -50, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col items-center text-center gap-3">
                      {/* Step badge */}
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                        {current.badge}
                      </span>

                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${current.iconBg} border ${current.iconBorder} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className={`w-6 h-6 ${current.iconColor}`} strokeWidth={1.8} />
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                          {current.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {current.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide Dots (Auto-advancing) */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      i === slide
                        ? 'w-6 h-2 bg-cyan-400'
                        : 'w-2 h-2 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full"
            >
              <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-2xl shadow-blue-950/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-300">
                    Quick Registration
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-1.5">
                  Enter Your Name
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Register to personalize your vehicle valuation report and instant SDB leasing pre-approval.
                </p>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-200">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="e.g. Kasun Perera"
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/70 border border-white/20 text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <span>•</span>
                        <span>{error}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-200 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Your name will appear on your official SDB Pre-Approval Pass.</span>
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#0077c8] via-[#0284c7] to-[#0095e8] hover:from-[#005f9e] hover:to-[#0077c8] text-white font-bold text-sm shadow-lg shadow-blue-900/50 transition-all active:scale-95"
                  >
                    <span>Go to Home</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setView('slides');
                    }}
                    className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Overview</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA / Register Button */}
      <div className="w-full max-w-md px-6 z-10 space-y-3 shrink-0">
        {view === 'slides' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('register')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#0077c8] via-[#0284c7] to-[#0095e8] hover:from-[#005f9e] hover:to-[#0077c8] text-white font-bold text-sm shadow-lg shadow-blue-900/50 border border-cyan-400/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

