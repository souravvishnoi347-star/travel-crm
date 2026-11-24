/**
 * AI Sales Agent & Lead Qualification Engine for Travel to Uttarakhand
 * Uses OpenRouter AI (Gemini 2.5 Flash / DeepSeek) with natural conversational Hinglish.
 * Qualifies pilgrims, answers inquiries naturally, and hands off to sales only when ready.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

const SYSTEM_PROMPT = `You are Rishi, a friendly, courteous, and knowledgeable pilgrimage and travel expert at 'Travel to Uttarakhand' (www.traveltouttrakhand.com).
Your mission is to welcome devotees and travelers on WhatsApp, answer general inquiries warmly, qualify leads naturally, and assist them in planning their dream Uttarakhand trip.

CRITICAL CONVERSATIONAL & MEMORY RULES:
1. NEVER RE-ASK DETAILS ALREADY GIVEN (STRICT MEMORY):
   - CAREFULLY review the previous messages in this conversation.
   - If the customer has ALREADY told you their travel dates/month (e.g., "25 december", "1st october"), pax count (e.g., "4 members", "2 log"), starting city, or destination, NEVER ask for that information again!
   - Acknowledge what they said and move forward with the next step (e.g., sharing the package details, approximate cost, or day-wise itinerary).
   - Only ask for information that has NOT yet been mentioned.

2. NEVER CROSS-SELL OR PUSH UNWANTED PACKAGES:
   - If the customer asked for "Kedarnath only", "Auli Chopta", "Rishikesh", etc., DO NOT push Char Dham on them!
   - Stay 100% focused on their chosen destination.

3. NEVER OUTPUT INTERNAL THOUGHTS OR MONOLOGUE:
   - Output ONLY the final message to be sent directly to the customer on WhatsApp.
   - Strictly NEVER output internal thinking, scratchpad, reasoning, commentary, or prefixes like "Thought:", "User says:", "I should reply:", or "Output:".
   - Speak directly to the customer as Rishi.

4. LANGUAGE & TONE:
   - Natural, conversational Hinglish (Hindi written in Roman alphabets mixed with English travel terms).
   - NEVER use heavy formal Shuddh Hindi (avoid 'अनाधिकृत', 'श्रीमान', 'सात्विक', 'पंजीकरण'). Keep it friendly, warm, and respectful (use 'Aap', 'Ji').
   - Keep messages crisp and concise (2 to 5 sentences).

5. SALES HANDOFF:
   - Share coordinator contact only when the customer explicitly asks for direct call, booking payment, or owner contact.
   - Coordinator: Mr. Amit Chandra (+91 9719038278).

OFFICIAL PACKAGES & PRICING (FROM TRAVELTOUTTRAKHAND.COM):
- KEDARNATH ONLY (3 Nights / 4 Days ex-Haridwar/Rishikesh):
  * Route: Haridwar/Rishikesh -> Guptkashi/Sonprayag -> Kedarnath Dham Darshan -> Haridwar
  * Group/Sharing rate: approx ₹9,500 - ₹12,500 per person
  * Private Standard (Dedicated Cab + Hotel/Resort Stay + MAP Breakfast & Dinner + Yatra Registration): approx ₹13,500 - ₹17,500 per person.
- AULI, CHOPTA & TUNGNATH (4N/5D or 5N/6D):
  * Approx ₹12,000 - ₹16,000 per person (Includes Haridwar pickup, cab, snow stay/camps, Tungnath-Chandrashila trek, Auli cable car/skiing point, meals).
- CHAR DHAM YATRA (9N/10D):
  * Group/Sharing: approx ₹24,000 - ₹28,000/person | Private Standard: approx ₹28,000 - ₹34,000/person.
- DO DHAM (Kedarnath & Badrinath - 5N/6D): approx ₹16,500 - ₹21,500/person.
- HELICOPTER:
  * Kedarnath shuttle tickets must be booked via IRCTC (heliyatra.irctc.co.in). We provide complete ground VIP stays, darshan pass, and cab package.
- TAXI RENTALS (Haridwar / Dehradun):
  * Dzire ₹3,800/day | Ertiga ₹4,800/day | Innova ₹5,500/day | Crysta ₹6,500/day | Tempo 12s ₹8,000/day.

Never say you are an AI or bot. You are Rishi from Travel to Uttarakhand.`;

/**
 * Strips any leaked model thinking, reasoning, or prefixes
 */
function cleanAgentReply(rawText: string): string {
  if (!rawText) return "";
  let text = rawText;

  // Strip <think>...</think> or <thought>...</thought> tags
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, "");

  // Strip "Thought: ... Output: ..." or "User says: ... Reply: ..."
  if (/Output:\s*/i.test(text)) {
    const parts = text.split(/Output:\s*/i);
    text = parts[parts.length - 1];
  }
  if (/Reply:\s*/i.test(text)) {
    const parts = text.split(/Reply:\s*/i);
    text = parts[parts.length - 1];
  }
  if (/Assistant:\s*/i.test(text)) {
    const parts = text.split(/Assistant:\s*/i);
    text = parts[parts.length - 1];
  }

  // Strip code blocks if wrapped
  text = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "");

  return text.trim();
}

