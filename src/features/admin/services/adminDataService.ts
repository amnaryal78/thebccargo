import { friendlyError } from '../friendlyError';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import {
  AdminProfileFields,
  AdminProfileRequest,
  ResellerStats,
  ProfileField,
  AdminShipment,
  AdminMilestone,
  AdminInquiry,
  AdminHandlingRule,
  AdminNationalRate,
  AdminInternationalRate,
  AdminBlog,
  AdminCareer,
  AdminJobApplication,
  AdminUserRole,
  AdminRateSetting,
  AdminAuditLog,
  TodayDashboard
} from '../types';

export class AdminServiceError extends Error {
  // Staff see a plain sentence; the raw database error stays in `details` for developers.
  constructor(message: string, public details?: any) {
    super(friendlyError(details ?? message));
    this.name = 'AdminServiceError';
  }
}

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new AdminServiceError('Database is not configured. Real Supabase connection required.');
  }
}

export const SHIPMENT_PAGE_SIZE = 25;
const SHIPMENT_LIST_COLUMNS =
  'id, tracking_number, mode, service_name, status, commodity, origin, destination, shipper_company, consignee_company, sender_name, receiver_name, receiver_phone, gross_weight_kg, chargeable_weight_kg, pieces, total_npr, created_at, updated_at';
const SHIPMENT_SEARCH_COLUMNS = ['tracking_number', 'receiver_name', 'sender_name', 'receiver_phone', 'consignee_company', 'shipper_company', 'destination'];

