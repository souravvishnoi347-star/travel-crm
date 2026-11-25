"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Hotel, 
  Car, 
  Menu, 
  X, 
  Map, 
  Users, 
  Store, 
  Settings, 
  LogOut, 
  Image as ImageIcon,
  FolderArchive,
  MessageSquare,
  Calculator,
  ChevronRight,
  PanelLeftClose
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeType?: "default" | "live" | "muted";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Yatra Operations",
    items: [
      { name: "Yatra Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Chardham Itineraries", href: "/itinerary-builder", icon: Map, badge: "Hub", badgeType: "default" },
      { name: "Documents & Vouchers", href: "/documents", icon: FolderArchive },
      { name: "Hotel Service Vouchers", href: "/hotels", icon: Hotel },
      { name: "Transport Vouchers", href: "/transport", icon: Car },
    ],
  },
  {
    title: "Commercials & Leads",
    items: [
      { name: "Trip Cost Calculator", href: "/quotation-calculator", icon: Calculator },
      { name: "Yatra Invoices & Billing", href: "/invoices", icon: FileText },
      { name: "Pilgrim Leads", href: "/leads", icon: Users },
      { name: "WhatsApp Live Desk", href: "/whatsapp-desk", icon: MessageSquare, badge: "Live", badgeType: "live" },
    ],
  },
  {
    title: "Assets & Partners",
    items: [
      { name: "Dham Photo Library", href: "/gallery", icon: ImageIcon },
      { name: "Vendors & Payables", href: "/vendors", icon: Store },
      { name: "CRM & WhatsApp Setup", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0b1329] border-b border-slate-800 z-50 flex items-center justify-between px-4 shadow-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-700/80 p-0.5 flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="Travel to Uttarakhand" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">Travel to Uttarakhand</span>
              <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                STUDIO
              </span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
              TOURISM &amp; CRM • HARIDWAR
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1329] border-r border-slate-800/80 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4.5 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-700/60 shadow-md flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/logo.png" 
                alt="Travel to Uttarakhand" 
                className="h-full w-full object-contain" 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14.5px] font-bold text-white tracking-tight leading-tight group-hover:text-sky-300 transition-colors truncate">
                  Travel to Uttarakhand
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30 tracking-tight shrink-0">
                  STUDIO
                </span>
              </div>
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                TOURISM &amp; CRM • HARIDWAR
              </span>
            </div>
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar (Ctrl+B)"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer shrink-0"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                {section.title}
              </div>

              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150 group ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/40 text-sky-300 font-bold shadow-xs"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 transition-transform duration-150 group-hover:scale-105 shrink-0 ${
                        isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>

                    {/* Badges */}
                    {item.badge && (
                      <span
                        className={`ml-auto text-[9.5px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                          item.badgeType === "live"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : item.badgeType === "muted"
                            ? "bg-slate-800/90 text-slate-400 border border-slate-700/60 text-[9px] font-medium"
                            : "bg-slate-800 text-slate-300 border border-slate-700 font-semibold"
                        }`}
                      >
                        {item.badgeType === "live" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {item.badge}
                      </span>
                    )}

                    {/* Active Chevron Indicator */}
                    {isActive && !item.badge && (
                      <ChevronRight className="w-3.5 h-3.5 text-sky-400/80 ml-auto shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Profile Area */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070d19] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white font-black flex items-center justify-center text-xs shadow-md shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {user?.name || "Mr. Amit kumar"}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.email || "admin@traveltouttrakhand.com"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out of CRM"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
