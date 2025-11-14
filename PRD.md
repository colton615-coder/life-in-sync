# Habit Tracker PRD

A visual habit tracking application where users set daily goals (like drinking 8 glasses of water) and tap interactive icons throughout the day to mark progress, with celebration animations upon completion to reinforce positive behavior. The app features a global completion tracking system that separates completed items from active items across all modules, enabling rich analytics and data-driven insights.

**Experience Qualities**:
1. **Satisfying** - Each tap provides immediate visual feedback with icons filling up, creating a dopamine-rewarding experience
2. **Motivating** - Visual progress bars and celebration animations encourage users to complete their daily goals
3. **Simple** - No complex menus or settings—just set a goal, tap throughout the day, and watch progress
4. **Personalized** - Customizable theme options (light, dark, system) allow users to tailor the app's appearance to their preferences

**Complexity Level**: Light Application (focused feature set with visual feedback, daily state tracking, and cross-module completion analytics)
  - Habit tracking tool with visual icon-based progress, celebration animations, daily completion history, and a global completion tracking system for analytics across all modules

## Essential Features

### Loading Screen with Daily Affirmations
- **Functionality**: Display an animated loading screen with inspirational quotes or Bible verses while the app initializes, using AI to generate fresh content
- **Purpose**: Create positive user experience on app launch while masking load time, set motivational tone for the session
- **Trigger**: User opens or refreshes the app
- **Progression**: App loads → Loading screen appears with animated background → AI fetches daily affirmation → Quote/verse animates in with elegant typography → App content loads in background → Smooth fade transition to main interface
- **Success criteria**: Loading screen displays within 100ms, affirmation appears smoothly and remains visible for ~4 seconds to allow reading, transitions feel seamless, fallback quotes available if AI fails

### Visual Progress Tracking
- **Functionality**: Display a grid of icon representations (glasses for water, checkmarks for habits, etc.) that fill/highlight as user directly taps individual icons to log progress toward daily goal
- **Purpose**: Create satisfying visual feedback that motivates completion through seeing progress accumulate with direct icon interaction
- **Trigger**: User sets daily goal (e.g., "8 glasses of water")
- **Progression**: User opens app → Sees grid of 8 empty glass icons → Taps individual icons throughout day → Each tapped icon fills with animated color transition → Final icon triggers celebration animation → Completion logged to history
- **Success criteria**: Icons animate smoothly on tap (< 200ms), celebration fires on final completion, daily progress persists, clicking filled icons allows adjusting progress backwards

### Goal Setting
- **Functionality**: Simple interface to set habit name, choose icon type, and set daily target number
- **Purpose**: Allow users to customize tracking for different habit types (water, steps, pages read, etc.)
- **Trigger**: User taps "Add Habit" or edits existing habit
- **Progression**: Tap add habit → Enter habit name → Select icon type from preset options → Set target number (1-20) → Habit appears in list
- **Success criteria**: Changes save immediately, icon selection is intuitive, reasonable numeric limits prevent errors

### Celebration Animation
- **Functionality**: Confetti or particle animation with sound/haptic feedback when daily goal is completed
- **Purpose**: Provide dopamine reward for completing goal, reinforcing positive behavior
- **Trigger**: User completes final increment of daily goal by tapping the last empty icon
- **Progression**: User taps final empty icon → Icon fills → Screen-wide celebration animation plays → Success message appears → Completion recorded with timestamp
- **Success criteria**: Animation plays within 100ms of completion, feels rewarding without being excessive (2-3 seconds), doesn't block continued interaction

### History & Streaks
- **Functionality**: Calendar view showing which days goals were completed, current streak counter, completion analytics across all modules
- **Purpose**: Provide long-term motivation through streak building, visual history, and data-driven insights into completion patterns
- **Trigger**: User views history tab, sees streak badge on main screen, or accesses analytics dashboard
- **Progression**: User completes daily goal → Completion logged with date → Calendar marks day as complete → Streak counter increments if consecutive → Completion stats update → User can view past days and patterns across modules
- **Success criteria**: Streak calculates correctly across day boundaries, history persists indefinitely, missed days clearly visible, completion data can be analyzed across all modules

### Global Completion Tracking System
- **Functionality**: Unified system for tracking, separating, and analyzing completed vs. active items across all modules (Habits, Tasks, Workouts, etc.)
- **Purpose**: Provide consistent completion tracking, enable rich analytics, maintain data integrity, and allow cross-module insights
- **Trigger**: Any item completion in any module
- **Progression**: User completes item → Completion timestamp recorded → Item moved to completed list → Stats updated in real-time → Analytics data accumulated → User can filter by completion status and view statistics
- **Success criteria**: All modules use consistent completion tracking, active/completed items properly separated, statistics accurate, completion data persists, filters work correctly, analytics provide actionable insights

