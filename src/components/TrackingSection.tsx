import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  MapPin, 
  Printer, 
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  PhoneCall,
  Plane,
  Truck,
  Ship,
  Box,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Shipment, Milestone } from '../types';
import { fetchPublicTracking } from '../services/trackingService';

interface TrackingSectionProps {
  shipment: Shipment;
  allShipments: Shipment[];
  onSelectShipment: (trackingNumber: string) => void;
  onOpenPrintAwb: (shipment: Shipment) => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  shipment,
  allShipments,
  onSelectShipment,
  onOpenPrintAwb
}) => {
  const [searchCode, setSearchCode] = useState(shipment.trackingNumber || 'BC-90214-HKG');
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(shipment);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentShipment(shipment);
    setSearchCode(shipment.trackingNumber);
    setErrorMessage(null);
  }, [shipment]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setErrorMessage('Please enter your tracking number to track.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await fetchPublicTracking(searchCode.trim());
    setIsLoading(false);

    if (error || !data) {
      setErrorMessage(error || 'We could not find a package with that tracking number. Please check the number and try again.');
      setCurrentShipment(null);
    } else {
      setCurrentShipment(data);
      onSelectShipment(data.trackingNumber);
    }
  };

  const getStatusBadge = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'current':
        return (
          <div className="w-7 h-7 rounded-full bg-[#0B5ED7] text-white flex items-center justify-center shrink-0 animate-pulse shadow-sm">
            <RotateCw className="w-4 h-4 animate-spin" />
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
          </div>
        );
    }
  };

  const isDelivered = currentShipment?.status?.toLowerCase().includes('delivered');
  const isException = currentShipment?.status?.toLowerCase().includes('exception') || currentShipment?.status?.toLowerCase().includes('hold');

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-colors">
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#0B5ED7] dark:text-[#2F80ED] text-xs font-bold uppercase tracking-wider font-mono mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Package Tracking</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Track Your Package
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Enter your tracking number below to see where your package is right now.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0B2445] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            UTC+05:45 (Nepal Standard Time)
          </span>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white dark:bg-[#0B2445] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter your tracking number (e.g. BC-90214-HKG)"
                className="w-full bg-slate-50 dark:bg-[#071A33] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-3 pl-10 text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0B5ED7] focus:ring-2 focus:ring-[#0B5ED7]/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0B5ED7] hover:bg-[#084298] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Package</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="uppercase text-[10px] text-slate-400 shrink-0">Sample Tracking Numbers:</span>
            {allShipments.map((s) => (
              <button
                key={s.trackingNumber}
                onClick={() => {
                  setSearchCode(s.trackingNumber);
                  setCurrentShipment(s);
                  onSelectShipment(s.trackingNumber);
                  setErrorMessage(null);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors shrink-0 cursor-pointer border ${
                  currentShipment?.trackingNumber === s.trackingNumber
                    ? 'bg-[#0B5ED7] text-white border-[#0B5ED7] font-semibold'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.trackingNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Error / Not Found State */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Package Not Found</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <a
              href="mailto:thebcargo@gmail.com"
              className="px-4 py-2 rounded-lg bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider shrink-0 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </a>
          </div>
        )}

        {/* Tracking Details Display */}
        {currentShipment && !errorMessage && (
          <div className="bg-white dark:bg-[#0B2445] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 animate-fadeIn">
            
            {/* Top Overview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B5ED7]/10 text-[#0B5ED7] dark:text-[#2F80ED] flex items-center justify-center shrink-0">
                  {currentShipment.mode === 'ocean' ? <Ship className="w-6 h-6" /> :
                   currentShipment.mode === 'overland' ? <Truck className="w-6 h-6" /> :
                   <Plane className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Tracking #: {currentShipment.trackingNumber}
                    </span>
                    {/* Status Pill */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isDelivered ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                      isException ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                      'bg-blue-100 dark:bg-blue-950 text-[#0B5ED7] dark:text-blue-300'
                    }`}>
                      {currentShipment.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {currentShipment.commodity} • {currentShipment.origin} ➔ {currentShipment.destination}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenPrintAwb(currentShipment)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Metric Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Expected Delivery</span>
                <span className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block">
                  {currentShipment.estimatedDelivery}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Delivery Type</span>
                <span className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block truncate">
                  {currentShipment.mode === 'ocean' ? 'Sea Delivery' :
                   currentShipment.mode === 'overland' ? 'Road Delivery' :
                   currentShipment.mode === 'express' ? 'Fast Delivery' : 'Air Delivery'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Weight</span>
                <span className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block">
                  {currentShipment.grossWeightKg} kg
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Sent From</span>
                <span className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 block truncate">
                  {currentShipment.originHub}
                </span>
              </div>
            </div>

            {/* Milestone Timeline */}
            <div className="pt-2">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-slate-900 dark:text-white mb-6">
                Where Your Package Has Been
              </h3>

              <div className="flex flex-col gap-6 relative pl-2">
                {currentShipment.milestones.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-start gap-4 relative">
                    {idx < currentShipment.milestones.length - 1 && (
                      <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />
                    )}
                    {getStatusBadge(m.status)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          • {m.location}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {m.timestamp}
                      </span>
                      {m.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-[#071A33] p-2 rounded-lg border border-slate-100 dark:border-slate-800 max-w-xl">
                          {m.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support / Contact Assistance */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Have questions about this package or need help?
              </span>
              <a
                href="tel:+977057520000"
                className="text-[#0B5ED7] dark:text-[#2F80ED] font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Us: +977-057-520000</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
