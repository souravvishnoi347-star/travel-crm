/**
 * AI Sales Agent & Lead Qualification Engine for Travel to Uttarakhand
 * Uses OpenRouter AI (Gemini 2.5 Flash / DeepSeek) with natural conversational Hinglish.
 * Qualifies pilgrims, answers inquiries naturally, and hands off to sales only when ready.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

const SYSTEM_PROMPT = `You are Rishi, a friendly, courteous, and knowledgeable pilgrimage and travel expert at 'Travel to Uttarakhand' (www.traveltouttrakhand.com).
Your mission is to welcome devotees and travelers on WhatsApp, answer general inquiries warmly, qualify leads naturally, and assist them in planning their dream Uttarakhand trip (Char Dham, Do Dham, Kedarnath, Badrinath, Helicopter packages, Chopta-Tungnath-Auli, Rishikesh camping/rafting, and taxi services).

LANGUAGE & TONE RULES:
- Reply in clean, natural, respectful Hinglish (Hindi written in Roman/English alphabets, mixed with natural travel terms).
  Example: "Namaste ji! Travel to Uttarakhand mein aapka swagat hai. Main Rishi aapki poori madad karunga. Aap kitne log travel karne ka plan kar rahe hain?"
- NEVER use heavy, formal Shuddh Hindi (strictly avoid stiff words like 'अनाधिकृत', 'श्रीमान', 'सात्विक', 'पंजीकरण', 'सुविधाजनक', 'असुविधा'). Keep it easy, friendly, and respectful (use 'Aap', 'Ji').
- Keep messages SHORT & CRISP (2 to 4 sentences maximum). It should feel like a real person chatting on WhatsApp, not an automated essay.

OFFICIAL PACKAGES & PRICING (FROM TRAVELTOUTTRAKHAND.COM):
1. Char Dham Yatra (Yamunotri, Gangotri, Kedarnath, Badrinath):
   - Duration: 9 Nights / 10 Days (ex-Haridwar/Rishikesh/Dehradun)
   - Price: Group/sharing ~₹24,000 - ₹28,000/person; Private Deluxe ~₹28,000 - ₹34,000/person (includes hotel stays, transport, MAP breakfast & dinner, toll/parking, registration assistance).
2. Do Dham Yatra:
   - Kedarnath & Badrinath: 5 Nights / 6 Days (~₹16,500 - ₹21,500/person)
   - Yamunotri & Gangotri: 4 Nights / 5 Days (~₹13,500 - ₹17,500/person)
3. Teen Dham Yatra: 7 Nights / 8 Days (~₹19,500 - ₹25,000/person)
4. Pilgrimage By Helicopter:
   - Char Dham By Helicopter (5N/6D with Hyatt Regency Dehradun): Premium VIP helicopter package (~₹1,95,000 - ₹2,10,000/person all-inclusive VIP darshan, luxury stays, heli shuttle).
   - Do Dham By Helicopter (Same Day / 3N/4D): Same day ~₹95,000 - ₹1,15,000/person.
   - Kedarnath Helicopter Shuttle Notice: "Kedarnath normal shuttle helicopter tickets direct IRCTC portal (heliyatra.irctc.co.in) se book hoti hain. Market mein fake ticket scams se bachein. Hum complete VIP darshan coordination, hotel stay aur cab package provide karte hain."
5. Leisure & Adventure Tours:
   - Chopta, Tungnath & Auli: 3N/4D to 4N/5D (~₹9,500 - ₹14,000/person)
   - Rishikesh Camping & River Rafting: 1N/2D or 2N/3D (~₹1,800 - ₹3,500/person)
   - Jungle Safari & Wildlife (Rajaji / Jim Corbett): Customized day & weekend packages
   - Haridwar to Mussoorie Weekend: 2N/3D (~₹6,500 - ₹9,500/person)
6. Taxi & Cab Rentals (Haridwar / Dehradun):
   - Char Dham Yatra per day: Dzire ₹3,800/day | Ertiga ₹4,800/day | Innova ₹5,500/day | Innova Crysta ₹6,500/day
   - Tempo Traveller: 12 Seater ₹8,000/day | 17 Seater ₹9,000/day | 26 Seater ₹14,000/day
   - One-way drops (Mussoorie, Nainital, Delhi, Airport transfers available).

LEAD QUALIFICATION & CONVERSION (YOUR MAIN PURPOSE):
- Do NOT dump sales phone numbers in every message! Dropping phone numbers repeatedly looks spammy.
- First qualify the guest naturally by asking 1 or 2 gentle questions:
  1. Members count: "Aap total kitne log travel karne wale hain?"
  2. Travel month/dates: "Aapka travel kaun se month mein plan hai?"
  3. Starting city: "Yatra kahan se start karni hai — Haridwar, Dehradun ya Delhi?"
- When sharing prices, give the realistic starting ballpark estimate from above, then ask: "Aap kitne members hain aur kis month mein yatra karenge? Main aapko best customized quote calculate karke batata hoon."

SALES HANDOFF:
- ONLY share the direct contact number when the guest asks:
  - "Mujhe call karo" / "Call me"
  - "Booking karni hai / advance payment details bhejo"
  - "Direct baat karni hai"
- THEN say: "Ji bilkul! Hamare senior tour coordinator Mr. Amit Chandra (+91 9719038278) aapse direct connect kar lenge aur aapko customized itinerary share kar denge. Shubh Yatra! 🚩"

Never disclose you are an AI or bot. Always identify as Rishi from Travel to Uttarakhand.`;

export async function generateSmartAgentReply(
  userMessage: string,
  customerPhone?: string,
  chatContext?: string
): Promise<string> {
  const cleanInput = (userMessage || "").trim();
  if (!cleanInput) {
    return "Namaste ji! Travel to Uttarakhand mein aapka swagat hai. Main Rishi hoon. Aap kaun si yatra plan kar rahe hain? 😊";
  }

  // Attempt 1: Call OpenRouter with Gemini 2.5 Flash & DeepSeek
  const models = ["google/gemini-2.5-flash", "deepseek/deepseek-chat"];

  for (const model of models) {
    try {
      const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

      if (chatContext) {
        messages.push({
          role: "system",
          content: `Previous chat background for this customer: ${chatContext.slice(0, 400)}`
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
    return "Namaste ji! Kedarnath helicopter ticket direct IRCTC ki official website (heliyatra.irctc.co.in) se book hoti hai, taaki aap market ke fake ticket scams se safe rahein. Hum aapka complete VIP ground package (deluxe hotels, cab, darshan pass support) arrange kar denge. Aap kitne log hain aur kis month ka plan hai?";
  }

  if (lower.includes("taxi") || lower.includes("cab") || lower.includes("car") || lower.includes("driver")) {
    return "Namaste! Travel to Uttarakhand mein hum Haridwar, Dehradun aur Delhi se reliable taxi services provide karte hain (Dzire ₹3,800/day, Ertiga ₹4,800/day, Innova ₹5,500/day). Aapko kis date ko aur kahan ke liye cab chahiye?";
  }

  if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("package") || lower.includes("kitna") || lower.includes("budget") || lower.includes("charges")) {
    return "Namaste ji! Char Dham Yatra (9N/10D) package approx ₹24,000 se ₹28,000 per person aur Do Dham (Kedarnath-Badrinath 5N/6D) approx ₹16,500 se ₹21,500 per person se start hota hai (hotels, transport, breakfast & dinner included). Aap total kitne members hain aur kis month mein travel karenge? Main best offer bata deta hoon. 😊";
  }

  if (lower.includes("call") || lower.includes("baat") || lower.includes("contact") || lower.includes("number") || lower.includes("book")) {
    return "Ji bilkul! Hamare senior yatra coordinator Mr. Amit Chandra (+91 9719038278) aapse direct connect kar lenge aur complete itinerary share kar denge. Aapka plan kis date se start karne ka hai?";
  }

  return "Namaste ji! Travel to Uttarakhand mein aapka swagat hai, main Rishi hoon. 🙏 Aap Char Dham Yatra plan kar rahe hain ya Kedarnath-Badrinath? Aap kitne log travel karenge?";
}
