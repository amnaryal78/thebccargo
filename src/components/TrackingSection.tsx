import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Search, AlertCircle, PhoneCall, Plane, Truck, Ship, MessageCircle, ShieldCheck, Package, WifiOff, ArrowRight } from 'lucide-react';
import { Shipment } from '../types';
import { fetchPublicTracking, type TrackingFailure } from '../services/trackingService';
import { Button } from '../design/primitives/Button';
import { Seo } from './SEOHead';
import { PAGE_META } from '../data/pageMeta';
import { BUSINESS } from '../data/business';

interface TrackingSectionProps {
  shipment?: Shipment | null;
  allShipments?: Shipment[];
  onSelectShipment?: (trackingNumber: string) => void;
  /** Kept for callers; public tracking has no real waybill data to print, so it is not offered here. */
  onOpenPrintAwb?: (shipment: Shipment) => void;
}

const MODE_LABEL: Record<string, string> = { ocean: 'Sea cargo', overland: 'Road cargo', express: 'Express courier', air: 'Air courier' };

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Staff-entered checkpoint time. Date-only stays date-only (no invented 05:45); free text like "yesterday" is shown as typed. */
const formatWhen = (v?: string) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return DATE_ONLY.test(v)
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu' });
};

/** System timestamp: shown only when it is a real date. */
const validWhen = (v?: string) => (v && !Number.isNaN(new Date(v).getTime()) ? formatWhen(v) : '');

