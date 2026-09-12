# QuestSmith: The Life RPG (The Adventurer's Bureaucracy)

[![CI Pipeline](https://github.com/ewwhardik/RPGWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/ewwhardik/RPGWeb/actions)
![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat-square&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.4.1-teal?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-52%20Passed-emerald?style=flat-square&logo=vitest)
![Theme](https://img.shields.io/badge/Palette-Deep%20Obsidian%20%26%20Amber%20Gold-amber?style=flat-square)

> Convert mundane real-world chores, gym grinds, study sessions, and work tasks into a tactile, non-linear virtual RPG progression engine.

---

## ⚔️ Why QuestSmith?

Traditional todo lists and habit trackers fail because human psychology craves immediate feedback. Real-world accomplishments like lifting weights, reading books, or cleaning codebases take weeks to reveal noticeable progress.

QuestSmith bridges this gap by rewarding real-world effort with instant dopamine: Gold coins, character attribute gains, cooperative raid strikes, and non-linear leveling accompanied by physical tactile interactions, Google Cinzel serif headings, and real-time synthesized 8-bit audio fanfares.

### 🎨 Creative Guardrails & Aesthetic Philosophy
- **Zero Purple**: A grounded fantasy palette built from Deep Obsidian (`#0b0e14`), Burnished Amber Gold (`#f59e0b`), Forest Emerald (`#10b981`), Warm Crimson (`#ef4444`), and Slate (`#64748b`). Strictly zero purple, violet, indigo, or fuchsia.
- **Tactile Physicality**: Uiverse-inspired 3D-pressed buttons with physical bottom bevels, wax stamp task seals, and retro mechanical toggle switches.
- **Zero AI Slop & Zero Excessive Glow**: Crisp, grounded panel borders, radial vignettes, and authentic typography.
- **Humanly Humorous Text**: Natural, self-aware narration that playfully roasts procrastination and celebrates everyday discipline.
- **Zero External Audio Assets**: All audio effects (clicks, coins, wax stamps, level-up brass fanfares) are synthesized purely at runtime via the browser Web Audio API.

---

## 🏗️ System Architecture & Data Flow

```
                                  +-----------------------------+
                                  |  Web Audio API Synthesizer  |
                                  | (Procedural 8-bit Sound FX) |
                                  +--------------^--------------+
                                                 |
+------------------------------------------------+------------------------------------------------+
|                                    PRESENTATION LAYER (Next.js 16)                              |
|                                                                                                |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|   |   Glass Navigation Bar   |  |   3D Hero Relic Diorama  |  |    Stat Radar & XP Meter     |  |
|   |  (Level, Gold, Mute, ? ) |  |   (Three.js WebGL Voxel) |  |   (6 Core Character Stats)   |  |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|                                                                                                |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|   |  Guild Boss Warboard     |  |   Active Quest Dispatch  |  |   Tactile Interactive Quirks |  |
|   |  (Wyrm Raid HP & Roster) |  |  (Wax Stamp Slay Buttons)|  | (Desk Goblin, Mimic, Fate)   |  |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
+------------------------------------------------+------------------------------------------------+
                                                 | (HTTP JSON API + Cookies)
                                                 v
+-------------------------------------------------------------------------------------------------+
|                                 APPLICATION & ENGINE LAYER (API Routes)                         |
|                                                                                                 |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|   |   Zod Schema Validation  |  |  Sliding-Window Limiter  |  |    JWT Authentication        |  |
|   |   (Input Sanitization)   |  |  (Brute-Force Shield)    |  |    (Bcrypt Password Hash)    |  |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|                                                                                                 |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|   |   Non-Linear XP Math     |  |  4-Day Stat Decay Engine |  |  Diminishing Returns Math    |  |
|   |  (Leveling & Multipliers)|  |  (Attribute Atrophy)     |  |  (Anti-Spam Scaling)         |  |
|   +--------------------------+  +--------------------------+  +------------------------------+  |
|                                                                                                 |
|   +------------------------------------------------------------------------------------------+  |
|   |                     Atomic Database Transactions (Prisma .$transaction)                  |  |
|   +------------------------------------------------------------------------------------------+  |
+------------------------------------------------+------------------------------------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
|                                   DATA LAYER (Dual Schema Support)                              |
|                                                                                                 |
|             [SQLite (dev.db)]                 OR                 [PostgreSQL (Supabase)]        |
|          Zero-config local setup                              Production-ready cloud database   |
+-------------------------------------------------------------------------------------------------+
```

---

## 🏛️ Architectural Reference Studies

QuestSmith was engineered following deep study of 3 proven open-source architectures:

1. **Habitica (`github.com/HabitRPG/habitica`)**:
   - **Archetype Specialization**: 4 distinct classes (Warrior, Mage, Rogue, Paladin) with specialized attribute modifiers and party utility.
   - **Client/Server Decoupling**: API routes operate as fully isolated backend endpoints suitable for both web and mobile frontends.
   - **Cooperative Raids**: Shared World Boss encounters where individual task completions deal raid damage to vanquish common obstacles.

2. **min_max (`github.com/Sheperdd/min_max`)**:
   - **Attribute Neglect & Stat Decay**: Attributes left unworked for more than 4 days slowly atrophy by 1 point per check (never dropping below a protective floor of 5).
   - **Diminishing Returns Formula**: Prevents XP spamming by reducing experience yields when repeating the same task category more than 3 times within 24 hours.

3. **hbit-archive (`github.com/squashd/hbit-archive`)**:
   - **Monolithic Cohesion**: Avoided premature microservice fragmentation. Kept authentication, economy, quests, and party mechanics unified in a single, atomic Next.js monolith with Prisma transactions.

---

## 🎮 Core Game Systems

### 1. Six Character Attributes
Every real-world activity maps to one of six core RPG stats:

| Attribute | Real-World Activities | In-Game Buffs & Perks |
| :--- | :--- | :--- |
| **Strength** | Weightlifting, calisthenics, running, sports | Increases physical stamina and physical quest XP |
| **Intellect** | Coding, reading, studying, solving algorithmic bugs | Accelerates arcane research, unlocking higher titles |
| **Vitality** | Sleep hygiene, hydration, home cooking, stretching | Enhances total HP pool and resilience against setbacks |
| **Dexterity** | Speed cleaning, laundry, filing, agile chores | Boosts completion speed and bonus coin salvage |
| **Charisma** | Presentations, tough conversations, negotiations | Unlocks merchant bazaar discounts and party morale |
| **Sanity** | Touching grass, meditation, digital detox, leisure | Deterrent against burnout; shields against cursed relics |

---

### 2. Non-Linear Leveling Curve

Quest experience does not follow a flat grind. Each level requires progressively more total experience:

$$\text{XP Required}(L) = \lfloor 100 \times L^{1.5} \rfloor$$

| Level | Total XP Required | Delta XP from Previous | Unlocked Adventurer Title |
| :---: | :---: | :---: | :--- |
| **1** | 0 XP | 0 XP | Novice Procrastinator |
| **2** | 282 XP | 282 XP | Caffeine Apprentice |
| **3** | 519 XP | 237 XP | Errand Vanquisher |
| **4** | 800 XP | 281 XP | Deadline Duelist |
| **5** | 1,118 XP | 318 XP | Task Paladin |
| **6** | 1,469 XP | 351 XP | Bureaucratic Slayer |
| **7** | 1,852 XP | 383 XP | Arcane Optimizer |
| **8** | 2,262 XP | 410 XP | Master of Checklists |
| **9** | 2,700 XP | 438 XP | Legendary Producer |
| **10** | 3,162 XP | 462 XP | Mythic Productivity Demigod |

---

### 3. Difficulty Multipliers

Every quest difficulty adjusts rewards proportionally:

| Difficulty Tier | XP Multiplier | Gold Multiplier | Typical Real-World Examples |
| :--- | :---: | :---: | :--- |
| **TRIVIAL** | 1.0x (10 XP) | 1.0x (5 Gold) | Drink a glass of water, make your bed |
| **EASY** | 1.5x (20 XP) | 1.5x (10 Gold) | 15-minute brisk walk, respond to one email |
| **MEDIUM** | 2.0x (35 XP) | 2.0x (18 Gold) | 45-minute gym session, finish a book chapter |
| **HARD** | 3.0x (60 XP) | 3.0x (30 Gold) | Write a project design doc, complete laundry backlog |
| **EPIC** | 5.0x (100 XP) | 5.0x (50 Gold) | Ship a major feature, complete a tax return |

---

### 4. Character Class Archetypes

Players can specialize their character class via the Class Switcher modal (`C` hotkey):

| Class | Primary Attribute | Specialized Passive Perk | Recommended For |
| :--- | :--- | :--- | :--- |
| **Warrior** | Strength | **Iron Constitution**: +25% Strength XP and +15% coin salvage | Athletes, gym enthusiasts, physical labor |
| **Mage** | Intellect | **Arcane Wisdom**: +25% Intellect XP and +20% Sanity recovery from tavern rest | Programmers, researchers, university students |
| **Rogue** | Dexterity & Charisma | **Nimble Hustle**: +20% Dexterity & Charisma XP, +25% Gold on quick quests | Freelancers, multi-taskers, community builders |
| **Paladin** | Vitality | **Aura of Devotion**: +20% Vitality XP, +20% Boss Raid strike damage | Team leaders, health enthusiasts, guild captains |

---

### 5. Habitica & min_max Depth Mechanics

#### **Stat Decay Engine**
- Every 24 hours, the system inspects the player's last active timestamp for each attribute.
- If any attribute has not received quest completions for **4 or more days (96 hours)**, that stat decrements by 1 point.
- **Safety Floor**: Stats never decay below 5, ensuring players are never penalized into oblivion.
- Completing a quest in that category immediately resets the decay timer and rewards points.

#### **Diminishing Returns Formula**
To deter players from spamming simple repetitive chores to farm XP, completions in the same category within a 24-hour window yield diminishing returns:
- Quests 1 to 3: **100% XP**
- Quest 4: **85% XP**
- Quest 5: **70% XP**
- Quest 6+: **55% XP** (minimum floor)

---

### 6. Cooperative Guilds & Multi-Tier Boss Raids

Players can establish fellowships or join their friends' parties using unique guild codes (e.g. `FOCUS-4921`).

| Boss Tier | Boss Name | Max HP | Boss Humor Quote & Weakness |
| :---: | :--- | :---: | :--- |
| **Tier 1** | *The Dread Procrastination Wyrm* | 2,000 HP | *"I will devour your deadlines tomorrow. Or maybe next Tuesday."*<br>Weakness: Daily focus tasks |
| **Tier 2** | *The Infinite Meeting Hydra* | 3,500 HP | *"Could this battle have been an email? We shall debate this for 45 minutes."*<br>Weakness: High-impact work quests |
| **Tier 3** | *The Overthinking Behemoth* | 5,000 HP | *"Before you strike, consider every consequence across twelve parallel timelines."*<br>Weakness: Decisive execution tasks |

- **Cooperative Strikes**: Whenever any party member completes a quest, it inflicts direct raid damage ($0.5 \times \text{XP Earned}$, or $+20\%$ extra for Paladins).
- **Guild Rally**: Any member can click the **Rally Guild** battle cry button to deal 25 morale damage.
- **Victory Bounties**: When the boss HP reaches 0, all party members receive **+100 Gold** and **+150 XP**, and the guild advances to the next Boss Tier!

---

### 7. In-Game Economy & Equipment Bazaar

- **Merchant Bazaar**: Spend hard-earned gold on weapons, relics, potions, and equipment.
- **Equip/Unequip System**: Equipping gear instantly updates your live radar attributes.
- **Cursed Relics**: High-risk, high-reward equipment (e.g. *Ring of Midnight Standups* grants +15 Strength but inflicts a -6 Sanity penalty).

---

### 8. Interactive Quirks & Companions

- **Bartholomew the Desk Goblin**: An animated interactive corner companion. Poke him for unprovoked philosophical commentary, or feed him snacks for 5 Gold to restore Sanity.
- **Wheel of Unreasonable Fate**: Tavern mini-game where players wager 10 Gold for unpredictable outcomes (Jackpots, silly titles, angry geese, or utter nothingness).
- **Suspicious Mimic Chest**: A clickable chest on the dashboard that breathes, snaps at curious adventurers, and dispenses secret coins.

---

## ⌨️ Arcane Keyboard Runes

Press `?` anywhere in the dashboard to open the interactive hotkey scroll:

| Rune Key | Action | Context |
| :---: | :--- | :--- |
| <kbd>N</kbd> | Draft a new quest dispatch | Opens New Quest modal |
| <kbd>M</kbd> | Toggle audio sound effects | Mutes/unmutes Web Audio synth |
| <kbd>S</kbd> | Visit the merchant bazaar shop | Opens shop & inventory |
| <kbd>F</kbd> | Spin Wheel of Unreasonable Fate | Opens tavern mini-game |
| <kbd>C</kbd> | Switch Character Class | Opens archetype selector |
| <kbd>?</kbd> | Arcane Keyboard Runes | Opens keyboard shortcuts cheat-sheet |
| <kbd>Esc</kbd> | Dismiss active modal or popup | Closes any active dialog |

---

## 📡 Complete API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Create a new adventurer account | No |
| `POST` | `/api/auth/login` | Authenticate and issue HTTP-only JWT cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/auth/me` | Fetch active user profile, stats, and decay alerts | Yes |
| `GET` | `/api/quests` | List user quests with category/status/search filters | Yes |
| `POST` | `/api/quests` | Create a new quest dispatch | Yes |
| `PATCH` | `/api/quests/[id]` | Slay (complete), abandon, or edit an existing quest | Yes |
| `DELETE` | `/api/quests/[id]` | Shred a quest scroll | Yes |
| `GET` | `/api/party` | Fetch user guild details, active boss HP, and member roster | Yes |
| `POST` | `/api/party` | Create guild (`CREATE`), join (`JOIN`), leave (`LEAVE`), or rally (`CHEER`) | Yes |
| `POST` | `/api/user/class` | Switch character class archetype (`WARRIOR`, `MAGE`, `ROGUE`, `PALADIN`) | Yes |
| `GET` | `/api/shop` | List all available bazaar items and player inventory | Yes |
| `POST` | `/api/shop/buy` | Atomically purchase a shop item with Gold | Yes |
| `POST` | `/api/inventory/equip` | Equip or unequip an inventory relic | Yes |
| `POST` | `/api/minigames/fate` | Spin the Wheel of Unreasonable Fate | Yes |
| `POST` | `/api/minigames/feed-goblin` | Feed Bartholomew the Desk Goblin | Yes |
| `GET` | `/api/logs` | Fetch user activity chronicle logs | Yes |
| `GET` | `/api/health` | System health check (database ping latency and uptime) | No |

---

## 🧪 Comprehensive Verification Suite (52 Tests)

The test suite runs with **Vitest 5** and validates all critical math and security boundaries:

```bash
npm run test
```

| Test Suite File | Tests | Validated Logic |
| :--- | :---: | :--- |
| `src/lib/__tests__/rpgEngine.test.ts` | 7 | Non-linear XP curve, level boundaries, difficulty multipliers |
| `src/lib/__tests__/depthMechanics.test.ts` | 7 | Class archetype buffs, diminishing returns scaling, category decay |
| `src/lib/__tests__/validations.test.ts` | 18 | Zod input sanitization, passwords, emails, quest enums, party codes |
| `src/lib/__tests__/partyBoss.test.ts` | 4 | Boss damage calculation, Paladin bonuses, defeat boundaries, code generator |
| `src/lib/__tests__/rateLimit.test.ts` | 4 | Sliding-window limiter, threshold blocking, window reset, client IP extraction |
| `src/lib/__tests__/economy.test.ts` | 5 | Shop purchases, insufficient gold rejection, cursed sanity penalties |
| `src/lib/__tests__/streakSystem.test.ts` | 5 | Consecutive day increments, same-day preservation, missed day resets |
| `src/lib/__tests__/health.test.ts` | 2 | Health check payload integrity and latency reporting |
| **TOTAL** | **52** | **100% Passing Unit Tests** |

---

## 📦 Quickstart & Setup Guide

### Prerequisites
- Node.js 20+ or 22+
- Git
- NPM 10+

### 1. Clone & Install
```bash
git clone https://github.com/ewwhardik/RPGWeb.git
cd RPGWeb
npm install --legacy-peer-deps
```

### 2. Configure Environment
Create `.env` in the project root:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="questsmith_super_secret_session_token_key_2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Starter Data
```bash
npm run db:push
npm run db:seed
```

This populates starter quests across all 6 stats, merchant shop items with comedic flavor text, and demo user credentials (`adventurer`, `password123`).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Test Verification
```bash
npm run test
npm run lint
npm run build
npm run start
```

---

## 🚀 Production Deployment Options

### Option A: Cloud PostgreSQL (Supabase / Neon / Railway)
1. Point `DATABASE_URL` in `.env` to your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
   ```
2. Apply the PostgreSQL schema:
   ```bash
   npm run db:push:pg
   ```
3. Run the database seed:
   ```bash
   npm run db:seed
   ```

### Option B: Vercel Deployment
1. Import `https://github.com/ewwhardik/RPGWeb.git` in Vercel.
2. Under Environment Variables, add:
   - `DATABASE_URL` (your cloud PostgreSQL URI)
   - `JWT_SECRET` (secure random string)
   - `NEXT_PUBLIC_APP_URL` (your Vercel production URL)
3. Set Build Command to: `prisma generate --schema=prisma/schema.postgresql.prisma && next build`.

---

## 📜 License
MIT License. Built for the Life RPG Challenge.
