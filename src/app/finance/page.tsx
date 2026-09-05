"use client";

import { useState, useEffect } from "react";
import { 
  WalletCards, 
  ArrowUpRight, 
  ArrowDownLeft, 
  IndianRupee, 
  Building2, 
  Plus, 
  Filter, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search,
  X,
  CreditCard,
  Banknote,
  PieChart,
  ArrowRightLeft
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "upi";
  accountNumber?: string;
  balance: number;
}

interface Transaction {
  id: string;
  date: string;
  type: "inflow" | "outflow";
  category: string;
  amount: number;
  accountId: string;
  clientOrVendor: string;
  tripReference?: string;
  paymentMode: string;
  notes?: string;
}

interface TripPL {
  id: string;
  clientName: string;
  tripTitle: string;
  sellingPrice: number;
  hotelCost: number;
  transportCost: number;
  otherCost: number;
  receivedAmount: number;
  paymentStatus: "paid" | "partial" | "pending";
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "acc-1", name: "HDFC Current Account (Main)", type: "bank", accountNumber: "XXXX-9481", balance: 485000 },
  { id: "acc-2", name: "ICICI Travel Operations", type: "bank", accountNumber: "XXXX-3120", balance: 215000 },
  { id: "acc-3", name: "Office Cash Drawer", type: "cash", balance: 42500 },
  { id: "acc-4", name: "Triloki Agency UPI / QR", type: "upi", accountNumber: "triloki@hdfc", balance: 88400 },
];

const DEFAULT_TRIPS: TripPL[] = [
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

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    date: "2026-09-02",
    type: "inflow",
    category: "Client Advance",
    amount: 100000,
    accountId: "acc-1",
    clientOrVendor: "Mr. Ghanshyam",
    tripReference: "Chardham Yatra 12D/11N",
    paymentMode: "NEFT / NetBanking",
    notes: "Advance 50% for Chardham booking"
  },
  {
    id: "tx-2",
    date: "2026-09-02",
    type: "outflow",
    category: "Heli Booking Deposit",
    amount: 24000,
    accountId: "acc-1",
    clientOrVendor: "Pawan Hans / Heli Ops",
    tripReference: "Chardham Yatra 12D/11N",
    paymentMode: "Bank Transfer",
    notes: "2 pax Kedarnath Heli ticket block"
  },
  {
    id: "tx-3",
    date: "2026-09-03",
    type: "inflow",
    category: "Client Final Payment",
    amount: 95000,
    accountId: "acc-4",
    clientOrVendor: "Mr. Alladi Balraj",
    tripReference: "Katra Vaishno Devi Tour",
    paymentMode: "UPI",
    notes: "Full settlement received"
  },
  {
    id: "tx-4",
    date: "2026-09-03",
    type: "outflow",
    category: "Hotel Advance",
    amount: 20000,
    accountId: "acc-2",
    clientOrVendor: "Sarovar Portico Katra",
    tripReference: "Katra Vaishno Devi Tour",
    paymentMode: "IMPS",
    notes: "Room confirmation advance"
  },
  {
    id: "tx-5",
    date: "2026-09-04",
    type: "outflow",
    category: "Driver Bata & Diesel",
    amount: 8000,
    accountId: "acc-3",
    clientOrVendor: "Driver Ramesh (Innova)",
    tripReference: "Haridwar - Barkot leg",
    paymentMode: "Cash",
    notes: "On-road fuel & toll expense"
  }
];

