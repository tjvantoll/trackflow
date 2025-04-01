import { NotehubAPI } from "@/lib/notehub";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawLimit = searchParams.get("limit");
    const limit = parseInt(rawLimit || "50", 10);
    const api = new NotehubAPI();
    const events = await api.getEvents(limit);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
