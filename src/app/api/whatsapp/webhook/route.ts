import { NextRequest, NextResponse } from "next/server";
import { matchBotResponse } from "@/lib/botRules";
import { supabase } from "@/lib/supabase";

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

        const ACTIVE_WORKING_TOKEN = "EAAT7x0bHdhABShqV9ZAc3gsn4ABlXvNXHwzcm2xi9x9hiILpwEaU2cb2r3h7dY7atZAgyKP88bLGgNwxSZAFCYtnJQiXmykP4TvsiugubZCf4YGqqG1lNH9g8oj4ZBmpfB9NfTISzbxAujSZBZBN9Wan1O0QXiQ0nyZBrt1dUtYFxXZB6JEHhZB7yb0FpS63ZCklgZDZD";
        let phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID || "1291621467367556";
        let accessToken = process.env.META_WA_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN || ACTIVE_WORKING_TOKEN;

        // If env has the old unassigned token (starting with EAAT7x0bHdhABSlxA), use the verified active token
        if (accessToken.includes("ABSlxA") || !accessToken.startsWith("EAAT")) {
          accessToken = ACTIVE_WORKING_TOKEN;
        }

        if (phoneNumberId && accessToken && senderPhone) {
          const metaApiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
          
          try {
            const metaRes = await fetch(metaApiUrl, {
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

            const metaData = await metaRes.json();
            console.log(`Automated reply result to ${senderPhone}:`, JSON.stringify(metaData));
          } catch (metaErr) {
            console.error("Failed to send WhatsApp message via Meta API:", metaErr);
          }

          // Auto-capture or sync lead in Supabase
          try {
            const { data: existingLead } = await supabase
              .from("leads")
              .select("id")
              .eq("phone", senderPhone)
              .limit(1)
              .maybeSingle();

            if (!existingLead) {
              await supabase.from("leads").insert([
                {
                  name: `WhatsApp Lead (+${senderPhone.slice(-4)})`,
                  phone: senderPhone,
                  destination: matched.ruleId === "helicopter" ? "Kedarnath Copter Inquiry" : "Chardham / Uttarakhand",
                  notes: `Inquiry: "${messageText}" | Bot Action: ${matched.title}`,
                  status: "inquiry"
                }
              ]);
            } else {
              await supabase.from("leads").update({
                notes: `Inquiry: "${messageText}" | Bot Action: ${matched.title}`,
                destination: matched.ruleId === "helicopter" ? "Kedarnath Copter Inquiry" : "Chardham / Uttarakhand"
              }).eq("id", existingLead.id);
            }
          } catch (leadErr) {
            console.warn("Auto-lead creation error:", leadErr);
          }
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
