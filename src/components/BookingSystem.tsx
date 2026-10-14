import React, { useState, useMemo } from 'react';
import { 
  PackagePlus, 
  ArrowRight, 
  Check, 
  MapPin, 
  Clock, 
  RotateCw, 
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { ServiceMode } from '../types';
import { submitBooking } from '../services/bookingService';
import { TurnstileWidget } from './ui/TurnstileWidget';

interface BookingSystemProps {
  onBookingSuccess?: (bookingRef: string, newShipment?: any) => void;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({ onBookingSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [submittedAwb, setSubmittedAwb] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Form State
  const [serviceCategory, setServiceCategory] = useState<'national' | 'international'>('international');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('air');
  const [originHub, setOriginHub] = useState('Hetauda Central HQ');
  const [originCity, setOriginCity] = useState('Hetauda');
  const [pickupAddress, setPickupAddress] = useState('Kantirajpath, Hetauda-4');
  const [pickupDate, setPickupDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const [destinationCountry, setDestinationCountry] = useState('Germany');
  const [destinationCity, setDestinationCity] = useState('Frankfurt');
  const [deliveryAddress, setDeliveryAddress] = useState('Cargo City South, Frankfurt');

  const [weightKg, setWeightKg] = useState<number>(120);
  const [lengthCm, setLengthCm] = useState<number>(80);
  const [widthCm, setWidthCm] = useState<number>(60);
  const [heightCm, setHeightCm] = useState<number>(50);
  const [pieces, setPieces] = useState<number>(2);
  const [commodity, setCommodity] = useState('Apparel & Handmade Textiles');
  const [declaredValue, setDeclaredValue] = useState<number>(250000);
  const [needsInsurance, setNeedsInsurance] = useState<boolean>(true);

  const [shipperName, setShipperName] = useState('Sunil Thapa');
  const [shipperCompany, setShipperCompany] = useState('Himalayan Craft Exporters');
  const [shipperPhone, setShipperPhone] = useState('+977-9851000000');
  const [shipperEmail, setShipperEmail] = useState('export@himalayancraft.np');

  const [consigneeName, setConsigneeName] = useState('Marcus Weber');
  const [consigneeCompany, setConsigneeCompany] = useState('Eurotex Logistics GmbH');
  const [consigneePhone, setConsigneePhone] = useState('+49 69 123456');
  const [consigneeEmail, setConsigneeEmail] = useState('import@eurotex.de');

  const volumeCbm = useMemo(() => {
    return Number((((lengthCm * widthCm * heightCm) / 1000000) * (pieces || 1)).toFixed(2));
  }, [lengthCm, widthCm, heightCm, pieces]);

  const volumetricWeightKg = useMemo(() => {
    const divisor = serviceMode === 'express' ? 5000 : 6000;
    return Math.round(((lengthCm * widthCm * heightCm) / divisor) * (pieces || 1));
  }, [lengthCm, widthCm, heightCm, pieces, serviceMode]);

  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);

  const validateStep1 = () => {
    if (!originCity.trim() || !pickupAddress.trim()) {
      setValidationError('Please enter your pickup city and address.');
      return false;
    }
    if (serviceCategory === 'international' && (!destinationCountry.trim() || !destinationCity.trim())) {
      setValidationError('Please enter the destination country and city.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (weightKg <= 0 || pieces <= 0) {
      setValidationError('Please enter the package weight and number of boxes.');
      return false;
    }
    if (!commodity.trim()) {
      setValidationError('Please tell us what items you are sending.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!shipperName.trim() || !shipperPhone.trim() || !shipperEmail.trim()) {
      setValidationError('Please fill in your contact information (name, phone, and email).');
      return false;
    }
    if (!consigneeName.trim() || !consigneePhone.trim()) {
      setValidationError('Please fill in the receiver\'s name and phone number.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setValidationError(null);

    const { record, error } = await submitBooking({
      senderName: shipperName,
      senderEmail: shipperEmail,
      senderPhone: shipperPhone,
      senderAddress: `${pickupAddress}, ${originCity}`,
      receiverName: consigneeName,
      receiverEmail: consigneeEmail,
      receiverPhone: consigneePhone,
      receiverAddress: `${deliveryAddress}, ${destinationCity}, ${destinationCountry}`,
      origin: originCity,
      destination: destinationCity,
      serviceMode: serviceMode,
      commodity: commodity,
      weightKg: chargeableWeightKg,
      boxCount: pieces,
      dimensions: `${lengthCm}x${widthCm}x${heightCm}`,
      notes: `Insurance: ${needsInsurance ? 'Yes' : 'No'}, Declared Value: NPR ${declaredValue}`,
      currency: 'USD'
    }, turnstileToken);

    setIsSubmitting(false);

    if (error) {
      setValidationError(error);
    } else if (record) {
      setSubmissionSuccess(record.bookingRef);
      setSubmittedAwb(record.awbNumber || null);
      if (onBookingSuccess) onBookingSuccess(record.bookingRef, record);
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-colors">
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#0B5ED7] dark:text-[#2F80ED] text-xs font-bold uppercase tracking-wider font-mono mb-1">
              <PackagePlus className="w-4 h-4 text-[#F5C84C]" />
              <span>Easy Online Booking</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Send a Package
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Tell us where your package is going, and we will take care of the rest.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0B2445] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Operational Booking Desk</span>
          </div>
        </div>

        {/* Stepper Header */}
        {!submissionSuccess && (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            {[
              { num: 1, label: 'Route & Type' },
              { num: 2, label: 'Package Info' },
              { num: 3, label: 'Sender & Receiver' },
              { num: 4, label: 'Review & Submit' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => isCompleted && setCurrentStep(step.num)}
                  disabled={!isCompleted && !isActive}
                  className={`flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-2 text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'text-[#0B5ED7] dark:text-[#2F80ED]'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                      isActive
                        ? 'bg-[#0B5ED7] text-white shadow-md'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:inline">
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold">
            {validationError}
          </div>
        )}

        {/* SUBMISSION SUCCESS CARD */}
        {submissionSuccess && (
          <div className="bg-white dark:bg-[#0B2445] rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2 max-w-lg">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B5ED7]">
                Booking Request Confirmed
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Booking Reference: {submissionSuccess}
              </h2>
              {submittedAwb && (
                <div className="inline-flex items-center justify-center gap-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs font-mono font-bold text-[#0B5ED7]">
                  <FileText className="w-4 h-4" />
                  <span>Generated Air Waybill: {submittedAwb}</span>
                </div>
              )}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
                Your cargo booking request has been securely processed. Our operations team in Hetauda/Kathmandu will inspect your booking details and dispatch a pickup agent.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmissionSuccess(null);
                setSubmittedAwb(null);
                setCurrentStep(1);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0B5ED7] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#084298] transition-colors"
            >
              Book Another Package
            </button>
          </div>
        )}

        {/* STEP 1: ROUTE & TYPE */}
        {!submissionSuccess && currentStep === 1 && (
          <div className="bg-white dark:bg-[#0B2445] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Step 1: Choose Route &amp; Shipping Method
              </h2>
              <span className="text-xs font-mono text-slate-400">1 of 4</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setServiceCategory('international')}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  serviceCategory === 'international'
                    ? 'border-[#0B5ED7] bg-blue-50/50 dark:bg-blue-950/30 text-[#0B5ED7]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="font-bold text-xs uppercase font-mono">Worldwide Delivery</span>
                <span className="text-[11px]">Nepal to 220+ Countries</span>
              </button>

              <button
                type="button"
                onClick={() => setServiceCategory('national')}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  serviceCategory === 'national'
                    ? 'border-[#0B5ED7] bg-blue-50/50 dark:bg-blue-950/30 text-[#0B5ED7]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="font-bold text-xs uppercase font-mono">Delivery in Nepal</span>
                <span className="text-[11px]">All 77 Districts Covered</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pickup City (Nepal) *</label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. Hetauda / Kathmandu"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pickup Address *</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Full street address for pickup"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Destination Country *</label>
                <input
                  type="text"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. Germany, USA, UAE"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Destination City *</label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Destination city"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Package Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PACKAGE DETAILS */}
        {!submissionSuccess && currentStep === 2 && (
          <div className="bg-white dark:bg-[#0B2445] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Step 2: Package Size &amp; Item Details
              </h2>
              <span className="text-xs font-mono text-slate-400">2 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">What items are you sending? *</label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder="e.g. Handicrafts, Pashmina, Garments"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Box Count *</label>
                  <input
                    type="number"
                    value={pieces}
                    onChange={(e) => setPieces(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase hover:bg-slate-100 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Contact Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT INFORMATION */}
        {!submissionSuccess && currentStep === 3 && (
          <div className="bg-white dark:bg-[#0B2445] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Step 3: Sender and Receiver Contact Details
              </h2>
              <span className="text-xs font-mono text-slate-400">3 of 4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase text-[#0B5ED7]">Sender (Your Details)</span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={shipperName}
                    onChange={(e) => setShipperName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={shipperPhone}
                      onChange={(e) => setShipperPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Email *</label>
                    <input
                      type="email"
                      value={shipperEmail}
                      onChange={(e) => setShipperEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase text-[#0B5ED7]">Receiver Details</span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Receiver Name *</label>
                  <input
                    type="text"
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={consigneePhone}
                      onChange={(e) => setConsigneePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Email (optional)</label>
                    <input
                      type="email"
                      value={consigneeEmail}
                      onChange={(e) => setConsigneeEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B2445] border text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold uppercase hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase flex items-center gap-2"
              >
                <span>Review &amp; Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT WITH TURNSTILE */}
        {!submissionSuccess && currentStep === 4 && (
          <form onSubmit={handleSubmitBooking} className="bg-white dark:bg-[#0B2445] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Step 4: Review Details &amp; Anti-Bot Verification
              </h2>
              <span className="text-xs font-mono text-slate-400">4 of 4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-mono uppercase font-bold text-[#0B5ED7] block">Route &amp; Mode</span>
                <p><strong>From:</strong> {originCity} ({pickupAddress})</p>
                <p><strong>To:</strong> {destinationCity} ({destinationCountry})</p>
                <p><strong>Pickup Date:</strong> {pickupDate}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-mono uppercase font-bold text-[#0B5ED7] block">Cargo Specification</span>
                <p><strong>Items:</strong> {commodity}</p>
                <p><strong>Box Count &amp; Weight:</strong> {pieces} pcs, {weightKg} kg (Chargeable: ~{chargeableWeightKg} kg)</p>
                <p><strong>Sender:</strong> {shipperName} ({shipperEmail})</p>
              </div>
            </div>

            {/* Cloudflare Turnstile Anti-bot Protection Widget */}
            <TurnstileWidget onVerify={(tok) => setTurnstileToken(tok)} className="my-1" />

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase hover:bg-slate-100 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Processing Booking &amp; AWB...</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4 text-[#F5C84C]" />
                    <span>Confirm &amp; Generate AWB</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
};
