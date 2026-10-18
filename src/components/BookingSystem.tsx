import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  PackagePlus, 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  Clock, 
  RotateCw, 
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Truck,
  Plane,
  Ship,
  Box,
  DollarSign
} from 'lucide-react';
import { ServiceMode } from '../types';
import { submitBooking } from '../services/bookingService';
import { TurnstileWidget } from './TurnstileWidget';
import { Stepper, StepItem } from '../design/primitives/Stepper';
import { Button } from '../design/primitives/Button';

interface BookingSystemProps {
  onBookingSuccess?: (bookingRef: string, newShipment?: any) => void;
}

const BOOKING_STEPS: StepItem[] = [
  { id: 'route', label: 'Route & Mode' },
  { id: 'cargo', label: 'Cargo Specs' },
  { id: 'parties', label: 'Shipper & Consignee' },
  { id: 'review', label: 'Review & Confirm' }
];

export const BookingSystem: React.FC<BookingSystemProps> = ({ onBookingSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [submittedAwb, setSubmittedAwb] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Prefill parameters from Rate Estimator query string:
  // e.g. /book?dest=Germany&weight=25&mode=air&commodity=Apparel
  const queryDest = searchParams.get('dest') || searchParams.get('destination') || '';
  const queryOrigin = searchParams.get('origin') || 'Hetauda';
  const queryWeight = searchParams.get('weight') ? parseFloat(searchParams.get('weight') || '1') : 5;
  const queryMode = (searchParams.get('type') || searchParams.get('mode') || 'air').toLowerCase() as ServiceMode;
  const queryPieces = searchParams.get('pieces') ? parseInt(searchParams.get('pieces') || '1', 10) : 1;
  const queryCommodity = searchParams.get('commodity') || '';

  // Form State
  const [serviceMode, setServiceMode] = useState<ServiceMode>(
    ['air', 'ocean', 'overland'].includes(queryMode) ? queryMode : 'air'
  );
  const [originCity, setOriginCity] = useState(queryOrigin);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const [destinationCountry, setDestinationCountry] = useState(queryDest);
  const [destinationCity, setDestinationCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [weightKg, setWeightKg] = useState<number>(isNaN(queryWeight) || queryWeight <= 0 ? 5 : queryWeight);
  const [lengthCm, setLengthCm] = useState<number>(30);
  const [widthCm, setWidthCm] = useState<number>(25);
  const [heightCm, setHeightCm] = useState<number>(20);
  const [pieces, setPieces] = useState<number>(isNaN(queryPieces) || queryPieces <= 0 ? 1 : queryPieces);
  const [commodity, setCommodity] = useState(queryCommodity);
  const [declaredValue, setDeclaredValue] = useState<number>(0);
  const [needsInsurance, setNeedsInsurance] = useState<boolean>(false);

  // Shipper details (clean empty fields, no fake mock names)
  const [shipperName, setShipperName] = useState('');
  const [shipperCompany, setShipperCompany] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [shipperEmail, setShipperEmail] = useState('');

  // Consignee details
  const [consigneeName, setConsigneeName] = useState('');
  const [consigneeCompany, setConsigneeCompany] = useState('');
  const [consigneePhone, setConsigneePhone] = useState('');
  const [consigneeEmail, setConsigneeEmail] = useState('');

  // Volumetric calculation
  const volumeCbm = useMemo(() => {
    return Number((((lengthCm * widthCm * heightCm) / 1000000) * (pieces || 1)).toFixed(3));
  }, [lengthCm, widthCm, heightCm, pieces]);

  const volumetricWeightKg = useMemo(() => {
    const divisor = serviceMode === 'air' ? 5000 : 6000;
    return Math.round(((lengthCm * widthCm * heightCm) / divisor) * (pieces || 1));
  }, [lengthCm, widthCm, heightCm, pieces, serviceMode]);

  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);

  const validateStep1 = () => {
    if (!originCity.trim() || !pickupAddress.trim()) {
      setValidationError('Please enter your pickup city and address in Nepal.');
      return false;
    }
    if (!destinationCountry.trim()) {
      setValidationError('Please specify the destination country.');
      return false;
    }
    if (destinationCountry.trim().toLowerCase() === 'nepal') {
      setValidationError('We ship from Nepal to other countries. Destination cannot be Nepal.');
      return false;
    }
    if (!destinationCity.trim()) {
      setValidationError('Please specify the destination city.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!commodity.trim()) {
      setValidationError('Please specify the cargo description / items you are sending.');
      return false;
    }
    if (weightKg <= 0 || pieces <= 0) {
      setValidationError('Weight and box count must be greater than zero.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!shipperName.trim() || !shipperPhone.trim() || !shipperEmail.trim()) {
      setValidationError('Please fill in complete shipper contact details (Name, Phone, and Email).');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipperEmail.trim())) {
      setValidationError('Please provide a valid email address for the shipper.');
      return false;
    }
    if (!consigneeName.trim() || !consigneePhone.trim()) {
      setValidationError('Please fill in the consignee/recipient name and phone number.');
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

  const handleStepClick = (index: number) => {
    const targetStep = index + 1;
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      setValidationError(null);
    } else if (targetStep === 2 && validateStep1()) {
      setCurrentStep(2);
    } else if (targetStep === 3 && validateStep1() && validateStep2()) {
      setCurrentStep(3);
    } else if (targetStep === 4 && validateStep1() && validateStep2() && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setIsSubmitting(true);
    setValidationError(null);

    const { record, error } = await submitBooking({
      senderName: shipperName.trim(),
      senderEmail: shipperEmail.trim(),
      senderPhone: shipperPhone.trim(),
      senderAddress: `${pickupAddress.trim()}, ${originCity.trim()}`,
      receiverName: consigneeName.trim(),
      receiverEmail: consigneeEmail.trim() || undefined,
      receiverPhone: consigneePhone.trim(),
      receiverAddress: `${deliveryAddress.trim() || destinationCity.trim()}, ${destinationCity.trim()}${destinationCountry ? `, ${destinationCountry}` : ''}`,
      origin: originCity.trim(),
      destination: destinationCity.trim(),
      serviceMode: serviceMode,
      commodity: commodity.trim(),
      weightKg: chargeableWeightKg,
      boxCount: pieces,
      dimensions: `${lengthCm}x${widthCm}x${heightCm}`,
      notes: `Insurance: ${needsInsurance ? 'Yes' : 'No'}, Declared Value: NPR ${declaredValue || 0}`,
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
            <div className="flex items-center gap-2 text-[var(--oxford-deep)] text-xs font-bold uppercase tracking-wider font-mono mb-1">
              <PackagePlus className="w-4 h-4 text-[var(--gold-dark)]" />
              <span>Commercial &amp; Parcel Dispatch</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[var(--text)] tracking-tight">
              Book Cargo Consignment
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Direct booking into central dispatch. Secure waybill generation and collection coordination across Nepal.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1.5 rounded-[var(--r-xs)] border border-[var(--line)] self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Central Booking Desk Active</span>
          </div>
        </div>

        {/* Stepper Navigation */}
        {!submissionSuccess && (
          <div className="bg-[var(--surface)] p-4 sm:p-6 rounded-[var(--r-md)] border border-[var(--line)] shadow-hard-sm">
            <Stepper
              steps={BOOKING_STEPS}
              currentStepIndex={currentStep - 1}
              onStepClick={handleStepClick}
            />
          </div>
        )}

        {validationError && (
          <div className="p-4 rounded-[var(--r-sm)] bg-red-50 border border-red-300 text-red-600 text-xs font-semibold flex items-center justify-between gap-2 shadow-hard-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-4 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SUCCESS CARD */}
        {submissionSuccess && (
          <div className="bg-[var(--surface)] rounded-[var(--r-md)] p-8 sm:p-12 border border-[var(--line)] shadow-hard flex flex-col items-center text-center gap-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-hard-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-2 max-w-lg">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--gold-dark)]">
                Booking Registered Successfully
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text)]">
                Reference: {submissionSuccess}
              </h2>
              {submittedAwb && (
                <div className="inline-flex items-center justify-center gap-2 p-2.5 rounded-[var(--r-xs)] bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono font-bold text-[var(--text)] mt-2 shadow-hard-xs">
                  <FileText className="w-4 h-4 text-[var(--gold-dark)]" />
                  <span>Generated Air Waybill: #{submittedAwb}</span>
                </div>
              )}
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Your consignment request has been queued in our central dispatch system. An operations agent will inspect the cargo manifest and contact you to confirm the pickup schedule.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {submittedAwb && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/track?awb=${submittedAwb}`)}
                >
                  <span>Track This Waybill</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSubmissionSuccess(null);
                  setSubmittedAwb(null);
                  setCurrentStep(1);
                }}
              >
                <span>Book Another Consignment</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: ROUTE & TYPE */}
        {!submissionSuccess && currentStep === 1 && (
          <div className="bg-[var(--surface)] rounded-[var(--r-md)] p-6 sm:p-8 border border-[var(--line)] shadow-hard flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">Step 1 of 4</span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--text)]">
                  Route Selection &amp; Service Mode
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-[var(--r-xs)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--text)] shadow-hard-xs">
                Stage 1 / 4
              </span>
            </div>

            {/* Service Mode Selector */}
            <div>
              <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1.5">
                Primary Transport Mode *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'air', label: 'Air Freight Express', desc: 'Hetauda HQ & TIA Gateway departure to 190+ countries', icon: Plane },
                  { id: 'overland', label: 'Cross-Border Road', desc: 'Container linehaul to India & border dry ports', icon: Truck },
                  { id: 'ocean', label: 'Ocean Container', desc: 'Intermodal rail & sea container shipping', icon: Ship },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = serviceMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setServiceMode(mode.id as ServiceMode)}
                      className={`p-4 text-left rounded-lg border transition-all duration-[var(--t-fast)] cursor-pointer shadow-sm hover:border-slate-400 hover:-translate-y-0.5 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[var(--oxford-deep)] text-white border-transparent font-bold shadow-hard-sm'
                          : 'bg-white text-[var(--text)] border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-xs uppercase tracking-wider">{mode.label}</span>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <span className={`text-[11px] mt-1 ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                        {mode.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pickup & Destination Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Pickup City (Nepal) *
                </label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="e.g. Hetauda, Kathmandu, Pokhara, Birgunj"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Pickup Street Address *
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="e.g. School Road -4 / Factory Gate"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Destination Country *
                </label>
                <input
                  type="text"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="e.g. Germany, United States, UAE, India"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Destination City *
                </label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="e.g. Frankfurt, New York, Delhi, Dubai"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Target Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 mt-6 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
              >
                <span>Continue to Cargo Specs</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CARGO SPECS */}
        {!submissionSuccess && currentStep === 2 && (
          <div className="bg-[var(--surface)] rounded-[var(--r-md)] p-6 sm:p-8 border border-[var(--line)] shadow-hard flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">Step 2 of 4</span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--text)]">
                  Cargo Dimensions &amp; Commodity Specifications
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-[var(--r-xs)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--text)]">
                Stage 2 / 4
              </span>
            </div>

            <div>
              <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                Commodity / Item Description *
              </label>
              <input
                type="text"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="e.g. Handwoven Himalayan Pashmina Shawls & Wool Garments"
                className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Gross Weight (kg) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Box / Pieces Count *
                </label>
                <input
                  type="number"
                  min="1"
                  value={pieces}
                  onChange={(e) => setPieces(parseInt(e.target.value, 10) || 1)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Declared Value (NPR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(parseInt(e.target.value, 10) || 0)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Optional for insurance"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-[var(--text)] block mb-1">
                  Transit Insurance
                </label>
                <button
                  type="button"
                  onClick={() => setNeedsInsurance(!needsInsurance)}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-md border text-xs font-heading font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 inline-flex items-center justify-center gap-1.5 ${
                    needsInsurance
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--line)]'
                  }`}
                >
                  {needsInsurance ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Insured (All-Risk)</span>
                    </>
                  ) : (
                    <span>No Insurance</span>
                  )}
                </button>
              </div>
            </div>

            {/* Dimensions (cm) */}
            <div>
              <span className="text-xs font-heading font-bold text-[var(--text)] block mb-1.5">
                Carton Dimensions per Unit (L × W × H in cm)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Length (cm)"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(parseInt(e.target.value, 10) || 1)}
                  className="min-h-[48px] px-3.5 py-2.5 rounded-md bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Width (cm)"
                  value={widthCm}
                  onChange={(e) => setWidthCm(parseInt(e.target.value, 10) || 1)}
                  className="min-h-[48px] px-3.5 py-2.5 rounded-md bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Height (cm)"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 1)}
                  className="min-h-[48px] px-3.5 py-2.5 rounded-md bg-slate-50 border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Calculated Weight Summary Box */}
            <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-[var(--text-muted)] block uppercase text-[10px]">Total Volume</span>
                <span className="font-bold text-[var(--text)]">{volumeCbm} CBM</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block uppercase text-[10px]">Volumetric Weight</span>
                <span className="font-bold text-[var(--text)]">{volumetricWeightKg} kg</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block uppercase text-[10px]">Chargeable Weight</span>
                <span className="font-bold text-[var(--gold-dark)] text-sm">
                  {chargeableWeightKg} kg (IATA Billable)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
              >
                <span>Continue to Parties</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: SHIPPER & CONSIGNEE DETAILS */}
        {!submissionSuccess && currentStep === 3 && (
          <div className="bg-[var(--surface)] rounded-[var(--r-md)] p-6 sm:p-8 border border-[var(--line)] shadow-hard flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">Step 3 of 4</span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--text)]">
                  Shipper &amp; Consignee Information
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-[var(--r-xs)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--text)]">
                Stage 3 / 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipper Section */}
              <div className="p-5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] flex flex-col gap-3.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold-dark)]">
                  Shipper Details (Sender in Nepal)
                </span>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    value={shipperName}
                    onChange={(e) => setShipperName(e.target.value)}
                    placeholder="e.g. Prakash Adhikari"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={shipperCompany}
                    onChange={(e) => setShipperCompany(e.target.value)}
                    placeholder="e.g. Himalayan Crafts Exports Pvt. Ltd."
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shipperPhone}
                      onChange={(e) => setShipperPhone(e.target.value)}
                      placeholder="+977-98..."
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shipperEmail}
                      onChange={(e) => setShipperEmail(e.target.value)}
                      placeholder="shipper@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Consignee Section */}
              <div className="p-5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] flex flex-col gap-3.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold-dark)]">
                  Consignee Details (Recipient)
                </span>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                    placeholder="e.g. Helmut Schneider / Destination Contact"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                    Recipient Company (optional)
                  </label>
                  <input
                    type="text"
                    value={consigneeCompany}
                    onChange={(e) => setConsigneeCompany(e.target.value)}
                    placeholder="e.g. Schneider Logistics GmbH"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={consigneePhone}
                      onChange={(e) => setConsigneePhone(e.target.value)}
                      placeholder="Receiver contact with country code"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                      Email Address (optional)
                    </label>
                    <input
                      type="email"
                      value={consigneeEmail}
                      onChange={(e) => setConsigneeEmail(e.target.value)}
                      placeholder="receiver@domain.com"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-[var(--text)] block mb-1">
                    Delivery Street / Warehouse Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, Building, Door / Warehouse code"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
              >
                <span>Review &amp; Verify</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT WITH TURNSTILE */}
        {!submissionSuccess && currentStep === 4 && (
          <form onSubmit={handleSubmitBooking} className="bg-[var(--surface)] rounded-[var(--r-md)] p-6 sm:p-8 border border-[var(--line)] shadow-hard flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">Step 4 of 4</span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--text)]">
                  Final Manifest Review &amp; Dispatch Confirmation
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-[var(--r-xs)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--text)]">
                Stage 4 / 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
                <span className="font-mono uppercase font-bold text-[var(--gold-dark)] block">
                  Route &amp; Mode
                </span>
                <p><strong>From:</strong> {originCity} ({pickupAddress})</p>
                <p><strong>To:</strong> {destinationCity}, {destinationCountry}</p>
                <p><strong>Mode:</strong> {serviceMode.toUpperCase()} (International Export)</p>
                <p><strong>Pickup Date:</strong> {pickupDate}</p>
              </div>

              <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
                <span className="font-mono uppercase font-bold text-[var(--gold-dark)] block">
                  Cargo Specification
                </span>
                <p><strong>Commodity:</strong> {commodity}</p>
                <p><strong>Volume &amp; Weight:</strong> {pieces} pcs, {weightKg} kg gross (Chargeable: ~{chargeableWeightKg} kg)</p>
                <p><strong>Shipper:</strong> {shipperName} ({shipperPhone})</p>
                <p><strong>Consignee:</strong> {consigneeName} ({consigneePhone})</p>
              </div>
            </div>

            {/* Cloudflare Turnstile Anti-bot Protection Widget */}
            <TurnstileWidget onVerify={(tok) => setTurnstileToken(tok)} className="my-1" />

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 font-bold rounded-lg shadow-md flex items-center justify-center gap-2"
              >
                <PackagePlus className="w-5 h-5 mr-2" />
                <span>Confirm Booking &amp; Generate AWB</span>
              </Button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
};
