"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AuthScreen } from "@/components/AuthScreen";
import { Loader2, LogOut, ShieldCheck, MapPin, Phone } from "lucide-react";

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <img 
          src="/logo.png" 
          alt="Travel to Uttarakhand" 
          className="h-16 w-auto object-contain animate-pulse" 
        />
        <div className="flex items-center gap-2 text-sm text-sky-400 font-semibold mt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Securing Travel to Uttarakhand CRM...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <Sidebar />
      <main className="lg:pl-72 flex-1 flex flex-col min-h-screen pt-16 lg:pt-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xs">
          <GlobalSearch />
          <div className="flex items-center gap-2.5 text-xs">
            <div className="hidden xl:flex items-center gap-1.5 text-slate-700 bg-amber-50/70 border border-amber-200/70 px-2.5 py-1 rounded-lg font-medium text-[11.5px]">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Haridwar Station Gate 2</span>
            </div>
            <a 
              href="tel:+918266016066" 
              className="hidden lg:flex items-center gap-1.5 text-amber-900 bg-amber-500/10 border border-amber-300/60 px-2.5 py-1 rounded-lg font-bold text-[11.5px] hover:bg-amber-500/15 transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>+91 82660 16066</span>
            </a>
            <span className="hidden lg:inline text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-bold hidden sm:inline">
                {user?.name || "Mr. Gagandeep"}
              </span>
              <button
                onClick={logout}
                title="Sign Out of CRM"
                className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
}
