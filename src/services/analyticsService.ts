import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AnalyticsEvent {
  eventType: string;
  payload?: Record<string, any>;
}

export async function logAnalyticsEvent(eventType: string, payload?: Record<string, any>): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          payload: payload || {}
        });
    } catch (e) {}
  }
}
