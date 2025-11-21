# Implementation Blueprint: PWA & UX Overhaul

This blueprint outlines the steps to transform the Command Center into a high-performance Progressive Web App with improved UX.

## Phase 1: PWA Foundation (The "Installable" Upgrade)
**Goal:** Make the app installable, offline-capable, and feel like a native app.

### 1.1. Install `vite-plugin-pwa`
*   **Action:** Add `vite-plugin-pwa` dependency.
*   **Config:** Update `vite.config.ts` to include the PWA plugin.
*   **Strategy:** Use `generateSW` (Generate Service Worker) with `autoUpdate` for simplicity, or `injectManifest` for custom caching logic (recommended for API handling).
    *   *Cache:* CSS, JS, HTML, Images, Fonts.

### 1.2. Create Web Manifest (`manifest.json`)
*   **Identity:**
    *   Name: "Command Center"
    *   Short Name: "Command"
    *   Start URL: `/`
    *   Display: `standalone` (hides browser UI)
    *   Background Color: `#1a1b1e` (Dark Theme Background)
    *   Theme Color: `#1a1b1e`
*   **Icons:** Generate 192x192 and 512x512 icons (maskable and rounded).

### 1.3. Service Worker Registration
*   **Action:** Add PWA reload prompt logic in `App.tsx` (toast notification when a new version is available).

## Phase 2: Performance Optimization (The "Speed" Upgrade)
**Goal:** Instant load times (<1s).

### 2.1. Remove Artificial Loading Delay
*   **Target:** `src/components/LoadingScreen.tsx`
*   **Change:** Remove `setTimeout`. Replace with real initialization checks (e.g., "Auth Check" -> "Data Load" -> "Render").
*   **Fallback:** If loading is instantaneous, skip the screen entirely or show it for max 500ms.

### 2.2. Code Splitting (Lazy Loading)
*   **Target:** `src/App.tsx`
*   **Change:** Convert top-level module imports to `React.lazy()` imports.
    ```typescript
    const GolfSwing = React.lazy(() => import('@/components/modules/GolfSwing'));
    ```
*   **Wrapper:** Wrap module rendering in `<Suspense fallback={<ModuleLoader />}>`.

## Phase 3: UX & Accessibility Refinement (The "Feel" Upgrade)
**Goal:** Frictionless interaction and inclusivity.

### 3.1. "Quick Actions" FAB
*   **New Component:** `QuickActionsFab.tsx`
*   **Location:** Fixed bottom-right on Dashboard.
*   **Features:** Speed dial to:
    *   Add Habit
    *   Add Transaction
    *   Add Shopping Item

### 3.2. Accessibility Hardening
*   **Target:** `Habits.tsx`, `Shopping.tsx`
*   **Action:**
    *   Add `aria-label` to all `Button` components with only icons.
    *   Ensure `Contrast Ratio` for text is at least 4.5:1 (tweak text colors if needed).
    *   Increase touch targets: Ensure `min-height` and `min-width` of interactive elements is 44px.

### 3.3. Mobile Optimizations
*   **Viewport:** Ensure `viewport-fit=cover` is set in `index.html` to handle notches.
*   **Safe Areas:** Add `padding-bottom: env(safe-area-inset-bottom)` to navigation containers.

## Phase 4: Verification
*   **Test:** Run Lighthouse Audit (aim for 100 in PWA, >90 in Performance/Accessibility).
*   **Manual:** Verify "Add to Home Screen" works on iOS/Android simulators (or via browser devtools).
