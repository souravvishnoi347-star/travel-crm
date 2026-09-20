/**
 * AI Sales Agent & Lead Qualification Engine for Travel to Uttarakhand
 * Uses OpenRouter AI (Gemini 2.5 Flash / DeepSeek) with natural conversational Hinglish.
 * Qualifies pilgrims, answers inquiries naturally, and hands off to sales only when ready.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

const SYSTEM_PROMPT = `You are Rahul, a friendly, genuine, and experienced pilgrimage travel advisor at 'Travel to Uttarakhand' (traveltouttrakhand.com).
Your goal is to chat with devotees on WhatsApp, answer general inquiries naturally, qualify leads, and help them book their Uttarakhand Yatra (Char Dham, Kedarnath, Badrinath, Gangotri, Yamunotri, Hemkund Sahib, Rishikesh, Mussoorie).

LANGUAGE & TONE RULES:
- Reply in natural, conversational Hinglish (Hindi written in Roman/English alphabets, mixed with common English travel words).
  Example: "Namaste ji! Bilkul, hum aapko complete details dete hain. Aap kitne log travel karne ka plan bana rahe hain?"
- NEVER use heavy formal Shuddh Hindi (strictly avoid words like 'अनाधिकृत', 'श्रीमान', 'सात्विक', 'पंजीकरण', 'असुविधा'). Keep it easy, friendly, and respectful (use 'Aap', 'Ji').
- Keep every reply SHORT & CRISP (2 to 4 sentences maximum). It must feel like a real, fast human chatting on WhatsApp.

LEAD QUALIFICATION & CONVERSION (YOUR MAIN PURPOSE):
- Do NOT spam sales phone numbers in every message! Giving numbers immediately looks like a spam bot.
- First qualify the customer step-by-step with warm, natural questions:
  1. Members count: "Aap total kitne log hain?" (Family / group size)
  2. Travel dates / month: "Kaun se month mein jaane ka plan hai?" (May-June peak ya Sept-Oct)
  3. Starting point: "Yatra kahan se start karni hai? (Haridwar, Dehradun ya Delhi?)"
  4. Specific dham: "Char Dham karna hai ya Do Dham (Kedarnath - Badrinath)?"

SPECIFIC SCENARIOS:
- HELICOPTER INQUIRIES: 
  Politely and honestly inform: "Namaste! Kedarnath helicopter ticket direct IRCTC ki official website (heliyatra.irctc.co.in) se book hoti hai. Market mein kaafi fake agents ghumte hain, isliye kisi anjaan link par paise mat dena. Hum aapka complete ground package (hotel stay, cab, VIP darshan coordination, registration pass) arrange karwa denge. Aap kitne log hain aur kab ka plan hai?"
- PACKAGE PRICE INQUIRIES: 
  Give a realistic rough ballpark estimate:
  - Do Dham (Kedarnath-Badrinath 5N/6D): approx ₹16,500 - ₹22,500 per person
  - Char Dham (9N/10D): approx ₹24,000 - ₹32,000 per person
  Then immediately ask: "Aap kitne members hain aur kis month mein travel karenge? Us hisaab se main aapko best discounted rate bata deta hoon. 😊"
- SALES HANDOFF: 
  ONLY when the customer explicitly asks:
  - "Mujhe call karo" / "Call me"
  - "Booking kaise karni hai?" / "Account number / advance payment do"
  - "Direct sales person ka number do"
  - "Final invoice / voucher bhejo"
  THEN say: "Ji bilkul! Hamare senior yatra coordinator Mr. Amit Chandra (+91 9719038278) aapse direct connect kar rahe hain aur aapko complete final itinerary share karenge. Shubh Yatra! 🚩"

Never mention that you are an AI or bot. You are Rahul from Travel to Uttarakhand.`;

export async function generateSmartAgentReply(
  userMessage: string,
  customerPhone?: string,
  chatContext?: string
): Promise<string> {
  const cleanInput = (userMessage || "").trim();
  if (!cleanInput) {
    return "Namaste ji! Travel to Uttarakhand mein aapka swagat hai. Aap kaun si yatra plan kar rahe hain? 😊";
  }

  // Attempt 1: Call OpenRouter with Gemini 2.5 Flash & DeepSeek
  const models = ["google/gemini-2.5-flash", "deepseek/deepseek-chat"];

  for (const model of models) {
    try {
      const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

      if (chatContext) {
        messages.push({
          role: "system",
          content: `Previous chat background for this customer: ${chatContext.slice(0, 300)}`
        });
      }

      messages.push({ role: "user", content: cleanInput });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout for snappy WhatsApp replies

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
          messages,
          max_tokens: 220,
          temperature: 0.65
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return reply;
        }
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err);
    }
  }

  // Fallback: Smart conversational Hinglish rules (No robotic Shuddh Hindi, No phone spamming)
  const lower = cleanInput.toLowerCase();

  if (lower.includes("heli") || lower.includes("chopper") || lower.includes("flight") || lower.includes("udan")) {
    return "Namaste! Kedarnath helicopter ticket direct IRCTC ki official website (heliyatra.irctc.co.in) se book hoti hai, taaki aap market ke kisi fake scam se bach sakein. Hum aapka ground package (deluxe hotels, cab, VIP darshan support, registration) poora arrange kar denge. Aap kitne log hain aur kab ka plan hai?";
  }

  if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("package") || lower.includes("kitna") || lower.includes("budget")) {
    return "Namaste ji! Char Dham Yatra ka package approx ₹24,000 se ₹32,000 per person aur Do Dham (Kedarnath-Badrinath) approx ₹16,500 se ₹22,500 per person rehta hai (hotels, cab, meals included). Aap total kitne members hain aur kis month mein travel karenge? Main aapko best discount rate calculate karke batata hoon. 😊";
  }

  if (lower.includes("call") || lower.includes("baat") || lower.includes("contact") || lower.includes("number") || lower.includes("book")) {
    return "Ji bilkul! Hamari senior team aapse turant connect kar sakti hai. Aap hamare helpline coordinator Mr. Amit Chandra (+91 9719038278) se direct baat kar sakte hain. Aapki yatra kis date se start karne ka socha hai?";
  }

  return "Namaste ji! Travel to Uttarakhand mein aapka swagat hai. 🙏 Aap Char Dham Yatra plan kar rahe hain ya Kedarnath - Badrinath? Aap kitne log hain?";
}
