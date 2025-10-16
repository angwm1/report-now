// src/app/api/issues/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Force Node.js runtime (required for Buffer/crypto)
export const runtime = "nodejs";

// --- Helpers: Cloudinary signed upload ---
function cloudinarySignature(paramsToSign, apiSecret) {
  // paramsToSign is an object (e.g., { timestamp, folder })
  // Cloudinary requires params sorted by key and joined as key=value without separators except &
  const sortedKeys = Object.keys(paramsToSign).sort();
  const toSign = sortedKeys
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

async function uploadToCloudinary(files) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const results = [];

  for (const file of files) {
    // Convert Blob/File to base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${base64}`;

    // Signed upload: only timestamp is required for minimal signing
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinarySignature({ timestamp }, apiSecret);

    const form = new FormData();
    form.append("file", dataUri);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    const res = await fetch(uploadUrl, { method: "POST", body: form });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary upload failed: ${res.status} ${errText}`);
    }
    const json = await res.json();
    results.push(json.secure_url || json.url);
  }

  return results;
}

export async function GET() {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Require auth
  const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Please sign in to report an issue." },
        { status: 401 }
      );
    }

    const form = await request.formData();
    const title = (form.get("title") || "").toString().trim();
    const description = (form.get("description") || "").toString().trim();
    const latitudeRaw = form.get("latitude");
    const longitudeRaw = form.get("longitude");
    const mediaEntries = form.getAll("media"); // array of File/Blob

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    // Optional location coords
    const latitude = latitudeRaw != null ? parseFloat(String(latitudeRaw)) : null;
    const longitude = longitudeRaw != null ? parseFloat(String(longitudeRaw)) : null;

    // Upload any images to Cloudinary (if present)
    let mediaUrls = [];
    const validFiles = mediaEntries.filter((f) => {
      // Next.js provides Blob-like objects here; ensure they look like File
      return typeof f === "object" && f && typeof f.arrayBuffer === "function";
    });
    if (validFiles.length > 0) {
      mediaUrls = await uploadToCloudinary(validFiles);
    }

    // Find reporter id by email to be safe
    const reporterEmail = session.user.email;
    const reporter = reporterEmail
      ? await prisma.user.findUnique({ where: { email: reporterEmail } })
      : null;
    if (!reporter) {
      return NextResponse.json(
        { error: "Reporter account not found." },
        { status: 400 }
      );
    }

    const created = await prisma.issue.create({
      data: {
        title,
        description,
        reporterId: reporter.id,
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
        mediaUrls: mediaUrls.length ? mediaUrls : null,
        // status defaults to "Pending" per schema
      },
    });

    return NextResponse.json({ message: "Issue created", issue: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit issue" },
      { status: 500 }
    );
  }
}
