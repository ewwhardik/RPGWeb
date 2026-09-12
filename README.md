# QuestSmith: The Life RPG (The Adventurer's Bureaucracy)

> Transform mundane real-world tasks, gym grinds, study sessions, and chores into an engaging, non-linear virtual RPG progression engine.

---

## ⚔️ Project Overview

**QuestSmith** solves the delayed-gratification flaw inherent in traditional habit trackers and todo apps. Real-world accomplishments like working out, finishing a book, or refactoring legacy code take weeks to show results. QuestSmith bridges this gap by awarding instant dopamine, Gold, character attribute boosts, and non-linear leveling with physical tactile interactions and witty comedic feedback.

### 🎨 Creative Direction & Aesthetic Guardrails
- **Zero Purple**: A custom palette anchored in Deep Obsidian (`#0b0e14`), Burnished Amber Gold (`#f59e0b`), Forest Emerald (`#10b981`), Warm Crimson (`#ef4444`), and Slate accents. Zero violet, indigo, or purple hues.
- **Tactile Uiverse-Inspired Components**: Physical 3D-pressed buttons with real bottom bevels, wax stamp task seals, and retro mechanical switches.
- **Zero AI Slop & Zero Excessive Glow**: Crisp, grounded textures, clean typography, and tactile physical feedback.
- **Humanly Humorous Text**: Natural, self-aware narration that playfully roasts procrastination and celebrates everyday victories.
- **Zero Audio CDN Dependencies**: Crisp 8-bit retro sound effects (coin chimes, wax stamp thuds, fanfare) synthesized entirely in real-time via the HTML5 Web Audio API.

---

## 🚀 Core Systems & Features

### 1. Robust Authentication & Session Isolation
- Secure user signup and signin with salted password hashing (`bcryptjs`) and HTTP-only JWT sessions.
- User-scoped tasks, character stats, and equipment isolation.
- Fast-track demo account button ("Instant Demo Login") for rapid evaluation.

### 2. Full Quest CRUD with Wax Stamp Micro-Interactions
- **Create**: Add custom quests with attribute categories, difficulty tiers, and deadlines. Includes an "Inspire Me" button for humorous real-world task prompts.
- **Read**: Dynamic filtering by completion status, attribute category, and real-time search.
- **Update**: Renegotiate quest titles, descriptions, and difficulty rewards.
- **Delete**: Shred tasks with confirmation.
- **Wax Stamp Slain**: Certify completed tasks with an embossed wax stamp animation, tactile screen bounce, flying XP/Gold badges, and retro audio chimes.
- **Cobweb Indicator**: Quests left untouched for over 48 hours gather cobwebs and warn the player of procrastination.

### 3. Non-Linear RPG Progression Engine
- **Progression Math**: Each level requires non-linearly more experience than the last:
  $$\text{XP Required}(L) = \lfloor 100 \times L^{1.5} \rfloor$$
- **Dynamic Character Titles**: Unlocks humorous titles as you climb (e.g. *Novice Procrastinator*, *Caffeine Apprentice*, *Errand Vanquisher*, *Deadline Duelist*, *Mythic Productivity Demigod*).
- **Golden Confetti Celebration**: Leveling up triggers a golden and emerald particle fountain (`canvas-confetti`) and brass fanfare.

### 4. Six Core Character Attributes
Every quest is categorized to level up specific character stats:
- **Strength**: Fitness, workouts, heavy lifting, sports.
- **Intellect**: Coding, studying, deep research, solving bugs.
- **Vitality**: Sleep hygiene, healthy cooking, hydration.
- **Dexterity**: Speed cleaning, laundry, organization, nimble chores.
- **Charisma**: Difficult emails, presentations, networking, social events.
- **Sanity**: Touching grass, meditation, disconnecting from screens.

### 5. In-Game Economy & Equipment Inventory
- Earn Gold by completing quests.
- Visit **The Grumble & Glory Bazaar** to purchase virtual gear, potions, and equipment.
- Items feature hilarious lore descriptions, stat bonuses, and rarity tiers (*Common*, *Uncommon*, *Rare*, *Legendary*).
- Equip/unequip gear directly modifies your live character attributes.

### 6. Interactive 3D Voxel Diorama
- Real-time low-poly 3D floating relic powered by **Three.js**.
- Smooth cursor tracking and ambient bobbing physics.
- Orbiting satellite runes represent your level and quest completions.
- Interactive click-to-spin mechanics with tactile audio.

### 7. Weird Interactive Quirks & Easter Eggs
- **Bartholomew the Desk Goblin**: An animated interactive corner companion. Poke him to receive unprovoked life commentary, or feed him snacks for 5 Gold to boost your Sanity.
- **Wheel of Unreasonable Fate**: A tavern mini-game where players wager 10 Gold for unpredictable outcomes (Jackpots, silly titles, angry geese, or total nothing).
- **Suspicious Mimic Chest**: A clickable chest on the dashboard that breathes, snaps at curious adventurers, and dispenses secret coins.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons, Uiverse-inspired tactile micro-interactions
- **3D Graphics**: Three.js WebGL canvas
- **Particles**: Canvas-Confetti
- **Audio**: Procedural Web Audio API synthesizer
- **Backend**: Next.js API Route Handlers
- **Database & ORM**: Prisma ORM with SQLite (local development and zero-config evaluation; fully compatible with PostgreSQL / Supabase for deployment)
- **Security**: Bcryptjs, JSON Web Tokens (HTTP-only cookies)

---

## 📦 Local Setup Instructions

### Prerequisites
- Node.js 18+ or 20+
- Git

### Installation Steps

1. **Clone the Repository**:
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
   Default `.env` contents:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="questsmith_super_secret_session_token_key_2026"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize Database & Seed Shop Items**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Production Build & Verification**:
   ```bash
   npm run build
   npm run start
   ```

---

## ⌨️ Accessibility & Keyboard Navigation

- Entire application navigable using keyboard:
  - `Tab` / `Shift + Tab`: Focus elements sequentially
  - `Enter` / `Space`: Activate buttons, stamps, and inputs
  - `Escape`: Instantly dismiss any open modal (New Quest, Shop, Wheel of Fate, Level Up)
- ARIA landmarks and high-contrast color ratios for readability.

---

## 📜 License
MIT License. Built for the Life RPG Challenge.
