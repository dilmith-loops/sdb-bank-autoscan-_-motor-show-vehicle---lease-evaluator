import React, { useRef, useState, useEffect } from 'react';
import { Camera, SwitchCamera, Upload, Sparkles, AlertCircle, RefreshCw, Car, ChevronRight } from 'lucide-react';

interface ScannerViewProps {
  onScanImage: (base64Data: string, mimeType: string) => void;
  isAnalyzing: boolean;
  isGuest: boolean;
  onOpenProfile: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanImage,
  isAnalyzing,
  isGuest,
  onOpenProfile,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. You can still upload vehicle photos to evaluate.'
          : 'Camera unavailable in this browser context. Please use photo upload.'
      );
      setCameraActive(false);
    }
  };

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Flip camera between back/front
  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Capture frame from active camera
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL('image/jpeg', 0.85);
    onScanImage(base64Data, 'image/jpeg');
  };

  // Handle uploaded photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onScanImage(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };


  return (
    <div className="flex flex-col gap-5">
      {/* Guest scan reminder banner */}
      {isGuest && (
        <div
          onClick={onOpenProfile}
          className="p-3 rounded-2xl flex items-center justify-between gap-3 text-xs border cursor-pointer transition-all bg-gradient-to-r from-blue-50 to-amber-50/60 border-blue-200/80 hover:border-[#0077c8]"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0077c8] text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Guest Mode: Unlimited Vehicle Scans</div>
              <div className="text-[11px] text-slate-500">
                Scan any car now. Complete your financial profile anytime for lease pre-approvals.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0077c8] shrink-0">
            <span>Add Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Main Viewfinder Card */}
      <div
        className={`relative bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800 ${
          cameraActive
            ? 'aspect-[4/3] sm:aspect-[16/10] max-h-[460px]'
            : 'min-h-[340px] sm:min-h-[380px]'
        } flex items-center justify-center`}
      >
        {/* Active video stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {/* Camera inactive / placeholder screen */}
        {!cameraActive && (
          <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center py-7 px-5 sm:p-7 text-center text-white">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#0077c8] animate-pulse">
                <Car className="w-7 h-7 sm:w-9 sm:h-9 text-[#0077c8]" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold font-heading mb-1 text-slate-100">
              SDB Bank AI Vehicle Scanner
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs sm:max-w-sm mb-4 sm:mb-5 leading-relaxed">
              Point your phone camera at any car at the Motor Show to verify specs, condition, Sri Lankan market value, and personalized SDB lease rentals.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full max-w-xs sm:max-w-none">
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="flex items-center justify-center gap-2 bg-[#0077c8] hover:bg-[#005f9e] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Vehicle Photo</span>
              </button>
            </div>

            {cameraError && (
              <div className="mt-3.5 p-2.5 bg-rose-950/60 border border-rose-800/60 rounded-xl text-[11px] text-rose-300 max-w-sm flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Viewfinder Target Overlays when camera is active */}
        {cameraActive && (
          <>
            {/* Viewport Reticle Corners */}
            <div className="absolute inset-8 sm:inset-12 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-3 border-l-3 border-[#0077c8] rounded-tl-lg" />
                <div className="w-8 h-8 border-t-3 border-r-3 border-[#0077c8] rounded-tr-lg" />
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-3 border-l-3 border-[#0077c8] rounded-bl-lg" />
                <div className="w-8 h-8 border-b-3 border-r-3 border-[#0077c8] rounded-br-lg" />
              </div>
            </div>

            {/* Laser scanning line animation */}
            <div className="absolute inset-x-8 sm:inset-x-12 top-8 sm:top-12 bottom-8 sm:bottom-12 overflow-hidden pointer-events-none">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce duration-1000" />
            </div>

            {/* Guidance pill */}
            <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Frame vehicle (front, 3/4 side, or badge)</span>
              </div>
            </div>

            {/* In-viewfinder camera controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCamera}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-transform active:scale-90"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom snap action bar */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 px-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                title="Upload Photo"
              >
                <Upload className="w-5 h-5" />
              </button>

              {/* Shutter button */}
              <button
                type="button"
                onClick={captureSnapshot}
                disabled={isAnalyzing}
                className="relative p-1 rounded-full bg-white/30 border-2 border-white backdrop-blur-sm transition-transform active:scale-90"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0077c8] to-[#0284c7] flex items-center justify-center text-white shadow-xl">
                  <Camera className="w-7 h-7" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                title="Restart Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Loading / Analyzing Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0077c8]/20 border border-[#0077c8]/40 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#0077c8] animate-spin" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
            </div>

            <h4 className="text-base font-bold font-heading mb-1 text-white">
              AI Analyzing Vehicle...
            </h4>
            <div className="text-xs text-slate-300 space-y-1">
              <p className="animate-pulse">Inspecting body condition, paint luster & alloy wear...</p>
              <p className="text-[11px] text-slate-400">Benchmarking Colombo market prices & SDB lease rates</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

    </div>
  );
};
