import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Calculator, 
  Globe2, 
  MapPin, 
  ArrowRight, 
  Search, 
  Calendar, 
  Scale, 
  ShieldCheck, 
  FileSpreadsheet, 
  HelpCircle,
  TrendingDown,
  Info,
  CheckCircle2,
  Send,
  Award,
  Star
} from 'lucide-react';
import { 
  fetchNationalRates, 
  fetchInternationalRates, 
  NationalRate, 
  InternationalRate,
  calculateVolumetricWeight,
  getChargeableWeight
} from '../services/ratesService';
import { submitInquiry } from '../services/inquiryService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export const RatesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine subview from URL pathname: /rates/national, /rates/international, /rates/calculator, or default
  const activeTabFromUrl = useMemo<'national' | 'international' | 'calculator' | 'rfq'>(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('international')) return 'international';
    if (path.includes('national')) return 'national';
    if (path.includes('calc')) return 'calculator';
    if (path.includes('rfq')) return 'rfq';
    return 'national';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState<'national' | 'international' | 'calculator' | 'rfq'>(activeTabFromUrl);

  // Sync state if URL changes
  useEffect(() => {
    setActiveTab(activeTabFromUrl);
  }, [activeTabFromUrl]);

  // Handle tab switch and update URL
  const handleTabChange = (tab: 'national' | 'international' | 'calculator' | 'rfq') => {
    setActiveTab(tab);
    if (tab === 'national') navigate('/rates/national');
    else if (tab === 'international') navigate('/rates/international');
    else if (tab === 'calculator') navigate('/rates/calculator');
    else navigate('/rates/rfq');
  };

  // Rates data state
  const [nationalRates, setNationalRates] = useState<NationalRate[]>([]);
  const [intlRates, setIntlRates] = useState<InternationalRate[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('All');

  // Interactive Calculator State
  const [calcMode, setCalcMode] = useState<'air' | 'overland'>('air');
  const [actualWeight, setActualWeight] = useState<string>('2.5');
  const [lengthCm, setLengthCm] = useState<string>('30');
  const [widthCm, setWidthCm] = useState<string>('20');
  const [heightCm, setHeightCm] = useState<string>('15');

  // RFQ Submission State
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqData, setRfqData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    origin: 'Nepal (Hetauda HQ)',
    destination: 'Europe (Frankfurt)',
    serviceType: 'Dedicated Air Charter',
    estimatedMonthlyVolume: '5 - 20 Tons',
    requirements: ''
  });

  // Consignee Quality Audit State
  const [auditSubmitted, setAuditSubmitted] = useState(false);
  const [auditData, setAuditData] = useState({
    consignmentId: '',
    rating: 5,
    timelinessRating: 'Exact On-Time Delivery',
    handlingCondition: 'Pristine / Intact E-Seal',
    clientComments: ''
  });

  useEffect(() => {
    let isMounted = true;
    async function loadRates() {
      setLoading(true);
      try {
        const [nat, intl] = await Promise.all([
          fetchNationalRates(),
          fetchInternationalRates()
        ]);
        if (isMounted) {
          setNationalRates(nat);
          setIntlRates(intl);
        }
      } catch (err) {
        console.error('Failed to load rates:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRates();
    return () => { isMounted = false; };
  }, []);

  // Filtered National Rates
  const filteredNational = useMemo(() => {
    return nationalRates.filter(r => {
      const matchQuery = 
        r.destinationRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.originRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchService = selectedService === 'All' || r.serviceName === selectedService;
      return matchQuery && matchService;
    });
  }, [nationalRates, searchQuery, selectedService]);

  // Filtered International Rates
  const filteredInternational = useMemo(() => {
    return intlRates.filter(r => {
      const matchQuery = 
        r.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchService = selectedService === 'All' || r.serviceName === selectedService;
      return matchQuery && matchService;
    });
  }, [intlRates, searchQuery, selectedService]);

  // Calculator Computations
  const numActualWeight = parseFloat(actualWeight) || 0;
  const numLength = parseFloat(lengthCm) || 0;
  const numWidth = parseFloat(widthCm) || 0;
  const numHeight = parseFloat(heightCm) || 0;
  const volumetricWeight = calculateVolumetricWeight(numLength, numWidth, numHeight, calcMode);
  const chargeableWeight = getChargeableWeight(numActualWeight, volumetricWeight);

  // RFQ Submission
  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRfqLoading(true);
    try {
      await submitInquiry({
        name: `${rfqData.contactPerson} (${rfqData.companyName})`,
        email: rfqData.email,
        phone: rfqData.phone,
        serviceMode: rfqData.serviceType.toLowerCase().includes('air') ? 'air' : 'overland',
        subject: `Enterprise Tariff RFQ: ${rfqData.origin} -> ${rfqData.destination}`,
        message: `Company: ${rfqData.companyName}\nMonthly Volume: ${rfqData.estimatedMonthlyVolume}\nService: ${rfqData.serviceType}\nNotes: ${rfqData.requirements}`
      });
      setRfqSubmitted(true);
    } catch (err) {
      console.error('RFQ submission failed:', err);
    } finally {
      setRfqLoading(false);
    }
  };

  // Consignee Quality Audit Submission
  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditData.consignmentId.trim()) return;

    try {
      await submitInquiry({
        name: `Consignee (${auditData.consignmentId})`,
        email: 'thebcargo@gmail.com',
        subject: `Consignee Quality Audit - ${auditData.consignmentId}`,
        message: `Rating: ${auditData.rating}/5\nTimeliness: ${auditData.timelinessRating}\nCondition: ${auditData.handlingCondition}\nComments: ${auditData.clientComments}`
      });
      setAuditSubmitted(true);
    } catch (err) {
      console.error('Audit submit error:', err);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
      
      {/* Hero Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" />
          <span>Clear &amp; Honest Prices</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white uppercase tracking-tight">
          Delivery Prices &amp; Calculator
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Check our prices for delivery across Nepal and to over 50 countries worldwide. No hidden fees.
        </p>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex justify-center">
        <div className="p-1 bg-slate-100 dark:bg-[#060919] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('national')}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'national'
                ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Prices in Nepal (NPR)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('international')}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'international'
                ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Worldwide Prices (USD)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('calculator')}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Box Size &amp; Weight Calculator</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('rfq')}
            className={`px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rfq'
                ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Special Pricing &amp; Reviews</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: NATIONAL RATES */}
      {/* ==================================================================== */}
      {activeTab === 'national' && (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search destination, region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B5ED7]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Currency: <strong className="text-slate-900 dark:text-white">NPR (रु)</strong>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Version: <strong className="text-slate-900 dark:text-white">2026 Q1 Schedule</strong>
              </span>
            </div>
          </div>

          {/* National Rates Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#060919] uppercase font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 font-bold">Delivery Type</th>
                    <th className="p-4 font-bold">Sent From</th>
                    <th className="p-4 font-bold">Going To</th>
                    <th className="p-4 font-bold">Weight Range</th>
                    <th className="p-4 font-bold">Starting Price</th>
                    <th className="p-4 font-bold">Per Extra kg</th>
                    <th className="p-4 font-bold text-right">Send Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                        Loading prices for Nepal...
                      </td>
                    </tr>
                  ) : filteredNational.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No prices found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredNational.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0B5ED7] dark:text-blue-400 font-mono font-bold text-[11px]">
                            {r.serviceName}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{r.originRegion}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{r.destinationRegion}</td>
                        <td className="p-4 font-mono text-slate-500 dark:text-slate-400">
                          {r.minWeightKg} - {r.maxWeightKg} kg
                        </td>
                        <td className="p-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          NPR {r.baseRateNpr.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                          + NPR {r.perKgRateNpr} / kg
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to="/book"
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0B5ED7] hover:underline"
                          >
                            <span>Send</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Explanatory Callout */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-[#0B5ED7] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Doorstep Pickup Included:</strong> Rates include standard doorstep pickup in Kathmandu Valley and Hetauda. For distant mountain districts, small extra fees may apply.
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: INTERNATIONAL RATES */}
      {/* ==================================================================== */}
      {activeTab === 'international' && (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B5ED7]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Currency: <strong className="text-slate-900 dark:text-white">USD ($)</strong>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Schedule: <strong className="text-slate-900 dark:text-white">Valid 2026</strong>
              </span>
            </div>
          </div>

          {/* International Rates Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#060919] uppercase font-mono text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 font-bold">Destination Country</th>
                    <th className="p-4 font-bold">Country Code</th>
                    <th className="p-4 font-bold">Delivery Type</th>
                    <th className="p-4 font-bold">Weight Range</th>
                    <th className="p-4 font-bold">Price (USD)</th>
                    <th className="p-4 font-bold">Customs Help</th>
                    <th className="p-4 text-right">Send Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                        Loading worldwide prices...
                      </td>
                    </tr>
                  ) : filteredInternational.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No destinations found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredInternational.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Globe2 className="w-3.5 h-3.5 text-[#0B5ED7]" />
                            <span>{r.countryName}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                          {r.countryCode}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0B5ED7] dark:text-blue-400 font-mono text-[11px]">
                            {r.serviceName}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-500 dark:text-slate-400">
                          {r.minWeightKg} - {r.maxWeightKg} kg
                        </td>
                        <td className="p-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          ${r.rateUsd.toFixed(2)} USD
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          Customs Help Included
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to="/book"
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0B5ED7] hover:underline"
                          >
                            <span>Send</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* International Shipping Policy Note */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#060919] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Customs &amp; Paperwork Included:</strong> All international deliveries leaving Nepal are handled under Government Customs Broker License #B-409. We take care of the official export paperwork so your package travels smoothly.
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: VOLUMETRIC WEIGHT CALCULATOR */}
      {/* ==================================================================== */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                  Box Size &amp; Weight Calculator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Delivery price is based on whichever is bigger: the actual weight on a scale, or the space the box takes up. Enter your box measurements below to check.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">How are you sending?</span>
                <div className="p-1 bg-slate-100 dark:bg-[#060919] rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCalcMode('air')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                      calcMode === 'air'
                        ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Air Delivery (By Airplane)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMode('overland')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                      calcMode === 'overland'
                        ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Road Delivery (By Truck)
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Actual Weight on Scale (kg)"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  placeholder="e.g. 5.0"
                />
                <Input
                  label="Box Length (cm)"
                  type="number"
                  step="1"
                  min="1"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                  placeholder="e.g. 40"
                />
                <Input
                  label="Box Width (cm)"
                  type="number"
                  step="1"
                  min="1"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  placeholder="e.g. 30"
                />
                <Input
                  label="Box Height (cm)"
                  type="number"
                  step="1"
                  min="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>

              {/* Formula Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">How we calculate:</div>
                <div>Size Weight (kg) = (Length × Width × Height) ÷ {calcMode === 'air' ? '5000' : '6000'}</div>
                <div>Billed Weight = Whichever is higher (Actual Weight or Size Weight)</div>
              </div>
            </Card>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="p-6 flex flex-col gap-6 bg-gradient-to-br from-[#071A33] to-[#0E1638] text-white border-white/10 shadow-xl">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#F5C84C] font-bold tracking-wider">
                  Your Calculation
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white mt-1">
                  Billed Weight Summary
                </h3>
              </div>

              <div className="space-y-4 border-y border-white/10 py-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Weight on Scale:</span>
                  <span className="font-mono font-bold text-white text-sm">{numActualWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Size Weight ({calcMode === 'air' ? 'Air' : 'Road'}):</span>
                  <span className="font-mono font-bold text-white text-sm">{volumetricWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Box Volume:</span>
                  <span className="font-mono text-slate-300">
                    {((numLength * numWidth * numHeight) / 1000000).toFixed(4)} CBM (m³)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/20 flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                  Weight You Pay For (Billed Weight)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-extrabold text-3xl text-[#F5C84C]">
                    {chargeableWeight.toFixed(2)} kg
                  </span>
                  <span className="text-xs text-slate-300">
                    ({chargeableWeight === numActualWeight ? 'Scale Weight Applied' : 'Size Weight Applied'})
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate('/book')}
                className="w-full"
              >
                <span>Send This Package</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: ENTERPRISE RFQ & QUALITY AUDIT */}
      {/* ==================================================================== */}
      {activeTab === 'rfq' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Enterprise RFQ */}
          <Card className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#F5C84C]" />
                <span>Business &amp; Bulk Discounts</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                Special Pricing for Businesses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                If you ship regularly or have large cargo volumes, tell us about your needs and our team in Hetauda will prepare a custom discount rate for you.
              </p>
            </div>

            {rfqSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center gap-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Request Received!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                  Thank you, <strong>{rfqData.contactPerson}</strong>. Our team will review your details and contact you within 4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setRfqSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-[#0E1638] dark:bg-[#0B5ED7] text-white text-xs font-bold uppercase"
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleRfqSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Business or Company Name *"
                    placeholder="e.g. Himalayan Craft Exports"
                    value={rfqData.companyName}
                    onChange={(e) => setRfqData({ ...rfqData, companyName: e.target.value })}
                    required
                  />
                  <Input
                    label="Your Name &amp; Role *"
                    placeholder="e.g. Ramesh Sharma (Manager)"
                    value={rfqData.contactPerson}
                    onChange={(e) => setRfqData({ ...rfqData, contactPerson: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="you@company.com"
                    value={rfqData.email}
                    onChange={(e) => setRfqData({ ...rfqData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="+977-98..."
                    value={rfqData.phone}
                    onChange={(e) => setRfqData({ ...rfqData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Sent From (City or Hub)"
                    value={rfqData.origin}
                    onChange={(e) => setRfqData({ ...rfqData, origin: e.target.value })}
                  />
                  <Input
                    label="Going To (Destination City or Country)"
                    value={rfqData.destination}
                    onChange={(e) => setRfqData({ ...rfqData, destination: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Shipments Per Month
                  </label>
                  <select
                    value={rfqData.estimatedMonthlyVolume}
                    onChange={(e) => setRfqData({ ...rfqData, estimatedMonthlyVolume: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0B5ED7]"
                  >
                    <option value="1 - 5 Tons">1 - 5 Tons / Month</option>
                    <option value="5 - 20 Tons">5 - 20 Tons / Month</option>
                    <option value="20 - 100 Tons">20 - 100 Tons / Month</option>
                    <option value="10+ Full Containers (FCL)">10+ Full Containers / Month</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={rfqLoading}
                  className="w-full mt-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>{rfqLoading ? 'Sending Request...' : 'Request Business Rates'}</span>
                </Button>
              </form>
            )}
          </Card>

          {/* Right: Consignee Quality Audit */}
          <Card className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Customer Feedback</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                Rate Your Delivery Experience
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help us keep our standards high. Let us know how your delivery went and how our service performed.
              </p>
            </div>

            {auditSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center gap-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Thank You for Your Feedback!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                  Your feedback for package <strong>{auditData.consignmentId}</strong> has been received by our quality management team.
                </p>
                <button
                  type="button"
                  onClick={() => setAuditSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-[#0E1638] dark:bg-[#0B5ED7] text-white text-xs font-bold uppercase"
                >
                  Submit More Feedback
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuditSubmit} className="flex flex-col gap-4">
                <Input
                  label="Your Tracking Number *"
                  placeholder="e.g. BC-90214-HKG"
                  value={auditData.consignmentId}
                  onChange={(e) => setAuditData({ ...auditData, consignmentId: e.target.value })}
                  required
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    How was your experience?
                  </label>
                  <div className="flex items-center gap-2 h-10 px-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAuditData({ ...auditData, rating: star })}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= auditData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {auditData.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Did your package arrive on time?
                  </label>
                  <select
                    value={auditData.timelinessRating}
                    onChange={(e) => setAuditData({ ...auditData, timelinessRating: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0B5ED7]"
                  >
                    <option value="Delivered Ahead of SLA">Arrived earlier than expected</option>
                    <option value="Exact On-Time Delivery">Delivered right on time</option>
                    <option value="Within Tolerance Window">Arrived on time</option>
                    <option value="Minor Delay">Slight delay</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Package Condition on Arrival
                  </label>
                  <select
                    value={auditData.handlingCondition}
                    onChange={(e) => setAuditData({ ...auditData, handlingCondition: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0B5ED7]"
                  >
                    <option value="Pristine / Intact E-Seal">Perfect condition (No damage)</option>
                    <option value="Good Condition">Good condition (Normal handling)</option>
                    <option value="Outer Carton Distress">Outer box slightly marked / Items safe</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full mt-2"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Submit Your Feedback</span>
                </Button>
              </form>
            )}
          </Card>

        </div>
      )}

    </div>
  );
};
