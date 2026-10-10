import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  BatteryCharging,
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Play,
  Pause,
  FastForward,
  CheckCircle2,
  X,
  Share2,
  Volume2
} from 'lucide-react';
import { TrackingSession } from '../../types';
import { trackingApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

interface LiveTrackingModalProps {
  bookingId: string;
  bookingNumber?: string;
  serviceTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  bookingId,
  bookingNumber = 'FIX-839201',
  serviceTitle = 'Home Appliance Repair & Maintenance',
  isOpen,
  onClose,
  onOpenChat
}) => {
  const { socket } = useSocket();
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<1 | 2 | 4>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showArrivalToast, setShowArrivalToast] = useState(false);

  const prevStatusRef = useRef<string>('');

  // Play audio chime on arrival
  const playArrivalSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // AudioContext unavailable
    }
  };

  // Initial load
  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await trackingApi.getTrackingSession(bookingId);
        if (data) {
          setSession(data as TrackingSession);
          prevStatusRef.current = data.status;
        }
      } catch (err) {
        console.error('Failed to load tracking session', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [isOpen, bookingId]);

  // Socket.IO real-time tracking updates
  useEffect(() => {
    if (!isOpen || !bookingId || !socket) return;

    const handleUpdate = (updated: TrackingSession) => {
      if (updated && updated.bookingId === bookingId) {
        setSession(updated);
        if (updated.status === 'ARRIVED' && prevStatusRef.current !== 'ARRIVED') {
          playArrivalSound();
          setShowArrivalToast(true);
        }
        prevStatusRef.current = updated.status;
      }
    };

    socket.on(`tracking_${bookingId}`, handleUpdate);
    socket.on('global_tracking_update', handleUpdate);

    return () => {
      socket.off(`tracking_${bookingId}`, handleUpdate);
      socket.off('global_tracking_update', handleUpdate);
    };
  }, [isOpen, bookingId, socket]);

  // Simulation timer (advances technician movement smoothly)
  useEffect(() => {
    if (!isOpen || !isSimulating || !session || session.status === 'ARRIVED') return;

    const intervalMs = 3500 / simulationSpeed;
    const timer = setInterval(async () => {
      try {
        // Emit via socket or call REST endpoint
        if (socket && socket.connected) {
          socket.emit('technician_advance_simulation', { bookingId });
        } else {
          const res = await trackingApi.advanceSimulationStep(bookingId);
          if (res) {
            setSession((prev) => {
              if (!prev) return null;
              const nextStep = Math.min(prev.routeWaypoints.length - 1, prev.stepIndex + 1);
              const total = prev.routeWaypoints.length - 1;
              const wp = prev.routeWaypoints[nextStep];
              const isArrived = nextStep === total;
              if (isArrived && prev.status !== 'ARRIVED') {
                playArrivalSound();
                setShowArrivalToast(true);
              }
              return {
                ...prev,
                stepIndex: nextStep,
                currentProgressPercent: Math.round((nextStep / total) * 100),
                currentLat: wp.lat,
                currentLng: wp.lng,
                distanceRemainingKm: Math.max(0, Math.round((total - nextStep) * 0.6 * 10) / 10),
                etaMinutes: Math.max(0, (total - nextStep) * 3),
                status: isArrived ? 'ARRIVED' : nextStep === total - 1 ? 'NEAR_DOORSTEP' : 'ON_THE_WAY',
                speedKmH: isArrived ? 0 : Math.floor(28 + Math.random() * 12)
              };
            });
          }
        }
      } catch (e) {
        // Fallback simulation
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isSimulating, simulationSpeed, session?.stepIndex, session?.status, bookingId, socket]);

  const handleManualAdvance = async () => {
    if (!session) return;
    try {
      if (socket && socket.connected) {
        socket.emit('technician_advance_simulation', { bookingId });
      } else {
        await trackingApi.advanceSimulationStep(bookingId);
      }
    } catch (e) {
      // Local advance
    }
  };

  const handleInstantArrive = () => {
    if (!session) return;
    const total = session.routeWaypoints.length - 1;
    const wp = session.routeWaypoints[total];
    playArrivalSound();
    setShowArrivalToast(true);
    setSession({
      ...session,
      stepIndex: total,
      currentProgressPercent: 100,
      currentLat: wp.lat,
      currentLng: wp.lng,
      distanceRemainingKm: 0,
      etaMinutes: 0,
      speedKmH: 0,
      status: 'ARRIVED'
    });
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/my-bookings?track=${bookingId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  // Calculate SVG Coordinates for the map
  // Map dimensions: width=600, height=360
  // Default route points mapped into SVG viewBox:
  const svgWaypoints = [
    { x: 70, y: 300, name: 'MG Road Depot' },
    { x: 170, y: 250, name: 'Trinity Circle' },
    { x: 270, y: 210, name: 'Command Hosp' },
    { x: 370, y: 150, name: 'Domlur Flyover' },
    { x: 470, y: 110, name: '100ft Road' },
    { x: 530, y: 65, name: 'Customer Home' }
  ];

  const currentStep = session ? Math.min(session.stepIndex, svgWaypoints.length - 1) : 1;
  const currentVehiclePos = svgWaypoints[currentStep] || svgWaypoints[1];

  const getStatusBadge = () => {
    if (!session) return null;
    switch (session.status) {
      case 'ARRIVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white flex items-center space-x-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Arrived at Doorstep</span>
          </span>
        );
      case 'NEAR_DOORSTEP':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white flex items-center space-x-1.5 shadow-sm animate-pulse">
            <MapPin className="w-3.5 h-3.5" />
            <span>Approaching Your Gate</span>
          </span>
        );
      case 'ON_THE_WAY':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#0066FF] text-white flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>In Transit · Live GPS Active</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-600 text-white">
            Dispatched from Depot
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#FBF9F5] text-[#2C2620] rounded-3xl border border-[#E8E2D6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-white px-6 py-4 border-b border-[#EDE6DC] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5EFE6] border border-[#E8E2D6] flex items-center justify-center text-[#C58A49]">
              <Navigation className="w-5 h-5 text-[#C58A49] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-[#26211C] tracking-tight">
                  Where's your technician right now?
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EBF5EC] text-[#367A47] border border-[#CDE5D2]">
                  Live on the road
                </span>
              </div>
              <p className="text-xs text-[#7A7064]">
                Booking #{bookingNumber} · {serviceTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyShareLink}
              title="Share live tracking link"
              className="p-2 rounded-xl bg-[#FAF8F5] text-[#665D52] hover:text-[#26211C] hover:bg-[#F0EAE1] transition-colors text-xs flex items-center space-x-1 border border-[#E8E2D6]"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">
                {copiedLink ? 'Copied!' : 'Share Link'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#FAF8F5] text-[#7A7064] hover:text-[#26211C] hover:bg-[#F0EAE1] transition-colors border border-[#E8E2D6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Arrival Celebration Alert Banner */}
        {showArrivalToast && (
          <div className="bg-[#367A47] px-6 py-3 text-white flex items-center justify-between shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center space-x-2.5">
              <Volume2 className="w-5 h-5 shrink-0 animate-bounce" />
              <span className="text-sm font-bold">
                Ding-Dong! 🚪 Rajesh Sharma has arrived at your doorstep!
              </span>
            </div>
            <button
              onClick={() => setShowArrivalToast(false)}
              className="text-[#E0F2E5] hover:text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-white border-b border-[#EDE6DC]">
            {/* Status */}
            <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#8C8275] uppercase tracking-wider">
                Current Update
              </span>
              <div className="mt-1.5">{getStatusBadge()}</div>
            </div>

            {/* Estimated Arrival */}
            <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-3">
              <div className="flex items-center justify-between text-[#8C8275] text-[11px] font-bold uppercase tracking-wider">
                <span>Estimated Arrival</span>
                <Clock className="w-3.5 h-3.5 text-[#C58A49]" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black text-[#26211C]">
                  {session?.status === 'ARRIVED' ? '0' : session?.etaMinutes || '8'}
                </span>
                <span className="text-xs font-bold text-[#7A7064]">
                  {session?.status === 'ARRIVED' ? 'Arrived' : 'mins away'}
                </span>
              </div>
            </div>

            {/* Distance Remaining */}
            <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-3">
              <div className="flex items-center justify-between text-[#8C8275] text-[11px] font-bold uppercase tracking-wider">
                <span>Distance</span>
                <Compass className="w-3.5 h-3.5 text-[#D96B43]" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-2xl font-black text-[#26211C]">
                  {session?.status === 'ARRIVED' ? '0' : session?.distanceRemainingKm || '2.3'}
                </span>
                <span className="text-xs font-bold text-[#7A7064]">km remaining</span>
              </div>
            </div>

            {/* Live Speed & Battery */}
            <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-3">
              <div className="flex items-center justify-between text-[#8C8275] text-[11px] font-bold uppercase tracking-wider">
                <span>On The Road</span>
                <BatteryCharging className="w-3.5 h-3.5 text-[#4A7C59]" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-base font-black text-[#26211C]">
                  {session?.speedKmH || 32}{' '}
                  <span className="text-xs font-normal text-[#8C8275]">km/h</span>
                </span>
                <span className="text-xs font-bold text-[#367A47] bg-[#EAF5EC] px-2 py-0.5 rounded-lg border border-[#CDE5D2]">
                  {session?.technician?.batteryPercentage || 88}% EV
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Humanized City Map Canvas */}
          <div className="relative bg-[#f8fafc] h-80 sm:h-[400px] w-full overflow-hidden border-b border-slate-700/80 shadow-inner">
            {/* Soft Neighborhood Ambient Water & Park Gradients */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 600 360"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Route Gradients */}
                <linearGradient id="liveBlueRoute" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0066FF" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                <filter id="avatarDropShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* City Parks / Green Spaces (Soft Pastel Green) */}
              <path
                d="M 40 40 C 90 20, 160 50, 150 110 C 140 160, 60 140, 40 40 Z"
                fill="#e8f5e9"
                stroke="#c8e6c9"
                strokeWidth="1"
              />
              <path
                d="M 410 210 C 470 190, 540 220, 530 280 C 510 320, 430 310, 410 210 Z"
                fill="#e8f5e9"
                stroke="#c8e6c9"
                strokeWidth="1"
              />
              <path
                d="M 230 140 C 270 120, 310 135, 305 175 C 295 205, 240 195, 230 140 Z"
                fill="#f0fdf4"
                stroke="#dcfce7"
                strokeWidth="1"
              />

              {/* River / Lake Water Canal (Soft Blue) */}
              <path
                d="M 520 20 C 530 90, 560 180, 580 230 C 595 270, 560 320, 540 360"
                fill="none"
                stroke="#bae6fd"
                strokeWidth="22"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 520 20 C 530 90, 560 180, 580 230 C 595 270, 560 320, 540 360"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Base City Streets & Avenues (Soft Grey / White Roads) */}
              {/* Secondary Street Grid */}
              <path
                d="M 20 80 L 580 80 M 20 180 L 580 180 M 20 280 L 580 280 M 120 20 L 120 340 M 280 20 L 280 340 M 440 20 L 440 340"
                stroke="#e2e8f0"
                strokeWidth="4"
              />

              {/* Major Arterial Roads & Roundabouts */}
              <path
                d="M 30 310 C 130 300, 190 230, 270 230 C 370 230, 430 170, 570 150"
                stroke="#cbd5e1"
                strokeWidth="12"
                fill="none"
              />
              <path
                d="M 30 310 C 130 300, 190 230, 270 230 C 370 230, 430 170, 570 150"
                stroke="#ffffff"
                strokeWidth="8"
                fill="none"
              />

              <path
                d="M 90 30 C 170 130, 230 190, 310 330"
                stroke="#cbd5e1"
                strokeWidth="10"
                fill="none"
              />
              <path
                d="M 90 30 C 170 130, 230 190, 310 330"
                stroke="#ffffff"
                strokeWidth="6"
                fill="none"
              />

              {/* Roundabouts */}
              <circle cx="170" cy="250" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
              <circle cx="270" cy="210" r="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
              <circle cx="370" cy="150" r="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />

              {/* Neighborhood Soft Text Labels (Matching Valencia Reference Map) */}
              <text x="70" y="55" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">BENIFERRI</text>
              <text x="210" y="45" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">BENICALAP</text>
              <text x="390" y="45" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">BENIMACLET</text>
              <text x="80" y="210" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">MISLATA</text>
              <text x="260" y="175" fill="#64748b" fontSize="12" fontWeight="900" fontFamily="sans-serif">CENTRE</text>
              <text x="440" y="195" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ALGIRÓS</text>
              <text x="140" y="325" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">SAFRANAR</text>
              <text x="340" y="325" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">QUATRE CARRERES</text>

              {/* MULTIPLE COLORFUL ROUTES (Matching User's Reference Graphic) */}
              {/* Route 1: Alternative Green Express Corridor */}
              <path
                d="M 170 250 C 230 180, 330 130, 420 120 L 450 65"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Route 2: Orange Feeder Route Connecting Service Hubs */}
              <path
                d="M 120 310 C 180 320, 290 270, 330 240 C 390 190, 430 190, 480 140"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />

              {/* Route 3: ACTIVE BLUE NAVIGATION CORRIDOR (Technician Rajesh's Path) */}
              <polyline
                points="70,300 170,250 270,210 370,150 470,110 530,65"
                fill="none"
                stroke="#0066FF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="70,300 170,250 270,210 370,150 470,110 530,65"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 8"
                strokeLinecap="round"
                className="animate-[dash_1.8s_linear_infinite]"
              />

              {/* ORANGE CHARGING / FIXORA SERVICE HUB PINS (Matching User Image) */}
              {[
                { x: 140, y: 80, name: 'MG Road Depot Hub' },
                { x: 260, y: 70, name: 'North Power Hub' },
                { x: 380, y: 100, name: 'East Battery Station' },
                { x: 90, y: 160, name: 'West Quick Hub' },
                { x: 230, y: 270, name: 'South Central Hub' },
                { x: 490, y: 240, name: 'Indiranagar Hub' },
                { x: 380, y: 290, name: 'Koramangala Hub' }
              ].map((hub, idx) => (
                <g key={`hub-${idx}`} transform={`translate(${hub.x}, ${hub.y})`} filter="url(#avatarDropShadow)">
                  {/* Orange Station Body */}
                  <rect x="-10" y="-14" width="20" height="26" rx="4" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
                  {/* Black/White Lightning Electric Icon */}
                  <polygon points="0,-9 -4,-1 1,-1 -2,7 4,-1 -1,-1" fill="#ffffff" />
                  {/* Station base */}
                  <rect x="-12" y="10" width="24" height="4" rx="2" fill="#ea580c" />
                </g>
              ))}

              {/* COLORFUL CARS / VEHICLES SCATTERED (Matching User Image) */}
              {/* Cyan Taxi / EV */}
              <g transform="translate(190, 180) rotate(-15)">
                <rect x="-11" y="-6" width="22" height="12" rx="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="-4" y="-4" width="8" height="8" rx="2" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Red Car */}
              <g transform="translate(340, 190) rotate(25)">
                <rect x="-11" y="-6" width="22" height="12" rx="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="-4" y="-4" width="8" height="8" rx="2" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Pink Compact Car */}
              <g transform="translate(260, 240) rotate(-35)">
                <rect x="-10" y="-6" width="20" height="12" rx="4" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="-4" y="-4" width="8" height="8" rx="2" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Yellow Cab */}
              <g transform="translate(420, 130) rotate(10)">
                <rect x="-11" y="-6" width="22" height="12" rx="4" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="-4" y="-4" width="8" height="8" rx="2" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Green Service Van */}
              <g transform="translate(130, 240) rotate(40)">
                <rect x="-13" y="-7" width="26" height="14" rx="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="2" y="-5" width="7" height="10" rx="1.5" fill="#ffffff" opacity="0.8" />
              </g>

              {/* HUMAN COMMUNITY AVATARS (Matching the diverse illustrated faces in image) */}
              {[
                { x: 195, y: 125, role: 'Meera (Planner)', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
                { x: 310, y: 110, role: 'Kabir (Electrician)', img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100' },
                { x: 230, y: 205, role: 'Customer Elena', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
                { x: 380, y: 230, role: 'Ranveer (Caterer)', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100' },
                { x: 470, y: 275, role: 'Customer David', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
              ].map((person, idx) => (
                <g key={`person-${idx}`} transform={`translate(${person.x}, ${person.y})`} filter="url(#avatarDropShadow)">
                  <circle r="13" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                  <clipPath id={`clip-${idx}`}>
                    <circle r="11" />
                  </clipPath>
                  <image
                    href={person.img}
                    x="-11"
                    y="-11"
                    width="22"
                    height="22"
                    clipPath={`url(#clip-${idx})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              ))}

              {/* DESTINATION DOORSTEP: CUSTOMER (YOU) WITH WAVING BADGE */}
              <g transform="translate(530, 65)" filter="url(#avatarDropShadow)">
                <circle r="20" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                <circle r="16" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                <clipPath id="customerHomeClip">
                  <circle r="13" />
                </clipPath>
                <image
                  href="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  x="-13"
                  y="-13"
                  width="26"
                  height="26"
                  clipPath="url(#customerHomeClip)"
                  preserveAspectRatio="xMidYMid slice"
                />
                {/* Floating "Your Home" Tag */}
                <g transform="translate(0, -22)">
                  <rect x="-38" y="-10" width="76" height="17" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                  <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                    YOU (Home)
                  </text>
                </g>
              </g>

              {/* LIVE MOVING TECHNICIAN VEHICLE & SMILING FACE (Rajesh Sharma) */}
              <g
                transform={`translate(${currentVehiclePos.x}, ${currentVehiclePos.y})`}
                className="transition-all duration-700 ease-in-out"
                filter="url(#avatarDropShadow)"
              >
                {/* Radar Waves */}
                <circle r="28" fill="#0066FF" fillOpacity="0.18" className="animate-ping origin-center" />
                <circle r="18" fill="#0066FF" fillOpacity="0.3" />

                {/* Scooter / Car Body (Electric Blue) */}
                <rect x="-14" y="-8" width="28" height="16" rx="6" fill="#0066FF" stroke="#ffffff" strokeWidth="2.5" />

                {/* Smiling Avatar of Rajesh embedded directly inside marker */}
                <circle cx="0" cy="-14" r="13" fill="#ffffff" stroke="#0066FF" strokeWidth="2.5" />
                <clipPath id="rajeshLiveClip">
                  <circle cx="0" cy="-14" r="10.5" />
                </clipPath>
                <image
                  href={session?.technician?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100'}
                  x="-11"
                  y="-25"
                  width="22"
                  height="22"
                  clipPath="url(#rajeshLiveClip)"
                  preserveAspectRatio="xMidYMid slice"
                />

                {/* Live Speed & Name Tag */}
                <g transform="translate(0, -36)">
                  <rect
                    x="-50"
                    y="-11"
                    width="100"
                    height="19"
                    rx="9"
                    fill="#0f172a"
                    stroke="#0066FF"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {session?.status === 'ARRIVED' ? '🎉 RAJESH ARRIVED!' : `🛵 RAJESH (${session?.speedKmH || 32} km/h)`}
                  </text>
                </g>
              </g>
            </svg>

            {/* Street Map Overlay Labels */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Street Transit
                </p>
                <p className="text-xs font-black text-slate-900">
                  Indiranagar 100ft Rd ➔ Prestige Palms Gate
                </p>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center space-x-2 text-right">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-[11px] font-bold text-slate-700">
                Fixora EV Service Hubs Active
              </span>
            </div>
          </div>

          {/* Technician Profile & Direct Contact Card */}
          {/* Technician Profile & Direct Contact Card */}
          <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EDE6DC]">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={
                    session?.technician?.avatar ||
                    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
                  }
                  alt="Technician"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E8E2D6] shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#367A47] text-white p-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-[#26211C]">
                    {session?.technician?.name || 'Rajesh Sharma'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF2E6] text-[#B87028] border border-[#ECD9BF]">
                    ★ {session?.technician?.rating || 4.92} (340+ Jobs)
                  </span>
                </div>
                <p className="text-xs text-[#7A7064] mt-0.5">
                  Vehicle: {session?.technician?.vehicleModel} · Reg:{' '}
                  <span className="font-mono text-[#26211C] font-semibold">
                    {session?.technician?.vehicleNumber}
                  </span>
                </p>
                <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-[#367A47] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#367A47]" />
                  <span>Vaccinated & Fixora Background Verified</span>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <a
                href={`tel:${session?.technician?.phone || '+919845077122'}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#26211C] text-xs font-bold transition-all border border-[#E8E2D6] shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-[#367A47]" />
                <span>Call Technician</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat();
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>In-App Chat</span>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Control Bar */}
          <div className="p-4 bg-[#FAF7F2] flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#EDE6DC]">
            <div className="flex items-center space-x-2 text-[#7A7064]">
              <Sparkles className="w-4 h-4 text-[#C58A49]" />
              <span className="font-bold text-[#26211C]">Live Simulation Control:</span>
              <span className="text-[#7A7064]">
                Test the real-time movement and arrival alert right in browser
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                  isSimulating
                    ? 'bg-[#FAF2E6] text-[#B87028] border border-[#ECD9BF]'
                    : 'bg-white text-[#574E43] border border-[#E8E2D6] hover:bg-[#F7F3EC]'
                }`}
              >
                {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isSimulating ? 'Pause Motion' : 'Resume Motion'}</span>
              </button>

              <div className="flex items-center bg-white rounded-xl p-0.5 border border-[#E8E2D6]">
                {([1, 2, 4] as (1 | 2 | 4)[]).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimulationSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      simulationSpeed === spd
                        ? 'bg-[#26211C] text-white'
                        : 'text-[#7A7064] hover:text-[#26211C]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleManualAdvance}
                disabled={session?.status === 'ARRIVED'}
                title="Advance to next road junction"
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F7F3EC] text-[#3D352E] text-xs font-bold border border-[#E8E2D6] disabled:opacity-50"
              >
                Next Step
              </button>

              <button
                onClick={handleInstantArrive}
                disabled={session?.status === 'ARRIVED'}
                className="px-3 py-1.5 rounded-xl bg-[#367A47] hover:bg-[#2C6339] text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
              >
                Instant Arrive
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] px-6 py-3 border-t border-[#EDE6DC] flex items-center justify-between text-[11px] text-[#7A7064]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#367A47]" />
            <span>Encrypted Socket.IO Geofence · Accuracy: ± 2.4 meters</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-[#26211C] hover:text-[#C58A49] transition-colors"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
