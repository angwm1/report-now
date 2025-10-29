// src/app/api/chatbot/route.js
import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * POST /api/chatbot
 * Expects JSON with properties:
 *  - message: The latest user message
 *  - history: An array of previous messages (each object with { role, content })
 */
export async function POST(request) {
  try {
    const { message, history } = await request.json();

    // System prompt that defines GovBot as an expert in Singapore Government matters.
    const systemPrompt = {
      role: "system",
      content: `You are GovBot, an expert chatbot in Singapore Government-related matters.
Your expertise includes information about major ministries (e.g., PMO, MDDI, MCCY, MINDEF, MOE, MOF, MFA, MOH, MHA, MINLAW, MOM, MND, MSF, MSE, MTI, MOT) and key statutory boards & autonomous agencies (e.g., HDB, URA, CPF, ACRA, A*STAR, CAAS, BCA, EDB, EnterpriseSG, EMA, IMDA, IRAS, LTA, MPA, MAS, NEA, NHB, NLB, NParks, PA, PUB, STB, SSG, WSG, CEA, CCCS, DSTA, HTX, HLB, ITE, IPOS, ISEAS, JTC, LSB, MUIS, NYP, NAC, NCSS, RP, SCB, SDC, Singapore Dental Council, SEAB, SFA, SLF, SLA, SMC, SNB, SPC, SP, Tote Board, YRSG).
Answer questions clearly, accurately, and concisely.`,
    };

    // Build the messages array for the API call
    const messages = [
      systemPrompt,
      // Append previous messages from history if provided (filtering out any stray system messages)
      ...(Array.isArray(history) ? history.filter((msg) => msg.role !== "system") : []),
      { role: "user", content: message },
    ];

    // Call OpenAI's Chat API
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json(
        { error: errData.error?.message || "OpenAI API error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply = data.choices[0].message.content.trim();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}