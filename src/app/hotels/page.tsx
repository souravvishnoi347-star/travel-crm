"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  Loader2, 
  MessageCircle, 
  Building2, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut,
  Copy,
  ArrowUp,
  ArrowDown,
  Bed,
  Utensils,
  Clock,
  BedDouble
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";

export interface HotelStay {
  id: string;
  nightsLabel: string; // e.g. "Night 1 (15 May)" or "Day 1-2"
  city: string;
  hotelName: string;
  hotelAddress: string;
  contactNo: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  noOfRooms: string;
  mealPlan: string; // "EP" | "CP" | "MAP" | "AP"
  confirmationNo: string;
  specialRequest?: string;
}

export interface HotelVoucherData {
  voucherNo: string;
  tripDates?: string;
  bookingId?: string;
  dateOfIssue: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  totalPax: string;
  totalRooms: string;
  tripDuration: string;
  specialInstructions: string;
  inclusions: string;
  emergencyContact: string;
  stays: HotelStay[];
}

// Actual Old Voucher: Chardham 10 Days (Bill No. 604 - Mr. Jayesh Bhai Patel)
const PRESET_CHARDHAM_ACTUAL_VOUCHER: HotelVoucherData = {
  voucherNo: "BILL NO. 604",
  tripDates: "14/05/2026 TO 22/05/2026",
  bookingId: "CH-2026-604",
  dateOfIssue: "14 May 2026",
  guestName: "Mr. Jayesh Bhai Babubhai Patel",
  guestPhone: "7984641303",
  guestEmail: "traveltouttarakhand38@gmail.com",
  totalPax: "7 Members",
  totalRooms: "Family Rooms (Innova)",
  tripDuration: "Chardham Yatra Package 10 Days 2026",
  emergencyContact: "Amit Chandra: +91 9719038278 · Kuldeep: +91 8449982466",
  specialInstructions: "• Please present this original voucher with government photo ID at check-in.\n• Standard check-in time 12:00 PM, check-out 10:00 AM.\n• Pure vegetarian meals served across all destinations.\n• Non-AC rooms in mountain sectors.",
  inclusions: "• Confirmed Hotel accommodation across Barkot, Uttarkashi, Phata, Kedarnath (Tent Only), Badrinath & Pipalkoti.\n• Dedicated Innova with driver Haridwar to Haridwar.\n• All tolls, parking, interstate taxes included.",
  stays: [
    {
      id: "stay-act-1",
      nightsLabel: "Night 1 & 2 (14-15 May)",
      city: "Barkot / Yamunotri",
      hotelName: "Hotel Sarutal",
      hotelAddress: "Barkot, Yamunotri Road",
      contactNo: "7818854893",
      checkIn: "14/05/2026 (12:00 PM)",
      checkOut: "16/05/2026 (08:00 AM)",
      nights: 2,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-SAR-604",
      specialRequest: "Early breakfast for Yamunotri trek"
    },
    {
      id: "stay-act-2",
      nightsLabel: "Night 3 & 4 (16-17 May)",
      city: "Uttarkashi / Gangotri",
      hotelName: "Hotel Skyline",
      hotelAddress: "Uttarkashi, Gangotri Highway",
      contactNo: "8923184251",
      checkIn: "16/05/2026 (01:00 PM)",
      checkOut: "18/05/2026 (07:30 AM)",
      nights: 2,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-SKY-604",
      specialRequest: "Kashi Vishwanath Darshan & Gangotri trip"
    },
    {
      id: "stay-act-3",
      nightsLabel: "Night 5 (18 May)",
      city: "Phata / Guptkashi",
      hotelName: "Hotel Maa Paa",
      hotelAddress: "Phata, Kedarnath Route",
      contactNo: "9634528441",
      checkIn: "18/05/2026 (02:00 PM)",
      checkOut: "19/05/2026 (06:00 AM)",
      nights: 1,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-MP-604",
      specialRequest: "Early morning transfer to Sonprayag / Gaurikund"
    },
    {
      id: "stay-act-4",
      nightsLabel: "Night 6 (19 May)",
      city: "Kedarnath Base / Top",
      hotelName: "Bhagwari Ji (Kedarnath Tent Only)",
      hotelAddress: "Near Shri Kedarnath Temple",
      contactNo: "9068648285",
      checkIn: "19/05/2026 (04:00 PM)",
      checkOut: "20/05/2026 (07:00 AM)",
      nights: 1,
      roomType: "Tent Only",
      noOfRooms: "Group Sharing",
      mealPlan: "Room Only",
      confirmationNo: "CONF-BHAG-604",
      specialRequest: "Evening Aarti & Darshan assistance"
    },
    {
      id: "stay-act-5",
      nightsLabel: "Night 7 (20 May)",
      city: "Phata / Guptkashi",
      hotelName: "Hotel Maa Paa",
      hotelAddress: "Phata, Kedarnath Route",
      contactNo: "9634528441",
      checkIn: "20/05/2026 (02:00 PM)",
      checkOut: "21/05/2026 (08:00 AM)",
      nights: 1,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-MP-604B",
      specialRequest: "Hot dinner after Kedarnath descent"
    },
    {
      id: "stay-act-6",
      nightsLabel: "Night 8 (21 May)",
      city: "Badrinath Dham",
      hotelName: "Hotel Dhansree",
      hotelAddress: "Near Badrinath Temple",
      contactNo: "8395091744",
      checkIn: "21/05/2026 (02:00 PM)",
      checkOut: "22/05/2026 (08:30 AM)",
      nights: 1,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-DHAN-604",
      specialRequest: "Evening Aarti & Mana Village visit"
    },
    {
      id: "stay-act-7",
      nightsLabel: "Night 9 (22 May)",
      city: "Pipal Koti",
      hotelName: "Hotel Dabral",
      hotelAddress: "Pipal Koti, Badrinath Highway",
      contactNo: "7452827619",
      checkIn: "22/05/2026 (03:00 PM)",
      checkOut: "23/05/2026 (08:00 AM)",
      nights: 1,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-DAB-604",
      specialRequest: "Next day Haridwar drop"
    }
  ]
};

