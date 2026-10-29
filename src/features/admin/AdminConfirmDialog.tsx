import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button, Modal } from '../../design/primitives';

interface ConfirmOptions {
  title: string;
  /** What will happen, naming the record: "Shipment BC1203AB and its tracking updates will be deleted." */
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
}

interface Dialogs {
  /** Resolves true only if the person chose the confirm button. Replaces window.confirm. */
  confirm: (o: ConfirmOptions) => Promise<boolean>;
  /** Shows a message with one OK button. Replaces window.alert. */
  notify: (body: React.ReactNode, title?: string) => Promise<void>;
}

const Ctx = createContext<Dialogs | null>(null);

type Open = (ConfirmOptions & { kind: 'confirm' }) | { kind: 'notify'; title: string; body: React.ReactNode };

/** One dialog at a time for the whole admin, rendered with the Modal primitive (focus in, Escape, focus back). */
export const AdminDialogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState<Open | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => undefined);

  const settle = useCallback((v: boolean) => {
    setOpen(null);
    resolver.current(v);
  }, []);

  const confirm = useCallback<Dialogs['confirm']>((o) => {
    setOpen({ ...o, kind: 'confirm' });
    return new Promise<boolean>((res) => (resolver.current = res));
  }, []);

  const notify = useCallback<Dialogs['notify']>((body, title = 'Something needs your attention') => {
    setOpen({ kind: 'notify', title, body });
    return new Promise<void>((res) => (resolver.current = () => res()));
  }, []);

  return (
    <Ctx.Provider value={{ confirm, notify }}>
      {children}
      <Modal
        isOpen={!!open}
        onClose={() => settle(false)}
        title={open?.title ?? ''}
        maxWidth="sm"
        footer={
          open?.kind === 'confirm' ? (
            <>
              {/* A destructive choice never has focus first, so Enter cannot delete by accident. */}
              <Button variant="ghost" onClick={() => settle(false)} data-autofocus={open.danger || undefined}>Cancel</Button>
              <Button variant={open.danger ? 'danger' : 'secondary'} onClick={() => settle(true)} data-autofocus={!open.danger || undefined}>
                {open.confirmLabel}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => settle(true)} data-autofocus>OK</Button>
          )
        }
      >
        <div className="text-[15px] text-[var(--text)] [overflow-wrap:anywhere]">{open?.body}</div>
      </Modal>
    </Ctx.Provider>
  );
};

export function useAdminDialogs(): Dialogs {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminDialogs must be used inside AdminDialogsProvider (AdminShell).');
  return ctx;
}
