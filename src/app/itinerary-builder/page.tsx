"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
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
  Minimize2,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Wand2,
  Tag,
  Filter,
  RefreshCw,
  Car
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";
import { 
  getStoredDhamGallery, 
  saveStoredDhamGallery, 
  pickDhamPhotosForItinerary, 
  DhamGalleryPhoto, 
  DHAM_CATEGORIES 
} from "@/lib/dhamGallery";

export interface ItineraryPhoto {
  id: string;
  url: string;
  caption: string;
  position?: "center" | "top" | "bottom";
  fit?: "cover" | "contain";
}

export interface HotelPhoto {
  id: string;
  url: string;
  hotelName: string;
  location: string;
  roomType?: string;
  caption?: string;
  fit?: "cover" | "contain";
  position?: "center" | "top" | "bottom";
}

export interface DayPlan {
  id: number;
  dayNumber: number;
  dateStr: string;
  route: string;
  activities: string[];
  overnightStay: string;
  photoUrl?: string;
  photoCaption?: string;
  photoUrl2?: string;
  photoCaption2?: string;
}

export interface PricingTier {
  package: string;
  price: string;
  totalPackagePrice?: string;
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

  // Visual Photos & Gallery
  photos?: ItineraryPhoto[];
  showPhotosPage1?: boolean;
  showPhotosPage3?: boolean;
  hotelPhotos?: HotelPhoto[];
  showHotelPhotos?: boolean;

  // Trust & Credentials (Owner Photo, Certificates, Office Image)
  trustPhotos?: {
    ownerPhoto?: string;
    ownerName?: string;
    ownerTitle?: string;
    certificatePhoto?: string;
    certificateCaption?: string;
    certificate2Photo?: string;
    certificate2Caption?: string;
    officePhoto?: string;
    officeCaption?: string;
  };
  showTrustSection?: boolean;
}

export const DEFAULT_TRUST_PHOTOS = {
  ownerPhoto: "/certificates/owner.jpeg",
  ownerName: "Amit Chandra",
  ownerTitle: "Founder & Managing Director",
  certificatePhoto: "/certificates/uttrakhand_tourism.jpeg",
  certificateCaption: "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2024/007176",
  certificate2Photo: "/certificates/certificate.jpeg",
  certificate2Caption: "Dehradun Transport Authority License: 44/RT/2025",
  officePhoto: "/certificates/office_front.jpeg",
  officeCaption: "Shop 38, Pursharthi Market, Haridwar"
};

export const CURATED_HOTEL_PHOTO_PRESETS: HotelPhoto[] = [
  {
    id: "hp-1",
    url: "/hotels_custom/hotel_stay_2.jpeg",
    hotelName: "Standard Clean Stay",
    location: "Barkot / Uttarkashi",
    roomType: "Standard Triple / Quad Room",
    caption: "Spacious clean rooms with comfortable beds, attached washroom & 24/7 hot water"
  },
  {
    id: "hp-2",
    url: "/hotels_custom/hotel_stay_4.jpeg",
    hotelName: "Standard Mountain View Stay",
    location: "Guptkashi / Sitapur",
    roomType: "Standard Double Room",
    caption: "Cozy rooms with valley views, fresh clean linen, geyser & peaceful mountain ambiance"
  },
  {
    id: "hp-3",
    url: "/hotels_custom/hotel_stay_3.jpeg",
    hotelName: "Standard Family Stay",
    location: "Badrinath / Pipalkoti",
    roomType: "Standard Family Room",
    caption: "Hygienic verified family rooms with warm blankets and personalized hill hospitality"
  },
  {
    id: "hp-4",
    url: "/gallery/kedarnath_alpine_tent.jpg",
    hotelName: "Kedarnath Base Camp / Alpine Stay",
    location: "Kedarnath Dham",
    roomType: "Tent Only (Without Food)",
    caption: "High-altitude mountain alpine camp / Swiss tents with warm bedding near shrine"
  }
];

export const WINTER_HOTEL_PHOTO_PRESETS: HotelPhoto[] = [
  {
    id: "whp-1",
    url: "/gallery/winter_stay_resort.jpeg",
    hotelName: "Himalayan Alpine Resort & Heated Stay",
    location: "Joshimath / Chopta",
    roomType: "Premium Alpine Heated Room",
    caption: "Heated mountain rooms with uninterrupted snow peaks view, 24/7 hot water & cozy alpine ambiance"
  },
  {
    id: "whp-2",
    url: "/gallery/winter_stay_room1.jpeg",
    hotelName: "Deluxe Mountain View Winter Retreat",
    location: "Joshimath / Ukhimath",
    roomType: "Deluxe Mountain View Room",
    caption: "Spacious wooden styled rooms with heavy winter quilts, geyser facility and panoramic valley vistas"
  },
  {
    id: "whp-3",
    url: "/gallery/winter_stay_room2.jpeg",
    hotelName: "Boutique Snow Comfort Hotel",
    location: "Mussoorie / Rishikesh",
    roomType: "Cozy Family Suite",
    caption: "Modern comfort stay with warm hospitality, in-house dining, bonfire arrangements and mountain tranquility"
  },
  {
    id: "whp-4",
    url: "/gallery/joshimath_stay.jpeg",
    hotelName: "Joshimath Verified Comfort Stay",
    location: "Joshimath / Rudraprayag",
    roomType: "Standard Heated Room",
    caption: "Conveniently located pre-inspected hotel with power backup and easy proximity to Auli cable car station"
  }
];

// Exact preset matching standard 10 Days / 09 Nights Chardham Yatra (Haridwar / Dehradun)
const CHARDHAM_PRESET: ItineraryData = {
  title: "CHARDHAM YATRA",
  subTitle: "UTTARAKHAND",
  spiritualHeadline: "10 Days · 09 Nights Spiritual Journey",
  dhamsSubtitle: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  preparedFor: "Valued Guest",
  travelDates: "10 – 19 May 2026",
  duration: "10 Days / 09 Nights",
  startingPoint: "Haridwar / Dehradun, Uttarakhand",
  routeCovered: "Haridwar – Barkot – Yamunotri – Uttarkashi – Gangotri – Guptkashi – Kedarnath – Badrinath – Rudraprayag – Rishikesh – Haridwar",
  overviewSummary: "A sacred 10 Days / 09 Nights Chardham Yatra covering all four holiest shrines of Uttarakhand — Yamunotri, Gangotri, Kedarnath and Badrinath — starting and concluding at Haridwar / Dehradun. Designed with well-paced travel, comfortable overnight stays, and complete ground support for a peaceful pilgrimage.",
  
  glanceDuration: "10 Days / 09 Nights",
  glanceDhams: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  glanceSector: "Haridwar ⇄ Complete Chardham Circuit",
  glanceStartEnd: "Haridwar / Dehradun (both ways)",
  glancePackages: "Standard Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 1 (10 May)",
      route: "Haridwar / Dehradun → Barkot",
      activities: [
        "Morning pickup from Haridwar Railway Station / Dehradun Airport.",
        "Scenic drive through the foothills of the Garhwal Himalayas via Mussoorie / Kempty Falls.",
        "Arrive at Barkot in the evening; check in to hotel, relax and prepare for Yamunotri trek."
      ],
      overnightStay: "Barkot"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 2 (11 May)",
      route: "Barkot → Yamunotri Dham Darshan → Barkot",
      activities: [
        "Early morning drive to Janki Chatti, the base point for the Yamunotri trek.",
        "Trek 6 km to Yamunotri Dham (trek / pony / palki as per individual preference).",
        "Holy dip in Surya Kund, cook rice prasad in Divya Shila, and have sacred Darshan of Maa Yamuna.",
        "Trek back to Janki Chatti and drive back to Barkot for overnight stay."
      ],
      overnightStay: "Barkot"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 3 (12 May)",
      route: "Barkot → Uttarkashi",
      activities: [
        "Post breakfast, drive towards Uttarkashi along the scenic Bhagirathi river valley.",
        "En route, pass through the historical Dharasu bend.",
        "On arrival in Uttarkashi, visit the ancient Kashi Vishwanath Temple and Shakti Temple.",
        "Evening at leisure by the Bhagirathi river."
      ],
      overnightStay: "Uttarkashi"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Day 4 (13 May)",
      route: "Uttarkashi → Gangotri Dham Darshan → Uttarkashi",
      activities: [
        "Early morning departure for Gangotri Dham through the picturesque Harsil Valley.",
        "Take a holy dip in the Bhagirathi River at Gangotri.",
        "Perform Pooja and seek divine blessings of Maa Ganga at the Gangotri Temple.",
        "Return drive through apple orchards of Harsil to Uttarkashi for night stay."
      ],
      overnightStay: "Uttarkashi"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "Day 5 (14 May)",
      route: "Uttarkashi → Guptkashi / Sitapur",
      activities: [
        "After breakfast, drive to Guptkashi / Sitapur via Chamba and Srinagar Garhwal.",
        "Enjoy spectacular views of the Mandakini River valley as you approach the Kedarnath base sector.",
        "Check in at hotel/resort in Guptkashi or Sitapur; evening briefing for Kedarnath Yatra."
      ],
      overnightStay: "Guptkashi / Sitapur"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Day 6 (15 May)",
      route: "Guptkashi / Sitapur → Kedarnath Dham Darshan",
      activities: [
        "Early morning transfer to Sonprayag / Gaurikund (or helipad for helicopter shuttle).",
        "Ascend to Shri Kedarnath Dham via trek/pony/helicopter.",
        "Perform evening Aarti and sacred Darshan of the 11th Jyotirlinga of Lord Shiva.",
        "Night stay at Kedarnath (Base camp / Sitapur as per package selection)."
      ],
      overnightStay: "Kedarnath / Sitapur"
    },
    {
      id: 7,
      dayNumber: 7,
      dateStr: "Day 7 (16 May)",
      route: "Kedarnath / Sitapur → Badrinath Dham",
      activities: [
        "Morning Darshan at Kedarnath Temple; descend back to Gaurikund / Sonprayag.",
        "Rejoin vehicle and commence scenic drive to Shri Badrinath Dham via Chopta and Joshimath.",
        "Reach Badrinath Dham by late afternoon/evening; check in at hotel.",
        "Evening Darshan and attend the divine evening Aarti at Badrinath Temple."
      ],
      overnightStay: "Badrinath"
    },
    {
      id: 8,
      dayNumber: 8,
      dateStr: "Day 8 (17 May)",
      route: "Badrinath Dham Darshan & Mana Village → Pipalkoti / Joshimath",
      activities: [
        "Early morning holy bath in Tapt Kund followed by Maha Abhishek / Darshan of Lord Badri Vishal.",
        "Visit Mana Village (India's first village), Bhim Pul, Vyas Gufa and Saraswati River Udgam.",
        "Afternoon drive down to Pipalkoti / Joshimath enjoying mountain vistas.",
        "Overnight stay at hotel in Pipalkoti / Joshimath."
      ],
      overnightStay: "Pipalkoti / Joshimath"
    },
    {
      id: 9,
      dayNumber: 9,
      dateStr: "Day 9 (18 May)",
      route: "Pipalkoti → Rudraprayag → Rishikesh / Haridwar",
      activities: [
        "Post breakfast, drive towards Rishikesh along the Alaknanda and Ganga valleys.",
        "Witness sacred river confluences (Panch Prayag): Karnaprayag, Nandaprayag, Rudraprayag and Devprayag.",
        "Arrive in Rishikesh / Haridwar; attend the world-renowned Ganga Aarti at Parmarth Niketan or Har Ki Pauri."
      ],
      overnightStay: "Rishikesh / Haridwar"
    },
    {
      id: 10,
      dayNumber: 10,
      dateStr: "Day 10 (19 May)",
      route: "Rishikesh / Haridwar → Local Sightseeing (Optional) & Departure Drop",
      activities: [
        "Post breakfast, departure drive towards Haridwar / Dehradun along the scenic Ganga valley.",
        "Rishikesh local sightseeing (Ram Jhula, Laxman Jhula & Triveni Ghat) is optional & subject to time/traffic; possible only if arriving before 06:00 PM.",
        "Timely transfer to Haridwar Railway Station or Dehradun Jolly Grant Airport for onward journey.",
        "Tour concludes with divine memories of Char Dham Yatra."
      ],
      overnightStay: "Tour Concludes (Drop Off)"
    }
  ],

  pricingSubtitle: "Confirmed Standard Package covering the full 10-day itinerary with dedicated mountain transport and experienced pilgrimage team.",
  pricingTiers: [
    { package: "Standard Package", price: "₹ 28,500 / Pax", hotelCategory: "Standard Clean Rooms / Verified Stays", meals: "Breakfast & Dinner (MAP)", specialFeature: "Covered Sightseeing & Dedicated Vehicle" }
  ],
  pricingNote: "Note: Rates are per person on twin/triple sharing basis. All tolls, parking, and driver allowances included.",

  inclusions: [
    "Dedicated Hill Vehicle (Innova Crysta / Tempo Traveller - Non-AC in hill areas) for the entire 10-day yatra",
    "Accommodation for 09 nights as per selected package category",
    "Meal plan as per package selected",
    "Kedarnath helicopter tickets, both ways (Guptkashi/Phata ⇄ Kedarnath)",
    "All toll tax, parking charges and driver allowance",
    "Assistance with Char Dham registration / biometric formalities",
    "Sightseeing: Yamunotri, Gangotri, Kedarnath, Badrinath, Chopta, Mana Gaon (Rishikesh sightseeing optional if reached before 6 PM)",
    "Support team assistance throughout the yatra"
  ],
  exclusions: [
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
    "Rishikesh local sightseeing on return journey is optional and strictly subject to reaching Rishikesh before 06:00 PM due to traffic restrictions.",
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
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    {
      id: "ph-1",
      url: "/gallery/chardham_10d_img_1.jpg",
      caption: "Char Dham Yatra - 4 Sacred Shrines"
    },
    {
      id: "ph-2",
      url: "/gallery/chardham_10d_img_13.jpg",
      caption: "Shri Kedarnath Temple & Holy Nandi Darshan"
    },
    {
      id: "ph-3",
      url: "/gallery/chardham_10d_img_15.jpg",
      caption: "Holy Shri Badrinath Ji Temple"
    },
    {
      id: "ph-4",
      url: "/gallery/chardham_10d_img_8.jpg",
      caption: "Holy Shri Gangotri Dham Temple"
    },
    {
      id: "ph-5",
      url: "/gallery/chardham_10d_img_14.jpg",
      caption: "Chopta Tungnath Himalayan Ridge"
    },
    {
      id: "ph-6",
      url: "/gallery/chardham_10d_img_18.jpg",
      caption: "Maa Dhari Devi Sacred Shrine"
    }
  ],
  hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// Exact preset matching the client's 10 Days / 09 Nights 12-Pax Chardham Yatra Package
const CHARDHAM_12P_10D_PRESET: ItineraryData = {
  title: "CHARDHAM YATRA PACKAGE 2026",
  subTitle: "UTTARAKHAND",
  spiritualHeadline: "10 Days · 09 Nights Pilgrimage Package",
  dhamsSubtitle: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  preparedFor: "12 Pax Pilgrimage Group",
  travelDates: "May – Oct 2026 Season",
  duration: "10 Days / 09 Nights",
  startingPoint: "Haridwar / Rishikesh / Dehradun Airport",
  routeCovered: "Haridwar – Barkot – Yamunotri – Uttarkashi – Gangotri – Phata – Sonprayag – Kedarnath – Chopta – Badrinath – Pipalkoti – Haridwar",
  overviewSummary: "The Char Dham Yatra is a sacred pilgrimage in India that encompasses a journey to four significant religious sites (Yamunotri, Gangotri, Kedarnath, & Badrinath) in the Himalayas. This is a total journey of 10 days in Tempo Traveller with family basis standard clean rooms, MAP meals and complete sightseeing en-route.",
  
  glanceDuration: "10 Days / 09 Nights",
  glanceDhams: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  glanceSector: "Haridwar to Haridwar (Tempo Traveller)",
  glanceStartEnd: "Haridwar / Rishikesh / Dehradun Airport",
  glancePackages: "Standard Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Haridwar To Barkot-Kharadi (via Kempty Falls)",
      activities: [
        "Pick up from Haridwar / Rishikesh / Dehradun airport and drive to Barkot.",
        "Enroute enjoy scenic mountain sightseeing including famous Kempty Falls.",
        "Check-in at hotel in Barkot/Kharadi; evening at leisure for rest and preparation."
      ],
      overnightStay: "Barkot"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Barkot To Janki Chatti & Yamunotri Darshan",
      activities: [
        "Early morning drive to Janki Chatti (45 km), base point for Yamunotri trek (6 km one way).",
        "Take a holy bath in Surya Kund hot spring and perform Pooja of pious Yamuna Ji at Divya Shila.",
        "Perform Darshan of Shri Yamunotri Temple; trek back to Janki Chatti and drive back to Barkot."
      ],
      overnightStay: "Barkot"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Barkot To Uttarkashi (Kashi Vishwanath Darshan)",
      activities: [
        "Post breakfast, check out from Barkot hotel and embark on a scenic drive to Uttarkashi.",
        "Arrive in Uttarkashi and check-in at hotel; relax along the sacred Bhagirathi river valley.",
        "In the evening, visit the ancient and revered Kashi Vishwanath Temple and Shakti Temple."
      ],
      overnightStay: "Uttarkashi"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Day 04",
      route: "Uttarkashi – Gangotri Darshan – Uttarkashi",
      activities: [
        "Leave early morning for Gangotri Dham; enjoy the breathtaking Harsil Valley on the way.",
        "On arrival at Gangotri, visit the sacred Gangotri Mata Temple and offer prayers & holy dip.",
        "Drive back to Uttarkashi through scenic apple orchards of Harsil; evening at leisure for rest."
      ],
      overnightStay: "Uttarkashi"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "Day 05",
      route: "Uttarkashi – Phata / Rampur / Guptkashi",
      activities: [
        "After breakfast, check out and drive through picturesque Garhwal hills to Phata / Rampur / Guptkashi.",
        "Arrive at the base sector for Kedarnath Yatra; check-in at hotel / resort.",
        "Evening briefing for next day's Kedarnath trek or helicopter shuttle."
      ],
      overnightStay: "Phata / Rampur"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Day 06",
      route: "Phata/Guptkashi – Kedarnath Trek & Darshan",
      activities: [
        "Early morning transfer to Sonprayag & Gaurikund; commence trek towards Shri Kedarnath Temple.",
        "Walk the sacred mountain trail (or hire pony/doli/helicopter as per individual choice).",
        "Perform evening Aarti, Pooja and divine Darshan of Shri Kedarnath Jyotirlinga.",
        "Night stay at Kedarnath in standard room / camp."
      ],
      overnightStay: "Kedarnath (Tent Only - Without Food)"
    },
    {
      id: 7,
      dayNumber: 7,
      dateStr: "Day 07",
      route: "Kedarnath – Gaurikund – Sitapur / Phata / Guptkashi",
      activities: [
        "Early morning check-out from Bhawan / camp; trek down from Kedarnath to Gaurikund.",
        "Take local jeep transfer to Sonprayag and rejoin your private Tempo Traveller.",
        "Drive to Sitapur / Phata / Guptkashi; check in at hotel for hot meals and restful overnight stay."
      ],
      overnightStay: "Sitapur / Phata / Guptkashi"
    },
    {
      id: 8,
      dayNumber: 8,
      dateStr: "Day 08",
      route: "Phata/Guptkashi – Chopta – Badrinath",
      activities: [
        "Post breakfast, check out and drive towards Shri Badrinath Dham.",
        "Pass through Chopta, famous as 'Mini Switzerland of Uttarakhand' with spectacular alpine views.",
        "Arrive at Badrinath, check-in at hotel; attend the divine evening Aarti at Shri Badrinath Temple."
      ],
      overnightStay: "Badrinath"
    },
    {
      id: 9,
      dayNumber: 9,
      dateStr: "Day 09",
      route: "Badrinath Darshan & Mana Village → Pipalkoti / Karanprayag",
      activities: [
        "Holy dip in Taptkund followed by morning Darshan of Lord Badri Vishal and Brahma Kamal.",
        "Sightseeing of Mana Village (First Indian Village), Vyas Gufa, Mata Murti Temple, Bhim Pul & Saraswati River Mukh.",
        "Drive down towards Pipalkoti / Karanprayag; witness the sacred Panch Prayag river confluences."
      ],
      overnightStay: "Pipalkoti / Karanprayag"
    },
    {
      id: 10,
      dayNumber: 10,
      dateStr: "Day 10",
      route: "Pipalkoti – Maa Dhari Devi & Devprayag – Haridwar",
      activities: [
        "Post breakfast, drive towards Haridwar; enroute seek blessings at Maa Dhari Devi Temple.",
        "Stop at Devprayag, holy confluence of Alaknanda & Bhagirathi where Ganga formally begins.",
        "Rishikesh sightseeing (Ram Jhula & Laxman Jhula) is optional & subject to time/traffic; possible only if arriving before 06:00 PM.",
        "Timely transfer to Haridwar Railway Station or Dehradun Airport for return journey."
      ],
      overnightStay: "Tour Concludes (Happy Memories)"
    }
  ],

  pricingSubtitle: "Special Standard Package with dedicated Tempo Traveller, confirmed standard clean stays and MAP meals.",
  pricingTiers: [
    { package: "Standard Package", price: "₹ 32,500 / Pax", hotelCategory: "Standard Clean Rooms (Family Basis)", meals: "Breakfast & Dinner (MAP)", specialFeature: "Tempo Traveller Included" }
  ],
  pricingNote: "Note: Total package cost for 12 Persons = ₹ 3,90,000/- (at ₹ 32,500 per person). All tolls, parking, and driver charges included.",

  inclusions: [
    "Personal Taxi / Tempo Traveller Haridwar To Haridwar (Assistance On Arrival)",
    "2 Night Stay At Barkot (Standard Clean Rooms)",
    "2 Night Stay At Uttarkashi (Standard Clean Rooms)",
    "2 Night Stay At Sitapur / Phata / Guptkashi / Rampur (Standard Clean Rooms)",
    "1 Night Stay At Shri Kedarnath Dham (Tent Only)",
    "1 Night Stay At Shri Badrinath Dham (Standard Clean Rooms)",
    "1 Night Stay At Pipalkoti / Karanprayag / Rudraprayag (Standard Clean Rooms)",
    "Meal As Per Plan: Breakfast & Dinner (At Hotels Only)",
    "All Interstate Taxes, Tolls, Driver Allowance and Parking Etc.",
    "Sightseeing: Kashi Vishwanath Temple (Day 3 evening), Chopta, Mana Gaon, Saraswati Mukh, Vyas Gufa, Bhim Pul, Panch Prayag, Maa Dhari Devi Temple (Rishikesh optional if reached before 6 PM)"
  ],
  exclusions: [
    "Any extra sightseeing or destinations apart from mentioned inclusions",
    "Heater charges if available & Any Adventure Activities",
    "Meal At Kedarnath Night & Double Bed Room (During Kedarnath Stay without food)",
    "Monument & museum entry fee, guide fee, camera fee",
    "Train / Flight and Helicopter / Chopper tickets fare (unless opted)",
    "Horse / pony charges, Palki / Doli etc. at trek points",
    "Extra personal costs e.g. laundry, telephone, tips, extra food, Lunch, Drinks, Mineral water",
    "Medical insurance, medical costs or expenses of any other nature not mentioned"
  ],

  goodToKnow: [
    "Things to Carry: Woolen cap, muffler, gloves, sweater, warm jacket, thermal socks, comfortable trekking shoes, raincoat, trekking stick, water bottle, power bank, sunscreen.",
    "Room Sharing: 2 / 3 / 4 / 6 bed family basis (depends upon total persons & hotel room layout).",
    "Kedarnath Room Sharing: 3 / 4 / 6 / 8 sharing depends upon availability of hotel/camp at high altitude.",
    "Rishikesh local sightseeing on return journey is optional and strictly subject to reaching Rishikesh before 06:00 PM due to traffic restrictions.",
    "Non-AC Rooms & Vehicle: All hotel rooms in hill areas are non-AC as per mountain climate. In hill/ghat areas, vehicle AC does not operate due to steep climbs and engine safety norms.",
    "Vehicles are driven between 5:00 AM and 10:00 PM for maximum mountain road safety."
  ],
  bookingPayment: [
    "Booking Advance: 25% mandatory deposit at time of confirmation; remaining balance before starting journey at Haridwar.",
    "Advance deposit is completely non-refundable once hotels & vehicle are blocked."
  ],

  contactAgency: "Travel to Uttarakhand with Amit",
  contactPerson: "Amit Chandra",
  contactPhone: "+91 9719038278 · 7818952740",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    {
      id: "ph-12p-1",
      url: "/gallery/chardham_10d_img_1.jpg",
      caption: "Char Dham Yatra - 4 Sacred Shrines"
    },
    {
      id: "ph-12p-2",
      url: "/gallery/chardham_10d_img_13.jpg",
      caption: "Shri Kedarnath Temple & Holy Nandi Darshan"
    },
    {
      id: "ph-12p-3",
      url: "/gallery/chardham_10d_img_15.jpg",
      caption: "Shri Badrinath Ji Divine Facade"
    },
    {
      id: "ph-12p-4",
      url: "/gallery/chardham_10d_img_8.jpg",
      caption: "Holy Shri Gangotri Dham Temple"
    },
    {
      id: "ph-12p-5",
      url: "/gallery/chardham_10d_img_14.jpg",
      caption: "Chopta Tungnath Himalayan Ridge"
    },
    {
      id: "ph-12p-6",
      url: "/gallery/chardham_10d_img_18.jpg",
      caption: "Maa Dhari Devi Sacred Shrine"
    }
  ],
  hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// Dedicated 6 Days / 5 Nights Do Dham Yatra (Kedarnath + Badrinath) Preset
