import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Zap,
  CheckCircle,
  X,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { paymentsApi } from '../../services/api';

export interface RazorpayPaymentResult {
  paymentId: string;
  orderId: string;
  signature?: string;
  amount: number;
  method: string;
  timestamp: string;
  receiptUrl?: string;
}

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: RazorpayPaymentResult) => void;
  amount: number;
  bookingId?: string;
  bookingNumber?: string;
  serviceName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}

type PaymentTab = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'PAYLATER';

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  bookingId,
  bookingNumber,
  serviceName = 'Fixora Home Service',
  customerName = 'Demo Customer',
  customerEmail = 'customer@fixora.com',
  customerPhone = '+91 98765 43210',
  description = 'Verified Technician & Service Booking'
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('UPI');
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'OTP' | 'SUCCESS'>('SELECT');
  const [processingMsg, setProcessingMsg] = useState('Contacting banking network...');
  
  // Dummy Order details
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Form states
  // UPI
  const [upiMethod, setUpiMethod] = useState<'APP' | 'QR' | 'VPA'>('QR');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [vpaInput, setVpaInput] = useState('');
  const [qrCountdown, setQrCountdown] = useState(599);

  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName);
  const [saveCard, setSaveCard] = useState(true);

  // Netbanking
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // PayLater
  const [selectedPayLater, setSelectedPayLater] = useState('Simpl');

  // OTP Simulation
  const [otpValue, setOtpValue] = useState('482910');

  // Initialize order on open
  useEffect(() => {
    if (isOpen) {
      const generatedOrderId = 'order_rzp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
      setOrderId(generatedOrderId);
      setStep('SELECT');
      setQrCountdown(599);
      // Auto pre-fill demo card info
      setCardNumber('4111 2222 3333 4444');
      setCardExpiry('12/28');
      setCardCvv('888');
      setCardHolder(customerName);
      setVpaInput('fixora.customer@okhdfcbank');
    }
  }, [isOpen, customerName]);

  // QR Timer Countdown
  useEffect(() => {
    if (!isOpen || step !== 'SELECT' || activeTab !== 'UPI' || upiMethod !== 'QR') return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 599));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step, activeTab, upiMethod]);

  // Audio Chime synthesizer via Web Audio API
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Pleasant two-tone chime (587.33Hz D5 -> 880Hz A5)
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);
    } catch {
      // Ignore audio policy restrictions
    }
  };

  if (!isOpen) return null;

  const formattedAmount = (amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const getMethodDisplay = () => {
    switch (activeTab) {
      case 'UPI':
        return upiMethod === 'QR' ? 'UPI Dynamic QR' : upiMethod === 'APP' ? `UPI (${selectedUpiApp})` : `UPI ID (${vpaInput})`;
      case 'CARD':
        return `Card ending in ${cardNumber.replace(/\s+/g, '').slice(-4) || '4444'}`;
      case 'NETBANKING':
        return `Netbanking (${selectedBank})`;
      case 'WALLET':
        return `Wallet (${selectedWallet})`;
      case 'PAYLATER':
        return `Pay Later (${selectedPayLater})`;
      default:
        return 'Razorpay Online';
    }
  };

  const handleStartPayment = () => {
    setStep('PROCESSING');
    setProcessingMsg('Initiating secure channel with Razorpay Gateway...');

    setTimeout(() => {
      setProcessingMsg('Simulating 3D Secure / Bank OTP authentication...');
      setTimeout(() => {
        // Show OTP step for cards or netbanking, or direct success for QR/1-click UPI
        if (activeTab === 'CARD' || activeTab === 'NETBANKING') {
          setStep('OTP');
        } else {
          completePaymentSuccess();
        }
      }, 1000);
    }, 1200);
  };

  const completePaymentSuccess = async () => {
    setStep('PROCESSING');
    setProcessingMsg('Finalizing authorization & generating digital receipt...');

    const genPaymentId = 'pay_rzp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
    setPaymentId(genPaymentId);

    try {
      // Notify backend of payment
      await paymentsApi.processPayment({
        bookingId: bookingId || 'standalone',
        amount,
        method: 'RAZORPAY',
        razorpayPaymentId: genPaymentId,
        razorpayOrderId: orderId,
        description
      });
    } catch (e) {
      console.warn('Backend payment sync fallback:', e);
    }

    setTimeout(() => {
      playSuccessChime();
      setStep('SUCCESS');
    }, 1000);
  };

  const handleFinishAndProceed = () => {
    onSuccess({
      paymentId,
      orderId,
      amount,
      method: getMethodDisplay(),
      timestamp: new Date().toISOString(),
      receiptUrl: `https://fixora.local/receipts/${paymentId}.pdf`
    });
    onClose();
  };

  const formatQrTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* ========================================================= */}
        {/* RAZORPAY BRANDED TOP BAR */}
        {/* ========================================================= */}
        <div className="bg-[#0c1b33] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            {/* Razorpay Brand Mark */}
            <div className="flex items-center space-x-1.5 bg-blue-600/30 border border-blue-400/40 px-2.5 py-1 rounded-lg">
              <svg className="w-4 h-4 text-sky-400 fill-current" viewBox="0 0 24 24">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.884.807-1.482 2.227-1.482 1.554 0 2.82.684 3.447 1.157l1.378-2.115C16.643 3.435 14.887 2.7 12.827 2.7c-3.144 0-5.26 1.76-5.26 4.39 0 2.454 1.83 3.684 4.57 4.707 2.378.89 3.125 1.585 3.125 2.518 0 1.056-.99 1.696-2.58 1.696-1.87 0-3.352-.835-4.2-1.468l-1.39 2.197c1.196.942 3.167 1.833 5.57 1.833 3.436 0 5.617-1.782 5.617-4.664 0-2.316-1.636-3.69-4.303-4.759z" />
              </svg>
              <span className="text-xs font-black tracking-wider text-sky-300 uppercase">Razorpay</span>
            </div>

            {/* Sandbox / Test Mode Indicator */}
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-pulse"></span>
              <span>Test Mode</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-medium">Secured by</span>
              <span className="text-xs font-bold text-sky-400 flex items-center justify-end space-x-1">
                <Lock className="w-3 h-3" />
                <span>256-Bit SSL</span>
              </span>
            </div>

            {step !== 'PROCESSING' && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="Cancel Transaction"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MERCHANT & ORDER SUMMARY HEADER */}
        {/* ========================================================= */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              FX
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-extrabold text-slate-900">Fixora Home Services</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{serviceName}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Amount to Pay
            </span>
            <div className="flex items-baseline space-x-1 text-slate-900">
              <span className="text-xs font-bold text-slate-500">₹</span>
              <span className="text-xl sm:text-2xl font-black text-brand-600">{formattedAmount}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: PAYMENT METHOD SELECTOR */}
        {/* ========================================================= */}
        {step === 'SELECT' && (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
            {/* Left Nav: Payment Methods */}
            <div className="md:col-span-4 bg-slate-50/70 border-r border-slate-200/80 p-2 sm:p-3 space-y-1">
              <span className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Options
              </span>

              {/* UPI */}
              <button
                type="button"
                onClick={() => setActiveTab('UPI')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                  activeTab === 'UPI'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR Code</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === 'UPI' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  Instant
                </span>
              </button>

              {/* Cards */}
              <button
                type="button"
                onClick={() => setActiveTab('CARD')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                  activeTab === 'CARD'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Cards (Debit/Credit)</span>
                </div>
                <span className="text-[10px] opacity-70">Visa/MC</span>
              </button>

              {/* Netbanking */}
              <button
                type="button"
                onClick={() => setActiveTab('NETBANKING')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                  activeTab === 'NETBANKING'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Building className="w-4 h-4" />
                  <span>Netbanking</span>
                </div>
              </button>

              {/* Wallets */}
              <button
                type="button"
                onClick={() => setActiveTab('WALLET')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                  activeTab === 'WALLET'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Wallet className="w-4 h-4" />
                  <span>Wallets</span>
                </div>
              </button>

              {/* Pay Later / EMI */}
              <button
                type="button"
                onClick={() => setActiveTab('PAYLATER')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                  activeTab === 'PAYLATER'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4" />
                  <span>Pay Later / EMI</span>
                </div>
              </button>

              <div className="pt-3 px-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                  <div className="flex items-center font-bold space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Razorpay Dummy Mode</span>
                  </div>
                  <p className="text-[10px] text-amber-700 leading-snug">
                    Simulates actual Indian banking transactions with auto-receipts. No real card required.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel: Content for selected method */}
            <div className="md:col-span-8 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
              {/* -------------------- TAB: UPI -------------------- */}
              {activeTab === 'UPI' && (
                <div className="space-y-4">
                  {/* UPI Sub-Tabs */}
                  <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setUpiMethod('QR')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${
                        upiMethod === 'QR' ? 'bg-white shadow-sm text-brand-700 font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      Instant QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMethod('APP')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${
                        upiMethod === 'APP' ? 'bg-white shadow-sm text-brand-700 font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      UPI Apps
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMethod('VPA')}
                      className={`flex-1 py-1.5 rounded-lg transition-all ${
                        upiMethod === 'VPA' ? 'bg-white shadow-sm text-brand-700 font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      UPI ID / VPA
                    </button>
                  </div>

                  {/* QR VIEW */}
                  {upiMethod === 'QR' && (
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                      <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                        {/* Real-looking SVG QR Code */}
                        <svg className="w-40 h-40 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          {/* Corner Squares */}
                          <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="11" y="11" width="13" height="13" />
                          <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="76" y="11" width="13" height="13" />
                          <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                          <rect x="11" y="76" width="13" height="13" />
                          {/* Matrix Pattern dots */}
                          <rect x="36" y="8" width="5" height="5" />
                          <rect x="46" y="8" width="5" height="5" />
                          <rect x="56" y="14" width="5" height="5" />
                          <rect x="36" y="24" width="5" height="5" />
                          <rect x="46" y="28" width="5" height="5" />
                          <rect x="56" y="34" width="5" height="5" />
                          <rect x="8" y="38" width="5" height="5" />
                          <rect x="18" y="44" width="5" height="5" />
                          <rect x="28" y="38" width="5" height="5" />
                          <rect x="8" y="54" width="5" height="5" />
                          <rect x="22" y="58" width="5" height="5" />
                          <rect x="74" y="38" width="5" height="5" />
                          <rect x="84" y="46" width="5" height="5" />
                          <rect x="70" y="56" width="5" height="5" />
                          <rect x="88" y="62" width="5" height="5" />
                          <rect x="38" y="74" width="5" height="5" />
                          <rect x="48" y="82" width="5" height="5" />
                          <rect x="60" y="74" width="5" height="5" />
                          <rect x="76" y="82" width="5" height="5" />
                          <rect x="86" y="78" width="5" height="5" />
                          <rect x="44" y="44" width="12" height="12" rx="2" fill="#0066FF" />
                        </svg>

                        {/* Center Razorpay Badge */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 rounded-lg bg-[#0c1b33] border-2 border-white flex items-center justify-center shadow-lg">
                            <span className="text-[10px] font-black text-sky-400">Rzp</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-800">
                          <span>Scan with any UPI app</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-amber-600 font-mono text-[11px] font-semibold">
                            Expires in {formatQrTime(qrCountdown)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Google Pay • PhonePe • Paytm • BHIM • Cred
                        </p>
                      </div>

                      {/* Fast Simulation Button */}
                      <button
                        type="button"
                        onClick={handleStartPayment}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>✨ Simulate Instant Scan & Pay (₹{formattedAmount})</span>
                      </button>
                    </div>
                  )}

                  {/* UPI APPS */}
                  {upiMethod === 'APP' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700">Select Preferred UPI App</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { name: 'Google Pay', tag: 'GPay UPI', color: 'from-blue-500 to-sky-500' },
                          { name: 'PhonePe', tag: 'Direct BHIM', color: 'from-purple-600 to-indigo-600' },
                          { name: 'Paytm UPI', tag: 'Instant Wallet', color: 'from-cyan-600 to-blue-600' },
                          { name: 'CRED UPI', tag: 'Cashback Active', color: 'from-slate-900 to-slate-800' }
                        ].map((app) => (
                          <button
                            key={app.name}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.name)}
                            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                              selectedUpiApp === app.name
                                ? 'border-brand-600 bg-brand-50/60 shadow-sm'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{app.name}</span>
                              <span className="text-[10px] text-slate-500">{app.tag}</span>
                            </div>
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                              selectedUpiApp === app.name ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                            }`}>
                              {selectedUpiApp === app.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* UPI VPA */}
                  {upiMethod === 'VPA' && (
                    <div className="space-y-3 text-xs">
                      <label className="block font-bold text-slate-700">Enter UPI ID / VPA</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={vpaInput}
                          onChange={(e) => setVpaInput(e.target.value)}
                          placeholder="username@bank"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-600 font-mono"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['@okhdfcbank', '@okaxis', '@paytm', '@ybl'].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setVpaInput(vpaInput.split('@')[0] + h)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-600"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------- TAB: CARDS -------------------- */}
              {activeTab === 'CARD' && (
                <div className="space-y-4">
                  {/* Virtual Card Preview */}
                  <div className="relative rounded-2xl p-4 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl overflow-hidden border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-9 h-7 rounded-md bg-amber-400/90 flex items-center justify-center">
                        <div className="w-7 h-5 border border-amber-600/60 rounded flex items-center justify-center">
                          <div className="w-4 h-2 border-t border-b border-amber-700/50"></div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-sky-400 tracking-wider">VISA / RuPay</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm sm:text-base font-mono tracking-widest text-slate-100">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase">Cardholder</span>
                          <span className="font-bold">{cardHolder || 'CUSTOMER NAME'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase">Expires</span>
                          <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700">Card Number</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber('4111 2222 3333 4444');
                            setCardExpiry('12/28');
                            setCardCvv('888');
                          }}
                          className="text-[10px] font-bold text-brand-600 hover:underline"
                        >
                          Autofill Demo Card
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-brand-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Valid Thru (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-brand-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-brand-600"
                        />
                      </div>
                    </div>

                    <label className="flex items-center space-x-2 text-[11px] text-slate-600 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>Save card securely according to RBI guidelines</span>
                    </label>
                  </div>
                </div>
              )}

              {/* -------------------- TAB: NETBANKING -------------------- */}
              {activeTab === 'NETBANKING' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Popular Indian Banks</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: 'HDFC Bank', code: 'HDFC' },
                      { name: 'ICICI Bank', code: 'ICICI' },
                      { name: 'State Bank of India', code: 'SBI' },
                      { name: 'Axis Bank', code: 'AXIS' },
                      { name: 'Kotak Mahindra', code: 'KOTAK' },
                      { name: 'Punjab National Bank', code: 'PNB' }
                    ].map((bank) => (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${
                          selectedBank === bank.name
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{bank.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">{bank.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------- TAB: WALLETS -------------------- */}
              {activeTab === 'WALLET' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Select Digital Wallet</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'MobiKwik'].map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                          selectedWallet === wallet
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------- TAB: PAYLATER -------------------- */}
              {activeTab === 'PAYLATER' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Buy Now, Pay Later</label>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Simpl', desc: 'Pay bill in 15 days, 0% interest' },
                      { name: 'LazyPay', desc: 'Credit line up to ₹1,00,000' },
                      { name: 'ICICI PayLater', desc: 'Direct digital net banking credit' }
                    ].map((pl) => (
                      <button
                        key={pl.name}
                        type="button"
                        onClick={() => setSelectedPayLater(pl.name)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          selectedPayLater === pl.name
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">{pl.name}</span>
                          <span className="text-[10px] text-slate-500">{pl.desc}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION PAY BUTTON */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-between"
                >
                  <span className="flex items-center space-x-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{formattedAmount}</span>
                  </span>
                  <span className="text-xs font-bold opacity-90 flex items-center space-x-1">
                    <span>Razorpay Secure</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>

                <p className="text-[10px] text-center text-slate-400 mt-2">
                  By clicking Pay, you agree to Fixora & Razorpay Terms of Service.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: PROCESSING OVERLAY */}
        {/* ========================================================= */}
        {step === 'PROCESSING' && (
          <div className="p-10 flex flex-col items-center justify-center space-y-5 text-center flex-1 min-h-[380px]">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="w-20 h-20 rounded-full border-4 border-brand-200 animate-ping opacity-30 absolute inset-0" />
              {/* Spinning Razorpay ring */}
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin flex items-center justify-center">
                <Lock className="w-8 h-8 text-brand-600" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-lg font-black text-slate-900">Processing Razorpay Payment</h3>
              <p className="text-xs text-slate-500 font-medium">{processingMsg}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-[11px] text-slate-600 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 text-brand-600 animate-spin" />
              <span>Please do not press back or refresh the window.</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: SIMULATED BANK 3D SECURE OTP */}
        {/* ========================================================= */}
        {step === 'OTP' && (
          <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Building className="w-3.5 h-3.5" />
                <span>Issuer Bank 3D Secure Verification</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Enter One-Time Password</h3>
              <p className="text-xs text-slate-500">
                A 6-digit OTP has been dispatched to your registered mobile number ending with <span className="font-bold text-slate-800">•••• 4210</span>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  className="w-48 text-center tracking-[0.5em] text-2xl font-mono font-black py-2.5 px-4 rounded-xl border-2 border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 px-2">
                <span>Resend OTP in 0:28</span>
                <span className="font-bold text-slate-700">Merchant: Fixora</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={completePaymentSuccess}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all text-xs"
              >
                Submit OTP & Authorize ₹{formattedAmount}
              </button>

              <button
                type="button"
                onClick={completePaymentSuccess}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                ⚡ Fast Auto-Approve (Demo Mode)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: CELEBRATORY SUCCESS STATE & RECEIPT */}
        {/* ========================================================= */}
        {step === 'SUCCESS' && (
          <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-center items-center text-center">
            {/* Animated Checkmark Badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce duration-1000">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Verified via Razorpay</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">₹{formattedAmount} Paid Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Your transaction has been confirmed. The technician / partner pro has received payment confirmation.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full max-w-md bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs text-left space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Razorpay Payment ID</span>
                <div className="flex items-center space-x-1">
                  <span className="font-mono font-bold text-slate-900">{paymentId}</span>
                  <button
                    onClick={() => copyToClipboard(paymentId)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Copy Payment ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Razorpay Order ID</span>
                <span className="font-mono font-medium text-slate-700">{orderId}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Channel</span>
                <span className="font-semibold text-slate-800">{getMethodDisplay()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{serviceName}</span>
              </div>

              {bookingNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Booking Reference</span>
                  <span className="font-bold text-brand-600">{bookingNumber}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>View Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={handleFinishAndProceed}
                className="py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/25 transition-all"
              >
                <span>Continue & Done</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* DIGITAL TAX RECEIPT MODAL POPUP */}
      {/* ========================================================= */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-slate-900">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block">
                  Official Digital Receipt
                </span>
                <h4 className="text-lg font-black text-slate-900">Fixora Marketplace Tax Invoice</h4>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Invoice No:</span>
                  <span className="font-bold">INV-{paymentId.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Payment Ref:</span>
                  <span className="font-bold">{paymentId}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Date & Time:</span>
                  <span>{new Date().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">{serviceName}</span>
                  <span className="font-bold">₹{formattedAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform & Safety Fee</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Integrated GST (18%)</span>
                  <span>₹{(amount * 0.18).toFixed(2)} (Incl.)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                  <span>Total Amount Paid</span>
                  <span className="text-brand-600">₹{formattedAmount}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day Fixora Quality Guarantee Active for this order</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
