import { NextRequest, NextResponse } from "next/server";

interface SendWhatsAppRequest {
  phone: string;
  customerName: string;
  yatraName: string;
  bookingId?: string;
  travelDates?: string;
  paxCount?: string;
  totalAmount?: number | string;
  advancePaid?: number | string;
  balanceDue?: number | string;
  customMessage?: string;
  templateName?: string;
  // Optional direct API credentials override from client settings
  phoneNumberId?: string;
  accessToken?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendWhatsAppRequest = await req.json();
    const {
      phone,
      customerName,
      yatraName,
      bookingId,
      travelDates,
      paxCount,
      totalAmount,
      advancePaid,
      balanceDue,
      customMessage,
      phoneNumberId,
      accessToken,
    } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    // Clean phone number: remove all non-digits, ensure country code 91 for India if 10 digits
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    } else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = `91${cleanPhone.slice(1)}`;
    }

    // Retrieve Meta Cloud API Credentials from env or request override
    const metaPhoneNumberId = phoneNumberId?.trim() || process.env.META_WA_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID;
    const metaAccessToken = accessToken?.trim() || process.env.META_WA_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN;

    if (!metaPhoneNumberId || !metaAccessToken) {
      return NextResponse.json({
        success: false,
        error: "Meta WhatsApp Cloud API credentials (Phone Number ID & Access Token) are not configured. Please configure them in CRM Settings.",
        needsConfiguration: true
      }, { status: 400 });
    }

    // Default formatted spiritual booking confirmation message
    const formattedText = customMessage || (
      `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏\n\n` +
      `*DEV BHOOMI YATRA BOOKING CONFIRMATION*\n` +
      `*Travel to Uttarakhand*\n\n` +
      `Dear *${customerName || "Devotee / Valued Guest"}*,\n` +
      `Warm greetings from Travel to Uttarakhand! Your sacred pilgrimage booking has been successfully confirmed. 🚩\n\n` +
      `📋 *Booking Details:*\n` +
      `• *Yatra Package:* ${yatraName || "Chardham Yatra 2026"}\n` +
      (bookingId ? `• *Booking ID / File:* ${bookingId}\n` : "") +
      (travelDates ? `• *Travel Dates:* ${travelDates}\n` : "") +
      (paxCount ? `• *Pilgrims (Pax):* ${paxCount}\n` : "") +
      (totalAmount ? `• *Total Package Cost:* ₹${Number(totalAmount).toLocaleString("en-IN")}\n` : "") +
      (advancePaid ? `• *Advance Received:* ₹${Number(advancePaid).toLocaleString("en-IN")}\n` : "") +
      (balanceDue ? `• *Balance Due:* ₹${Number(balanceDue).toLocaleString("en-IN")}\n` : "") +
      `\n` +
      `✨ *Pilgrimage Guidelines:*\n` +
      `• Please keep your Char Dham Biometric / Yatra Registration Pass handy.\n` +
      `• Carry original Aadhaar/Government ID and warm woolens.\n` +
      `• Your driver and hotel vouchers will be sent 24 hours prior to travel.\n\n` +
      `📞 *24x7 Yatra Helpline:* +91 9719038278 (Mr. Amit Kumar)\n` +
      `🌐 *Website:* https://traveltouttrakhand.com\n\n` +
      `May Baba Kedar and Badri Vishal bless your sacred pilgrimage with peace, health and divinity! 🌸🛕`
    );

    // Call Meta Graph API v22.0
    const metaApiUrl = `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: {
        preview_url: true,
        body: formattedText
      }
    };

    const metaRes = await fetch(metaApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resJson = await metaRes.json();

    if (!metaRes.ok) {
      const errorMsg = resJson?.error?.message || "Failed to send message via Meta Cloud API";
      const errorDetails = resJson?.error?.error_data?.details || resJson?.error?.error_user_msg || "";
      return NextResponse.json({
        success: false,
        error: `${errorMsg} ${errorDetails ? `(${errorDetails})` : ""}`,
        metaError: resJson?.error
      }, { status: metaRes.status });
    }

    return NextResponse.json({
      success: true,
      messageId: resJson?.messages?.[0]?.id,
      cleanPhone,
      textSent: formattedText
    });
  } catch (err: any) {
    console.error("WhatsApp Cloud API error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Internal server error while sending WhatsApp message."
    }, { status: 500 });
  }
}
