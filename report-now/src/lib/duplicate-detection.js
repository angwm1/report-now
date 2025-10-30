import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ENABLE_DUPLICATE_DETECTION =
  process.env.ENABLE_DUPLICATE_DETECTION !== "false";
const DUPLICATE_MODEL = process.env.DUPLICATE_MODEL || "gpt-5-mini";

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function formatCoordinates(lat, lon) {
  if (typeof lat === "number" && typeof lon === "number") {
    return `${lat}, ${lon}`;
  }
  return "unknown";
}

function buildIssueSummary(issue) {
  const title = normalizeText(issue.title) || "(no title)";
  const description = normalizeText(issue.description) || "(no description)";
  const coordinates = formatCoordinates(issue.latitude, issue.longitude);
  return `ID: ${issue.id}
Title: ${title}
Coordinates: ${coordinates}
Description: ${description}`.trim();
}

function buildPrompt(newIssue, existingIssues) {
  const newIssueSummary = buildIssueSummary(newIssue);
  const existingSummaries = existingIssues
    .map((issue, index) => `Issue ${index + 1}\n${buildIssueSummary(issue)}`)
    .join("\n\n---\n\n");

  return `You are a helpful assistant that decides whether a newly reported citizen issue appears to be a duplicate of an existing one.

New Issue:
${newIssueSummary}

Existing Issues:
${existingSummaries}

If any existing issue clearly describes the same underlying real-world problem, respond with:
{
  "duplicate": true,
  "duplicateId": <matching issue ID>,
  "reason": "short human-readable explanation referencing both issues"
}

If none match, respond with:
{
  "duplicate": false,
  "duplicateId": null,
  "reason": "brief explanation"
}

Always reply with valid JSON and never include additional text.`;
}

function parseModelResponse(content) {
  if (typeof content !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(content);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const duplicate = Boolean(parsed.duplicate);
    const duplicateId =
      typeof parsed.duplicateId === "number" &&
      Number.isInteger(parsed.duplicateId)
        ? parsed.duplicateId
        : null;
    const reason =
      typeof parsed.reason === "string"
        ? parsed.reason.slice(0, 1024)
        : null;

    return { duplicate, duplicateId, reason };
  } catch (error) {
    console.warn("Failed to parse duplicate detection response:", error);
    return null;
  }
}

export async function checkAndMarkDuplicate(issueId) {
  if (!ENABLE_DUPLICATE_DETECTION) {
    return { skipped: true, reason: "Feature flag disabled" };
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set; skipping duplicate detection.");
    return { skipped: true, reason: "Missing API key" };
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!issue) {
    return { skipped: true, reason: "Issue not found" };
  }

  const otherIssues = await prisma.issue.findMany({
    where: {
      id: { not: issue.id },
    },
    select: {
      id: true,
      title: true,
      description: true,
      latitude: true,
      longitude: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (otherIssues.length === 0) {
    await prisma.issue.update({
      where: { id: issue.id },
      data: {
        duplicateId: null,
        duplicateReason: null,
      },
    });
    return { duplicate: false };
  }

  const prompt = buildPrompt(issue, otherIssues);

  console.log("[duplicate-detection] Prompt sent to model:", prompt);

  const completion = await openai.chat.completions.create({
    model: DUPLICATE_MODEL,
    max_completion_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You return strict JSON responses that help detect duplicate citizen issues.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = completion?.choices?.[0]?.message?.content;

  console.log("[duplicate-detection] Raw model response:", content);

  const decision = parseModelResponse(content);

  if (!decision) {
    console.warn("Duplicate detection returned unparsable response.");
    return { duplicate: false, reason: null };
  }

  if (decision.duplicate && decision.duplicateId) {
    const validCandidate = otherIssues.some(
      (candidate) => candidate.id === decision.duplicateId,
    );

    if (validCandidate) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          duplicateId: decision.duplicateId,
          duplicateReason: decision.reason || null,
        },
      });

      return {
        duplicate: true,
        duplicateId: decision.duplicateId,
        reason: decision.reason || null,
      };
    }
  }

  await prisma.issue.update({
    where: { id: issue.id },
    data: {
      duplicateId: null,
      duplicateReason: decision.reason || null,
    },
  });

  return {
    duplicate: false,
    reason: decision.reason || null,
  };
}
