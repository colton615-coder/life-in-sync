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

### Shopping List Module
- **Functionality**: Minimalist shopping list manager with add, edit, delete, and check/uncheck capabilities—just like pen and paper, but with beautiful digital polish
- **Purpose**: Provide a distraction-free shopping list experience that feels natural and effortless, like writing on a notepad
- **Trigger**: User navigates to Shopping module from navigation drawer
- **Progression**: User opens Shopping → Sees clean neumorphic notepad interface → Types item name and clicks Add → Item appears in list with checkbox → User checks off items while shopping → Checked items move to bottom with strikethrough → User can inline-edit any item name → User can delete items → Simple counter shows active vs completed items
- **Success criteria**: Interface feels like a physical notepad, add/edit/delete operations are instant with smooth animations, items persist between sessions using useKV, inline editing feels natural, completed items remain visible but visually de-emphasized, all interactions are polished with subtle hover states and satisfying micro-interactions

### Golf Swing Analyzer Module
- **Functionality**: Professional AI-powered golf swing analysis using pose estimation to extract 3D landmarks, compute critical metrics (spine angle, hip rotation, head movement, swing plane, tempo, weight transfer), and generate personalized feedback with drill recommendations
- **Purpose**: Provide golfers with instant, professional-grade swing analysis without expensive coaching sessions, enabling data-driven improvement through actionable insights
- **Trigger**: User navigates to Golf Swing module (formerly Vault) from navigation drawer
- **Progression**: User uploads swing video (MP4, MOV, etc.) → Video processes with real-time progress display (uploading → extracting frames → pose estimation → analyzing mechanics → generating AI insights) → Completed analysis displays with video playback, detailed metrics dashboard, strengths/improvements breakdown, AI-generated insights, and personalized practice drills → User can upload multiple swings and compare progress over time → Historical analyses persist in sidebar for easy access
- **Success criteria**: Video upload accepts common formats under 100MB, processing completes in under 30 seconds with accurate progress feedback, pose estimation detects key body landmarks reliably, metrics calculations are accurate and meaningful, AI feedback is specific and actionable, drill recommendations target actual weaknesses, interface is intuitive for non-technical users, all data persists between sessions, video playback is smooth, comparison view shows improvement trends

## Edge Case Handling
- **Empty States**: Show welcoming prompt "Start your first habit!" with animated icon when no habits exist; "Upload Your First Swing" for golf analyzer
- **Goal Already Complete**: Show success state when daily goal is reached; icons remain clickable to adjust progress
- **Date Boundaries**: Progress resets at midnight local time; completed days logged to history
- **Multiple Habits**: Support tracking multiple different habits simultaneously with separate progress for each
- **Accidental Taps**: Clicking filled icons adjusts progress backwards to that point, allowing easy corrections
- **Long Streaks**: Special milestone celebrations at 7, 30, 100 days with different animations
- **Data Loss Prevention**: Confirm before deleting habits; show toast with undo option
- **Theme Transitions**: Smooth color transitions when switching themes; no jarring flashes
- **System Theme Changes**: Automatically adapt when user changes OS theme preference (when system theme is selected)
- **Video Upload Errors**: Validate file type and size before processing, show clear error messages for unsupported formats or files too large
- **Processing Failures**: Graceful error handling with retry option, error state persists in analysis list
- **Incomplete Analysis**: Partial results saved if analysis fails mid-process, user can delete and retry
- **No Video Selected**: File input validates selection before starting upload process
- **Browser Compatibility**: Video playback fallbacks for unsupported codecs, WebGL requirements checked for pose estimation

## Design Direction
The interface should feel like a professional dark dashboard UI kit—sleek, modern, and high-tech with a focus on data visualization and control. The design evokes technical sophistication through dark surfaces, bright cyan/blue accents, clean geometric layouts, and subtle gradients. The aesthetic is minimalist yet functional, with clear hierarchies, rounded corners, and purposeful use of color to highlight interactive elements and data. The overall feel is professional, cutting-edge, and optimized for extended use in low-light environments.

## Color Selection
Dark theme with vibrant cyan/blue accents following modern dashboard UI conventions.

**Dark Dashboard Theme:**
- **Primary Color**: Vibrant Cyan (oklch(0.70 0.19 195)) - High-tech accent for primary actions, interactive elements, and data highlights
- **Secondary Colors**: 
  - Dark Surface (oklch(0.25 0.01 240)) - Card and component backgrounds
  - Darker Surface (oklch(0.20 0.01 240)) - Nested elements and inputs