/** Search text made safe for PostgREST's or() filter, where , ( ) are separators and * % are wildcards. */
export function shipmentSearchTerm(q: string): string {
  return q.replace(/[,()*%\\"]/g, ' ').replace(/\s+/g, ' ').trim();
}

export class ShipmentConflictError extends Error {
  constructor() {
    super('Someone else changed this shipment after you opened it.');
  }
}

/** Tracking updates in event order; an unreadable time sorts last, ties keep their entry order. */
export function orderMilestones<T extends { timestamp: string; sort_order: number }>(list: T[]): T[] {
  const t = (m: T) => {
    const n = Date.parse(m.timestamp);
    return Number.isNaN(n) ? Infinity : n;
  };
  return [...list].sort((a, b) => t(a) - t(b) || a.sort_order - b.sort_order);
}

/** A tracking change counts as a shipment change: public "last updated", the Today page and the stale filter read updated_at. */
async function touchShipment(id: string): Promise<void> {
  const { error } = await supabase.from('shipments').update({ updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new AdminServiceError(error.message, error);
}

export const adminDataService = {
  // ---------------------------------------------------------------------------
  // AUDIT LOGGING HELPER
  // ---------------------------------------------------------------------------
  async logAction(action: string, targetEntity: string, metadata?: Record<string, any>): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const actorEmail = session?.user?.email || 'system';
      await supabase.from('audit_logs').insert({
        actor_email: actorEmail,
        action,
        target_entity: targetEntity,
        metadata: metadata || {}
      });
    } catch (e) {
      console.warn('[Admin Audit] Failed to write audit log:', e);
    }
  },

  // ---------------------------------------------------------------------------
  // DASHBOARD OVERVIEW METRICS
  // ---------------------------------------------------------------------------
  /** Everything the Today page shows, counted by the database in one call (migration 20261030000007). */
  async fetchTodayDashboard(): Promise<TodayDashboard> {
    ensureConfigured();
    const { data, error } = await supabase.rpc('get_today_dashboard');
    if (error) throw new AdminServiceError(error.message, error);
    return data as TodayDashboard;
  },

  // ---------------------------------------------------------------------------
  // SHIPMENTS & MILESTONES
  // ---------------------------------------------------------------------------
  /** One page of the shipment list, filtered and searched in the database. Leaves out the bill JSON. */
  async fetchShipmentsPage(f: { q: string; status: string; stale: boolean; page: number }): Promise<{ rows: AdminShipment[]; total: number }> {
    ensureConfigured();
    let query = supabase
      .from('shipments')
      .select(SHIPMENT_LIST_COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(f.page * SHIPMENT_PAGE_SIZE, f.page * SHIPMENT_PAGE_SIZE + SHIPMENT_PAGE_SIZE - 1);
    const q = shipmentSearchTerm(f.q);
    if (q) query = query.or(SHIPMENT_SEARCH_COLUMNS.map((c) => `${c}.ilike.*${q}*`).join(','));
    if (f.status !== 'all') query = query.eq('status', f.status);
    // Same rule as the Today page: open, nothing changed for 3 days (tracking updates touch updated_at).
    if (f.stale) query = query.not('status', 'in', '(delivered,cancelled)').lt('updated_at', new Date(Date.now() - 3 * 86400000).toISOString());
    const { data, error, count } = await query;
    if (error) throw new AdminServiceError(error.message, error);
    return { rows: (data as unknown as AdminShipment[]) || [], total: count ?? 0 };
  },

  // ---------------------------------------------------------------------------
  // ITEM NAME CATALOG (suggestions for the shipment form)
  // ---------------------------------------------------------------------------
  async fetchItemCatalog(): Promise<{ name: string; unit: string | null; category: string | null; uses: number }[]> {
    ensureConfigured();
    const { data, error } = await supabase.from('item_catalog').select('name, unit, category, uses').order('uses', { ascending: false }).limit(3000);
    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  /** Count one use for each item name on a saved bill. Learning names must never block saving, so callers ignore failures. */
  async recordItemUsage(items: { name: string; unit?: string; category?: string }[]): Promise<void> {
    ensureConfigured();
    const byKey = new Map<string, { name: string; unit?: string; category?: string }>();
    for (const i of items) {
      const name = i.name.trim().replace(/\s+/g, ' ');
      if (name) byKey.set(name.toLowerCase(), { ...i, name });
    }
    if (!byKey.size) return;
    const { error } = await supabase.rpc('record_item_usage', { p_items: [...byKey.values()] });
    if (error) throw new AdminServiceError(error.message, error);
  },

  async fetchShipment(id: string): Promise<AdminShipment | null> {
    ensureConfigured();
    const { data, error } = await supabase.from('shipments').select('*').eq('id', id).maybeSingle();
    if (error) throw new AdminServiceError(error.message, error);
    return data;
  },

  // Shipment and tracking-update changes are audited by database triggers (migration 20261030000003).
  async createShipment(shipment: Partial<AdminShipment>): Promise<AdminShipment> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single();

    if (error) throw new AdminServiceError(error.message, error);
    return data;
  },

  /**
   * Saves only if nobody changed the shipment since it was loaded (`loadedAt` = its updated_at then).
   * Throws ShipmentConflictError otherwise, so one person's save never silently overwrites another's.
   */
  async updateShipment(id: string, updates: Partial<AdminShipment>, loadedAt: string): Promise<AdminShipment> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('shipments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('updated_at', loadedAt)
      .select();

    if (error) throw new AdminServiceError(error.message, error);
    if (!data?.length) throw new ShipmentConflictError();
    return data[0];
  },

  async deleteShipment(id: string, _trackingNumber: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('shipments').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
  },

  async fetchMilestones(shipmentId: string): Promise<AdminMilestone[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('shipment_milestones')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  /**
   * Adds a tracking update, then renumbers sort_order by event time: public tracking lists updates by
   * sort_order, so a back-dated update lands in the right place. Returns the list in that order.
   */
  async createMilestone(milestone: Omit<AdminMilestone, 'id' | 'sort_order'>, existing: AdminMilestone[]): Promise<AdminMilestone[]> {
    ensureConfigured();
    const { data, error } = await supabase.from('shipment_milestones').insert({ ...milestone, sort_order: existing.length + 1 }).select().single();
    if (error) throw new AdminServiceError(error.message, error);
    const ordered = orderMilestones([...existing, data as AdminMilestone]);
    for (const [i, m] of ordered.entries()) {
      if (m.sort_order === i + 1) continue;
      const { error: e } = await supabase.from('shipment_milestones').update({ sort_order: i + 1 }).eq('id', m.id);
      if (e) throw new AdminServiceError(e.message, e);
      m.sort_order = i + 1;
    }
    await touchShipment(milestone.shipment_id);
    return ordered;
  },

  async deleteMilestone(id: string, shipmentId: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('shipment_milestones').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
    await touchShipment(shipmentId);
  },

  // ---------------------------------------------------------------------------
  // INQUIRIES
  // ---------------------------------------------------------------------------
  async fetchInquiries(): Promise<AdminInquiry[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async updateInquiryStatus(id: string, status: AdminInquiry['status'], internalNotes?: string): Promise<AdminInquiry> {
    ensureConfigured();
    const updatePayload: Record<string, any> = { status };
    if (internalNotes !== undefined) updatePayload.internal_notes = internalNotes;

    const { data, error } = await supabase
      .from('inquiries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('update_inquiry_status', `inquiries:${id}`, { status });
    return data;
  },

  // ---------------------------------------------------------------------------
  // HANDLING RULES
  // ---------------------------------------------------------------------------
  async fetchHandlingRules(): Promise<AdminHandlingRule[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('handling_rules')
      .select('*')
      .order('flag', { ascending: true });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async saveHandlingRule(rule: Partial<AdminHandlingRule> & { id?: string }): Promise<AdminHandlingRule> {
    ensureConfigured();
    const payload = {
      ...rule,
      updated_at: new Date().toISOString()
    };

    let result;
    if (rule.id) {
      result = await supabase.from('handling_rules').update(payload).eq('id', rule.id).select().single();
    } else {
      result = await supabase.from('handling_rules').insert(payload).select().single();
    }

    if (result.error) throw new AdminServiceError(result.error.message, result.error);
    await this.logAction('save_handling_rule', `handling_rules:${rule.flag}`, { id: result.data.id });
    return result.data;
  },

  // ---------------------------------------------------------------------------
  // RATES (NATIONAL & INTERNATIONAL)
  // ---------------------------------------------------------------------------
  async fetchNationalRates(): Promise<AdminNationalRate[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('national_rates')
      .select('*')
      .order('service_name', { ascending: true })
      .order('min_weight_kg', { ascending: true });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async fetchInternationalRates(): Promise<AdminInternationalRate[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('international_rates')
      .select('*')
      .order('country_name', { ascending: true })
      .order('min_weight_kg', { ascending: true });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async bulkUpsertNationalRates(rows: Omit<AdminNationalRate, 'id' | 'created_at'>[]): Promise<number> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('national_rates')
      .insert(rows)
      .select('id');

    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('bulk_import_national_rates', 'national_rates', { count: data?.length || 0 });
    return data?.length || 0;
  },

  async bulkUpsertInternationalRates(rows: Omit<AdminInternationalRate, 'id' | 'created_at'>[]): Promise<number> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('international_rates')
      .insert(rows)
      .select('id');

    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('bulk_import_international_rates', 'international_rates', { count: data?.length || 0 });
    return data?.length || 0;
  },

  async deleteNationalRate(id: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('national_rates').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('delete_national_rate', `national_rates:${id}`);
  },

  async deleteInternationalRate(id: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('international_rates').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('delete_international_rate', `international_rates:${id}`);
  },

  // ---------------------------------------------------------------------------
  // BLOGS
  // ---------------------------------------------------------------------------
  async fetchBlogs(): Promise<AdminBlog[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async saveBlog(blog: Partial<AdminBlog> & { id?: string }): Promise<AdminBlog> {
    ensureConfigured();
    const payload = {
      ...blog,
      updated_at: new Date().toISOString()
    };

    let result;
    if (blog.id) {
      result = await supabase.from('blogs').update(payload).eq('id', blog.id).select().single();
    } else {
      result = await supabase.from('blogs').insert(payload).select().single();
    }

    if (result.error) throw new AdminServiceError(result.error.message, result.error);
    await this.logAction('save_blog', `blogs:${result.data.slug}`, { id: result.data.id });
    return result.data;
  },

  async deleteBlog(id: string, slug: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('delete_blog', `blogs:${slug}`, { id });
  },

  // ---------------------------------------------------------------------------
  // CAREERS & APPLICATIONS
  // ---------------------------------------------------------------------------
  async fetchCareers(): Promise<AdminCareer[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async saveCareer(career: Partial<AdminCareer> & { id?: string }): Promise<AdminCareer> {
    ensureConfigured();
    let result;
    if (career.id) {
      result = await supabase.from('careers').update(career).eq('id', career.id).select().single();
    } else {
      result = await supabase.from('careers').insert(career).select().single();
    }

    if (result.error) throw new AdminServiceError(result.error.message, result.error);
    await this.logAction('save_career', `careers:${result.data.slug}`, { id: result.data.id });
    return result.data;
  },

  async deleteCareer(id: string, slug: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('careers').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('delete_career', `careers:${slug}`, { id });
  },

  async fetchApplications(): Promise<AdminJobApplication[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async updateApplicationStatus(id: string, status: AdminJobApplication['status']): Promise<AdminJobApplication> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('update_application_status', `job_applications:${id}`, { status });
    return data;
  },

  // ---------------------------------------------------------------------------
  // USERS & ROLES
  // ---------------------------------------------------------------------------
  async fetchUserRoles(): Promise<AdminUserRole[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async saveUserRole(userRole: { email: string; role: AdminUserRole['role']; active: boolean }): Promise<AdminUserRole> {
    ensureConfigured();
    const cleanEmail = userRole.email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        email: cleanEmail,
        role: userRole.role,
        active: userRole.active,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('save_user_role', `user_roles:${cleanEmail}`, { role: userRole.role, active: userRole.active });
    return data;
  },

  /** Creates or updates a person with their profile in one step. Profile fields are skipped when empty. */
  async savePerson(person: { email: string; role: AdminUserRole['role']; active: boolean; profile: Partial<AdminProfileFields> }): Promise<AdminUserRole> {
    const saved = await this.saveUserRole(person);
    const filled = Object.fromEntries(Object.entries(person.profile).filter(([, v]) => typeof v === 'string' ? v.trim() !== '' : v != null));
    return Object.keys(filled).length ? this.saveUserProfile(saved.id, saved.email, filled) : saved;
  },

  // Profile change requests (need the staff-profiles migration)
  /** The signed-in person's own user_roles row, or null if not found. */
  async fetchMyProfile(email: string): Promise<AdminUserRole | null> {
    ensureConfigured();
    const { data, error } = await supabase.from('user_roles').select('*').ilike('email', email.trim()).maybeSingle();
    if (error) throw new AdminServiceError(error.message, error);
    return data;
  },

  async fetchProfileRequests(onlyUserRoleId?: string): Promise<AdminProfileRequest[]> {
    ensureConfigured();
    let q = supabase.from('profile_change_requests').select('*').order('created_at', { ascending: false }).limit(200);
    if (onlyUserRoleId) q = q.eq('user_role_id', onlyUserRoleId);
    const { data, error } = await q;
    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  /** Staff ask for a change; nothing on their profile changes until a super admin approves. */
  async requestProfileChange(me: AdminUserRole, field: ProfileField, newValue: string, note: string): Promise<AdminProfileRequest> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('profile_change_requests')
      .insert({ user_role_id: me.id, requester_email: me.email, field, new_value: newValue.trim(), note: note.trim() || null })
      .select()
      .single();
    if (error) throw new AdminServiceError(error.message, error);
    return data;
  },

  /** Uploads a proposed photo to the requester's own pending folder and returns its public URL. */
  async uploadPendingAvatar(file: File, authUserId: string): Promise<string> {
    ensureConfigured();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new AdminServiceError('Photo must be a JPG, PNG or WebP image.');
    if (file.size > 2 * 1024 * 1024) throw new AdminServiceError('Photo must be 2 MB or smaller.');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `pending/${authUserId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('admin-avatars').upload(path, file, { contentType: file.type });
    if (error) throw new AdminServiceError(error.message, error);
    return supabase.storage.from('admin-avatars').getPublicUrl(path).data.publicUrl;
  },

  /** Approving applies the change to the person's profile; declining leaves it untouched. */
  async decideProfileRequest(req: AdminProfileRequest, approve: boolean, decidedBy: string): Promise<AdminProfileRequest> {
    ensureConfigured();
    if (approve) await this.saveUserProfile(req.user_role_id, req.requester_email, { [req.field]: req.new_value });
    const { data, error } = await supabase
      .from('profile_change_requests')
      .update({ status: approve ? 'approved' : 'declined', decided_by: decidedBy, decided_at: new Date().toISOString() })
      .eq('id', req.id)
      .select()
      .single();
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction(approve ? 'approve_profile_change' : 'decline_profile_change', `user_roles:${req.requester_email ?? req.user_role_id}`, { field: req.field });
    return data;
  },

  /** Updates name, phone, photo and other profile fields for one person. */
  async saveUserProfile(id: string, email: string | null, profile: Partial<AdminProfileFields>): Promise<AdminUserRole> {
    ensureConfigured();
    const clean = Object.fromEntries(
      Object.entries(profile).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v]),
    );
    const { data, error } = await supabase
      .from('user_roles')
      .update({ ...clean, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('save_user_profile', `user_roles:${email ?? id}`, { fields: Object.keys(clean) });
    return data;
  },

  /** Uploads a profile photo and returns its public URL. JPG, PNG or WebP up to 2 MB. */
  async uploadAvatar(file: File, userRoleId: string): Promise<string> {
    ensureConfigured();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new AdminServiceError('Photo must be a JPG, PNG or WebP image.');
    }
    if (file.size > 2 * 1024 * 1024) throw new AdminServiceError('Photo must be 2 MB or smaller.');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userRoleId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('admin-avatars').upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw new AdminServiceError(error.message, error);
    return supabase.storage.from('admin-avatars').getPublicUrl(path).data.publicUrl;
  },

  // Resellers, for the "referred by" picker on a shipment
  async fetchResellers(): Promise<AdminUserRole[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'reseller')
      .eq('active', true)
      .order('email');
    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  /** Order counts per reseller id. Empty (never throws) until the reseller-referral migration is applied. */
  async fetchResellerStats(): Promise<Record<string, ResellerStats>> {
    ensureConfigured();
    const { data, error } = await supabase.rpc('get_reseller_stats');
    if (error || !Array.isArray(data)) return {};
    return Object.fromEntries(
      data.map((r: any) => [
        r.reseller_id,
        { total_orders: Number(r.total_orders), completed_orders: Number(r.completed_orders), orders_this_month: Number(r.orders_this_month) },
      ])
    );
  },

  async deleteUserRole(id: string, email: string | null): Promise<void> {
    ensureConfigured();
    const { error } = await supabase.from('user_roles').delete().eq('id', id);
    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('delete_user_role', `user_roles:${email ?? id}`, {});
  },

  // ---------------------------------------------------------------------------
  // SETTINGS (RATE_SETTINGS & SITE_SETTINGS)
  // ---------------------------------------------------------------------------
  async fetchRateSettings(): Promise<AdminRateSetting[]> {
    ensureConfigured();
    const { data, error } = await supabase.from('rate_settings').select('*');
    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  },

  async updateRateSetting(key: string, value: number, description?: string): Promise<void> {
    ensureConfigured();
    const { error } = await supabase
      .from('rate_settings')
      .upsert({
        key,
        value: { value, description },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw new AdminServiceError(error.message, error);
    await this.logAction('update_rate_setting', `rate_settings:${key}`, { value });
  },

  // ---------------------------------------------------------------------------
  // AUDIT LOGS
  // ---------------------------------------------------------------------------
  async fetchAuditLogs(limit: number = 100): Promise<AdminAuditLog[]> {
    ensureConfigured();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new AdminServiceError(error.message, error);
    return data || [];
  }
};
