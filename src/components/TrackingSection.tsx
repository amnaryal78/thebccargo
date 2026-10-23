import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  RotateCw, 
  MapPin, 
  Printer, 
  RefreshCw,
  Search,
  AlertCircle,
  PhoneCall,
  Plane,
  Truck,
  Ship,
  HelpCircle,
  MessageCircle,
  Clock,
  ShieldCheck,
  Package
} from 'lucide-react';
import { Shipment, Milestone } from '../types';
import { fetchPublicTracking } from '../services/trackingService';
import { Button } from '../design/primitives/Button';
import { Spotlight } from './ui/spotlight';
import { Seo } from './SEOHead';
import { PAGE_META } from '../data/pageMeta';

interface TrackingSectionProps {
  shipment?: Shipment | null;
  allShipments?: Shipment[];
  onSelectShipment?: (trackingNumber: string) => void;
  onOpenPrintAwb?: (shipment: Shipment) => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  shipment,
  onSelectShipment,
  onOpenPrintAwb
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTrackingCode = searchParams.get('awb') || searchParams.get('tracking') || searchParams.get('ref') || '';

  const [searchCode, setSearchCode] = useState(urlTrackingCode || shipment?.trackingNumber || '');
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(shipment || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeSearch = useCallback(async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('Please enter your Waybill (AWB) or tracking number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await fetchPublicTracking(clean);
    setIsLoading(false);

    if (error || !data) {
      setErrorMessage(
        error || `No active consignment found for "${clean}". Please verify your AWB or call us on 057-591816.`
      );
      setCurrentShipment(null);
    } else {
      setCurrentShipment(data);
      if (onSelectShipment) {
        onSelectShipment(data.trackingNumber);
      }
      setSearchParams({ awb: data.trackingNumber }, { replace: true });
    }
  }, [onSelectShipment, setSearchParams]);

  // Handle URL param on mount or change
  useEffect(() => {
    if (urlTrackingCode && (!currentShipment || currentShipment.trackingNumber !== urlTrackingCode)) {
      setSearchCode(urlTrackingCode);
      executeSearch(urlTrackingCode);
    }
  }, [urlTrackingCode, executeSearch, currentShipment]);

  // Sync prop shipment if changed from outside
  useEffect(() => {
    if (shipment) {
      setCurrentShipment(shipment);
      setSearchCode(shipment.trackingNumber);
      setErrorMessage(null);
    }
  }, [shipment]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchCode);
  };

