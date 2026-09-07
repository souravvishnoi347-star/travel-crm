"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  Key,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SettingsData {
  id: string;
  company_name: string;
  gst_number: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  openai_key: string;
}

const defaultSettings: Omit<SettingsData, "id"> = {
  company_name: "Travel to Uttarakhand",
  gst_number: "05AAAPL1234F1Z1",
  phone: "+91 9719038278",
  email: "info@traveltouttarakhand.com",
  website: "https://traveltouttarakhand.com",
  logo_url: "/logo.png",
  openai_key: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("triloki_settings_cache");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {
      id: "local-1",
      ...defaultSettings
    };
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Security & Password Change States
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass !== confirmPass) {
      setPassError("New Password and Confirm Password do not match.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("New Password must be at least 6 characters long.");
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      const res = changePassword(currentPass, newPass);
      if (res.success) {
        setPassSuccess("Password successfully updated! Your new password is now active.");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setPassError(res.error || "Failed to update password.");
      }
      setPassLoading(false);
    }, 400);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (data && !error) {
        const updated: SettingsData = {
          id: data.id,
          company_name: data.company_name ?? defaultSettings.company_name,
          gst_number: data.gst_number ?? defaultSettings.gst_number,
          phone: data.phone ?? defaultSettings.phone,
          email: data.email ?? defaultSettings.email,
          website: data.website ?? defaultSettings.website,
          logo_url: data.logo_url ?? defaultSettings.logo_url,
          openai_key: data.openai_key ?? "",
        };
        setSettings(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("triloki_settings_cache", JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn("Background settings sync:", err);
    }
  }

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, string> = {
      company_name: settings.company_name,
      gst_number: settings.gst_number,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      logo_url: settings.logo_url,
      openai_key: settings.openai_key,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("triloki_settings_cache", JSON.stringify(settings));
    }

    try {
      let error;
      if (settings.id && settings.id !== "local-1") {
        ({ error } = await supabase
          .from("settings")
          .update(payload)
          .eq("id", settings.id));
      } else {
        const { data, error: insertError } = await supabase
          .from("settings")
          .insert([payload])
          .select()
          .single();
        error = insertError;
        if (data) {
          setSettings((prev) => ({ ...prev, id: data.id }));
        }
      }

      if (error) {
        setToast("Saved locally (Cloud sync pending connection)");
      } else {
        setToast("Settings saved successfully!");
      }
    } catch {
      setToast("Settings saved locally!");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof Omit<SettingsData, "id">, value: string) {
    setSettings((prev) => {
      const next = { ...prev, [field]: value };
      if (typeof window !== "undefined") {
        localStorage.setItem("triloki_settings_cache", JSON.stringify(next));
      }
      return next;
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.includes("Failed")
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-sky-100 rounded-xl">
          <Settings className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your company profile and integrations
          </p>
        </div>
      </div>

      {/* Card 1 – Company Profile */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <Building2 className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Company Profile
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Company Name
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => update("company_name", e.target.value)}
              placeholder="Travel to Uttarakhand"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* GST Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              GST Number
            </label>
            <input
              type="text"
              value={settings.gst_number}
              onChange={(e) => update("gst_number", e.target.value)}
              placeholder="22AAAAA0000A1Z5"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Phone Number
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="info@traveltouttarakhand.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Website
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://traveltouttarakhand.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Logo URL + Preview */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Logo URL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={settings.logo_url}
                onChange={(e) => update("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Logo preview"
                  className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-gray-50 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 – AI Configuration */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <Key className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            AI Configuration
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={settings.openai_key}
                onChange={(e) => update("openai_key", e.target.value)}
                placeholder="sk-••••••••••••••••••••••••••••••••"
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This key is used for AI-powered itinerary generation. Your key is
              stored securely and never shared. Get your free key from{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Card 3 – Data Management & Backups */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Data Management & Backups
            </h2>
          </div>
          <span className="text-xs text-gray-500">1-Click Excel / CSV Export</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Export your entire CRM database for accounting, tax filing, or local offline backup.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  const saved = localStorage.getItem("triloki_leads");
                  const leads = saved ? JSON.parse(saved) : [];
                  const headers = ["Lead Name", "Phone", "Destination", "Budget", "Status", "Notes"];
                  const rows = leads.map((l: any) => [l.name, l.phone, l.destination, l.budget, l.status, l.notes]);
                  import("@/lib/exportCsv").then(m => m.exportToCsv("All_Leads_Backup", headers, rows));
                } catch (e) {
                  alert("Could not export leads: " + e);
                }
              }}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              📥 Export All Leads (CSV)
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const saved = localStorage.getItem("triloki_vendors");
                  const vendors = saved ? JSON.parse(saved) : [];
                  const headers = ["Vendor Name", "Type", "Contact Person", "Phone", "Location", "Notes"];
                  const rows = vendors.map((v: any) => [v.name, v.type, v.contact_person, v.phone, v.location, v.notes]);
                  import("@/lib/exportCsv").then(m => m.exportToCsv("All_Vendors_Backup", headers, rows));
                } catch (e) {
                  alert("Could not export vendors: " + e);
                }
              }}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              📥 Export All Vendors (CSV)
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const backup = {
                    date: new Date().toISOString(),
                    settings: localStorage.getItem("triloki_settings_cache"),
                    leads: localStorage.getItem("triloki_leads"),
                    vendors: localStorage.getItem("triloki_vendors"),
                    payables: localStorage.getItem("triloki_payables"),
                    itineraryDraft: localStorage.getItem("triloki_itinerary_draft")
                  };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Travel_to_Uttarakhand_Full_CRM_Backup_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert("Could not export JSON backup: " + e);
                }
              }}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              💾 Full CRM Backup (JSON)
            </button>
          </div>
        </div>

        {/* Card 4 – CRM Access, Security & Password Management */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">CRM Login Security & Password</h2>
              <p className="text-xs text-gray-500">Manage administrator login credentials and change password</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Credentials Info & Recovery PIN */}
            <div className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 text-xs">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[10.5px] block">
                Authorized Login Particulars
              </span>
              <div className="space-y-1.5 text-gray-600">
                <p>• <strong>Primary Admin ID:</strong> <span className="font-mono text-gray-900">admin@traveltouttarakhand.com</span></p>
                <p>• <strong>Alternate Admin ID:</strong> <span className="font-mono text-gray-900">souravvishnoi347@gmail.com</span></p>
                <p>• <strong>Default Password:</strong> <span className="font-mono text-gray-900">Devbhoomi@2026</span></p>
                <p>• <strong>Master Recovery PIN:</strong> <span className="font-mono text-amber-700 font-bold">971903</span> (Linked to +91 9719038278)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-sky-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>If you forget your password on the login screen, click <strong>&quot;Forgot Password?&quot;</strong> and verify with your registered email and Master PIN <strong>971903</strong>.</span>
              </div>
            </div>

            {/* Right: Change Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[10.5px] block">
                Update Administrator Password
              </span>

              {passError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-600 font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white rounded-lg font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {passLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Update Password
              </button>
            </form>

          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
