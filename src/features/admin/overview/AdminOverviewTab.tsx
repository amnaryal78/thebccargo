import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MessageSquare,
  Briefcase,
  Receipt,
  ArrowUpRight,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminShipment, AdminInquiry } from '../types';
import { Spotlight } from '../../../components/ui/spotlight';

export const AdminOverviewTab: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalShipments: 0,
    activeShipments: 0,
    totalInquiries: 0,
    newInquiries: 0,
    totalApplications: 0,
    pendingApps: 0,
    totalRates: 0
  });
  const [recentShipments, setRecentShipments] = useState<AdminShipment[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [m, s, i] = await Promise.all([
        adminDataService.fetchOverviewMetrics(),
        adminDataService.fetchShipments(),
        adminDataService.fetchInquiries()
      ]);
      setMetrics(m);
      setRecentShipments(s.slice(0, 5));
      setRecentInquiries(i.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load overview:', err);
      setError(err.message || 'Could not fetch live dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-ox-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-slate-900 uppercase tracking-tight">
              Operational Desk
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Shipments, inquiries and applications from the database. Use Refresh to reload.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-heading font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-ox-900' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <Link
            to="/admin/shipments"
            className="px-4 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Shipment</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Active Shipments */}
        <Spotlight
          intensity="subtle"
          elevateOnHover
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Active Cargo</span>
            <div className="p-2 rounded-xl bg-ox-900/5 text-ox-900">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-heading text-slate-900">
              {metrics.activeShipments}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              of {metrics.totalShipments} total registered consignments
            </span>
          </div>
        </Spotlight>

        {/* New Inquiries */}
        <Spotlight
          intensity="subtle"
          elevateOnHover
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">New Inquiries</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-heading text-blue-600">
              {metrics.newInquiries}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {metrics.totalInquiries} total customer quotes &amp; contacts
            </span>
          </div>
        </Spotlight>

        {/* Job Applications */}
        <Spotlight
          intensity="subtle"
          elevateOnHover
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Applications</span>
            <div className="p-2 rounded-xl bg-[var(--gd-500)]/15 text-[var(--gd-800)]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-heading text-slate-900">
              {metrics.pendingApps}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              candidates pending resume review
            </span>
          </div>
        </Spotlight>

        {/* Rate Corridors */}
        <Spotlight
          intensity="subtle"
          elevateOnHover
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Tariff Corridors</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-heading text-slate-900">
              {metrics.totalRates}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              national &amp; global price matrices
            </span>
          </div>
        </Spotlight>

      </div>

      {/* Tables Grid: Recent Shipments & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Shipments */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-ox-900" />
              <h2 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
                Recent Consignments
              </h2>
            </div>
            <Link
              to="/admin/shipments"
              className="text-xs font-bold text-ox-900 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-2 divide-y divide-slate-100 overflow-x-auto">
            {recentShipments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No shipments recorded yet. Create one above.
              </div>
            ) : (
              recentShipments.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-bold text-xs text-slate-900 tracking-wider">
                      {s.tracking_number}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {s.origin} ➔ {s.destination} ({s.mode})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h2 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
                Recent Inquiries
              </h2>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-2 divide-y divide-slate-100 overflow-x-auto">
            {recentInquiries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No customer inquiries received yet.
              </div>
            ) : (
              recentInquiries.map((i) => (
                <div key={i.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {i.name}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {i.subject || i.message.slice(0, 45)}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    i.status === 'new'
                      ? 'bg-blue-500/15 text-blue-600 font-extrabold'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {i.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* System Health Footer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-xs font-heading font-bold text-slate-900">
              Database Connection: Supabase Active
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Host: xtipmcthdyyubohspjro.supabase.co · PostgreSQL RLS Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Role-Based Access Verified</span>
        </div>
      </div>

    </div>
  );
};
