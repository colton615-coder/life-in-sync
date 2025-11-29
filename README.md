# LiFE-iN-SYNC: Personal Dashboard

![License](https://img.shields.io/badge/license-Private-blue)
![React](https://img.shields.io/badge/react-19.0.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/typescript-5.9.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/vite-7.2.4-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.1.11-38b2ac?logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-8e44ad?logo=google)
![Playwright](https://img.shields.io/badge/tested%20with-Playwright-2EAD33?logo=playwright)

**LiFE-iN-SYNC** is a comprehensive, high-performance personal dashboard designed to optimize every aspect of daily living. From financial auditing and workout planning to habit tracking and golf swing analysis, this application serves as a central command center for the elite lifestyle.

Built with a "Holographic Deep-Glass" aesthetic (also known as "Ethereal Prism"), the UI features a deep radial gradient background (`violet-900` to `black`), animated ambient orbs, and glassmorphic elements with electric cyan accents, creating a futuristic, instrument-panel feel.

## 🚀 Core Features

### 📊 Dashboard
- **Daily Affirmations:** AI-generated inspirational quotes (Stoic, Biblical, Elite Mindset) displayed on a specialized loading screen with fading animations.
- **Quick Actions:** Immediate access to common tasks.
- **Welcome Greeting:** Personalized "Welcome Back, Colton" message.

### 💰 The Accountant (Finance 2.0)
- **The Audit:** A conversational, AI-driven review of your financial plan.
- **Wizard-Based Setup:** Multi-step data entry for Income, Fixed Expenses, Subscriptions, and Variable Budgets.
- **Deep Analysis:** Detailed spending breakdowns and budget optimization advice provided by an elite-level AI persona.
- **Data Persistence:** Financial reports are saved locally and "hydrated" to ensure data integrity.
- **Custom Categories:** Users can define custom categories and subcategories with specific frequencies.

### 💪 Workouts (Kinetic Engine)
- **Session Player:** A full-screen, focused interface for executing workouts (Work -> Rest -> Work queue).
- **Muscle Highlight:** Visualizing muscle engagement with a procedural SVG skeleton and glowing paths (`cyan-400`/`magenta-500`).
- **AI Generation:** Creates custom workout plans, simulating supersets and circuits.
- **Legacy Compatibility:** Adapts legacy workout structures to the new Session Player format.
- **Personal Records:** Integrated PR tracking within the session flow.

### ⛳ Golf Swing Analyzer
- **Video Analysis:** Frame-by-frame navigation using a "Virtual Jog-Dial" overlay.
- **Pose Estimation:** Visualizes skeletal wireframes (stick figure) and telemetry lines on the video.
- **AI Feedback:** Detailed breakdown of 8 swing phases (Address, Takeaway, Impact, etc.) with drills and tips.
- **Performance:** Parallelized processing ensures immediate analysis without "performance theater" delays.
- **Single Screen Topology:** Optimized for iPhone 16 viewport with no page-level scrolling.

### 📅 Habits
- **Visual Tracking:** Interactive icons (e.g., 'Drop', 'Heart') that fill on tap.
- **Celebrations:** Confetti animations upon daily goal completion.
- **Streaks:** Tracking for consistency and momentum.
- **Smart Filtering:** Uses `useMemo` for efficient list rendering (Active, Completed, Filtered).

### ⚙️ Settings
- **API Management:** Securely manage your Google Gemini API key.
- **Data Control:** Granular or global data reset options (preserving API keys and Safe Mode).
- **Test Connection:** Validate API keys with a minimal prompt before saving.

## 🛠 Tech Stack

- **Frontend Framework:** React 19 (ESNext target)
- **Build Tool:** Vite
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4, Framer Motion, Lucide React (Icons), JetBrains Mono (Data fonts).
- **AI Engine:** Google Gemini 2.5 Pro (via `GeminiCore` service).
- **State Management:** Local-first architecture using `localStorage` wrapper (`useKV` hook).
- **Testing:**
  - **E2E:** Playwright (Python scripts in `verification/`, TS specs in `tests/`).
  - **Unit:** Jest with `ts-jest` and `jest-environment-jsdom`.
- **PWA:** Fully configured Progressive Web App with service worker and manifest.

## 🏗 Architecture

### Service & Adapter Pattern
The application uses a robust Service & Adapter pattern for AI integration. `GeminiCore` is the sole provider, wrapped by adapters that handle specific domain logic (e.g., Finance, Workouts). This ensures separation of concerns and easy maintenance.

### Local-First Data
All user data is stored locally in the browser's `localStorage` using a type-safe `useKV` hook. This ensures privacy and offline capability.
- **Data Migration:** Auto-healing logic in `useEffect` hooks sanitizes and migrates legacy data structures on startup.
- **UUIDs:** `uuid` v4 is used for all entity generation to ensure uniqueness.

### Component Library
Reusable UI components (Buttons, Cards, Badges) reside in `src/components/ui/` and follow a customized Shadcn-like structure.
- **Design:** "Holographic Deep-Glass" style (`bg-white/5`, `backdrop-blur-xl`, `border-white/10`).
- **Typography:** Inter/Manrope for UI, JetBrains Mono for data.

## 💻 Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: If `jest-environment-jsdom` is missing, install it with `npm install -D jest-environment-jsdom`.*

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add your Gemini API key (optional, can also be set in UI):
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 🧪 Testing

### Unit Tests (Jest)
Run unit tests for logic and components:
```bash
npm run test  # or npx jest
```
*Note: Service layer tests must mock `GeminiCore`.*

### End-to-End Tests (Playwright)
Run the full E2E test suite:
```bash
npx playwright test
```
*Note: Playwright is configured to spin up the dev server automatically.*

## 📂 Project Structure

```
src/
├── components/
│   ├── modules/       # Feature modules (Finance, Workouts, Golf, etc.)
│   ├── shell/         # App shell (FloatingDock, LifeCore, Toaster)
│   └── ui/            # Reusable primitives (Buttons, Cards, Inputs)
├── context/           # Global state (WorkoutContext)
├── lib/               # Utilities and Logic
│   ├── ai/            # AI Adapters and Utils
│   ├── golf/          # Golf Swing specific logic
│   ├── workout/       # Workout session queue logic
│   └── storage.ts     # LocalStorage wrapper
├── services/          # Core services (GeminiCore, Logger)
├── types/             # Zod schemas and TypeScript interfaces
├── tests/             # Playwright E2E tests
└── main.css           # Global styles (Tailwind v4)
```

## 🎨 Design Guidelines

- **Layout:** Mobile-first, compact density. 2-column grids preferred over stacks for metrics.
- **Visuals:** High z-indices for overlays (`z-[100]`, `z-[9999]`).
- **Feedback:** "Toaster" notifications use a Neon/Glowing aesthetic.
- **Error Handling:** `GlobalErrorBoundary` catches UI crashes; `handleApiError` manages service failures.

---

**LiFE-iN-SYNC** — *Optimize. Execute. Evolve.*