// Actual Old Voucher: Do Dham 6 Days (Bill No. 626 - Mr. Surendar Kumar Patti)
const PRESET_DODHAM_ACTUAL_VOUCHER: HotelVoucherData = {
  voucherNo: "BILL NO. 626",
  tripDates: "14/05/2026 TO 19/05/2026",
  bookingId: "DD-2026-626",
  dateOfIssue: "14 May 2026",
  guestName: "Mr. Surendar Kumar Patti",
  guestPhone: "9777765675",
  guestEmail: "traveltouttarakhand38@gmail.com",
  totalPax: "24+2 Members",
  totalRooms: "Hall Package (Tempo)",
  tripDuration: "Do Dham Yatra Hall Package 6 Days 2026",
  emergencyContact: "Amit Chandra: +91 9719038278 · Kuldeep: +91 8449982466",
  specialInstructions: "• Please carry valid photo ID at all hotels.\n• Hall package accommodation confirmed for group.\n• Early morning departure for Kedarnath & Badrinath Darshan.",
  inclusions: "• Hotel accommodation at Badashu, Kedarnath (Tent Only) & Pipal Koti.\n• Dedicated Tempo Traveller Haridwar to Haridwar.\n• Tolls, parking and driver charges included.",
  stays: [
    {
      id: "stay-dd-1",
      nightsLabel: "Night 1 (14 May)",
      city: "Badashu / Guptkashi",
      hotelName: "Hotel Omkara",
      hotelAddress: "Badashu, Kedarnath Route",
      contactNo: "8923334391",
      checkIn: "14/05/2026 (02:00 PM)",
      checkOut: "15/05/2026 (06:00 AM)",
      nights: 1,
      roomType: "Hall / Group Rooms",
      noOfRooms: "Hall Basis",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-OM-626",
      specialRequest: "Early transfer to Sonprayag"
    },
    {
      id: "stay-dd-2",
      nightsLabel: "Night 2 (15 May)",
      city: "Kedarnath Base / Top",
      hotelName: "Bhagwari Ji (Kedarnath Tent Only)",
      hotelAddress: "Near Kedarnath Temple",
      contactNo: "9068648285",
      checkIn: "15/05/2026 (04:00 PM)",
      checkOut: "16/05/2026 (07:00 AM)",
      nights: 1,
      roomType: "Tent Only",
      noOfRooms: "Group Sharing",
      mealPlan: "Room Only",
      confirmationNo: "CONF-BHAG-626",
      specialRequest: "Evening Aarti & Darshan"
    },
    {
      id: "stay-dd-3",
      nightsLabel: "Night 3 (16 May)",
      city: "Badashu / Guptkashi",
      hotelName: "Hotel Omkara",
      hotelAddress: "Badashu, Kedarnath Route",
      contactNo: "8923334391",
      checkIn: "16/05/2026 (02:00 PM)",
      checkOut: "17/05/2026 (07:30 AM)",
      nights: 1,
      roomType: "Hall / Group Rooms",
      noOfRooms: "Hall Basis",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-OM-626B",
      specialRequest: "Hot meals on arrival after descent"
    },
    {
      id: "stay-dd-4",
      nightsLabel: "Night 4 & 5 (17-18 May)",
      city: "Pipal Koti / Badrinath Sector",
      hotelName: "Hotel Dabral",
      hotelAddress: "Pipal Koti, Badrinath Highway",
      contactNo: "7452827619",
      checkIn: "17/05/2026 (03:00 PM)",
      checkOut: "19/05/2026 (08:00 AM)",
      nights: 2,
      roomType: "Hall / Group Rooms",
      noOfRooms: "Hall Basis",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-DAB-626",
      specialRequest: "Badrinath Darshan & 19th May Haridwar drop"
    }
  ]
};

