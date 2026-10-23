import { UserRoleType } from '../../services/authService';

export type AdminRole = UserRoleType;

export interface RolePermissions {
  canViewDashboard: boolean;
  canManageShipments: boolean;
  canManageMilestones: boolean;
  canManageInquiries: boolean;
  canManageHandlingRules: boolean;
  canManageRates: boolean;
  canManageBlogs: boolean;
  canManageHowToShip: boolean;
  canManageCareers: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAuditLogs: boolean;
  isReadOnly: boolean;
}

export function getRolePermissions(role: AdminRole | null): RolePermissions {
  // Resellers only get the storefront price view; they have no admin permissions at all.
  if (!role || role === 'reseller') {
    return {
      canViewDashboard: false,
      canManageShipments: false,
      canManageMilestones: false,
      canManageInquiries: false,
      canManageHandlingRules: false,
      canManageRates: false,
      canManageBlogs: false,
      canManageHowToShip: false,
      canManageCareers: false,
      canManageUsers: false,
      canManageSettings: false,
      canViewAuditLogs: false,
      isReadOnly: true,
    };
  }

  switch (role) {
    case 'super_admin':
      return {
        canViewDashboard: true,
        canManageShipments: true,
        canManageMilestones: true,
        canManageInquiries: true,
        canManageHandlingRules: true,
        canManageRates: true,
        canManageBlogs: true,
        canManageHowToShip: true,
        canManageCareers: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewAuditLogs: true,
        isReadOnly: false,
      };
    case 'admin':
      return {
        canViewDashboard: true,
        canManageShipments: true,
        canManageMilestones: true,
        canManageInquiries: true,
        canManageHandlingRules: true,
        canManageRates: true,
        canManageBlogs: true,
        canManageHowToShip: true,
        canManageCareers: true,
        canManageUsers: false, // only super_admin manages user roles
        canManageSettings: true,
        canViewAuditLogs: true,
        isReadOnly: false,
      };
    case 'operations':
      return {
        canViewDashboard: true,
        canManageShipments: true,
        canManageMilestones: true,
        canManageInquiries: true,
        canManageHandlingRules: false,
        canManageRates: false,
        canManageBlogs: false,
        canManageHowToShip: false,
        canManageCareers: false,
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: true,
        isReadOnly: false,
      };
    case 'editor':
      return {
        canViewDashboard: true,
        canManageShipments: false,
        canManageMilestones: false,
        canManageInquiries: false,
        canManageHandlingRules: false,
        canManageRates: false,
        canManageBlogs: true,
        canManageHowToShip: true,
        canManageCareers: true,
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        isReadOnly: false,
      };
    case 'support':
      return {
        canViewDashboard: true,
        canManageShipments: false,
        canManageMilestones: false,
        canManageInquiries: true,
        canManageHandlingRules: false,
        canManageRates: false,
        canManageBlogs: false,
        canManageHowToShip: false,
        canManageCareers: false,
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        isReadOnly: false,
      };
    case 'read_only':
    default:
      return {
        canViewDashboard: true,
        canManageShipments: false,
        canManageMilestones: false,
        canManageInquiries: false,
        canManageHandlingRules: false,
        canManageRates: false,
        canManageBlogs: false,
        canManageHowToShip: false,
        canManageCareers: false,
        canManageUsers: false,
        canManageSettings: false,
        canViewAuditLogs: true,
        isReadOnly: true,
      };
  }
}

/**
 * Effective access = base role plus every custom role the person holds. Any grant wins;
 * a person stays view-only only while none of their roles lets them change something.
 */
export function mergePermissions(base: RolePermissions, extras: Partial<RolePermissions>[]): RolePermissions {
  if (!extras.length) return base;
  const merged = { ...base };
  let grantsWrite = false;
  for (const extra of extras) {
    for (const key of Object.keys(extra) as (keyof RolePermissions)[]) {
      if (key === 'isReadOnly' || !extra[key]) continue;
      merged[key] = true;
      if (key.startsWith('canManage')) grantsWrite = true;
    }
  }
  merged.isReadOnly = base.isReadOnly && !grantsWrite;
  return merged;
}

/** Plain-language names for each permission flag, used to show what a role can open. */
export const PERMISSION_LABELS: { key: keyof RolePermissions; label: string }[] = [
  { key: 'canManageShipments', label: 'Shipments' },
  { key: 'canManageMilestones', label: 'Tracking updates' },
  { key: 'canManageInquiries', label: 'Inquiries' },
  { key: 'canManageHandlingRules', label: 'Handling rules' },
  { key: 'canManageRates', label: 'Rates' },
  { key: 'canManageBlogs', label: 'Blogs' },
  { key: 'canManageHowToShip', label: 'How to ship' },
  { key: 'canManageCareers', label: 'Careers' },
  { key: 'canManageSettings', label: 'Settings' },
  { key: 'canManageUsers', label: 'Users & roles' },
  { key: 'canViewAuditLogs', label: 'Audit logs' },
];

