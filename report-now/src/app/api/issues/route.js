// File: /src/app/api/issues/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import { categorize } from "../../../lib/actions";
import { checkAndMarkDuplicate } from "../../../lib/duplicate-detection";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const bodyParser = false;

// Helper function to upload a file to Cloudinary
async function uploadFile(file) {
  // Convert the file (from request.formData()) to a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: "issues" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Helper function to do reverse geocoding via OpenStreetMap (Nominatim)
async function reverseGeocodeOSM(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ReportNow/1.0 (contact@ntu.edu.sg)", // must be valid email or domain
        "Accept-Language": "en",
      },
    });
    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.display_name || "Unknown location";
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return "Unknown location";
  }
}

export async function GET() {
  try {
    const issues = await prisma.issue.findMany();
    return NextResponse.json(issues, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request) {
  // Authenticate request using JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse form data from the request
    const formData = await request.formData();

    // Extract text fields
    const title = formData.get("title");
    const description = formData.get("description");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert lat/lon to floats if provided
    let lat = null;
    let lon = null;
    if (latitude) lat = parseFloat(latitude);
    if (longitude) lon = parseFloat(longitude);

    // Reverse geocode to get a human-readable location (if lat/lon are valid)
    let locationName = null;
    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
      locationName = await reverseGeocodeOSM(lat, lon);
    }

    // Process file uploads if any
    const mediaFiles = formData.getAll("media"); // "media" is the field name for files
    const mediaUrls = [];
    const imageUrls = [];
    for (const file of mediaFiles) {
      try {
        const url = await uploadFile(file);
        mediaUrls.push(url);
        if (file.type.startsWith("image/")) imageUrls.push(url);
      } catch (error) {
        console.error("Error uploading file:", error);
        // optionally return an error or continue
      }
    }

    // AI-generated category
    const category = await categorize(title, description, imageUrls);

    // Create the new issue in the database, saving mediaUrls as JSON
    const newIssue = await prisma.issue.create({
      data: {
        title,
        description,
        latitude: lat,
        longitude: lon,
        location: locationName, // Store the human-readable address
        status: "Pending",
        category: category,
        upvotes: [],
        reporterId: parseInt(token.sub, 10) || null,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
      },
    });

    const detectionPromise = checkAndMarkDuplicate(newIssue.id).catch(
      (error) => {
        console.error("Duplicate detection failed:", error);
        return null;
      }
    );

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve("timeout"), 5000)
    );

    const detectionResult = await Promise.race([
      detectionPromise,
      timeoutPromise,
    ]);

    let issueResponse = newIssue;

    if (detectionResult && detectionResult !== "timeout") {
      const updatedIssue = await prisma.issue.findUnique({
        where: { id: newIssue.id },
      });
      if (updatedIssue) {
        issueResponse = updatedIssue;
      }
    }

    return NextResponse.json(issueResponse, {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating issue:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