const PRESET_CHARDHAM_12P_10D: HotelVoucherData = {
  voucherNo: "TV-2026-CH12P",
  tripDates: "May – Oct 2026",
  bookingId: "BKG-CH-12P2026",
  dateOfIssue: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  guestName: "12 Pax Pilgrimage Group",
  guestPhone: "+91 97190 38278",
  guestEmail: "amitchandra104@gmail.com",
  totalPax: "12 Persons",
  totalRooms: "Family Basis Deluxe Rooms",
  tripDuration: "10 Days / 09 Nights Chardham Tour",
  emergencyContact: "Amit Chandra · +91 9719038278, 7818952740 (24x7 Helpline)",
  specialInstructions: "• Please present this original voucher with government photo ID at check-in.\n• Kedarnath Night Stay is Tent Only without food (as per yatra norms).\n• Food arrangements are done at hotel; please reach dining hall on time.\n• Non-AC rooms in all hill areas as per mountain terrain norms.\n• Room sharing is on 2 / 3 / 4 / 6 bed family basis as confirmed.",
  inclusions: "• Confirmed Deluxe Hotel Accommodation across Barkot, Uttarkashi, Phata, Badrinath & Pipalkoti.\n• Meal Plan: MAP (Breakfast and Dinner at hotels only).\n• Dedicated 12-Pax Tempo Traveller Haridwar to Haridwar.\n• All Interstate Taxes, Tolls, Driver Allowance and Parking included.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1 & 2",
      city: "Barkot / Yamunotri Sector",
      hotelName: "Hotel / Camp Deluxe Resort",
      hotelAddress: "Barkot - Kharadi, Yamunotri Highway",
      contactNo: "+91 97190 38278",
      checkIn: "Day 1 (12:00 PM)",
      checkOut: "Day 3 (08:00 AM)",
      nights: 2,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BR-12P",
      specialRequest: "Early morning breakfast before Janki Chatti / Yamunotri trek"
    },
    {
      id: "stay-2",
      nightsLabel: "Night 3 & 4",
      city: "Uttarkashi / Gangotri Sector",
      hotelName: "Hotel Bhagirathi Deluxe",
      hotelAddress: "Gangotri Road, Uttarkashi",
      contactNo: "+91 97190 38278",
      checkIn: "Day 3 (01:00 PM)",
      checkOut: "Day 5 (07:30 AM)",
      nights: 2,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-UK-12P",
      specialRequest: "Visit Kashi Vishwanath Temple & Harsil Valley enroute"
    },
    {
      id: "stay-3",
      nightsLabel: "Night 5 & 7",
      city: "Phata / Rampur / Guptkashi",
      hotelName: "Kedar Valley Deluxe Resort",
      hotelAddress: "Phata / Sitapur / Guptkashi Road",
      contactNo: "+91 97190 38278",
      checkIn: "Day 5 (02:00 PM)",
      checkOut: "Day 8 (07:00 AM)",
      nights: 2,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-PH-12P",
      specialRequest: "Base camp transfer to Sonprayag / Gaurikund"
    },
    {
      id: "stay-4",
      nightsLabel: "Night 6",
      city: "Shri Kedarnath Dham",
      hotelName: "Kedarnath Bhawan / Camp Stay",
      hotelAddress: "Near Shri Kedarnath Ji Temple",
      contactNo: "+91 97190 38278",
      checkIn: "Day 6 (04:00 PM)",
      checkOut: "Day 7 (07:00 AM)",
      nights: 1,
      roomType: "Tent Only",
      noOfRooms: "Sharing Basis",
      mealPlan: "Room Only (Without Food)",
      confirmationNo: "CONF-KD-12P",
      specialRequest: "Darshan assistance & warm bedding arranged"
    },
    {
      id: "stay-5",
      nightsLabel: "Night 8",
      city: "Shri Badrinath Dham",
      hotelName: "Hotel Badri Kedar Deluxe",
      hotelAddress: "Near Badrinath Temple & Alaknanda River",
      contactNo: "+91 97190 38278",
      checkIn: "Day 8 (02:00 PM)",
      checkOut: "Day 9 (09:00 AM)",
      nights: 1,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BD-12P",
      specialRequest: "Taptkund holy bath, Brahma Kamal & Mana Village visit"
    },
    {
      id: "stay-6",
      nightsLabel: "Night 9",
      city: "Pipalkoti / Karanprayag / Rudraprayag",
      hotelName: "Hotel Alaknanda / Similar Deluxe",
      hotelAddress: "Badrinath - Rishikesh Highway, Pipalkoti",
      contactNo: "+91 97190 38278",
      checkIn: "Day 9 (03:00 PM)",
      checkOut: "Day 10 (07:30 AM)",
      nights: 1,
      roomType: "Deluxe Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-PK-12P",
      specialRequest: "Panch Prayag & Maa Dhari Devi Darshan on way to Haridwar"
    }
  ]
};

const PRESET_CHARDHAM_10D: HotelVoucherData = {
  voucherNo: "TV-2026-CH01",
  tripDates: "12 Sep 2026 to 20 Sep 2026",
  bookingId: "12 Sep 2026 to 20 Sep 2026",
  dateOfIssue: "10 May 2026",
  guestName: "Guest & Family",
  guestPhone: "+91 ",
  guestEmail: "",
  totalPax: "04 Adults",
  totalRooms: "02 Double Rooms",
  tripDuration: "10 Days / 09 Nights Chardham Tour",
  emergencyContact: "Mr. Amit kumar · +91 9719038278 (24x7 Helpline)",
  specialInstructions: "• Please present this original voucher with government photo ID at each hotel check-in.\n• Standard check-in time is 12:00 PM and check-out is 10:00 AM.\n• Early check-in is strictly subject to room availability upon arrival.\n• Pure vegetarian meals served across all destinations.",
  inclusions: "• Accommodation on twin sharing basis as per selected categories.\n• Meal Plan: MAP (Daily Bed Tea, Buffet Breakfast & Dinner).\n• All applicable hotel taxes and service charges included.\n• 24x7 on-call ground tour assistance.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1",
      city: "Haridwar",
      hotelName: "Hotel Ganga Regency / Similar",
      hotelAddress: "Haridwar Bypass, Near Railway Station",
      contactNo: "+91 98765 43210",
      checkIn: "15 May 2026 (12:00 PM)",
      checkOut: "16 May 2026 (10:00 AM)",
      nights: 1,
      roomType: "Deluxe AC Room",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-HW-101",
      specialRequest: "Ground or 1st floor rooms preferred"
    },
    {
      id: "stay-2",
      nightsLabel: "Night 2 & 3",
      city: "Barkot / Yamunotri",
      hotelName: "Camp & Resort Shivalik Heights",
      hotelAddress: "Kharadi, Yamunotri Highway",
      contactNo: "+91 94120 55678",
      checkIn: "16 May 2026 (01:00 PM)",
      checkOut: "18 May 2026 (08:00 AM)",
      nights: 2,
      roomType: "Luxury Cottage",
      noOfRooms: "02 Cottages",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BR-204",
      specialRequest: "Pack early breakfast for Yamunotri trek"
    },
    {
      id: "stay-3",
      nightsLabel: "Night 4 & 5",
      city: "Uttarkashi / Gangotri",
      hotelName: "Hotel Bhagirathi View",
      hotelAddress: "Netala, Gangotri Road, Uttarkashi",
      contactNo: "+91 97190 11223",
      checkIn: "18 May 2026 (02:00 PM)",
      checkOut: "20 May 2026 (07:00 AM)",
      nights: 2,
      roomType: "River View Executive Room",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-UK-305",
      specialRequest: ""
    },
    {
      id: "stay-4",
      nightsLabel: "Night 6 & 7",
      city: "Guptkashi / Sitapur",
      hotelName: "Kedar River Retreat",
      hotelAddress: "Sitapur, Near Kedarnath Helipad / Phata",
      contactNo: "+91 98371 44556",
      checkIn: "20 May 2026 (03:00 PM)",
      checkOut: "22 May 2026 (06:00 AM)",
      nights: 2,
      roomType: "Super Deluxe Room",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-GK-408",
      specialRequest: "Early morning cab transfer to helipad"
    },
    {
      id: "stay-5",
      nightsLabel: "Night 8",
      city: "Badrinath / Pipalkoti",
      hotelName: "Hotel Badri Kedar Haven",
      hotelAddress: "Main Temple Road, Badrinath Dham",
      contactNo: "+91 94111 88990",
      checkIn: "22 May 2026 (02:00 PM)",
      checkOut: "23 May 2026 (09:00 AM)",
      nights: 1,
      roomType: "Heated Premium Deluxe",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BD-509",
      specialRequest: "Room heaters arranged"
    },
    {
      id: "stay-6",
      nightsLabel: "Night 9",
      city: "Rishikesh",
      hotelName: "Divine Ganga Cottage",
      hotelAddress: "Tapovan, Luxman Jhula Road, Rishikesh",
      contactNo: "+91 135 243 1234",
      checkIn: "23 May 2026 (01:00 PM)",
      checkOut: "24 May 2026 (11:00 AM)",
      nights: 1,
      roomType: "Ganga View Deluxe",
      noOfRooms: "02 Rooms",
      mealPlan: "CP (Breakfast Only)",
      confirmationNo: "CONF-RK-601",
      specialRequest: "Late evening Ganga Aarti timing guidance"
    }
  ]
};