export const ROLE_SUMMARY: Record<AdminRole, string> = {
  super_admin: 'Full control, including who gets access',
  admin: 'Everything except managing users',
  operations: 'Shipments, tracking updates and inquiries',
  editor: 'Blogs, how-to-ship guides and careers',
  support: 'Customer inquiries only',
  read_only: 'Can look but not change anything',
  reseller: 'Sees reseller rates. No admin access',
};

// Module Data Models
export interface AdminShipment {
  id: string;
  tracking_number: string;
  booking_ref: string | null;
  mode: 'air' | 'road' | 'sea' | string;
  service_name: string;
  status: 'pending' | 'in_transit' | 'customs_cleared' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;
  commodity: string | null;
  shipper_company: string | null;
  shipper_city: string | null;
  shipper_country: string | null;
  consignee_company: string | null;
  consignee_city: string | null;
  consignee_country: string | null;
  origin: string;
  origin_hub: string | null;
  destination: string;
  destination_gateway: string | null;
  carrier_info: string | null;
  gross_weight_kg: number | null;
  chargeable_weight_kg: number | null;
  volume_cbm: number | null;
  pieces: number | null;
  incoterm: string | null;
  estimated_delivery: string | null;
  telemetry_temp: string | null;
  telemetry_eseal: string | null;
  battery_level: string | null;
  /** user_roles.id of the reseller who referred this order; null = independent. Needs the reseller-referral migration. */
  reseller_id?: string | null;
  sender_name?: string | null;
  sender_phone?: string | null;
  sender_email?: string | null;
  sender_address?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  receiver_email?: string | null;
  receiver_address?: string | null;
  total_npr?: number | null;
  bill?: unknown;
  created_at: string;
  updated_at: string;
}

export interface AdminMilestone {
  id: string;
  shipment_id: string;
  title: string;
  description: string | null;
  location: string;
  timestamp: string;
  status: string;
  completed: boolean;
  sort_order: number;
  created_at?: string;
}

export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  service_mode: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'resolved' | 'spam';
  internal_notes: string | null;
  created_at: string;
}

export interface AdminHandlingRule {
  id: string;
  flag: 'liquid' | 'meat' | 'medicine' | 'other';
  country_code: string | null;
  mode: 'air' | 'overland' | null;
  allowed: boolean;
  surcharge_type: 'flat_npr' | 'per_kg_npr' | 'percent' | null;
  surcharge_value: number;
  requirements_md: string;
  is_placeholder: boolean;
  active: boolean;
  updated_at: string;
}

export interface AdminNationalRate {
  id: string;
  service_name: string;
  origin_region: string;
  destination_region: string;
  min_weight_kg: number;
  max_weight_kg: number;
  base_rate_npr: number;
  per_kg_rate_npr: number;
  effective_date: string;
  created_at: string;
}

export interface AdminInternationalRate {
  id: string;
  country_code: string;
  country_name: string;
  service_name: string;
  min_weight_kg: number;
  max_weight_kg: number;
  rate_usd: number;
  effective_date: string;
  created_at: string;
}

export interface AdminBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  author_name: string | null;
  category: string;
  read_time: string | null;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCareer {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[] | null;
  responsibilities: string[] | null;
  published: boolean;
  created_at: string;
}

export interface AdminJobApplication {
  id: string;
  job_id: string | null;
  job_title: string;
  applicant_name: string;
  email: string;
  phone: string | null;
  experience_years: number | null;
  cover_letter: string | null;
  resume_url: string | null;
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
}

export interface AdminUserRole {
  id: string;
  user_id: string | null;
  email: string | null;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Profile fields (need the staff-profiles migration; absent until it is applied)
  full_name?: string | null;
  phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  avatar_url?: string | null;
  notes?: string | null;
}

/** Order counts per reseller. Completed = delivered; this month = Nepal calendar month. */
export interface ResellerStats {
  total_orders: number;
  completed_orders: number;
  orders_this_month: number;
}

export type AdminProfileFields =Pick<AdminUserRole, 'full_name' | 'phone' | 'job_title' | 'department' | 'avatar_url' | 'notes'>;

export type ProfileField = 'full_name' | 'phone' | 'job_title' | 'department' | 'avatar_url';

export const PROFILE_FIELD_LABELS: Record<ProfileField, string> = {
  full_name: 'Full name',
  phone: 'Phone',
  job_title: 'Job title',
  department: 'Department',
  avatar_url: 'Profile photo',
};

export interface AdminProfileRequest {
  id: string;
  user_role_id: string;
  requester_email: string | null;
  field: ProfileField;
  new_value: string;
  note: string | null;
  status: 'pending' | 'approved' | 'declined';
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface AdminCustomRole {
  id: string;
  name: string;
  description: string | null;
  permissions: Partial<Record<keyof RolePermissions, boolean>>;
  created_at: string;
  updated_at: string;
}

export interface AdminRateSetting {
  key: string;
  value: {
    value: number;
    description?: string;
  };
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_email: string | null;
  action: string;
  target_entity: string;
  metadata: Record<string, any> | null;
  created_at: string;
}
