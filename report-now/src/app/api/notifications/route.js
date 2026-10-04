import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([], { status: 200 });
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid notification payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Notification sent", data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid notification payload" },
      { status: 400 }
    );
  }
}