const PRESET_DODHAM_5D: HotelVoucherData = {
  voucherNo: "TV-2026-DD01",
  bookingId: "BKG-DD-5021",
  dateOfIssue: "10 May 2026",
  guestName: "Guest & Family",
  guestPhone: "+91 ",
  guestEmail: "",
  totalPax: "02 Adults",
  totalRooms: "01 Double Room",
  tripDuration: "05 Days / 04 Nights Do Dham Tour (Kedarnath & Badrinath)",
  emergencyContact: "Mr. Amit kumar · +91 9719038278 (24x7 Helpline)",
  specialInstructions: "• Please carry valid original government ID.\n• Kedarnath base camp check-in requires biometric yatra pass.\n• Mountain weather can be chilly; warm woolens recommended.",
  inclusions: "• Accommodation in clean deluxe hotels and hill camps.\n• Meal Plan: MAP (Daily Breakfast & Dinner).\n• All local taxes included.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1",
      city: "Haridwar / Rishikesh",
      hotelName: "Hotel Ganga Heritage",
      hotelAddress: "Haridwar, Uttarakhand",
      contactNo: "+91 98765 12345",
      checkIn: "15 May 2026 (12:00 PM)",
      checkOut: "16 May 2026 (07:00 AM)",
      nights: 1,
      roomType: "Deluxe AC Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "CONF-HW-51",
      specialRequest: ""
    },
    {
      id: "stay-2",
      nightsLabel: "Night 2 & 3",
      city: "Guptkashi / Sitapur",
      hotelName: "Kedar Valley Camp & Resort",
      hotelAddress: "Sitapur, Near Kedarnath Road",
      contactNo: "+91 98371 99887",
      checkIn: "16 May 2026 (02:00 PM)",
      checkOut: "18 May 2026 (07:00 AM)",
      nights: 2,
      roomType: "Deluxe Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "CONF-GK-52",
      specialRequest: ""
    },
    {
      id: "stay-3",
      nightsLabel: "Night 4",
      city: "Pipalkoti / Joshimath",
      hotelName: "Hotel Alaknanda View",
      hotelAddress: "Pipalkoti, Badrinath Highway",
      contactNo: "+91 94120 44332",
      checkIn: "18 May 2026 (03:00 PM)",
      checkOut: "19 May 2026 (08:00 AM)",
      nights: 1,
      roomType: "Super Deluxe Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "CONF-PK-53",
      specialRequest: ""
    }
  ]
};

const BLANK_VOUCHER: HotelVoucherData = {
  voucherNo: "TV-2026-001",
  bookingId: "BKG-2026-",
  dateOfIssue: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  totalPax: "",
  totalRooms: "",
  tripDuration: "",
  emergencyContact: "Mr. Amit kumar · +91 9719038278 (24x7 Helpline)",
  specialInstructions: "• Please present this original voucher with government photo ID at each hotel check-in.\n• Standard check-in time is 12:00 PM and check-out is 10:00 AM.\n• Early check-in is strictly subject to room availability upon arrival.",
  inclusions: "• Hotel accommodation as per confirmed room categories.\n• Meals as per specified meal plans (EP/CP/MAP/AP).\n• All applicable hotel taxes included.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1",
      city: "",
      hotelName: "",
      hotelAddress: "",
      contactNo: "",
      checkIn: "",
      checkOut: "",
      nights: 1,
      roomType: "",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "",
      specialRequest: ""
    }
  ]
};

