import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { registerPartyStream, broadcastPartyEvent } from "@/lib/partyBoss";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      select: { partyId: true },
    });

    if (!membership) {
      return new NextResponse("Party not found", { status: 404 });
    }

    const partyId = membership.partyId;

    let unregister: (() => void) | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {
        unregister = registerPartyStream(partyId, controller);

        // Initial connection handshake
        const welcomePayload = `data: ${JSON.stringify({
          type: "CONNECT",
          partyId,
          userId: user.id,
          username: user.username,
          timestamp: Date.now(),
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(welcomePayload));

        // Keep-alive heartbeat every 15 seconds
        heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(": ping\n\n"));
          } catch {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
          }
        }, 15000);
      },
      cancel() {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (unregister) unregister();
      },
    });

    req.signal.addEventListener("abort", () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (unregister) unregister();
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Party stream error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      select: { partyId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "NotInParty" }, { status: 400 });
    }

    const body = await req.json();
    const { type, payload } = body;

    broadcastPartyEvent(membership.partyId, {
      type: type || "CHAT",
      payload: {
        ...payload,
        senderUsername: user.username,
        senderId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Broadcast post error:", err);
    return NextResponse.json({ error: "Failed to broadcast" }, { status: 500 });
  }
}
