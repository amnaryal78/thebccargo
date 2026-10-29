import { useAuth } from '../../context/AuthContext';
import React, { useState, useMemo, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTweenedNumber } from '../../design/useTweenedNumber';
import { HOME_PICKUP_FEE_NPR, PICKUP_AREAS, PICKUP_POLICY_EN, OTHER_AREA, FREE_PICKUP_AREAS_TEXT, FREE_PICKUP_OVER_KG, pickupFeeFor, type HandoverMethod } from './pickup';
import { useEstimatorData } from './useEstimatorData';
import {
  calculateBoxCount,
  calculateSheetShipmentQuote,
  isMeatAllowedForCountry,
  findRateGroupForCountry,
  SheetQuoteResult,
  EstimateResult,
  BOX_CHARGE_NPR,
  LIQUID_FEE_PER_BOTTLE_NPR,
  MEAT_FEE_EUROPE_UK_PER_KG,
  MEAT_FEE_HONG_KONG_PER_KG,
} from './engine';
import { EstimateBillModal } from './EstimateBillModal';
import { buildShareUrl, readShareParams, shareQuote } from './share';
import {
  Globe2,
  Plus,
  Minus,
  Droplets,
  UtensilsCrossed,
  Pill,
  FileText,
  MessageSquare,
  AlertCircle,
  Check,
  ChevronDown,
  X,
  Search,
  Package,
  Building2,
  Home,
  RefreshCw,
  ShieldCheck,
  Clock,
  Calculator,
  Share2,
} from 'lucide-react';

export interface RateEstimatorProps {
  initialDestination?: string;
  initialType?: string;
  initialWeight?: number;
  variant?: 'full' | 'compact' | string;
  className?: string;
  onSelectEstimate?: (result: EstimateResult) => void;
}

interface TopCountryOption {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export interface EstimatorCountry {
  name: string;
  flag: string;
  code: string;
}

export const ALL_ESTIMATOR_COUNTRIES: EstimatorCountry[] = [
  { name: 'Australia', flag: '🇦🇺', code: 'SYD' },
  { name: 'Austria', flag: '🇦🇹', code: 'VIE' },
  { name: 'Bahrain (listed as Bharain)', flag: '🇧🇭', code: 'BAH' },
  { name: 'Belgium', flag: '🇧🇪', code: 'BRU' },
  { name: 'Bulgaria', flag: '🇧🇬', code: 'SOF' },
  { name: 'Canada', flag: '🇨🇦', code: 'YYZ' },
  { name: 'Croatia (listed as Coratia)', flag: '🇭🇷', code: 'ZAG' },
  { name: 'Cyprus', flag: '🇨🇾', code: 'LCA' },
  { name: 'Czech Republic (listed as Chech Republic)', flag: '🇨🇿', code: 'PRG' },
  { name: 'Denmark', flag: '🇩🇰', code: 'CPH' },
  { name: 'Estonia', flag: '🇪🇪', code: 'TLL' },
  { name: 'Finland', flag: '🇫🇮', code: 'HEL' },
  { name: 'France', flag: '🇫🇷', code: 'CDG' },
  { name: 'Germany', flag: '🇩🇪', code: 'FRA' },
  { name: 'Greece', flag: '🇬🇷', code: 'ATH' },
  { name: 'Hong Kong', flag: '🇭🇰', code: 'HKG' },
  { name: 'Hungary', flag: '🇭🇺', code: 'BUD' },
  { name: 'Ireland', flag: '🇮🇪', code: 'DUB' },
  { name: 'Italy', flag: '🇮🇹', code: 'FCO' },
  { name: 'Japan', flag: '🇯🇵', code: 'NRT' },
  { name: 'Korea', flag: '🇰🇷', code: 'ICN' },
  { name: 'Kuwait', flag: '🇰🇼', code: 'KWI' },
  { name: 'Latvia', flag: '🇱🇻', code: 'RIX' },
  { name: 'Lithuania', flag: '🇱🇹', code: 'VNO' },
  { name: 'Luxembourg', flag: '🇱🇺', code: 'LUX' },
  { name: 'Malaysia (listed as Malasiya)', flag: '🇲🇾', code: 'KUL' },
  { name: 'Malta', flag: '🇲🇹', code: 'MLA' },
  { name: 'Monaco', flag: '🇲🇨', code: 'NCE' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'AMS' },
  { name: 'New Zealand', flag: '🇳🇿', code: 'AKL' },
  { name: 'Philippines', flag: '🇵🇭', code: 'MNL' },
  { name: 'Poland', flag: '🇵🇱', code: 'WAW' },
  { name: 'Portugal', flag: '🇵🇹', code: 'LIS' },
  { name: 'Qatar', flag: '🇶🇦', code: 'DOH' },
  { name: 'Romania', flag: '🇷🇴', code: 'OTP' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'RUH' },
  { name: 'Slovakia', flag: '🇸🇰', code: 'BTS' },
  { name: 'Slovenia', flag: '🇸🇮', code: 'LJU' },
  { name: 'Spain', flag: '🇪🇸', code: 'MAD' },
  { name: 'Sweden', flag: '🇸🇪', code: 'ARN' },
  { name: 'Taiwan', flag: '🇹🇼', code: 'TPE' },
  { name: 'UAE', flag: '🇦🇪', code: 'DXB' },
  { name: 'UK', flag: '🇬🇧', code: 'LHR' },
  { name: 'USA', flag: '🇺🇸', code: 'JFK' },
];


import { Spotlight } from '../../components/ui/spotlight';
import { Button } from '../../design/primitives/Button';

const QUICK_COUNTRIES: { name: string; label: string }[] = [
  { name: 'Korea', label: 'Korea' },
  { name: 'Malaysia (listed as Malasiya)', label: 'Malaysia' },
  { name: 'UK', label: 'UK' },
  { name: 'Japan', label: 'Japan' },
  { name: 'Australia', label: 'Australia' },
];

const MAX_WEIGHT_KG = 1000;
const WHATSAPP_NUMBER = '9779855019485';
/** Drop the "(listed as ...)" sheet-spelling note from a country name for display. */
const shortName = (n: string) => n.replace(/\s*\(listed as [^)]*\)/i, '');
const nf = (n: number) => n.toLocaleString('en-US');