  const getStatusNode = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-hard-xs border border-white/60">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'current':
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--gold)] text-[var(--oxford-deep)] flex items-center justify-center shrink-0 shadow-hard-xs border border-ox-900/40 animate-pulse">
            <RotateCw className="w-4 h-4 animate-spin" />
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center shrink-0 border border-[var(--line)] shadow-hard-xs">
            <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
          </div>
        );
    }
  };

  const isDelivered = currentShipment?.status?.toLowerCase().includes('delivered');
  const isException = currentShipment?.status?.toLowerCase().includes('exception') || currentShipment?.status?.toLowerCase().includes('hold');

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-colors">
      <Seo title={PAGE_META['/track'].title} description={PAGE_META['/track'].description} />
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--oxford-deep)] text-xs font-bold uppercase tracking-wider font-mono mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Waybill Tracking System</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[var(--text)] tracking-tight">
              Track Consignment
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Direct database query across Nepal linehaul, bonded customs, and international freight nodes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1.5 rounded-[var(--r-xs)] border border-[var(--line)] shadow-hard-xs self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-[var(--gold-dark)]" />
            <span>UTC+05:45 (Nepal Standard Time)</span>
          </div>
        </div>

        {/* Tracking Input Card */}
        <Spotlight
          intensity="normal"
          className="bg-[var(--surface)] p-5 sm:p-6 rounded-[var(--r-md)] border border-[var(--line)] shadow-hard flex flex-col gap-3"
        >
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Waybill / AWB Code (e.g. BC-90214-HKG)"
                className="w-full min-h-[48px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-sm)] px-4 py-3 pl-11 text-xs sm:text-sm font-mono text-[var(--text)] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent transition-all clay-inset shadow-none"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              isLoading={isLoading}
              className="shrink-0 min-h-[48px] px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              <span>Track Consignment</span>
            </Button>
          </form>

          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 px-1">
            <span>Official Air Waybills (AWB) &amp; Consignment Manifests only</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-PII Public Query</span>
            </span>
          </div>
        </Spotlight>

        {/* Error / Not Found State with WhatsApp & Phone fallback */}
        {errorMessage && (
          <div className="p-6 rounded-[var(--r-md)] bg-amber-500/10 border border-amber-500/30 shadow-hard-xs text-[var(--text)] flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="font-heading font-bold text-base text-[var(--text)]">Consignment Not Found</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-amber-500/20">
              <span className="text-xs font-mono text-[var(--text-muted)] self-start sm:self-auto">
                Need urgent tracing assistance?
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                <a
                  href={`https://wa.me/9779855019485?text=${encodeURIComponent(`Hello BC Cargo, I am trying to track consignment code: ${searchCode.trim()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full whitespace-nowrap"
                    leftIcon={<MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />}
                  >
                    WhatsApp Dispatch
                  </Button>
                </a>
                <a
                  href="tel:+977057591816"
                  className="flex-1 sm:flex-initial"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full whitespace-nowrap"
                    leftIcon={<PhoneCall className="w-3.5 h-3.5 shrink-0" />}
                  >
                    Call 057-591816
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Details Display */}
        {currentShipment && !errorMessage && (
          <Spotlight
            intensity="strong"
            className="bg-[var(--surface)] rounded-[var(--r-md)] p-6 sm:p-8 border border-[var(--line)] shadow-hard flex flex-col gap-8 animate-fadeIn"
          >
            
            {/* Top Overview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[var(--r-sm)] bg-[var(--surface-2)] text-[var(--oxford-deep)] border border-[var(--line)] flex items-center justify-center shrink-0">
                  {currentShipment.mode === 'ocean' ? <Ship className="w-7 h-7" /> :
                   currentShipment.mode === 'overland' ? <Truck className="w-7 h-7" /> :
                   <Plane className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--text)]">
                      AWB #{currentShipment.trackingNumber}
                    </span>
                    {/* Status Pill */}
                    <span className={`px-2.5 py-0.5 rounded-[var(--r-xs)] text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isDelivered ? 'bg-emerald-500 text-white' :
                      isException ? 'bg-amber-500 text-slate-900 font-bold' :
                      'bg-[var(--gold)] text-[var(--oxford-deep)]'
                    }`}>
                      {currentShipment.status}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] mt-1 block">
                    {currentShipment.serviceName || 'Scheduled Cargo Transit'} • {currentShipment.origin} ➔ {currentShipment.destination}
                  </span>
                </div>
              </div>

              {onOpenPrintAwb && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenPrintAwb(currentShipment)}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                    <span>Print Waybill Receipt</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Metric Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Estimated Delivery</span>
                <span className="font-heading text-sm sm:text-base font-bold text-[var(--text)] mt-1 block">
                  {currentShipment.estimatedDelivery}
                </span>
              </div>
              <div className="p-3.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Service Corridor</span>
                <span className="font-heading text-sm sm:text-base font-bold text-[var(--text)] mt-1 block truncate">
                  {currentShipment.mode === 'ocean' ? 'Maritime Intermodal' :
                   currentShipment.mode === 'overland' ? 'Cross-Border Overland' :
                   currentShipment.mode === 'express' ? 'Priority Express Air' : 'Standard Air Freight'}
                </span>
              </div>
              <div className="p-3.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Gross Weight</span>
                <span className="font-heading text-sm sm:text-base font-bold text-[var(--text)] mt-1 block">
                  {currentShipment.grossWeightKg} kg
                </span>
              </div>
              <div className="p-3.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Origin Gateway</span>
                <span className="font-heading text-sm sm:text-base font-bold text-[var(--text)] mt-1 block truncate">
                  {currentShipment.originHub}
                </span>
              </div>
            </div>

            {/* Milestone Timeline */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--gold-dark)]" />
                  <span>Verified Transit Milestones</span>
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {currentShipment.milestones.length} Checkpoints
                </span>
              </div>

              <div className="flex flex-col gap-6 relative pl-1">
                {currentShipment.milestones.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-start gap-4 relative">
                    {idx < currentShipment.milestones.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[var(--line)] -translate-x-1/2" />
                    )}
                    {getStatusNode(m.status)}
                    <div className="flex flex-col flex-1 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-[var(--text)]">
                          {m.title}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          • {m.location}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                        {m.timestamp}
                      </span>
                      {m.notes && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2 bg-[var(--surface-2)] p-2.5 rounded-[var(--r-xs)] border border-[var(--line)] max-w-2xl leading-relaxed">
                          {m.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support / Help footer */}
            <div className="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <span className="text-[var(--text-secondary)]">
                Questions about customs clearance status or delivery timing?
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/9779855019485?text=${encodeURIComponent(`Inquiry for AWB: ${currentShipment.trackingNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">WhatsApp Tracing</span>
                </a>
                <span className="text-[var(--line-strong)]">|</span>
                <a
                  href="tel:+977057591816"
                  className="font-mono font-bold text-[var(--oxford-deep)] hover:underline flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap font-mono">057-591816 / 9855019485</span>
                </a>
              </div>
            </div>

          </Spotlight>
        )}

      </div>
    </section>
  );
};