export default function FinancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trips, setTrips] = useState<TripPL[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Modals
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<"inflow" | "outflow">("inflow");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "inflow" | "outflow">("all");

  // Form states
  const [txForm, setTxForm] = useState({
    category: "Client Advance",
    amount: "",
    accountId: "acc-1",
    clientOrVendor: "",
    tripReference: "",
    paymentMode: "UPI",
    notes: ""
  });

  const [accForm, setAccForm] = useState({
    name: "",
    type: "bank" as "bank" | "cash" | "upi",
    accountNumber: "",
    balance: ""
  });

  const [tripForm, setTripForm] = useState({
    clientName: "",
    tripTitle: "",
    sellingPrice: "",
    hotelCost: "",
    transportCost: "",
    otherCost: "",
    receivedAmount: ""
  });

  // Load initial data from localStorage with fallback to defaults
  useEffect(() => {
    const savedAccounts = localStorage.getItem("triloki_finance_accounts");
    const savedTrips = localStorage.getItem("triloki_finance_trips");
    const savedTx = localStorage.getItem("triloki_finance_tx");

    if (savedAccounts) {
      try { setAccounts(JSON.parse(savedAccounts)); } catch { setAccounts(DEFAULT_ACCOUNTS); }
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
      localStorage.setItem("triloki_finance_accounts", JSON.stringify(DEFAULT_ACCOUNTS));
    }

    if (savedTrips) {
      try { setTrips(JSON.parse(savedTrips)); } catch { setTrips(DEFAULT_TRIPS); }
    } else {
      setTrips(DEFAULT_TRIPS);
      localStorage.setItem("triloki_finance_trips", JSON.stringify(DEFAULT_TRIPS));
    }

    if (savedTx) {
      try { setTransactions(JSON.parse(savedTx)); } catch { setTransactions(DEFAULT_TRANSACTIONS); }
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      localStorage.setItem("triloki_finance_tx", JSON.stringify(DEFAULT_TRANSACTIONS));
    }
  }, []);

  // Save changes helper
  const saveState = (newAccs: Account[], newTrips: TripPL[], newTxs: Transaction[]) => {
    setAccounts(newAccs);
    setTrips(newTrips);
    setTransactions(newTxs);
    localStorage.setItem("triloki_finance_accounts", JSON.stringify(newAccs));
    localStorage.setItem("triloki_finance_trips", JSON.stringify(newTrips));
    localStorage.setItem("triloki_finance_tx", JSON.stringify(newTxs));
  };

  // Calculations
  const totalFundsInAccounts = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  
  const totalReceivables = trips.reduce((sum, t) => {
    const pending = t.sellingPrice - t.receivedAmount;
    return sum + (pending > 0 ? pending : 0);
  }, 0);

  const totalTripRevenue = trips.reduce((sum, t) => sum + t.sellingPrice, 0);
  const totalTripCosts = trips.reduce((sum, t) => sum + t.hotelCost + t.transportCost + t.otherCost, 0);
  const netEstimatedProfit = totalTripRevenue - totalTripCosts;
  const averageMargin = totalTripRevenue > 0 ? Math.round((netEstimatedProfit / totalTripRevenue) * 100) : 0;

  const totalInflows = transactions.filter(t => t.type === "inflow").reduce((sum, t) => sum + t.amount, 0);
  const totalOutflows = transactions.filter(t => t.type === "outflow").reduce((sum, t) => sum + t.amount, 0);

  // Handle Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: txType,
      category: txForm.category,
      amount: amountNum,
      accountId: txForm.accountId,
      clientOrVendor: txForm.clientOrVendor || (txType === "inflow" ? "Client" : "Vendor"),
      tripReference: txForm.tripReference,
      paymentMode: txForm.paymentMode,
      notes: txForm.notes
    };

    // Update account balance
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === txForm.accountId) {
        const delta = txType === "inflow" ? amountNum : -amountNum;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    });

    // If linked to trip, update trip received amount if inflow
    let updatedTrips = [...trips];
    if (txType === "inflow" && txForm.tripReference) {
      updatedTrips = updatedTrips.map(tr => {
        if (tr.tripTitle.toLowerCase().includes(txForm.tripReference.toLowerCase()) || tr.clientName.toLowerCase().includes(txForm.clientOrVendor.toLowerCase())) {
          const newReceived = tr.receivedAmount + amountNum;
          const status = newReceived >= tr.sellingPrice ? "paid" : "partial";
          return { ...tr, receivedAmount: newReceived, paymentStatus: status };
        }
        return tr;
      });
    }

    const updatedTxs = [newTx, ...transactions];
    saveState(updatedAccounts, updatedTrips, updatedTxs);

    // Reset & close
    setTxForm({
      category: txType === "inflow" ? "Client Advance" : "Hotel Advance",
      amount: "",
      accountId: accounts[0]?.id || "acc-1",
      clientOrVendor: "",
      tripReference: "",
      paymentMode: "UPI",
      notes: ""
    });
    setShowTxModal(false);
  };

  // Handle Add Account
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.name) {
      alert("Please enter an account name.");
      return;
    }
    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: accForm.name,
      type: accForm.type,
      accountNumber: accForm.accountNumber,
      balance: parseFloat(accForm.balance) || 0
    };
    saveState([...accounts, newAcc], trips, transactions);
    setAccForm({ name: "", type: "bank", accountNumber: "", balance: "" });
    setShowAccountModal(false);
  };

  // Handle Add Trip P&L
  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const sell = parseFloat(tripForm.sellingPrice) || 0;
    const hotel = parseFloat(tripForm.hotelCost) || 0;
    const transport = parseFloat(tripForm.transportCost) || 0;
    const other = parseFloat(tripForm.otherCost) || 0;
    const rec = parseFloat(tripForm.receivedAmount) || 0;

    const newTrip: TripPL = {
      id: `trip-${Date.now()}`,
      clientName: tripForm.clientName || "Guest",
      tripTitle: tripForm.tripTitle || "Custom Tour",
      sellingPrice: sell,
      hotelCost: hotel,
      transportCost: transport,
      otherCost: other,
      receivedAmount: rec,
      paymentStatus: rec >= sell && sell > 0 ? "paid" : rec > 0 ? "partial" : "pending"
    };

    saveState(accounts, [newTrip, ...trips], transactions);
    setTripForm({
      clientName: "",
      tripTitle: "",
      sellingPrice: "",
      hotelCost: "",
      transportCost: "",
      otherCost: "",
      receivedAmount: ""
    });
    setShowTripModal(false);
  };

  // Filtered transactions
  const filteredTxs = transactions.filter(t => {
    const matchesFilter = filterType === "all" ? true : t.type === filterType;
    const matchesSearch = searchTerm === "" || 
      t.clientOrVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tripReference && t.tripReference.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Client/Vendor", "Trip Reference", "Payment Mode", "Notes"];
    const rows = transactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      `"${t.category}"`,
      t.amount,
      `"${t.clientOrVendor}"`,
      `"${t.tripReference || ""}"`,
      `"${t.paymentMode}"`,
      `"${t.notes || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Travel_to_Uttarakhand_CashFlow_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <WalletCards className="text-sky-600 w-7 h-7" />
            Funds & Business Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time cash flow, bank balances, trip profitability, and agency financial health.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setTxType("inflow"); setShowTxModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Record Inflow
          </button>
          <button
            onClick={() => { setTxType("outflow"); setShowTxModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            Record Outflow
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Funds in Bank / Cash */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Agency Funds</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                ₹{totalFundsInAccounts.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
            <span>Across {accounts.length} Accounts</span>
            <span className="text-emerald-600 font-medium">Active & Liquid</span>
          </div>
        </div>

        {/* Client Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Receivables</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1.5">
                ₹{totalReceivables.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
            <span>Pending from guests</span>
            <span className="text-amber-600 font-medium">To be collected</span>
          </div>
        </div>

        {/* Net Profit from Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Net Profit</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1.5">
                ₹{netEstimatedProfit.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
            <span>Average Margin</span>
            <span className="text-emerald-600 font-bold">{averageMargin}%</span>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Cash Flow</p>
              <h3 className={`text-2xl font-bold mt-1.5 ${totalInflows - totalOutflows >= 0 ? "text-gray-900" : "text-rose-600"}`}>
                ₹{(totalInflows - totalOutflows).toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
            <span className="text-emerald-600">+{totalInflows.toLocaleString("en-IN")} in</span>
            <span className="text-rose-600">-{totalOutflows.toLocaleString("en-IN")} out</span>
          </div>
        </div>

      </div>

      {/* Bank & Cash Accounts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-600" />
            Agency Accounts & Wallets
          </h2>
          <button
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Account
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map(account => (
            <div key={account.id} className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs hover:border-sky-300 transition">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  account.type === "bank" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  account.type === "upi" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                  "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {account.type}
                </span>
                {account.accountNumber && (
                  <span className="text-xs text-gray-400 font-mono">{account.accountNumber}</span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mt-2 line-clamp-1">{account.name}</h4>
              <p className="text-xl font-bold text-gray-900 mt-2">
                ₹{account.balance.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trip Profit & Loss (P&L) Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tour Bookings & Profit Margins (P&L)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Track package selling price vs vendor costs (hotels, transport, heli) per trip.</p>
          </div>
          <button
            onClick={() => setShowTripModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-black px-3.5 py-2 rounded-xl transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tour P&L
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Client & Trip</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Vendor Costs</th>
                <th className="px-4 py-3">Net Profit</th>
                <th className="px-4 py-3">Margin %</th>
                <th className="px-4 py-3">Collected</th>
                <th className="px-4 py-3">Due Balance</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trips.map(trip => {
                const totalCost = trip.hotelCost + trip.transportCost + trip.otherCost;
                const profit = trip.sellingPrice - totalCost;
                const margin = trip.sellingPrice > 0 ? Math.round((profit / trip.sellingPrice) * 100) : 0;
                const pending = trip.sellingPrice - trip.receivedAmount;

                return (
                  <tr key={trip.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{trip.clientName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{trip.tripTitle}</div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      ₹{trip.sellingPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600">
                      <div>₹{totalCost.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-gray-400">H: ₹{trip.hotelCost} | T: ₹{trip.transportCost}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-600">
                      ₹{profit.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-700">
                      <span className={`px-2 py-0.5 rounded text-xs ${margin >= 20 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      ₹{trip.receivedAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 font-semibold text-amber-600">
                      {pending > 0 ? `₹${pending.toLocaleString("en-IN")}` : <span className="text-emerald-600">Nil</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        trip.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        trip.paymentStatus === "partial" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {trip.paymentStatus === "paid" && <CheckCircle2 className="w-3 h-3" />}
                        {trip.paymentStatus === "partial" && <Clock className="w-3 h-3" />}
                        {trip.paymentStatus === "pending" && <AlertCircle className="w-3 h-3" />}
                        {trip.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Flow Ledger (Transactions) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Ledger Header & Search/Filter */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Cash Flow & Transactions Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Every rupee in and rupee out across bank accounts, UPI, and cash.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search party or trip..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 w-44 sm:w-56"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600">
              <button
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${filterType === "all" ? "bg-white text-gray-900 shadow-xs" : "hover:text-gray-900"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("inflow")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${filterType === "inflow" ? "bg-emerald-600 text-white shadow-xs" : "hover:text-gray-900"}`}
              >
                Inflow
              </button>
              <button
                onClick={() => setFilterType("outflow")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${filterType === "outflow" ? "bg-rose-600 text-white shadow-xs" : "hover:text-gray-900"}`}
              >
                Outflow
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Download Ledger CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Type & Category</th>
                <th className="px-4 py-3">Party / Trip Ref</th>
                <th className="px-4 py-3">Account & Mode</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTxs.map(tx => {
                  const account = accounts.find(a => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${tx.type === "inflow" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className="font-semibold text-gray-900 text-xs">{tx.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-medium text-gray-900">{tx.clientOrVendor}</div>
                        {tx.tripReference && <div className="text-gray-400 text-[11px]">{tx.tripReference}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        <div>{account?.name || "Main Account"}</div>
                        <div className="text-[10px] text-gray-400">{tx.paymentMode}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate">
                        {tx.notes || "—"}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-bold text-sm ${
                        tx.type === "inflow" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {tx.type === "inflow" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Inflow / Outflow Transaction */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {txType === "inflow" ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    Record Inflow (Receipt / Income)
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    Record Outflow (Payment / Expense)
                  </>
                )}
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={txForm.amount}
                  onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-lg font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={txForm.category}
                    onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {txType === "inflow" ? (
                      <>
                        <option value="Client Advance">Client Advance</option>
                        <option value="Client Final Payment">Client Final Payment</option>
                        <option value="Vendor Refund">Vendor Refund</option>
                        <option value="Commission">Commission</option>
                        <option value="Other Inflow">Other Inflow</option>
                      </>
                    ) : (
                      <>
                        <option value="Hotel Advance / Settlement">Hotel Advance / Settlement</option>
                        <option value="Transport / Cab Settlement">Transport / Cab Settlement</option>
                        <option value="Helicopter Ticket Deposit">Helicopter Ticket Deposit</option>
                        <option value="Driver Fuel & Bata">Driver Fuel & Bata</option>
                        <option value="Office Rent & Utilities">Office Rent & Utilities</option>
                        <option value="Digital Ads & Marketing">Digital Ads & Marketing</option>
                        <option value="Staff Salaries">Staff Salaries</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deposit To / From Account</label>
                  <select
                    value={txForm.accountId}
                    onChange={e => setTxForm({ ...txForm, accountId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (₹{a.balance.toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {txType === "inflow" ? "Client Name" : "Vendor / Payee"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Ghanshyam"
                    value={txForm.clientOrVendor}
                    onChange={e => setTxForm({ ...txForm, clientOrVendor: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={txForm.paymentMode}
                    onChange={e => setTxForm({ ...txForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="UPI / QR">UPI / QR</option>
                    <option value="NEFT / RTGS / IMPS">NEFT / RTGS / IMPS</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Trip / Booking Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chardham Yatra 12D/11N"
                  value={txForm.tripReference}
                  onChange={e => setTxForm({ ...txForm, tripReference: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / UTR / Reference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. UTR# 94810283, advance token payment"
                  value={txForm.notes}
                  onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition shadow-xs cursor-pointer ${
                    txType === "inflow" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Agency Account */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                Add Bank / Cash Account
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBI Current Account"
                  value={accForm.name}
                  onChange={e => setAccForm({ ...accForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Type</label>
                <select
                  value={accForm.type}
                  onChange={e => setAccForm({ ...accForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="bank">Bank Account</option>
                  <option value="upi">UPI / Scanner</option>
                  <option value="cash">Cash in Hand</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">A/C Number / UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. XXXX-4910 or name@upi"
                  value={accForm.accountNumber}
                  onChange={e => setAccForm({ ...accForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Starting Balance (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={accForm.balance}
                  onChange={e => setAccForm({ ...accForm, balance: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition shadow-xs cursor-pointer"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Tour P&L */}
      {showTripModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Add Tour Booking & Cost Tracker
              </h3>
              <button onClick={() => setShowTripModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTrip} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Ghanshyam"
                    value={tripForm.clientName}
                    onChange={e => setTripForm({ ...tripForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tour Package Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chardham 12D/11N"
                    value={tripForm.tripTitle}
                    onChange={e => setTripForm({ ...tripForm, tripTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (To Client) ₹ *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={tripForm.sellingPrice}
                    onChange={e => setTripForm({ ...tripForm, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Advance Received ₹</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={tripForm.receivedAmount}
                    onChange={e => setTripForm({ ...tripForm, receivedAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vendor Cost Breakdown</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotels ₹</label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={tripForm.hotelCost}
                      onChange={e => setTripForm({ ...tripForm, hotelCost: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Transport/Cab ₹</label>
                    <input
                      type="number"
                      placeholder="35000"
                      value={tripForm.transportCost}
                      onChange={e => setTripForm({ ...tripForm, transportCost: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Heli/Permits ₹</label>
                    <input
                      type="number"
                      placeholder="15000"
                      value={tripForm.otherCost}
                      onChange={e => setTripForm({ ...tripForm, otherCost: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTripModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Tour P&L
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
