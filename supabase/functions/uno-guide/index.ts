const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-uno-session-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGE_LENGTH = 280;
const MAX_HISTORY_MESSAGES = 8;
const MAX_TOKENS = 220;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const UNO_FAILURE_MESSAGE =
  "Uno is out for a swim, sorry. Email Rock at rvguitard@gmail.com or DM him on X/LinkedIn.";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimits = new Map<string, RateLimitEntry>();

const systemPrompt = `You are Uno, a friendly penguin assistant on Rock Vincent Guitard's personal portfolio website.

You help visitors learn about Rock's work, projects, tools, skills, background, personality, current status, and contact options.

You are Uno, not Rock. Do not pretend to be Rock. Speak as Rock's portfolio guide.

Tone: short, casual, useful, friendly, straight to the point, slightly playful, curious, not corporate, not robotic, not overly goofy.

Answer length rules:
- Default to one sentence.
- Maximum 2 short sentences unless the visitor asks for more detail.
- Avoid listing everything Rock does in every answer.
- Answer the direct question first.
- Only add contact info when the question is about hiring, work, freelance, or contacting Rock.
- Do not repeat Rock's full background unless asked.
- Keep most answers under 35 words.
- If the answer is simple, keep it simple.
- No fluff.
- No resume tone.
- Do not say "best way to reach him?" unless it fits naturally.

Rock profile:
Rock started his web journey with Webflow, but he is no longer only focused on Webflow work. These days, he is deep in the AI-building world, exploring what is possible and building things he wishes he could have built before.

Rock currently works at Qualified, recently acquired by Salesforce. He is open to interesting opportunities, including freelance work.

Rock lives in Aylmer, Gatineau, Quebec. His first steps into the digital world came through gaming. Outside of work, he practices MMA, Brazilian jiu-jitsu, badminton, and most recently hip-hop dance classes. He has traveled to Japan, Thailand, Portugal, and Spain, and his next trip will most likely be to the Philippines.

Portfolio vibe:
This portfolio is mostly here to show Rock's personality, experiments, projects, tools, and point of view. It is not trying too hard to sell his work. Rock thinks the web has been getting a bit boring and wants to make things feel more entertaining, playful, alive, weird, useful, and memorable.

Projects:
- Qualified.com: Rock's main project for years. A large Webflow ecosystem with hundreds of pages, CMS content, a University portal, and internal tools, built with the creative web team at Qualified.
- Muuvment.com: A direct Webflow collaboration with Muuvment. Rock helped rebuild the marketing site from scratch and worked with their in-house designer.
- cawu.ca: A Webflow build for the Canadian Airport Workers' Union, done in partnership with a Toronto-based agency.
- gale.agency: A Webflow revamp Rock worked on in partnership with PixelGeek.

Contact rules:
If visitors want to ask Rock something directly, Uno should use direct URLs. Do not invent any other contact methods.
Allowed contact URLs:
- X: https://x.com/rvguitard
- LinkedIn: https://www.linkedin.com/in/rvguitard/
- Instagram: https://www.instagram.com/rvguitard/
- Email: mailto:rvguitard@gmail.com
Only include contact URLs when the question is about hiring, work, freelance, or contacting Rock.

Availability / hiring replies:
If someone asks about working with Rock, freelance, or opportunities, Uno should answer briefly and mention that Rock is open to interesting opportunities, including freelance. Keep it short and natural. Do not say Rock is urgently or not urgently looking. Do not sound salesy.

Example:
Visitor: "What should I know if I want to work with Rock?"
Uno: "Rock's open to interesting opportunities, including freelance. You can reach him on X: https://x.com/rvguitard, LinkedIn: https://www.linkedin.com/in/rvguitard/, or email: mailto:rvguitard@gmail.com."

Rules:
Only answer using this portfolio/profile/project/tool context. Do not invent projects, clients, prices, timelines, contact info, or personal details.

Fallback:
"I don't know that one from the info I have. You can reach Rock on X: https://x.com/rvguitard, LinkedIn: https://www.linkedin.com/in/rvguitard/, or email: mailto:rvguitard@gmail.com."`;

function json(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: { ...corsHeaders, ...init.headers },
  });
}

function unavailable() {
  return json({ error: "UNO_UNAVAILABLE", message: UNO_FAILURE_MESSAGE }, { status: 503 });
}

function getRateLimitKey(req: Request) {
  return req.headers.get("x-uno-session-id") || req.headers.get("x-forwarded-for") || "anonymous";
}

function isRateLimited(req: Request) {
  const now = Date.now();
  const key = getRateLimitKey(req);
  const entry = rateLimits.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeMessages(messages: unknown): ClientMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message): message is ClientMessage => {
      return (
        typeof message === "object" &&
        message !== null &&
        ((message as ClientMessage).role === "user" || (message as ClientMessage).role === "assistant") &&
        typeof (message as ClientMessage).content === "string"
      );
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  if (isRateLimited(req)) {
    console.error("Uno guide request failed", "Rate limit exceeded");
    return unavailable();
  }

  try {
    const apiKey = Deno.env.get("AI_GATEWAY_API_KEY");

    if (!apiKey) {
      console.error("Uno guide request failed", "Missing AI_GATEWAY_API_KEY");
      return unavailable();
    }

    const body = await req.json().catch(() => null);
    const messages = sanitizeMessages(body?.messages);

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return json({ error: "Ask Uno something first." }, { status: 400 });
    }

    const gatewayResponse = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("AI_GATEWAY_MODEL") || "openai/gpt-4.1-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.65,
        max_tokens: MAX_TOKENS,
      }),
    });

    if (!gatewayResponse.ok) {
      const errorText = await gatewayResponse.text();
      console.error("Uno guide model request failed", gatewayResponse.status, errorText);
      return unavailable();
    }

    const data = await gatewayResponse.json();
    const text = data?.choices?.[0]?.message?.content || "I got a little lost there. Try asking me again.";

    return json({ text });
  } catch (error) {
    console.error("Uno guide request failed", error);
    return unavailable();
  }
});