export const DODHAM_6D_PRESET: ItineraryData = {
  title: "DO DHAM YATRA PACKAGE 2026",
  subTitle: "UTTARAKHAND",
  spiritualHeadline: "6 Days · 05 Nights Pilgrimage Tour",
  dhamsSubtitle: "Kedarnath Dham · Badrinath Dham",
  preparedFor: "Valued Pilgrims / Family Group",
  travelDates: "May – Oct 2026 Season",
  duration: "6 Days / 05 Nights",
  startingPoint: "Haridwar / Rishikesh / Dehradun Airport",
  routeCovered: "Haridwar – Guptkashi – Kedarnath – Chopta – Badrinath – Pipalkoti – Rishikesh – Haridwar",
  overviewSummary: "A sacred 6 Days / 05 Nights Do Dham Yatra dedicated to Shri Kedarnath Jyotirlinga and Shri Badrinath Dham. Journey seamlessly through the scenic Garhwal Himalayas via Guptkashi, Chopta (Mini Switzerland of Uttarakhand), and Pipalkoti with dedicated hill vehicle and confirmed stays.",
  
  glanceDuration: "6 Days / 05 Nights",
  glanceDhams: "Kedarnath · Badrinath",
  glanceSector: "Haridwar ⇄ Do Dham Circuit",
  glanceStartEnd: "Haridwar / Rishikesh (both ways)",
  glancePackages: "Standard Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Haridwar / Rishikesh → Guptkashi / Sitapur",
      activities: [
        "Morning pickup from Haridwar Railway Station / Dehradun Airport and proceed to Guptkashi / Sitapur.",
        "En route witness scenic river confluences at Devprayag (Alaknanda & Bhagirathi) and Rudraprayag (Mandakini & Alaknanda).",
        "Arrive at Guptkashi / Sitapur, check in at hotel; evening briefing for Kedarnath Yatra."
      ],
      overnightStay: "Guptkashi / Sitapur"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Guptkashi / Sitapur → Kedarnath Dham Trek & Darshan",
      activities: [
        "Early morning drive to Sonprayag / Gaurikund, base point for the holy Kedarnath trek.",
        "Ascend 16-18 km towards Shri Kedarnath Dham (via trek, pony, doli or helicopter shuttle).",
        "Attend divine evening Aarti and perform holy Darshan of the 11th Jyotirlinga of Lord Shiva.",
        "Night stay at Kedarnath in camp / tent."
      ],
      overnightStay: "Kedarnath (Tent Only - Without Food)"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Kedarnath Dham → Descend to Gaurikund → Guptkashi / Sitapur",
      activities: [
        "Early morning Darshan at Kedarnath Temple; commence trek down to Gaurikund.",
        "Board vehicle at Sonprayag and drive back to hotel in Guptkashi / Sitapur.",
        "Relax and enjoy a warm dinner after the mountain descent; overnight stay."
      ],
      overnightStay: "Guptkashi / Sitapur"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Day 04",
      route: "Guptkashi / Sitapur → Chopta → Badrinath Dham",
      activities: [
        "Post breakfast, check out and drive towards Shri Badrinath Dham.",
        "Pass through Chopta, famously known as the 'Mini Switzerland of Uttarakhand' with scenic meadows.",
        "Arrive at Badrinath by late afternoon, check in at hotel; attend the divine evening Aarti at Badrinath Temple."
      ],
      overnightStay: "Badrinath"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "Day 05",
      route: "Badrinath Darshan & Mana Village → Pipalkoti / Joshimath",
      activities: [
        "Early morning sacred bath at Tapt Kund followed by Darshan of Lord Badri Vishal.",
        "Visit Mana Village (India's First Village), Bhim Pul, Vyas Gufa and Saraswati River Udgam.",
        "Afternoon scenic drive down to Pipalkoti / Joshimath for an evening of relaxation."
      ],
      overnightStay: "Pipalkoti / Joshimath"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Day 06",
      route: "Pipalkoti → Rishikesh Sightseeing (Optional) → Haridwar Drop",
      activities: [
        "Post breakfast, drive towards Haridwar via Karnaprayag and Maa Dhari Devi Temple.",
        "Rishikesh sightseeing (Ram Jhula, Laxman Jhula & Triveni Ghat) is optional & subject to time/traffic; possible only if arriving before 06:00 PM.",
        "Timely transfer to Haridwar Railway Station or Dehradun Airport for onward journey."
      ],
      overnightStay: "Tour Concludes (Happy Memories)"
    }
  ],

  pricingSubtitle: "Special Do Dham (Kedarnath + Badrinath) 6D/5N Standard Package with dedicated mountain vehicle and confirmed stays.",
  pricingTiers: [
    { package: "Standard Package", price: "₹ 19,500 / Pax", hotelCategory: "Standard Clean Rooms / Alpine Camp", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Mountain Vehicle" }
  ],
  pricingNote: "Note: Rates are per person on twin/triple sharing basis. All mountain tolls, parking, and driver allowances included.",

  inclusions: [
    "Personal Hill Vehicle (Innova / Swift Dzire / Tempo Traveller as per group size) Haridwar to Haridwar",
    "2 Nights Stay at Guptkashi / Sitapur (Standard Clean Rooms)",
    "1 Night Stay at Shri Kedarnath Dham (Tent Only)",
    "1 Night Stay at Shri Badrinath Dham (Standard Clean Rooms)",
    "1 Night Stay at Pipalkoti / Joshimath (Standard Clean Rooms)",
    "Meals as per plan: Breakfast & Dinner (At hotels only)",
    "All Interstate Taxes, Tolls, Driver Allowance and Parking charges",
    "Sightseeing: Chopta, Mana Gaon, Saraswati Mukh, Vyas Gufa, Bhim Pul, Panch Prayag confluences, Maa Dhari Devi Temple (Rishikesh optional if reached before 6 PM)"
  ],
  exclusions: [
    "Any extra sightseeing or destinations apart from mentioned inclusions",
    "Meals at Kedarnath Dham & personal porter / pony / palki / helicopter charges",
    "VIP / special puja tickets, room heaters, laundry, tips or personal shopping",
    "Costs arising from natural calamities, landslides or road closures"
  ],

  goodToKnow: [
    "Char Dham biometric registration is mandatory — our team provides complete assistance.",
    "Kedarnath night accommodation is provided in clean alpine tents/camps (without food).",
    "Rishikesh sightseeing on return journey is optional and strictly subject to reaching Rishikesh before 06:00 PM due to traffic restrictions.",
    "Warm woollens, raincoats and comfortable trekking shoes are strongly recommended."
  ],
  bookingPayment: [
    "Booking confirmed against advance deposit; balance payable before start of journey.",
    "All payments are processed securely with valid booking confirmation and bank remittance receipts."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    {
      id: "ph-dd-1",
      url: "/gallery/chardham_10d_img_13.jpg",
      caption: "Shri Kedarnath Temple & Holy Nandi Darshan"
    },
    {
      id: "ph-dd-2",
      url: "/gallery/chardham_10d_img_15.jpg",
      caption: "Shri Badrinath Ji Divine Facade"
    },
    {
      id: "ph-dd-3",
      url: "/gallery/chardham_10d_img_14.jpg",
      caption: "Chopta Tungnath Alpine Meadows"
    }
  ],
  hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// ========================================================
// ❄️ WINTER HOLIDAYS SPECIAL SHORTCUT PRESETS (2026 - 2027)
// ========================================================

// 1. Auli Winter Wonderland (3D/2N) - 2 Nights Joshimath
export const AULI_3D_PRESET: ItineraryData = {
  title: "AULI WINTER WONDERLAND PACKAGE 2026-27",
  subTitle: "UTTARAKHAND WINTER SPECIAL",
  spiritualHeadline: "3 Days · 02 Nights Snow & Ski Expedition",
  dhamsSubtitle: "Joshimath · Auli Ropeway · Gorson Bugyal",
  preparedFor: "Valued Travelers / Winter Holiday Group",
  travelDates: "Nov 2026 – Mar 2027 Winter Season",
  duration: "3 Days / 02 Nights",
  startingPoint: "Haridwar / Rishikesh / Dehradun Airport",
  routeCovered: "Haridwar – Devprayag – Srinagar – Rudraprayag – Joshimath – Auli – Joshimath – Haridwar",
  overviewSummary: "Experience the snow-covered winter paradise of Auli, India's premier skiing and snow destination. Enjoy breathtaking views of Mt. Nanda Devi, Asia's iconic cable car / ropeway ride from Joshimath to Auli, thrilling snow activities, and cozy 2 nights stay in Joshimath.",
  
  glanceDuration: "3 Days / 02 Nights",
  glanceDhams: "Auli · Joshimath · Gorson",
  glanceSector: "Haridwar ⇄ Joshimath / Auli",
  glanceStartEnd: "Haridwar / Rishikesh / Dehradun",
  glancePackages: "Winter Deluxe Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Haridwar / Rishikesh / Dehradun → Devprayag → Joshimath",
      activities: [
        "Morning pickup from Haridwar Railway Station / Rishikesh / Dehradun Airport and proceed towards Joshimath.",
        "Drive along the scenic Alaknanda river valley; visit Devprayag Sangam (Bhagirathi & Alaknanda confluence) and Rudraprayag.",
        "Arrive at Joshimath by late afternoon; check in at hotel. Evening at leisure to visit the local market or ancient Shankaracharya Math."
      ],
      overnightStay: "Joshimath",
      photoUrl: "/gallery/joshimath_stay.jpeg",
      photoCaption: "Scenic Alaknanda Valley Route & Joshimath Valley View Arrival"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Joshimath → Auli Cable Car / Ski Slopes & Gorson Bugyal → Joshimath",
      activities: [
        "Post breakfast, board the famous Joshimath-Auli Cable Car (ropeway) or take local mountain taxi up to Auli snow meadows.",
        "Marvel at the mesmerizing 180-degree panorama of Mt. Nanda Devi, Hathi-Ghodi Parvat, and Neelkanth peaks.",
        "Enjoy thrilling winter activities like skiing, snowboarding, chairlift ride, and snow walk to Gorson Bugyal.",
        "Witness a magnificent Himalayan sunset over snow peaks and return to Joshimath hotel for hot dinner."
      ],
      overnightStay: "Joshimath",
      photoUrl: "/gallery/auli_ropeway.jpg",
      photoCaption: "Auli Cable Car (Asia's Longest Ropeway)",
      photoUrl2: "/gallery/auli_skiing.jpg",
      photoCaption2: "Thrilling Snow Skiing & Gorson Bugyal Slopes"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Joshimath → Maa Dhari Devi Temple → Rishikesh → Haridwar / Dehradun Drop",
      activities: [
        "Early morning breakfast and check out from Joshimath hotel.",
        "Scenic downhill drive via Karnaprayag and Srinagar; visit sacred Maa Dhari Devi Temple on the river Alaknanda.",
        "Optional evening visit to Rishikesh (Ram Jhula / Triveni Ghat) followed by drop at Haridwar Railway Station / Dehradun Airport."
      ],
      overnightStay: "Tour Concludes (Sweet Winter Memories)",
      photoUrl: "/gallery/rishikesh_ganga_aarti.webp",
      photoCaption: "Sacred Maa Dhari Devi Shrine & Holy Triveni Ghat Rishikesh",
      photoUrl2: "/gallery/rishikesh_ram_jhula.png",
      photoCaption2: "Sacred Ram Jhula over Holy River Ganga"
    }
  ],

  pricingSubtitle: "Special Auli Winter Holiday 3D/2N Package with dedicated private vehicle, 2 Nights stay in Joshimath and meal plan.",
  pricingTiers: [
    { package: "Deluxe Winter Package", price: "₹ 8,500 / Pax", totalPackagePrice: "₹ 8,500 / Pax (Twin Sharing)", hotelCategory: "Deluxe Heated / Clean Mountain Hotel", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Mountain Vehicle + Auli Excursion" },
    { package: "Premium Winter Package", price: "₹ 12,000 / Pax", totalPackagePrice: "₹ 12,000 / Pax (Twin Sharing)", hotelCategory: "Premium 3-Star Resort in Joshimath", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Innova/Crysta + Bonfire" }
  ],
  pricingNote: "Note: Rates are per person on twin/triple sharing. Cable car / ropeway tickets and ski gear payable directly on spot as per personal choice.",

  inclusions: [
    "Dedicated Hill Vehicle (Swift Dzire / Ertiga / Innova / Tempo Traveller as per group size) Haridwar to Haridwar",
    "02 Nights Stay in Joshimath (Deluxe Mountain View Rooms)",
    "Meals as per plan: Daily Breakfast and Warm Dinner at Joshimath hotel",
    "All Interstate Taxes, Tolls, Driver Allowance, Fuel and Parking charges",
    "Sightseeing: Joshimath town, Auli snow slopes, Shankaracharya Math, Devprayag Sangam, Maa Dhari Devi Temple"
  ],
  exclusions: [
    "Auli Cable car / Ropeway / Chairlift ride tickets & skiing gear/instructor fees",
    "Any personal expenses, room heater charges (payable at hotel if opted), laundry, tips",
    "Lunch and mid-day snacks on transit",
    "Expenses arising due to extreme snow roadblocks, weather delays or natural contingencies"
  ],

  goodToKnow: [
    "Auli Cable Car runs subject to weather conditions and timings (usually 09:00 AM to 04:30 PM).",
    "Heavy winter woollens, thermal inners, waterproof gloves, sunglasses and sturdy snow boots are strongly advised.",
    "During heavy snowfall, local 4x4 vehicles with snow tyre chains may be required between Joshimath and Auli at direct nominal cost."
  ],
  bookingPayment: [
    "Advance deposit required to confirm room and cab reservations during winter peak season.",
    "Balance amount payable before commencement of journey with official tax invoice & confirmation voucher."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "जय बद्री विशाल · शुभ शीतकालीन यात्रा",

  photos: [
    { id: "ph-auli-1", url: "/gallery/auli_ropeway.jpg", caption: "Auli Cable Car & Iconic Ropeway View" },
    { id: "ph-auli-2", url: "/gallery/auli_skiing.jpg", caption: "Auli Snow Slopes & Skiing Adventure" },
    { id: "ph-auli-3", url: "/gallery/auli_lake_gorson.webp", caption: "Auli Snow Meadows & Gorson Bugyal" },
    { id: "ph-auli-4", url: "/gallery/joshimath_stay.jpeg", caption: "Joshimath Town & Scenic Stays" }
  ],
  hotelPhotos: WINTER_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// 2. Chopta & Tungnath Winter Special (3D/2N) - 2 Nights Chopta
export const CHOPTA_3D_PRESET: ItineraryData = {
  title: "CHOPTA & TUNGNATH WINTER SPECIAL 2026-27",
  subTitle: "MINI SWITZERLAND OF UTTARAKHAND",
  spiritualHeadline: "3 Days · 02 Nights Snow Meadows & Temple Trek",
  dhamsSubtitle: "Chopta · Tungnath (Highest Shiva Shrine) · Chandrashila · Ukhimath",
  preparedFor: "Valued Trekkers / Winter Holiday Group",
  travelDates: "Nov 2026 – Mar 2027 Winter Season",
  duration: "3 Days / 02 Nights",
  startingPoint: "Haridwar / Rishikesh / Dehradun Airport",
  routeCovered: "Haridwar – Devprayag – Rudraprayag – Kund – Ukhimath – Chopta – Tungnath – Haridwar",
  overviewSummary: "Discover the pristine snow-blanketed meadows of Chopta, famously called the Mini Switzerland of Uttarakhand. Embark on the iconic winter snow trek to Tungnath (world's highest Shiva temple at 12,073 ft) and Chandrashila Summit (13,123 ft) with 2 nights cozy stay in Chopta.",
  
  glanceDuration: "3 Days / 02 Nights",
  glanceDhams: "Chopta · Tungnath · Chandrashila",
  glanceSector: "Haridwar ⇄ Chopta Winter Circuit",
  glanceStartEnd: "Haridwar / Rishikesh / Dehradun",
  glancePackages: "Winter Adventure Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Haridwar / Rishikesh / Dehradun → Devprayag → Rudraprayag → Chopta",
      activities: [
        "Early morning pickup from Haridwar / Rishikesh / Dehradun; begin journey along the holy Ganga & Alaknanda rivers.",
        "En route halt at sacred Devprayag (Sangam of Alaknanda & Bhagirathi) and Rudraprayag (Mandakini & Alaknanda).",
        "Ascend through pine and rhododendron forests to Chopta; check in at cozy Swiss cottage / mountain resort. Evening bonfire under star-lit snow skies."
      ],
      overnightStay: "Chopta",
      photoUrl: "/gallery/chopta_snow_meadows.jpg",
      photoCaption: "Chopta Snow-Covered Alpine Meadows (Mini Switzerland)"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Chopta Base → Tungnath Temple & Chandrashila Snow Trek → Chopta",
      activities: [
        "Post warm breakfast, gear up for the thrilling winter trek from Chopta to Tungnath (3.5 km snow trail).",
        "Perform Darshan of the divine Tungnath Temple, the highest of the Panch Kedar shrines.",
        "Trek a further 1.5 km up to Chandrashila Peak (13,123 ft) for an awe-inspiring 360-degree vista of Chaukhamba, Nanda Devi, and Trishul ranges.",
        "Descend back to Chopta camp/resort by late afternoon; enjoy hot evening soup, tea, and wholesome dinner."
      ],
      overnightStay: "Chopta",
      photoUrl: "/gallery/tungnath_temple_snow.jpg",
      photoCaption: "Highest Shiva Shrine Shri Tungnath in Winter Snow",
      photoUrl2: "/gallery/chandrashila_summit.jpg",
      photoCaption2: "Chandrashila Summit 360° Himalayan Panorama"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Chopta → Ukhimath Omkareshwar Temple → Rishikesh → Haridwar / Dehradun Drop",
      activities: [
        "Witness early morning sunrise bathing the Himalayan peaks in gold. Post breakfast, check out from Chopta.",
        "Drive to Ukhimath and visit holy Omkareshwar Temple, the revered winter seat of Lord Kedarnath.",
        "Proceed downhill via Srinagar and Devprayag. Timely drop at Haridwar Railway Station or Dehradun Airport for onward journey."
      ],
      overnightStay: "Tour Concludes (Sweet Winter Memories)",
      photoUrl: "/gallery/ukhimath_temple.png",
      photoCaption: "Sacred Ukhimath Omkareshwar Temple - Winter Seat of Kedarnath"
    }
  ],

  pricingSubtitle: "Special Chopta & Tungnath Snow Holiday 3D/2N Package with 2 Nights Stay in Chopta, meals, and dedicated mountain vehicle.",
  pricingTiers: [
    { package: "Standard Snow Trek", price: "₹ 7,500 / Pax", totalPackagePrice: "₹ 7,500 / Pax (Twin Sharing)", hotelCategory: "Deluxe Alpine Swiss Tent / Resort in Chopta", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Cab + Trek Assistance + Bonfire" },
    { package: "Deluxe Heated Resort", price: "₹ 10,500 / Pax", totalPackagePrice: "₹ 10,500 / Pax (Twin Sharing)", hotelCategory: "Premium Mountain Resort / Heated Cottage", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Vehicle + Bonfire + Microspikes/Gaiters" }
  ],
  pricingNote: "Note: Rates per person on twin/triple sharing. Includes stay, transport, and meal plan.",

  inclusions: [
    "Dedicated Private Hill Vehicle (Dzire / Ertiga / Innova / Tempo Traveller) Haridwar to Haridwar",
    "02 Nights Stay in Chopta (Swiss Cottage / Deluxe Mountain Resort)",
    "Meals: Daily Morning Breakfast and Delicious Warm Dinner",
    "All Interstate Tolls, Parking, Driver Batta, and Mountain Taxes",
    "Sightseeing & Treks: Chopta Bugyal, Tungnath Temple, Chandrashila Peak, Ukhimath Omkareshwar Temple, Devprayag Sangam"
  ],
  exclusions: [
    "Personal trekking gear, pony/mule charges (if hired during snow trek)",
    "Personal expenses, mineral water, beverages, laundry, tips",
    "Any extra vehicle usage or deviations beyond route itinerary",
    "Emergency medical expenses or stays due to road blockage/heavy snowfall"
  ],

  goodToKnow: [
    "Chopta experiences sub-zero temperatures in winter; heavy layered thermal clothing, fleece jackets, waterproof gloves, and trek boots with good grip are essential.",
    "Tungnath Temple inner sanctum closes in deep winter (deities move to Ukhimath), but the temple premises and Chandrashila snow summit trek remain accessible for trekkers subject to snow safety.",
    "Campsites provide solar/generator lighting and hot water buckets in winter."
  ],
  bookingPayment: [
    "25% - 50% advance deposit for immediate confirmation.",
    "Balance payable upon arrival or before departure with GST invoice."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "हर हर महादेव · ॐ नमः शिवाय",

  photos: [
    { id: "ph-chopta-1", url: "/gallery/chopta_snow_meadows.jpg", caption: "Chopta Snow-Covered Alpine Meadows & Camps" },
    { id: "ph-chopta-2", url: "/gallery/tungnath_temple_snow.jpg", caption: "Shri Tungnath Temple in Winter Snow" },
    { id: "ph-chopta-3", url: "/gallery/chandrashila_summit.jpg", caption: "Chandrashila Peak 360° Himalayan Panorama" },
    { id: "ph-chopta-4", url: "/gallery/ukhimath_temple.png", caption: "Ukhimath Omkareshwar Temple - Winter Seat" }
  ],
  hotelPhotos: WINTER_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// 3. Rishikesh + Mussoorie Winter Getaway (3D/2N) - 1st Night Rishikesh, 2nd Night Mussoorie
export const RISHIKESH_MUSSOORIE_3D_PRESET: ItineraryData = {
  title: "RISHIKESH & MUSSOORIE WINTER RETREAT 2026-27",
  subTitle: "QUEEN OF HILLS & HOLY GANGA EXPERIENCE",
  spiritualHeadline: "3 Days · 02 Nights Hill & Heritage Winter Break",
  dhamsSubtitle: "Rishikesh Ganga Aarti · Mussoorie Winterline · Kempty Falls",
  preparedFor: "Valued Travelers / Family Holiday",
  travelDates: "Nov 2026 – Mar 2027 Winter Season",
  duration: "3 Days / 02 Nights",
  startingPoint: "Haridwar / Dehradun / Delhi NCR",
  routeCovered: "Haridwar / Dehradun – Rishikesh – Dehradun Malsi – Mussoorie – Kempty Falls – Dehradun / Haridwar",
  overviewSummary: "A refreshing 3 Days / 02 Nights winter weekend getaway pairing the peaceful spiritual ambiance and divine Ganga Aarti of Rishikesh with the colonial misty charm, Mall Road walks, and rare 'Winterline' sunset views of Mussoorie (Queen of the Hills).",
  
  glanceDuration: "3 Days / 02 Nights",
  glanceDhams: "Rishikesh · Mussoorie",
  glanceSector: "Haridwar / Dehradun ⇄ Mussoorie",
  glanceStartEnd: "Haridwar / Dehradun (both ways)",
  glancePackages: "Deluxe Leisure Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Haridwar / Dehradun Pickup → Rishikesh Divine Exploration & Ganga Aarti",
      activities: [
        "Morning pickup from Haridwar Railway Station or Dehradun Airport; transfer to Rishikesh and check in at hotel/resort.",
        "Visit the iconic Ram Jhula, Lakshman Jhula area, Geeta Bhawan, and popular riverside cafes along the Ganga.",
        "In the evening, attend the mesmerizing Maha Ganga Aarti at Triveni Ghat / Parmarth Niketan amidst blowing conches and thousands of floating diyas.",
        "Overnight stay in Rishikesh with warm dinner."
      ],
      overnightStay: "Rishikesh",
      photoUrl: "/gallery/rishikesh_ganga_aarti.webp",
      photoCaption: "Maha Ganga Aarti at Triveni Ghat & Holy Ganga",
      photoUrl2: "/gallery/rishikesh_ram_jhula.png",
      photoCaption2: "Sacred Ram Jhula Suspension Bridge"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Rishikesh → Dehradun Scenic Climb → Mussoorie Hill Station",
      activities: [
        "Post breakfast, check out from Rishikesh and drive towards Mussoorie ('Queen of the Hills') via scenic Rajpur Road / Dehradun bypass.",
        "Visit the famous Kempty Falls and picturesque Company Garden.",
        "Check in at hotel in Mussoorie. In the evening, enjoy a leisurely stroll along the Mall Road, Kulri Bazaar, and Camel's Back Road while watching the magical winterline sunset."
      ],
      overnightStay: "Mussoorie",
      photoUrl: "/gallery/mussoorie_winterline.jpeg",
      photoCaption: "Mussoorie Rare Winterline Sunset Phenomenon",
      photoUrl2: "/gallery/mussoorie_mall_road.webp",
      photoCaption2: "Mussoorie Mall Road & Misty Hills"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Mussoorie Sightseeing → George Everest / Lal Tibba → Dehradun / Haridwar Drop",
      activities: [
        "Early morning visit to Lal Tibba viewpoint (Landour) or Sir George Everest House for sweeping vistas of the snow-clad Himalayas and Doon valley.",
        "Breakfast and checkout from hotel; descend towards Dehradun.",
        "Optional visit to Robber's Cave (Guchhupani) or Sahastradhara en route.",
        "Timely drop at Dehradun Airport / Railway Station or Haridwar for onward return journey."
      ],
      overnightStay: "Tour Concludes (Sweet Winter Memories)",
      photoUrl: "/gallery/kempty_falls.avif",
      photoCaption: "Cascading Kempty Falls & Queen of Hills Vistas"
    }
  ],

  pricingSubtitle: "Special Rishikesh & Mussoorie 3D/2N Holiday with 1st Night in Rishikesh and 2nd Night in Mussoorie.",
  pricingTiers: [
    { package: "Deluxe Holiday Package", price: "₹ 6,800 / Pax", totalPackagePrice: "₹ 6,800 / Pax (Twin Sharing)", hotelCategory: "Deluxe 3-Star City & Hill Hotels", meals: "Breakfast Included (CP)", specialFeature: "Dedicated AC Sedan / SUV + Full Sightseeing" },
    { package: "Premium Resort Package", price: "₹ 9,500 / Pax", totalPackagePrice: "₹ 9,500 / Pax (Twin Sharing)", hotelCategory: "4-Star Resort in Rishikesh & Luxury Hill Resort in Mussoorie", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Innova Crysta + Mall Road Stays" }
  ],
  pricingNote: "Note: Rates based on twin sharing. Entry tickets to falls/cable cars and adventure activities at direct payment.",

  inclusions: [
    "Dedicated AC Vehicle (Dzire / Etios / Ertiga / Innova) throughout the tour",
    "01 Night Stay in Rishikesh (Deluxe Room)",
    "01 Night Stay in Mussoorie (Deluxe Mountain/Valley View Room)",
    "Daily Morning Breakfast at both hotels",
    "All Driver Batta, Tolls, State Border Taxes, and Parking fees",
    "Sightseeing: Ram Jhula, Triveni Ghat Ganga Aarti, Kempty Falls, Mall Road, Camel's Back Road, Landour / George Everest"
  ],
  exclusions: [
    "River rafting, ropeway/trolley tickets in Mussoorie, entry tickets at gardens/falls",
    "Lunches, dinners (unless opted in MAP plan), room heater charges, tips",
    "Any personal expense or additional travel beyond itinerary"
  ],

  goodToKnow: [
    "Mussoorie experiences chilly winter weather with occasional light snow in Dec/Jan; warm coats, jackets, and mufflers are recommended.",
    "Vehicle movement on Mall Road Mussoorie has restricted timings; our driver will drop you at the designated entry point.",
    "Exact confirmed stays: 1st Night in Rishikesh, followed by 2nd Night in Mussoorie."
  ],
  bookingPayment: [
    "Convenient online advance booking; instant voucher confirmation.",
    "Balance payable on arrival with full travel invoice."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "जय गंगे मात · देवभूमि दर्शन",

  photos: [
    { id: "ph-rm-1", url: "/gallery/mussoorie_winterline.jpeg", caption: "Mussoorie Rare Winterline Sunset Spectacle" },
    { id: "ph-rm-2", url: "/gallery/rishikesh_ganga_aarti.webp", caption: "Maha Ganga Aarti at Triveni Ghat Rishikesh" },
    { id: "ph-rm-3", url: "/gallery/mussoorie_mall_road.webp", caption: "Mussoorie Mall Road & Misty Hills" },
    { id: "ph-rm-4", url: "/gallery/kempty_falls.avif", caption: "Cascading Kempty Falls Mussoorie" },
    { id: "ph-rm-5", url: "/gallery/rishikesh_ram_jhula.png", caption: "Sacred Ram Jhula over Holy River Ganga" }
  ],
  hotelPhotos: WINTER_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// 4. Auli + Chopta + Tungnath (5D/4N) - 1st & 2nd Night Ukhimath/Chopta, 3rd & 4th Night Joshimath/Rudraprayag
export const AULI_CHOPTA_TUNGNATH_5D_PRESET: ItineraryData = {
  title: "AULI, CHOPTA & TUNGNATH WINTER EXPEDITION 2026-27",
  subTitle: "ULTIMATE GARHWAL SNOW CIRCUIT",
  spiritualHeadline: "5 Days · 04 Nights Snow Adventure & High Altitude Trek",
  dhamsSubtitle: "Chopta Meadows · Tungnath Temple · Chandrashila · Joshimath · Auli Ski Slopes",
  preparedFor: "Valued Travelers / Winter Holiday Group",
  travelDates: "Nov 2026 – Mar 2027 Winter Season",
  duration: "5 Days / 04 Nights",
  startingPoint: "Haridwar / Rishikesh / Dehradun Airport",
  routeCovered: "Haridwar – Devprayag – Rudraprayag – Ukhimath/Chopta – Tungnath – Mandal Valley – Joshimath – Auli – Joshimath/Rudraprayag – Haridwar",
  overviewSummary: "The definitive winter holiday circuit of Uttarakhand! Experience the snow-draped alpine meadows of Chopta, the world's highest Shiva shrine at Tungnath, the summit views from Chandrashila (13,123 ft), and the skiing slopes and Asia's longest ropeway at Auli with panoramic views of Mt. Nanda Devi.",
  
  glanceDuration: "5 Days / 04 Nights",
  glanceDhams: "Chopta · Tungnath · Joshimath · Auli",
  glanceSector: "Haridwar ⇄ Chopta & Auli Winter Circuit",
  glanceStartEnd: "Haridwar / Rishikesh / Dehradun",
  glancePackages: "Winter Expedition Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Haridwar / Rishikesh / Dehradun → Devprayag → Rudraprayag → Ukhimath / Chopta",
      activities: [
        "Morning pickup from Haridwar Railway Station / Rishikesh / Dehradun; begin the scenic drive up the Garhwal Himalayas.",
        "En route visit the sacred confluence of Alaknanda and Bhagirathi at Devprayag, and Mandakini confluence at Rudraprayag.",
        "Drive through the Mandakini valley to Ukhimath / Chopta; check in at hotel/resort. Enjoy evening bonfire and hot dinner amidst mountain chill."
      ],
      overnightStay: "Ukhimath / Chopta",
      photoUrl: "/gallery/ukhimath_temple.png",
      photoCaption: "Sacred Ukhimath Omkareshwar Temple - Winter Seat of Kedarnath"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Chopta Base → Tungnath Temple & Chandrashila Snow Summit Trek → Ukhimath / Chopta",
      activities: [
        "Post breakfast, drive to Chopta meadow base and start the exhilarating snow trek to Tungnath (3.5 km).",
        "Reach the sacred 1,000-year-old Tungnath Temple (highest Shiva shrine in the world at 12,073 ft).",
        "Further ascend 1.5 km up to Chandrashila Peak (13,123 ft) for a 360-degree panoramic spectacle of Chaukhamba, Nanda Devi, Trishul, and Kedarnath peaks.",
        "Descend back to Chopta base by late afternoon and return to hotel/resort in Ukhimath / Chopta for dinner and overnight rest."
      ],
      overnightStay: "Ukhimath / Chopta",
      photoUrl: "/gallery/tungnath_temple_snow.jpg",
      photoCaption: "Highest Shiva Shrine Tungnath in Winter Snow",
      photoUrl2: "/gallery/chandrashila_summit.jpg",
      photoCaption2: "Chandrashila Summit 360° Snow Panorama"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Ukhimath / Chopta → Scenic Mandal Valley & Gopeshwar → Joshimath / Rudraprayag",
      activities: [
        "After breakfast, check out and drive towards Joshimath via the picturesque Mandal forest valley and Gopeshwar / Chamoli.",
        "Enjoy stunning views of river gorges and snow-capped peaks along the route.",
        "Arrive at Joshimath / Rudraprayag; check in at hotel. In the evening, visit the ancient Shankaracharya Math and sacred Narsingh Temple (winter abode of Lord Badrinath)."
      ],
      overnightStay: "Joshimath / Rudraprayag",
      photoUrl: "/gallery/joshimath_stay.jpeg",
      photoCaption: "Scenic Mountain Route to Joshimath Gateway & Valley View Stay"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Day 04",
      route: "Joshimath → Auli Cable Car, Snow Skiing Slopes & Gorson Bugyal → Joshimath / Rudraprayag",
      activities: [
        "Full-day snow adventure in Auli! Take the scenic ropeway (cable car) from Joshimath or mountain taxi up to Auli slopes.",
        "Marvel at the up-close grandeur of Mt. Nanda Devi (India's second highest mountain), Hathi-Ghodi Parvat, and Dunagiri.",
        "Partake in skiing, snowboarding, chairlift rides, or snow trek to Gorson Bugyal meadow.",
        "Witness an unforgettable alpine sunset before returning to hotel in Joshimath / Rudraprayag for dinner and overnight stay."
      ],
      overnightStay: "Joshimath / Rudraprayag",
      photoUrl: "/gallery/auli_ropeway.jpg",
      photoCaption: "Auli Cable Car (Asia's Longest Ropeway)",
      photoUrl2: "/gallery/auli_skiing.jpg",
      photoCaption2: "Auli Snow Skiing Slopes & Nanda Devi Panoramas"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "Day 05",
      route: "Joshimath / Rudraprayag → Karnaprayag → Maa Dhari Devi → Rishikesh → Haridwar Drop",
      activities: [
        "Post breakfast, check out and begin the return journey along the Alaknanda river valley.",
        "Stop at Karnaprayag Sangam and pay obeisance at the holy Maa Dhari Devi Temple near Srinagar.",
        "Arrive at Rishikesh for brief sightseeing (Ram Jhula / Triveni Ghat) followed by drop at Haridwar Railway Station or Dehradun Airport."
      ],
      overnightStay: "Tour Concludes (Sweet Winter Memories)",
      photoUrl: "/gallery/rishikesh_ganga_aarti.webp",
      photoCaption: "Sacred Maa Dhari Devi & Rishikesh Maha Ganga Aarti"
    }
  ],

  pricingSubtitle: "Special 5D/4N Winter Snow Circuit: 2 Nights Ukhimath/Chopta + 2 Nights Joshimath/Rudraprayag.",
  pricingTiers: [
    { package: "Deluxe Snow Package", price: "₹ 13,500 / Pax", totalPackagePrice: "₹ 13,500 / Pax (Twin Sharing)", hotelCategory: "Deluxe Mountain View Hotels / Cottages", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Mountain Vehicle + Tungnath Trek + Auli Excursion" },
    { package: "Premium Winter Package", price: "₹ 17,500 / Pax", totalPackagePrice: "₹ 17,500 / Pax (Twin Sharing)", hotelCategory: "Premium 3-Star Resorts with Heating Amenities", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Innova/Crysta + Bonfire + Microspikes" }
  ],
  pricingNote: "Note: Rates per person on twin/triple sharing. Cable car tickets & ski rentals payable on spot as per personal choice.",

  inclusions: [
    "Dedicated Hill Vehicle (Dzire / Ertiga / Innova / Tempo Traveller) Haridwar to Haridwar",
    "02 Nights Stay in Ukhimath / Chopta (Deluxe Swiss Tent or Mountain Resort)",
    "02 Nights Stay in Joshimath / Rudraprayag (Deluxe Mountain View Rooms)",
    "Daily Wholesome Breakfast and Warm Dinner at hotels (MAP Plan)",
    "All Driver Allowance, Mountain Tolls, Interstate Taxes, and Parking fees",
    "Sightseeing & Excursions: Chopta Bugyal, Tungnath Temple, Chandrashila, Auli Snow Slopes, Narsingh Temple, Devprayag & Dhari Devi"
  ],
  exclusions: [
    "Auli ropeway / chairlift tickets, ski rental & instructor charges",
    "Personal porter, pony/mule hire for snow trek, room heater extras",
    "Lunches, beverages, laundry, tips, and personal insurance",
    "Costs arising due to heavy snowfall roadblocks, landslides, or emergency diversions"
  ],

  goodToKnow: [
    "Both Chopta and Auli experience heavy snow from Dec to Feb. Waterproof trekking boots, heavy thermals, down jackets, and woollen caps are mandatory.",
    "Night temperatures often drop below 0°C; hotels provide warm blankets and hot water services.",
    "Confirmed Stays: 1st & 2nd Night at Ukhimath/Chopta; 3rd & 4th Night at Joshimath/Rudraprayag."
  ],
  bookingPayment: [
    "Booking confirmed upon advance deposit; balance payable before journey start.",
    "Complete digital itinerary, booking voucher, and driver contact shared before departure."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    { id: "ph-act-1", url: "/gallery/chopta_snow_meadows.jpg", caption: "Chopta Snow-Covered Alpine Meadows" },
    { id: "ph-act-2", url: "/gallery/tungnath_temple_snow.jpg", caption: "Shri Tungnath Temple in Winter Snow" },
    { id: "ph-act-3", url: "/gallery/auli_ropeway.jpg", caption: "Auli Cable Car & Iconic Ropeway View" },
    { id: "ph-act-4", url: "/gallery/auli_skiing.jpg", caption: "Auli Snow Slopes & Skiing Adventure" },
    { id: "ph-act-5", url: "/gallery/chandrashila_summit.jpg", caption: "Chandrashila Peak 360° Snow Panorama" },
    { id: "ph-act-6", url: "/gallery/joshimath_stay.jpeg", caption: "Joshimath Town & Scenic Stays" }
  ],
  hotelPhotos: WINTER_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// 5. Auli + Chopta + Tungnath + Mussoorie (6D/5N) - 1st Mussoorie, 2nd & 3rd Ukhimath, 4th Joshimath, 5th Joshimath/Rudraprayag
export const AULI_CHOPTA_TUNGNATH_MUSSOORIE_6D_PRESET: ItineraryData = {
  title: "AULI, CHOPTA, TUNGNATH & MUSSOORIE GRAND WINTER TOUR 2026-27",
  subTitle: "COMPLETE UTTARAKHAND WINTER LEISURE & SNOW EXPEDITION",
  spiritualHeadline: "6 Days · 05 Nights Hills, Snow Slopes & Himalayan Treks",
  dhamsSubtitle: "Mussoorie · Tehri Lake · Chopta · Tungnath · Joshimath · Auli",
  preparedFor: "Valued Travelers / Grand Winter Holiday Group",
  travelDates: "Nov 2026 – Mar 2027 Winter Season",
  duration: "6 Days / 05 Nights",
  startingPoint: "Dehradun / Haridwar / Delhi NCR",
  routeCovered: "Dehradun – Mussoorie – Tehri Dam – Srinagar – Ukhimath – Chopta – Tungnath – Joshimath – Auli – Joshimath/Rudraprayag – Haridwar",
  overviewSummary: "The crowning jewel of Uttarakhand winter holidays! Covers the colonial charm, Kempty Falls, and winterline sunsets of Mussoorie, followed by the snow trails of Chopta-Tungnath-Chandrashila, and culminating at the world-class skiing slopes and cable car of Auli with majestic views of Mt. Nanda Devi.",
  
  glanceDuration: "6 Days / 05 Nights",
  glanceDhams: "Mussoorie · Chopta · Tungnath · Auli",
  glanceSector: "Dehradun / Haridwar ⇄ Complete Winter Circuit",
  glanceStartEnd: "Dehradun / Haridwar",
  glancePackages: "Grand Winter Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Day 01",
      route: "Dehradun / Haridwar Pickup → Mussoorie ('Queen of the Hills')",
      activities: [
        "Morning pickup from Dehradun Railway Station / Airport or Haridwar; scenic drive up to Mussoorie.",
        "Visit cascading Kempty Falls and historic Company Garden.",
        "Check in at hotel in Mussoorie. In the evening, enjoy a sunset stroll on Mall Road and Camel's Back Road with panoramic views of the famous winterline."
      ],
      overnightStay: "Mussoorie",
      photoUrl: "/gallery/mussoorie_winterline.jpeg",
      photoCaption: "Mussoorie Rare Winterline Sunset Phenomenon"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Day 02",
      route: "Mussoorie → Dhanaulti Pine Forests → Tehri Lake Route → Ukhimath",
      activities: [
        "Post breakfast, check out from Mussoorie and embark on a breathtaking mountain drive via Dhanaulti and Chamba.",
        "Witness the vast blue expanse of Tehri Dam lake reservoir and traverse through Srinagar into Mandakini valley.",
        "Arrive at serene Ukhimath by late afternoon; check in at hotel/resort. Visit ancient Omkareshwar Temple (winter seat of Kedarnath).",
        "Enjoy evening bonfire, dinner, and overnight stay in Ukhimath."
      ],
      overnightStay: "Ukhimath",
      photoUrl: "/gallery/ukhimath_temple.png",
      photoCaption: "Tehri Lake Route & Ukhimath Omkareshwar Temple"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "Day 03",
      route: "Ukhimath → Chopta Base → Tungnath Temple & Chandrashila Snow Trek → Ukhimath",
      activities: [
        "Early morning transfer to Chopta (Mini Switzerland of Uttarakhand) surrounded by snow-blanketed rhododendron forests.",
        "Trek up the snowy trail to Tungnath Temple (12,073 ft), the highest Shiva shrine on Earth.",
        "Continue to Chandrashila Peak (13,123 ft) for an awe-inspiring 360-degree panorama of Chaukhamba, Nanda Devi, and Trishul ranges.",
        "Descend back to Chopta base by afternoon and return to hotel/resort in Ukhimath for delicious hot dinner and relaxation."
      ],
      overnightStay: "Ukhimath",
      photoUrl: "/gallery/tungnath_temple_snow.jpg",
      photoCaption: "Shri Tungnath Temple in Snow & Chandrashila Peak Trek",
      photoUrl2: "/gallery/chandrashila_summit.jpg",
      photoCaption2: "Chandrashila Summit 360° Himalayan Panorama"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Day 04",
      route: "Ukhimath → Chamoli Valley & Mandal → Joshimath → Auli Snow Slopes",
      activities: [
        "Post breakfast, check out and drive towards Joshimath via the picturesque Mandal forest valley.",
        "Arrive in Joshimath and check in at hotel. Proceed to Auli via the iconic Auli Cable Car (ropeway) or local mountain cab.",
        "Spend the afternoon marveling at the snow-laden slopes, practicing skiing, or taking in the up-close views of Mt. Nanda Devi.",
        "Return to Joshimath hotel for dinner and overnight stay."
      ],
      overnightStay: "Joshimath",
      photoUrl: "/gallery/joshimath_stay.jpeg",
      photoCaption: "Joshimath Town & Alpine Valley View Stays"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "Day 05",
      route: "Joshimath → Auli Gorson Bugyal / Narsingh Temple → Joshimath / Rudraprayag",
      activities: [
        "Morning excursion to Gorson Bugyal snow meadow or chairlift ride in Auli.",
        "Visit sacred Narsingh Temple in Joshimath (winter seat of Lord Badri Vishal) and Shankaracharya Math.",
        "Leisurely drive to Joshimath / Rudraprayag hotel; check in and unwind with hot tea and mountain dinner."
      ],
      overnightStay: "Joshimath / Rudraprayag",
      photoUrl: "/gallery/auli_ropeway.jpg",
      photoCaption: "Auli Cable Car Ropeway & Snow Skiing Slopes",
      photoUrl2: "/gallery/auli_skiing.jpg",
      photoCaption2: "Thrilling Auli Skiing & Snowboard Meadows"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Day 06",
      route: "Joshimath / Rudraprayag → Devprayag Sangam → Rishikesh → Haridwar / Dehradun Drop",
      activities: [
        "After breakfast, check out and drive down along the Alaknanda river valley.",
        "En route stop at Devprayag to witness the sacred confluence of Alaknanda and Bhagirathi forming holy river Ganga.",
        "Pass through Rishikesh with optional visit to Ram Jhula / Triveni Ghat before timely drop at Haridwar Railway Station or Dehradun Airport."
      ],
      overnightStay: "Tour Concludes (Sweet Winter Memories)",
      photoUrl: "/gallery/rishikesh_ganga_aarti.webp",
      photoCaption: "Maha Ganga Aarti at Triveni Ghat & Tour Conclusion"
    }
  ],

  pricingSubtitle: "Special 6D/5N Grand Winter Tour: 1st Night Mussoorie, 2nd & 3rd Ukhimath, 4th Joshimath, 5th Joshimath/Rudraprayag.",
  pricingTiers: [
    { package: "Grand Deluxe Package", price: "₹ 16,500 / Pax", totalPackagePrice: "₹ 16,500 / Pax (Twin Sharing)", hotelCategory: "Deluxe 3-Star Hotels & Mountain Resorts", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Private Vehicle + Full Hills & Snow Circuit" },
    { package: "Grand Premium Package", price: "₹ 21,500 / Pax", totalPackagePrice: "₹ 21,500 / Pax (Twin Sharing)", hotelCategory: "Premium 3/4-Star Hotels with Heating", meals: "Breakfast & Dinner (MAP)", specialFeature: "Dedicated Innova Crysta + Mall Road Hotel + Bonfire" }
  ],
  pricingNote: "Note: Rates per person on twin/triple sharing. Cable car/ropeway, snow equipment rentals and personal activities payable directly on spot.",

  inclusions: [
    "Dedicated Mountain Vehicle (Dzire / Ertiga / Innova / Tempo Traveller) throughout the 6-day circuit",
    "01 Night Stay in Mussoorie (Deluxe Room)",
    "02 Nights Stay in Ukhimath (Deluxe Mountain Resort / Swiss Cottage)",
    "01 Night Stay in Joshimath (Deluxe Room)",
    "01 Night Stay in Joshimath / Rudraprayag (Deluxe Room)",
    "Daily Breakfast and Warm Dinner at hotels (MAP Plan)",
    "All Driver Batta, Mountain Tolls, State Taxes, and Parking fees",
    "Complete Sightseeing: Mussoorie Mall Road, Kempty Falls, Tehri Lake, Ukhimath Omkareshwar, Chopta & Tungnath Trek, Joshimath, Auli Snow Slopes, Devprayag Sangam"
  ],
  exclusions: [
    "Auli ropeway / chairlift tickets, skiing gear & instructor fee",
    "Mussoorie ropeway, garden entry fees, pony/mule charges",
    "Lunches, mid-day snacks, beverages, room heaters, tips",
    "Contingency costs due to roadblocks or weather delays"
  ],

  goodToKnow: [
    "Exact Night Stays: 1st Night in Mussoorie, 2nd & 3rd in Ukhimath, 4th in Joshimath, 5th in Joshimath/Rudraprayag.",
    "Winter in higher Garhwal requires multi-layered warm clothing, thermals, fleece jackets, waterproof gloves, and sturdy snow boots.",
    "Scenic mountain driving times can vary depending on snowfall; our experienced hill drivers prioritize safety at all times."
  ],
  bookingPayment: [
    "Deposit advance payment to reserve hill properties and mountain vehicle.",
    "Remaining balance payable on arrival with formal GST tax invoice and yatra voucher."
  ],

  contactAgency: "Travel to Uttarakhand",
  contactPerson: "Mr. Amit kumar",
  contactPhone: "+91 9719038278",
  motto: "जय बद्री विशाल · ॐ नमः शिवाय",

  photos: [
    { id: "ph-actm-1", url: "/gallery/mussoorie_winterline.jpeg", caption: "Mussoorie Rare Winterline Sunset Spectacle" },
    { id: "ph-actm-2", url: "/gallery/chopta_snow_meadows.jpg", caption: "Chopta Snow-Covered Alpine Meadows" },
    { id: "ph-actm-3", url: "/gallery/tungnath_temple_snow.jpg", caption: "Shri Tungnath Temple in Winter Snow" },
    { id: "ph-actm-4", url: "/gallery/auli_ropeway.jpg", caption: "Auli Cable Car & Iconic Ropeway View" },
    { id: "ph-actm-5", url: "/gallery/auli_skiing.jpg", caption: "Auli Snow Slopes & Skiing Adventure" },
    { id: "ph-actm-6", url: "/gallery/mussoorie_mall_road.webp", caption: "Mussoorie Mall Road & Misty Hills" },
    { id: "ph-actm-7", url: "/gallery/kempty_falls.avif", caption: "Cascading Kempty Falls Mussoorie" },
    { id: "ph-actm-8", url: "/gallery/joshimath_stay.jpeg", caption: "Joshimath Town & Scenic Stays" }
  ],
  hotelPhotos: WINTER_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

const CURATED_PHOTO_PRESETS = [
  {
    id: "preset-all4-real",
    url: "/gallery/chardham_10d_img_1.jpg",
    caption: "4 Dhams Sacred Shrines"
  },
  {
    id: "preset-kedarnath-real",
    url: "/gallery/chardham_10d_img_13.jpg",
    caption: "Shri Kedarnath Temple Entrance"
  },
  {
    id: "preset-badrinath-real",
    url: "/gallery/chardham_10d_img_15.jpg",
    caption: "Holy Shri Badrinath Ji Temple"
  },
  {
    id: "preset-gangotri-real",
    url: "/gallery/chardham_10d_img_8.jpg",
    caption: "Shri Gangotri Dham Temple"
  },
  {
    id: "preset-heli-real",
    url: "/gallery/chardham_10d_img_9.jpg",
    caption: "Kedarnath Helicopter Shuttle"
  },
  {
    id: "preset-chopta-real",
    url: "/gallery/chardham_10d_img_14.jpg",
    caption: "Chopta Tungnath Alpine Ridge"
  },
  {
    id: "preset-dharidevi-real",
    url: "/gallery/chardham_10d_img_18.jpg",
    caption: "Maa Dhari Devi Sacred Temple"
  },
  {
    id: "preset-aarti",
    url: "/gallery/chardham_10d_img_19.jpg",
    caption: "Sacred Devprayag Sangam & Himalayan Confluence"
  },
  {
    id: "preset-group",
    url: "/gallery/chardham_10d_img_4.jpg",
    caption: "Pilgrimage Group & Tempo Traveller"
  },
  // ❄️ Winter Specials Presets
  {
    id: "preset-auli-ropeway-winter",
    url: "/gallery/auli_ropeway.jpg",
    caption: "Auli Cable Car & Ropeway"
  },
  {
    id: "preset-auli-skiing-winter",
    url: "/gallery/auli_skiing.jpg",
    caption: "Auli Snow Slopes & Skiing"
  },
  {
    id: "preset-chopta-meadows-winter",
    url: "/gallery/chopta_snow_meadows.jpg",
    caption: "Chopta Snow-Covered Alpine Meadows"
  },
  {
    id: "preset-tungnath-winter-snow",
    url: "/gallery/tungnath_temple_snow.jpg",
    caption: "Tungnath Temple Winter Snow"
  },
  {
    id: "preset-chandrashila-summit-winter",
    url: "/gallery/chandrashila_summit.jpg",
    caption: "Chandrashila Peak Snow Summit"
  },
  {
    id: "preset-ukhimath-temple-winter",
    url: "/gallery/ukhimath_temple.png",
    caption: "Ukhimath Omkareshwar Temple"
  },
  {
    id: "preset-mussoorie-winterline",
    url: "/gallery/mussoorie_winterline.jpeg",
    caption: "Mussoorie Rare Winterline Sunset"
  },
  {
    id: "preset-mussoorie-mall",
    url: "/gallery/mussoorie_mall_road.webp",
    caption: "Mussoorie Mall Road & Misty Hills"
  },
  {
    id: "preset-kempty-falls",
    url: "/gallery/kempty_falls.avif",
    caption: "Cascading Kempty Falls Mussoorie"
  },
  {
    id: "preset-rishikesh-aarti",
    url: "/gallery/rishikesh_ganga_aarti.webp",
    caption: "Maha Ganga Aarti Triveni Ghat"
  },
  {
    id: "preset-rishikesh-jhula",
    url: "/gallery/rishikesh_ram_jhula.png",
    caption: "Ram Jhula Bridge over River Ganga"
  },
  {
    id: "preset-joshimath-stay",
    url: "/gallery/joshimath_stay.jpeg",
    caption: "Joshimath Town & Scenic Stays"
  }
];

export default function ItineraryBuilder() {
  const [data, setData] = useState<ItineraryData>(CHARDHAM_PRESET);
  const [activeTab, setActiveTab] = useState<"overview" | "days" | "pricing" | "photos" | "inclusions" | "contact">("overview");
  
  // Custom Photo Input state
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photoCaptionInput, setPhotoCaptionInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dham Photo Gallery & AI Smart Selection state
  const [dhamGallery, setDhamGallery] = useState<DhamGalleryPhoto[]>([]);
  const [selectedDhamCategory, setSelectedDhamCategory] = useState<string>("all");
  const [newDhamUploadTag, setNewDhamUploadTag] = useState<DhamGalleryPhoto["dham"]>("kedarnath");
  const [newDhamUploadUrl, setNewDhamUploadUrl] = useState("");
  const [newDhamUploadCaption, setNewDhamUploadCaption] = useState("");
  const [aiPhotoNotification, setAiPhotoNotification] = useState<string | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryModalCategory, setGalleryModalCategory] = useState<string>("all");
  const [customPhotosBannerDismissed, setCustomPhotosBannerDismissed] = useState(false);
  const dhamFileInputRef = useRef<HTMLInputElement>(null);

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
  const [keySavedNotification, setKeySavedNotification] = useState(false);
  
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

  // Fetch API key from permanent local storage, env variable, cache or Supabase settings
  useEffect(() => {
    // 1. Direct read from permanent localStorage key
    if (typeof window !== "undefined") {
      try {
        const storedKey = localStorage.getItem("triloki_gemini_api_key");
        if (storedKey && storedKey.trim()) {
          setApiKey(storedKey.trim());
          setDhamGallery(getStoredDhamGallery());
          return;
        }

        const cachedSettings = localStorage.getItem("triloki_settings_cache");
        if (cachedSettings) {
          const parsed = JSON.parse(cachedSettings);
          if (parsed.openai_key && parsed.openai_key.trim()) {
            setApiKey(parsed.openai_key.trim());
            localStorage.setItem("triloki_gemini_api_key", parsed.openai_key.trim());
            setDhamGallery(getStoredDhamGallery());
            return;
          }
        }
      } catch {}
    }

    // 2. Check if configured in Vercel/Environment variable
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (envKey && envKey.trim()) {
      setApiKey(envKey.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem("triloki_gemini_api_key", envKey.trim());
      }
      setDhamGallery(getStoredDhamGallery());
      return;
    }

    // 3. Fallback check from Supabase cloud settings
    async function fetchKey() {
      try {
        const { data: settings } = await supabase.from("settings").select("openai_key").limit(1).single();
        if (settings?.openai_key && settings.openai_key.trim()) {
          setApiKey(settings.openai_key.trim());
          if (typeof window !== "undefined") {
            localStorage.setItem("triloki_gemini_api_key", settings.openai_key.trim());
          }
        }
      } catch (err) {
        // silent fallback
      }
    }
    // 4. Fetch latest itinerary from local cache or cloud
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("triloki_current_itinerary");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.days)) {
            // Auto-migrate legacy 3-tier pricing to single Standard Package
            if (Array.isArray(parsed.pricingTiers) && parsed.pricingTiers.length > 1) {
              parsed.pricingTiers = [
                {
                  package: "Standard Package",
                  price: parsed.pricingTiers[0].price || "₹ 28,500 / Pax",
                  hotelCategory: parsed.pricingTiers[0].hotelCategory || "Standard Clean Rooms / Mountain Stays",
                  meals: parsed.pricingTiers[0].meals || "Breakfast & Dinner (MAP)",
                  specialFeature: parsed.pricingTiers[0].specialFeature || "Dedicated Hill Vehicle Included"
                }
              ];
              parsed.glancePackages = "Standard Package";
            }
            // Auto-migrate to Hindi blessing motto
            if (!parsed.motto || parsed.motto === "ॐ नमः शिवाय" || parsed.motto === "!! HAR HAR MAHADEV !!") {
              parsed.motto = "जय श्री केदार · जय बद्री विशाल";
            }
            // Auto-migrate hotel photos to real verified hotel photos
            if (Array.isArray(parsed.hotelPhotos)) {
              parsed.hotelPhotos = parsed.hotelPhotos.map((hp: any) => {
                if (hp.url === "/gallery/chardham_10d_img_32.jpg" || (hp.roomType?.toLowerCase().includes("tent") && hp.url?.includes("img_32"))) {
                  return { ...hp, url: "/gallery/kedarnath_alpine_tent.jpg" };
                }
                if (hp.url === "/gallery/chardham_10d_img_31.jpg") {
                  return { ...hp, url: "/hotels_custom/hotel_stay_2.jpeg", roomType: hp.roomType || "Standard Triple / Quad Room" };
                }
                if (hp.url === "/gallery/chardham_10d_img_29.jpg") {
                  return { ...hp, url: "/hotels_custom/hotel_stay_4.jpeg", roomType: hp.roomType || "Standard Double Room" };
                }
                if (hp.url === "/gallery/chardham_10d_img_30.jpg") {
                  return { ...hp, url: "/hotels_custom/hotel_stay_3.jpeg", roomType: hp.roomType || "Standard Family Room" };
                }
                return hp;
              });
            }
            // Auto-migrate trust & credentials photos with all 4 items
            if (
              !parsed.trustPhotos || 
              !parsed.trustPhotos.certificatePhoto || 
              !parsed.trustPhotos.certificatePhoto.trim() ||
              !parsed.trustPhotos.certificate2Photo ||
              parsed.trustPhotos.ownerPhoto?.includes("img_7")
            ) {
              parsed.trustPhotos = {
                ownerPhoto: parsed.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg",
                ownerName: parsed.trustPhotos?.ownerName || "Amit Chandra",
                ownerTitle: parsed.trustPhotos?.ownerTitle || "Founder & Managing Director",
                certificatePhoto: parsed.trustPhotos?.certificatePhoto?.trim() || "/certificates/uttrakhand_tourism.jpeg",
                certificateCaption: parsed.trustPhotos?.certificateCaption?.trim() || "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2024/007176",
                certificate2Photo: parsed.trustPhotos?.certificate2Photo?.trim() || "/certificates/certificate.jpeg",
                certificate2Caption: parsed.trustPhotos?.certificate2Caption?.trim() || "Dehradun Transport Authority License: 44/RT/2025",
                officePhoto: parsed.trustPhotos?.officePhoto || "/certificates/office_front.jpeg",
                officeCaption: parsed.trustPhotos?.officeCaption || "Booking Office: Pursharthi Market, Haridwar"
              };
              parsed.showTrustSection = true;
            }

            // Auto-migrate winter presets in localStorage
            if (parsed.title?.includes("AULI") || parsed.title?.includes("CHOPTA") || parsed.title?.includes("WINTER") || parsed.title?.includes("RISHIKESH")) {
              if (parsed.days && Array.isArray(parsed.days)) {
                parsed.days = parsed.days.map((d: any) => {
                  if (!d.photoUrl) {
                    if (d.route?.toLowerCase().includes("auli") || d.activities?.some((a: string) => a.toLowerCase().includes("auli") || a.toLowerCase().includes("skiing"))) {
                      d.photoUrl = "/gallery/auli_ropeway.jpg";
                      d.photoCaption = "Auli Cable Car (Asia's Longest Ropeway)";
                      d.photoUrl2 = "/gallery/auli_skiing.jpg";
                      d.photoCaption2 = "Auli Snow Skiing Slopes";
                    } else if (d.route?.toLowerCase().includes("tungnath") || d.activities?.some((a: string) => a.toLowerCase().includes("tungnath"))) {
                      d.photoUrl = "/gallery/tungnath_temple_snow.jpg";
                      d.photoCaption = "Highest Shiva Shrine Tungnath in Winter Snow";
                    } else if (d.route?.toLowerCase().includes("joshimath") || d.activities?.some((a: string) => a.toLowerCase().includes("joshimath"))) {
                      d.photoUrl = "/gallery/joshimath_stay.jpeg";
                      d.photoCaption = "Scenic Alaknanda Route & Joshimath Arrival";
                    } else if (d.route?.toLowerCase().includes("mussoorie")) {
                      d.photoUrl = "/gallery/mussoorie_winterline.jpeg";
                      d.photoCaption = "Mussoorie Winterline Sunset Spectacle";
                    } else if (d.route?.toLowerCase().includes("rishikesh")) {
                      d.photoUrl = "/gallery/rishikesh_ganga_aarti.webp";
                      d.photoCaption = "Sacred Maa Dhari Devi & Rishikesh Aarti";
                    }
                  }
                  return d;
                });
              }
              if (!parsed.hotelPhotos || parsed.hotelPhotos.length === 0 || parsed.hotelPhotos[0]?.location?.includes("Barkot")) {
                parsed.hotelPhotos = WINTER_HOTEL_PHOTO_PRESETS;
              }
            }

            setData(parsed);
          }
        } catch {}
      } else {
        const fetchCloudItin = async () => {
          try {
            const { data: cloudItin } = await supabase
              .from("itineraries")
              .select("document_data")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (cloudItin && cloudItin.document_data && Array.isArray((cloudItin.document_data as any).days)) {
              const cloudData = cloudItin.document_data as any;
              if (Array.isArray(cloudData.pricingTiers) && cloudData.pricingTiers.length > 1) {
                cloudData.pricingTiers = [
                  {
                    package: "Standard Package",
                    price: cloudData.pricingTiers[0].price || "₹ 28,500 / Pax",
                    hotelCategory: cloudData.pricingTiers[0].hotelCategory || "Standard Clean Rooms / Mountain Stays",
                    meals: cloudData.pricingTiers[0].meals || "Breakfast & Dinner (MAP)",
                    specialFeature: cloudData.pricingTiers[0].specialFeature || "Dedicated Hill Vehicle Included"
                  }
                ];
                cloudData.glancePackages = "Standard Package";
              }
              if (!cloudData.motto || cloudData.motto === "ॐ नमः शिवाय" || cloudData.motto === "!! HAR HAR MAHADEV !!") {
                cloudData.motto = "जय श्री केदार · जय बद्री विशाल";
              }
              if (Array.isArray(cloudData.hotelPhotos)) {
                cloudData.hotelPhotos = cloudData.hotelPhotos.map((hp: any) => {
                  if (hp.url === "/gallery/chardham_10d_img_32.jpg" || (hp.roomType?.toLowerCase().includes("tent") && hp.url?.includes("img_32"))) {
                    return { ...hp, url: "/gallery/kedarnath_alpine_tent.jpg" };
                  }
                  if (hp.url === "/gallery/chardham_10d_img_31.jpg") {
                    return { ...hp, url: "/hotels_custom/hotel_stay_2.jpeg", roomType: hp.roomType || "Standard Triple / Quad Room" };
                  }
                  if (hp.url === "/gallery/chardham_10d_img_29.jpg") {
                    return { ...hp, url: "/hotels_custom/hotel_stay_4.jpeg", roomType: hp.roomType || "Standard Double Room" };
                  }
                  if (hp.url === "/gallery/chardham_10d_img_30.jpg") {
                    return { ...hp, url: "/hotels_custom/hotel_stay_3.jpeg", roomType: hp.roomType || "Standard Family Room" };
                  }
                  return hp;
                });
              }
              if (
                !cloudData.trustPhotos || 
                !cloudData.trustPhotos.certificatePhoto || 
                !cloudData.trustPhotos.certificatePhoto.trim() ||
                !cloudData.trustPhotos.certificate2Photo
              ) {
                cloudData.trustPhotos = {
                  ownerPhoto: cloudData.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg",
                  ownerName: cloudData.trustPhotos?.ownerName || "Amit Chandra",
                  ownerTitle: cloudData.trustPhotos?.ownerTitle || "Founder & Managing Director",
                  certificatePhoto: cloudData.trustPhotos?.certificatePhoto?.trim() || "/certificates/uttrakhand_tourism.jpeg",
                  certificateCaption: cloudData.trustPhotos?.certificateCaption?.trim() || "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2024/007176",
                  certificate2Photo: cloudData.trustPhotos?.certificate2Photo?.trim() || "/certificates/certificate.jpeg",
                  certificate2Caption: cloudData.trustPhotos?.certificate2Caption?.trim() || "Dehradun Transport Authority License: 44/RT/2025",
                  officePhoto: cloudData.trustPhotos?.officePhoto || "/certificates/office_front.jpeg",
                  officeCaption: cloudData.trustPhotos?.officeCaption || "Booking Office: Pursharthi Market, Haridwar"
                };
                cloudData.showTrustSection = true;
              }
              setData(cloudData);
              localStorage.setItem("triloki_current_itinerary", JSON.stringify(cloudData));
            }
          } catch {}
        };
        fetchCloudItin();
      }
    }

    fetchKey();
    const storedGallery = getStoredDhamGallery();
    setDhamGallery(storedGallery);

    // Auto-sync user's custom uploaded photos from Gallery into current brochure
    const customPhotos = storedGallery.filter(p => p.isCustom);
    if (customPhotos.length > 0) {
      setData(prev => {
        const hasCustomAlready = (prev.photos || []).some(p => customPhotos.some(cp => cp.url === p.url));
        if (!hasCustomAlready) {
          const newPhotos: ItineraryPhoto[] = [
            ...customPhotos.map((cp, idx) => ({
              id: `custom-p-${Date.now()}-${idx}`,
              url: cp.url,
              caption: cp.caption,
              position: "center" as const,
              fit: "cover" as const
            })),
            ...(prev.photos || []).filter(p => !customPhotos.some(cp => cp.url === p.url))
          ].slice(0, 6);
          return { ...prev, photos: newPhotos };
        }
        return prev;
      });
    }
  }, []);

  // Save API Key permanently across browser and cloud
  const handleSaveApiKeyPermanently = async (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("triloki_gemini_api_key", trimmed);
        const cachedSettings = localStorage.getItem("triloki_settings_cache");
        const parsed = cachedSettings ? JSON.parse(cachedSettings) : {};
        localStorage.setItem("triloki_settings_cache", JSON.stringify({ ...parsed, openai_key: trimmed }));
      } catch (e) {}
    }

    try {
      await supabase.from("settings").update({ openai_key: trimmed }).neq("id", "none");
    } catch (e) {}

    setKeySavedNotification(true);
    setAiError("");
    setTimeout(() => {
      setKeySavedNotification(false);
      setShowKeyInput(false);
    }, 2200);
  };

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
      const systemPrompt = `You are an elite Indian luxury travel designer creating brochures for "Travel to Uttarakhand".
CRITICAL RULES:
1. Write in flawless, elegant British/Indian English. Absolutely ZERO spelling mistakes, grammatical errors, or garbled characters.
2. Under NO circumstance should you use weird symbols, unreadable encoding, or corrupted Unicode characters (e.g., do NOT output weird symbols like , special smart quotes, or corrupted apostrophes). Use only clean standard alphanumeric characters, commas, periods, hyphens (-), and simple arrows (→).
3. DAY NUMBERING: In the "days" array, "dayNumber" must be an integer (1, 2, 3...). In "dateStr", do NOT repeat the word "Day" or write "Day - Day 1" or "Day 1". Provide either an actual calendar date format (e.g. "Day 01 - Haridwar Arrival" or "15 May 2026 (Fri)") or just "Sightseeing & Transit".
4. ACTIVITIES: Each activity bullet must be a clean, well-formed sentence describing sightseeing, temple darshan, scenic drives, or night halts.
5. SIGHTSEEING ROUTE: Use clean arrow formatting like "Haridwar → Guptkashi → Kedarnath".
6. RETURN ONLY valid, raw JSON (strictly no markdown wrappers, no \`\`\`json).
7. SINGLE PACKAGE ONLY: In "pricingTiers", generate strictly ONE package tier titled "Standard Package". Never generate 3 packages or multiple package tiers.
8. BLESSING MOTTO: "motto" must strictly be in Hindi: "जय श्री केदार · जय बद्री विशाल". Only this blessing tagline must be used.
9. VEHICLE & NON-AC IN HILLS: In Uttarakhand mountain and hill areas, vehicle AC does NOT work due to steep mountain gradients and engine safety norms. In inclusions, transport details, and goodToKnow, strictly write "Dedicated Hill Vehicle (Innova Crysta / Tempo Traveller - Non-AC in hill areas)". NEVER write "AC vehicle" or "sanitised AC vehicle". All hill transport and hill hotel rooms must be strictly designated as Non-AC.
10. STANDARD PACKAGE BY DEFAULT & NO SPECIFIC HOTEL NAMES: 95% of guests choose Standard Package. Default hotelCategory strictly to "Standard Clean Rooms / Mountain Stays". Never use Deluxe by default. In hotel stays and itinerary description, never write specific private hotel names; always use generic verified stay descriptions like "Standard Clean Room at [Location]". In goodToKnow or booking terms, NEVER mention GST.

SCHEMA:
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
  "glancePackages": "Standard Package",
  "days": [
    {
      "dayNumber": 1,
      "dateStr": "Haridwar Arrival & Transit",
      "route": "Haridwar → Guptkashi",
      "activities": [
        "Morning pickup and scenic foothills drive along the Alaknanda river.",
        "Visit Devprayag and Rudraprayag holy river confluences.",
        "Evening arrival at Guptkashi and hotel check-in."
      ],
      "overnightStay": "Guptkashi"
    }
  ],
  "pricingSubtitle": "Confirmed Standard Package with dedicated mountain transport and standard clean accommodations.",
  "pricingTiers": [
    { "package": "Standard Package", "price": "₹ 24,500 / Pax", "hotelCategory": "Standard Clean Rooms / Mountain Stays", "meals": "Breakfast & Dinner (MAP)", "specialFeature": "Dedicated Vehicle & Sightseeing" }
  ],
  "pricingNote": "Note: Rates are per person on twin/triple sharing basis. All tolls, parking, and driver allowances included.",
  "inclusions": [
    "Dedicated Hill Vehicle (Innova Crysta / Tempo Traveller - Non-AC in hill areas) for entire tour",
    "Selected hotel accommodation with specified meal plan",
    "All toll taxes, parking fees and driver allowance",
    "24/7 on-ground assistance and registration support"
  ],
  "exclusions": [
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
  "contactPerson": "Mr. Amit kumar",
  "contactPhone": "+91 9719038278",
  "motto": "जय श्री केदार · जय बद्री विशाल"
}`;

      const cleanKey = apiKey.trim();
      let textResponse = "";
      let lastErrorMessage = "";

      // Provider 1: OpenRouter (sk-or-... or sk-...)
      if (cleanKey.startsWith("sk-or-") || cleanKey.startsWith("sk-")) {
        const openRouterModels = [
          "openrouter/free",
          "nex-agi/nex-n2.5-pro:free",
          "inclusionai/ling-3.0-flash-vl:free",
          "nvidia/nemotron-3.5-lightning:free",
          "qwen/qwen3.8-27b:free",
          "openrouter/auto"
        ];

        let openRouterSuccess = false;
        for (const orModel of openRouterModels) {
          try {
            const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${cleanKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://traveltouttrakhand-crm.vercel.app",
                "X-Title": "Travel to Uttarakhand CRM"
              },
              body: JSON.stringify({
                model: orModel,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: `Generate a complete itinerary package for: ${prompt}` }
                ],
                temperature: 0.7
              })
            });

            if (orRes.ok) {
              const orJson = await orRes.json();
              textResponse = orJson.choices?.[0]?.message?.content?.trim() || "";
              if (textResponse) {
                openRouterSuccess = true;
                break;
              }
            } else {
              const errData = await orRes.json().catch(() => null);
              lastErrorMessage = errData?.error?.message || `OpenRouter error status ${orRes.status}`;
            }
          } catch (e: any) {
            lastErrorMessage = e?.message || "OpenRouter network request failed";
          }
        }

        if (!openRouterSuccess || !textResponse) {
          throw new Error(lastErrorMessage || "OpenRouter API request failed across available models.");
        }
      } 
      // Provider 2: Hugging Face (hf_...)
      else if (cleanKey.startsWith("hf_")) {
        try {
          const hfRes = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${cleanKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "Qwen/Qwen2.5-72B-Instruct",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate a complete itinerary package for: ${prompt}` }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7
            })
          });

          if (hfRes.ok) {
            const hfJson = await hfRes.json();
            textResponse = hfJson.choices?.[0]?.message?.content?.trim() || "";
          } else {
            const errData = await hfRes.json().catch(() => null);
            throw new Error(errData?.error || `Hugging Face error status ${hfRes.status}`);
          }
        } catch (e: any) {
          throw new Error(e?.message || "Hugging Face request failed");
        }
      } 
      // Provider 3: Google Gemini API (Standard)
      else {
        let candidateModels: string[] = [];
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
          if (listRes.ok) {
            const listJson = await listRes.json();
            if (Array.isArray(listJson?.models)) {
              candidateModels = listJson.models
                .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
                .map((m: any) => m.name.replace(/^models\//, ""))
                .sort((a: string, b: string) => {
                  const getScore = (name: string) => {
                    let score = 0;
                    if (name.includes("flash")) score += 20;
                    if (name.includes("3.8")) score += 9;
                    else if (name.includes("3.7")) score += 8;
                    else if (name.includes("3.6")) score += 7;
                    else if (name.includes("3.5")) score += 6;
                    else if (name.includes("3.1")) score += 5;
                    else if (name.includes("2.5")) score += 4;
                    else if (name.includes("2.0")) score += 2;
                    return score;
                  };
                  return getScore(b) - getScore(a);
                });
            }
          }
        } catch {}

        const fallbackList = [
          "gemini-3.8-flash",
          "gemini-3.7-flash",
          "gemini-3.5-flash",
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
          "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-2.5-pro",
          "gemini-2.0-flash"
        ];

        const modelsToTry = Array.from(new Set([...candidateModels, ...fallbackList]));
        let geminiResponse: Response | null = null;

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
              geminiResponse = res;
              break;
            } else {
              const errData = await res.json().catch(() => null);
              lastErrorMessage = errData?.error?.message || `Status ${res.status}`;
            }
          } catch (e: any) {
            lastErrorMessage = e?.message || "Network request failed";
          }
        }

        if (!geminiResponse || !geminiResponse.ok) {
          throw new Error(lastErrorMessage || "Gemini API request failed across available models.");
        }

        const resJson = await geminiResponse.json();
        textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      }

      if (!textResponse) {
        throw new Error("No response generated from AI API. Please verify your API key and quota.");
      }

      // Sanitize JSON text
      const cleanJson = textResponse.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleanJson);

      // Helper to clean up any unwanted symbols, corrupted encodings, or garbled quotes
      const cleanText = (str: string): string => {
        if (!str || typeof str !== "string") return "";
        return str
          .replace(/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "") // Remove unprintable / replacement chars
          .replace(/[‘’]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/â|â|â€“|â€”/g, "–")
          .replace(/â€™|â€˜/g, "'")
          .replace(/â€œ|â€/g, '"')
          .trim();
      };

      // Helper to clean up day dateStr and avoid "Day - Day 1" or double "Day 1"
      const formatDayDateStr = (rawStr: any, dayIndex: number): string => {
        if (!rawStr || typeof rawStr !== "string") return `Day ${dayIndex + 1}`;
        let cleaned = cleanText(rawStr);
        // Remove repetitive "Day - Day 1", "Day - Day", "Day 1 - Day 1", etc.
        cleaned = cleaned.replace(/^Day\s*[-–:]*\s*Day\s*\d*\s*[-–:]*\s*/i, "");
        cleaned = cleaned.replace(/^Day\s*\d+\s*[-–:]*\s*/i, "");
        cleaned = cleaned.replace(/^Day\s*\d+$/i, "");
        cleaned = cleaned.trim();
        return cleaned || `Day ${dayIndex + 1}`;
      };

      // Validate & merge with default fallback fields
      const newDays: DayPlan[] = (parsed.days || []).map((d: any, idx: number) => {
        const rawActivities = Array.isArray(d.activities) ? d.activities : [d.description || "Sightseeing and travel."];
        const cleanedActivities = rawActivities
          .map((act: any) => cleanText(String(act)))
          .filter((act: string) => act.length > 0);

        return {
          id: Date.now() + idx,
          dayNumber: idx + 1,
          dateStr: formatDayDateStr(d.dateStr, idx),
          route: cleanText(d.route || "Tour Route"),
          activities: cleanedActivities.length > 0 ? cleanedActivities : ["Sightseeing and travel."],
          overnightStay: cleanText(d.overnightStay || "Hotel")
        };
      });

      // Auto-pick matching photos from the Dham Photo Gallery for the generated itinerary
      const activeGallery = dhamGallery.length > 0 ? dhamGallery : getStoredDhamGallery();
      const matchedPhotos = pickDhamPhotosForItinerary(parsed, activeGallery);

      const cleanArray = (arr: any): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => cleanText(String(item))).filter(Boolean);
      };

      setData(prev => {
        const nextData = {
          ...prev,
          title: cleanText(parsed.title) || prev.title,
          subTitle: cleanText(parsed.subTitle) || prev.subTitle,
          spiritualHeadline: cleanText(parsed.spiritualHeadline) || prev.spiritualHeadline,
          dhamsSubtitle: cleanText(parsed.dhamsSubtitle) || prev.dhamsSubtitle,
          preparedFor: cleanText(parsed.preparedFor) || prev.preparedFor,
          travelDates: cleanText(parsed.travelDates) || prev.travelDates,
          duration: cleanText(parsed.duration) || prev.duration,
          startingPoint: cleanText(parsed.startingPoint) || prev.startingPoint,
          routeCovered: cleanText(parsed.routeCovered) || prev.routeCovered,
          overviewSummary: cleanText(parsed.overviewSummary) || prev.overviewSummary,
          glanceDuration: cleanText(parsed.glanceDuration || parsed.duration) || prev.glanceDuration,
          glanceDhams: cleanText(parsed.glanceDhams) || prev.glanceDhams,
          glanceSector: cleanText(parsed.glanceSector) || prev.glanceSector,
          glanceStartEnd: cleanText(parsed.glanceStartEnd) || prev.glanceStartEnd,
          glancePackages: "Standard Package",
          days: newDays.length > 0 ? newDays : prev.days,
          photos: matchedPhotos.length > 0 ? matchedPhotos : prev.photos,
          pricingSubtitle: cleanText(parsed.pricingSubtitle) || "Confirmed Standard Package with dedicated mountain transport and standard clean stays.",
          pricingTiers: Array.isArray(parsed.pricingTiers) && parsed.pricingTiers.length > 0 
            ? [
                {
                  package: "Standard Package",
                  price: cleanText(parsed.pricingTiers[0].price) || "₹ 24,500 / Pax",
                  hotelCategory: cleanText(parsed.pricingTiers[0].hotelCategory) || "Standard Clean Rooms / Mountain Stays",
                  meals: cleanText(parsed.pricingTiers[0].meals) || "Breakfast & Dinner (MAP)",
                  specialFeature: cleanText(parsed.pricingTiers[0].specialFeature) || "Dedicated Vehicle & Sightseeing"
                }
              ]
            : prev.pricingTiers,
          pricingNote: cleanText(parsed.pricingNote) || prev.pricingNote,
          inclusions: cleanArray(parsed.inclusions).length > 0 ? cleanArray(parsed.inclusions) : prev.inclusions,
          exclusions: cleanArray(parsed.exclusions).length > 0 ? cleanArray(parsed.exclusions) : prev.exclusions,
          goodToKnow: cleanArray(parsed.goodToKnow).length > 0 ? cleanArray(parsed.goodToKnow) : prev.goodToKnow,
          bookingPayment: cleanArray(parsed.bookingPayment).length > 0 ? cleanArray(parsed.bookingPayment) : prev.bookingPayment,
          motto: "जय श्री केदार · जय बद्री विशाल"
        };

        // Automatically store the latest active itinerary into localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("triloki_current_itinerary", JSON.stringify(nextData));
          } catch (e) {}
        }

        return nextData;
      });

      if (matchedPhotos.length > 0) {
        setAiPhotoNotification(`✨ AI Auto-Matched ${matchedPhotos.length} Dham photos from Gallery for this tour.`);
      }

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

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: ItineraryPhoto[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          newPhotos.push({
            id: `photo-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64,
            caption: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
          });
        }
        processedCount++;
        if (processedCount === files.length) {
          setData(prev => ({
            ...prev,
            photos: [...(prev.photos || []), ...newPhotos]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleAddPhotoByUrl = () => {
    if (!photoUrlInput.trim()) return;
    const newPhoto: ItineraryPhoto = {
      id: `photo-${Date.now()}`,
      url: photoUrlInput.trim(),
      caption: photoCaptionInput.trim() || "Spiritual Sightseeing Highlight"
    };
    setData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto]
    }));
    setPhotoUrlInput("");
    setPhotoCaptionInput("");
  };

  const handleAddPresetPhoto = (preset: typeof CURATED_PHOTO_PRESETS[0]) => {
    const newPhoto: ItineraryPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: preset.url,
      caption: preset.caption
    };
    setData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto]
    }));
  };

  const handleUpdatePhotoCaption = (id: string, caption: string) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).map(p => p.id === id ? { ...p, caption } : p)
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p.id !== id)
    }));
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    const current = [...(data.photos || [])];
    if (direction === "up" && index > 0) {
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
    } else if (direction === "down" && index < current.length - 1) {
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
    }
    setData(prev => ({ ...prev, photos: current }));
  };

  // Dham Photo Gallery Handlers
  const handleAutoMatchPhotos = () => {
    const activeGallery = dhamGallery.length > 0 ? dhamGallery : getStoredDhamGallery();
    const matched = pickDhamPhotosForItinerary(data, activeGallery);
    if (matched.length > 0) {
      setData(prev => ({ ...prev, photos: matched }));
      setAiPhotoNotification(`✨ AI auto-matched ${matched.length} Dham photos for your itinerary.`);
      setTimeout(() => setAiPhotoNotification(null), 4500);
    }
  };

  const handleTogglePhotoInBrochure = (photo: DhamGalleryPhoto) => {
    const current = data.photos || [];
    const exists = current.some(p => p.url === photo.url);
    if (exists) {
      setData(prev => ({
        ...prev,
        photos: (prev.photos || []).filter(p => p.url !== photo.url)
      }));
    } else {
      const newPhoto: ItineraryPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: photo.url,
        caption: photo.caption,
        position: "center",
        fit: "cover"
      };
      setData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), newPhoto]
      }));
    }
  };

  const handleApplyAllCustomUploads = () => {
    const activeGallery = dhamGallery.length > 0 ? dhamGallery : getStoredDhamGallery();
    const customPhotos = activeGallery.filter(p => p.isCustom);
    if (customPhotos.length === 0) {
      alert("No custom photos found in gallery. You can upload them in the Dham Photo Library tab!");
      return;
    }
    const newPhotos: ItineraryPhoto[] = customPhotos.map((cp, idx) => ({
      id: `custom-p-${Date.now()}-${idx}`,
      url: cp.url,
      caption: cp.caption,
      position: "center",
      fit: "cover"
    }));
    // Fill remaining up to 6 with existing or landmark photos
    const existingRemaining = (data.photos || []).filter(p => !customPhotos.some(cp => cp.url === p.url));
    const merged = [...newPhotos, ...existingRemaining].slice(0, 6);
    setData(prev => ({ ...prev, photos: merged }));
    setAiPhotoNotification(`✓ Applied ${newPhotos.length} custom photo(s) from your gallery!`);
    setTimeout(() => setAiPhotoNotification(null), 4000);
  };

  const addHotelPhoto = () => {
    const newHp: HotelPhoto = {
      id: `hp-${Date.now()}`,
      url: "/gallery/chardham_10d_img_31.jpg",
      hotelName: "Standard Clean Stay",
      location: "Uttarakhand",
      roomType: "Standard Room",
      caption: "Clean sanitized room with attached bathroom and hot water",
      fit: "cover"
    };
    setData(prev => ({
      ...prev,
      hotelPhotos: [...(prev.hotelPhotos || []), newHp],
      showHotelPhotos: true
    }));
  };

  const updateHotelPhoto = (id: string, field: keyof HotelPhoto, value: any) => {
    setData(prev => ({
      ...prev,
      hotelPhotos: (prev.hotelPhotos || []).map(hp => hp.id === id ? { ...hp, [field]: value } : hp)
    }));
  };

  const removeHotelPhoto = (id: string) => {
    setData(prev => ({
      ...prev,
      hotelPhotos: (prev.hotelPhotos || []).filter(hp => hp.id !== id)
    }));
  };

  const loadCuratedHotelPhotos = () => {
    const isWinter = data.title.toLowerCase().includes("winter") || data.title.toLowerCase().includes("auli") || data.title.toLowerCase().includes("chopta");
    setData(prev => ({
      ...prev,
      hotelPhotos: isWinter ? WINTER_HOTEL_PHOTO_PRESETS : CURATED_HOTEL_PHOTO_PRESETS,
      showHotelPhotos: true
    }));
    setAiPhotoNotification(isWinter ? "✓ Loaded verified winter stay & alpine resort photos!" : "✓ Loaded verified hotel & camp photos preset!");
    setTimeout(() => setAiPhotoNotification(null), 4000);
  };

  const handleHotelFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateHotelPhoto(id, "url", base64);
        // Also save to custom uploads library in dhamGallery
        const newPhoto: DhamGalleryPhoto = {
          id: `custom-hotel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: base64,
          caption: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          dham: "custom",
          dhamLabel: "Custom Uploads",
          isCustom: true,
          createdAt: new Date().toISOString()
        };
        const updated = [newPhoto, ...dhamGallery];
        setDhamGallery(updated);
        saveStoredDhamGallery(updated);
        setAiPhotoNotification("✓ Hotel photo uploaded and applied to stay!");
        setTimeout(() => setAiPhotoNotification(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUploadNewStayPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const hotelName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        const newHp: HotelPhoto = {
          id: `hp-${Date.now()}`,
          url: base64,
          hotelName: hotelName || "Standard Clean Stay",
          location: "Uttarakhand Sector",
          roomType: "Standard Room",
          caption: "Clean sanitized room with attached bathroom and hot water",
          fit: "cover"
        };
        setData(prev => ({
          ...prev,
          hotelPhotos: [...(prev.hotelPhotos || []), newHp],
          showHotelPhotos: true
        }));
        // Also save to custom uploads library in dhamGallery
        const newPhoto: DhamGalleryPhoto = {
          id: `custom-hotel-${Date.now()}`,
          url: base64,
          caption: hotelName,
          dham: "custom",
          dhamLabel: "Custom Uploads",
          isCustom: true,
          createdAt: new Date().toISOString()
        };
        const updated = [newPhoto, ...dhamGallery];
        setDhamGallery(updated);
        saveStoredDhamGallery(updated);
        setAiPhotoNotification(`✓ Added new stay with uploaded photo "${hotelName}"!`);
        setTimeout(() => setAiPhotoNotification(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUpdatePhotoSetting = (id: string, field: "position" | "fit", val: any) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).map(p => p.id === id ? { ...p, [field]: val } : p)
    }));
  };

  const handleAddDhamPhotoFromUrl = () => {
    if (!newDhamUploadUrl.trim()) return;
    const cat = DHAM_CATEGORIES.find(c => c.key === newDhamUploadTag);
    const newPhoto: DhamGalleryPhoto = {
      id: `custom-dham-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: newDhamUploadUrl.trim(),
      caption: newDhamUploadCaption.trim() || `${cat?.label || "Holy"} Highlight`,
      dham: newDhamUploadTag,
      dhamLabel: cat?.label || "Uttarakhand Dham",
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    const updated = [newPhoto, ...dhamGallery];
    setDhamGallery(updated);
    saveStoredDhamGallery(updated);
    setNewDhamUploadUrl("");
    setNewDhamUploadCaption("");
    setAiPhotoNotification(`✓ Added new photo to ${newPhoto.dhamLabel} library!`);
    setTimeout(() => setAiPhotoNotification(null), 3500);
  };

  const handleDhamFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const cat = DHAM_CATEGORIES.find(c => c.key === newDhamUploadTag);
    const addedPhotos: DhamGalleryPhoto[] = [];
    let count = 0;

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          addedPhotos.push({
            id: `custom-dham-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64,
            caption: newDhamUploadCaption.trim() || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
            dham: newDhamUploadTag,
            dhamLabel: cat?.label || "Uttarakhand Dham",
            isCustom: true,
            createdAt: new Date().toISOString()
          });
        }
        count++;
        if (count === files.length) {
          const updated = [...addedPhotos, ...dhamGallery];
          setDhamGallery(updated);
          saveStoredDhamGallery(updated);
          setNewDhamUploadCaption("");
          setAiPhotoNotification(`✓ Uploaded ${addedPhotos.length} photo(s) to ${cat?.label} library!`);
          setTimeout(() => setAiPhotoNotification(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleDeleteDhamPhoto = (id: string) => {
    const updated = dhamGallery.filter(p => p.id !== id);
    setDhamGallery(updated);
    saveStoredDhamGallery(updated);
  };

  // Transfer current itinerary directly to Transport Voucher Studio
  const [transferredToTransport, setTransferredToTransport] = useState(false);
  const handleSendToTransport = () => {
    if (typeof window === "undefined") return;

    // Convert days to transport schedule
    const transportSchedule = data.days.map((day, idx) => ({
      date: `Day ${day.dayNumber}`,
      details: `${day.route}${day.activities && day.activities.length > 0 ? " — " + day.activities.join("; ") : ""}`,
      hotel: day.overnightStay ? (day.overnightStay.toLowerCase().includes("tent") ? day.overnightStay : `Hotel / Camp, ${day.overnightStay}`) : "Hotel / Camp"
    }));

    const transportData = {
      date: data.travelDates || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      exoNo: `UK-TR-${new Date().getFullYear()}`,
      fileNo: "01",
      guestName: data.preparedFor || "Valued Guest",
      managerMobile: data.contactPhone || "+91 9719038278",
      noOfAdults: "As per booking",
      vehicleType: "01 Innova Crysta / Tempo Traveller (Non-AC in Hills)",
      arrivalDate: data.travelDates ? `${data.travelDates} ~ ${data.startingPoint || "Haridwar / Dehradun"}` : "Haridwar / Dehradun",
      departureDate: data.travelDates ? `${data.travelDates} ~ Tour Concludes` : "Tour Concludes",
      favouringGuest: data.preparedFor || "Valued Guest",
      favouringPax: "As per booking",
      favouringVehicle: "01 Innova Crysta / Tempo Traveller (Non-AC in Hills)",
      itinerary: transportSchedule.length > 0 ? transportSchedule : [
        { date: "Day 1", details: "Pickup & scenic drive", hotel: "Hotel" }
      ]
    };

    try {
      localStorage.setItem("triloki_current_itinerary", JSON.stringify(data));
      localStorage.setItem("triloki_transport_voucher_data", JSON.stringify(transportData));
      setTransferredToTransport(true);
      setTimeout(() => setTransferredToTransport(false), 3000);
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  };

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

        // Add clickable PDF link annotations for all links in the document!
        try {
          const linkEls = el.querySelectorAll("a[href], [data-pdf-link]");
          const containerRect = el.getBoundingClientRect();
          linkEls.forEach((linkNode) => {
            const rect = linkNode.getBoundingClientRect();
            const targetUrl = linkNode.getAttribute("data-pdf-link") || (linkNode as HTMLAnchorElement).href;
            if (targetUrl && rect.width > 0 && rect.height > 0 && containerRect.width > 0 && containerRect.height > 0) {
              const x = ((rect.left - containerRect.left) / containerRect.width) * pageWidth;
              const y = ((rect.top - containerRect.top) / containerRect.height) * pageHeight;
              const w = (rect.width / containerRect.width) * pageWidth;
              const h = (rect.height / containerRect.height) * pageHeight;
              pdf.link(x, y, w, h, { url: targetUrl });
            }
          });
        } catch (linkErr) {
          console.warn("Could not attach PDF link annotations:", linkErr);
        }
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

      // Record in local Document Hub
      try {
        const costNum = parseInt(data.pricingTiers[0]?.price.replace(/[^0-9]/g, "") || "0");
        saveDocumentToHub({
          id: `itin-${data.title.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
          type: "itinerary",
          title: data.title,
          docNumber: `ITIN-${data.duration.replace(/[^0-9DNdn]/g, "").toUpperCase() || "YATRA"}`,
          guestName: data.preparedFor || "Honourable Guest",
          travelDates: `${data.travelDates} (${data.duration})`,
          amount: costNum,
          detailsSummary: `Route: ${data.routeCovered} | Highlights: ${data.glanceDhams || data.spiritualHeadline}`,
          studioUrl: "/itinerary-builder",
          rawPayload: data
        });
      } catch (hubErr) {
        console.warn("Local hub save:", hubErr);
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
      className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-10 py-7 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      {/* Header / Logo */}
      <div className="relative z-10 flex flex-col items-center text-center pt-1">
        <img src="/logo.png" alt="Travel to Uttarakhand" className="h-24 w-auto object-contain mb-1.5 drop-shadow-xs" />
        <p className="text-[10.5px] uppercase tracking-widest text-[#0369a1] font-bold">Travel to Uttarakhand</p>
        
        <h1 className="text-3xl font-serif font-black text-[#0369a1] tracking-tight mt-2 uppercase">
          {data.title}
        </h1>
        <p className="text-xs font-semibold tracking-widest text-[#dc2626] uppercase mt-0.5">
          {data.subTitle}
        </p>
        <p className="text-[11px] text-gray-600 font-medium italic mt-0.5">
          {data.spiritualHeadline}
        </p>
        <p className="text-[10px] text-gray-500 tracking-wide mt-0.5 font-sans">
          {data.dhamsSubtitle}
        </p>
      </div>

      {/* Visual Photo Strip Showcase - Spacious & Uncropped */}
      {data.showPhotosPage1 !== false && data.photos && data.photos.length > 0 && (
        <div className="relative z-10 my-3">
          <div className={`grid gap-2.5 ${
            data.photos.length === 1 ? 'grid-cols-1' : 
            data.photos.length === 2 ? 'grid-cols-2' : 
            'grid-cols-3'
          }`}>
            {data.photos.slice(0, 3).map((photo, pIdx) => {
              const isContain = photo.fit !== "cover";
              const posClass = photo.position === "top" ? "object-top" : photo.position === "bottom" ? "object-bottom" : "object-center";
              const fitClass = isContain ? "object-contain" : "object-cover";

              return (
                <div key={photo.id || pIdx} className="relative rounded-xl overflow-hidden border-2 border-[#0369a1]/30 shadow-md bg-slate-900 h-44 flex flex-col justify-between">
                  <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                    <img 
                      src={photo.url} 
                      alt="" 
                      aria-hidden="true" 
                      className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                    />
                    <img 
                      src={photo.url} 
                      alt={photo.caption || `Highlight ${pIdx + 1}`} 
                      className={`relative z-10 max-h-full max-w-full ${fitClass} ${posClass} drop-shadow-sm`}
                    />
                  </div>
                  {photo.caption && (
                    <div className="relative z-10 bg-gradient-to-r from-sky-950 via-[#0369a1] to-sky-950 px-2.5 py-1.5 text-center border-t border-sky-400/30 shrink-0">
                      <p className="text-[9.5px] font-bold text-white tracking-wide leading-tight line-clamp-1 drop-shadow-xs">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Details Table - Elegant & Well Spaced */}
      <div className="relative z-10 my-3 border-t border-b border-gray-200 py-3 text-[11px] space-y-2">
        <div className="grid grid-cols-[120px_1fr] items-start">
          <span className="font-bold text-gray-700">Prepared For</span>
          <span className="font-bold text-[#0369a1] text-xs">{data.preparedFor}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-start">
          <span className="font-bold text-gray-700">Travel Dates</span>
          <span className="font-semibold text-gray-800">{data.travelDates}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-start">
          <span className="font-bold text-gray-700">Duration</span>
          <span className="font-semibold text-gray-800">{data.duration}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-start">
          <span className="font-bold text-gray-700">Starting Point</span>
          <span className="font-semibold text-gray-800">{data.startingPoint}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-start">
          <span className="font-bold text-gray-700">Route Covered</span>
          <span className="text-[11px] text-gray-700 leading-relaxed font-medium">{data.routeCovered}</span>
        </div>
      </div>

      {/* Your Journey At A Glance Box - Fills Space Gracefully */}
      <div className="relative z-10 space-y-2.5">
        <h3 className="text-base font-serif font-bold text-[#0369a1] border-b border-[#0369a1]/30 pb-1">
          Your Journey At A Glance
        </h3>
        <p className="text-[11px] text-gray-700 leading-relaxed text-justify">
          {data.overviewSummary}
        </p>

        <table className="w-full text-left text-[11px] border border-gray-200 mt-2 rounded-lg overflow-hidden">
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-gray-50/70">
              <td className="px-3 py-2 font-bold text-gray-700 w-1/3">Duration</td>
              <td className="px-3 py-2 font-semibold text-gray-900">{data.glanceDuration}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold text-gray-700">Dhams Covered</td>
              <td className="px-3 py-2 font-semibold text-gray-900">{data.glanceDhams}</td>
            </tr>
            <tr className="bg-gray-50/70">
              <td className="px-3 py-2 font-bold text-gray-700">Kedarnath Sector</td>
              <td className="px-3 py-2 font-semibold text-gray-900">{data.glanceSector}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold text-gray-700">Start / End Point</td>
              <td className="px-3 py-2 font-semibold text-gray-900">{data.glanceStartEnd}</td>
            </tr>
            <tr className="bg-gray-50/70">
              <td className="px-3 py-2 font-bold text-gray-700">Packages Available</td>
              <td className="px-3 py-2 font-bold text-[#0369a1]">{data.glancePackages}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page 1 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-2 flex justify-between items-center text-[9.5px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <div className="flex items-center gap-3">
          <a 
            href="https://traveltouttrakhand.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://traveltouttrakhand.com" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1"
          >
            <span>🌐 www.traveltouttrakhand.com</span>
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50/60 border border-sky-200/80 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 fill-[#FF0000] shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube: @traveltouttarakhand</span>
          </a>
        </div>
        <span>Page 1 of 4</span>
      </div>
    </div>
  );

  const renderPage2 = (prefix: string) => {
    const isShortTour = data.days.length <= 6;
    const isWinter = data.title.toLowerCase().includes("winter") || 
                     data.title.toLowerCase().includes("auli") || 
                     data.title.toLowerCase().includes("chopta") ||
                     (data.subTitle && data.subTitle.toLowerCase().includes("winter"));
    const displayHotelPhotos = (data.hotelPhotos && data.hotelPhotos.length > 0) 
      ? data.hotelPhotos 
      : (isWinter ? WINTER_HOTEL_PHOTO_PRESETS : CURATED_HOTEL_PHOTO_PRESETS);

    return (
      <div
        id={`${prefix}-itinerary-page-2`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-10 py-7 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        <div className={`relative z-10 ${isShortTour ? "space-y-3" : "space-y-2"}`}>
          <h2 className="text-base font-serif font-bold text-[#0369a1] border-b border-[#0369a1] pb-1 mb-1.5 flex items-center justify-between">
            <span>Detailed Day-Wise Itinerary ({data.duration || `${data.days.length} Days / ${Math.max(1, data.days.length - 1)} Nights Plan`})</span>
            <span className="text-[10px] font-sans font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              Complete Day 1 to Day {Math.min(10, data.days.length)} Plan
            </span>
          </h2>

          {/* DAY-WISE ITINERARY CARDS WITH DIRECTLY LINKED PHOTOS */}
          <div className={isShortTour ? "space-y-3" : "space-y-1.5"}>
            {data.days.slice(0, 10).map((day, dIdx) => {
              // Resolve day photos (explicit or smart keyword-based matching)
              const primaryPhotoUrl = day.photoUrl || (
                day.route.toLowerCase().includes("auli") || day.activities.some(a => a.toLowerCase().includes("auli") || a.toLowerCase().includes("skiing") || a.toLowerCase().includes("cable car"))
                  ? "/gallery/auli_ropeway.jpg"
                  : day.route.toLowerCase().includes("tungnath") || day.activities.some(a => a.toLowerCase().includes("tungnath"))
                  ? "/gallery/tungnath_temple_snow.jpg"
                  : day.route.toLowerCase().includes("chandrashila") || day.activities.some(a => a.toLowerCase().includes("chandrashila"))
                  ? "/gallery/chandrashila_summit.jpg"
                  : day.route.toLowerCase().includes("chopta") || day.activities.some(a => a.toLowerCase().includes("chopta"))
                  ? "/gallery/chopta_snow_meadows.jpg"
                  : day.route.toLowerCase().includes("mussoorie") || day.activities.some(a => a.toLowerCase().includes("mussoorie") || a.toLowerCase().includes("mall road") || a.toLowerCase().includes("winterline"))
                  ? "/gallery/mussoorie_winterline.jpeg"
                  : day.route.toLowerCase().includes("rishikesh") || day.activities.some(a => a.toLowerCase().includes("rishikesh") || a.toLowerCase().includes("aarti") || a.toLowerCase().includes("jhula"))
                  ? "/gallery/rishikesh_ganga_aarti.webp"
                  : day.route.toLowerCase().includes("joshimath") || day.activities.some(a => a.toLowerCase().includes("joshimath"))
                  ? "/gallery/joshimath_stay.jpeg"
                  : day.route.toLowerCase().includes("ukhimath") || day.activities.some(a => a.toLowerCase().includes("ukhimath"))
                  ? "/gallery/ukhimath_temple.png"
                  : data.photos && data.photos[dIdx]
                  ? data.photos[dIdx].url
                  : null
              );

              const primaryCaption = day.photoCaption || (
                data.photos?.find(p => p.url === primaryPhotoUrl)?.caption || `Day ${day.dayNumber} Sightseeing Highlight`
              );

              const secondaryPhotoUrl = day.photoUrl2 || (
                day.route.toLowerCase().includes("auli") && primaryPhotoUrl !== "/gallery/auli_skiing.jpg" ? "/gallery/auli_skiing.jpg" :
                day.route.toLowerCase().includes("tungnath") && primaryPhotoUrl !== "/gallery/chandrashila_summit.jpg" ? "/gallery/chandrashila_summit.jpg" :
                day.route.toLowerCase().includes("mussoorie") && primaryPhotoUrl !== "/gallery/mussoorie_mall_road.webp" ? "/gallery/mussoorie_mall_road.webp" :
                day.route.toLowerCase().includes("rishikesh") && primaryPhotoUrl !== "/gallery/rishikesh_ram_jhula.png" ? "/gallery/rishikesh_ram_jhula.png" : null
              );

              const secondaryCaption = day.photoCaption2 || (
                data.photos?.find(p => p.url === secondaryPhotoUrl)?.caption || (
                  secondaryPhotoUrl === "/gallery/auli_skiing.jpg" ? "Thrilling Auli Snow Skiing & Slopes" :
                  secondaryPhotoUrl === "/gallery/chandrashila_summit.jpg" ? "Chandrashila 360° Himalayan Panorama" :
                  secondaryPhotoUrl === "/gallery/mussoorie_mall_road.webp" ? "Mussoorie Mall Road & Misty Hills" :
                  secondaryPhotoUrl === "/gallery/rishikesh_ram_jhula.png" ? "Sacred Ram Jhula over Ganga" : ""
                )
              );

              return (
                <div key={day.id} className={isShortTour ? "bg-white rounded-xl border border-sky-200/90 shadow-2xs overflow-hidden" : "text-xs space-y-0.5"}>
                  {/* Header Bar */}
                  <div className={`bg-[#0369a1] text-white font-bold tracking-wide flex items-center justify-between shadow-xs ${isShortTour ? "px-3.5 py-1.5 text-[11px]" : "px-2.5 py-0.5 rounded-md text-[10px]"}`}>
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="bg-white/20 text-white px-2 py-0.5 rounded font-black text-[10.5px] shrink-0 tracking-wider">
                        DAY {day.dayNumber}
                      </span>
                      {day.dateStr && !/^Day\s*\d+$/i.test(day.dateStr.trim()) && (
                        <span className="text-sky-100 font-medium text-[10px] shrink-0">
                          ({day.dateStr.replace(/^Day\s*[-–:]*\s*Day\s*\d*\s*[-–:]*/i, "").replace(/^Day\s*\d+\s*[-–:]*\s*/i, "").trim()})
                        </span>
                      )}
                      <span className="opacity-75 shrink-0">·</span>
                      <span className="truncate font-semibold">{day.route}</span>
                    </div>
                    {day.overnightStay && (
                      <span className="text-[10px] bg-sky-950/80 border border-sky-400/40 px-2.5 py-0.5 rounded-md font-semibold shrink-0 ml-2 text-white shadow-2xs whitespace-nowrap">
                        🏨 Stay: {day.overnightStay}
                      </span>
                    )}
                  </div>

                  {/* Day Content */}
                  {isShortTour ? (
                    <div className="p-2.5 space-y-2">
                      {/* Activities Bullet Points */}
                      <ul className="text-gray-800 space-y-1 text-[10.5px] leading-relaxed pl-3">
                        {day.activities.map((act, aIdx) => (
                          <li key={aIdx}>
                            – {act}
                          </li>
                        ))}
                      </ul>

                      {/* Day 1, Day 2, Day 3 Related Photo Strip right after activities */}
                      {primaryPhotoUrl && (
                        <div className="pt-1.5 border-t border-sky-100/90 flex items-center gap-2.5 bg-gradient-to-r from-sky-50/70 via-blue-50/30 to-transparent p-1.5 rounded-lg">
                          <div className={`${secondaryPhotoUrl ? 'w-36 h-20' : 'w-44 h-22'} rounded-lg overflow-hidden border border-sky-200 bg-slate-900 shrink-0 relative shadow-2xs flex items-center justify-center p-0.5`}>
                            <img 
                              src={primaryPhotoUrl} 
                              alt="" 
                              aria-hidden="true" 
                              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                            />
                            <img 
                              src={primaryPhotoUrl} 
                              alt={primaryCaption} 
                              className="relative z-10 max-h-full max-w-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 z-20 text-[7px] font-bold px-1.5 py-0.2 rounded bg-black/75 text-white backdrop-blur-xs">
                              Day {day.dayNumber}
                            </span>
                          </div>

                          {secondaryPhotoUrl && (
                            <div className="w-36 h-20 rounded-lg overflow-hidden border border-sky-200 bg-slate-900 shrink-0 relative shadow-2xs flex items-center justify-center p-0.5">
                              <img 
                                src={secondaryPhotoUrl} 
                                alt="" 
                                aria-hidden="true" 
                                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                              />
                              <img 
                                src={secondaryPhotoUrl} 
                                alt={secondaryCaption} 
                                className="relative z-10 max-h-full max-w-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 z-20 text-[7px] font-bold px-1.5 py-0.2 rounded bg-black/75 text-white backdrop-blur-xs">
                                Day {day.dayNumber}
                              </span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-[#0369a1] flex items-center gap-1">
                              <span>📸 Day {day.dayNumber} Sightseeing & Excursion</span>
                            </p>
                            <p className="text-[9.5px] text-gray-800 font-semibold mt-0.5 leading-snug">
                              {primaryCaption}
                            </p>
                            {secondaryCaption && (
                              <p className="text-[8.5px] text-gray-500 mt-0.5 leading-snug">
                                • {secondaryCaption}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ul className="pl-3 space-y-0.5 text-gray-800 text-[9.5px] leading-tight">
                      {day.activities.map((act, aIdx) => (
                        <li key={aIdx}>
                          – {act}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* SIGHTSEEING HIGHLIGHTS (ONLY FOR EXTENDED TOURS > 6 DAYS) */}
          {!isShortTour && data.photos && data.photos.length > 0 && (
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#0369a1]">
                <span>🛕 Holy Darshan & Sacred Sightseeing Highlights</span>
                <span className="text-[8.5px] font-semibold text-gray-500">Travel to Uttarakhand</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data.photos.slice(0, 3).map((photo, pIdx) => {
                  const isContain = photo.fit !== "cover";
                  const posClass = photo.position === "top" ? "object-top" : photo.position === "bottom" ? "object-bottom" : "object-center";
                  const fitClass = isContain ? "object-contain" : "object-cover";
                  return (
                    <div key={photo.id || pIdx} className="rounded-lg overflow-hidden border border-sky-200 shadow-2xs bg-white flex flex-col">
                      <div className="h-24 overflow-hidden bg-slate-900 relative flex items-center justify-center p-0.5">
                        <img 
                          src={photo.url} 
                          alt="" 
                          aria-hidden="true" 
                          className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                        />
                        <img 
                          src={photo.url} 
                          alt={photo.caption || `Sightseeing ${pIdx + 1}`} 
                          className={`relative z-10 max-h-full max-w-full ${fitClass} ${posClass}`}
                        />
                      </div>
                      {photo.caption && (
                        <p className="text-[8.5px] font-bold text-gray-800 py-1 px-1 text-center truncate bg-sky-50/80 border-t border-sky-100 shrink-0">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CONFIRMED STAYS & RESORTS SHOWCASE (Fills Page 2 gracefully for short tours like 3D/5D/6D!) */}
          {isShortTour && displayHotelPhotos && displayHotelPhotos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#0369a1]">
                <span className="flex items-center gap-1.5">
                  <span>{isWinter ? "🏨 Handpicked Winter Stays & Alpine Comfort" : "🏨 Confirmed Clean Stays & Hospitality"}</span>
                  <span className="text-[8.5px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Pre-Inspected & Verified
                  </span>
                </span>
                <span className="text-[9px] font-semibold text-gray-500">Heated Rooms · 24/7 Hot Water · Cozy Stays</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {displayHotelPhotos.slice(0, 3).map((hp, hIdx) => {
                  const isContain = hp.fit !== "cover";
                  const fitClass = isContain ? "object-contain" : "object-cover";
                  return (
                    <div key={hp.id || hIdx} className="rounded-lg overflow-hidden border border-sky-200 shadow-2xs bg-white flex flex-col">
                      <div className="h-28 overflow-hidden bg-slate-900 relative flex items-center justify-center p-0.5">
                        <img 
                          src={hp.url} 
                          alt="" 
                          aria-hidden="true" 
                          className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                        />
                        <img 
                          src={hp.url} 
                          alt={hp.hotelName || 'Stay'} 
                          className={`relative z-10 max-h-full max-w-full ${fitClass} ${hp.position || 'object-center'}`}
                        />
                        <span className="absolute top-1 right-1 z-20 text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#0369a1] text-white shadow-xs">
                          📍 {hp.location?.split("/")[0]?.trim() || "Scenic Stay"}
                        </span>
                      </div>
                      <div className="p-1.5 bg-sky-50/70 border-t border-sky-100 flex-1 flex flex-col justify-between">
                        <p className="text-[9.5px] font-bold text-gray-900 truncate">
                          {hp.hotelName || hp.roomType}
                        </p>
                        <p className="text-[8px] text-gray-600 line-clamp-1 mt-0.5">
                          {hp.caption || hp.roomType}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MOUNTAIN FLEET, WEATHER SAFETY & GUEST SUPPORT */}
          <div className="pt-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-50 via-blue-50/60 to-indigo-50/50 border border-sky-200">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#0369a1] mb-1.5">
                <span>{isWinter ? "❄️ Winter Mountain Guidelines, Vehicle Safety & Travel Essentials" : "✦ Pilgrimage Yatra Highlights & Mountain Support"}</span>
                <span className="text-[8.5px] font-semibold text-gray-500">Travel to Uttarakhand</span>
              </div>
              {isWinter ? (
                <div className="grid grid-cols-4 gap-2 text-[9px] text-gray-700">
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">Dedicated Mountain Fleet</p>
                    <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">
                      Hill-certified chauffeur, anti-skid snow chains, all state tolls & parking included.
                    </p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">Thermal Wear Advisory</p>
                    <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">
                      3-layer thermal inners, waterproof snow boots, fleece jackets & UV sunglasses.
                    </p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">Auli Cable Car Desk</p>
                    <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">
                      On-spot assistance for ropeway chairlift, ski gear rental & snow trail navigation.
                    </p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">24/7 Ground Assistance</p>
                    <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">
                      Real-time weather tracking, snow roadblock updates & 24/7 WhatsApp helpdesk.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-[9px] text-gray-700">
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">Dedicated Mountain Fleet</p>
                    <p className="text-[8.5px] text-gray-500 mt-0.5 leading-tight">
                      Experienced hill chauffeur, Non-AC in hills, all state tolls & parking included.
                    </p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">Clean Verified Stays</p>
                    <p className="text-[8.5px] text-gray-500 mt-0.5 leading-tight">
                      Standard pre-inspected hygienic rooms & alpine camps with hot water facility.
                    </p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-lg border border-sky-100 shadow-2xs">
                    <p className="font-bold text-gray-900">24/7 Pilgrimage Desk</p>
                    <p className="text-[8.5px] text-gray-500 mt-0.5 leading-tight">
                      Darshan slip assistance, registration support & 24/7 route coordination.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Page 2 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-2 flex justify-between items-center text-[9.5px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <div className="flex items-center gap-3">
          <a 
            href="https://traveltouttrakhand.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://traveltouttrakhand.com" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1"
          >
            <span>🌐 www.traveltouttrakhand.com</span>
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50/60 border border-sky-200/80 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 fill-[#FF0000] shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube: @traveltouttarakhand</span>
          </a>
        </div>
        <span>Page 2 of 4</span>
      </div>
    </div>
  );
};

  const renderPage3 = (prefix: string) => (
    <div
      id={`${prefix}-itinerary-page-3`}
      className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-10 py-7 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 space-y-2.5">
        
        {/* Remaining Days (Only for large itineraries > 10 days) */}
        {data.days.length > 10 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-serif font-bold text-[#0369a1] border-b border-sky-100 pb-0.5 flex items-center justify-between">
              <span>Detailed Day-Wise Itinerary (Continued — Days 11 to {data.days.length} of {data.days.length} Days)</span>
              <span className="text-[10px] font-sans font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                Part 2 · Extended Days
              </span>
            </h4>
            {data.days.slice(10).map(day => (
              <div key={day.id} className="text-xs space-y-0.5">
                <div className="bg-[#0369a1] text-white px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-wide flex items-center gap-1.5">
                  <span>DAY {day.dayNumber}</span>
                  {day.dateStr && !/^Day\s*\d+$/i.test(day.dateStr.trim()) && (
                    <>
                      <span className="opacity-75">·</span>
                      <span>{day.dateStr.replace(/^Day\s*[-–:]*\s*Day\s*\d*\s*[-–:]*/i, "").replace(/^Day\s*\d+\s*[-–:]*\s*/i, "").trim()}</span>
                    </>
                  )}
                  <span className="opacity-75">·</span>
                  <span className="truncate">{day.route}</span>
                </div>

                <ul className="pl-3 space-y-0.5 text-gray-800 text-[10px]">
                  {day.activities.map((act, aIdx) => (
                    <li key={aIdx} className="leading-tight">
                      – {act}
                    </li>
                  ))}
                </ul>

                <p className="pl-3 text-[9.5px] text-amber-900 italic font-semibold">
                  Overnight Stay: {day.overnightStay}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Package Options & Pricing Table */}
        <div className="space-y-1 pt-1">
          <h3 className="text-base font-serif font-bold text-[#0369a1]">
            Package Options & Pricing
          </h3>
          <p className="text-[11px] text-gray-600 leading-snug">
            {data.pricingSubtitle}
          </p>

          <table className="w-full text-xs border border-gray-200 text-center mt-1">
            <thead className="bg-[#0369a1] text-white font-bold text-[10.5px]">
              <tr>
                <th className="px-3 py-1.5 text-left">Package</th>
                <th className="px-3 py-1.5">Price / Person</th>
                <th className="px-3 py-1.5">Hotel Category</th>
                <th className="px-3 py-1.5">Meals</th>
                <th className="px-3 py-1.5">Special / Transport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[10.5px]">
              {data.pricingTiers.map((tier, tIdx) => (
                <tr key={tIdx} className={tIdx % 2 === 0 ? "bg-white" : "bg-gray-50/70"}>
                  <td className="px-3 py-1.5 font-bold text-gray-900 text-left">{tier.package}</td>
                  <td className="px-3 py-1.5 font-bold text-[#0369a1]">{tier.price}</td>
                  <td className="px-3 py-1.5 text-gray-700">{tier.hotelCategory}</td>
                  <td className="px-3 py-1.5 text-gray-700">{tier.meals}</td>
                  <td className="px-3 py-1.5 text-gray-700">{tier.specialFeature}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[9.5px] text-gray-500 italic mt-0.5">
            {data.pricingNote}
          </p>
        </div>

        {/* Confirmed Accommodation Standards Showcase */}
        {data.showHotelPhotos !== false && data.hotelPhotos && data.hotelPhotos.length > 0 && (
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold text-[#0369a1] flex items-center gap-1.5">
                <span>🏨 Confirmed Accommodation Standards & Clean Stays</span>
                <span className="text-[9px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Pre-inspected & Verified
                </span>
              </h4>
              <span className="text-[9.5px] text-gray-500 font-medium">Standard Clean Stays & Camps</span>
            </div>
            <div className={`grid gap-2.5 ${data.hotelPhotos.length === 1 ? 'grid-cols-1' : data.hotelPhotos.length === 2 ? 'grid-cols-2' : data.hotelPhotos.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {data.hotelPhotos.slice(0, 4).map((hp, hIdx) => {
                const isTent = hp.roomType?.toLowerCase().includes("tent");
                const safeUrl = (isTent && (hp.url?.includes("32") || !hp.url)) || hp.url === "/gallery/chardham_10d_img_32.jpg"
                  ? "/gallery/kedarnath_alpine_tent.jpg"
                  : hp.url;
                const isContain = hp.fit !== "cover";
                const fitClass = isContain ? "object-contain" : "object-cover";
                return (
                  <div key={hp.id || hIdx} className="rounded-xl overflow-hidden border border-sky-200 shadow-2xs bg-white flex flex-col">
                    <div className="h-36 relative overflow-hidden bg-slate-900 flex items-center justify-center p-0.5">
                      <img 
                        src={safeUrl} 
                        alt="" 
                        aria-hidden="true" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                      />
                      <img 
                        src={safeUrl} 
                        alt={hp.roomType || 'Accommodation'} 
                        className={`relative z-10 max-h-full max-w-full ${fitClass} ${hp.position || 'object-center'}`}
                      />
                      <span className={`absolute top-1.5 right-1.5 z-20 text-[8.5px] font-bold px-2 py-0.5 rounded-md shadow-xs ${isTent ? 'bg-amber-600 text-white' : 'bg-[#0369a1] text-white'}`}>
                        {isTent ? '⛺ Tent Only' : '🏨 ' + (hp.roomType || 'Standard Room')}
                      </span>
                    </div>
                    <div className="p-2 bg-sky-50/50 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10.5px] font-bold text-gray-900 leading-tight truncate">
                          {isTent ? 'Alpine Camp / Tent Stay' : (hp.roomType || 'Standard Clean Room')}
                        </p>
                        <p className="text-[9px] text-[#0369a1] font-semibold flex items-center gap-1 mt-0.5">
                          📍 {hp.location}
                        </p>
                      </div>
                      {hp.caption && (
                        <p className="text-[8.5px] text-gray-600 mt-1 leading-snug line-clamp-2">
                          {hp.caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Page 3 Destinations Gallery - Sacred Yatra Landmarks Showcase */}
        {data.showPhotosPage3 !== false && data.photos && data.photos.length > 0 && (
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold text-[#0369a1] flex items-center gap-1.5">
                <span>🛕 Sacred Yatra Destinations & Sightseeing Highlights</span>
                <span className="text-[9px] font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                  Visual Tour Guide
                </span>
              </h4>
              <span className="text-[9.5px] text-gray-500 font-medium">Travel to Uttarakhand</span>
            </div>
            <div className={`grid gap-2.5 ${data.photos.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {data.photos.slice(0, 6).map((photo, pIdx) => {
                const isContain = photo.fit !== "cover";
                const posClass = photo.position === "top" ? "object-top" : photo.position === "bottom" ? "object-bottom" : "object-center";
                const fitClass = isContain ? "object-contain" : "object-cover";
                const landmarkHeightClass = (data.photos?.length || 0) <= 3 ? "h-44" : "h-34";

                return (
                  <div key={photo.id || pIdx} className="rounded-xl overflow-hidden border border-[#0369a1]/30 shadow-2xs bg-gray-50 flex flex-col">
                    <div className={`${landmarkHeightClass} relative overflow-hidden bg-slate-900 flex items-center justify-center p-0.5`}>
                      <img 
                        src={photo.url} 
                        alt="" 
                        aria-hidden="true" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                      />
                      <img 
                        src={photo.url} 
                        alt={photo.caption || `Landmark ${pIdx + 1}`} 
                        className={`relative z-10 max-h-full max-w-full ${fitClass} ${posClass}`}
                      />
                    </div>
                    {photo.caption && (
                      <div className="py-1 px-1.5 bg-white border-t border-gray-100 text-center min-h-[26px] flex items-center justify-center shrink-0">
                        <p className="text-[9.5px] font-bold text-gray-800 line-clamp-1 px-1 leading-tight">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Page 3 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-2 flex justify-between items-center text-[9.5px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <div className="flex items-center gap-3">
          <a 
            href="https://traveltouttrakhand.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://traveltouttrakhand.com" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1"
          >
            <span>🌐 www.traveltouttrakhand.com</span>
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50/60 border border-sky-200/80 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 fill-[#FF0000] shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube: @traveltouttarakhand</span>
          </a>
        </div>
        <span>Page 3 of 4</span>
      </div>
    </div>
  );

  const renderPage4 = (prefix: string) => (
    <div
      id={`${prefix}-itinerary-page-4`}
      className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-10 py-7 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 space-y-3">
        
        <h2 className="text-lg font-serif font-bold text-[#0369a1] border-b border-[#0369a1] pb-1">
          Inclusions & Exclusions
        </h2>

        {/* Inclusions & Exclusions 2-Column Grid */}
        <div className="grid grid-cols-2 gap-5 text-xs">
          
          {/* Inclusions Column */}
          <div className="space-y-1">
            <h4 className="font-bold text-[#0369a1] text-xs mb-1">Inclusions</h4>
            <ul className="space-y-1 text-gray-800 text-[10.5px]">
              {data.inclusions.map((inc, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions Column */}
          <div className="space-y-1">
            <h4 className="font-bold text-[#0369a1] text-xs mb-1">Exclusions</h4>
            <ul className="space-y-1 text-gray-800 text-[10.5px]">
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
        <div className="space-y-1 pt-1.5 border-t border-gray-200">
          <h3 className="text-xs font-serif font-bold text-[#0369a1]">Good To Know</h3>
          <ul className="space-y-0.5 text-gray-700 text-[10px]">
            {data.goodToKnow.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-gray-400 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Booking & Payment Section */}
        <div className="space-y-1 pt-1.5 border-t border-gray-200">
          <h3 className="text-xs font-serif font-bold text-[#0369a1]">Booking & Payment</h3>
          <ul className="space-y-0.5 text-gray-700 text-[10px]">
            {data.bookingPayment.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-gray-400 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust & Credentials Section — All 4 Items: Tourism Certificate, Transport License, Owner, Office */}
        {data.showTrustSection !== false && (
          <div className="pt-2 border-t border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif font-bold text-[#0369a1] flex items-center gap-2">
                <span>🏆 Why Trust Us — Official Credentials & Registration</span>
                <span className="text-[9px] font-normal px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Govt. Registered & 100% Verified
                </span>
              </h3>
              <span className="text-[9px] text-gray-500 font-semibold">Travel to Uttarakhand</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2.5">
              
              {/* 1. Uttarakhand Tourism Development Board Certificate */}
              <div className="rounded-xl overflow-hidden border border-sky-200 shadow-2xs bg-white flex flex-col">
                <div className="h-28 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.certificatePhoto || "/certificates/uttrakhand_tourism.jpeg"} 
                    alt="Tourism Reg Certificate" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-sky-50/40 text-center flex-1 flex flex-col justify-between">
                  <p className="text-[9px] font-bold text-gray-800 leading-tight">
                    {data.trustPhotos?.certificateCaption || "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2024/007176"}
                  </p>
                  <p className="text-[8px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Govt. Registered Tour Operator
                  </p>
                </div>
              </div>

              {/* 2. Transport Authority Dehradun License */}
              <div className="rounded-xl overflow-hidden border border-purple-200 shadow-2xs bg-white flex flex-col">
                <div className="h-28 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.certificate2Photo || "/certificates/certificate.jpeg"} 
                    alt="Transport Authority License" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-purple-50/40 text-center flex-1 flex flex-col justify-between">
                  <p className="text-[9px] font-bold text-gray-800 leading-tight">
                    {data.trustPhotos?.certificate2Caption || "Transport Authority Reg: 44/RT/2025"}
                  </p>
                  <p className="text-[8px] text-purple-700 font-semibold mt-0.5">
                    ✓ Dehradun RTA Registered
                  </p>
                </div>
              </div>

              {/* 3. Owner Photo */}
              <div className="rounded-xl overflow-hidden border border-sky-200 shadow-2xs bg-white flex flex-col">
                <div className="h-28 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg"} 
                    alt={data.trustPhotos?.ownerName || "Amit Chandra"} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-sky-50/40 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-900 leading-tight">
                      {data.trustPhotos?.ownerName || "Amit Chandra"}
                    </p>
                    <p className="text-[8.5px] text-[#0369a1] font-semibold">
                      {data.trustPhotos?.ownerTitle || "Founder & Managing Director"}
                    </p>
                  </div>
                  <p className="text-[8px] text-gray-500 mt-0.5">
                    12+ Yrs Yatra Management
                  </p>
                </div>
              </div>

              {/* 4. Booking Office Photo */}
              <div className="rounded-xl overflow-hidden border border-sky-200 shadow-2xs bg-white flex flex-col">
                <div className="h-28 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.officePhoto || "/certificates/office_front.jpeg"} 
                    alt="Booking Office" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-sky-50/40 text-center flex-1 flex flex-col justify-between">
                  <p className="text-[9px] font-bold text-gray-800 leading-tight">
                    {data.trustPhotos?.officeCaption || "Shop 38, Pursharthi Market, Haridwar"}
                  </p>
                  <p className="text-[8px] text-sky-700 font-semibold mt-0.5">
                    📍 Direct Booking & Help Desk
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* For Bookings & Queries Center Box */}
        <div className="flex flex-col items-center justify-center text-center pt-1.5">
          <img src="/logo.png" alt="logo" className="h-14 w-auto object-contain mb-0.5 drop-shadow-xs" />
          <p className="text-[8.5px] uppercase tracking-widest text-gray-500 font-bold">For Bookings & Queries</p>
          <h4 className="text-sm font-serif font-bold text-[#0369a1]">{data.contactAgency}</h4>
          <p className="text-[11px] text-gray-800 font-semibold">{data.contactPerson}</p>
          <p className="text-[11px] text-gray-900 font-bold tracking-wider">{data.contactPhone}</p>
          <div className="flex items-center justify-center gap-3 mt-1">
            <a 
              href="https://traveltouttrakhand.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              data-pdf-link="https://traveltouttrakhand.com" 
              className="text-[11px] text-[#0369a1] font-bold tracking-wider hover:underline"
            >
              🌐 www.traveltouttrakhand.com
            </a>
            <span className="text-gray-300">•</span>
            <a 
              href="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
              target="_blank" 
              rel="noopener noreferrer" 
              data-pdf-link="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
              className="text-[11px] font-bold text-[#0369a1] hover:underline flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50/70 border border-sky-200"
            >
              <svg className="w-3.5 h-3.5 fill-[#FF0000] shrink-0" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube: @traveltouttarakhand</span>
            </a>
          </div>
          <p className="text-[11px] text-[#0369a1] font-serif font-bold mt-0.5 tracking-widest">{data.motto}</p>
        </div>

      </div>

      {/* Page 4 Footer */}
      <div className="relative z-10 border-t border-gray-200 pt-2 flex justify-between items-center text-[9.5px] text-gray-500">
        <span>Travel to Uttarakhand · {data.contactPhone}</span>
        <div className="flex items-center gap-3">
          <a 
            href="https://traveltouttrakhand.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://traveltouttrakhand.com" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1"
          >
            <span>🌐 www.traveltouttrakhand.com</span>
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            target="_blank" 
            rel="noopener noreferrer" 
            data-pdf-link="https://youtube.com/@traveltouttarakhand?si=VZngU7DnLfieaSRl" 
            className="font-bold text-[#0369a1] hover:underline flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50/60 border border-sky-200/80 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 fill-[#FF0000] shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube: @traveltouttarakhand</span>
          </a>
        </div>
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
              title="Reload standard 10-day Chardham Yatra preset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* ❄️ Winter Holidays 2026-27 Shortcuts Bar (Special Focus) */}
          <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-200 rounded-xl p-3 shadow-xs -mt-1 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-base">❄️</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1">
                  Winter Holidays Itinerary Shortcuts:
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300">
                  Nov 2026 – Mar 2027
                </span>
              </div>
              <span className="text-[10.5px] text-blue-700 font-semibold">⚡ 1-Click Load Itinerary + Confirmed Stays</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* 1. Auli (3D/2N) */}
              <button
                type="button"
                onClick={() => setData(AULI_3D_PRESET)}
                className="px-2.5 py-1.5 bg-white hover:bg-sky-600 text-sky-950 hover:text-white border border-sky-300 hover:border-sky-600 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                title="Auli (3D/2N) • 2 Nights Stay in Joshimath"
              >
                <span>🏔️ Auli (3D/2N)</span>
                <span className="text-[10px] text-sky-700 group-hover:text-sky-100 bg-sky-50 group-hover:bg-sky-700/60 px-1.5 py-0.5 rounded font-medium border border-sky-200 group-hover:border-transparent">2N Joshimath</span>
              </button>

              {/* 2. Chopta (3D/2N) */}
              <button
                type="button"
                onClick={() => setData(CHOPTA_3D_PRESET)}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-600 text-emerald-950 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                title="Chopta (3D/2N) • 2 Nights Stay in Chopta"
              >
                <span>🌲 Chopta (3D/2N)</span>
                <span className="text-[10px] text-emerald-700 group-hover:text-emerald-100 bg-emerald-50 group-hover:bg-emerald-700/60 px-1.5 py-0.5 rounded font-medium border border-emerald-200 group-hover:border-transparent">2N Chopta</span>
              </button>

              {/* 3. Rishikesh + Mussoorie (3D/2N) */}
              <button
                type="button"
                onClick={() => setData(RISHIKESH_MUSSOORIE_3D_PRESET)}
                className="px-2.5 py-1.5 bg-white hover:bg-purple-600 text-purple-950 hover:text-white border border-purple-300 hover:border-purple-600 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                title="Rishikesh + Mussoorie (3D/2N) • 1st Night Rishikesh, 2nd Night Mussoorie"
              >
                <span>🧘‍♂️ Rishikesh + Mussoorie (3D/2N)</span>
                <span className="text-[10px] text-purple-700 group-hover:text-purple-100 bg-purple-50 group-hover:bg-purple-700/60 px-1.5 py-0.5 rounded font-medium border border-purple-200 group-hover:border-transparent">1N Rishi + 1N Muss</span>
              </button>

              {/* 4. Auli + Chopta + Tungnath (5D/4N) */}
              <button
                type="button"
                onClick={() => setData(AULI_CHOPTA_TUNGNATH_5D_PRESET)}
                className="px-2.5 py-1.5 bg-white hover:bg-indigo-600 text-indigo-950 hover:text-white border border-indigo-300 hover:border-indigo-600 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                title="Auli + Chopta + Tungnath (5D/4N) • 2N Ukhimath/Chopta + 2N Joshimath/Rudraprayag"
              >
                <span>❄️ Auli + Chopta + Tungnath (5D/4N)</span>
                <span className="text-[10px] text-indigo-700 group-hover:text-indigo-100 bg-indigo-50 group-hover:bg-indigo-700/60 px-1.5 py-0.5 rounded font-medium border border-indigo-200 group-hover:border-transparent">2N Ukhimath + 2N Joshimath</span>
              </button>

              {/* 5. Auli + Chopta + Tungnath + Mussoorie (6D/5N) */}
              <button
                type="button"
                onClick={() => setData(AULI_CHOPTA_TUNGNATH_MUSSOORIE_6D_PRESET)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-600 hover:to-orange-600 text-amber-950 hover:text-white border border-amber-300 hover:border-amber-600 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5 group"
                title="Auli + Chopta + Tungnath + Mussoorie (6D/5N) • 1N Mussoorie, 2N & 3N Ukhimath, 4N Joshimath, 5N Joshimath/Rudraprayag"
              >
                <span>👑 Auli + Chopta + Tungnath + Mussoorie (6D/5N)</span>
                <span className="text-[10px] text-amber-800 group-hover:text-amber-100 bg-amber-100/80 group-hover:bg-amber-700/60 px-1.5 py-0.5 rounded font-semibold border border-amber-200 group-hover:border-transparent">1N Muss + 2N Ukhi + 1N Joshi + 1N Joshi/Rudra</span>
              </button>
            </div>
          </div>

          {/* Pilgrimage Presets & Quick Tools Bar */}
          <div className="flex items-center gap-1.5 flex-wrap -mt-1">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Chardham Presets:</span>
            <button
              type="button"
              onClick={() => setData(CHARDHAM_12P_10D_PRESET)}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="10 Days / 9 Nights Chardham Package for 12 Pax (Tempo Traveller & Standard Clean Stays)"
            >
              10D Chardham (12 Pax Standard)
            </button>
            <button
              type="button"
              onClick={() => setData(CHARDHAM_PRESET)}
              className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              10D Chardham (Standard)
            </button>
            <button
              type="button"
              onClick={() => setData(DODHAM_6D_PRESET)}
              className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="6 Days / 5 Nights Do Dham Yatra (Kedarnath + Badrinath via Guptkashi, Chopta & Pipalkoti)"
            >
              6D Do Dham (Kedar + Badri)
            </button>
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
              title="Select photos from your Dham Photo Library & Custom Uploads"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Pick Gallery Photos ({dhamGallery.filter(p => p.isCustom).length > 0 ? `${dhamGallery.filter(p => p.isCustom).length} Custom` : `${dhamGallery.length}`})</span>
            </button>
          </div>

          {/* Custom Uploads Detected Banner */}
          {dhamGallery.filter(p => p.isCustom).length > 0 && !customPhotosBannerDismissed && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 p-3 rounded-xl flex items-center justify-between gap-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">📸</span>
                <div>
                  <p className="font-bold text-amber-900 leading-tight">
                    {dhamGallery.filter(p => p.isCustom).length} Custom Photos in Gallery
                  </p>
                  <p className="text-[10.5px] text-amber-700">
                    Real client/group photos are available in your library.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyAllCustomUploads}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs"
                >
                  Apply All to Brochure
                </button>
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="px-2 py-1 bg-white hover:bg-gray-50 border border-amber-300 text-amber-900 rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  Browse
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPhotosBannerDismissed(true)}
                  className="text-amber-500 hover:text-amber-800 p-1 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* AI GENERATOR CARD */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-cyan-50/30 p-4 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Itinerary Generator (OpenRouter / Gemini / HF)
              </span>
              <div className="flex items-center gap-1.5">
                {apiKey ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Active
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-white/70 hover:bg-white px-2 py-0.5 rounded-md border border-purple-200"
                >
                  <Key className="w-3 h-3" />
                  {showKeyInput ? "Hide" : apiKey ? "Edit Key" : "Add Key"}
                </button>
              </div>
            </div>

            {/* Key input dropdown if missing or opened */}
            {showKeyInput && (
              <div className="bg-white p-3 rounded-xl border border-purple-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-bold text-gray-700">API Key (OpenRouter, Gemini, or Hugging Face)</label>
                  {apiKey && (
                    <span className="text-[9.5px] text-emerald-600 font-bold">✓ Saved on this device</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    placeholder="sk-or-v1-... (OpenRouter) or AIzaSy... (Gemini) or hf_..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveApiKeyPermanently(apiKey)}
                    disabled={!apiKey.trim()}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Save Key
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Key will be saved permanently. You will never have to enter it again!
                </p>
                {keySavedNotification && (
                  <p className="text-[10.5px] text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    ✓ API Key saved permanently!
                  </p>
                )}
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

              <div className="flex items-center justify-between text-[10.5px] text-purple-800 bg-purple-100/60 px-2.5 py-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 font-medium">
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  AI automatically auto-picks Dham photos from your Gallery
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className="font-bold underline hover:text-purple-950 cursor-pointer"
                >
                  Gallery ({dhamGallery.length})
                </button>
              </div>

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
              onClick={() => setActiveTab("photos")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "photos" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              4. Photos & Dham Gallery ({(data.photos || []).length})
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "inclusions" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              5. Inclusions
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "contact" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              6. Policies
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
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-medium text-amber-800">Overnight Stay Location</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = day.overnightStay || "";
                            if (!current.includes("Tent Only")) {
                              updateDayField(day.id, "overnightStay", current ? `${current.replace(/\(Tent.*?\)/i, "").trim()} (Tent Only)` : "Kedarnath (Tent Only)");
                            }
                          }}
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold transition cursor-pointer ${
                            day.overnightStay?.includes("Tent Only")
                              ? "bg-amber-600 text-white"
                              : "text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300"
                          }`}
                          title="Set Tent Only"
                        >
                          ⛺ Tent Only
                        </button>
                      </div>
                      <input
                        type="text"
                        value={day.overnightStay}
                        onChange={e => updateDayField(day.id, "overnightStay", e.target.value)}
                        className="w-full px-2 py-1 bg-amber-50/60 border border-amber-200 rounded text-xs font-semibold text-amber-900"
                      />
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateDayField(day.id, "overnightStay", "Kedarnath (Tent Only - Without Food)")}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 transition cursor-pointer font-medium"
                        >
                          Kedarnath (Tent Only)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const current = day.overnightStay || "";
                            updateDayField(day.id, "overnightStay", current.replace(/\(Tent.*?\)/i, "").replace(/Tent Only/i, "").trim() || "Hotel Stay");
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                        >
                          Hotel Stay
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDayField(day.id, "overnightStay", "Tour Concludes (Happy Memories)")}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                        >
                          Tour Concludes
                        </button>
                      </div>
                    </div>

                    {/* Day Photo & Caption Editor */}
                    <div className="pt-2 border-t border-gray-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-medium text-sky-800 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-sky-600" />
                          <span>Day {day.dayNumber} Visual Highlight Photo & Caption</span>
                        </label>
                        {day.photoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              updateDayField(day.id, "photoUrl", "");
                              updateDayField(day.id, "photoCaption", "");
                              updateDayField(day.id, "photoUrl2", "");
                              updateDayField(day.id, "photoCaption2", "");
                            }}
                            className="text-[9px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Reset Photo
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Image URL or /gallery/..."
                            value={day.photoUrl || ""}
                            onChange={e => updateDayField(day.id, "photoUrl", e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px]"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Caption (e.g. Auli Cable Car)"
                            value={day.photoCaption || ""}
                            onChange={e => updateDayField(day.id, "photoCaption", e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px]"
                          />
                        </div>
                      </div>
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
                <label className="block font-medium text-gray-600 mb-1">Pricing Footnote (Terms & Notes)</label>
                <textarea
                  rows={2}
                  value={data.pricingNote}
                  onChange={e => setData({ ...data, pricingNote: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs italic"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PICTURES & VISUAL SHOWCASE */}
          {activeTab === "photos" && (
            <div className="space-y-4 text-xs">
              
              {/* Display Options & Toggles */}
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                <span className="font-bold text-sky-900 block text-[11px] uppercase tracking-wider">
                  Brochure Display Toggles
                </span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showPhotosPage1 !== false}
                      onChange={e => setData({ ...data, showPhotosPage1: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-gray-700 font-medium">Show Photo Strip on Page 1 (Cover / Journey Glance)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showPhotosPage3 !== false}
                      onChange={e => setData({ ...data, showPhotosPage3: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-gray-700 font-medium">Show Photo Gallery on Page 3 (Destinations Highlights)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showHotelPhotos !== false}
                      onChange={e => setData({ ...data, showHotelPhotos: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-gray-700 font-medium">Show Confirmed Accommodations & Hotel Stays on Page 3</span>
                  </label>
                </div>
              </div>

              {/* BLOCK: CONFIRMED HOTEL & ACCOMMODATION PHOTOS */}
              <div className="bg-gradient-to-br from-emerald-50/50 via-sky-50/30 to-white border-2 border-emerald-300/80 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      🏨
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        Confirmed Accommodations & Hotel Photos
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {(data.hotelPhotos || []).length} Stays
                        </span>
                      </h3>
                      <p className="text-[10.5px] text-gray-500">
                        Showcase verified hotel & camp stays to assure clients of accommodation quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Hotel Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadNewStayPhoto}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={loadCuratedHotelPhotos}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                      title="Load curated standard room & Kedarnath alpine camp photos"
                    >
                      ★ Curated Preset
                    </button>
                    <button
                      type="button"
                      onClick={addHotelPhoto}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stay
                    </button>
                  </div>
                </div>

                {/* Hotel List */}
                <div className="space-y-3">
                  {(data.hotelPhotos || []).map((hp, hIdx) => {
                    const isTent = hp.roomType?.toLowerCase().includes("tent");
                    return (
                      <div key={hp.id || hIdx} className="p-3 bg-white border border-emerald-200/80 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-gray-900">
                              Stay {hIdx + 1}: {hp.hotelName || "Stay"}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isTent ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-sky-100 text-sky-800'}`}>
                              {isTent ? '⛺ Tent Only' : '🏨 Standard Stay'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHotelPhoto(hp.id)}
                            className="text-gray-400 hover:text-rose-600 transition cursor-pointer p-1"
                            title="Remove stay photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Stay / Category Title (Internal)</label>
                            <input
                              type="text"
                              value={hp.hotelName}
                              onChange={e => updateHotelPhoto(hp.id, "hotelName", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold"
                              placeholder="e.g. Standard Clean Stay"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Location / Sector</label>
                            <input
                              type="text"
                              value={hp.location}
                              onChange={e => updateHotelPhoto(hp.id, "location", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Room Type / Category</label>
                            <input
                              type="text"
                              value={hp.roomType || ""}
                              onChange={e => updateHotelPhoto(hp.id, "roomType", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                              placeholder="e.g. Standard Room / Tent Only"
                            />
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Standard Room")}
                                className="text-[9px] px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded"
                              >
                                Standard
                              </button>
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Tent Only (Without Food)")}
                                className="text-[9px] px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded"
                              >
                                Tent Only
                              </button>
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Family Triple / Quad")}
                                className="text-[9px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                              >
                                Family
                              </button>
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Deluxe Double Room")}
                                className="text-[9px] px-1.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded"
                                title="Optional for guests requesting deluxe"
                              >
                                Deluxe (Opt)
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-medium text-gray-500">Image URL or Upload</label>
                              <label className="text-[9.5px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                                📤 Upload Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleHotelFileUpload(hp.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={hp.url}
                              onChange={e => updateHotelPhoto(hp.id, "url", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono"
                              placeholder="/gallery/... or upload above"
                            />
                            {hp.url && (
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-16 rounded overflow-hidden border border-gray-200 shrink-0 bg-slate-900 flex items-center justify-center p-0.5">
                                    <img 
                                      src={hp.url === "/gallery/chardham_10d_img_32.jpg" ? "/gallery/kedarnath_alpine_tent.jpg" : hp.url} 
                                      alt={hp.hotelName} 
                                      className={`max-h-full max-w-full ${hp.fit === 'cover' ? 'w-full h-full object-cover' : 'object-contain'}`} 
                                    />
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-mono truncate max-w-[180px]">
                                    {hp.url === "/gallery/chardham_10d_img_32.jpg" ? "/gallery/kedarnath_alpine_tent.jpg" : hp.url}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                  <span className="text-[9px] text-gray-500 font-medium">Photo Fit:</span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateHotelPhoto(hp.id, "fit", "contain")}
                                      className={`text-[9px] px-2 py-0.5 rounded font-semibold cursor-pointer ${hp.fit !== 'cover' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                                      title="Show full photo without cutting portrait/vertical shots"
                                    >
                                      ✓ Full Fit (No Cut)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateHotelPhoto(hp.id, "fit", "cover")}
                                      className={`text-[9px] px-2 py-0.5 rounded font-semibold cursor-pointer ${hp.fit === 'cover' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                                      title="Fill container (crop to fill)"
                                    >
                                      Crop to Fill
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Quick Select from Uploaded Hotel Stays */}
                            <div className="mt-1">
                              <span className="text-[9px] text-gray-500 font-semibold block mb-0.5">Quick pick stay photo (11 hotel pics & tent):</span>
                              <div className="flex gap-1 overflow-x-auto py-0.5 custom-scrollbar">
                                {[
                                  { url: "/hotels_custom/hotel_stay_2.jpeg", label: "Quad Room" },
                                  { url: "/hotels_custom/hotel_stay_4.jpeg", label: "Double Bed" },
                                  { url: "/hotels_custom/hotel_stay_3.jpeg", label: "Mountain Stay" },
                                  { url: "/hotels_custom/hotel_stay_6.jpeg", label: "Twin Room" },
                                  { url: "/hotels_custom/hotel_stay_7.jpeg", label: "Deluxe Bed" },
                                  { url: "/hotels_custom/hotel_stay_1.jpeg", label: "Bath/Geyser" },
                                  { url: "/hotels_custom/hotel_stay_5.jpeg", label: "Luxury Triple" },
                                  { url: "/hotels_custom/hotel_stay_8.jpeg", label: "Cozy Double" },
                                  { url: "/hotels_custom/hotel_stay_9.jpeg", label: "Valley View" },
                                  { url: "/hotels_custom/hotel_stay_10.jpeg", label: "Family Suite" },
                                  { url: "/hotels_custom/hotel_stay_11.jpeg", label: "Camp/Resort" },
                                  { url: "/gallery/kedarnath_alpine_tent.jpg", label: "⛺ Alpine Tent" }
                                ].map((pic, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => updateHotelPhoto(hp.id, "url", pic.url)}
                                    className={`text-[8.5px] px-2 py-0.5 rounded shrink-0 border transition ${hp.url === pic.url ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                  >
                                    {pic.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Feature Caption / Amenities</label>
                          <input
                            type="text"
                            value={hp.caption || ""}
                            onChange={e => updateHotelPhoto(hp.id, "caption", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                            placeholder="e.g. Attached bath, hot geyser & hygienic pure veg kitchen"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust & Credentials Editor — 4 Cards: Tourism Certificate, Transport License, Owner, Office */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-white border-2 border-emerald-300 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-xs">
                        Official Certificates & Credentials (Page 4)
                      </h3>
                      <p className="text-[10px] text-emerald-800">
                        Edit, swap or upload official registration certificates, owner and office photos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setData(prev => ({
                        ...prev,
                        trustPhotos: { ...DEFAULT_TRUST_PHOTOS },
                        showTrustSection: true
                      }))}
                      className="text-[9.5px] px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition shadow-2xs cursor-pointer"
                      title="Reset all 4 credentials to verified government records"
                    >
                      ★ Reset to Official Presets
                    </button>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.showTrustSection !== false}
                        onChange={e => setData({ ...data, showTrustSection: e.target.checked })}
                        className="rounded"
                      />
                      Show on Page 4
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  
                  {/* Card 1: Uttarakhand Tourism Certificate */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-sky-900">
                        📜 1. Tourism Board Certificate
                      </label>
                      <label className="text-[9px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-0.5 cursor-pointer bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, certificatePhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            certificatePhoto: "/certificates/uttrakhand_tourism.jpeg",
                            certificateCaption: "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2024/007176"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.certificatePhoto === "/certificates/uttrakhand_tourism.jpeg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Uttarakhand Tourism Reg.
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.certificatePhoto || "/certificates/uttrakhand_tourism.jpeg"} 
                        alt="Tourism Certificate" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">Certificate Caption / Reg Number</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.certificateCaption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, certificateCaption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2024/007176"
                      />
                    </div>
                  </div>

                  {/* Card 2: Transport Authority License */}
                  <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-purple-900">
                        🚗 2. Transport Authority License
                      </label>
                      <label className="text-[9px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-0.5 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, certificate2Photo: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            certificate2Photo: "/certificates/certificate.jpeg",
                            certificate2Caption: "Dehradun Transport Authority License: 44/RT/2025"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.certificate2Photo === "/certificates/certificate.jpeg"
                            ? "bg-purple-600 text-white border-purple-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Dehradun RTA Reg.
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.certificate2Photo || "/certificates/certificate.jpeg"} 
                        alt="RTA License" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">License Caption / RTA Reg Number</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.certificate2Caption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, certificate2Caption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Dehradun Transport Authority License: 44/RT/2025"
                      />
                    </div>
                  </div>

                  {/* Card 3: Owner Photo */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-gray-800">
                        👤 3. Owner Photo (Amit Chandra)
                      </label>
                      <label className="text-[9px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, ownerPhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            ownerPhoto: "/certificates/owner.jpeg",
                            ownerName: "Amit Chandra",
                            ownerTitle: "Founder & Managing Director"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.ownerPhoto === "/certificates/owner.jpeg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Office Desk Picture
                      </button>
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            ownerPhoto: "/gallery/chardham_10d_img_28.jpg",
                            ownerName: "Amit Chandra",
                            ownerTitle: "Founder & Managing Director"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.ownerPhoto === "/gallery/chardham_10d_img_28.jpg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Mountain View Picture
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg"} 
                        alt="Owner" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-500 font-medium mb-0.5">Name</label>
                        <input
                          type="text"
                          value={data.trustPhotos?.ownerName || ""}
                          onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, ownerName: e.target.value } }))}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold"
                          placeholder="Amit Chandra"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 font-medium mb-0.5">Designation</label>
                        <input
                          type="text"
                          value={data.trustPhotos?.ownerTitle || ""}
                          onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, ownerTitle: e.target.value } }))}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                          placeholder="Founder & Managing Director"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Office Photo */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-gray-800">
                        🏢 4. Haridwar Booking Office
                      </label>
                      <label className="text-[9px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, officePhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            officePhoto: "/certificates/office_front.jpeg",
                            officeCaption: "Shop 38, Pursharthi Market, Haridwar"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.officePhoto === "/certificates/office_front.jpeg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Front Signboard
                      </button>
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            officePhoto: "/gallery/chardham_10d_img_27.jpg",
                            officeCaption: "Booking Desk — Haridwar"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.officePhoto === "/gallery/chardham_10d_img_27.jpg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Inner Desk
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.officePhoto || "/certificates/office_front.jpeg"} 
                        alt="Office" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">Office Address / Caption</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.officeCaption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, officeCaption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Shop 38, Pursharthi Market, Haridwar"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* MY UPLOADED CUSTOM PHOTOS HIGHLIGHT */}
              {dhamGallery.filter(p => p.isCustom).length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/40 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📸</span>
                      <div>
                        <h3 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                          My Uploaded Gallery Photos
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {dhamGallery.filter(p => p.isCustom).length} Photos
                          </span>
                        </h3>
                        <p className="text-[10px] text-amber-800">
                          Your actual client group & tour photos from the Gallery.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyAllCustomUploads}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                    >
                      ★ Use All My Uploaded Photos
                    </button>
                  </div>

                  {/* Grid of Custom Uploads */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dhamGallery.filter(p => p.isCustom).map(photo => {
                      const isSelected = (data.photos || []).some(p => p.url === photo.url);
                      return (
                        <div
                          key={photo.id}
                          className={`p-1.5 bg-white rounded-xl border transition flex flex-col justify-between gap-1.5 ${
                            isSelected ? "border-amber-500 ring-2 ring-amber-300 shadow-xs" : "border-amber-200 hover:border-amber-400"
                          }`}
                        >
                          <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-gray-100">
                            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                            {isSelected && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-bold rounded shadow-xs">
                                ✓ In Brochure
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] font-semibold text-gray-800 line-clamp-1">{photo.caption}</p>
                          <button
                            type="button"
                            onClick={() => handleTogglePhotoInBrochure(photo)}
                            className={`w-full py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                              isSelected ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-amber-500 text-white hover:bg-amber-600"
                            }`}
                          >
                            {isSelected ? "Remove" : "+ Add to Brochure"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Browse & Pick from Gallery Button */}
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-[#0369a1] hover:from-sky-700 hover:to-[#025684] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>📷 Open Visual Gallery Picker ({dhamGallery.length} Photos)</span>
              </button>

              {/* BLOCK: DHAM PHOTO GALLERY & AI ASSET POOL */}
              <div className="bg-gradient-to-br from-amber-50/50 via-sky-50/40 to-white border-2 border-sky-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-sky-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        Dham Photo Gallery & AI Asset Pool
                        <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                          {dhamGallery.length} Photos
                        </span>
                      </h3>
                      <p className="text-[10.5px] text-gray-500">
                        Organize holy Dham pictures. AI automatically matches and picks pictures for your itinerary.
                      </p>
                    </div>
                  </div>

                  {/* AI Auto-Match Button */}
                  <button
                    type="button"
                    onClick={handleAutoMatchPhotos}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer shrink-0"
                    title="Scan current itinerary & auto-pick matching Dham photos"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ AI Auto-Match Photos</span>
                  </button>
                </div>

                {/* Notification toast */}
                {aiPhotoNotification && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{aiPhotoNotification}</span>
                  </div>
                )}

                {/* Direct Link to Dedicated Photo Library Tab */}
                <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#0369a1] text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> Dedicated Photo Library & Media Tab
                    </span>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">
                      Upload and manage all your Dham, hotel & cab photos in the dedicated Photo Library tab.
                    </p>
                  </div>
                  <Link
                    href="/gallery"
                    target="_blank"
                    className="px-3.5 py-2 bg-[#0369a1] hover:bg-[#025684] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Open Photo Library ↗
                  </Link>
                </div>

                {/* Category Filter Pills */}
                <div className="space-y-1.5">
                  <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider block">
                    Filter Gallery by Holy Dham
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DHAM_CATEGORIES.map(cat => {
                      const count = cat.key === "all"
                        ? dhamGallery.length
                        : cat.key === "custom"
                        ? dhamGallery.filter(p => p.isCustom).length
                        : dhamGallery.filter(p => p.dham === cat.key).length;
                      const isSelected = selectedDhamCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setSelectedDhamCategory(cat.key)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? "bg-sky-600 text-white shadow-2xs"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? "bg-sky-700 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                  {dhamGallery
                    .filter(p => {
                      if (selectedDhamCategory === "all") return true;
                      if (selectedDhamCategory === "custom") return p.isCustom;
                      return p.dham === selectedDhamCategory;
                    })
                    .map(photo => {
                      const isCurrentlyInBrochure = (data.photos || []).some(p => p.url === photo.url);
                      return (
                        <div
                          key={photo.id}
                          className={`p-2 bg-white border rounded-xl flex flex-col justify-between gap-2 transition ${
                            isCurrentlyInBrochure ? "border-emerald-400 ring-1 ring-emerald-300 bg-emerald-50/20" : "border-gray-200 hover:border-sky-300"
                          }`}
                        >
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold rounded uppercase tracking-wider">
                              {photo.dhamLabel}
                            </span>
                            {photo.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDhamPhoto(photo.id)}
                                title="Delete custom photo from library"
                                className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-[11px] leading-tight line-clamp-2">
                              {photo.caption}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTogglePhotoInBrochure(photo)}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              isCurrentlyInBrochure
                                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                                : "bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200"
                            }`}
                          >
                            {isCurrentlyInBrochure ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Brochure (Remove)</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Itinerary</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Active Photos List */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-xs">
                    Current Brochure Photos ({(data.photos || []).length})
                  </span>
                  {(data.photos || []).length > 0 && (
                    <button
                      onClick={() => setData({ ...data, photos: [] })}
                      className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove All
                    </button>
                  )}
                </div>

                {(data.photos || []).length === 0 ? (
                  <p className="text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">
                    No pictures added yet. Upload client pictures or click presets above!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(data.photos || []).map((photo, pIdx) => (
                      <div key={photo.id || pIdx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                        <div className="w-16 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative border border-gray-200 flex items-center justify-center p-0.5">
                          <img 
                            src={photo.url} 
                            alt={photo.caption} 
                            className={`max-h-full max-w-full ${photo.fit === "cover" ? "w-full h-full object-cover" : "object-contain"} ${photo.position === "top" ? "object-top" : photo.position === "bottom" ? "object-bottom" : "object-center"}`} 
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-700 uppercase">
                              Photo #{pIdx + 1} · {pIdx < 3 ? "Page 1 Cover" : "Page 3 Gallery"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMovePhoto(pIdx, "up")}
                                disabled={pIdx === 0}
                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMovePhoto(pIdx, "down")}
                                disabled={pIdx === (data.photos || []).length - 1}
                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer ml-1"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={photo.caption}
                            onChange={e => handleUpdatePhotoCaption(photo.id, e.target.value)}
                            placeholder="Enter photo caption..."
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px]"
                          />
                          {/* Image Focus & Fit Controls */}
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-500 font-medium">Focus:</span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhotoSetting(photo.id, "position", "top")}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${photo.position === "top" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Focus towards top (keeps heads and temple tops in view)"
                            >
                              Top
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhotoSetting(photo.id, "position", "center")}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${!photo.position || photo.position === "center" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Center focus"
                            >
                              Center
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhotoSetting(photo.id, "fit", photo.fit === "cover" ? "contain" : "cover")}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${photo.fit !== "cover" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Fit entire image without cropping (Full Fit is active by default)"
                            >
                              {photo.fit !== "cover" ? "✓ Full Fit (No Crop)" : "Crop to Fill"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: INCLUSIONS & EXCLUSIONS */}
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

            {/* Send to Transport Voucher */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSendToTransport}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer border ${
                  transferredToTransport
                    ? "bg-emerald-500 text-white border-emerald-600 font-bold"
                    : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                }`}
                title="Send current client and day itinerary schedule to Transport Voucher Studio"
              >
                <Car className="w-3.5 h-3.5 text-purple-600" />
                <span>{transferredToTransport ? "✓ Sent to Transport!" : "Send to Transport"}</span>
              </button>
              <Link
                href="/transport"
                className="p-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg text-xs transition cursor-pointer"
                title="Open Transport Voucher Studio"
              >
                <Car className="w-3.5 h-3.5" />
              </Link>
            </div>

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

      {/* GALLERY SELECTION MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600 via-[#0369a1] to-blue-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Select Photos for Itinerary & Brochure</h3>
                  <p className="text-[11px] text-sky-100">
                    Pick up to 6 photographs. Slots 1–3 appear on Page 1 (Cover Strip); Slots 4–6 appear on Page 3 (Destinations Gallery).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Category Filter Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {DHAM_CATEGORIES.map(cat => {
                  const count = cat.key === "all"
                    ? dhamGallery.length
                    : cat.key === "custom"
                    ? dhamGallery.filter(p => p.isCustom).length
                    : dhamGallery.filter(p => p.dham === cat.key).length;
                  if (count === 0 && cat.key !== "all" && cat.key !== "custom") return null;
                  const isSel = galleryModalCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setGalleryModalCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        isSel ? "bg-[#0369a1] text-white shadow-xs" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {dhamGallery.filter(p => p.isCustom).length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyAllCustomUploads}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    ★ Select All My Uploads ({dhamGallery.filter(p => p.isCustom).length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAutoMatchPhotos}
                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-[#0369a1] rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Match
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="p-4 overflow-y-auto max-h-[55vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 custom-scrollbar">
              {dhamGallery
                .filter(p => {
                  if (galleryModalCategory === "all") return true;
                  if (galleryModalCategory === "custom") return p.isCustom;
                  return p.dham === galleryModalCategory;
                })
                .map(photo => {
                  const isSelected = (data.photos || []).some(p => p.url === photo.url);
                  const selIdx = (data.photos || []).findIndex(p => p.url === photo.url);

                  return (
                    <div
                      key={photo.id}
                      onClick={() => handleTogglePhotoInBrochure(photo)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col bg-white ${
                        isSelected 
                          ? "border-[#0369a1] ring-2 ring-[#0369a1]/30 shadow-md" 
                          : "border-gray-200 hover:border-sky-300 shadow-xs"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {/* Checkbox / Slot Indicator */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition ${
                          isSelected ? "bg-[#0369a1] text-white shadow-md ring-2 ring-white" : "bg-black/40 text-white border border-white/60"
                        }`}>
                          {isSelected ? (selIdx + 1) : "+"}
                        </div>
                        {photo.isCustom && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase tracking-wider shadow-xs">
                            Custom Upload
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                        <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">
                          {photo.caption}
                        </p>
                        <span className={`text-[10px] font-bold block ${
                          isSelected ? "text-[#0369a1]" : "text-gray-400"
                        }`}>
                          {isSelected ? `✓ Selected (Slot #${selIdx + 1}${selIdx < 3 ? ' - Page 1' : ' - Page 3'})` : "Click to select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-600 font-medium">
                {(data.photos || []).length} of max 6 photos active in brochure
              </span>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="px-5 py-2 bg-[#0369a1] hover:bg-[#025684] text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Done / Apply to Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
