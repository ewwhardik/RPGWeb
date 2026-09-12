# QuestSmith: The Life RPG (The Adventurer's Bureaucracy)

> Transform mundane real-world tasks, gym grinds, study sessions, and chores into an engaging, non-linear virtual RPG progression engine.

---

## ⚔️ Project Overview

**QuestSmith** solves the delayed-gratification flaw inherent in traditional habit trackers and todo apps. Real-world accomplishments like working out, finishing a book, or refactoring legacy code take weeks to show results. QuestSmith bridges this gap by awarding instant dopamine, Gold, character attribute boosts, and non-linear leveling with physical tactile interactions and witty comedic feedback.

### 🎨 Creative Direction & Aesthetic Guardrails
- **Zero Purple**: A grounded palette anchored in Deep Obsidian (`#0b0e14`), Burnished Amber Gold (`#f59e0b`), Forest Emerald (`#10b981`), Warm Crimson (`#ef4444`), and Slate accents. Zero violet, indigo, or purple hues.
- **Tactile Uiverse-Inspired Components**: Physical 3D-pressed buttons with real bottom bevels, wax stamp task seals, and retro mechanical switches.
- **Zero AI Slop & Zero Excessive Glow**: Crisp, grounded textures, Google Cinzel serif titles, and tactile physical feedback.
- **Humanly Humorous Text**: Natural, self-aware narration that playfully roasts procrastination and celebrates everyday victories.
- **Zero Audio CDN Dependencies**: Crisp 8-bit retro sound effects (coin chimes, wax stamp thuds, fanfare) synthesized entirely in real-time via the HTML5 Web Audio API.

---

## 🏛️ Architectural Insights & Reference Studies

QuestSmith incorporates architectural lessons from key open-source references:

1. **Habitica (`github.com/HabitRPG/habitica`)**:
   - Implemented 4 distinct class archetypes (Warrior, Mage, Rogue, Paladin) with specialized passive buffs.
   - Decoupled API architecture cleanly isolating presentation layer from business logic.
   - Built a cooperative Party and Guild raid system where every member's quest completion deals shared damage to a World Boss.

2. **min_max (`github.com/Sheperdd/min_max`)**:
   - Implemented Stat Decay mechanics: character attributes neglected for more than 4 days slowly atrophy down to a baseline floor of 5, nudging balanced habits.
   - Built diminishing returns math: repetitive grinding of the same attribute within a 24-hour window yields progressively reduced XP multipliers (100% -> 85% -> 70% -> 55%), encouraging holistic life balance.

3. **hbit-archive (`github.com/squashd/hbit-archive`)**:
   - Observed the cautionary hazards of premature microservice decomposition.
   - Kept QuestSmith a cohesive, modular Next.js full-stack monolith with atomic database transactions and typed schemas.

---

## 🗺️ Five-Phase Implementation Roadmap

### Phase 1: Hardening & Visual Hierarchy
- **Zod Validation**: Validates every incoming API route payload (`/api/auth`, `/api/quests`, `/api/shop`, `/api/party`).
- **Atomic Transactions**: Wrapped XP, Gold, and inventory mutations inside `prisma.$transaction` to guarantee zero race conditions on concurrent requests.
- **Rate Limiting**: In-memory sliding-window rate limiter safeguarding authentication endpoints against brute force attempts.
- **React Error Boundary**: Graceful error fallback screen with humorous recovery guidance.
- **Visual Overhaul**: 3D diorama in a box with radial vignette, animated shimmer-stripe XP bar, stamina tick meters, Google Cinzel font titles, and an illustrated sleeping desk goblin empty state.

### Phase 2: Data Layer & Dual Database Support
- **Dual Schema**: Full support for local zero-config SQLite (`prisma/schema.prisma`) and cloud PostgreSQL/Supabase (`prisma/schema.postgresql.prisma`).
- **Comprehensive Seed Script**: Seeds starter quests across all 6 stats, merchant shop items with comedic flavor text, and demo user accounts.
- **NPM Database Scripts**: `db:seed`, `db:push`, `db:push:pg`, `db:migrate:pg`.

### Phase 3: Depth Mechanics (Classes, Decay & Diminishing Returns)
- **4 Character Archetypes**:
  - **Warrior**: +25% Strength XP and +15% coin salvage.
  - **Mage**: +25% Intellect XP and +20% extra Sanity from tavern rest.
  - **Rogue**: +20% Dexterity and Charisma XP, +25% gold bounty.
  - **Paladin**: +20% Vitality XP, +20% Boss Raid damage, and party morale buffs.
- **Attribute Neglect & Decay**: Inactivity on any stat for > 4 days decrements the stat by 1 point (min floor 5).
- **Diminishing Returns**: Completing > 3 quests of the same category in 24 hours scales rewards downward to prevent habit spamming.

### Phase 4: Social Layer (Parties & Cooperative Boss Raids)
- **Guild Party System**: Create fellowships or join via unique invite codes (e.g. `FOCUS-4921`).
- **Cooperative Boss Raids**:
  - Tier 1: *The Dread Procrastination Wyrm* (2,000 HP)
  - Tier 2: *The Infinite Meeting Hydra* (3,500 HP)
  - Tier 3: *The Overthinking Behemoth* (5,000 HP)
- **Raid Strike Integration**: Every completed quest inflicts direct raid damage to the active boss.
- **Raid Victory Bounties**: Vanquishing a boss rewards all party members with +100 Gold, +150 XP, and advances the raid tier.
- **Guild Rally**: Shout a battle cry to deal 25 morale damage.

### Phase 5: Production Readiness & Observability
- **GitHub Actions CI Pipeline**: Automated workflow (`.github/workflows/ci.yml`) validating tests, ESLint, and Next.js production builds.
- **Health Check API**: `/api/health` monitoring database connectivity latency, process uptime, and system status.
- **Arcane Keyboard Runes**: Hotkey navigation with cheat-sheet modal (`?` key), quick quest drafting (`N`), audio toggling (`M`), merchant visits (`S`), fate wheel (`F`), and class switching (`C`).

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons, Uiverse-inspired tactile micro-interactions
- **3D Graphics**: Three.js WebGL canvas (Hero Relic Diorama)
- **Audio**: Procedural Web Audio API synthesizer (tactile clicks, coins, wax stamps, level fanfares)
- **Validation**: Zod schema validation on all mutation endpoints
- **Database & ORM**: Prisma ORM with SQLite (local) and PostgreSQL (production)
- **Testing**: Vitest test runner with 20 unit tests across math, decay, boss, and health suites
- **Continuous Integration**: GitHub Actions automated pipeline

---

## 📦 Local Setup Instructions

### Prerequisites
- Node.js 20+
- Git

### Installation Steps

1. **Clone Repository**:
   ```bash
   git clone https://github.com/ewwhardik/RPGWeb.git
   cd RPGWeb
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database and Seed Starter Content**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Run Test Suite**:
   ```bash
   npm run test
   ```

7. **Run Linter**:
   ```bash
   npm run lint
   ```

8. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## ⌨️ Arcane Keyboard Runes

Press `?` anywhere in the application to view the keyboard shortcuts scroll:
- `N`: Draft a new quest dispatch
- `M`: Toggle audio sound effects on or off
- `S`: Visit the merchant bazaar shop
- `F`: Spin the Wheel of Unreasonable Fate
- `C`: Switch Character Class archetype
- `?`: Toggle keyboard shortcuts cheat-sheet
- `Esc`: Dismiss active modal or popup

---

## 📜 License
MIT License. Built for the Life RPG Challenge.
