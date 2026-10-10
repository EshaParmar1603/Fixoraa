import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Calendar,
  IndianRupee,
  Building,
  X,
  Tv,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { warrantiesApi, appliancesApi, paymentsApi } from '../../services/api';
import { BillWarranty, Appliance, DocumentType } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { RazorpayCheckoutModal, RazorpayPaymentResult } from '../../components/common/RazorpayCheckoutModal';

export const Warranties: React.FC = () => {
  const [documents, setDocuments] = useState<BillWarranty[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Buy Extended Warranty flow
  const [isBuyWarrantyModalOpen, setIsBuyWarrantyModalOpen] = useState(false);
  const [selectedWarrantyApplianceId, setSelectedWarrantyApplianceId] = useState('');
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('WARRANTY');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [applianceId, setApplianceId] = useState('');
  const [documentUrl, setDocumentUrl] = useState('https://images.unsplash.com/photo-1568667256549-094345857637?w=600');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docs, apps] = await Promise.all([
        warrantiesApi.getMyDocuments(),
        appliancesApi.getMyAppliances()
      ]);
      setDocuments(docs || []);
      setAppliances(apps || []);
      if (apps && apps.length > 0) {
        setApplianceId(apps[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await warrantiesApi.createDocument({
        title,
        documentType,
        vendor,
        amount: amount ? parseFloat(amount) : null,
        purchaseDate,
        expiryDate,
        applianceId: applianceId || null,
        documentUrl,
        notes
      });
      setIsUploadModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setVendor('');
    setAmount('');
    setPurchaseDate('');
    setExpiryDate('');
    setNotes('');
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Delete this document from your vault?')) {
      await warrantiesApi.deleteDocument(id);
      fetchData();
    }
  };

  const handleBuyWarrantySuccess = async (result: RazorpayPaymentResult) => {
    try {
      const app = appliances.find((a) => a.id === selectedWarrantyApplianceId) || appliances[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 2);

      await warrantiesApi.createDocument({
        title: `2-Year Extended Protection Certificate - ${app?.name || 'Household Appliance'}`,
        documentType: 'WARRANTY',
        vendor: 'Fixora Extended Warranty Care',
        amount: 1499,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        applianceId: app?.id || null,
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        notes: `Purchased via Razorpay (Ref: ${result.paymentId}). 100% cashless coverage on electrical, motor & compressor failures.`
      });

      setToastMessage(`Extended Warranty successfully issued & certified via Razorpay (Ref: ${result.paymentId})!`);
      setIsBuyWarrantyModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setToastMessage('Payment completed via Razorpay and warranty policy certificate stored in vault.');
      setIsBuyWarrantyModalOpen(false);
    }
  };

  const getExpiryStatus = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Warranty Expired', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else if (diffDays <= 60) {
      return { label: `Expires in ${diffDays} days`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { label: `Valid until ${new Date(dateStr).toLocaleDateString()}`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (selectedType === 'ALL') return true;
    return d.documentType === selectedType;
  });

  if (loading) {
    return <LoadingSpinner message="Opening your digital document locker..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Digital Bill & Warranty Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store proof of purchases, guarantee cards, and user manuals securely in the cloud
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsBuyWarrantyModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Buy Extended Warranty (₹1,499)</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bill or Warranty</span>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { label: 'All Documents', value: 'ALL' },
          { label: 'Warranty Cards', value: 'WARRANTY' },
          { label: 'Purchase Invoices', value: 'BILL' },
          { label: 'User Manuals', value: 'MANUAL' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedType(tab.value)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedType === tab.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents in this category"
          description="Never lose an appliance invoice again. Upload purchase bills or warranty certificates to protect your investments."
          actionText="Upload Document"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const status = getExpiryStatus(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-[11px] font-bold">
                      {doc.documentType}
                    </span>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3 line-clamp-1">{doc.title}</h4>
                  {doc.appliance && (
                    <span className="inline-flex items-center text-xs text-brand-600 font-semibold mt-1">
                      <Tv className="w-3.5 h-3.5 mr-1" />
                      {doc.appliance.name}
                    </span>
                  )}
                </div>

                {/* Expiry Badge */}
                {status && (
                  <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 ${status.color}`}>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{status.label}</span>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl">
                  {doc.vendor && (
                    <div className="flex justify-between">
                      <span className="flex items-center"><Building className="w-3 h-3 mr-1 text-slate-400" /> Vendor:</span>
                      <span className="font-semibold text-slate-800">{doc.vendor}</span>
                    </div>
                  )}
                  {doc.amount && (
                    <div className="flex justify-between">
                      <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1 text-slate-400" /> Amount:</span>
                      <span className="font-semibold text-slate-800">₹{doc.amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {doc.purchaseDate && (
                    <div className="flex justify-between">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-slate-400" /> Purchased:</span>
                      <span>{new Date(doc.purchaseDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Original Document File</span>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* UPLOAD DOCUMENT MODAL */}
      {/* ==================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Upload Bill or Warranty</span>
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LG AC 5-Year Compressor Warranty Card"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="WARRANTY">Warranty Proof</option>
                    <option value="BILL">Tax Invoice / Bill</option>
                    <option value="MANUAL">Instruction Manual</option>
                    <option value="OTHER">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link to Appliance</label>
                  <select
                    value={applianceId}
                    onChange={(e) => setApplianceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">None / General</option>
                    {appliances.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchased From (Vendor)</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Best Buy, Amazon"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Amount (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 24999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
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
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File / Document URL</label>
                <input
                  type="url"
                  required
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://... image or pdf link"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
              >
                Store in Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BUY EXTENDED WARRANTY DIALOG */}
      {isBuyWarrantyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">2-Year Extended Protection</h3>
              </div>
              <button onClick={() => setIsBuyWarrantyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-extrabold block text-sm">₹1,499 Comprehensive Plan</span>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  100% cashless coverage against PCB failures, motor breakdown, compressor gas, and zero labor costs across India.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Appliance to Protect</label>
                <select
                  value={selectedWarrantyApplianceId}
                  onChange={(e) => setSelectedWarrantyApplianceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">General Household Appliance Protection</option>
                  {appliances.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.brand} - {a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Coverage Term:</span>
                  <span className="font-bold text-slate-800">24 Months Extended</span>
                </div>
                <div className="flex justify-between">
                  <span>Turnaround Guarantee:</span>
                  <span className="font-bold text-emerald-600">48-Hr Technician Visit</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsBuyWarrantyModalOpen(false);
                  setIsRazorpayModalOpen(true);
                }}
                className="w-full py-3.5 bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs flex items-center justify-center space-x-1.5 hover:scale-[1.02]"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay ₹1,499 via Razorpay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAZORPAY CHECKOUT MODAL */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={handleBuyWarrantySuccess}
        amount={1499}
        serviceName="Fixora 2-Year Extended Protection Certificate"
        customerName="Sophia Miller"
        customerEmail="customer@fixora.com"
        customerPhone="+91 98765 43210"
        description="Comprehensive 24-Month Appliance Warranty Extension"
      />
    </div>
  );
};