export const TrackingSection: React.FC<TrackingSectionProps> = ({ shipment, onSelectShipment }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTrackingCode = searchParams.get('awb') || searchParams.get('tracking') || searchParams.get('ref') || '';

  const [searchCode, setSearchCode] = useState(urlTrackingCode || shipment?.trackingNumber || '');
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(shipment || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<TrackingFailure | null>(null);

  const executeSearch = useCallback(
    async (code: string) => {
      const clean = code.trim().toUpperCase();
      if (!clean) {
        setFailure('invalid');
        setErrorMessage('Please enter your tracking number.');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setFailure(null);

      const { data, error, reason } = await fetchPublicTracking(clean);
      setIsLoading(false);

      if (error || !data) {
        setFailure(reason ?? 'not_found');
        setErrorMessage(error || `No shipment found for "${clean}".`);
        setCurrentShipment(null);
      } else {
        setCurrentShipment(data);
        onSelectShipment?.(data.trackingNumber);
        setSearchParams({ awb: data.trackingNumber }, { replace: true });
      }
    },
    [onSelectShipment, setSearchParams]
  );

  // Dev-only: ?fixture=demo|worst|empty renders fixture data through the same state as a real lookup.
  const fixture = import.meta.env.DEV ? searchParams.get('fixture') : null;
  useEffect(() => {
    if (!import.meta.env.DEV || !fixture) return;
    void import('../dev/trackingFixtures').then((m) => {
      const f = m.TRACKING_FIXTURES[fixture];
      if (f) {
        setErrorMessage(null);
        setCurrentShipment(f);
      }
    });
  }, [fixture]);

  useEffect(() => {
    if (urlTrackingCode && (!currentShipment || currentShipment.trackingNumber !== urlTrackingCode)) {
      setSearchCode(urlTrackingCode);
      executeSearch(urlTrackingCode);
    }
  }, [urlTrackingCode, executeSearch, currentShipment]);

  useEffect(() => {
    if (shipment) {
      setCurrentShipment(shipment);
      setSearchCode(shipment.trackingNumber);
      setErrorMessage(null);
    }
  }, [shipment]);

  const s = currentShipment;
  const isDelivered = s?.status?.toLowerCase().includes('delivered');
  const isException = /exception|cancel/.test(s?.status?.toLowerCase() ?? '');
  const ModeIcon = s?.mode === 'ocean' ? Ship : s?.mode === 'overland' ? Truck : Plane;
  // Newest completed checkpoint is "where it is now"; nothing is invented for steps that have no event.
  const lastDone = s ? s.milestones.map((m) => m.status === 'completed').lastIndexOf(true) : -1;
  const wa = (text: string) => `${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl mx-auto">
      <Seo title={PAGE_META['/track'].title} description={PAGE_META['/track'].description} />

      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-text)]">Tracking</p>
      <h1 className="mt-3 font-heading font-bold text-[length:var(--fs-h2)] leading-[1.1] tracking-[-0.02em] text-[var(--brand)]">Track your shipment</h1>
      <p className="mt-3 text-[17px] text-[var(--text-muted)]">Enter the tracking number from your BC Cargo receipt.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch(searchCode);
        }}
        role="search"
        className="mt-8 flex flex-col sm:flex-row gap-2 p-2 rounded-[var(--r-md)] bg-[var(--surface)] shadow-hard-md focus-within:ring-2 focus-within:ring-[var(--focus-ring)]"
      >
        <label htmlFor="track-code" className="sr-only">
          Tracking number
        </label>
        <div className="flex-1 flex items-center gap-3 px-3">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
          <input
            id="track-code"
            type="text"
            maxLength={64}
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="e.g. BC-90214-HKG"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            enterKeyHint="search"
            spellCheck={false}
            aria-invalid={failure === 'invalid' || undefined}
            aria-describedby="track-privacy"
            className="w-full h-12 bg-transparent text-[17px] font-mono uppercase placeholder:normal-case text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={isLoading} isLoading={isLoading} leftIcon={<Search className="w-4 h-4" />}>
          Track shipment
        </Button>
      </form>
      <p id="track-privacy" className="mt-3 flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
        <ShieldCheck className="w-4 h-4 text-[var(--green-dark)] shrink-0" aria-hidden="true" />
        Only the shipment status is shown. Personal details stay private.
      </p>

      <div aria-live="polite" className="mt-10">
        {/* Loading */}
        {isLoading && (
          <div className="rounded-[var(--r-lg)] bg-[var(--surface)] shadow-hard-sm p-6 sm:p-8 space-y-5" aria-label="Looking up your shipment">
            <div className="h-6 w-56 rounded bg-[var(--surface-2)] animate-pulse" />
            <div className="h-4 w-40 rounded bg-[var(--surface-2)] animate-pulse" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] animate-pulse" />
                <div className="h-4 flex-1 max-w-xs rounded bg-[var(--surface-2)] animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Invalid / not found / unavailable */}
        {!isLoading && errorMessage && (
          <div className="rounded-[var(--r-lg)] bg-[var(--surface)] shadow-hard-sm p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-start gap-4">
              <span className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${failure === 'unavailable' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--gd-50)] text-[var(--accent-text)]'}`}>
                {failure === 'unavailable' ? <WifiOff className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <h2 className="font-heading font-semibold text-[19px] text-[var(--brand)]">
                  {failure === 'invalid' ? 'Check the tracking number' : failure === 'unavailable' ? 'Tracking is not reachable right now' : 'No shipment found'}
                </h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--text-muted)] [overflow-wrap:anywhere]">
                  {failure === 'unavailable'
                    ? 'We could not connect to our tracking system. Please try again in a moment, or ask our team.'
                    : errorMessage}
                </p>
              </div>
            </div>
            {failure !== 'invalid' && (
              <div className="mt-6 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row gap-3">
                <a
                  href={wa(`Hello BC Cargo, I am trying to track: ${searchCode.trim()}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--r-sm)] bg-[var(--brand)] text-[var(--on-brand)] font-semibold text-[15px] hover:bg-[var(--ox-700)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Ask on WhatsApp
                </a>
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--r-sm)] border border-[var(--line-strong)] text-[var(--brand)] font-semibold text-[15px] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  Call {BUSINESS.phoneDisplay}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Empty: nothing searched yet */}
        {!isLoading && !errorMessage && !s && (
          <div className="rounded-[var(--r-lg)] border border-dashed border-[var(--line-strong)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <span className="w-12 h-12 rounded-[var(--r-sm)] bg-[var(--surface)] shadow-hard-xs grid place-items-center text-[var(--brand)] shrink-0">
              <Package className="w-6 h-6" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-[var(--text)]">Where is my tracking number?</p>
              <p className="mt-1 text-[15px] text-[var(--text-muted)]">It is printed on the receipt we give you when you hand over your parcel.</p>
            </div>
            <Link to="/book" className="inline-flex items-center gap-1.5 min-h-[44px] font-semibold text-[15px] text-[var(--brand)] hover:underline underline-offset-4">
              Not shipped yet? Book now <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* Result */}
        {!isLoading && !errorMessage && s && (
          <article className="rounded-[var(--r-lg)] bg-[var(--surface)] shadow-hard-md overflow-hidden animate-fadeIn">
            <header className="p-6 sm:p-8 border-b border-[var(--line)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="min-w-0 font-mono text-[18px] font-bold text-[var(--text)] [overflow-wrap:anywhere]">{s.trackingNumber}</span>
                {s.status && <span
                  className={`px-2.5 py-1 rounded-[var(--r-xs)] text-[12px] leading-snug font-semibold ${
                    isDelivered ? 'bg-[var(--green-subtle)] text-[var(--green-dark)]' : isException ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--gd-50)] text-[var(--accent-text)]'
                  }`}
                >
                  {s.status}
                </span>}
              </div>
              {(s.origin || s.destination) && (
                <div className="mt-5 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 gap-y-1 items-center text-[16px] leading-snug font-semibold text-[var(--brand)] sm:flex sm:gap-3">
                  <span className="w-2.5 h-2.5 justify-self-center rounded-full border-2 border-[var(--brand)] sm:hidden" aria-hidden="true" />
                  <span className="min-w-0 sm:basis-0 sm:grow [overflow-wrap:break-word]"><span className="sr-only">From </span>{s.origin || 'Nepal'}</span>
                  <ModeIcon className="w-5 h-5 justify-self-center text-[var(--accent-text)] shrink-0 sm:order-2" aria-hidden="true" />
                  <span className="relative h-px route-line sm:order-1 sm:w-16 sm:shrink-0" aria-hidden="true" />
                  <span className="hidden sm:block relative order-3 w-16 shrink-0 h-px route-line" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 justify-self-center rounded-full bg-[var(--accent)] sm:hidden" aria-hidden="true" />
                  <span className="min-w-0 sm:order-4 sm:basis-0 sm:grow [overflow-wrap:break-word]"><span className="sr-only">To </span>{s.destination || 'Destination'}</span>
                </div>
              )}
              <dl className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-4 text-[14px]">
                <div>
                  <dt className="text-[var(--text-muted)]">Service</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--text)]">{MODE_LABEL[s.mode] ?? 'Courier'}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[var(--text-muted)]">Estimated delivery</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--text)]">{s.estimatedDelivery || 'We will confirm soon'}</dd>
                </div>
                {validWhen(s.telemetry?.lastUpdated) && (
                  <div className="min-w-0">
                    <dt className="text-[var(--text-muted)]">Last updated</dt>
                    <dd className="mt-0.5 font-semibold text-[var(--text)]">{validWhen(s.telemetry?.lastUpdated)}</dd>
                  </div>
                )}
              </dl>
            </header>

            <div className="p-6 sm:p-8">
              <h2 className="font-heading font-semibold text-[17px] text-[var(--brand)]">Shipment progress</h2>
              {s.milestones.length === 0 ? (
                <p className="mt-4 text-[15px] text-[var(--text-muted)]">No checkpoints have been added yet. Our team updates this as your shipment moves.</p>
              ) : (
                <ol className="mt-6">
                  {s.milestones.map((m, i) => {
                    const done = m.status === 'completed';
                    const now = i === lastDone;
                    const last = i === s.milestones.length - 1;
                    return (
                      <li key={m.id || i} className="track-step relative flex gap-4 pb-7 last:pb-0" style={{ ['--i' as string]: i }}>
                        {!last && <span aria-hidden="true" style={{ ['--i' as string]: i }} className={`track-rail absolute left-[17px] top-9 bottom-0 w-0.5 ${done ? 'bg-[var(--brand)]' : 'bg-[var(--line-strong)]'}`} />}
                        <span
                          className={`relative z-[1] w-9 h-9 rounded-full grid place-items-center shrink-0 ${
                            now ? 'bg-[var(--accent)] text-[var(--on-accent)] ring-4 ring-[var(--gd-100)]' : done ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-2)] border border-[var(--line-strong)]'
                          }`}
                        >
                          {done ? <Check className="w-4 h-4" aria-hidden="true" /> : <span className="w-2 h-2 rounded-full bg-[var(--ink-400)]" />}
                        </span>
                        <div className="pt-1.5 min-w-0 [overflow-wrap:anywhere]">
                          <p className={`font-semibold text-[16px] ${done ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                            {m.title}
                            <span className="sr-only">{done ? ' (done)' : ' (not yet)'}</span>
                          </p>
                          {(m.location || m.timestamp) && (
                            <p className="mt-0.5 text-[14px] text-[var(--text-muted)] [overflow-wrap:anywhere]">
                              {[m.location, formatWhen(m.timestamp)].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {m.notes && <p className="mt-2 text-[14px] leading-relaxed text-[var(--text)] bg-[var(--surface-2)] rounded-[var(--r-sm)] px-3 py-2 max-w-xl">{m.notes}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <footer className="px-6 sm:px-8 py-5 bg-[var(--surface-subtle)] border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[14px]">
              <span className="text-[var(--text-muted)]">Questions about this shipment?</span>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <a href={wa(`Question about shipment ${s.trackingNumber}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand)] hover:underline">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
                </a>
                <a href={`tel:${BUSINESS.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand)] hover:underline">
                  <PhoneCall className="w-4 h-4" aria-hidden="true" /> {BUSINESS.phoneDisplay}
                </a>
              </div>
            </footer>
          </article>
        )}
      </div>
    </section>
  );
};
