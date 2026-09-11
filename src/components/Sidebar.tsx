"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Hotel, Car, Menu, X, Plane, Map, Users, Store, Settings, LogOut, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Yatra Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Yatra Invoices & Billing", href: "/invoices", icon: FileText },
  { name: "Chardham Itineraries", href: "/itinerary-builder", icon: Map },
  { name: "Dham Photo Library", href: "/gallery", icon: ImageIcon },
  { name: "Hotel Service Vouchers", href: "/hotels", icon: Hotel },
  { name: "Transport Vouchers", href: "/transport", icon: Car },
  { name: "Pilgrimage Leads", href: "/leads", icon: Users },
  { name: "Vendors & Payables", href: "/vendors", icon: Store },
  { name: "CRM & WhatsApp Setup", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="Travel to Uttarakhand" className="h-11 w-auto object-contain" />
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:text-sky-600 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 lg:px-5 lg:py-4.5 lg:border-b lg:border-slate-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center justify-center p-1 group-hover:border-sky-200 transition-all shrink-0">
              <img 
                src="/logo.png" 
                alt="Travel to Uttarakhand" 
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105" 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight group-hover:text-sky-700 transition-colors">
                Travel to Uttarakhand
              </span>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-sky-600 mt-0.5">
                TOURISM & CRM STUDIO
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-sky-50 to-blue-50/50 text-sky-700 shadow-xs border border-sky-200/80 font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-sky-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-3.5 border-t border-gray-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs shadow-2xs shrink-0">
              {user?.name ? user.name.charAt(0) : "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-900 truncate">
                {user?.name || "Mr. Amit kumar"}
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                {user?.email || "admin@traveltouttrakhand.com"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out of CRM"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
