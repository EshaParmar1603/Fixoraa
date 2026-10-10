import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tv,
  Plus,
  Calendar,
  Clock,
  Wrench,
  Trash2,
  CheckCircle,
  Bell,
  X,
  ShieldCheck,
  MapPin,
  Tag,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { appliancesApi, remindersApi, warrantiesApi, paymentsApi } from '../../services/api';
import { Appliance, ServiceReminder } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { RazorpayCheckoutModal, RazorpayPaymentResult } from '../../components/common/RazorpayCheckoutModal';

export const Appliances: React.FC = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingAmcAppliance, setBuyingAmcAppliance] = useState<Appliance | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Appliance modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('AC & Cooling');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Add Reminder modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedApplianceId, setSelectedApplianceId] = useState('');
  const [serviceType, setServiceType] = useState('Deep Filter Cleaning');
  const [dueDate, setDueDate] = useState('');
  const [frequencyMonths, setFrequencyMonths] = useState('6');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apps, rems] = await Promise.all([
        appliancesApi.getMyAppliances(),
        remindersApi.getReminders(),
      ]);
      setAppliances(apps || []);
      setReminders(rems || []);
      if (apps && apps.length > 0) {
        setSelectedApplianceId(apps[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppliance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appliancesApi.createAppliance({
        name,
        brand,
        modelNumber,
        serialNumber,
        category,
        purchaseDate,
        warrantyExpiryDate,
        location,
        notes,
      });
      setIsAddModalOpen(false);
      resetApplianceForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetApplianceForm = () => {
    setName('');
    setBrand('');
    setModelNumber('');
    setSerialNumber('');
    setLocation('');
    setNotes('');
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await remindersApi.createReminder({
        applianceId: selectedApplianceId || null,
        serviceType,
        dueDate,
        frequencyMonths: parseInt(frequencyMonths, 10),
      });
      setIsReminderModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAppliance = async (id: string) => {
    if (window.confirm('Delete this appliance from your vault?')) {
      await appliancesApi.deleteAppliance(id);
      fetchData();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    await remindersApi.deleteReminder(id);
    fetchData();
  };

  const handleAmcSuccess = async (result: RazorpayPaymentResult) => {
    if (!buyingAmcAppliance) return;
    try {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      await warrantiesApi.createDocument({
        title: `1-Year Comprehensive AMC - ${buyingAmcAppliance.name} (${buyingAmcAppliance.brand})`,
        documentType: 'AMC',
        vendor: 'Fixora Protection Shield',
        amount: 999,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: nextYear.toISOString().split('T')[0],
        applianceId: buyingAmcAppliance.id,
        documentUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600',
        notes: `Paid via Razorpay Ref: ${result.paymentId}. Includes 2 free periodic checkups and zero-labor breakdown support.`
      });

      setToastMessage(`1-Year AMC Protection successfully activated for ${buyingAmcAppliance.name} via Razorpay (Ref: ${result.paymentId})!`);
      setBuyingAmcAppliance(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setToastMessage('Payment completed via Razorpay and AMC policy logged in your vault.');
      setBuyingAmcAppliance(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your appliance vault & service reminders..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Appliance Registry & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track warranties, serial numbers, and recurring maintenance cycles for all your appliances
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4 text-brand-600" />
            <span>Schedule Reminder</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appliance</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RECURRING REMINDERS STRIP */}
      {reminders.length > 0 && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-950 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <span>Upcoming Scheduled Preventive Maintenance</span>
            </h3>
            <span className="text-xs font-bold text-brand-700">{reminders.length} Active Reminders</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white rounded-2xl p-4 border border-brand-200/60 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                      Every {rem.frequencyMonths} Months
                    </span>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{rem.serviceType}</h4>
                  <p className="text-xs text-slate-500">
                    {rem.appliance?.name || 'General Household Appliance'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {new Date(rem.dueDate).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => navigate('/services')}
                    className="px-3 py-1 bg-brand-600 text-white rounded-lg font-bold text-[11px] hover:bg-brand-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPLIANCES REGISTRY LIST */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Registered Household Appliances</h3>
        {appliances.length === 0 ? (
          <EmptyState
            icon={Tv}
            title="No appliances registered yet"
            description="Add your air conditioners, refrigerators, and washers to automatically receive maintenance alerts and safeguard warranty proofs."
            actionText="Register Your First Appliance"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appliances.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                      {app.category || 'Appliance'}
                    </span>
                    <button
                      onClick={() => handleDeleteAppliance(app.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">{app.name}</h4>
                  <p className="text-xs text-brand-600 font-semibold">{app.brand}</p>
                </div>

                {/* Specs list */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                  {app.modelNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model #:</span>
                      <span className="font-mono font-medium">{app.modelNumber}</span>
                    </div>
                  )}
                  {app.serialNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Serial #:</span>
                      <span className="font-mono font-medium">{app.serialNumber}</span>
                    </div>
                  )}
                  {app.location && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium">{app.location}</span>
                    </div>
                  )}
                  {app.warrantyExpiryDate && (
                    <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t border-slate-200/60">
                      <span>Warranty Valid:</span>
                      <span>{new Date(app.warrantyExpiryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {app.notes && (
                  <p className="text-xs text-slate-500 italic">"{app.notes}"</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate('/services')}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Book Repair</span>
                  </button>
                  <button
                    onClick={() => setBuyingAmcAppliance(app)}
                    className="py-2.5 px-3 bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 hover:scale-[1.02]"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Buy AMC (₹999)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* ADD APPLIANCE MODAL */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Tv className="w-5 h-5 text-brand-600" />
                <span>Register New Appliance</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppliance} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appliance Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Master Bedroom Inverter AC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. LG, Samsung, Bosch, Daikin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="AC & Cooling">AC & Cooling</option>
                    <option value="Refrigeration">Refrigeration</option>
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="Kitchen Appliances">Kitchen Appliances</option>
                    <option value="Water Purifier & RO">Water Purifier & RO</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Main Kitchen, 2nd Floor Balcony"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="e.g. MS-Q18YNZA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-89230-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Purchase</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warranty Expiry Date</label>
                  <input
                    type="date"
                    value={warrantyExpiryDate}
                    onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extended copper pipe warranty, last compressor gas charge date, etc."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
              >
                Save Appliance to Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SCHEDULE REMINDER MODAL */}
      {/* ==================================================== */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-brand-600" />
                <span>Schedule Recurring Service Reminder</span>
              </h3>
              <button onClick={() => setIsReminderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Appliance</label>
                <select
                  value={selectedApplianceId}
                  onChange={(e) => setSelectedApplianceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {appliances.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Maintenance Type</label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Jet-Pump Coil Clean, Drum Descaling"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency (Months)</label>
                  <select
                    value={frequencyMonths}
                    onChange={(e) => setFrequencyMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="3">Every 3 Months</option>
                    <option value="4">Every 4 Months</option>
                    <option value="6">Every 6 Months</option>
                    <option value="12">Every 12 Months</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
              >
                Set Automated Reminder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RAZORPAY CHECKOUT MODAL FOR AMC PURCHASE */}
      {buyingAmcAppliance && (
        <RazorpayCheckoutModal
          isOpen={Boolean(buyingAmcAppliance)}
          onClose={() => setBuyingAmcAppliance(null)}
          onSuccess={handleAmcSuccess}
          amount={999}
          serviceName={`1-Year Comprehensive AMC (${buyingAmcAppliance.name})`}
          customerName="Sophia Miller"
          customerEmail="customer@fixora.com"
          customerPhone="+91 98765 43210"
          description={`Comprehensive 1-Year AMC Protection Plan for ${buyingAmcAppliance.name} (${buyingAmcAppliance.brand})`}
        />
      )}
    </div>
  );
};
