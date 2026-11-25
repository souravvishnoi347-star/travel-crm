"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AuthScreen } from "@/components/AuthScreen";
import { Loader2, LogOut, ShieldCheck, MapPin, Phone, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

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
      <main className={`flex-1 flex flex-col min-h-screen pt-16 lg:pt-0 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "lg:pl-0" : "lg:pl-72"
      }`}>
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xs gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Desktop Sidebar Open/Close Toggle Button */}
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Open Sidebar Menu (Ctrl+B)" : "Close Sidebar for Full Width Studio (Ctrl+B)"}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 shadow-2xs ${
                isSidebarCollapsed 
                  ? "bg-[#0b1329] text-sky-400 hover:text-white hover:bg-slate-800 border-slate-700 hover:shadow-xs"
                  : "bg-white text-slate-700 hover:text-sky-700 hover:bg-sky-50 border-gray-200 hover:border-sky-300"
              }`}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-sky-400" />
                  <span className="font-extrabold tracking-wide">Open Menu</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                  <span className="hidden xl:inline text-slate-600 font-semibold">Close Panel</span>
                </>
              )}
            </button>
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <a 
              href="https://traveltouttrakhand.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-sky-700 font-semibold bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition"
            >
              🌐 traveltouttrakhand.com
            </a>
            <a 
              href="tel:+919719038278" 
              className="hidden lg:flex items-center gap-1.5 text-sky-800 bg-sky-50/70 border border-sky-200 px-2.5 py-1 rounded-lg font-bold text-[11.5px] hover:bg-sky-100 transition"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>+91 97190 38278</span>
            </a>
            <span className="hidden sm:inline text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-bold hidden sm:inline">
                {user?.name || "Mr. Amit kumar"}
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
        <div className="flex-1 w-full mx-auto p-3 sm:p-4 lg:p-5">
          {children}
        </div>
      </main>
    </>
  );
}
