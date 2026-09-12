import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Every adventurer needs a name at least 2 characters long.")
    .max(50, "Your heroic name cannot exceed 50 characters."),
  email: z
    .string()
    .trim()
    .email("Provide a valid email scroll so the guild can deliver notices."),
  password: z
    .string()
    .min(6, "Your secret pass-phrase must be at least 6 characters long to deter petty goblins."),
  avatar: z
    .string()
    .optional()
    .default("warrior"),
});

export const loginSchema = z.object({
  login: z
    .string()
    .trim()
    .min(2, "Provide your adventurer name or email."),
  password: z
    .string()
    .min(1, "Enter your secret pass-phrase."),
});

export const createQuestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "You cannot embark on a quest to do literally nothing.")
    .max(150, "Quest title cannot exceed 150 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .optional()
    .nullable(),
  category: z.enum(
    ["STRENGTH", "INTELLECT", "VITALITY", "DEXTERITY", "CHARISMA", "SANITY"],
    { message: "Invalid attribute category." }
  ),
  difficulty: z.enum(
    ["TRIVIAL", "EASY", "MEDIUM", "HARD", "EPIC"],
    { message: "Invalid difficulty tier." }
  ),
  dueDate: z
    .string()
    .optional()
    .nullable(),
});

export const updateQuestActionSchema = z.object({
  action: z.enum(["COMPLETE", "ABANDON", "EDIT"], {
    message: "Invalid action. Expected COMPLETE, ABANDON, or EDIT.",
  }),
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  category: z
    .enum(["STRENGTH", "INTELLECT", "VITALITY", "DEXTERITY", "CHARISMA", "SANITY"])
    .optional(),
  difficulty: z
    .enum(["TRIVIAL", "EASY", "MEDIUM", "HARD", "EPIC"])
    .optional(),
  dueDate: z.string().optional().nullable(),
});

export const buyItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required to complete purchase."),
});

export const equipItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required to equip or unequip."),
});

export const createPartySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Guild title must be at least 3 characters.")
    .max(40, "Guild title cannot exceed 40 characters."),
});

export const joinPartySchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Guild code must be at least 3 characters.")
    .max(20, "Guild code cannot exceed 20 characters."),
});

export const partyActionSchema = z.object({
  action: z.enum(["CREATE", "JOIN", "LEAVE", "CHEER"], {
    message: "Action must be CREATE, JOIN, LEAVE, or CHEER.",
  }),
  name: z.string().trim().min(3).max(40).optional(),
  code: z.string().trim().min(3).max(20).optional(),
});

