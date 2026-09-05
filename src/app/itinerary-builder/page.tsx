"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Download, 
  Loader2, 
  Plus, 
  Trash2, 
  Map, 
  Sparkles, 
  X, 
  MessageCircle, 
  Share2, 
  Check, 
  RotateCcw,
  Eye,
  Calendar,
  User,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Phone,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Key,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface DayPlan {
  id: number;
  dayNumber: number;
  dateStr: string;
  route: string;
  activities: string[];
  overnightStay: string;
}

export interface PricingTier {
  package: string;
  price: string;
  hotelCategory: string;
  meals: string;
  specialFeature: string;
}

export interface ItineraryData {
  title: string;
  subTitle: string;
  spiritualHeadline: string;
  dhamsSubtitle: string;
  preparedFor: string;
  travelDates: string;
  duration: string;
  startingPoint: string;
  routeCovered: string;
  overviewSummary: string;
  
  // Glance section
  glanceDuration: string;
  glanceDhams: string;
  glanceSector: string;
  glanceStartEnd: string;
  glancePackages: string;

  // Day plans
  days: DayPlan[];

  // Pricing
  pricingSubtitle: string;
  pricingTiers: PricingTier[];
  pricingNote: string;

  // Inclusions & Exclusions
  inclusions: string[];
  exclusions: string[];

  // Policies & Contact
  goodToKnow: string[];
  bookingPayment: string[];
  contactAgency: string;
  contactPerson: string;
  contactPhone: string;
  motto: string;
}

// Exact preset matching "chardham yatra from mathura 2026 (1).pdf"
const CHARDHAM_PRESET: ItineraryData = {
  title: "CHARDHAM YATRA",
  subTitle: "UTTARAKHAND",
  spiritualHeadline: "12 Days · 11 Nights Spiritual Journey",
  dhamsSubtitle: "Yamunotri · Gangotri · Kedarnath (by Helicopter) · Badrinath",
  preparedFor: "Mr. Ghanshyam",
  travelDates: "10 – 21 September 2026",
  duration: "12 Days / 11 Nights",
  startingPoint: "Mathura, Uttar Pradesh",
  routeCovered: "Haridwar – Barkot – Yamunotri – Uttarkashi – Gangotri – Guptkashi/Phata – Kedarnath (Heli) – Badrinath – Joshimath – Rudraprayag – Devprayag – Rishikesh – Haridwar",
  overviewSummary: "A complete Chardham Yatra covering all four sacred shrines of Uttarakhand — Yamunotri, Gangotri, Kedarnath and Badrinath — starting and ending at Mathura. The Kedarnath leg is covered by helicopter for a comfortable, time-efficient darshan, with well-planned overnight halts along the route.",
  
  glanceDuration: "12 Days / 11 Nights",
  glanceDhams: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  glanceSector: "By Helicopter (Guptkashi / Phata ⇄ Kedarnath)",
  glanceStartEnd: "Mathura, Uttar Pradesh (both ways)",
  glancePackages: "Standard · Deluxe · Luxury",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "10 Sep 2026 (Thu)",
      route: "Mathura → Haridwar → Barkot",
      activities: [
        "Depart Mathura early morning towards Haridwar.",
        "Holy dip (snan) at Har Ki Pauri, Haridwar.",
        "Continue drive to Barkot via scenic foothill roads."
      ],
      overnightStay: "Barkot"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "11 Sep 2026 (Fri)",
      route: "Barkot → Yamunotri → Barkot",
      activities: [
        "Early morning departure for Yamunotri Dham.",
        "Darshan of Maa Yamuna at the Yamunotri temple (trek/pony/palki as per personal arrangement).",
        "Return to Barkot by evening for overnight stay."
      ],
      overnightStay: "Barkot"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "12 Sep 2026 (Sat)",
      route: "Barkot → Uttarkashi",
      activities: [
        "Post breakfast, drive to Uttarkashi.",
        "Evening free for local sightseeing / Vishwanath Temple visit."
      ],
      overnightStay: "Uttarkashi"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "13 Sep 2026 (Sun)",
      route: "Uttarkashi → Gangotri → Uttarkashi",
      activities: [
        "Early morning drive to Gangotri Dham.",
        "Darshan at the Gangotri temple, origin of the sacred river Ganga.",
        "Return to Uttarkashi for overnight stay."
      ],
      overnightStay: "Uttarkashi"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "14 Sep 2026 (Mon)",
      route: "Uttarkashi → Guptkashi / Phata",
      activities: [
        "Drive from Uttarkashi to Guptkashi / Phata, the base point for the Kedarnath helicopter sector.",
        "Evening at leisure; briefing for next day's heli darshan."
      ],
      overnightStay: "Guptkashi / Phata"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "15 Sep 2026 (Tue)",
      route: "Kedarnath Darshan by Helicopter",
      activities: [
        "Helicopter transfer from Guptkashi/Phata to Kedarnath.",
        "Darshan of Baba Kedarnath at the sacred Jyotirlinga temple.",
        "Same-day return by helicopter to Guptkashi/Phata (Kedarnath overnight stay optional, on request)."
      ],
      overnightStay: "Guptkashi / Phata"
    },
    {
      id: 7,
      dayNumber: 7,
      dateStr: "16 Sep 2026 (Wed)",
      route: "Guptkashi/Phata → Badrinath → Joshimath",
      activities: [
        "Drive to Badrinath Dham via Chopta and Rudraprayag.",
        "Darshan of Lord Badrinarayan at the Badrinath temple.",
        "Proceed to Joshimath for overnight stay."
      ],
      overnightStay: "Joshimath"
    },
    {
      id: 8,
      dayNumber: 8,
      dateStr: "17 Sep 2026 (Thu)",
      route: "Joshimath → Rudraprayag",
      activities: [
        "Drive down from Joshimath to Rudraprayag.",
        "Visit the sacred Rudraprayag Sangam, confluence of the Alaknanda and Mandakini rivers."
      ],
      overnightStay: "Rudraprayag"
    },
    {
      id: 9,
      dayNumber: 9,
      dateStr: "18 Sep 2026 (Fri)",
      route: "Rudraprayag → Devprayag",
      activities: [
        "Drive to Devprayag, the holy confluence of the Alaknanda and Bhagirathi rivers — the point from where the Ganga formally begins.",
        "Visit the Raghunath Temple and the sacred sangam ghat."
      ],
      overnightStay: "Devprayag"
    },
    {
      id: 10,
      dayNumber: 10,
      dateStr: "19 Sep 2026 (Sat)",
      route: "Devprayag → Rishikesh",
      activities: [
        "Drive to Rishikesh, the yoga capital on the banks of the Ganga.",
        "Visit Laxman Jhula, Ram Jhula and Triveni Ghat; attend the evening Ganga Aarti."
      ],
      overnightStay: "Rishikesh"
    },
    {
      id: 11,
      dayNumber: 11,
      dateStr: "20 Sep 2026 (Sun)",
      route: "Rishikesh → Haridwar",
      activities: [
        "Drive to Haridwar for a relaxed evening by the Ganga.",
        "Attend the evening Ganga Aarti at Har Ki Pauri."
      ],
      overnightStay: "Haridwar"
    },
    {
      id: 12,
      dayNumber: 12,
      dateStr: "21 Sep 2026 (Mon)",
      route: "Haridwar → Mathura",
      activities: [
        "Early morning departure from Haridwar, direct drive to Mathura.",
        "Trip concludes on arrival at Mathura."
      ],
      overnightStay: "Trip Ends at Mathura"
    }
  ],

  pricingSubtitle: "Choose the package that best fits your comfort and budget. All packages cover the same 12-day itinerary and include Kedarnath helicopter tickets.",
  pricingTiers: [
    { package: "Standard", price: "₹ 35,500", hotelCategory: "Budget Hotels", meals: "As per plan", specialFeature: "Included" },
    { package: "Deluxe", price: "₹ 45,500", hotelCategory: "Good Hotels", meals: "Included", specialFeature: "Included" },
    { package: "Luxury", price: "₹ 62,500", hotelCategory: "Luxury Hotels", meals: "Included", specialFeature: "Included" }
  ],
  pricingNote: "Note: 5% GST applicable extra on all packages, as per government norms. Rates are per person on twin/triple sharing basis.",

  inclusions: [
    "AC vehicle (Innova Crysta / Tempo Traveller as per group size) for the entire yatra",
    "Accommodation for 11 nights as per selected package category",
    "Meal plan as per package selected",
    "Kedarnath helicopter tickets, both ways (Guptkashi/Phata ⇄ Kedarnath)",
    "All toll tax, parking charges and driver allowance",
    "Assistance with Char Dham registration / biometric formalities",
    "Support team assistance throughout the yatra"
  ],
  exclusions: [
    "5% GST, extra as applicable",
    "Personal expenses — laundry, tips, phone calls, shopping",
    "Pony, palki, doli or porter charges at Yamunotri & other trek points",
    "Overnight stay at Kedarnath (optional, available on request at extra cost)",
    "Any meals not specified in the chosen package",
    "VIP / special darshan charges, if opted",
    "Travel insurance",
    "Costs arising from natural calamities, road blockages or heli cancellation due to weather",
    "Anything not specifically mentioned under Inclusions"
  ],

  goodToKnow: [
    "Char Dham Yatra registration is mandatory as per Uttarakhand Government / Devasthanam Board guidelines — our team will assist with the process.",
    "Kedarnath helicopter tickets are subject to weather conditions and availability. In case of cancellation, alternate arrangements (pony/palki/trek) or rescheduling will apply as per operator policy.",
    "A valid photo ID proof is mandatory for all travelers throughout the yatra.",
    "A basic medical fitness check is recommended before undertaking high-altitude travel.",
    "Warm clothing, rain gear and comfortable trekking shoes are strongly recommended.",
    "This itinerary is subject to minor changes due to weather, road conditions or local administration guidelines."
  ],
  bookingPayment: [
    "Booking is confirmed against advance payment; balance is payable before the start of the yatra.",
    "Exact payment schedule and cancellation policy will be shared by your travel consultant at the time of booking."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Tarun Kaushik",
  contactPhone: "+91 84452 14371",
  motto: "ॐ नमः शिवाय"
};