### AI Financial Advisor Interview & Budget Generation
- **Functionality**: Multi-step interview process where an AI financial advisor asks comprehensive questions about income, housing, debt, goals, and spending habits, then generates a detailed, personalized budget plan (currently uses Spark LLM, planned migration to Gemini Pro 2.5 for enhanced reasoning)
- **Purpose**: Provide in-depth financial planning through conversational AI guidance, creating optimized budget allocations based on user's complete financial picture
- **Trigger**: User navigates to Finance module → AI Financial Advisor tab
- **Progression**: User starts interview → Answer 5 step questionnaire covering income, housing, debt, goals, and spending habits → AI analyzes complete profile → Generates detailed budget with category allocations → Shows personalized recommendations with reasoning → Provides savings strategy → Offers debt payoff plan (if applicable) → Displays actionable steps
- **Success criteria**: Interview feels conversational and thorough, all financial factors considered, budget totals balance to income, recommendations are specific and practical, AI reasoning is clear and helpful, budget persists for future reference, user can restart process anytime

### AI Provider Integration (Planned)
- **Functionality**: Integrate Google Gemini Pro 2.5 alongside existing Spark LLM (GPT-4o) with intelligent routing, fallback mechanisms, and unified abstraction layer
- **Purpose**: Leverage best AI model for each task, optimize costs, improve reasoning capabilities for complex features, enable multimodal futures
- **Trigger**: Developer configures Gemini API key in settings (owner only)
- **Progression**: Owner adds API key → System validates configuration → AI router automatically selects optimal provider per feature → Usage tracked for cost optimization → Automatic fallback on failures → Analytics show provider performance
- **Success criteria**: Seamless provider switching, <3s response times, >99% uptime with fallback, secure key storage, no user-facing errors, cost tracking accurate, documentation complete

### Theme Personalization
- **Functionality**: Toggle between light, dark, and system-preferred themes with persistent storage of user preference
- **Purpose**: Provide visual customization that adapts to user environment and preference, enhancing comfort and accessibility
- **Trigger**: User clicks theme toggle button (top-right corner or in navigation drawer)
- **Progression**: User opens theme menu → Selects light, dark, or system theme → Interface transitions smoothly to selected theme → Preference saved automatically → Theme persists across sessions
- **Success criteria**: Theme changes apply instantly with smooth transitions, user preference persists between sessions, system theme automatically adapts to OS preference changes, all UI elements properly support both themes with correct contrast ratios

## Edge Case Handling
- **Empty States**: Show welcoming prompt "Start your first habit!" with animated icon when no habits exist
- **Goal Already Complete**: Show success state when daily goal is reached; icons remain clickable to adjust progress
- **Date Boundaries**: Progress resets at midnight local time; completed days logged to history
- **Multiple Habits**: Support tracking multiple different habits simultaneously with separate progress for each
- **Accidental Taps**: Clicking filled icons adjusts progress backwards to that point, allowing easy corrections
- **Long Streaks**: Special milestone celebrations at 7, 30, 100 days with different animations
- **Data Loss Prevention**: Confirm before deleting habits; show toast with undo option
- **Theme Transitions**: Smooth color transitions when switching themes; no jarring flashes
- **System Theme Changes**: Automatically adapt when user changes OS theme preference (when system theme is selected)

## Design Direction
The interface should feel sleek, powerful, and high-functioning with an abstract, premium aesthetic. The design should evoke a sense of sophistication and control through bold geometric elements, subtle gradients, glass-morphic surfaces, and purposeful animations. A dark, rich interface with strategic use of color creates depth and dimension, while abstract background patterns and floating elements convey technical prowess and modern design.

## Color Selection
Dark and light themes with sophisticated color scheme featuring vibrant neon accents in dark mode and clean, modern tones in light mode.

**Light Theme:**
- **Primary Color**: Soft Teal (oklch(0.48 0.12 75)) - Calming, focused action color for primary buttons
- **Secondary Colors**: 
  - Pale Green (oklch(0.90 0.05 90)) - Gentle supporting color for secondary surfaces
  - Bright Green (oklch(0.72 0.08 110)) - Fresh accent for highlights
- **Accent Color**: Success Green (oklch(0.65 0.18 150)) - Completion states with positive reinforcement
- **Foreground/Background Pairings**:
  - Background (Soft White oklch(0.98 0.008 85)): Dark Text (oklch(0.20 0.02 45)) - Ratio 11.4:1 ✓
  - Card (Crisp White oklch(0.99 0.005 85)): Dark Text (oklch(0.20 0.02 45)) - Ratio 12.1:1 ✓
  - Primary (Soft Teal oklch(0.48 0.12 75)): Light Text (oklch(0.98 0.008 85)) - Ratio 6.2:1 ✓
  - Accent (Bright Green oklch(0.72 0.08 110)): Dark Text (oklch(0.20 0.02 45)) - Ratio 5.1:1 ✓

