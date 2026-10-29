import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, ErrorState, Input, LoadingState, Modal } from '../../../design/primitives';
import { adminDataService } from '../services/adminDataService';
import { AdminShipment, AdminMilestone } from '../types';
import { useAdminDialogs } from '../AdminConfirmDialog';

/** "2026-10-30T14:05" in this computer's time, the value a datetime-local input takes. */
const localNow = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const when = (ts: string) => {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface TrackingUpdatesProps {
  shipment: Pick<AdminShipment, 'id' | 'origin' | 'destination'>;
  canManage: boolean;
  /** Called after a change: tracking changes also change the shipment's updated_at. */
  onChanged?: () => void;
}

/** A shipment's tracking updates in event order, with add (can be back-dated) and delete. What customers see on the tracking page. */
export const TrackingUpdates: React.FC<TrackingUpdatesProps> = ({ shipment, canManage, onChanged }) => {
  const { confirm, notify } = useAdminDialogs();
  const [list, setList] = useState<AdminMilestone[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(shipment.origin);
  const [at, setAt] = useState(localNow);
  const [busy, setBusy] = useState(false);

  const load = React.useCallback(() => {
    adminDataService.fetchMilestones(shipment.id).then((l) => { setLoadError(null); setList(l); }, (e: Error) => setLoadError(e.message));
  }, [shipment.id]);
  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !list) return;
    const time = new Date(at);
    if (Number.isNaN(time.getTime())) return;
    setBusy(true);
    try {
      setList(await adminDataService.createMilestone({
        shipment_id: shipment.id,
        title: title.trim(),
        location: location.trim() || shipment.destination,
        timestamp: time.toISOString(),
        status: 'completed',
        completed: true,
        description: null,
      }, list));
      setTitle('');
      setAt(localNow());
      onChanged?.();
    } catch (err) {
      void notify((err as Error).message, 'Tracking update not added');
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: AdminMilestone) => {
    if (!(await confirm({ title: 'Delete this tracking update?', body: <>“{m.title}” will no longer show to the customer.</>, confirmLabel: 'Delete update', danger: true }))) return;
    try {
      await adminDataService.deleteMilestone(m.id, shipment.id);
      setList((l) => l?.filter((x) => x.id !== m.id) ?? l);
      onChanged?.();
    } catch (err) {
      void notify((err as Error).message, 'Tracking update not deleted');
    }
  };

  if (loadError) return <ErrorState title="Tracking updates didn't load" description={loadError} actionLabel="Try again" onAction={load} />;
  if (!list) return <LoadingState label="Loading tracking updates" />;

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No tracking updates yet. Customers see only “Order placed” until you add one.</p>
      ) : (
        <ol className="space-y-2">
          {list.map((m) => (
            <li key={m.id} className="flex items-start gap-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--text)] [overflow-wrap:anywhere]">{m.title}</p>
                <p className="text-sm text-[var(--text-muted)] [overflow-wrap:anywhere]">{m.location} · <time dateTime={m.timestamp}>{when(m.timestamp)}</time></p>
              </div>
              {canManage && (
                <button type="button" onClick={() => void remove(m)} aria-label={`Delete tracking update “${m.title}”`} className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[var(--r-sm)] text-[var(--danger)] hover:bg-[var(--danger-bg)] cursor-pointer">
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {canManage && (
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2 border-t border-[var(--line)] pt-4">
          <Input label="What happened" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Departed Kathmandu" required containerClassName="sm:col-span-2" />
          <Input label="Where" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} />
          <Input label="When" type="datetime-local" value={at} max={localNow()} onChange={(e) => setAt(e.target.value)} required helperText="Change it to record something that happened earlier." />
          <div className="sm:col-span-2">
            <Button type="submit" isLoading={busy} disabled={!title.trim() || busy}>Add tracking update</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export const MilestonesModal: React.FC<{ shipment: AdminShipment | null; canManage: boolean; onClose: () => void; onChanged?: () => void }> = ({ shipment, canManage, onClose, onChanged }) => (
  <Modal isOpen={!!shipment} onClose={onClose} title={`Tracking ${shipment?.tracking_number ?? ''}`} description={shipment ? `${shipment.origin} to ${shipment.destination}` : undefined} maxWidth="lg">
    {shipment && <TrackingUpdates shipment={shipment} canManage={canManage} onChanged={onChanged} />}
  </Modal>
);
