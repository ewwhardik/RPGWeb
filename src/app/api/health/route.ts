import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        environment: process.env.NODE_ENV || "development",
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: "connected",
          latencyMs,
        },
        timestamp: new Date().toISOString(),
        service: "QuestSmith Life RPG API",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Database ping failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
