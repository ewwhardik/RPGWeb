import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dispatchGuildWebhook } from "@/lib/partyBoss";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      include: { party: true },
    });

    if (!membership || !membership.party) {
      return NextResponse.json({ error: "NotInParty" }, { status: 404 });
    }

    let webhookSettings = {
      discordUrl: "",
      telegramBotToken: "",
      telegramChatId: "",
    };

    if (membership.party.activeBuffs) {
      try {
        const parsed = JSON.parse(membership.party.activeBuffs);
        if (parsed.__webhookSettings) {
          webhookSettings = {
            discordUrl: parsed.__webhookSettings.discordUrl || "",
            telegramBotToken: parsed.__webhookSettings.telegramBotToken ? "••••••••" : "",
            telegramChatId: parsed.__webhookSettings.telegramChatId || "",
          };
        }
      } catch {}
    }

    return NextResponse.json({
      partyId: membership.party.id,
      partyName: membership.party.name,
      settings: webhookSettings,
    });
  } catch (err) {
    console.error("GET webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
      include: { party: true },
    });

    if (!membership || !membership.party) {
      return NextResponse.json({ error: "NotInParty" }, { status: 404 });
    }

    const body = await req.json();
    const { discordUrl, telegramBotToken, telegramChatId, testAction } = body;

    let existingData: Record<string, unknown> = {};
    try {
      if (membership.party.activeBuffs) {
        existingData = JSON.parse(membership.party.activeBuffs);
      }
    } catch {}

    const currentWebhook = (existingData.__webhookSettings as Record<string, string> | undefined) || {};

    const updatedWebhookSettings = {
      discordUrl: discordUrl !== undefined ? discordUrl : currentWebhook.discordUrl,
      telegramBotToken:
        telegramBotToken && telegramBotToken !== "••••••••"
          ? telegramBotToken
          : currentWebhook.telegramBotToken,
      telegramChatId: telegramChatId !== undefined ? telegramChatId : currentWebhook.telegramChatId,
    };

    existingData.__webhookSettings = updatedWebhookSettings;

    await prisma.party.update({
      where: { id: membership.party.id },
      data: {
        activeBuffs: JSON.stringify(existingData),
      },
    });

    if (testAction) {
      await dispatchGuildWebhook(membership.party.id, {
        type: "RALLY",
        bossName: membership.party.bossName,
        username: user.username,
        details: "🔔 Guild Webhook Test Broadcast successful! The Karmaraj Warboard is connected.",
      });
    }

    return NextResponse.json({
      success: true,
      message: testAction ? "Test signal sent to configured channels!" : "Webhook configuration saved.",
    });
  } catch (err) {
    console.error("POST webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