const SOURCE_NOTE: Record<string, string> = {
  live: 'Live rate',
  cache_memory: 'Recent saved rate',
  cache_database: 'Recent saved rate',
  local_fallback: 'Saved estimate',
};

const StepHeading: React.FC<{ n: number; id: string; title: string; hint?: string; done?: boolean }> = ({ n, id, title, hint, done }) => (
  <div className="flex items-center justify-between gap-3">
    <h2 id={id} className="flex items-center gap-3 font-heading font-extrabold text-lg sm:text-xl text-ox-900">
      <span
        aria-hidden="true"
        className={`w-8 h-8 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-bold transition-colors ${
          done ? 'bg-gd-500 text-ox-900' : 'bg-ox-900 text-white'
        }`}
      >
        {done ? <Check className="w-4 h-4 stroke-[3]" /> : n}
      </span>
      <span>{title}</span>
    </h2>
    {hint && <span className="text-sm font-medium text-slate-600 text-right">{hint}</span>}
  </div>
);

interface ItemCardProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  Icon: React.ElementType;
  title: string;
  note: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ checked, disabled, onChange, Icon, title, note }) => (
  <label
    className={`relative flex items-start gap-3 p-4 rounded-[var(--r-md)] border-2 transition-colors focus-within:ring-2 focus-within:ring-gd-500 focus-within:ring-offset-2 ${
      disabled
        ? 'border-slate-200 bg-slate-100/60 text-slate-500 cursor-not-allowed'
        : checked
        ? 'border-ox-900 bg-[#EEF3F9] cursor-pointer'
        : 'border-[#B9C6D8] hover:border-ox-900 cursor-pointer'
    }`}
  >
    <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
    <span
      aria-hidden="true"
      className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center ${
        checked ? 'bg-ox-900 border-ox-900 text-gd-500' : disabled ? 'border-slate-300 bg-slate-100' : 'border-[#7B8CA6] bg-white'
      }`}
    >
      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
    </span>
    <span className="min-w-0 leading-snug">
      <span className="flex items-center gap-1.5 font-bold text-ox-900">
        <Icon className={`w-4 h-4 shrink-0 ${disabled ? 'text-slate-400' : 'text-[#8C6400]'}`} aria-hidden="true" />
        <span className={disabled ? 'text-slate-500' : ''}>{title}</span>
      </span>
      <span className="block text-sm mt-0.5 text-slate-600">{note}</span>
    </span>
  </label>
);

export const RateEstimator: React.FC<RateEstimatorProps> = ({
  initialDestination,
  initialWeight = 10,
  className = '',
  onSelectEstimate,
}) => {
  const reduce = !!useReducedMotion();
  const { role, active } = useAuth();
  const isReseller = role === 'reseller' && active;
  const { sheetRates, loading, rateError, rateSource, lastUpdated, isOffline, refetch } = useEstimatorData();

  // 1. Country
  const [selectedCountry, setSelectedCountry] = useState<string>(() => initialDestination || '');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const onDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsCountryDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    const t = setTimeout(() => searchInputRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('mousedown', onDown);
      clearTimeout(t);
    };
  }, [isCountryDropdownOpen]);

  // 2. Weight
  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [weightInputStr, setWeightInputStr] = useState<string>(String(initialWeight));

  // A shared link (/rates?...&liq=2&meat=3&med=1&pickup=Hetauda) restores every choice the sender made.
  const [shared] = useState(readShareParams);

  // 3. Special items
  const [hasLiquid, setHasLiquid] = useState(shared.liquidBottles > 0);
  const [liquidBottles, setLiquidBottles] = useState<number>(Math.max(1, shared.liquidBottles));
  const [hasMeat, setHasMeat] = useState(shared.meatKg > 0);
  const [meatKg, setMeatKg] = useState<number>(Math.max(1, shared.meatKg));
  const [hasMedicine, setHasMedicine] = useState(shared.medicine);
  const [meatNotice, setMeatNotice] = useState<string | null>(null);

  const [showBillModal, setShowBillModal] = useState(false);
  const [shareResult, setShareResult] = useState<{ status: '' | 'copied' | 'failed'; quote: SheetQuoteResult | null }>({ status: '', quote: null });

  // 4. Handover
  const [handover, setHandover] = useState<HandoverMethod>(shared.pickupArea ? 'home' : 'office');
  const [pickupArea, setPickupArea] = useState<string>(shared.pickupArea);

  useEffect(() => {
    if (initialDestination) setSelectedCountry(initialDestination);
  }, [initialDestination]);

  const currentCountryObj = useMemo(() => {
    if (!selectedCountry) return { name: '', flag: '', code: '' };
    const norm = selectedCountry.toLowerCase().trim();
    return (
      ALL_ESTIMATOR_COUNTRIES.find(
        (c) =>
          c.name.toLowerCase() === norm ||
          c.name.toLowerCase().startsWith(norm) ||
          norm.includes(c.name.toLowerCase()) ||
          c.code.toLowerCase() === norm
      ) || { name: selectedCountry, flag: '🌐', code: 'DEST' }
    );
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return ALL_ESTIMATOR_COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return ALL_ESTIMATOR_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countrySearch]);

  const pickCountry = (name: string) => {
    setSelectedCountry(name);
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
    triggerRef.current?.focus();
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filteredCountries.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = filteredCountries[activeIdx];
      if (c) pickCountry(c.name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCountryDropdownOpen(false);
      triggerRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    document.getElementById(`${listId}-opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, isCountryDropdownOpen, listId]);

  const isMeatAllowed = useMemo(() => isMeatAllowedForCountry(selectedCountry), [selectedCountry]);
  const isHongKong = selectedCountry.toLowerCase().includes('hong');

  useEffect(() => {
    if (!isMeatAllowed && hasMeat) {
      setHasMeat(false);
      setMeatNotice('Meat is not available for this country, so it was removed.');
    } else {
      setMeatNotice(null);
    }
  }, [selectedCountry, isMeatAllowed, hasMeat]);

  const handleWeightChange = (valStr: string) => {
    setWeightInputStr(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed >= 0) {
      setWeightKg(parsed);
      if (meatKg > parsed) setMeatKg(Math.max(1, Math.floor(parsed)));
    } else {
      setWeightKg(0);
    }
  };

  const setWeightExact = (next: number) => {
    setWeightKg(next);
    setWeightInputStr(String(next));
    if (meatKg > next) setMeatKg(Math.max(1, Math.floor(next)));
  };
  const handleIncrementWeight = () => setWeightExact(Math.min(MAX_WEIGHT_KG, Math.round((weightKg + 0.5) * 10) / 10));
  const handleDecrementWeight = () => setWeightExact(Math.max(0.5, Math.round((weightKg - 0.5) * 10) / 10));

  const handleIncrementMeat = () => setMeatKg((prev) => Math.min(weightKg > 0 ? weightKg : 100, prev + 1));
  const handleDecrementMeat = () => setMeatKg((prev) => Math.max(1, prev - 1));

  const boxCount = useMemo(() => calculateBoxCount(weightKg), [weightKg]);
  const overMax = weightKg > MAX_WEIGHT_KG;

  const baseQuote: SheetQuoteResult | null = useMemo(() => {
    if (!selectedCountry || !sheetRates || sheetRates.length === 0 || weightKg <= 0 || overMax) return null;
    return calculateSheetShipmentQuote(
      {
        destination: selectedCountry,
        actualWeightKg: weightKg,
        hasLiquid,
        liquidBottleCount: liquidBottles,
        hasMedicine,
        hasMeat,
        meatKg: hasMeat ? meatKg : 0,
        isReseller,
      },
      sheetRates
    );
  }, [sheetRates, selectedCountry, weightKg, overMax, hasLiquid, liquidBottles, hasMedicine, hasMeat, meatKg, isReseller]);

  const homePickupOk = handover === 'home' && (PICKUP_AREAS as readonly string[]).includes(pickupArea);
  const pickupFee = homePickupOk ? pickupFeeFor(pickupArea, weightKg) : 0;
  const quoteResult: SheetQuoteResult | null = useMemo(() => {
    if (!baseQuote) return null;
    if (!pickupFee) return baseQuote;
    return { ...baseQuote, pickupFeeNpr: pickupFee, pickupArea, totalNpr: baseQuote.totalNpr + pickupFee };
  }, [baseQuote, pickupFee, pickupArea]);
  const shownTotal = useTweenedNumber(quoteResult?.totalNpr ?? 0);

  useEffect(() => {
    if (quoteResult && onSelectEstimate) {
      const match = findRateGroupForCountry(selectedCountry, sheetRates);
      const estResult: EstimateResult = {
        chargeableWeightKg: weightKg,
        actualWeightKg: weightKg,
        volumetricWeightKg: 0,
        isVolumetric: false,
        allowed: quoteResult.allowed && !quoteResult.meatBlocked,
        missingBand: !quoteResult.allowed,
        destinationName: match?.displayName || selectedCountry,
        mode: 'air',
        currency: 'NPR',
        isPlaceholderWarning: false,
        breakdown: {
          baseFreightNpr: quoteResult.baseShippingCharge,
          fuelSurchargeNpr: 0,
          handlingFeeNpr: 0,
          specialHandlingSurchargeNpr: quoteResult.liquidCharge + quoteResult.medicineCharge + quoteResult.meatCharge,
          pickupFeeNpr: pickupFee,
          subtotalNpr: quoteResult.totalNpr,
          minChargeApplied: false,
          totalNpr: quoteResult.totalNpr,
          rangeNpr: { min: quoteResult.totalNpr, max: quoteResult.totalNpr },
          boxCount: quoteResult.boxCount,
          boxChargeNpr: quoteResult.boxCharge,
        },
        appliedRules: [],
        guidanceCards: [],
        sheetQuote: quoteResult,
      };
      onSelectEstimate(estResult);
    }
  }, [quoteResult, onSelectEstimate, selectedCountry, weightKg, sheetRates, pickupFee]);

  const getWhatsAppChatUrl = () => {
    if (!quoteResult || !quoteResult.allowed) {
      const text = encodeURIComponent(
        `Hello BC Cargo, I want to inquire about sending cargo from Nepal${selectedCountry ? ` to ${selectedCountry}` : ''}.`
      );
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    }
    const itemsSummary = [hasLiquid ? `Liquid (${liquidBottles} btl)` : '', hasMeat ? `Meat (${meatKg}kg)` : '', hasMedicine ? 'Medicine' : '']
      .filter(Boolean)
      .join(', ');
    const msg = [
      `*BC CARGO ESTIMATE INQUIRY*`,
      `• Destination: ${quoteResult.destinationName}`,
      `• Weight: ${quoteResult.totalWeightKg} kg (${quoteResult.boxCount} boxes)`,
      itemsSummary ? `• Contents: ${itemsSummary}` : '• Contents: General Cargo',
      homePickupOk ? `• Pickup: From home, ${pickupArea} (${pickupFee ? `+Rs ${pickupFee}` : 'free'})` : '• Pickup: I will bring it to your office',
      `• Total Quote: Rs ${quoteResult.totalNpr.toLocaleString()} NPR`,
      `I would like to book this shipment from Hetauda/Nepal.`,
    ].join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const handleShare = async () => {
    if (!quoteResult) return;
    const url = buildShareUrl(window.location.origin, {
      country: selectedCountry,
      weightKg,
      liquidBottles: hasLiquid ? liquidBottles : 0,
      meatKg: hasMeat ? meatKg : 0,
      medicine: hasMedicine,
      pickupArea: homePickupOk ? pickupArea : '',
    });
    const result = await shareQuote(quoteResult, url);
    setShareResult({ status: result === 'copied' ? 'copied' : result === 'failed' ? 'failed' : '', quote: quoteResult });
  };
  // "Link copied" belongs to the price it was made for; any change clears it.
  const shareStatus = shareResult.quote === quoteResult ? shareResult.status : '';

  // What kind of price are we showing? Never claim "live" unless the rates really came live.
  const priceKind = (() => {
    const known = SOURCE_NOTE[rateSource];
    if (known) return { label: known, live: rateSource === 'live' };
    if (loading) return { label: 'Checking live rates', live: false };
    if (isOffline) return { label: 'Saved rate (offline)', live: false };
    return { label: 'Saved rate', live: false };
  })();
  const updatedText = lastUpdated
    ? lastUpdated.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  const hasCountry = !!selectedCountry;
  const weightOk = weightKg > 0 && !overMax;
  const handoverOk = handover === 'office' || homePickupOk;
  const quoteOk = !!quoteResult && quoteResult.allowed;

  const fade = reduce ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.25 } };

  const fieldBox =
    'w-full min-h-[52px] bg-transparent border-2 border-[#B9C6D8] hover:border-ox-900/70 focus:border-ox-900 rounded-[var(--r-sm)] text-ox-900 focus:outline-none focus:ring-4 focus:ring-gd-500/40 transition-colors';

  const summaryRow = (label: React.ReactNode, value: number, key: string) => (
    <div key={key} className="flex justify-between items-start gap-3 py-2 border-b border-slate-200/80 last:border-b-0 text-sm">
      <span className="text-slate-700 min-w-0">{label}</span>
      <span className="font-mono font-bold text-ox-900 whitespace-nowrap shrink-0">Rs {nf(value)}</span>
    </div>
  );

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Spotlight
          intensity="subtle"
          className="bg-white border border-[var(--line)] rounded-[var(--r-lg)] shadow-hard-sm text-left overflow-visible"
        >
          {/* progress strip */}
          <ol
            aria-label="Steps"
            className="flex flex-wrap gap-x-5 gap-y-1.5 list-none m-0 px-5 sm:px-8 py-3.5 border-b border-[var(--line)] bg-[#F6F9FD] rounded-t-[var(--r-lg)] text-xs sm:text-sm font-semibold"
          >
            {[
              ['Country', hasCountry],
              ['Weight', weightOk],
              ['Items', true],
              ['Handover', handoverOk],
              ['Price', quoteOk],
            ].map(([label, done], i) => (
              <li key={label as string} className={`inline-flex items-center gap-1.5 ${done ? 'text-ox-900' : 'text-slate-500'}`}>
                <span
                  className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] ${
                    done ? 'bg-gd-500 text-ox-900' : 'bg-white border border-[#B9C6D8]'
                  }`}
                  aria-hidden="true"
                >
                  {done ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
                </span>
                <span>
                  {label as string}
                  <span className="sr-only">{done ? ' (done)' : ' (to do)'}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-0">
            {/* ============ LEFT: STEPS 1-4 ============ */}
            <div className="p-5 sm:p-8 space-y-8 min-w-0">
              {/* STEP 1 */}
              <section aria-labelledby="step-1-title" className="space-y-3">
                <StepHeading n={1} id="step-1-title" title="Country" hint="Where is it going?" done={hasCountry} />
                <div ref={dropdownRef} className="relative">
                  <button
                    ref={triggerRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isCountryDropdownOpen}
                    aria-controls={isCountryDropdownOpen ? listId : undefined}
                    aria-label={shortName(currentCountryObj.name) ? `Destination country: ${shortName(currentCountryObj.name)}` : 'Choose a country'}
                    onClick={() => {
                      setIsCountryDropdownOpen((p) => !p);
                      setCountrySearch('');
                      setActiveIdx(0);
                    }}
                    className={`${fieldBox} flex items-center gap-3 pl-4 pr-3 text-left text-base sm:text-lg font-bold cursor-pointer`}
                  >
                    {currentCountryObj.flag ? (
                      <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                        {currentCountryObj.flag}
                      </span>
                    ) : (
                      <Globe2 className="w-6 h-6 shrink-0 text-[#8C6400]" aria-hidden="true" />
                    )}
                    <span className="flex-1 min-w-0 truncate">
                      {shortName(currentCountryObj.name) || <span className="font-semibold text-slate-500">Choose a country</span>}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border-2 border-ox-900 rounded-[var(--r-md)] shadow-hard-lg overflow-hidden">
                      <div className="p-3 border-b border-slate-200 flex items-center gap-2.5">
                        <Search className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          role="combobox"
                          aria-expanded="true"
                          aria-controls={listId}
                          aria-activedescendant={filteredCountries.length ? `${listId}-opt-${activeIdx}` : undefined}
                          aria-label="Search countries"
                          placeholder="Type a country"
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setActiveIdx(0);
                          }}
                          onKeyDown={onSearchKey}
                          className="w-full bg-transparent text-base font-semibold text-slate-800 placeholder:text-slate-500 focus:outline-none"
                        />
                        {countrySearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setCountrySearch('');
                              searchInputRef.current?.focus();
                            }}
                            className="p-2 -m-1 text-slate-500 hover:text-slate-800 rounded-full"
                            aria-label="Clear search"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div id={listId} role="listbox" aria-label="Destination countries" className="max-h-64 overflow-y-auto p-1.5">
                        {filteredCountries.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-600">No country matches “{countrySearch}”.</div>
                        ) : (
                          filteredCountries.map((c, i) => {
                            const isSelected = selectedCountry === c.name;
                            const isActive = i === activeIdx;
                            return (
                              <div
                                key={c.name}
                                id={`${listId}-opt-${i}`}
                                role="option"
                                tabIndex={-1}
                                aria-selected={isSelected}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActiveIdx(i)}
                                onClick={() => pickCountry(c.name)}
                                className={`min-h-[44px] px-3.5 py-2 rounded-[var(--r-sm)] text-sm font-bold flex items-center justify-between gap-3 cursor-pointer ${
                                  isSelected ? 'bg-gd-500 text-ox-900' : isActive ? 'bg-[#EEF3F9] text-ox-900' : 'text-slate-800'
                                }`}
                              >
                                <span className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-xl shrink-0" aria-hidden="true">
                                    {c.flag}
                                  </span>
                                  <span className="truncate">{shortName(c.name)}</span>
                                </span>
                                {isSelected && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div role="group" aria-label="Popular countries" className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-600 mr-1">Popular</span>
                  {QUICK_COUNTRIES.map((q) => {
                    const on = selectedCountry === q.name;
                    const c = ALL_ESTIMATOR_COUNTRIES.find((x) => x.name === q.name);
                    return (
                      <button
                        key={q.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSelectedCountry(q.name)}
                        className={`min-h-[40px] px-3.5 rounded-full border text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 focus-visible:ring-offset-2 ${
                          on ? 'bg-ox-900 text-white border-ox-900' : 'bg-white text-ox-900 border-[#B9C6D8] hover:border-ox-900'
                        }`}
                      >
                        <span aria-hidden="true">{c?.flag}</span>
                        <span>{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* STEP 2 */}
              <section aria-labelledby="step-2-title" className="space-y-3 pt-8 border-t border-[var(--line)]">
                <StepHeading n={2} id="step-2-title" title="Weight" hint="Total parcel weight" done={weightOk} />
                <div className="flex items-center gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={handleDecrementWeight}
                    disabled={weightKg <= 0.5}
                    aria-label="Decrease weight by 0.5 kg"
                    className="h-[52px] w-[52px] shrink-0 rounded-[var(--r-sm)] bg-ox-900 text-white hover:bg-[#123562] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                  >
                    <Minus className="w-5 h-5 stroke-[3]" aria-hidden="true" />
                  </button>
                  <div className="relative flex-1 min-w-0">
                    <label htmlFor="shipment-weight-input" className="sr-only">
                      Total shipment weight in kilograms
                    </label>
                    <input
                      id="shipment-weight-input"
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0.5"
                      max={MAX_WEIGHT_KG}
                      value={weightInputStr}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      aria-invalid={!weightOk}
                      className={`${fieldBox} h-[52px] text-center text-2xl font-extrabold font-mono pl-3 pr-11`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-600 select-none pointer-events-none">kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleIncrementWeight}
                    disabled={weightKg >= MAX_WEIGHT_KG}
                    aria-label="Increase weight by 0.5 kg"
                    className="h-[52px] w-[52px] shrink-0 rounded-[var(--r-sm)] bg-ox-900 text-white hover:bg-[#123562] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" aria-hidden="true" />
                  </button>
                </div>
                <div className="min-h-[28px] flex flex-wrap items-center gap-x-3 gap-y-1">
                  {weightKg > 0 && !overMax && (
                    <motion.span
                      key={boxCount}
                      {...(reduce ? {} : { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } })}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF3F9] border border-[#D5DEEA] text-sm font-bold text-ox-900"
                    >
                      <Package className="w-4 h-4 text-[#8C6400]" aria-hidden="true" />
                      {boxCount} {boxCount === 1 ? 'box' : 'boxes'}
                      <span className="font-medium text-slate-600">· up to 20 kg each</span>
                    </motion.span>
                  )}
                  {!weightOk && (
                    <p role="alert" className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        {overMax
                          ? `For more than ${nf(MAX_WEIGHT_KG)} kg, please chat with us.`
                          : 'Enter a weight of 0.5 kg or more.'}
                      </span>
                    </p>
                  )}
                </div>
              </section>

              {/* STEP 3 */}
              <section aria-labelledby="step-3-title" className="space-y-3 pt-8 border-t border-[var(--line)]">
                <StepHeading n={3} id="step-3-title" title="What is inside?" hint="Optional" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ItemCard
                    checked={hasLiquid}
                    onChange={() => setHasLiquid((p) => !p)}
                    Icon={Droplets}
                    title="Liquid"
                    note={`Rs ${nf(LIQUID_FEE_PER_BOTTLE_NPR)} per bottle`}
                  />
                  <ItemCard
                    checked={hasMeat}
                    disabled={!hasCountry || !isMeatAllowed}
                    onChange={() => setHasMeat((p) => !p)}
                    Icon={UtensilsCrossed}
                    title="Meat"
                    note={
                      !hasCountry
                        ? 'Choose a country first'
                        : !isMeatAllowed
                        ? 'Not allowed for this country'
                        : `Rs ${nf(isHongKong ? MEAT_FEE_HONG_KONG_PER_KG : MEAT_FEE_EUROPE_UK_PER_KG)} per kg`
                    }
                  />
                  <ItemCard
                    checked={hasMedicine}
                    onChange={() => setHasMedicine((p) => !p)}
                    Icon={Pill}
                    title="Medicine"
                    note="Contact us for the price"
                  />
                </div>

                <AnimatePresence initial={false}>
                  {hasLiquid && (
                    <motion.div key="liquid-btl" {...fade} className="p-4 border-2 border-ox-900 rounded-[var(--r-md)] space-y-2 max-w-sm">
                      <label htmlFor="liquid-btl-input" className="block text-sm font-bold text-ox-900">
                        How many bottles of liquid?
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLiquidBottles((b) => Math.max(1, b - 1))}
                          disabled={liquidBottles <= 1}
                          aria-label="One bottle less"
                          className="h-12 w-12 shrink-0 rounded-[var(--r-sm)] bg-ox-900 text-white hover:bg-[#123562] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                        >
                          <Minus className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <div className="flex-1 relative min-w-0">
                          <input
                            id="liquid-btl-input"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="999"
                            value={liquidBottles}
                            onChange={(e) => setLiquidBottles(Math.max(1, Math.min(999, parseInt(e.target.value) || 1)))}
                            className={`${fieldBox} min-h-[48px] h-12 text-center text-xl font-bold font-mono pr-10`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 pointer-events-none">btl</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLiquidBottles((b) => Math.min(999, b + 1))}
                          disabled={liquidBottles >= 999}
                          aria-label="One bottle more"
                          className="h-12 w-12 shrink-0 rounded-[var(--r-sm)] bg-ox-900 text-white hover:bg-[#123562] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                        >
                          <Plus className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-nowrap">
                        {liquidBottles} × Rs {nf(LIQUID_FEE_PER_BOTTLE_NPR)} = <strong className="text-ox-900">Rs {nf(liquidBottles * LIQUID_FEE_PER_BOTTLE_NPR)}</strong>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {hasMedicine && (
                  <p role="status" className="p-3 bg-[#EEF3F9] border border-[#D5DEEA] rounded-[var(--r-sm)] flex items-center gap-2.5 text-sm font-semibold text-ox-900">
                    <Pill className="w-4 h-4 shrink-0 text-[#8C6400]" aria-hidden="true" />
                    <span>Medicine price is not in the total. Chat or call us and we will tell you.</span>
                  </p>
                )}

                {meatNotice && (
                  <p role="status" className="p-3 bg-amber-50 border border-amber-300 rounded-[var(--r-sm)] flex items-center gap-2.5 text-sm font-semibold text-amber-900">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{meatNotice}</span>
                  </p>
                )}

                <AnimatePresence initial={false}>
                  {hasMeat && isMeatAllowed && (
                    <motion.div key="meat-kg" {...fade} className="p-4 border-2 border-ox-900 rounded-[var(--r-md)] space-y-2 max-w-sm">
                      <label htmlFor="meat-kg-input" className="block text-sm font-bold text-ox-900">
                        How many kg of meat?
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleDecrementMeat}
                          disabled={meatKg <= 1}
                          aria-label="Decrease meat by 1 kg"
                          className="h-12 w-12 shrink-0 rounded-[var(--r-sm)] bg-ox-900 text-white hover:bg-[#123562] disabled:opacity-40 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                        >
                          <Minus className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <div className="flex-1 relative min-w-0">
                          <input
                            id="meat-kg-input"
                            type="number"
                            min="1"
                            max={weightKg}
                            value={meatKg}
                            onChange={(e) => setMeatKg(Math.max(1, Math.min(weightKg, parseInt(e.target.value) || 1)))}
                            className={`${fieldBox} min-h-[48px] h-12 text-center text-xl font-bold font-mono pr-9`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 pointer-events-none">kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleIncrementMeat}
                          disabled={meatKg >= weightKg}
                          aria-label="Increase meat by 1 kg"
                          className="h-12 w-12 shrink-0 rounded-[var(--r-sm)] bg-ox-900 text-white hover:bg-[#123562] disabled:opacity-40 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                        >
                          <Plus className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* STEP 4 */}
              <section aria-labelledby="step-4-title" className="space-y-3 pt-8 border-t border-[var(--line)]">
                <StepHeading n={4} id="step-4-title" title="Handover" hint="How do we get it?" done={handoverOk} />
                <div role="radiogroup" aria-labelledby="step-4-title" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'office', title: 'Bring to our office', hint: 'School Road -4, Hetauda', price: 'No extra charge', Icon: Building2 },
                      { id: 'home', title: 'Pick up from home', hint: 'We collect it from you', price: `Free over ${FREE_PICKUP_OVER_KG} kg in ${FREE_PICKUP_AREAS_TEXT}, else + Rs ${nf(HOME_PICKUP_FEE_NPR)}`, Icon: Home },
                    ] as const
                  ).map((opt) => {
                    const active = handover === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`relative flex items-start gap-3 p-4 rounded-[var(--r-md)] border-2 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-gd-500 focus-within:ring-offset-2 ${
                          active ? 'border-ox-900 bg-[#EEF3F9]' : 'border-[#B9C6D8] hover:border-ox-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="handover-method"
                          value={opt.id}
                          checked={active}
                          onChange={() => setHandover(opt.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                            active ? 'border-ox-900 bg-white' : 'border-[#7B8CA6] bg-white'
                          }`}
                        >
                          {active && <span className="w-2.5 h-2.5 rounded-full bg-ox-900" />}
                        </span>
                        <span className="min-w-0 leading-snug">
                          <span className="flex items-center gap-1.5 font-bold text-ox-900">
                            <opt.Icon className="w-4 h-4 shrink-0 text-[#8C6400]" aria-hidden="true" />
                            <span>{opt.title}</span>
                          </span>
                          <span className="block text-sm text-slate-600 mt-0.5">{opt.hint}</span>
                          <span className="block text-sm font-bold text-ox-900 mt-1">{opt.price}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {handover === 'home' && (
                    <motion.div key="pickup" {...fade} className="space-y-3">
                      <div className="max-w-sm">
                        <label htmlFor="pickup-area" className="block text-sm font-bold text-ox-900 mb-1.5">
                          Where are you?
                        </label>
                        <select
                          id="pickup-area"
                          value={pickupArea}
                          onChange={(e) => setPickupArea(e.target.value)}
                          className={`${fieldBox} px-3 text-base font-semibold`}
                        >
                          <option value="">Choose your area</option>
                          {PICKUP_AREAS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                          <option value={OTHER_AREA}>Somewhere else</option>
                        </select>
                      </div>
                      <p
                        role="status"
                        className={`inline-flex items-start gap-2 px-3 py-2 rounded-[var(--r-sm)] text-sm font-semibold ${
                          homePickupOk
                            ? 'bg-emerald-50 text-emerald-800'
                            : pickupArea === OTHER_AREA
                            ? 'bg-red-50 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>
                          {homePickupOk
                            ? `Pickup available in ${pickupArea}. ${pickupFee ? `Rs ${nf(pickupFee)} is added to your price.` : 'It is free for this parcel.'} ${PICKUP_POLICY_EN}`
                            : pickupArea === OTHER_AREA
                            ? 'Home pickup is not available in your area. Please bring the parcel to our office.'
                            : `Home pickup is only for ${PICKUP_AREAS.slice(0, -1).join(', ')} and ${PICKUP_AREAS[PICKUP_AREAS.length - 1]}.`}
                        </span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {/* ============ RIGHT: STEP 5 PRICE ============ */}
            <aside
              aria-labelledby="step-5-title"
              className="min-w-0 p-5 sm:p-8 bg-[#F6F9FD] border-t lg:border-t-0 lg:border-l border-[var(--line)] rounded-b-[var(--r-lg)] lg:rounded-bl-none lg:rounded-r-[var(--r-lg)]"
            >
              <div className="lg:sticky lg:top-24 space-y-4">
                <StepHeading n={5} id="step-5-title" title="Your price" done={quoteOk} />

                <div aria-live="polite" className="min-h-[220px]">
                  <AnimatePresence mode="wait" initial={false}>
                    {loading && !quoteResult && !rateError && hasCountry && weightOk ? (
                      <motion.div key="loading" {...fade} className="rounded-[var(--r-md)] bg-white border border-[var(--line)] p-5 space-y-3" aria-busy="true">
                        <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
                        <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
                        <p className="text-sm text-slate-600">Checking live rates…</p>
                      </motion.div>
                    ) : rateError && !quoteResult ? (
                      <motion.div key="error" {...fade} role="alert" className="rounded-[var(--r-md)] bg-red-50 border border-red-300 p-5 space-y-3">
                        <p className="flex items-start gap-2 text-base font-bold text-red-800">
                          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
                          <span>We could not load the rates. No price is shown.</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => refetch()}
                            className="min-h-[44px] px-4 rounded-[var(--r-sm)] bg-ox-900 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer hover:bg-[#123562] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                          >
                            <RefreshCw className="w-4 h-4" aria-hidden="true" />
                            Try again
                          </button>
                          <a
                            href={getWhatsAppChatUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-4 rounded-[var(--r-sm)] border-2 border-ox-900 text-ox-900 text-sm font-bold inline-flex items-center gap-2 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                          >
                            <MessageSquare className="w-4 h-4" aria-hidden="true" />
                            Chat on WhatsApp
                          </a>
                        </div>
                      </motion.div>
                    ) : quoteResult && !quoteResult.allowed ? (
                      <motion.div key="blocked" {...fade} role="status" className="rounded-[var(--r-md)] bg-amber-50 border border-amber-300 p-5 space-y-3">
                        <p className="flex items-start gap-2 text-base font-bold text-amber-900">
                          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{quoteResult.blockedReason || 'No price is available for this shipment.'}</span>
                        </p>
                        <a
                          href={getWhatsAppChatUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-4 rounded-[var(--r-sm)] border-2 border-ox-900 text-ox-900 text-sm font-bold inline-flex items-center gap-2 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                        >
                          <MessageSquare className="w-4 h-4" aria-hidden="true" />
                          Ask us for a quote
                        </a>
                      </motion.div>
                    ) : quoteResult ? (
                      <motion.div key="quote" {...fade} className="rounded-[var(--r-md)] bg-white border border-ox-900/25 shadow-hard-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-700">
                            {currentCountryObj.flag} {shortName(currentCountryObj.name)} · {quoteResult.totalWeightKg} kg
                          </p>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mt-3">Total</p>
                          <p className="font-mono font-extrabold text-3xl sm:text-4xl text-ox-900 break-words tabular-nums">
                            <span aria-hidden="true">Rs {nf(Math.round(shownTotal))}</span>
                            <span className="sr-only">Rs {nf(quoteResult.totalNpr)}</span>
                          </p>
                          <p
                            className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              priceKind.live ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {priceKind.live ? <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> : <Clock className="w-3.5 h-3.5" aria-hidden="true" />}
                            {priceKind.label}
                            {updatedText && <span className="font-medium"> · {updatedText}</span>}
                          </p>
                        </div>
                        <div className="px-5 py-2">
                          {summaryRow(`Shipping (${quoteResult.totalWeightKg} kg, ${quoteResult.boxCount} ${quoteResult.boxCount === 1 ? 'box' : 'boxes'})`, quoteResult.baseShippingCharge, 'base')}
                          {summaryRow(`Box charge (${quoteResult.boxCount} × Rs ${nf(BOX_CHARGE_NPR)})`, quoteResult.boxCharge, 'box')}
                          {pickupFee > 0 && summaryRow(`Home pickup (${pickupArea})`, pickupFee, 'pickup')}
                          {quoteResult.liquidCharge > 0 && summaryRow(`Liquid (${quoteResult.liquidBottles} × Rs ${nf(LIQUID_FEE_PER_BOTTLE_NPR)})`, quoteResult.liquidCharge, 'liquid')}
                          {quoteResult.meatCharge > 0 && summaryRow(`Meat fee (${meatKg} kg)`, quoteResult.meatCharge, 'meat')}
                          {quoteResult.medicineOnRequest && (
                            <div className="flex justify-between items-start gap-3 py-2 border-b border-slate-200/80 last:border-b-0 text-sm">
                              <span className="text-slate-700 min-w-0">Medicine</span>
                              <span className="font-bold text-[#8C6400] whitespace-nowrap shrink-0">Contact us</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                          <Button variant="primary" size="lg" magnetic leftIcon={<FileText className="w-5 h-5" />} onClick={() => setShowBillModal(true)} className="w-full">
                            Get bill
                          </Button>
                          <a
                            href={getWhatsAppChatUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[48px] px-5 rounded-[var(--r-sm)] border-2 border-ox-900 text-ox-900 hover:bg-[#EEF3F9] font-heading font-extrabold text-base inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                          >
                            <MessageSquare className="w-5 h-5" aria-hidden="true" />
                            Chat
                          </a>
                          <button
                            type="button"
                            onClick={handleShare}
                            className="sm:col-span-2 lg:col-span-1 xl:col-span-2 min-h-[48px] px-5 rounded-[var(--r-sm)] bg-[#EEF3F9] hover:bg-[#D6E1EF] text-ox-900 font-heading font-extrabold text-base inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/60"
                          >
                            {shareStatus === 'copied' ? <Check className="w-5 h-5" aria-hidden="true" /> : <Share2 className="w-5 h-5" aria-hidden="true" />}
                            {shareStatus === 'copied' ? 'Link copied' : 'Share this price'}
                          </button>
                          <p role="status" className="sm:col-span-2 lg:col-span-1 xl:col-span-2 text-xs text-slate-600 -mt-1">
                            {shareStatus === 'copied'
                              ? 'Bill and link copied. Paste it in WhatsApp, Messenger or anywhere.'
                              : shareStatus === 'failed'
                              ? 'Could not share. Please try again.'
                              : 'Sends the bill and a link that opens this exact price.'}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" {...fade} className="rounded-[var(--r-md)] border-2 border-dashed border-[#B9C6D8] bg-white p-6 text-center space-y-2">
                        <Calculator className="w-8 h-8 mx-auto text-[#8C6400]" aria-hidden="true" />
                        <p className="font-heading font-extrabold text-lg text-ox-900">
                          {!hasCountry ? 'Choose a country' : overMax ? 'Weight is too high' : 'Enter the weight'}
                        </p>
                        <p className="text-sm text-slate-600">
                          {!hasCountry
                            ? 'Pick where the parcel is going to see your price.'
                            : 'Add a weight of 0.5 kg or more to see your price.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  All prices are in Nepali rupees (NPR).
                </p>
              </div>
            </aside>
          </div>
        </Spotlight>
      </motion.div>

      {showBillModal && quoteResult && <EstimateBillModal quote={quoteResult} onClose={() => setShowBillModal(false)} />}
    </div>
  );
};
