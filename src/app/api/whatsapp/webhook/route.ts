import { NextRequest, NextResponse } from "next/server";
import { matchBotResponse } from "@/lib/botRules";

// Webhook Verification (GET request from Meta when configuring Webhook URL)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_WA_WEBHOOK_VERIFY_TOKEN || "triloki_wa_webhook_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("META WEBHOOK VERIFIED SUCCESSFULLY!");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden: Invalid verification token", { status: 403 });
}

// Incoming Message Webhook Event (POST request from Meta)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify it is a WhatsApp business account notification
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const senderPhone = message.from; // e.g. "919719038278"
        const messageType = message.type;
        const messageText = messageType === "text" ? message.text?.body : "";

        console.log(`INCOMING WA MESSAGE from ${senderPhone}: ${messageText}`);

        // Match bot rules
        const matched = matchBotResponse(messageText || "");
        console.log(`Matched Rule: ${matched.title} (${matched.ruleId})`);

        // Send automated response back via Meta Graph API
        const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID || "1323440530852624";
        const accessToken = process.env.META_WA_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN;

        if (phoneNumberId && accessToken && senderPhone) {
          const metaApiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
          
          await fetch(metaApiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: senderPhone,
              type: "text",
              text: {
                preview_url: true,
                body: matched.response
              }
            })
          });

          console.log(`Automated reply sent successfully to ${senderPhone}`);
        }
      }
    }

    // Meta expects 200 OK immediately for all webhook callbacks
    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Still return 200 to prevent Meta from disabling webhook endpoint
    return NextResponse.json({ status: "ERROR", error: error.message }, { status: 200 });
  }
}
