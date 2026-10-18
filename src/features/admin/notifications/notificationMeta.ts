import type React from 'react';
import { Briefcase, Handshake, MessageSquare, Package, Star } from 'lucide-react';
import type { NotificationKind } from './notificationService';

export const KIND_META: Record<NotificationKind, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  inquiry: { label: 'Inquiry', Icon: MessageSquare },
  partner: { label: 'Partner request', Icon: Handshake },
  booking: { label: 'Booking', Icon: Package },
  review: { label: 'Feedback', Icon: Star },
  job_application: { label: 'Job application', Icon: Briefcase },
};

export const timeAgo = (iso: string): string => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return new Date(iso).toLocaleDateString();
};
