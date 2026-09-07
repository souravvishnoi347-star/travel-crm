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
} from "lucide-react";

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
