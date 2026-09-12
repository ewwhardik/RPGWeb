import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createQuestSchema,
  updateQuestActionSchema,
  createPartySchema,
  joinPartySchema,
  buyItemSchema,
  equipItemSchema,
} from "../validations";

describe("Input Validation & Integrity Schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid adventurer registration payloads", () => {
      const payload = {
        username: "DragonSlayer42",
        email: "slayer@guild.org",
        password: "ironclad_secret",
        avatar: "warrior",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects passwords shorter than 6 characters", () => {
      const payload = {
        username: "RogueOne",
        email: "rogue@guild.org",
        password: "12345",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("6 characters");
      }
    });

    it("rejects invalid email formats", () => {
      const payload = {
        username: "MageSupreme",
        email: "not-an-email-scroll",
        password: "secret_grimoire",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects single character usernames", () => {
      const payload = {
        username: "X",
        email: "x@guild.org",
        password: "secret_grimoire",
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login scrolls", () => {
      const payload = { login: "adventurer", password: "password123" };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects empty passwords", () => {
      const payload = { login: "adventurer", password: "" };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("createQuestSchema", () => {
    it("accepts well-formed quest dispatch submissions", () => {
      const payload = {
        title: "Clean the Arcane Sanctum",
        description: "Dust off ancient spell tomes and organize scrolls.",
        category: "DEXTERITY",
        difficulty: "MEDIUM",
      };
      const result = createQuestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects empty quest titles", () => {
      const payload = {
        title: "",
        category: "STRENGTH",
        difficulty: "EASY",
      };
      const result = createQuestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects illegal attribute categories", () => {
      const payload = {
        title: "Levitate Rocks",
        category: "TELEKINESIS",
        difficulty: "HARD",
      };
      const result = createQuestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects invalid difficulty ratings", () => {
      const payload = {
        title: "Read a Book",
        category: "INTELLECT",
        difficulty: "NIGHTMARE_IMPOSSIBLE",
      };
      const result = createQuestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("updateQuestActionSchema", () => {
    it("accepts COMPLETE, ABANDON, and EDIT actions", () => {
      expect(updateQuestActionSchema.safeParse({ action: "COMPLETE" }).success).toBe(true);
      expect(updateQuestActionSchema.safeParse({ action: "ABANDON" }).success).toBe(true);
      expect(
        updateQuestActionSchema.safeParse({
          action: "EDIT",
          title: "Refactored Title",
          difficulty: "EPIC",
        }).success
      ).toBe(true);
    });

    it("rejects illegal quest actions", () => {
      const result = updateQuestActionSchema.safeParse({ action: "VAPORIZE" });
      expect(result.success).toBe(false);
    });
  });

  describe("createPartySchema and joinPartySchema", () => {
    it("accepts valid guild name charters", () => {
      const result = createPartySchema.safeParse({ name: "Fellowship of Code" });
      expect(result.success).toBe(true);
    });

    it("rejects guild names shorter than 3 characters", () => {
      const result = createPartySchema.safeParse({ name: "Yo" });
      expect(result.success).toBe(false);
    });

    it("accepts valid invite codes", () => {
      const result = joinPartySchema.safeParse({ code: "PROC-9999" });
      expect(result.success).toBe(true);
    });

    it("rejects invite codes shorter than 3 characters", () => {
      const result = joinPartySchema.safeParse({ code: "AB" });
      expect(result.success).toBe(false);
    });
  });

  describe("shop item schemas", () => {
    it("validates buyItemSchema requires non-empty itemId", () => {
      expect(buyItemSchema.safeParse({ itemId: "item_sword_123" }).success).toBe(true);
      expect(buyItemSchema.safeParse({ itemId: "" }).success).toBe(false);
    });

    it("validates equipItemSchema requires non-empty itemId", () => {
      expect(equipItemSchema.safeParse({ itemId: "item_shield_456" }).success).toBe(true);
      expect(equipItemSchema.safeParse({ itemId: "" }).success).toBe(false);
    });
  });
});
