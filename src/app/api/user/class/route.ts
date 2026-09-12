import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CharacterClassType } from "@/lib/classes";

const classSelectSchema = z.object({
  characterClass: z.enum(["WARRIOR", "MAGE", "ROGUE", "PALADIN"]),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = classSelectSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid class selection." }, { status: 400 });
    }

    const { characterClass } = parseResult.data;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        characterClass: characterClass as CharacterClassType,
        logs: {
          create: {
            actionType: "CLASS_CHANGED",
            message: `Switched character class archetype to ${characterClass}.`,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Your class specialization is now ${characterClass}!`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Class switch error:", error);
    return NextResponse.json(
      { error: "The guild master could not reassign your class badge." },
      { status: 500 }
    );
  }
}
