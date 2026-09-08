"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AuthScreen } from "@/components/AuthScreen";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";

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
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between">
          <GlobalSearch />
          <div className="flex items-center gap-3 text-xs">
            <a 
              href="https://traveltouttrakhand.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition"
            >
              🌐 traveltouttrakhand.com
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-semibold hidden sm:inline">
                {user?.name || "Mr. Amit kumar"}
              </span>
              <button
                onClick={logout}
                title="Sign Out of CRM"
                className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
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