**Dark Theme:**
- **Primary Color**: Electric Cyan (oklch(0.75 0.20 195)) - High-tech, powerful accent for primary actions and key interactive elements
- **Secondary Colors**: 
  - Deep Purple (oklch(0.55 0.25 285)) - Premium, abstract feel for secondary surfaces and accents
  - Neon Pink (oklch(0.70 0.25 350)) - Bold highlight for critical actions and special states
- **Accent Color**: Lime Green (oklch(0.80 0.22 130)) - Success and completion states with high contrast
- **Foreground/Background Pairings**:
  - Background (Deep Dark oklch(0.15 0.02 265)): Light Text (oklch(0.95 0.01 265)) - Ratio 11.2:1 ✓
  - Card (Dark Surface oklch(0.22 0.03 265)): Light Text (oklch(0.95 0.01 265)) - Ratio 8.5:1 ✓
  - Primary (Electric Cyan oklch(0.75 0.20 195)): Dark Background (oklch(0.15 0.02 265)) - Ratio 7.1:1 ✓
  - Secondary (Deep Purple oklch(0.55 0.25 285)): Light Text (oklch(0.95 0.01 265)) - Ratio 5.8:1 ✓
  - Accent (Lime Green oklch(0.80 0.22 130)): Dark Background (oklch(0.15 0.02 265)) - Ratio 9.2:1 ✓
  - Muted (Subtle Gray oklch(0.40 0.02 265)): Light Text (oklch(0.95 0.01 265)) - Ratio 4.8:1 ✓

## Font Selection
Typography should convey friendly approachability with clear readability through the Poppins font family for headings (personality) and Inter for body text (clarity).

- **Typographic Hierarchy**:
  - H1 (Habit Names): Poppins SemiBold / 32px / normal letter spacing / 1.2 line height
  - H2 (Section Headers): Poppins Medium / 24px / normal / 1.3
  - Body (Descriptions): Inter Regular / 16px / normal / 1.5
  - Stats (Progress Numbers): Poppins SemiBold / 48px / tight / 1.1 / tabular-nums
  - Labels: Inter Medium / 14px / normal / 1.4
  - Captions: Inter Regular / 13px / normal / 1.4

## Animations
Animations should create a sense of power and precision, with smooth, purposeful movements that emphasize the app's high-functioning nature. Glass-morphic transitions, subtle particle effects, and geometric transformations convey technical sophistication. The balance is restrained elegance—every animation serves a purpose and reinforces the premium, abstract aesthetic.

- **Purposeful Meaning**: Glass-morphic transitions communicate depth and layering; geometric animations provide sophisticated feedback; ambient particles suggest technical complexity; glow effects emphasize interactive states
- **Hierarchy of Movement**: 
  - Primary: Smooth glass-morphic reveals, icon state transitions with glow effects, celebration with abstract particles
  - Secondary: Navigation drawer slide with blur, card hover elevations with shadows, progress bar fills with gradient shifts
  - Tertiary: Ambient background animations, subtle icon pulse states, menu transitions with fade and scale

## Component Selection

- **Components**:
  - **Card**: Primary container for each habit with elevated shadow
  - **Dialog**: Add/edit habit forms, history calendar view
  - **Progress**: Linear progress bar showing overall completion percentage
  - **Badge**: Streak counter with flame icon, milestone indicators
  - **Tabs**: Switch between active habits and history view
  - **Input**: Habit name and target number entry
  - **Select**: Icon type selection dropdown
  - **ScrollArea**: List of multiple habits
  - **Separator**: Visual dividers between habits

- **Customizations**:
  - **Habit Icon Grid**: Custom component displaying clickable icon array that fills progressively (e.g., 8 glasses)—each icon is an interactive button
  - **Celebration Overlay**: Full-screen confetti animation with success message
  - **Streak Badge**: Animated counter with flame icon and glow effect
  - **Progress Icon**: Individual tappable icon button that animates fill state (empty → filled) with hover and active states

- **States**:
  - **Icons**: Empty (outlined gray with hover effect), Filled (solid color with checkmark), Hover (scale up, highlighted border), Active (scale down), Completed (all filled with celebration)
  - **Cards**: Default (elevated shadow), Hover (increased shadow), Completed Today (success border glow)

- **Icon Selection**:
  - Habit Types: Droplet (water), Book (reading), Dumbbell (exercise), Apple (nutrition), Moon (sleep), Heart (meditation)
  - Actions: Plus (increment), Minus (decrement), Fire (streak), Calendar (history), Settings (configure)
  - Status: CheckCircle (complete), Clock (in progress), Sparkles (celebration)

- **Spacing**: Generous 8-based scale (8px, 16px, 24px, 32px, 48px) with large icon grids using gap-6, cards using p-8, comfortable tap targets of 60px minimum

- **Mobile**: 
  - Stacked habit cards with full-width layout
  - Large, easily tappable icon buttons (min 60px)
  - Bottom sheet for add/edit forms
  - Celebration animation optimized for portrait orientation
  - Icon grid wraps responsively (2-3 columns on mobile, 4-6 on tablet/desktop)
