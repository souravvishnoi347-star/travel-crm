"use client";

import { useState, useMemo } from "react";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  Sparkles, 
  IndianRupee, 
  Percent, 
  RefreshCw, 
  Users, 
  Calendar, 
  Hotel, 
  Car, 
  Utensils, 
  ShieldCheck, 
  Compass, 
  ArrowRight,
  ChevronDown,
  Info,
  DollarSign
} from "lucide-react";

interface CostItem {
  id: string;
  category: "hotel" | "transport" | "meals" | "activities" | "misc";
  title: string;
  unitCost: number;
  quantity: number;
  days: number;
  notes?: string;
}

interface PackageTemplate {
  name: string;
  badge: string;
  pax: number;
  days: number;
  nights: number;
  items: Omit<CostItem, "id">[];
}

const TEMPLATES: PackageTemplate[] = [
  {
    name: "Char Dham Yatra Deluxe (9N/10D)",
    badge: "Most Popular",
    pax: 4,
    days: 10,
    nights: 9,
    items: [
      { category: "hotel", title: "Barkot / Yamunotri Hotel (2 Rooms x 2N)", unitCost: 2800, quantity: 2, days: 2, notes: "Deluxe MAP plan" },
      { category: "hotel", title: "Uttarkashi / Gangotri Hotel (2 Rooms x 2N)", unitCost: 3200, quantity: 2, days: 2, notes: "Deluxe riverside" },
      { category: "hotel", title: "Guptkashi / Phata Hotel (2 Rooms x 2N)", unitCost: 3500, quantity: 2, days: 2, notes: "Helipad access hotel" },
      { category: "hotel", title: "Kedarnath Alpine Camp / GMVN (2 Tents x 1N)", unitCost: 4000, quantity: 2, days: 1, notes: "Near Temple base" },
      { category: "hotel", title: "Badrinath Deluxe Hotel (2 Rooms x 1N)", unitCost: 4200, quantity: 2, days: 1, notes: "Temple view rooms" },
      { category: "hotel", title: "Rudraprayag / Srinagar (2 Rooms x 1N)", unitCost: 2500, quantity: 2, days: 1, notes: "Transit comfort stay" },
      { category: "transport", title: "Innova Crysta AC (10 Days Haridwar-to-Haridwar)", unitCost: 5500, quantity: 1, days: 10, notes: "Incl. Fuel, Toll, Parking & Driver DA" },
      { category: "meals", title: "Breakfast + Dinner (MAP Meal Plan 4 Pax)", unitCost: 650, quantity: 4, days: 10, notes: "Pure veg satvik meals" },
      { category: "misc", title: "Char Dham Biometric Pass & Yatra Assistance", unitCost: 500, quantity: 1, days: 1, notes: "Verification & kit" }
    ]
  },
  {
    name: "Do Dham Kedarnath - Badrinath (5N/6D)",
    badge: "High Demand",
    pax: 2,
    days: 6,
    nights: 5,
    items: [
      { category: "hotel", title: "Guptkashi / Sitapur Hotel (1 Room x 2N)", unitCost: 3200, quantity: 1, days: 2, notes: "Deluxe room" },
      { category: "hotel", title: "Kedarnath Top Stay (1 Room x 1N)", unitCost: 4500, quantity: 1, days: 1, notes: "Alpine tent / Cottage" },
      { category: "hotel", title: "Badrinath Hotel (1 Room x 1N)", unitCost: 3800, quantity: 1, days: 1, notes: "Near Mandir" },
      { category: "hotel", title: "Pipalkoti / Rudraprayag (1 Room x 1N)", unitCost: 2600, quantity: 1, days: 1, notes: "Transit stay" },
      { category: "transport", title: "Dzire / Etios AC (6 Days Haridwar to Haridwar)", unitCost: 3800, quantity: 1, days: 6, notes: "All tolls, parking & driver allowance included" },
      { category: "meals", title: "MAP Meal Plan (Breakfast & Dinner 2 Pax)", unitCost: 600, quantity: 2, days: 6, notes: "Standard hygienic veg" },
      { category: "misc", title: "Priority Darshan & Registration Coordination", unitCost: 800, quantity: 1, days: 1, notes: "Local manager support" }
    ]
  },
  {
    name: "Ek Dham Kedarnath Darshan (3N/4D)",
    badge: "Quick Weekend",
    pax: 4,
    days: 4,
    nights: 3,
    items: [
      { category: "hotel", title: "Sitapur / Sonprayag Hotel (2 Rooms x 2N)", unitCost: 3000, quantity: 2, days: 2, notes: "Base camp comfort stay" },
      { category: "hotel", title: "Kedarnath Temple Stay (2 Rooms x 1N)", unitCost: 4200, quantity: 2, days: 1, notes: "Near Kedarnath Ji" },
      { category: "transport", title: "Ertiga / Bolero 4WD (4 Days Yatra)", unitCost: 4200, quantity: 1, days: 4, notes: "Mountain experienced driver" },
      { category: "meals", title: "Breakfast & Dinner (4 Pax x 4 Days)", unitCost: 550, quantity: 4, days: 4, notes: "Satvik meals" },
      { category: "misc", title: "Biometric Registration & Yatra Medical Kit", unitCost: 600, quantity: 1, days: 1, notes: "Oxygen can + assistance" }
    ]
  }
];