export default function HotelVouchersPage() {
  const [data, setData] = useState<HotelVoucherData>(PRESET_CHARDHAM_10D);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Load saved voucher from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("triloki_multi_hotel_voucher");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.stays) && parsed.stays.length > 0) {
            setData(parsed);
            return;
          }
        }

        // Fetch latest saved voucher from Supabase Cloud if available
        const fetchCloudVoucher = async () => {
          try {
            const { data: cloudVoucher } = await supabase
              .from("vouchers")
              .select("document_data")
              .eq("voucher_type", "hotel_tour")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (cloudVoucher && cloudVoucher.document_data && Array.isArray((cloudVoucher.document_data as any).stays)) {
              setData(cloudVoucher.document_data as HotelVoucherData);
              localStorage.setItem("triloki_multi_hotel_voucher", JSON.stringify(cloudVoucher.document_data));
            }
          } catch {}
        };
        fetchCloudVoucher();
      } catch (err) {
        console.warn("Could not load stored hotel voucher:", err);
      }
    }
  }, []);

  // Save changes to localStorage
  const updateData = (newData: HotelVoucherData) => {
    setData(newData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("triloki_multi_hotel_voucher", JSON.stringify(newData));
      } catch (e) {}
    }
  };

  // Auto-fit screen and fit-width scaling
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const el = previewContainerRef.current;
      const padX = 40;
      const padY = 40;
      const availW = Math.max(300, el.clientWidth - padX);
      const availH = Math.max(300, el.clientHeight - padY);

      const scaleW = availW / 794;
      const scaleH = availH / 1122;

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
  }, [isFormCollapsed, fitMode, data.stays.length]);

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

  // Stay List Management
  const addStay = () => {
    const nextNight = data.stays.length + 1;
    const newStay: HotelStay = {
      id: `stay-${Date.now()}`,
      nightsLabel: `Night ${nextNight}`,
      city: "",
      hotelName: "",
      hotelAddress: "",
      contactNo: "",
      checkIn: "",
      checkOut: "",
      nights: 1,
      roomType: "Deluxe Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "",
      specialRequest: ""
    };
    updateData({ ...data, stays: [...data.stays, newStay] });
  };

  const updateStay = (index: number, updated: Partial<HotelStay>) => {
    const updatedStays = [...data.stays];
    updatedStays[index] = { ...updatedStays[index], ...updated };
    updateData({ ...data, stays: updatedStays });
  };

  const removeStay = (index: number) => {
    if (data.stays.length <= 1) {
      alert("A voucher must have at least one hotel/hostel stay.");
      return;
    }
    const updatedStays = data.stays.filter((_, i) => i !== index);
    updateData({ ...data, stays: updatedStays });
  };

  const duplicateStay = (index: number) => {
    const source = data.stays[index];
    const cloned: HotelStay = {
      ...source,
      id: `stay-${Date.now()}`,
      nightsLabel: `Night ${index + 2}`
    };
    const updatedStays = [...data.stays];
    updatedStays.splice(index + 1, 0, cloned);
    updateData({ ...data, stays: updatedStays });
  };

  const moveStay = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data.stays.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updatedStays = [...data.stays];
    const temp = updatedStays[index];
    updatedStays[index] = updatedStays[targetIndex];
    updatedStays[targetIndex] = temp;
    updateData({ ...data, stays: updatedStays });
  };

  // High-Resolution 1-Page PDF Download (Clean A4 without splitting)
  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById("print-multi-hotel-voucher");
      if (!element) {
        alert("Could not find the print voucher container.");
        setIsDownloading(false);
        return;
      }

      // Record in Supabase if online
      try {
        if (data.guestName) {
          await supabase.from("vouchers").insert({
            voucher_type: "hotel_tour",
            guest_name: data.guestName,
            document_data: data
          });
        }
      } catch (dbError) {
        console.warn("Cloud backup notice:", dbError);
      }

      // Record in local Document Hub
      try {
        saveDocumentToHub({
          id: `hotel-${data.voucherNo || Date.now()}`,
          type: "hotel_voucher",
          title: `Hotel Voucher - ${data.guestName || "Tour"}`,
          docNumber: data.voucherNo || "TV-2026",
          guestName: data.guestName || "Valued Guest",
          guestPhone: data.guestPhone || "",
          travelDates: data.tripDates || data.bookingId || "",
          paxCount: data.totalPax || "",
          detailsSummary: `${data.stays.length} Hotel/Camp Stay(s): ${data.stays.map(s => s.city || s.hotelName).filter(Boolean).join(", ")}`,
          studioUrl: "/hotels",
          rawPayload: data
        });
      } catch (hubErr) {
        console.warn("Local hub save:", hubErr);
      }

      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF;

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false 
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaled dimensions to ensure 100% fit on a single A4 page without cutting
      const rawPdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const fitScale = rawPdfHeight > pageHeight ? (pageHeight / rawPdfHeight) : 1;
      const finalPdfWidth = pdfWidth * fitScale;
      const finalPdfHeight = rawPdfHeight * fitScale;
      const xOffset = (pdfWidth - finalPdfWidth) / 2;
      
      pdf.addImage(imgData, "JPEG", xOffset, 0, finalPdfWidth, finalPdfHeight);

      // Add clickable PDF link annotations
      try {
        const linkEls = element.querySelectorAll("a[href], [data-pdf-link]");
        const containerRect = element.getBoundingClientRect();
        linkEls.forEach((linkNode) => {
          const rect = linkNode.getBoundingClientRect();
          const targetUrl = linkNode.getAttribute("data-pdf-link") || (linkNode as HTMLAnchorElement).href;
          if (targetUrl && rect.width > 0 && rect.height > 0 && containerRect.width > 0 && containerRect.height > 0) {
            const x = xOffset + ((rect.left - containerRect.left) / containerRect.width) * finalPdfWidth;
            const y = ((rect.top - containerRect.top) / containerRect.height) * finalPdfHeight;
            const w = (rect.width / containerRect.width) * finalPdfWidth;
            const h = (rect.height / containerRect.height) * finalPdfHeight;
            pdf.link(x, y, w, h, { url: targetUrl });
          }
        });
      } catch (linkErr) {
        console.warn("Could not attach PDF link annotations:", linkErr);
      }
      
      const safeName = data.guestName ? data.guestName.replace(/[^a-zA-Z0-9]/g, "_") : "Tour";
      pdf.save(`Hotel_Stay_Voucher_${safeName}_${data.voucherNo || "Doc"}.pdf`);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // WhatsApp formatted share message
  const handleShareWhatsApp = () => {
    let message = `*🏨 HOTEL & STAY SERVICE VOUCHER*\n`;
    message += `*Travel to Uttarakhand - Devbhoomi Hospitality*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 *Voucher No:* ${data.voucherNo || "N/A"}\n`;
    message += `👤 *Guest Name:* ${data.guestName || "Guest"}\n`;
    message += `👥 *Total Pax:* ${data.totalPax || "N/A"} (${data.totalRooms || "N/A"})\n`;
    message += `🗓 *Duration:* ${data.tripDuration || "Tour Stay"}\n\n`;
    message += `*CONFIRMED HOTEL / HOSTEL STAYS:*\n`;

    data.stays.forEach((stay, idx) => {
      message += `\n📍 *${stay.nightsLabel || `Stop ${idx + 1}`}: ${stay.city || "Destination"}*\n`;
      message += `• *Hotel:* ${stay.hotelName || "Hotel / Resort"}\n`;
      if (stay.roomType) message += `• *Room:* ${stay.roomType} (${stay.noOfRooms})\n`;
      if (stay.mealPlan) message += `• *Meal Plan:* ${stay.mealPlan}\n`;
      if (stay.contactNo) message += `• *Hotel Contact:* ${stay.contactNo}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📞 *24x7 Operations Helpline:* ${data.emergencyContact}\n`;
    message += `🌐 *Website:* https://traveltouttrakhand.com\n\n`;
    message += `Wishing you a spiritually enriching and pleasant pilgrimage! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  // Render the voucher document - Exactly 1 A4 Page (1122px height) with Zero Cutoff
  const renderVoucherContent = (prefix: string) => (
    <div 
      id={`${prefix}-multi-hotel-voucher`} 
      className="w-[794px] h-[1122px] min-h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        
        {/* TOP SECTION: Header, Meta, Guest & Stays */}
        <div className="space-y-2.5">
          {/* Brand & Helpline Header: 2-Column Layout */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-sky-100 gap-4">
            {/* Left: Prominent Logo & Company Name */}
            <div className="flex items-center gap-3.5 min-w-0">
              <img src="/logo.png" alt="Travel to Uttarakhand" className="h-20 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h2 className="text-[19px] font-serif font-black tracking-tight text-[#0369a1] leading-none uppercase whitespace-nowrap">
                  Travel to Uttarakhand
                </h2>
                <p className="text-[11px] font-semibold text-gray-500 tracking-wider mt-0.5 whitespace-nowrap">
                  Devbhoomi Pilgrimage & Spiritual Stays
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#dc2626] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shrink-0">
                    CONFIRMED LODGING
                  </span>
                  <a
                    href="https://traveltouttrakhand.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-pdf-link="https://traveltouttrakhand.com"
                    className="text-[11px] font-bold text-[#0369a1] hover:underline flex items-center gap-1 shrink-0"
                  >
                    🌐 traveltouttrakhand.com
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Compact Voucher Title & 24/7 Helpline Badge */}
            <div className="text-right flex flex-col items-end shrink-0 w-[235px]">
              <div className="bg-[#0369a1] text-white px-3 py-1 rounded-md shadow-xs">
                <span className="text-[12px] font-serif font-bold uppercase tracking-widest whitespace-nowrap">
                  HOTEL SERVICE VOUCHER
                </span>
              </div>
              
              {/* 24x7 Helpline Badge */}
              <div className="mt-1.5 bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1 text-right w-full">
                <div className="text-[9.5px] uppercase font-bold text-emerald-800 tracking-wider flex items-center justify-end gap-1">
                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">24x7 Operations Helpline</span>
                </div>
                <div className="text-[11px] font-black text-emerald-950 tracking-tight mt-0.5 leading-tight">
                  {data.emergencyContact || "+91 9719038278"}
                </div>
              </div>
            </div>
          </div>

          {/* Reference Meta Bar */}
          <div className="bg-sky-50/90 border border-sky-200 rounded-lg py-1 px-3.5 text-[12px] text-gray-800 flex justify-between items-center font-medium">
            <span>Voucher No: <strong className="text-[#0369a1] font-bold text-[12.5px]">{data.voucherNo || "N/A"}</strong></span>
            <span>Trip Dates: <strong className="text-gray-900 font-bold text-[12.5px]">{data.tripDates || data.bookingId || "12 Sep 2026 to 20 Sep 2026"}</strong></span>
            <span>Issue Date: <strong className="text-gray-900 font-bold text-[12.5px]">{data.dateOfIssue || "N/A"}</strong></span>
          </div>

          {/* Guest & Trip Details Banner */}
          <div className="border border-gray-200 rounded-lg py-1.5 px-3 bg-gray-50/90 grid grid-cols-2 gap-2.5 text-[12px]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                <span className="text-gray-600 font-medium">Lead Guest:</span>
                <span className="font-bold text-gray-900 text-[12.5px]">{data.guestName || "Valued Traveler"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                <span className="text-gray-600 font-medium">Phone:</span>
                <span className="font-bold text-gray-800 text-[12px]">{data.guestPhone || "Provided on record"}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                <span className="text-gray-600 font-medium">Duration:</span>
                <span className="font-bold text-[#0369a1] text-[12.5px]">{data.tripDuration || "Full Tour"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                <span className="text-gray-600 font-medium">Occupancy:</span>
                <span className="font-bold text-gray-800 text-[12px]">{data.totalPax || "N/A"} · {data.totalRooms || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* COMPLETE STAY SCHEDULE TABLE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-[12.5px] uppercase tracking-wider text-[#0369a1] flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Confirmed Stay Itinerary ({data.stays.length} Destinations / Properties)</span>
              </h3>
              <span className="text-[10.5px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                100% Confirmed
              </span>
            </div>

            <div className="rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-[#0369a1] text-white text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-1.5 px-3 w-[15%]">Nights</th>
                    <th className="py-1.5 px-3 w-[18%]">Destination</th>
                    <th className="py-1.5 px-3 w-[37%]">Confirmed Hotel & Location</th>
                    <th className="py-1.5 px-3 w-[30%]">Room & Meal Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {data.stays.map((stay, idx) => (
                    <tr key={stay.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-sky-50/30"}>
                      <td className="py-1.5 px-3 font-bold text-gray-900 align-top">
                        <div className="text-[12.5px] font-bold text-gray-900 leading-tight">{stay.nightsLabel}</div>
                        <div className="text-[10.5px] text-gray-600 font-semibold mt-0.5">
                          {stay.nights} Nt{stay.nights > 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="py-1.5 px-3 font-bold text-[#0369a1] align-top">
                        <div className="flex items-center gap-1 text-[12.5px] leading-tight">
                          <MapPin className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                          <span>{stay.city || "—"}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 align-top">
                        <div className="font-bold text-gray-900 text-[12.5px] leading-snug">{stay.hotelName || "Hotel / Camp"}</div>
                        {stay.hotelAddress && (
                          <div className="text-[11px] text-gray-700 font-medium truncate max-w-[270px] leading-tight mt-0.5">
                            📍 {stay.hotelAddress}
                          </div>
                        )}
                        {stay.contactNo && (
                          <div className="text-[11px] text-gray-800 font-bold mt-0.5">
                            📞 {stay.contactNo}
                          </div>
                        )}
                        {stay.specialRequest && (
                          <div className="text-[10px] text-amber-950 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block font-semibold">
                            Note: {stay.specialRequest}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-3 align-top">
                        <div className="font-bold text-gray-900 text-[12px] leading-tight">
                          {stay.roomType || "Standard Room"} {stay.noOfRooms ? `(${stay.noOfRooms})` : ""}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          {stay.mealPlan ? stay.mealPlan : "MAP Plan"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* INCLUSIONS & POLICIES */}
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="space-y-0.5">
              <h4 className="font-bold text-[#0369a1] uppercase text-[11px] tracking-wider">
                Package Stay Inclusions:
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-0.5 leading-snug text-gray-800 font-medium">
                {data.inclusions.split("\n").filter(Boolean).map((inc, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{inc.replace(/^•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-0.5">
              <h4 className="font-bold text-[#dc2626] uppercase text-[11px] tracking-wider">
                Important Stay Guidelines:
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-0.5 leading-snug text-gray-800 font-medium">
                {data.specialInstructions.split("\n").filter(Boolean).map((ins, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold shrink-0">ℹ</span>
                    <span>{ins.replace(/^•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Compact Footer Bar */}
        <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center text-[10.5px] text-gray-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-gray-800 font-bold">Travel to Uttarakhand</span>
            <span>·</span>
            <span>Regd. Pilgrimage Tour Operator</span>
          </div>
          <div className="text-center font-serif font-bold text-[#0369a1]">
            ॐ नमः शिवाय
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://traveltouttrakhand.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              data-pdf-link="https://traveltouttrakhand.com" 
              className="font-bold text-[#0369a1] hover:underline"
            >
              traveltouttrakhand.com
            </a>
            <span>·</span>
            <span className="font-semibold text-gray-700">Page 1 of 1</span>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full h-[calc(100vh-5rem)]">
      
      {/* Left Column: Multi-Stay Form Controls */}
      {!isFormCollapsed && (
        <div className="w-full lg:w-[42%] bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-y-auto shrink-0 h-full space-y-4 transition-all duration-300 custom-scrollbar">
          
          {/* Header & Quick Preset Bar */}
          <div className="pb-3 border-b border-gray-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0369a1] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">Hotel Voucher Studio</h1>
                  <p className="text-xs text-gray-500">Multi-Hotel Tour Accommodation (5–10+ Days)</p>
                </div>
              </div>
              <button
                onClick={() => updateData(BLANK_VOUCHER)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
                title="Clear all fields and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Quick Load:</span>
              <button
                onClick={() => updateData(PRESET_CHARDHAM_ACTUAL_VOUCHER)}
                className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold transition shadow-xs cursor-pointer"
                title="Client Voucher: Chardham 10D (Bill 604 - Mr. Jayesh Patel, Hotel Sarutal, Skyline, Maa Paa, Dhansree)"
              >
                ★ Chardham 10D (Bill 604)
              </button>
              <button
                onClick={() => updateData(PRESET_DODHAM_ACTUAL_VOUCHER)}
                className="px-2 py-1 bg-purple-600 text-white hover:bg-purple-700 rounded text-xs font-bold transition shadow-xs cursor-pointer"
                title="Client Voucher: Do Dham 6D (Bill 626 - Mr. Surendar Patti, Hotel Omkara, Dabral)"
              >
                ★ Do Dham 6D (Bill 626)
              </button>
              <button
                onClick={() => updateData(PRESET_CHARDHAM_12P_10D)}
                className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded text-xs font-semibold transition cursor-pointer"
                title="10 Days / 9 Nights Chardham for 12 Pax Tempo Traveller"
              >
                10D Chardham (12 Pax Deluxe)
              </button>
              <button
                onClick={() => updateData(PRESET_CHARDHAM_10D)}
                className="px-2 py-1 bg-sky-50 text-[#0369a1] hover:bg-sky-100 border border-sky-200 rounded text-xs font-semibold transition cursor-pointer"
              >
                10D Chardham (4 Pax)
              </button>
              <button
                onClick={() => updateData(PRESET_DODHAM_5D)}
                className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded text-xs font-semibold transition cursor-pointer"
              >
                5D Do Dham
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* 1. Voucher Meta Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">1. Voucher & Booking Details</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Voucher No.</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" 
                    value={data.voucherNo} 
                    onChange={e => updateData({ ...data, voucherNo: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Trip Dates</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-[#0369a1]" 
                    placeholder="e.g. 12 Sep 2026 to 20 Sep 2026"
                    value={data.tripDates ?? data.bookingId ?? ""} 
                    onChange={e => updateData({ ...data, tripDates: e.target.value, bookingId: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Issue Date</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    value={data.dateOfIssue} 
                    onChange={e => updateData({ ...data, dateOfIssue: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Tour Name / Duration</label>
                <input 
                  type="text" 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" 
                  placeholder="e.g. 10 Days / 09 Nights Chardham Deluxe Tour" 
                  value={data.tripDuration} 
                  onChange={e => updateData({ ...data, tripDuration: e.target.value })} 
                />
              </div>
            </div>

            {/* 2. Lead Guest Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">2. Guest & Pax Information</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Lead Guest Name</label>
                  <input 
                    type="text" 
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900" 
                    placeholder="e.g. Mr. Rajesh Sharma" 
                    value={data.guestName} 
                    onChange={e => updateData({ ...data, guestName: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="+91 98765 43210" 
                    value={data.guestPhone} 
                    onChange={e => updateData({ ...data, guestPhone: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Total Pax</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="e.g. 04 Adults, 01 Child" 
                    value={data.totalPax} 
                    onChange={e => updateData({ ...data, totalPax: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Rooms Count</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="e.g. 02 Double Rooms" 
                    value={data.totalRooms} 
                    onChange={e => updateData({ ...data, totalRooms: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* 3. MULTI-HOTEL / HOSTEL STAYS LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wider block">
                  3. Confirmed Stays ({data.stays.length} Hotels / Hostels)
                </span>
                <button
                  type="button"
                  onClick={addStay}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stay</span>
                </button>
              </div>

              {data.stays.map((stay, idx) => (
                <div key={stay.id || idx} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5 relative">
                  
                  {/* Top Bar for this stay */}
                  <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0369a1] text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input 
                        type="text" 
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1] w-32" 
                        placeholder="Night 1" 
                        value={stay.nightsLabel} 
                        onChange={e => updateStay(idx, { nightsLabel: e.target.value })} 
                      />
                      <input 
                        type="text" 
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-800 w-36" 
                        placeholder="City (e.g. Barkot)" 
                        value={stay.city} 
                        onChange={e => updateStay(idx, { city: e.target.value })} 
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStay(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStay(idx, "down")}
                        disabled={idx === data.stays.length - 1}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateStay(idx)}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded cursor-pointer"
                        title="Duplicate this stay"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStay(idx)}
                        className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                        title="Delete stay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hotel Name & Address */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotel / Hostel / Camp Name</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900" 
                      placeholder="e.g. Hotel Shivalik Heights" 
                      value={stay.hotelName} 
                      onChange={e => updateStay(idx, { hotelName: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Address / Landmark</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                      placeholder="e.g. Main Highway, Barkot, Uttarakhand" 
                      value={stay.hotelAddress} 
                      onChange={e => updateStay(idx, { hotelAddress: e.target.value })} 
                    />
                  </div>

                  {/* Nights Count, Room Category, Rooms Count, Meal Plan */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Nights</label>
                      <input 
                        type="number" 
                        min={1} 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" 
                        value={stay.nights} 
                        onChange={e => updateStay(idx, { nights: Number(e.target.value) || 1 })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Room Category</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                        placeholder="Deluxe Room" 
                        value={stay.roomType} 
                        onChange={e => updateStay(idx, { roomType: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Rooms Count</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                        placeholder="02 Rooms" 
                        value={stay.noOfRooms} 
                        onChange={e => updateStay(idx, { noOfRooms: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Meal Plan</label>
                      <select
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-emerald-700"
                        value={stay.mealPlan}
                        onChange={e => updateStay(idx, { mealPlan: e.target.value })}
                      >
                        <option value="MAP (Breakfast + Dinner)">MAP (Breakfast + Dinner)</option>
                        <option value="CP (Bed & Breakfast)">CP (Bed & Breakfast)</option>
                        <option value="AP (All Meals)">AP (All Meals)</option>
                        <option value="EP (Room Only)">EP (Room Only)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Category Chips with Tent Only */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-medium">Category:</span>
                    {["Deluxe Room", "Tent Only", "Super Deluxe", "Family Quad", "Hall / Group Rooms"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateStay(idx, { 
                          roomType: cat,
                          ...(cat === "Tent Only" ? { mealPlan: "EP (Room Only)" } : {})
                        })}
                        className={`text-[9.5px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          stay.roomType === cat 
                            ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs" 
                            : cat === "Tent Only"
                            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 font-semibold"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {cat === "Tent Only" ? "⛺ Tent Only" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Hotel Phone */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Phone / Reception</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                      placeholder="+91 94120 XXXXX" 
                      value={stay.contactNo} 
                      onChange={e => updateStay(idx, { contactNo: e.target.value })} 
                    />
                  </div>

                  {/* Special Requests / Notes */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Special Requests / Room Preferences</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                      placeholder="e.g. Ground floor for senior citizen / river facing" 
                      value={stay.specialRequest || ""} 
                      onChange={e => updateStay(idx, { specialRequest: e.target.value })} 
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* 4. Inclusions & Policies */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">4. Inclusions & Stay Policies</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Inclusions (one per line)</label>
                <textarea 
                  rows={3} 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs leading-relaxed" 
                  value={data.inclusions} 
                  onChange={e => updateData({ ...data, inclusions: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Important Guidelines (one per line)</label>
                <textarea 
                  rows={3} 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs leading-relaxed" 
                  value={data.specialInstructions} 
                  onChange={e => updateData({ ...data, specialInstructions: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">24x7 Emergency Contact</label>
                <input 
                  type="text" 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" 
                  value={data.emergencyContact} 
                  onChange={e => updateData({ ...data, emergencyContact: e.target.value })} 
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Right Column: Live Centered Preview */}
      <div className={`flex flex-col gap-3 transition-all duration-300 h-full ${isFormCollapsed ? "w-full" : "w-full lg:w-[58%]"}`}>
        
        {/* Sleek Toolbar */}
        <div className="bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Collapse & Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition cursor-pointer"
              title={isFormCollapsed ? "Show Edit Form" : "Expand Full Preview"}
            >
              {isFormCollapsed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

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
              title="Zoom to Fit Width"
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
              title="Fit Page on Screen"
            >
              Fit Page
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Share confirmed hotels via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
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

        {/* Centered Preview Viewport */}
        <div 
          ref={previewContainerRef}
          className="w-full flex-1 overflow-auto bg-slate-200/90 p-4 rounded-2xl flex flex-col items-center justify-start custom-scrollbar relative"
        >
          <div
            style={{
              width: `${Math.round(794 * currentScale)}px`,
              minHeight: `${Math.round(1122 * currentScale)}px`,
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
            >
              {renderVoucherContent("view")}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Print Container for Multi-Page PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderVoucherContent("print")}
      </div>

    </div>
  );
}