export default function ItineraryBuilder() {
  const [data, setData] = useState<ItineraryData>(CHARDHAM_PRESET);
  const [activeTab, setActiveTab] = useState<"overview" | "days" | "pricing" | "inclusions" | "contact">("overview");
  
  // Preview Controls
  const [activePreviewPage, setActivePreviewPage] = useState<number | "all">(1);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  
  // Download & Preview state
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Dynamically compute the exact fit-to-screen or fit-width scale factor
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const el = previewContainerRef.current;
      const padX = 36;
      const padY = 36;
      const availW = Math.max(300, el.clientWidth - padX);
      const availH = Math.max(300, el.clientHeight - padY);

      const scaleW = availW / 794;
      const scaleH = activePreviewPage !== "all" ? (availH / 1122) : scaleW;
      
      if (fitMode === "width") {
        setAutoScale(Math.max(0.4, Math.min(1.3, Number(scaleW.toFixed(3)))));
      } else {
        const fitScale = Math.min(scaleW, scaleH);
        setAutoScale(Math.max(0.35, Math.min(0.95, Number(fitScale.toFixed(3)))));
      }
    };

    updateScale();
    const timer = setTimeout(updateScale, 150);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && previewContainerRef.current) {
      ro = new ResizeObserver(() => updateScale());
      ro.observe(previewContainerRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
      if (ro) ro.disconnect();
    };
  }, [activePreviewPage, isFormCollapsed, fitMode]);

  const currentScale = manualZoom !== null ? manualZoom : autoScale;

  const handleZoomIn = () => {
    const next = Math.min(1.5, Number((currentScale + 0.1).toFixed(2)));
    setManualZoom(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(0.35, Number((currentScale - 0.1).toFixed(2)));
    setManualZoom(next);
  };

  const handleSetFitMode = (mode: "screen" | "width") => {
    setFitMode(mode);
    setManualZoom(null);
  };

  // Fetch API key from cache or Supabase settings
  useEffect(() => {
    // Immediate read from localStorage cache
    if (typeof window !== "undefined") {
      try {
        const cachedSettings = localStorage.getItem("triloki_settings_cache");
        if (cachedSettings) {
          const parsed = JSON.parse(cachedSettings);
          if (parsed.openai_key) setApiKey(parsed.openai_key);
        }
      } catch {}
    }

    async function fetchKey() {
      try {
        const { data: settings } = await supabase.from("settings").select("openai_key").limit(1).single();
        if (settings?.openai_key) {
          setApiKey(settings.openai_key);
        }
      } catch (err) {
        // silent fallback
      }
    }
    fetchKey();
  }, []);

  // Quick Prompt Chips
  const QUICK_PROMPTS = [
    "a trip to do dham (badrinath and kedarnath for 7D/6N)",
    "Chardham Yatra 12D/11N from Haridwar/Delhi with Kedarnath Heli",
    "Kashmir Paradise 6D/5N (Srinagar, Gulmarg, Pahalgam)",
    "Golden Triangle Delhi-Agra-Jaipur 5D/4N luxury tour",
    "Kerala Honeymoon 6D/5N (Munnar, Thekkady, Alleppey Houseboat)"
  ];

  // AI Generator handler
  const handleAIGenerate = async (promptToUse?: string) => {
    const prompt = promptToUse || aiPrompt;
    if (!prompt.trim()) return;

    if (!apiKey.trim()) {
      setShowKeyInput(true);
      setAiError("Please enter your Google Gemini API key below to generate itineraries.");
      return;
    }

    setIsGenerating(true);
    setAiError("");

    try {
      const systemPrompt = `You are an elite Indian travel planner creating luxury, highly professional travel brochures for "Travel to Uttarakhand" (similar to a premium Chardham Yatra brochure).
Return ONLY a valid, raw JSON object (strictly no markdown, no \`\`\`json wrappers) with this exact schema:
{
  "title": "Main Trip Title in CAPS e.g. DO DHAM YATRA",
  "subTitle": "Region/State in CAPS e.g. UTTARAKHAND",
  "spiritualHeadline": "e.g. 7 Days · 6 Nights Spiritual Journey",
  "dhamsSubtitle": "Key highlights e.g. Haridwar · Guptkashi · Kedarnath (Heli) · Badrinath",
  "preparedFor": "Honourable Guest",
  "travelDates": "e.g. May – October 2026",
  "duration": "e.g. 7 Days / 6 Nights",
  "startingPoint": "e.g. Haridwar / Dehradun",
  "routeCovered": "e.g. Haridwar – Guptkashi – Kedarnath – Joshimath – Badrinath – Rishikesh – Haridwar",
  "overviewSummary": "A compelling 2-3 sentence overview describing the holy pilgrimage/trip journey, key holy spots, and highlights.",
  "glanceDuration": "7 Days / 6 Nights",
  "glanceDhams": "Kedarnath · Badrinath",
  "glanceSector": "By Helicopter or Trek",
  "glanceStartEnd": "Haridwar, Uttarakhand",
  "glancePackages": "Standard · Deluxe · Luxury",
  "days": [
    {
      "dayNumber": 1,
      "dateStr": "Day 1",
      "route": "Haridwar → Guptkashi",
      "activities": [
        "Morning pickup and scenic foothills drive.",
        "Visit Devprayag and Rudraprayag sangam confluences.",
        "Evening arrival at Guptkashi and check-in."
      ],
      "overnightStay": "Guptkashi"
    }
  ],
  "pricingSubtitle": "Choose the package that best fits your comfort and budget. All packages cover the same itinerary.",
  "pricingTiers": [
    { "package": "Standard", "price": "₹ 24,500", "hotelCategory": "Budget Hotels", "meals": "Breakfast & Dinner", "specialFeature": "Included" },
    { "package": "Deluxe", "price": "₹ 34,500", "hotelCategory": "3-Star Deluxe", "meals": "All Meals Included", "specialFeature": "Included" },
    { "package": "Luxury", "price": "₹ 48,500", "hotelCategory": "Luxury Resorts", "meals": "All Meals Included", "specialFeature": "Priority Darshan" }
  ],
  "pricingNote": "Note: 5% GST applicable extra on all packages. Rates are per person on twin/triple sharing basis.",
  "inclusions": [
    "AC vehicle (Innova Crysta / Tempo Traveller) for entire tour",
    "Selected hotel accommodation with specified meal plan",
    "All toll taxes, parking fees and driver allowance",
    "24/7 on-ground assistance and registration support"
  ],
  "exclusions": [
    "5% GST as applicable",
    "Personal expenses (laundry, phone, tips)",
    "Pony, palki or VIP darshan charges",
    "Anything not mentioned in inclusions"
  ],
  "goodToKnow": [
    "Mandatory yatra registration will be facilitated by our team.",
    "Carry valid government-issued photo ID cards.",
    "High altitude warm clothing and comfortable footwear are recommended."
  ],
  "bookingPayment": [
    "Booking confirmed on receipt of advance deposit.",
    "Balance payment due prior to departure."
  ],
  "contactAgency": "Travel to Uttarakhand",
  "contactPerson": "Mr. Tarun Kaushik",
  "contactPhone": "+91 84452 14371",
  "motto": "ॐ नमः शिवाय"
}`;

      // Call Gemini API by discovering available models or trying supported model list
      const cleanKey = apiKey.trim();
      let response: Response | null = null;
      let lastErrorMessage = "";

      // 1. First, attempt to discover exact models supported by this specific user API key
      let candidateModels: string[] = [];
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
        if (listRes.ok) {
          const listJson = await listRes.json();
          if (Array.isArray(listJson?.models)) {
            candidateModels = listJson.models
              .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
              .map((m: any) => m.name.replace(/^models\//, ""))
              // Sort to prioritize flash and newer models
              .sort((a: string, b: string) => {
                const aScore = a.includes("flash") ? 2 : a.includes("pro") ? 1 : 0;
                const bScore = b.includes("flash") ? 2 : b.includes("pro") ? 1 : 0;
                return bScore - aScore;
              });
          }
        }
      } catch {}

      // Fallback model list if listing is restricted or empty
      const fallbackList = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-pro-exp-02-05",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest"
      ];

      const modelsToTry = Array.from(new Set([...candidateModels, ...fallbackList]));

      for (const model of modelsToTry) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: `Generate a complete itinerary package for: ${prompt}` }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
              }
            })
          });

          if (res.ok) {
            response = res;
            break;
          } else {
            const errData = await res.json().catch(() => null);
            lastErrorMessage = errData?.error?.message || `Status ${res.status}`;
          }
        } catch (e: any) {
          lastErrorMessage = e?.message || "Network request failed";
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastErrorMessage || "Gemini API request failed across available models.");
      }

      const resJson = await response.json();
      const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!textResponse) {
        throw new Error("No response generated from Gemini API.");
      }

      // Sanitize JSON text
      const cleanJson = textResponse.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleanJson);

      // Validate & merge with default fallback fields
      const newDays: DayPlan[] = (parsed.days || []).map((d: any, idx: number) => ({
        id: Date.now() + idx,
        dayNumber: d.dayNumber || idx + 1,
        dateStr: d.dateStr || `Day ${idx + 1}`,
        route: d.route || "Tour Route",
        activities: Array.isArray(d.activities) ? d.activities : [d.description || "Sightseeing and travel."],
        overnightStay: d.overnightStay || "Hotel"
      }));

      setData(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        subTitle: parsed.subTitle || prev.subTitle,
        spiritualHeadline: parsed.spiritualHeadline || prev.spiritualHeadline,
        dhamsSubtitle: parsed.dhamsSubtitle || prev.dhamsSubtitle,
        preparedFor: parsed.preparedFor || prev.preparedFor,
        travelDates: parsed.travelDates || prev.travelDates,
        duration: parsed.duration || prev.duration,
        startingPoint: parsed.startingPoint || prev.startingPoint,
        routeCovered: parsed.routeCovered || prev.routeCovered,
        overviewSummary: parsed.overviewSummary || prev.overviewSummary,
        glanceDuration: parsed.glanceDuration || parsed.duration || prev.glanceDuration,
        glanceDhams: parsed.glanceDhams || prev.glanceDhams,
        glanceSector: parsed.glanceSector || prev.glanceSector,
        glanceStartEnd: parsed.glanceStartEnd || prev.glanceStartEnd,
        glancePackages: parsed.glancePackages || prev.glancePackages,
        days: newDays.length > 0 ? newDays : prev.days,
        pricingSubtitle: parsed.pricingSubtitle || prev.pricingSubtitle,
        pricingTiers: Array.isArray(parsed.pricingTiers) && parsed.pricingTiers.length > 0 ? parsed.pricingTiers : prev.pricingTiers,
        pricingNote: parsed.pricingNote || prev.pricingNote,
        inclusions: Array.isArray(parsed.inclusions) && parsed.inclusions.length > 0 ? parsed.inclusions : prev.inclusions,
        exclusions: Array.isArray(parsed.exclusions) && parsed.exclusions.length > 0 ? parsed.exclusions : prev.exclusions,
        goodToKnow: Array.isArray(parsed.goodToKnow) && parsed.goodToKnow.length > 0 ? parsed.goodToKnow : prev.goodToKnow,
        bookingPayment: Array.isArray(parsed.bookingPayment) && parsed.bookingPayment.length > 0 ? parsed.bookingPayment : prev.bookingPayment
      }));

      setActiveTab("overview");
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setAiError(err.message || "Failed to generate itinerary. Please verify your API key and prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Day Operations
  const addDay = () => {
    const nextNum = data.days.length + 1;
    const newDay: DayPlan = {
      id: Date.now(),
      dayNumber: nextNum,
      dateStr: `Day ${nextNum}`,
      route: "New Location → Destination",
      activities: ["Arrival and check-in", "Local sightseeing and leisure"],
      overnightStay: "Destination"
    };
    setData({ ...data, days: [...data.days, newDay] });
  };

  const removeDay = (id: number) => {
    const updated = data.days.filter(d => d.id !== id).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setData({ ...data, days: updated });
  };

  const updateDayField = (id: number, field: keyof DayPlan, value: any) => {
    setData({
      ...data,
      days: data.days.map(d => d.id === id ? { ...d, [field]: value } : d)
    });
  };

  const addActivityBullet = (dayId: number) => {
    setData({
      ...data,
      days: data.days.map(d => {
        if (d.id === dayId) {
          return { ...d, activities: [...d.activities, "New activity / sightseeing spot"] };
        }
        return d;
      })
    });
  };

  const updateActivityBullet = (dayId: number, actIdx: number, val: string) => {
    setData({
      ...data,
      days: data.days.map(d => {
        if (d.id === dayId) {
          const acts = [...d.activities];
          acts[actIdx] = val;
          return { ...d, activities: acts };
        }
        return d;
      })
    });
  };

  const removeActivityBullet = (dayId: number, actIdx: number) => {
    setData({
      ...data,
      days: data.days.map(d => {
        if (d.id === dayId) {
          return { ...d, activities: d.activities.filter((_, i) => i !== actIdx) };
        }
        return d;
      })
    });
  };

  // Pricing Tiers operations
  const updateTier = (index: number, field: keyof PricingTier, val: string) => {
    const tiers = [...data.pricingTiers];
    tiers[index] = { ...tiers[index], [field]: val };
    setData({ ...data, pricingTiers: tiers });
  };

  const addTier = () => {
    setData({
      ...data,
      pricingTiers: [
        ...data.pricingTiers,
        { package: "Custom Tier", price: "₹ 50,000", hotelCategory: "Premium Hotels", meals: "All Meals", specialFeature: "Included" }
      ]
    });
  };

  const removeTier = (index: number) => {
    setData({
      ...data,
      pricingTiers: data.pricingTiers.filter((_, i) => i !== index)
    });
  };

  // Inclusions / Exclusions operations
  const updateInclusion = (index: number, val: string) => {
    const arr = [...data.inclusions];
    arr[index] = val;
    setData({ ...data, inclusions: arr });
  };
  const addInclusion = () => setData({ ...data, inclusions: [...data.inclusions, "New tour inclusion item"] });
  const removeInclusion = (index: number) => setData({ ...data, inclusions: data.inclusions.filter((_, i) => i !== index) });

  const updateExclusion = (index: number, val: string) => {
    const arr = [...data.exclusions];
    arr[index] = val;
    setData({ ...data, exclusions: arr });
  };
  const addExclusion = () => setData({ ...data, exclusions: [...data.exclusions, "New exclusion item"] });
  const removeExclusion = (index: number) => setData({ ...data, exclusions: data.exclusions.filter((_, i) => i !== index) });

  // PDF Multi-Page Generation (captures from print containers)
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);

      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pageIds = [
        "print-itinerary-page-1", 
        "print-itinerary-page-2", 
        "print-itinerary-page-3", 
        "print-itinerary-page-4"
      ];

      for (let i = 0; i < pageIds.length; i++) {
        const el = document.getElementById(pageIds[i]);
        if (!el) continue;

        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
      }

      const filename = `${data.title.replace(/[^a-zA-Z0-9]/g, "_")}_${data.preparedFor.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      pdf.save(filename);

      // Save to Supabase Cloud
      try {
        await supabase.from("itineraries").insert({
          title: data.title,
          total_cost: parseInt(data.pricingTiers[0]?.price.replace(/[^0-9]/g, "") || "0"),
          document_data: data
        });
      } catch (e) {
        console.warn("Could not save to supabase cloud:", e);
      }

    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert(`Could not generate PDF: ${err.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = `*${data.title}* - ${data.spiritualHeadline}
*Prepared For:* ${data.preparedFor}
*Dates:* ${data.travelDates} (${data.duration})
*Route:* ${data.routeCovered}

*Package Options:*
${data.pricingTiers.map(t => `• *${t.package}*: ${t.price} (${t.hotelCategory})`).join("\n")}

*Contact & Bookings:*
${data.contactAgency}
${data.contactPerson} (${data.contactPhone})
${data.motto}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // =========================================================
  // MODULAR PAGE RENDERERS (Identical across Preview & Print)
  // =========================================================
  
  const renderPage1 = (prefix: string) => (
    <div
      id={`${prefix}-itinerary-page-1`}
      className="w-[794px] min-h-[1122px] h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 p-12 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[530px] h-[530px] object-contain" />
      </div>

      {/* Header / Logo */}
      <div className="relative z-10 flex flex-col items-center text-center pt-2">
        <img src="/logo.png" alt="Travel to Uttarakhand" className="h-16 w-auto object-contain mb-2" />
        <p className="text-[11px] uppercase tracking-widest text-[#0369a1] font-bold">Travel to Uttarakhand</p>
        
        <h1 className="text-4xl font-serif font-black text-[#0369a1] tracking-tight mt-3 uppercase">
          {data.title}
        </h1>
        <p className="text-sm font-semibold tracking-widest text-[#dc2626] uppercase mt-1">
          {data.subTitle}
        </p>
        <p className="text-xs text-gray-600 font-medium italic mt-1">
          {data.spiritualHeadline}
        </p>
        <p className="text-[11px] text-gray-500 tracking-wide mt-1 font-sans">
          {data.dhamsSubtitle}
        </p>
      </div>

      {/* Summary Details Table */}
      <div className="relative z-10 my-4 border-t border-b border-gray-200 py-3 text-xs space-y-2">
        <div className="grid grid-cols-[130px_1fr] items-start">
          <span className="font-bold text-gray-700">Prepared For</span>
          <span className="font-semibold text-gray-900">{data.preparedFor}</span>
        </div>
        <div className="grid grid-cols-[130px_1fr] items-start">
          <span className="font-bold text-gray-700">Travel Dates</span>
          <span className="font-medium text-gray-800">{data.travelDates}</span>
        </div>
        <div className="grid grid-cols-[130px_1fr] items-start">
          <span className="font-bold text-gray-700">Duration</span>
          <span className="font-medium text-gray-800">{data.duration}</span>
        </div>
        <div className="grid grid-cols-[130px_1fr] items-start">
          <span className="font-bold text-gray-700">Starting Point</span>
          <span className="font-medium text-gray-800">{data.startingPoint}</span>
        </div>
        <div className="grid grid-cols-[130px_1fr] items-start">
          <span className="font-bold text-gray-700">Route Covered</span>
          <span className="text-[11px] text-gray-700 leading-relaxed">{data.routeCovered}</span>
        </div>
      </div>

      {/* Your Journey At A Glance Box */}
      <div className="relative z-10 space-y-3">
        <h3 className="text-lg font-serif font-bold text-[#0369a1] border-b border-[#0369a1]/30 pb-1">
          Your Journey At A Glance
        </h3>
        <p className="text-xs text-gray-700 leading-relaxed text-justify">
          {data.overviewSummary}
        </p>

        <table className="w-full text-left text-xs border border-gray-200 mt-3">
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-gray-50/70">
              <td className="px-3 py-2 font-bold text-gray-700 w-1/3">Duration</td>
              <td className="px-3 py-2 text-gray-900">{data.glanceDuration}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold text-gray-700">Dhams Covered</td>
              <td className="px-3 py-2 text-gray-900">{data.glanceDhams}</td>
            </tr>
            <tr className="bg-gray-50/70">
              <td className="px-3 py-2 font-bold text-gray-700">Kedarnath Sector</td>
              <td className="px-3 py-2 text-gray-900">{data.glanceSector}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold text-gray-700">Start / End Point</td>
              <td className="px-3 py-2 text-gray-900">{data.glanceStartEnd}</td>
            </tr>
            <tr className="bg-gray-50/70">
              <td className="px-3 py-2 font-bold text-gray-700">Packages Available</td>
              <td className="px-3 py-2 font-bold text-[#0369a1]">{data.glancePackages}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page 1 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-3 flex justify-between items-center text-[10px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <span>Page 1 of 4</span>
      </div>
    </div>
  );

  const renderPage2 = (prefix: string) => (
    <div
      id={`${prefix}-itinerary-page-2`}
      className="w-[794px] min-h-[1122px] h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 p-12 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[530px] h-[530px] object-contain" />
      </div>

      <div className="relative z-10 space-y-3">
        <h2 className="text-xl font-serif font-bold text-[#0369a1] border-b border-[#0369a1] pb-1 mb-3">
          Detailed Day-Wise Itinerary
        </h2>

        <div className="space-y-2.5">
          {data.days.slice(0, 8).map(day => (
            <div key={day.id} className="text-xs space-y-1">
              <div className="bg-[#0369a1] text-white px-2.5 py-1 rounded text-[11px] font-bold tracking-wide flex items-center gap-2">
                <span>DAY {day.dayNumber}</span>
                <span className="opacity-75">·</span>
                <span>{day.dateStr}</span>
                <span className="opacity-75">·</span>
                <span>{day.route}</span>
              </div>

              <ul className="pl-3 space-y-0.5 text-gray-800 text-[11px]">
                {day.activities.map((act, aIdx) => (
                  <li key={aIdx} className="leading-tight">
                    – {act}
                  </li>
                ))}
              </ul>

              <p className="pl-3 text-[11px] text-amber-900 italic font-semibold">
                Overnight Stay: {day.overnightStay}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Page 2 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-3 flex justify-between items-center text-[10px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <span>Page 2 of 4</span>
      </div>
    </div>
  );

  const renderPage3 = (prefix: string) => (
    <div
      id={`${prefix}-itinerary-page-3`}
      className="w-[794px] min-h-[1122px] h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 p-12 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[530px] h-[530px] object-contain" />
      </div>

      <div className="relative z-10 space-y-5">
        
        {/* Remaining Days (Days 9+) */}
        <div className="space-y-2.5">
          {data.days.slice(8).map(day => (
            <div key={day.id} className="text-xs space-y-1">
              <div className="bg-[#0369a1] text-white px-2.5 py-1 rounded text-[11px] font-bold tracking-wide flex items-center gap-2">
                <span>DAY {day.dayNumber}</span>
                <span className="opacity-75">·</span>
                <span>{day.dateStr}</span>
                <span className="opacity-75">·</span>
                <span>{day.route}</span>
              </div>

              <ul className="pl-3 space-y-0.5 text-gray-800 text-[11px]">
                {day.activities.map((act, aIdx) => (
                  <li key={aIdx} className="leading-tight">
                    – {act}
                  </li>
                ))}
              </ul>

              <p className="pl-3 text-[11px] text-amber-900 italic font-semibold">
                Overnight Stay: {day.overnightStay}
              </p>
            </div>
          ))}
        </div>

        {/* Package Options & Pricing Table */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-lg font-serif font-bold text-[#0369a1]">
            Package Options & Pricing
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {data.pricingSubtitle}
          </p>

          <table className="w-full text-xs border border-gray-200 text-center mt-2">
            <thead className="bg-[#0369a1] text-white font-bold text-[11px]">
              <tr>
                <th className="px-3 py-2 text-left">Package</th>
                <th className="px-3 py-2">Price / Person</th>
                <th className="px-3 py-2">Hotel Category</th>
                <th className="px-3 py-2">Meals</th>
                <th className="px-3 py-2">Special / Heli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.pricingTiers.map((tier, tIdx) => (
                <tr key={tIdx} className={tIdx % 2 === 0 ? "bg-white" : "bg-gray-50/70"}>
                  <td className="px-3 py-2 font-bold text-gray-900 text-left">{tier.package}</td>
                  <td className="px-3 py-2 font-bold text-[#0369a1]">{tier.price}</td>
                  <td className="px-3 py-2 text-gray-700">{tier.hotelCategory}</td>
                  <td className="px-3 py-2 text-gray-700">{tier.meals}</td>
                  <td className="px-3 py-2 text-gray-700">{tier.specialFeature}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[11px] text-gray-500 italic mt-2">
            {data.pricingNote}
          </p>
        </div>

      </div>

      {/* Page 3 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-3 flex justify-between items-center text-[10px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <span>Page 3 of 4</span>
      </div>
    </div>
  );

  const renderPage4 = (prefix: string) => (
    <div
      id={`${prefix}-itinerary-page-4`}
      className="w-[794px] min-h-[1122px] h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 p-12 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[530px] h-[530px] object-contain" />
      </div>

      <div className="relative z-10 space-y-4">
        
        <h2 className="text-xl font-serif font-bold text-[#0369a1] border-b border-[#0369a1] pb-1">
          Inclusions & Exclusions
        </h2>

        {/* Inclusions & Exclusions 2-Column Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          
          {/* Inclusions Column */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0369a1] text-sm mb-1">Inclusions</h4>
            <ul className="space-y-1 text-gray-800 text-[11px]">
              {data.inclusions.map((inc, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions Column */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-[#0369a1] text-sm mb-1">Exclusions</h4>
            <ul className="space-y-1 text-gray-800 text-[11px]">
              {data.exclusions.map((exc, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span>{exc}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Good To Know Section */}
        <div className="space-y-1.5 pt-2 border-t border-gray-200">
          <h3 className="text-sm font-serif font-bold text-[#0369a1]">Good To Know</h3>
          <ul className="space-y-1 text-gray-700 text-[10.5px]">
            {data.goodToKnow.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-gray-400 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Booking & Payment Section */}
        <div className="space-y-1.5 pt-2 border-t border-gray-200">
          <h3 className="text-sm font-serif font-bold text-[#0369a1]">Booking & Payment</h3>
          <ul className="space-y-1 text-gray-700 text-[10.5px]">
            {data.bookingPayment.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-gray-400 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* For Bookings & Queries Center Box */}
        <div className="flex flex-col items-center justify-center text-center pt-2">
          <img src="/logo.png" alt="logo" className="h-12 w-auto object-contain mb-1" />
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">For Bookings & Queries</p>
          <h4 className="text-base font-serif font-bold text-[#0369a1]">{data.contactAgency}</h4>
          <p className="text-xs text-gray-800 font-semibold">{data.contactPerson}</p>
          <p className="text-xs text-gray-900 font-bold tracking-wider">{data.contactPhone}</p>
          <p className="text-xs text-[#0369a1] font-serif font-bold mt-1 tracking-widest">{data.motto}</p>
        </div>

      </div>

      {/* Page 4 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-3 flex justify-between items-center text-[10px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <span>Page 4 of 4</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full h-[calc(100vh-5rem)]">
      
      {/* LEFT COLUMN: Controls, AI Generator, and Editing Tabs (Can be collapsed for full preview) */}
      {!isFormCollapsed && (
        <div className="w-full lg:w-[38%] bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-y-auto shrink-0 h-full space-y-5 transition-all duration-300 custom-scrollbar">
          
          {/* Header with Title & Reset Button */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Brochure & Itinerary Studio</h1>
                <p className="text-xs text-gray-500">Chardham Luxury Edition • 100% Editable</p>
              </div>
            </div>
            <button
              onClick={() => setData(CHARDHAM_PRESET)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
              title="Reload authentic 12-day Chardham Yatra preset from PDF"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* AI GENERATOR CARD */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-cyan-50/30 p-4 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Itinerary Generator (Gemini)
              </span>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3 h-3" />
                {showKeyInput ? "Hide Key" : "API Key"}
              </button>
            </div>

            {/* Key input dropdown if missing or opened */}
            {showKeyInput && (
              <div className="bg-white p-2.5 rounded-xl border border-purple-200 text-xs space-y-1.5">
                <label className="block text-[10px] font-semibold text-gray-600">Google Gemini API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
                <p className="text-[10px] text-gray-400">Key is cached and stored in your Settings.</p>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="e.g. a trip to do dham (badrinath and kedarnath for 7D/6N)"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(qp);
                      handleAIGenerate(qp);
                    }}
                    disabled={isGenerating}
                    className="text-[10px] bg-white/80 hover:bg-white text-purple-900 px-2 py-1 rounded-md border border-purple-200 transition cursor-pointer hover:border-purple-400 disabled:opacity-50"
                  >
                    {qp.length > 32 ? qp.slice(0, 32) + "..." : qp}
                  </button>
                ))}
              </div>

              {/* Generate Action Button */}
              <button
                onClick={() => handleAIGenerate()}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Full Plan with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary with AI
                  </>
                )}
              </button>

              {aiError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto pb-1 text-xs font-semibold text-gray-500">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "overview" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              1. Trip Info
            </button>
            <button
              onClick={() => setActiveTab("days")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "days" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              2. Days ({data.days.length})
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "pricing" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              3. Pricing ({data.pricingTiers.length})
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "inclusions" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              4. Inclusions
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "contact" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              5. Policies
            </button>
          </div>

          {/* TAB 1: OVERVIEW & GLANCE */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Main Title</label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={e => setData({ ...data, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State / Destination</label>
                  <input
                    type="text"
                    value={data.subTitle}
                    onChange={e => setData({ ...data, subTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration Tagline</label>
                  <input
                    type="text"
                    value={data.spiritualHeadline}
                    onChange={e => setData({ ...data, spiritualHeadline: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Highlights</label>
                  <input
                    type="text"
                    value={data.dhamsSubtitle}
                    onChange={e => setData({ ...data, dhamsSubtitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 space-y-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client & Journey Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Prepared For</label>
                    <input
                      type="text"
                      value={data.preparedFor}
                      onChange={e => setData({ ...data, preparedFor: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Travel Dates</label>
                    <input
                      type="text"
                      value={data.travelDates}
                      onChange={e => setData({ ...data, travelDates: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={data.duration}
                      onChange={e => setData({ ...data, duration: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Starting Point</label>
                    <input
                      type="text"
                      value={data.startingPoint}
                      onChange={e => setData({ ...data, startingPoint: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-600 mb-0.5">Full Route Covered</label>
                  <textarea
                    rows={2}
                    value={data.routeCovered}
                    onChange={e => setData({ ...data, routeCovered: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Your Journey At A Glance Summary</label>
                <textarea
                  rows={3}
                  value={data.overviewSummary}
                  onChange={e => setData({ ...data, overviewSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="bg-sky-50/40 p-3 rounded-xl border border-sky-200/80 space-y-2">
                <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">Quick Info (Glance Table)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Dhams Covered</label>
                    <input
                      type="text"
                      value={data.glanceDhams}
                      onChange={e => setData({ ...data, glanceDhams: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-sky-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Sector / Mode</label>
                    <input
                      type="text"
                      value={data.glanceSector}
                      onChange={e => setData({ ...data, glanceSector: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-sky-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAYS */}
          {activeTab === "days" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Day-Wise Detailed Plans ({data.days.length} Days)</span>
                <button
                  onClick={addDay}
                  className="flex items-center gap-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Day
                </button>
              </div>

              <div className="space-y-3">
                {data.days.map((day, dIdx) => (
                  <div key={day.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 bg-[#0369a1] text-white px-2 py-0.5 rounded text-[11px]">
                        DAY {day.dayNumber}
                      </span>
                      <button
                        onClick={() => removeDay(day.id)}
                        className="text-gray-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Date & Day String</label>
                        <input
                          type="text"
                          value={day.dateStr}
                          onChange={e => updateDayField(day.id, "dateStr", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Route (A → B → C)</label>
                        <input
                          type="text"
                          value={day.route}
                          onChange={e => updateDayField(day.id, "route", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-medium text-gray-500">Activities & Itinerary Details</label>
                        <button
                          onClick={() => addActivityBullet(day.id)}
                          className="text-[10px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {day.activities.map((act, actIdx) => (
                          <div key={actIdx} className="flex items-center gap-1.5">
                            <span className="text-gray-400">–</span>
                            <input
                              type="text"
                              value={act}
                              onChange={e => updateActivityBullet(day.id, actIdx, e.target.value)}
                              className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                            />
                            <button
                              onClick={() => removeActivityBullet(day.id, actIdx)}
                              className="text-gray-300 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-amber-800 mb-0.5">Overnight Stay Location</label>
                      <input
                        type="text"
                        value={day.overnightStay}
                        onChange={e => updateDayField(day.id, "overnightStay", e.target.value)}
                        className="w-full px-2 py-1 bg-amber-50/60 border border-amber-200 rounded text-xs font-semibold text-amber-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING TIERS */}
          {activeTab === "pricing" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Package Options & Multi-Tier Pricing</span>
                <button
                  onClick={addTier}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tier
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Pricing Section Subtitle</label>
                <textarea
                  rows={2}
                  value={data.pricingSubtitle}
                  onChange={e => setData({ ...data, pricingSubtitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-3">
                {data.pricingTiers.map((tier, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{tier.package}</span>
                      <button
                        onClick={() => removeTier(idx)}
                        className="text-gray-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500">Tier Name</label>
                        <input
                          type="text"
                          value={tier.package}
                          onChange={e => updateTier(idx, "package", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Price / Person</label>
                        <input
                          type="text"
                          value={tier.price}
                          onChange={e => updateTier(idx, "price", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-emerald-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500">Hotel Category</label>
                        <input
                          type="text"
                          value={tier.hotelCategory}
                          onChange={e => updateTier(idx, "hotelCategory", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Meals</label>
                        <input
                          type="text"
                          value={tier.meals}
                          onChange={e => updateTier(idx, "meals", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Special / Heli</label>
                        <input
                          type="text"
                          value={tier.specialFeature}
                          onChange={e => updateTier(idx, "specialFeature", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Pricing Footnote (GST & Terms)</label>
                <textarea
                  rows={2}
                  value={data.pricingNote}
                  onChange={e => setData({ ...data, pricingNote: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs italic"
                />
              </div>
            </div>
          )}

          {/* TAB 4: INCLUSIONS & EXCLUSIONS */}
          {activeTab === "inclusions" && (
            <div className="space-y-5 text-xs">
              {/* Inclusions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Inclusions (✓)
                  </span>
                  <button
                    onClick={addInclusion}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    + Add Inclusion
                  </button>
                </div>
                <div className="space-y-1.5">
                  {data.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <input
                        type="text"
                        value={inc}
                        onChange={e => updateInclusion(i, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <button onClick={() => removeInclusion(i)} className="text-gray-300 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 flex items-center gap-1.5">
                    <X className="w-4 h-4" />
                    Exclusions (✕)
                  </span>
                  <button
                    onClick={addExclusion}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    + Add Exclusion
                  </button>
                </div>
                <div className="space-y-1.5">
                  {data.exclusions.map((exc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <input
                        type="text"
                        value={exc}
                        onChange={e => updateExclusion(i, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <button onClick={() => removeExclusion(i)} className="text-gray-300 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POLICIES & AGENCY */}
          {activeTab === "contact" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-gray-700 block">Good To Know Points</span>
                {data.goodToKnow.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const updated = [...data.goodToKnow];
                        updated[idx] = e.target.value;
                        setData({ ...data, goodToKnow: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setData({ ...data, goodToKnow: data.goodToKnow.filter((_, i) => i !== idx) })}
                      className="text-gray-300 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setData({ ...data, goodToKnow: [...data.goodToKnow, "New travel note"] })}
                  className="text-xs text-sky-600 font-semibold cursor-pointer"
                >
                  + Add Note
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-700 block">Booking & Payment Policy</span>
                {data.bookingPayment.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const updated = [...data.bookingPayment];
                        updated[idx] = e.target.value;
                        setData({ ...data, bookingPayment: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setData({ ...data, bookingPayment: data.bookingPayment.filter((_, i) => i !== idx) })}
                      className="text-gray-300 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setData({ ...data, bookingPayment: [...data.bookingPayment, "New payment term"] })}
                  className="text-xs text-sky-600 font-semibold cursor-pointer"
                >
                  + Add Policy
                </button>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-3 pt-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Agency & Consultant Contact</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Agency Name</label>
                    <input
                      type="text"
                      value={data.contactAgency}
                      onChange={e => setData({ ...data, contactAgency: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Consultant Name</label>
                    <input
                      type="text"
                      value={data.contactPerson}
                      onChange={e => setData({ ...data, contactPerson: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Phone Number</label>
                    <input
                      type="text"
                      value={data.contactPhone}
                      onChange={e => setData({ ...data, contactPhone: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Blessing Tagline</label>
                    <input
                      type="text"
                      value={data.motto}
                      onChange={e => setData({ ...data, motto: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-sky-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RIGHT COLUMN: Live Multi-Page Luxury Brochure Preview (Auto-Fitted & Perfectly Proportioned) */}
      <div className={`flex flex-col gap-3 transition-all duration-300 h-full ${isFormCollapsed ? "w-full" : "w-full lg:w-[62%]"}`}>
        
        {/* Sleek Top Toolbar (No awkward wrapping) */}
        <div className="bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Page Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition cursor-pointer"
              title={isFormCollapsed ? "Show Edit Form" : "Expand Full Preview"}
            >
              {isFormCollapsed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Previous Page */}
            <button
              onClick={() => {
                if (typeof activePreviewPage === "number" && activePreviewPage > 1) {
                  setActivePreviewPage(activePreviewPage - 1);
                }
              }}
              disabled={activePreviewPage === 1 || activePreviewPage === "all"}
              className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 rounded-lg transition cursor-pointer border border-gray-200"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Quick Page Jump Buttons */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-bold text-gray-600">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePreviewPage(p)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    activePreviewPage === p ? "bg-[#0369a1] text-white shadow-xs" : "hover:text-gray-900"
                  }`}
                >
                  Page {p}
                </button>
              ))}
              <button
                onClick={() => setActivePreviewPage("all")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activePreviewPage === "all" ? "bg-[#0369a1] text-white shadow-xs" : "hover:text-gray-900"
                }`}
              >
                All Pages
              </button>
            </div>

            {/* Next Page */}
            <button
              onClick={() => {
                if (typeof activePreviewPage === "number" && activePreviewPage < 4) {
                  setActivePreviewPage(activePreviewPage + 1);
                }
              }}
              disabled={activePreviewPage === 4 || activePreviewPage === "all"}
              className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 rounded-lg transition cursor-pointer border border-gray-200"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-gray-700 text-[11px] min-w-[42px] text-center">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Fit Mode Buttons */}
            <button
              onClick={() => handleSetFitMode("width")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                fitMode === "width" && manualZoom === null
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Zoom to Fit Width (Enlarged & Easy to Read)"
            >
              Fit Width
            </button>

            <button
              onClick={() => handleSetFitMode("screen")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                fitMode === "screen" && manualZoom === null
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Fit Full Page on Screen"
            >
              Fit Page
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Share itinerary on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Scrollable & Auto-Fit Preview Viewport (No horizontal overflows, fits completely on screen) */}
        <div 
          ref={previewContainerRef}
          className="w-full flex-1 overflow-auto bg-slate-200/90 p-4 rounded-2xl flex flex-col items-center justify-start custom-scrollbar relative"
        >
          {/* Scaled Page Container (dynamically auto-fitted to available container dimensions) */}
          <div
            style={{
              width: `${Math.round(794 * currentScale)}px`,
              minHeight: activePreviewPage === "all" 
                ? `${Math.round((1122 * 4 + 72) * currentScale)}px` 
                : `${Math.round(1122 * currentScale)}px`,
              transition: "width 0.15s ease-out, min-height 0.15s ease-out"
            }}
            className="relative shrink-0 flex flex-col items-center shadow-lg"
          >
            <div
              style={{
                transform: `scale(${currentScale})`,
                transformOrigin: "top left",
                width: "794px",
                position: "absolute",
                top: 0,
                left: 0,
                transition: "transform 0.15s ease-out"
              }}
              className="space-y-6"
            >
              {(activePreviewPage === 1 || activePreviewPage === "all") && renderPage1("view")}
              {(activePreviewPage === 2 || activePreviewPage === "all") && renderPage2("view")}
              {(activePreviewPage === 3 || activePreviewPage === "all") && renderPage3("view")}
              {(activePreviewPage === 4 || activePreviewPage === "all") && renderPage4("view")}
            </div>
          </div>

        </div>

      </div>

      {/* Hidden Printable Container for Razor-Sharp Unscaled PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderPage1("print")}
        {renderPage2("print")}
        {renderPage3("print")}
        {renderPage4("print")}
      </div>

    </div>
  );
}
