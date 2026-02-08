import { NextResponse } from "next/server";
import { removeFromPortfolio } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { id?: string };

    if (!body.id) {
      return NextResponse.json({ error: "System ID is required" }, { status: 400 });
    }

    const removed = await removeFromPortfolio(body.id);

    if (!removed) {
      return NextResponse.json({ error: "System not found in portfolio" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove system";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