- **Accent Color**: Electric Blue (oklch(0.65 0.18 230)) - Secondary highlights and alternate data points
- **Foreground/Background Pairings**:
  - Background (Deep Dark oklch(0.17 0.01 240)): Light Text (oklch(0.92 0.005 240)) - Ratio 10.8:1 ✓
  - Card (Dark Surface oklch(0.25 0.01 240)): Light Text (oklch(0.92 0.005 240)) - Ratio 7.2:1 ✓
  - Primary (Vibrant Cyan oklch(0.70 0.19 195)): Dark Background (oklch(0.17 0.01 240)) - Ratio 6.8:1 ✓
  - Secondary (Dark Surface oklch(0.25 0.01 240)): Muted Text (oklch(0.65 0.005 240)) - Ratio 4.5:1 ✓
  - Accent (Electric Blue oklch(0.65 0.18 230)): Dark Background (oklch(0.17 0.01 240)) - Ratio 5.9:1 ✓
  - Muted (Gray oklch(0.45 0.005 240)): Light Text (oklch(0.92 0.005 240)) - Ratio 4.6:1 ✓
  - Success (Cyan Green oklch(0.68 0.16 180)): Dark Background (oklch(0.17 0.01 240)) - Ratio 6.2:1 ✓

## Font Selection
Typography should convey technical precision and clarity through sans-serif fonts with excellent legibility on dark backgrounds—Inter for all text elements with weight variations to establish hierarchy.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold / 32px / tight letter spacing (-0.02em) / 1.2 line height
  - H2 (Section Headers): Inter SemiBold / 24px / tight (-0.01em) / 1.3
  - H3 (Card Titles): Inter SemiBold / 18px / normal / 1.4
  - Body (Descriptions): Inter Regular / 15px / normal / 1.5
  - Stats (Data Numbers): Inter Bold / 36px / tight / 1.1 / tabular-nums
  - Labels: Inter Medium / 13px / wide (0.01em) / 1.4 / uppercase
  - Captions: Inter Regular / 12px / normal / 1.4
  - Code/Metrics: Inter Medium / 14px / tabular-nums

## Animations
Animations should be fast, precise, and purposeful—emphasizing efficiency and technical sophistication. Transitions are smooth but quick, hover states are subtle, and interactive feedback is immediate. The balance is professional restraint with purposeful micro-interactions that enhance usability without distraction.

- **Purposeful Meaning**: Quick transitions communicate responsiveness; subtle hover glows indicate interactivity; smooth fades maintain context during state changes; data animations draw attention to changes
- **Hierarchy of Movement**: 
  - Primary: Button hover glows (100ms), data updates with smooth number transitions, chart animations on load
  - Secondary: Navigation transitions with fade, card hover elevations, modal appear/disappear
  - Tertiary: Subtle icon color transitions, input focus states, tooltip delays

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

## AI Integration

### Dual Provider Architecture
The app supports two AI providers with intelligent routing and automatic fallback:

- **Spark LLM (GPT-4o)**: Built-in provider, no configuration needed, excellent for JSON and quick responses
- **Google Gemini 2.5**: Optional provider requiring API key, cost-effective for long context and complex reasoning

### AI Provider Router
- **Functionality**: Unified interface that routes AI requests to optimal provider based on task and user preferences
- **Purpose**: Maximize reliability through automatic fallback while optimizing for cost and performance
- **Features**:
  - Automatic provider selection based on task complexity
  - Seamless fallback if primary provider fails
  - User-configurable preferences (Automatic, Spark, or Gemini)
  - Usage tracking and cost monitoring
  - Support for both text and JSON generation

### Current AI Features
1. **Daily Affirmations** - Generated motivational quotes on app load (Spark LLM)
2. **AI Financial Advisor** - Multi-step interview and personalized budget generation (Can use either provider)
3. **Habit Suggestions** - AI-powered recommendations based on existing habits (Gemini recommended)
4. **Spending Analysis** - Pattern detection and financial insights (Gemini recommended)
5. **Workout Generation** - Custom workout plans based on fitness level and goals (Either provider)

### Settings & Configuration
- **Gemini API Key Management**: Secure storage in Spark KV, owner-only access
- **Connection Testing**: Verify API key validity before use
- **Provider Selection**: Choose default provider or let system auto-route
- **Usage Statistics**: Track requests, tokens, and costs per provider
- **AI Provider Badges**: Visual indicators showing which AI powered each feature

### Implementation Details
- **Location**: `/src/lib/ai/` and `/src/lib/gemini/`
- **Key Files**:
  - `ai/provider.ts` - Main AI router with fallback logic
  - `ai/usage-tracker.ts` - Cost and usage monitoring
  - `gemini/client.ts` - Gemini API wrapper
  - `ai/examples.ts` - Pre-built helper functions
- **Components**: AIBadge for provider indication
- **Module**: Settings page for configuration (owner-only)

### Security Considerations
- API keys stored encrypted in Spark KV store
- Never exposed in client code or logs
- Owner-only access to configuration
- Secure key masking in UI
- Error messages don't leak sensitive info