export default function QuotationCalculatorPage() {
  // General Trip Metadata
  const [tripTitle, setTripTitle] = useState("Char Dham Deluxe Yatra 2026");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [travelDates, setTravelDates] = useState("May - June 2026");
  const [paxCount, setPaxCount] = useState<number>(4);
  const [durationDays, setDurationDays] = useState<number>(10);
  const [durationNights, setDurationNights] = useState<number>(9);

  // Cost items
  const [items, setItems] = useState<CostItem[]>([
    { id: "1", category: "hotel", title: "Barkot / Yamunotri Stay (2 Rooms x 2N)", unitCost: 2800, quantity: 2, days: 2, notes: "Deluxe room" },
    { id: "2", category: "hotel", title: "Uttarkashi / Gangotri Stay (2 Rooms x 2N)", unitCost: 3200, quantity: 2, days: 2, notes: "River view hotel" },
    { id: "3", category: "hotel", title: "Guptkashi / Phata Stay (2 Rooms x 2N)", unitCost: 3500, quantity: 2, days: 2, notes: "Near Helipad" },
    { id: "4", category: "hotel", title: "Kedarnath Temple Stay (2 Tents x 1N)", unitCost: 4000, quantity: 2, days: 1, notes: "Alpine tent" },
    { id: "5", category: "hotel", title: "Badrinath Deluxe Stay (2 Rooms x 1N)", unitCost: 4200, quantity: 2, days: 1, notes: "Near Mandir" },
    { id: "6", category: "hotel", title: "Rudraprayag Stay (2 Rooms x 1N)", unitCost: 2500, quantity: 2, days: 1, notes: "Transit comfort" },
    { id: "7", category: "transport", title: "Innova Crysta AC (10 Days)", unitCost: 5500, quantity: 1, days: 10, notes: "All toll, parking & driver allowance" },
    { id: "8", category: "meals", title: "MAP Meal Plan (Breakfast + Dinner)", unitCost: 650, quantity: 4, days: 10, notes: "Pure veg food" },
    { id: "9", category: "misc", title: "Biometric Pass & Yatra Kit Support", unitCost: 500, quantity: 1, days: 1, notes: "Operations coordination" }
  ]);

  // Margin Mode & Values
  const [marginMode, setMarginMode] = useState<"percentage" | "manual">("percentage");
  const [marginPercentage, setMarginPercentage] = useState<number>(18);
  const [manualMarginType, setManualMarginType] = useState<"total" | "perPax">("total");
  const [manualMarginAmount, setManualMarginAmount] = useState<number>(25000);

  // GST Toggle
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(5); // 5% tour package GST default in India

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Calculations
  const calculations = useMemo(() => {
    // 1. Total Net Cost of all items
    const netCost = items.reduce((sum, item) => {
      return sum + (Number(item.unitCost) * Number(item.quantity) * Number(item.days || 1));
    }, 0);

    // 2. Margin Amount
    let marginAmount = 0;
    let effectiveMarginPct = 0;

    if (marginMode === "percentage") {
      marginAmount = Math.round(netCost * (Number(marginPercentage) / 100));
      effectiveMarginPct = Number(marginPercentage);
    } else {
      if (manualMarginType === "perPax") {
        marginAmount = Math.round(Number(manualMarginAmount) * Math.max(1, paxCount));
      } else {
        marginAmount = Math.round(Number(manualMarginAmount));
      }
      effectiveMarginPct = netCost > 0 ? Number(((marginAmount / netCost) * 100).toFixed(1)) : 0;
    }

    // 3. Subtotal before Tax
    const subtotal = netCost + marginAmount;

    // 4. GST
    const gstAmount = includeGst ? Math.round(subtotal * (Number(gstRate) / 100)) : 0;

    // 5. Grand Total (Customer Quote)
    const grandTotal = subtotal + gstAmount;

    // 6. Per Person breakdown
    const safePax = Math.max(1, paxCount);
    const netPerPax = Math.round(netCost / safePax);
    const marginPerPax = Math.round(marginAmount / safePax);
    const quotePerPax = Math.round(grandTotal / safePax);

    return {
      netCost,
      marginAmount,
      effectiveMarginPct,
      subtotal,
      gstAmount,
      grandTotal,
      netPerPax,
      marginPerPax,
      quotePerPax
    };
  }, [items, marginMode, marginPercentage, manualMarginType, manualMarginAmount, includeGst, gstRate, paxCount]);

  // Handle Add Item
  const addItem = (category: CostItem["category"] = "hotel") => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      category,
      title: category === "hotel" ? "Hotel Stay (Nights)" : category === "transport" ? "Vehicle Charges" : "Custom Service",
      unitCost: 2000,
      quantity: category === "transport" ? 1 : 2,
      days: 1,
      notes: ""
    };
    setItems(prev => [...prev, newItem]);
  };

  // Handle Delete Item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Handle Update Item
  const updateItem = (id: string, field: keyof CostItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Load Template
  const applyTemplate = (tpl: PackageTemplate) => {
    setTripTitle(tpl.name);
    setPaxCount(tpl.pax);
    setDurationDays(tpl.days);
    setDurationNights(tpl.nights);
    setItems(tpl.items.map((it, idx) => ({
      ...it,
      id: `${Date.now()}_${idx}`
    })));
  };

  // WhatsApp Quotation Formatter
  const whatsappQuoteText = useMemo(() => {
    const lines = [
      `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏`,
      `*TRAVEL TO UTTARAKHAND - PILGRIMAGE QUOTATION*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📌 *Package:* ${tripTitle}`,
      travelDates ? `🗓️ *Duration:* ${durationDays}D / ${durationNights}N (${travelDates})` : `🗓️ *Duration:* ${durationDays}D / ${durationNights}N`,
      `👥 *Pilgrims:* ${paxCount} Devotees`,
      customerName ? `👤 *Quotation For:* ${customerName}` : "",
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 *PACKAGE INCLUSIONS & BREAKDOWN:*`,
      ...items.map(it => {
        const total = Number(it.unitCost) * Number(it.quantity) * Number(it.days || 1);
        const icon = it.category === "hotel" ? "🏨" : it.category === "transport" ? "🚗" : it.category === "meals" ? "🍽️" : "✨";
        return `${icon} • *${it.title}*${it.notes ? ` (${it.notes})` : ""}`;
      }),
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *QUOTATION SUMMARY:*`,
      `• *Per Person (Per Pax):* ₹${calculations.quotePerPax.toLocaleString("en-IN")}/-`,
      `• *Total Package Price:* ₹${calculations.grandTotal.toLocaleString("en-IN")}/- ${includeGst ? `(Incl. ${gstRate}% GST)` : "(Net of Tax)"}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `✨ *Special Guidelines:*`,
      `• Free Biometric / Yatra Registration Assistance provided.`,
      `• Safe, sanitized vehicles with certified hill-terrain drivers.`,
      `• 24x7 local on-ground Yatra coordinator support.`,
      ``,
      `📞 *Book / Customize with Our Yatra Experts:*`,
      `Mr. Rishi Chourasia: +91 9690510125`,
      `Mr. Kuldeep Bhaudula: +91 8449982433`,
      `Mr. Amit Chandra: +91 9719038278`,
      `🌐 www.traveltoutrakhand.com`
    ].filter(Boolean);

    return lines.join("\n");
  }, [tripTitle, travelDates, durationDays, durationNights, paxCount, customerName, items, calculations, includeGst, gstRate]);

  // Copy to Clipboard
  const copyQuotation = () => {
    navigator.clipboard.writeText(whatsappQuoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Open in WhatsApp
  const shareOnWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappQuoteText);
    const targetPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, "") : "";
    const url = targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shadow-xs">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">Trip Cost & Quotation Calculator</h1>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Smart Margins
                  </span>
                </div>
                <p className="text-xs text-slate-500">Calculate net costs, add percentage (%) or manual (₹) margins, and generate 1-click WhatsApp quotes.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copyQuotation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied Quote!" : "Copy Quote"}
              </button>

              <button
                onClick={shareOnWhatsApp}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share on WhatsApp
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                title="Print Quotation"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Templates Quick Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white mb-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">Quick Yatra Presets (1-Click Itinerary Templates):</span>
            </div>
            <span className="text-xs text-emerald-200">Select any template to auto-populate standard hotels & transport</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(tpl)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-emerald-400 p-3 rounded-xl text-left transition-all group flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {tpl.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-emerald-200 mt-1.5">
                    <span>👥 {tpl.pax} Pax</span>
                    <span>•</span>
                    <span>⏳ {tpl.days}D/{tpl.nights}N</span>
                    <span>•</span>
                    <span className="bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded text-[10px]">
                      {tpl.badge}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Cost Breakdown & Items (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Trip General Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                1. Trip & Customer Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Package / Itinerary Title</label>
                  <input
                    type="text"
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Char Dham Deluxe Tour 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Number of Pilgrims (Pax)</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={paxCount}
                      onChange={(e) => setPaxCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Customer / Devotee Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Sharma Family (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp Number (For Direct Share)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration & Tentative Dates</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                      className="w-16 text-sm text-center font-medium bg-slate-50 border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-emerald-500"
                      title="Days"
                    />
                    <span className="text-xs text-slate-500">Days</span>
                    <input
                      type="number"
                      min="0"
                      value={durationNights}
                      onChange={(e) => setDurationNights(parseInt(e.target.value) || 0)}
                      className="w-16 text-sm text-center font-medium bg-slate-50 border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-emerald-500"
                      title="Nights"
                    />
                    <span className="text-xs text-slate-500">Nights</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Items Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-emerald-600" />
                    2. Direct Cost Items Breakdown (Net Vendor Costs)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enter hotel room rates, vehicle rentals, meal packages, and other direct expenses.</p>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => addItem("hotel")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Hotel
                  </button>
                  <button
                    onClick={() => addItem("transport")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Vehicle
                  </button>
                  <button
                    onClick={() => addItem("meals")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Meals
                  </button>
                  <button
                    onClick={() => addItem("misc")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Custom
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No cost items added yet. Click &quot;+ Hotel&quot; or select a preset template above to get started.
                  </div>
                ) : (
                  items.map((item, index) => {
                    const itemTotal = Number(item.unitCost) * Number(item.quantity) * Number(item.days || 1);
                    return (
                      <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* Category Badge & Title */}
                          <div className="col-span-12 md:col-span-5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                item.category === "hotel" ? "bg-blue-100 text-blue-800" :
                                item.category === "transport" ? "bg-amber-100 text-amber-800" :
                                item.category === "meals" ? "bg-purple-100 text-purple-800" :
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {item.category}
                              </span>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem(item.id, "title", e.target.value)}
                                className="w-full text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                                placeholder="Item description"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.notes || ""}
                              onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                              className="w-full text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-400 focus:outline-none px-1 py-0.5 mt-0.5"
                              placeholder="Notes (e.g. Deluxe MAP, Helipad access)"
                            />
                          </div>

                          {/* Unit Rate (₹) */}
                          <div className="col-span-4 md:col-span-2">
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider md:hidden">Unit Rate</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={item.unitCost}
                                onChange={(e) => updateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                                className="w-full text-sm text-right font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Quantity (Rooms/Vehicles/Pax) */}
                          <div className="col-span-3 md:col-span-2">
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider md:hidden">Qty / Units</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                                className="w-full text-sm text-center font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                title="Quantity (e.g. 2 Rooms)"
                              />
                              <span className="text-[10px] text-slate-400 shrink-0">qty</span>
                            </div>
                          </div>

                          {/* Days / Nights Multiplier */}
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider md:hidden">Days</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={item.days}
                                onChange={(e) => updateItem(item.id, "days", parseInt(e.target.value) || 1)}
                                className="w-full text-sm text-center font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                title="Days or Nights multiplier"
                              />
                              <span className="text-[10px] text-slate-400 shrink-0">D</span>
                            </div>
                          </div>

                          {/* Line Total & Remove */}
                          <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-slate-300 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Net Subtotal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Net Cost (Vendor Cost):</span>
                <span className="text-base font-bold text-slate-900">₹{calculations.netCost.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Margin Setting & Final Quotation Summary (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Margin Configuration Box */}
            <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/40 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  3. Profit Margin Setting
                </h2>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  +{calculations.effectiveMarginPct}% Margin
                </span>
              </div>

              {/* Mode Selector Toggle: Percentage (%) vs Manual (₹) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setMarginMode("percentage")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    marginMode === "percentage"
                      ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setMarginMode("manual")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    marginMode === "manual"
                      ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  Manual Flat (₹)
                </button>
              </div>

              {/* Percentage Controls */}
              {marginMode === "percentage" ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
                      <span>Agency Margin %:</span>
                      <span className="font-bold text-emerald-700 text-sm">{marginPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={marginPercentage}
                      onChange={(e) => setMarginPercentage(parseInt(e.target.value) || 0)}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Preset Percent Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[10, 15, 18, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setMarginPercentage(pct)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          marginPercentage === pct
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-900 flex justify-between items-center">
                    <span>Total Net Profit Earned:</span>
                    <span className="font-bold text-sm text-emerald-700">+₹{calculations.marginAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ) : (
                /* Manual Flat Amount Controls */
                <div className="space-y-3">
                  {/* Flat Margin Type: Total Trip or Per Pax */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={manualMarginType === "total"}
                        onChange={() => setManualMarginType("total")}
                        className="accent-emerald-600"
                      />
                      <span>Total Trip Profit (Flat ₹)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                      <input
                        type="radio"
                        checked={manualMarginType === "perPax"}
                        onChange={() => setManualMarginType("perPax")}
                        className="accent-emerald-600"
                      />
                      <span>Per Person (₹/Pax)</span>
                    </label>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={manualMarginAmount}
                      onChange={(e) => setManualMarginAmount(parseFloat(e.target.value) || 0)}
                      className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. 25000"
                    />
                  </div>

                  {/* Preset Quick Add Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(manualMarginType === "total" ? [10000, 15000, 20000, 25000, 35000] : [2500, 3500, 5000, 7500]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setManualMarginAmount(amt)}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          manualMarginAmount === amt
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        ₹{(amt / 1000)}k
                      </button>
                    ))}
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-900 flex justify-between items-center">
                    <span>Effective Profit Margin:</span>
                    <span className="font-bold text-sm text-emerald-700">
                      +₹{calculations.marginAmount.toLocaleString("en-IN")} ({calculations.effectiveMarginPct}%)
                    </span>
                  </div>
                </div>
              )}

              {/* GST Policy Setting */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      className="accent-emerald-600 rounded w-4 h-4 cursor-pointer"
                    />
                    <span>Add Tour Package GST ({gstRate}%)</span>
                  </label>
                  {includeGst && (
                    <span className="text-xs font-semibold text-slate-700">
                      +₹{calculations.gstAmount.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* GRAND TOTAL SUMMARY CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl">
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-[11px] bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Final Quotation
              </span>

              {/* Per Pax Price Banner */}
              <div className="mt-4">
                <div className="text-xs text-slate-300 font-medium">Rate Per Pilgrim (Per Pax):</div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-0.5 tracking-tight flex items-baseline gap-1">
                  ₹{calculations.quotePerPax.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-slate-300">/ person</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Based on {paxCount} Devotees traveling together</div>
              </div>

              <div className="my-5 border-t border-white/10" />

              {/* Detailed Numbers Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Net Direct Cost:</span>
                  <span className="font-semibold text-white">₹{calculations.netCost.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-emerald-300">
                  <span>Agency Profit ({calculations.effectiveMarginPct}%):</span>
                  <span className="font-semibold">+₹{calculations.marginAmount.toLocaleString("en-IN")}</span>
                </div>

                {includeGst && (
                  <div className="flex justify-between text-slate-300">
                    <span>GST ({gstRate}% Tour Package):</span>
                    <span className="font-semibold text-white">+₹{calculations.gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
                  <span>Grand Total Quote:</span>
                  <span className="text-lg text-emerald-400">₹{calculations.grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
                <button
                  onClick={copyQuotation}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>

                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Send Quote
                </button>
              </div>
            </div>

            {/* Helpful Agency Note Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Uttarakhand Agency Tip:</span>
                  <p className="mt-1 text-amber-800/90 leading-relaxed">
                    Char Dham packages typically carry a <strong>15% to 22% margin</strong> to cover mountain route contingency buffers, driver hill allowances, and dynamic high-altitude hotel surcharges in peak May-June.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
