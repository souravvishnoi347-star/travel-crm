"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  UserCheck, 
  Phone, 
  Search, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Calendar, 
  IndianRupee, 
  MapPin, 
  Loader2, 
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Zap,
  ShieldCheck,
  Building2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WhatsAppMessage {
  id: string;
  sender: "customer" | "bot" | "agent";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  isBookingConfirmation?: boolean;
}

interface WhatsAppChat {
  id: string;
  customerName: string;
  phone: string;
  destination: string;
  bookingId?: string;
  totalAmount?: number;
  advancePaid?: number;
  travelDates?: string;
  paxCount?: string;
  humanTakeover: boolean;
  unreadCount: number;
  lastMessageTime: string;
  messages: WhatsAppMessage[];
  status: "inquiry" | "quoted" | "confirmed" | "completed";
}

const INITIAL_CHATS: WhatsAppChat[] = [];

export default function WhatsAppDeskPage() {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "bot" | "human" | "confirmed">("all");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom API configuration cache
  const [metaConfig, setMetaConfig] = useState<{ phoneNumberId: string; accessToken: string }>({
    phoneNumberId: "",
    accessToken: ""
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load WhatsApp credentials and synced CRM leads
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const pId = localStorage.getItem("triloki_meta_phone_number_id") || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID || "1323440530852624";
        const token = localStorage.getItem("triloki_meta_access_token") || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN || "";
        setMetaConfig({ phoneNumberId: pId, accessToken: token });

        const savedChats = localStorage.getItem("triloki_whatsapp_desk_chats");
        if (savedChats) {
          const parsed = JSON.parse(savedChats);
          if (Array.isArray(parsed)) {
            // Purge dummy mock data like Sanjay Singhania or chat-1..4
            const cleanChats = parsed.filter((c: any) => 
              !["chat-1", "chat-2", "chat-3", "chat-4"].includes(c.id) &&
              c.customerName !== "Sanjay Singhania" &&
              c.customerName !== "Pooja Hegde & Family" &&
              c.customerName !== "Dr. Arvind Kulkarni" &&
              c.customerName !== "Vikas Malhotra"
            );
            if (cleanChats.length !== parsed.length) {
              localStorage.setItem("triloki_whatsapp_desk_chats", JSON.stringify(cleanChats));
            }
            setChats(cleanChats);
            if (cleanChats.length > 0) {
              setSelectedChatId(cleanChats[0].id);
            }
          }
        }
      } catch (e) {}
    }
  }, []);

  const saveChats = (updated: WhatsAppChat[]) => {
    setChats(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("triloki_whatsapp_desk_chats", JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scroll active chat messages to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedChatId, chats]);

  // Active Chat
  const activeChat = useMemo(() => {
    return chats.find(c => c.id === selectedChatId) || chats[0];
  }, [chats, selectedChatId]);

  // Analytics (including 250/per day quota)
  const stats = useMemo(() => {
    const totalChats = chats.length;
    const humanTakeovers = chats.filter(c => c.humanTakeover).length;
    const botActive = chats.filter(c => !c.humanTakeover).length;
    const confirmedBookings = chats.filter(c => c.status === "confirmed").length;

    // Daily conversation messages sent today (Tier limit: 250/day)
    const todaySentCount = chats.reduce((acc, c) => {
      return acc + c.messages.filter(m => m.sender === "bot" || m.sender === "agent").length;
    }, 0);

    const dailyLimit = 250;
    const remainingQuota = Math.max(0, dailyLimit - todaySentCount);
    const usagePercent = Math.min(100, Math.round((todaySentCount / dailyLimit) * 100));

    return {
      totalChats,
      humanTakeovers,
      botActive,
      confirmedBookings,
      todaySentCount,
      dailyLimit,
      remainingQuota,
      usagePercent
    };
  }, [chats]);

  // Filtered chats list
  const filteredChats = useMemo(() => {
    return chats.filter(c => {
      if (filterMode === "bot" && c.humanTakeover) return false;
      if (filterMode === "human" && !c.humanTakeover) return false;
      if (filterMode === "confirmed" && c.status !== "confirmed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.customerName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [chats, filterMode, searchQuery]);

  // Toggle Human Takeover
  const toggleHumanTakeover = (chatId: string) => {
    const updated = chats.map(c => {
      if (c.id === chatId) {
        const nextState = !c.humanTakeover;
        const systemMessage: WhatsAppMessage = {
          id: `sys-${Date.now()}`,
          sender: "agent",
          text: nextState 
            ? "⚠️ Human Takeover Enabled: AI Bot paused. You can now chat manually with this customer." 
            : "🤖 AI Bot Resumed: Automated responses re-enabled.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...c,
          humanTakeover: nextState,
          messages: [...c.messages, systemMessage]
        };
      }
      return c;
    });
    saveChats(updated);
    showToast(
      updated.find(c => c.id === chatId)?.humanTakeover 
        ? "👤 Human Takeover Activated: AI Bot is paused for this chat." 
        : "🤖 AI Bot Re-activated for this chat."
    );
  };

  // Send Manual Reply or WhatsApp Web Fallback
  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeChat) return;

    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: activeChat.humanTakeover ? "agent" : "bot",
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };

    const currentText = replyText.trim();
    setReplyText("");
    setIsSending(true);

    // Call backend API if Meta credentials configured
    if (metaConfig.phoneNumberId && metaConfig.accessToken) {
      try {
        const res = await fetch("/api/whatsapp/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: activeChat.phone,
            customerName: activeChat.customerName,
            yatraName: activeChat.destination,
            customMessage: currentText,
            phoneNumberId: metaConfig.phoneNumberId,
            accessToken: metaConfig.accessToken
          })
        });
        const resJson = await res.json();
        if (resJson.success) {
          newMsg.status = "delivered";
          showToast(`✓ Message delivered to ${activeChat.phone} via Meta Cloud API.`);
        }
      } catch (e) {
        console.warn("Meta send notice:", e);
      }
    }

    const updated = chats.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessageTime: "Just now",
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChats(updated);
    setIsSending(false);
  };

  // Send 1-Click Booking Confirmation Template
  const handleSendBookingConfirmation = async () => {
    if (!activeChat) return;
    const confirmText = 
      `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏\n\n` +
      `*DEV BHOOMI YATRA BOOKING CONFIRMATION*\n` +
      `*Travel to Uttarakhand*\n\n` +
      `Dear *${activeChat.customerName}*,\n` +
      `Your sacred pilgrimage booking for *${activeChat.destination}* is successfully confirmed! 🚩\n\n` +
      `📋 *Booking Details:*\n` +
      (activeChat.bookingId ? `• *Booking File:* ${activeChat.bookingId}\n` : "") +
      (activeChat.travelDates ? `• *Dates:* ${activeChat.travelDates}\n` : "") +
      (activeChat.paxCount ? `• *Pilgrims:* ${activeChat.paxCount}\n` : "") +
      (activeChat.totalAmount ? `• *Total Cost:* ₹${activeChat.totalAmount.toLocaleString("en-IN")}\n` : "") +
      (activeChat.advancePaid ? `• *Advance Received:* ₹${activeChat.advancePaid.toLocaleString("en-IN")}\n` : "") +
      (activeChat.totalAmount && activeChat.advancePaid ? `• *Balance Due:* ₹${(activeChat.totalAmount - activeChat.advancePaid).toLocaleString("en-IN")}\n` : "") +
      `\n📞 *24x7 Helpline:* +91 9719038278 (Mr. Amit Kumar)\n` +
      `🌐 *Website:* https://traveltouttrakhand.com\n\n` +
      `May Baba Kedar and Badri Vishal bless your holy pilgrimage! 🙏🌸`;

    setReplyText(confirmText);
    showToast("Template loaded in input box! Click 'Send' or edit before sending.");
  };

  // Open Direct in WhatsApp Web
  const handleOpenWhatsAppWeb = () => {
    if (!activeChat) return;
    const cleanPhone = activeChat.phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(replyText || `Namaste ${activeChat.customerName} ji, warm greetings from Travel to Uttarakhand!`);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                WhatsApp Live Desk & Booking Bot
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                LIVE DESK
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Live customer conversation inbox, booking confirmation dispatcher & Human Takeover supervisor
            </p>
          </div>
        </div>

        {/* 250 / Per Day Quota Gauge Pill */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-sky-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-[170px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Daily Quota:</span>
              <span className="font-mono font-extrabold text-emerald-700 text-[11.5px]">
                {stats.todaySentCount} / {stats.dailyLimit} per day
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-emerald-200/60 rounded-full h-2 mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.usagePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
              {stats.remainingQuota} free conversations remaining today
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Active Chats</span>
            <span className="text-xl font-black text-gray-900">{stats.totalChats}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Confirmed Yatras</span>
            <span className="text-xl font-black text-emerald-700">{stats.confirmedBookings}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">AI Bot Managed</span>
            <span className="text-xl font-black text-purple-700">{stats.botActive}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Human Takeover</span>
            <span className="text-xl font-black text-amber-700">{stats.humanTakeovers}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main 2-Pane Chat Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        
        {/* LEFT PANE: Chat List (5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden h-full">
          
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-gray-100 space-y-2.5 bg-gray-50/60 shrink-0">
            {/* Search + New Chat Button */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const phoneInput = prompt("Enter 10-digit WhatsApp number (e.g. 9719038278):");
                  if (!phoneInput) return;
                  const nameInput = prompt("Enter Customer / Devotee Name:", "Valued Devotee") || "Valued Devotee";
                  const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
                  const newChat: WhatsAppChat = {
                    id: `chat-${Date.now()}`,
                    customerName: nameInput,
                    phone: cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91 ${cleanPhone}`,
                    destination: "Chardham Yatra 2026",
                    humanTakeover: true,
                    unreadCount: 0,
                    lastMessageTime: "Just now",
                    status: "inquiry",
                    messages: [
                      {
                        id: `msg-${Date.now()}`,
                        sender: "agent",
                        text: `Namaste ${nameInput} ji! Warm greetings from Travel to Uttarakhand. How may we assist your holy yatra today?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]
                  };
                  const updated = [newChat, ...chats.filter(c => c.phone !== newChat.phone)];
                  saveChats(updated);
                  setSelectedChatId(newChat.id);
                  showToast(`✓ Started new WhatsApp conversation with ${newChat.customerName} (${newChat.phone})`);
                }}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Start a new WhatsApp chat with any phone number"
              >
                <span>+ New</span>
              </button>
            </div>

            {/* Filter Pills + Clear Dummy button */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 flex-1">
                {[
                  { id: "all", label: "All" },
                  { id: "bot", label: "Bot" },
                  { id: "human", label: "Human" },
                  { id: "confirmed", label: "Confirmed" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterMode(f.id as any)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      filterMode === f.id
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {chats.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Erase all WhatsApp chat logs and start fresh?")) {
                      saveChats([]);
                      setSelectedChatId("");
                      showToast("✓ All WhatsApp chat logs erased.");
                    }
                  }}
                  className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 shrink-0 cursor-pointer"
                  title="Clear all chat history"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Chat List Scrollable Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No conversations match your filter.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === activeChat?.id;
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-emerald-50/70 border-l-4 border-emerald-600" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Devotee Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {chat.customerName.charAt(0)}
                      </div>
                      {/* Bot / Human Takeover mini badge */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold border border-white shadow-2xs ${
                        chat.humanTakeover ? "bg-amber-500" : "bg-purple-600"
                      }`} title={chat.humanTakeover ? "Human Takeover" : "AI Bot Active"}>
                        {chat.humanTakeover ? "H" : "B"}
                      </span>
                    </div>

                    {/* Chat Preview Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {chat.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {chat.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10.5px] text-gray-500 font-mono mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-gray-400" />
                        <span>{chat.phone}</span>
                      </div>

                      <p className="text-[11px] text-gray-600 truncate mt-1">
                        {lastMsg ? lastMsg.text : "New conversation started"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-sky-50 text-sky-700 border border-sky-200 truncate max-w-[140px]">
                          {chat.destination}
                        </span>
                        {chat.status === "confirmed" && (
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Confirmed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Active Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden h-full">
          
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No Active Chat Selected</h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Click <b>"+ New"</b> in the left panel to start a fresh WhatsApp conversation with any devotee, or select an existing chat.
              </p>
              <button
                type="button"
                onClick={() => {
                  const phoneInput = prompt("Enter 10-digit WhatsApp number (e.g. 9719038278):");
                  if (!phoneInput) return;
                  const nameInput = prompt("Enter Customer / Devotee Name:", "Valued Devotee") || "Valued Devotee";
                  const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
                  const newChat: WhatsAppChat = {
                    id: `chat-${Date.now()}`,
                    customerName: nameInput,
                    phone: cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91 ${cleanPhone}`,
                    destination: "Chardham Yatra 2026",
                    humanTakeover: true,
                    unreadCount: 0,
                    lastMessageTime: "Just now",
                    status: "inquiry",
                    messages: [
                      {
                        id: `msg-${Date.now()}`,
                        sender: "agent",
                        text: `Namaste ${nameInput} ji! Warm greetings from Travel to Uttarakhand. How may we assist your holy yatra today?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]
                  };
                  saveChats([newChat, ...chats]);
                  setSelectedChatId(newChat.id);
                  showToast(`✓ Started conversation with ${newChat.customerName}`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>+ Start New Chat</span>
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header with Human Takeover Switch */}
              <div className="px-5 py-3.5 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                    {activeChat.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">
                        {activeChat.customerName}
                      </h2>
                      <span className="text-[10px] font-mono text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded">
                        {activeChat.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600 mt-0.5">
                      <span className="text-sky-700 font-semibold">{activeChat.destination}</span>
                      {activeChat.travelDates && <span>• 📅 {activeChat.travelDates}</span>}
                    </div>
                  </div>
                </div>

                {/* Human Takeover Toggle Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleHumanTakeover(activeChat.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border ${
                      activeChat.humanTakeover
                        ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    }`}
                    title="Toggle between Automated AI Bot and Manual Human Takeover"
                  >
                    {activeChat.humanTakeover ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Human Takeover Active</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span>AI Bot Handling (Click to Take Over)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

          {/* Quick Pre-Actions Bar */}
          <div className="px-5 py-2 bg-slate-50 border-b border-gray-100 flex flex-wrap items-center gap-2 text-xs shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions:</span>
            
            <button
              type="button"
              onClick={handleSendBookingConfirmation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>1-Click Booking Confirmation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setReplyText(`🙏 Namaste ${activeChat.customerName} ji, gentle reminder regarding the token advance of ₹${((activeChat.totalAmount || 50000) - (activeChat.advancePaid || 15000)).toLocaleString("en-IN")} for your ${activeChat.destination}. Please find our account details below to confirm the helicopter / vehicle allocation.`);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold transition cursor-pointer"
            >
              <IndianRupee className="w-3 h-3 text-sky-600" />
              <span>Payment Reminder</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setReplyText(`✨ Char Dham Advisory: Please ensure you have completed the mandatory Biometric Registration. Bring along original Aadhaar cards, valid ID, and warm woolens as night temperatures in Kedarnath & Badrinath drop near freezing.`);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Yatra Guidelines Advisory</span>
            </button>
          </div>

          {/* Chat Messages Stream (Scrollable) */}
          <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#efeae2]/30 custom-scrollbar"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 0.75px, transparent 0.75px)",
              backgroundSize: "16px 16px"
            }}
          >
            {/* Spiritual Date separator */}
            <div className="text-center my-2">
              <span className="bg-white/90 border border-gray-200 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                🙏 ॐ नमः शिवाय · Official Travel to Uttarakhand WhatsApp
              </span>
            </div>

            {activeChat.messages.map((msg) => {
              const isCustomer = msg.sender === "customer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                      isCustomer
                        ? "bg-white text-gray-900 rounded-tl-xs border border-gray-200"
                        : msg.sender === "bot"
                        ? "bg-purple-50 text-purple-950 rounded-tr-xs border border-purple-200"
                        : "bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-emerald-300"
                    }`}
                  >
                    {/* Sender Identity Indicator */}
                    {!isCustomer && (
                      <div className="flex items-center gap-1 text-[10px] font-bold mb-1">
                        {msg.sender === "bot" ? (
                          <span className="text-purple-700 flex items-center gap-0.5">
                            <Bot className="w-3 h-3" /> AI Assistant
                          </span>
                        ) : (
                          <span className="text-emerald-800 flex items-center gap-0.5">
                            <UserCheck className="w-3 h-3" /> Human Operator (Amit Kumar)
                          </span>
                        )}
                      </div>
                    )}

                    <p>{msg.text}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-gray-400">
                      <span>{msg.timestamp}</span>
                      {!isCustomer && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-500 inline" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-3.5 border-t border-gray-200 bg-white space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={activeChat.humanTakeover 
                  ? "Type your message as Human Operator..." 
                  : "Type message or trigger automated templates..."}
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <div className="flex flex-col gap-1.5 shrink-0">
                {/* Send via API */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!replyText.trim() || isSending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Send via Meta Cloud WhatsApp API"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>

                {/* Direct WhatsApp Web button */}
                <button
                  type="button"
                  onClick={handleOpenWhatsAppWeb}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Open in WhatsApp Web"
                >
                  <span>WhatsApp Web</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-gray-400 px-1">
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line</span>
              <span className="text-emerald-700 font-semibold">
                ● Connected to +91 9719038278 (Travel to Uttarakhand)
              </span>
            </div>
          </div>

          </>
          )}
        </div>

      </div>
    </div>
  );
}
