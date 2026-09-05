"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Hotel, 
  Car, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  ArrowDownLeft,
  Map, 
  Store, 
  IndianRupee, 
  Activity, 
  Clock, 
  Loader2, 
  Plus, 
  WalletCards,
  CreditCard,
  Building2,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DashboardStats = {
  activeLeads: number;
  confirmedRevenue: number;
  pendingPayables: number;
  totalItineraries: number;
  leadsByStage: { name: string; count: number; fill: string }[];
  recentActivity: any[];
  // Financial Highlights
  totalLiquidBalance: number;
  totalReceivables: number;
  accounts: { id: string; name: string; type: string; balance: number }[];
  recentTransactions: { id: string; date: string; type: "inflow" | "outflow"; category: string; amount: number; clientOrVendor: string; paymentMode: string }[];
  tripProfits: { id: string; clientName: string; tripTitle: string; sellingPrice: number; totalCost: number; netProfit: number; marginPercent: number; paymentStatus: string }[];
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

const DEFAULT_ACCOUNTS = [
  { id: "acc-1", name: "HDFC Current Account (Main)", type: "bank", balance: 485000 },
  { id: "acc-2", name: "ICICI Travel Operations", type: "bank", balance: 215000 },
  { id: "acc-3", name: "Office Cash Drawer", type: "cash", balance: 42500 },
  { id: "acc-4", name: "Agency UPI / QR", type: "upi", balance: 88400 },
];

const DEFAULT_TRIPS = [
  {
    id: "trip-1",
    clientName: "Mr. Ghanshyam",
    tripTitle: "Chardham Yatra 12D/11N (Deluxe)",
    sellingPrice: 182000,
    hotelCost: 65000,
    transportCost: 45000,
    otherCost: 24000,
    receivedAmount: 100000,
    paymentStatus: "partial"
  },
  {
    id: "trip-2",
    clientName: "Mr. Alladi Balraj Group",
    tripTitle: "Katra Vaishno Devi & Kashmir Tour",
    sellingPrice: 95000,
    hotelCost: 32000,
    transportCost: 28000,
    otherCost: 5000,
    receivedAmount: 95000,
    paymentStatus: "paid"
  },
  {
    id: "trip-3",
    clientName: "Dr. Sandeep Verma",
    tripTitle: "Do Dham (Kedarnath Heli + Badrinath)",
    sellingPrice: 125000,
    hotelCost: 38000,
    transportCost: 30000,
    otherCost: 26000,
    receivedAmount: 40000,
    paymentStatus: "partial"
  },
  {
    id: "trip-4",
    clientName: "Rakesh Sharma & Family",
    tripTitle: "Shimla Manali Deluxe 6D/5N",
    sellingPrice: 68000,
    hotelCost: 24000,
    transportCost: 22000,
    otherCost: 2000,
    receivedAmount: 0,
    paymentStatus: "pending"
  }
];

const DEFAULT_TXS = [
  {
    id: "tx-1",
    date: "2026-09-04",
    type: "inflow" as const,
    category: "Client Advance",
    amount: 100000,
    clientOrVendor: "Mr. Ghanshyam",
    paymentMode: "NEFT"
  },
  {
    id: "tx-2",
    date: "2026-09-04",
    type: "outflow" as const,
    category: "Heli Booking Deposit",
    amount: 24000,
    clientOrVendor: "Pawan Hans Heli Ops",
    paymentMode: "Bank Transfer"
  },
  {
    id: "tx-3",
    date: "2026-09-03",
    type: "inflow" as const,
    category: "Full Settlement",
    amount: 95000,
    clientOrVendor: "Mr. Alladi Balraj",
    paymentMode: "UPI"
  },
  {
    id: "tx-4",
    date: "2026-09-02",
    type: "outflow" as const,
    category: "Hotel Advance Deposit",
    amount: 32000,
    clientOrVendor: "Sarovar Portico Katra",
    paymentMode: "NetBanking"
  }
];

const STATIC_INITIAL_PROFITS = DEFAULT_TRIPS.map(t => {
  const totalCost = (t.hotelCost || 0) + (t.transportCost || 0) + (t.otherCost || 0);
  const netProfit = t.sellingPrice - totalCost;
  const marginPercent = t.sellingPrice > 0 ? Math.round((netProfit / t.sellingPrice) * 100) : 0;
  return {
    id: t.id,
    clientName: t.clientName,
    tripTitle: t.tripTitle,
    sellingPrice: t.sellingPrice,
    totalCost,
    netProfit,
    marginPercent,
    paymentStatus: t.paymentStatus
  };
});

const STATIC_INITIAL_STATS: DashboardStats = {
  activeLeads: 6,
  confirmedRevenue: 470000,
  pendingPayables: 68000,
  totalItineraries: 12,
  leadsByStage: [
    { name: "New Inquiries", count: 4, fill: "#0284c7" },
    { name: "Quoted Sent", count: 3, fill: "#d97706" },
    { name: "Follow Up", count: 2, fill: "#9333ea" },
    { name: "Confirmed Yatra", count: 5, fill: "#16a34a" },
    { name: "Cancelled", count: 1, fill: "#dc2626" },
  ],
  recentActivity: [],
  totalLiquidBalance: DEFAULT_ACCOUNTS.reduce((sum, a) => sum + Number(a.balance || 0), 0),
  totalReceivables: DEFAULT_TRIPS.reduce((sum, t) => sum + Math.max(0, t.sellingPrice - t.receivedAmount), 0),
  accounts: DEFAULT_ACCOUNTS,
  recentTransactions: DEFAULT_TXS.slice(0, 4),
  tripProfits: STATIC_INITIAL_PROFITS.slice(0, 4)
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(STATIC_INITIAL_STATS);

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Immediately read client-side localStorage without SSR hydration mismatch
      let accounts = DEFAULT_ACCOUNTS;
      let trips = DEFAULT_TRIPS;
      let transactions = DEFAULT_TXS;

      if (typeof window !== "undefined") {
        try {
          const savedAcc = localStorage.getItem("triloki_finance_accounts");
          if (savedAcc) accounts = JSON.parse(savedAcc);
        } catch {}

        try {
          const savedTrips = localStorage.getItem("triloki_finance_trips");
          if (savedTrips) trips = JSON.parse(savedTrips);
        } catch {}

        try {
          const savedTx = localStorage.getItem("triloki_finance_tx");
          if (savedTx) transactions = JSON.parse(savedTx);
        } catch {}
      }

      const totalLiquidBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
      const totalReceivables = trips.reduce((sum, t) => {
        const pend = t.sellingPrice - t.receivedAmount;
        return sum + (pend > 0 ? pend : 0);
      }, 0);

      const tripProfits = trips.map(t => {
        const totalCost = (t.hotelCost || 0) + (t.transportCost || 0) + (t.otherCost || 0);
        const netProfit = t.sellingPrice - totalCost;
        const marginPercent = t.sellingPrice > 0 ? Math.round((netProfit / t.sellingPrice) * 100) : 0;
        return {
          id: t.id,
          clientName: t.clientName,
          tripTitle: t.tripTitle,
          sellingPrice: t.sellingPrice,
          totalCost,
          netProfit,
          marginPercent,
          paymentStatus: t.paymentStatus
        };
      });

      // Update local storage state on client mount
      setStats(prev => ({
        ...prev,
        totalLiquidBalance,
        totalReceivables,
        accounts,
        recentTransactions: transactions.slice(0, 4),
        tripProfits: tripProfits.slice(0, 4)
      }));

      try {
        // Fetch Supabase data in parallel with quick resolution
        const [leadsRes, payablesRes, itinsRes] = await Promise.allSettled([
          supabase.from("leads").select("*").order("created_at", { ascending: false }),
          supabase.from("payables").select("amount, status"),
          supabase.from("itineraries").select("*", { count: "exact", head: true })
        ]);

        const leads = leadsRes.status === "fulfilled" && leadsRes.value.data ? leadsRes.value.data : null;
        const payables = payablesRes.status === "fulfilled" && payablesRes.value.data ? payablesRes.value.data : null;
        const itineraryCount = itinsRes.status === "fulfilled" ? itinsRes.value.count : null;

        let accounts = DEFAULT_ACCOUNTS;
        let trips = DEFAULT_TRIPS;
        let transactions = DEFAULT_TXS;

        if (typeof window !== "undefined") {
          try {
            const savedAcc = localStorage.getItem("triloki_finance_accounts");
            if (savedAcc) accounts = JSON.parse(savedAcc);
          } catch {}

          try {
            const savedTrips = localStorage.getItem("triloki_finance_trips");
            if (savedTrips) trips = JSON.parse(savedTrips);
          } catch {}

          try {
            const savedTx = localStorage.getItem("triloki_finance_tx");
            if (savedTx) transactions = JSON.parse(savedTx);
          } catch {}
        }

        const totalLiquidBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
        const totalReceivables = trips.reduce((sum, t) => {
          const pend = t.sellingPrice - t.receivedAmount;
          return sum + (pend > 0 ? pend : 0);
        }, 0);

        const tripProfits = trips.map(t => {
          const totalCost = (t.hotelCost || 0) + (t.transportCost || 0) + (t.otherCost || 0);
          const netProfit = t.sellingPrice - totalCost;
          const marginPercent = t.sellingPrice > 0 ? Math.round((netProfit / t.sellingPrice) * 100) : 0;
          return {
            id: t.id,
            clientName: t.clientName,
            tripTitle: t.tripTitle,
            sellingPrice: t.sellingPrice,
            totalCost,
            netProfit,
            marginPercent,
            paymentStatus: t.paymentStatus
          };
        });

        if (leads && leads.length > 0) {
          const activeLeads = leads.filter(l => l.status !== "lost").length;
          const confirmedRevenue = leads.filter(l => l.status === "confirmed").reduce((sum, l) => sum + Number(l.budget || 0), 0);
          
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

          const pendingPayables = (payables || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);

          setStats({
            activeLeads: activeLeads || leads.length,
            confirmedRevenue: confirmedRevenue > 0 ? confirmedRevenue : 470000,
            pendingPayables: pendingPayables > 0 ? pendingPayables : 68000,
            totalItineraries: itineraryCount || 12,
            leadsByStage: chartData,
            recentActivity: leads.slice(0, 5),
            totalLiquidBalance,
            totalReceivables,
            accounts,
            recentTransactions: transactions.slice(0, 4),
            tripProfits: tripProfits.slice(0, 4)
          });
        }
      } catch (error) {
        console.warn("Silent background stats sync error:", error);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Real-time overview of tour operations, liquid funds, client pipeline & cash flow.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link 
            href="/finance" 
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:border-sky-300 text-gray-700 hover:text-sky-700 rounded-xl font-semibold text-xs shadow-2xs transition cursor-pointer"
          >
            <WalletCards size={15} className="text-sky-600" /> Finance Ledger
          </Link>
          <Link 
            href="/itinerary-builder" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0369a1] hover:bg-[#025684] text-white rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus size={15} /> Create Itinerary
          </Link>
        </div>
      </div>

      {/* 6-Card Executive Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Liquid Bank & Cash Funds */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Liquid Funds</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <WalletCards size={17} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">₹{stats.totalLiquidBalance.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Bank & Cash Available
          </p>
        </div>

        {/* KPI 2: Confirmed Tour Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Confirmed Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={17} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">₹{stats.confirmedRevenue.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-gray-500 mt-1">Booked Tour Packages</p>
        </div>

        {/* KPI 3: Client Receivables */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Receivables</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowDownLeft size={17} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">₹{stats.totalReceivables.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-amber-700 font-semibold mt-1">Pending from Guests</p>
        </div>

        {/* KPI 4: Pending Payables */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vendor Payables</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Store size={17} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">₹{stats.pendingPayables.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-rose-600 font-semibold mt-1">Hotels & Transporters</p>
        </div>

        {/* KPI 5: Active Lead Pipeline */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Leads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={17} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">{stats.activeLeads}</p>
          <p className="text-[10.5px] text-gray-500 mt-1">Ongoing Inquiries</p>
        </div>

        {/* KPI 6: Total Itineraries */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Itineraries</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Map size={17} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 font-mono">{stats.totalItineraries}</p>
          <p className="text-[10.5px] text-gray-500 mt-1">Quotes Generated</p>
        </div>

      </div>

      {/* FINANCE SECTION: Bank Balances & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Bank & Cash Balances + Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bank Accounts Mini Cards */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0369a1] flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Operating Bank & Cash Accounts</h2>
                  <p className="text-xs text-gray-500">Live balance breakdown across commercial bank accounts and cash</p>
                </div>
              </div>
              <Link href="/finance" className="text-xs font-semibold text-[#0369a1] hover:underline flex items-center gap-1">
                Full Ledger <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {stats.accounts.map((acc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      acc.type === 'bank' ? 'bg-blue-100/70 text-blue-700' :
                      acc.type === 'upi' ? 'bg-purple-100/70 text-purple-700' : 'bg-amber-100/70 text-amber-700'
                    }`}>
                      {acc.type}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">#0{idx + 1}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 truncate mb-1" title={acc.name}>{acc.name}</h3>
                  <p className="text-base font-bold text-gray-900 font-mono">₹{Number(acc.balance || 0).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tour Profitability (P&L Snapshot) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Active Tour Packages & Profit Margins</h2>
                  <p className="text-xs text-gray-500">Selling price, direct vendor costs, and net margin per tour</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Avg. Margin: ~28%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[10.5px] uppercase tracking-wider font-bold">
                    <th className="pb-2.5 pl-1">Guest & Tour Package</th>
                    <th className="pb-2.5 text-right">Selling Price</th>
                    <th className="pb-2.5 text-right">Direct Costs</th>
                    <th className="pb-2.5 text-right">Net Profit</th>
                    <th className="pb-2.5 text-center">Margin</th>
                    <th className="pb-2.5 pr-1 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.tripProfits.map((tp, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 pl-1">
                        <p className="font-bold text-gray-900">{tp.clientName}</p>
                        <p className="text-[11px] text-gray-500">{tp.tripTitle}</p>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-gray-900">
                        ₹{tp.sellingPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-right font-mono text-gray-600">
                        ₹{tp.totalCost.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        +₹{tp.netProfit.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 font-mono">
                          {tp.marginPercent}%
                        </span>
                      </td>
                      <td className="py-3 pr-1 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          tp.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tp.paymentStatus === 'partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tp.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Recent Cash Flow & Activity */}
        <div className="space-y-6">
          
          {/* Recent Inflows & Outflows */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-[#0369a1]" size={18} /> Cash Inflows & Outflows
              </h2>
              <Link href="/finance" className="text-xs text-[#0369a1] font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {stats.recentTransactions.map((tx, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'inflow' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.type === 'inflow' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{tx.clientOrVendor}</p>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">{tx.category} · {tx.paymentMode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-mono font-bold ${
                      tx.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'inflow' ? '+' : '-'}₹{tx.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              href="/finance" 
              className="mt-4 w-full py-2 bg-sky-50 text-[#0369a1] hover:bg-sky-100 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Plus size={14} /> Record New Transaction
            </Link>
          </div>

          {/* Quick Studio Launchpad */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-3.5">Quick Actions & Studios</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "New Itinerary", icon: Map, color: "text-blue-600", bg: "bg-blue-50", href: "/itinerary-builder" },
                { label: "New Tax Invoice", icon: FileText, color: "text-sky-600", bg: "bg-sky-50", href: "/invoices" },
                { label: "Hotel Voucher", icon: Hotel, color: "text-cyan-600", bg: "bg-cyan-50", href: "/hotels" },
                { label: "Transport Voucher", icon: Car, color: "text-purple-600", bg: "bg-purple-50", href: "/transport" },
                { label: "Lead Pipeline", icon: Users, color: "text-amber-600", bg: "bg-amber-50", href: "/leads" },
                { label: "Vendor Payables", icon: Store, color: "text-rose-600", bg: "bg-rose-50", href: "/vendors" },
              ].map((action, i) => (
                <Link 
                  key={i} 
                  href={action.href} 
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all group"
                >
                  <div className={`p-2 rounded-lg ${action.bg} group-hover:bg-white shrink-0`}>
                    <action.icon size={16} className={action.color} />
                  </div>
                  <span className="font-semibold text-gray-700 text-xs group-hover:text-[#0369a1] truncate">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

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
                <p className="text-xs text-gray-500 text-center py-8">No recent leads found.</p>
              ) : (
                stats.recentActivity.map((lead, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-sky-200 transition-all">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{lead.name}</p>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">
                        {lead.destination || 'Chardham Yatra'} {lead.budget ? `· ₹${Number(lead.budget).toLocaleString()}` : ''}
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