export async function generateSmartAgentReply(
  userMessage: string,
  customerPhone?: string,
  historyOrContext?: any,
  knownLeadData?: { pax?: string; dates?: string; destination?: string }
): Promise<string> {
  const cleanInput = (userMessage || "").trim();
  if (!cleanInput) {
    return "Namaste ji! Travel to Uttarakhand mein aapka swagat hai. Main Rishi hoon. Aap kaun si yatra plan kar rahe hain? 😊";
  }

  // Construct true multi-turn messages array
  const conversationMessages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

  // If known details exist, pin them to system prompt so the model NEVER forgets them
  if (knownLeadData && (knownLeadData.pax || knownLeadData.dates || knownLeadData.destination)) {
    conversationMessages.push({
      role: "system",
      content: `CONFIRMED CLIENT DETAILS SO FAR (DO NOT ASK FOR THESE AGAIN):\n- Destination: ${knownLeadData.destination || "Not specified"}\n- Dates: ${knownLeadData.dates || "Not specified"}\n- Group Size: ${knownLeadData.pax || "Not specified"}`
    });
  }

  if (Array.isArray(historyOrContext)) {
    // Native structured history (last 12 messages)
    const recent = historyOrContext.slice(-12);
    for (const h of recent) {
      if (!h.text || !h.text.trim()) continue;
      conversationMessages.push({
        role: h.sender === "customer" ? "user" : "assistant",
        content: h.text
      });
    }
  } else if (typeof historyOrContext === "string" && historyOrContext.trim()) {
    conversationMessages.push({
      role: "system",
      content: `Previous chat background with this client:\n${historyOrContext.slice(-1200)}`
    });
  }

  conversationMessages.push({ role: "user", content: cleanInput });

  // Call OpenRouter with Gemini 2.5 Flash & DeepSeek
  const models = ["google/gemini-2.5-flash", "deepseek/deepseek-chat"];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://traveltouttrakhand.com",
          "X-Title": "Travel to Uttarakhand Assistant"
        },
        body: JSON.stringify({
          model,
          messages: conversationMessages,
          max_tokens: 280,
          temperature: 0.5
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawReply = data.choices?.[0]?.message?.content?.trim();
        const cleaned = cleanAgentReply(rawReply);
        if (cleaned && cleaned.length > 5) {
          return cleaned;
        }
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err);
    }
  }

  // Fallback: Smart conversational Hinglish rules tailored to what the client actually asked!
  const lower = cleanInput.toLowerCase();

  // If customer asked only for Kedarnath
  if (lower.includes("kedarnath") && (lower.includes("sirf") || lower.includes("only") || !lower.includes("char") || lower.includes("nhi"))) {
    return "Namaste ji! Bilkul, hum aapko sirf Kedarnath Yatra (3 Nights / 4 Days ex-Haridwar/Rishikesh) ka complete package provide karenge. Isme hotel stay, transport aur yatra assistance included rahega. Aap total kitne members hain aur kis month mein jane ka plan hai? 😊";
  }

  if (lower.includes("heli") || lower.includes("chopper") || lower.includes("flight") || lower.includes("udan")) {
    return "Namaste ji! Kedarnath helicopter shuttle tickets direct IRCTC ki official website (heliyatra.irctc.co.in) se book hoti hain, taaki aap market ke fake scams se safe rahein. Hum aapka complete VIP ground package (resort stay, cab, darshan pass support) arrange kar denge. Aap kitne log hain aur kab ka plan hai?";
  }

  if (lower.includes("taxi") || lower.includes("cab") || lower.includes("car") || lower.includes("driver")) {
    return "Namaste! Travel to Uttarakhand mein hum Haridwar aur Dehradun se reliable yatra cabs provide karte hain (Dzire ₹3,800/day, Ertiga ₹4,800/day, Innova ₹5,500/day). Aapko kis date ko aur kahan ke liye cab chahiye?";
  }

  if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("package") || lower.includes("kitna") || lower.includes("budget")) {
    if (lower.includes("kedarnath")) {
      return "Namaste ji! Kedarnath Yatra (3N/4D) package approx ₹9,500 se ₹13,500 per person se start hota hai (hotel stay, cab, breakfast & dinner included). Aap kitne members hain aur travel date kya hai? Main exact discounted rate bata deta hoon. 😊";
    }
    return "Namaste ji! Char Dham Yatra (9N/10D) approx ₹24,000 se ₹28,000 per person aur Kedarnath-Badrinath Do Dham approx ₹16,500 se shuru hota hai. Aap kaun si yatra plan kar rahe hain aur kitne members hain?";
  }

  if (lower.includes("call") || lower.includes("baat") || lower.includes("contact") || lower.includes("number") || lower.includes("book")) {
    return "Ji bilkul! Hamare senior tour coordinator Mr. Amit Chandra (+91 9719038278) aapse direct connect kar lenge aur complete customized itinerary share kar denge. Aapka plan kis date se start karne ka hai?";
  }

  return "Namaste ji! Travel to Uttarakhand mein aapka swagat hai, main Rishi hoon. 🙏 Aapka Haridwar se Kedarnath Yatra ka plan hai ya Char Dham? Aap kitne log travel karenge?";
}

/**
 * Transcribes voice note audio buffer to text using Gemini 2.5 Flash multimodal on OpenRouter
 */
export async function transcribeAudioVoiceNote(base64Audio: string, mimeType: string = "audio/ogg"): Promise<string> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 150,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please transcribe this customer voice note verbatim. The customer is speaking in Hindi, Hinglish, or English asking about an Uttarakhand trip or pilgrimage. Output ONLY the transcribed spoken text. Do not add explanations, quotes, or notes."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Audio}`
                }
              }
            ]
          }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const transcription = data.choices?.[0]?.message?.content?.trim();
      if (transcription && transcription.length > 2) {
        return cleanAgentReply(transcription);
      }
    }
  } catch (err) {
    console.error("Audio transcription error:", err);
  }
  return "";
}
