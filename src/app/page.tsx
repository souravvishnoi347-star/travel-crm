"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Hotel, 
  Car, 
  Users, 
  ArrowUpRight,
  Map, 
  Store, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DashboardStats = {
  activeLeads: number;
  confirmedTours: number;
  totalVouchers: number;
  totalItineraries: number;
  pendingPayables: number;
  leadsByStage: { name: string; count: number; fill: string }[];
  recentActivity: any[];
};

const STAGE_COLORS: Record<string, string> = {
  new_inquiry: "#0284c7", // sky
  quoted: "#8b5cf6", // purple
  follow_up: "#f59e0b", // amber
  confirmed: "#10b981", // emerald
  lost: "#ef4444" // red
};

const STAGE_LABELS: Record<string, string> = {
  new_inquiry: "New Inquiry",
  quoted: "Quoted",
  follow_up: "Follow Up",
  confirmed: "Confirmed",
  lost: "Lost"
};

const CLEAN_INITIAL_STATS: DashboardStats = {
  activeLeads: 0,
  confirmedTours: 0,
  totalVouchers: 0,
  totalItineraries: 0,
  pendingPayables: 0,
  leadsByStage: [
    { name: "New Inquiries", count: 0, fill: "#0284c7" },
    { name: "Quoted Sent", count: 0, fill: "#d97706" },
    { name: "Follow Up", count: 0, fill: "#9333ea" },
    { name: "Confirmed Yatra", count: 0, fill: "#16a34a" },
    { name: "Cancelled", count: 0, fill: "#dc2626" },
  ],
  recentActivity: []
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(CLEAN_INITIAL_STATS);

  useEffect(() => {
    // 1. Initial Load from Local Storage (zero lag, offline first)
    if (typeof window !== "undefined") {
      try {
        let activeLeads = 0;
        let confirmedTours = 0;
        let recentLeads: any[] = [];
        let stageCounts: Record<string, number> = { new_inquiry: 0, quoted: 0, follow_up: 0, confirmed: 0, lost: 0 };

        const storedLeads = localStorage.getItem("triloki_leads");
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeLeads = parsed.filter((l: any) => l.status !== "lost").length;
            confirmedTours = parsed.filter((l: any) => l.status === "confirmed").length;
            recentLeads = parsed.slice(0, 5);
            parsed.forEach((l: any) => {
              const st = l.status || "new_inquiry";
              if (stageCounts[st] !== undefined) stageCounts[st]++;
            });
          }
        }

        let pendingPayables = 0;
        const storedPayables = localStorage.getItem("triloki_payables");
        if (storedPayables) {
          const parsed = JSON.parse(storedPayables);
          if (Array.isArray(parsed)) {
            pendingPayables = parsed.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);
          }
        }

        const chartData = Object.keys(stageCounts).map(key => ({
          name: STAGE_LABELS[key],
          count: stageCounts[key],
          fill: STAGE_COLORS[key]
        }));

        setStats({
          activeLeads,
          confirmedTours,
          totalVouchers: 0,
          totalItineraries: 0,
          pendingPayables,
          leadsByStage: chartData,
          recentActivity: recentLeads
        });
      } catch (e) {}
    }

    // 2. Sync with Supabase Cloud
    async function fetchDashboardData() {
      try {
        const [leadsRes, payablesRes, itinsRes, vouchersRes] = await Promise.allSettled([
          supabase.from("leads").select("*").order("created_at", { ascending: false }),
          supabase.from("payables").select("amount, status"),
          supabase.from("itineraries").select("*", { count: "exact", head: true }),
          supabase.from("vouchers").select("*", { count: "exact", head: true })
        ]);

        const leads = leadsRes.status === "fulfilled" && leadsRes.value.data ? leadsRes.value.data : null;
        const payables = payablesRes.status === "fulfilled" && payablesRes.value.data ? payablesRes.value.data : null;
        const itineraryCount = itinsRes.status === "fulfilled" && itinsRes.value.count !== null ? itinsRes.value.count : 0;
        const voucherCount = vouchersRes.status === "fulfilled" && vouchersRes.value.count !== null ? vouchersRes.value.count : 0;

        if (leads && Array.isArray(leads)) {
          const activeLeads = leads.filter(l => l.status !== "lost").length;
          const confirmedTours = leads.filter(l => l.status === "confirmed").length;
          
          const stageCounts: Record<string, number> = { new_inquiry: 0, quoted: 0, follow_up: 0, confirmed: 0, lost: 0 };
          leads.forEach(l => {
            const st = l.status || "new_inquiry";
            if (stageCounts[st] !== undefined) stageCounts[st]++;
          });
          
          const chartData = Object.keys(stageCounts).map(key => ({
            name: STAGE_LABELS[key],
            count: stageCounts[key],
            fill: STAGE_COLORS[key]
          }));

          const pendingPayables = (payables || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);

          setStats({
            activeLeads,
            confirmedTours,
            totalVouchers: voucherCount,
            totalItineraries: itineraryCount,
            pendingPayables,
            leadsByStage: chartData,
            recentActivity: leads.slice(0, 5)
          });
        }
      } catch (error) {
        console.warn("Background stats sync:", error);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Travel to Uttarakhand Operations</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Spiritual Travel Edition
            </span>
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">Chardham, Do Dham, Teen Dham, Ek Dham & Helicopter Yatra Operations Desk</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link 
            href="/invoices" 
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:border-sky-300 text-gray-700 hover:text-sky-700 rounded-xl font-semibold text-xs shadow-2xs transition cursor-pointer"
          >
            <FileText size={15} className="text-sky-600" /> Generate Invoice
          </Link>
          <Link 
            href="/itinerary-builder" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0369a1] hover:bg-[#025684] text-white rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus size={15} /> Create Itinerary
          </Link>
        </div>
      </div>

      {/* 5-Card Operational & Booking Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Active Lead Pipeline */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Leads</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{stats.activeLeads}</p>
          <p className="text-[10.5px] text-sky-600 font-semibold mt-1">Ongoing Guest Inquiries</p>
        </div>

        {/* KPI 2: Confirmed Yatra Bookings */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Confirmed Yatras</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{stats.confirmedTours}</p>
          <p className="text-[10.5px] text-emerald-600 font-semibold mt-1">Booked & Confirmed Tours</p>
        </div>

        {/* KPI 3: Itineraries Generated */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Itineraries</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Map size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{stats.totalItineraries}</p>
          <p className="text-[10.5px] text-purple-600 font-semibold mt-1">Brochures & Proposals</p>
        </div>

        {/* KPI 4: Service Vouchers */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-cyan-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Service Vouchers</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Hotel size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{stats.totalVouchers}</p>
          <p className="text-[10.5px] text-cyan-600 font-semibold mt-1">Hotel & Cab Vouchers</p>
        </div>

        {/* KPI 5: Vendor Payables */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vendor Payables</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Store size={17} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">₹{stats.pendingPayables.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-rose-600 font-semibold mt-1">Due to Hotels & Transporters</p>
        </div>

      </div>

      {/* QUICK ACTIONS & STUDIO LAUNCHPAD */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Operations & Document Studios</h2>
            <p className="text-xs text-gray-500">Fast access to itinerary builder, customer invoices, and service vouchers</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Itinerary Studio", desc: "PDF Proposals & Quotes", icon: Map, color: "text-blue-600", bg: "bg-blue-50", href: "/itinerary-builder" },
            { label: "Tax Invoices", desc: "Bill of Supply & GST", icon: FileText, color: "text-sky-600", bg: "bg-sky-50", href: "/invoices" },
            { label: "Hotel Vouchers", desc: "Multi-Stay Accommodation", icon: Hotel, color: "text-cyan-600", bg: "bg-cyan-50", href: "/hotels" },
            { label: "Transport Vouchers", desc: "Vehicle & Fleet Allocation", icon: Car, color: "text-purple-600", bg: "bg-purple-50", href: "/transport" },
            { label: "Lead Pipeline", desc: "Kanban Inquiry Stages", icon: Users, color: "text-amber-600", bg: "bg-amber-50", href: "/leads" },
            { label: "Vendor Directory", desc: "Hotels & Fleet Partners", icon: Store, color: "text-rose-600", bg: "bg-rose-50", href: "/vendors" },
          ].map((action, i) => (
            <Link 
              key={i} 
              href={action.href} 
              className="flex flex-col p-3.5 rounded-xl border border-gray-100 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-xs transition-all group"
            >
              <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform mb-2.5`}>
                <action.icon size={18} className={action.color} />
              </div>
              <span className="font-bold text-gray-900 text-xs group-hover:text-[#0369a1] transition-colors">{action.label}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{action.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* LOWER SECTION: Leads Pipeline Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leads Pipeline Distribution Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-[#0369a1]" size={18} /> Leads & Inquiry Conversion Pipeline
              </h2>
              <p className="text-xs text-gray-500">Real-time status of inquiries across conversion stages</p>
            </div>
            <Link href="/leads" className="text-xs font-semibold text-[#0369a1] hover:underline flex items-center gap-1">
              Manage Pipeline <ArrowRight size={13} />
            </Link>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.leadsByStage} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Inquiries List (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-[#0369a1]" size={18} /> Recent Inquiries
              </h2>
              <Link href="/leads" className="text-xs text-[#0369a1] font-semibold hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3.5">
              {stats.recentActivity.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Clock className="w-6 h-6 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">No leads recorded yet.</p>
                  <Link 
                    href="/leads" 
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0369a1] hover:underline"
                  >
                    + Add your first inquiry
                  </Link>
                </div>
              ) : (
                stats.recentActivity.map((lead, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-sky-200 transition-all">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{lead.name}</p>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        {lead.destination || 'Yatra Package'} {lead.budget ? `· ₹${Number(lead.budget).toLocaleString()}` : ''}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lead.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      lead.status === 'lost' ? 'bg-rose-50 text-rose-700' :
                      lead.status === 'follow_up' ? 'bg-amber-50 text-amber-700' :
                      lead.status === 'quoted' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {STAGE_LABELS[lead.status] || 'New Inquiry'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link 
            href="/leads" 
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
          >
            Open Lead Pipeline <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
}
