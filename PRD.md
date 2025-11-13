# LiFE-iN-SYNC PRD

A comprehensive life management platform that combines habit tracking, finance management, task organization, AI coaching, and wellness tools in a unified, intelligent dashboard with a distinctive neumorphic dark aesthetic.

**Experience Qualities**:
1. **Empowering** - Users feel in control of every aspect of their life with centralized command and real-time insights
2. **Intelligent** - AI-powered coaching provides personalized guidance and proactive suggestions without being intrusive
3. **Cohesive** - Despite multiple complex features, the interface feels unified through consistent neumorphic design language and smooth transitions

**Complexity Level**: Complex Application (advanced functionality, multiple interconnected features, AI integration, persistent user data)
  - This is a full-featured life management system with 8+ distinct modules, AI coaching across multiple domains, real-time data visualization, and sophisticated state management

## Essential Features

### Dashboard Hub
- **Functionality**: Central command center displaying aggregated metrics from all modules (habit streaks, budget status, task completion, workout progress)
- **Purpose**: Provides at-a-glance life overview and quick access to all features
- **Trigger**: Default landing view on app load
- **Progression**: App loads → Dashboard displays with animated metric cards → User scans quick stats → Clicks module card or quick action → Navigate to detailed view
- **Success criteria**: All module stats update in real-time, navigation is instant, animations complete within 300ms

### Habit Tracker
- **Functionality**: Flexible habit tracking with three tracking types: simple check-off (boolean), numerical targets (pages, reps, cups, etc.), and time-based goals (minutes). Includes streak tracking and target progress visualization
- **Purpose**: Build consistency through visual progress tracking with flexible measurement methods that match the behavior type
- **Trigger**: User clicks "Habits" from dashboard or adds new habit
- **Progression**: Create habit with tracking type → Set target (if numerical/time) → Daily: Log progress via input dialog or simple check-off → View streak counter and progress toward target → Celebrate milestone streaks (7, 30, 100 days)
- **Success criteria**: Streaks calculate accurately based on target achievement, different tracking types display appropriate input methods, progress shows current vs. target values

### Finance Manager
- **Functionality**: Budget creation, expense logging with categories, visual spending breakdown via charts, AI financial coaching
- **Purpose**: Maintain financial awareness and receive guidance on spending patterns
- **Trigger**: Add expense button, view budget dashboard, request AI advice
- **Progression**: Create budget categories → Log expenses with amount/category → View Recharts visualization → Request AI analysis → Receive actionable financial advice
- **Success criteria**: Charts render instantly, calculations are accurate, AI provides specific savings strategies

### Task Manager
- **Functionality**: To-do list with priority levels (high/medium/low), completion tracking, haptic feedback on interactions
- **Purpose**: Organize daily responsibilities with clear prioritization
- **Trigger**: Add task button, click task to complete/edit
- **Progression**: Create task with priority → Task appears in sorted list → Click to complete (haptic feedback) → Task moves to completed section
- **Success criteria**: Tasks sort by priority automatically, haptic feedback fires within 50ms, completed tasks are visually distinct

### AI Knox (Therapeutic Chatbot)
- **Functionality**: Conversational AI with tough-love coaching persona, private journal entry storage
- **Purpose**: Provide mental wellness support through direct, honest guidance
- **Trigger**: Open Knox chat interface or create journal entry
- **Progression**: User types concern/question → AI Knox responds with empathetic but direct advice → User can save as journal entry → Entries stored privately
- **Success criteria**: Responses feel conversational and consistent with persona, journal entries persist securely

### Workout System
- **Functionality**: AI-generated custom workout routines, active workout timer with exercise tracking, personal record (PR) logging
- **Purpose**: Enable structured fitness progression with intelligent routine generation
- **Trigger**: Request new workout routine, start workout session, log PR
- **Progression**: Request workout type → AI generates routine → Start session → Timer displays current exercise → Complete set → Log weights/reps → Save PR
- **Success criteria**: Workouts are varied and appropriate for fitness level, timer is accurate, PRs are tracked over time

### Shopping List
- **Functionality**: Simple list management with add/remove/check-off items
- **Purpose**: Quick grocery and shopping organization
- **Trigger**: Add item button
- **Progression**: Add item → Item appears in list → Check off when purchased → Remove completed items
- **Success criteria**: List persists across sessions, operations are instant

### Calendar
- **Functionality**: Event creation with date/time, visual monthly view
- **Purpose**: Track important dates and scheduled activities
- **Trigger**: Add event or navigate months
- **Progression**: View current month → Click date → Add event details → Event appears on calendar → Navigate months to view upcoming
- **Success criteria**: Events display on correct dates, month navigation is smooth

### Secure Vault
- **Functionality**: Encrypted storage for sensitive information (passwords, notes, documents)
- **Purpose**: Centralized secure storage for confidential data
- **Trigger**: Add vault entry with title and content
- **Progression**: Create entry → Content stored → View entry requires interaction → Edit or delete as needed
- **Success criteria**: All data persists securely, entries are clearly organized

## Edge Case Handling
- **Empty States**: Each module displays helpful onboarding prompts when no data exists (e.g., "Start your first habit" with visual icon)
- **AI Unavailable**: Show cached suggestions or encouraging static messages if AI fails to respond
- **Long Streaks**: Celebrate milestone streaks (7, 30, 100 days) with special animations
- **Budget Overspending**: Visual warning indicators when expenses exceed budget categories
- **Concurrent Workouts**: Prevent starting multiple workout sessions simultaneously
- **Date Boundaries**: Habits reset daily at midnight, weekly AI reviews trigger on Sundays
- **Data Loss Prevention**: Confirm before deleting items with undo option via toast notifications

## Design Direction
The interface should evoke a sense of modern sophistication and clarity through a clean, elevated design system with refined glassmorphic elements and subtle depth. The design should feel premium and effortless—like a high-end iOS/macOS app with beautiful transitions, smooth animations, and purposeful interactions. A minimal approach with generous whitespace and clear visual hierarchy serves the complexity best, using subtle shadows and smooth surfaces to create depth without distraction.

## Color Selection
Modern light theme with vibrant blue accents and subtle gradients for a fresh, sophisticated aesthetic inspired by modern productivity apps.

- **Primary Color**: Vibrant Blue (oklch(0.55 0.22 250)) - Communicates trust, clarity, and action; used for primary actions and key interactions
- **Secondary Colors**: 
  - Clean Background (oklch(0.98 0.002 270)) - Main background with subtle warm tint
  - Elevated Surface (oklch(1.00 0 0)) - Cards and elevated elements (pure white)
  - Soft Blue (oklch(0.75 0.12 250)) - Secondary actions and subtle accents
- **Accent Color**: Electric Blue (oklch(0.60 0.25 245)) - Highlights active states, CTAs, and interactive elements
- **Foreground/Background Pairings**:
  - Background (Clean Background oklch(0.98 0.002 270)): Dark Text (oklch(0.15 0.01 270)) - Ratio 16.2:1 ✓
  - Card (White oklch(1.00 0 0)): Dark Text (oklch(0.15 0.01 270)) - Ratio 18.5:1 ✓
  - Primary (Vibrant Blue oklch(0.55 0.22 250)): White (oklch(1.00 0 0)) - Ratio 5.8:1 ✓
  - Secondary (Soft Blue oklch(0.75 0.12 250)): Dark Text (oklch(0.25 0.02 270)) - Ratio 6.2:1 ✓
  - Accent (Electric Blue oklch(0.60 0.25 245)): White (oklch(1.00 0 0)) - Ratio 5.5:1 ✓
  - Muted (oklch(0.92 0.005 270)): Medium Text (oklch(0.45 0.01 270)) - Ratio 6.8:1 ✓

## Font Selection
Typography should convey modern professionalism with a warm, friendly character through the Inter font family with refined spacing and clear hierarchy.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold / 36px / -0.02em letter spacing / 1.2 line height
  - H2 (Module Headers): Inter SemiBold / 28px / -0.01em / 1.3
  - H3 (Section Headers): Inter SemiBold / 20px / normal / 1.4
  - Body (Primary Content): Inter Regular / 15px / normal / 1.6
  - Body Small (Descriptions): Inter Regular / 14px / normal / 1.5
  - Captions (Labels, Metadata): Inter Medium / 13px / normal / 1.4
  - Numbers (Stats, Metrics): Inter SemiBold / varies / tabular-nums

## Animations
Animations should enhance the neumorphic depth illusion through subtle shadow shifts and elevation changes, creating a tactile, responsive feel. Motion should be purposeful—celebrating achievements, guiding attention to AI insights, and providing satisfying haptic-style feedback for interactions. The balance leans toward functional with moments of delight during milestones.

- **Purposeful Meaning**: Neumorphic depth shifts communicate interactivity; AI response typing effect adds personality; streak celebration confetti rewards consistency
- **Hierarchy of Movement**: 
  - Primary: Button press inset effect, card hover elevation increase, AI response typing
  - Secondary: Metric counter animations, chart entrance transitions, page navigation slides
  - Tertiary: Ambient background gradient shifts, subtle pulse on active timers

## Component Selection

- **Components**:
  - **Card**: Primary container for all modules with neumorphic shadow customization (inset shadows for pressed state, elevated for hover)
  - **Button**: Primary actions with neumorphic pressed effect, variants for priority levels
  - **Dialog**: AI Knox chat interface, add/edit forms for all modules
  - **Tabs**: Navigation within complex modules (Finance categories, Workout history)
  - **Progress**: Habit completion percentages, budget usage bars
  - **Calendar**: Date picker for events and historical data views
  - **Switch/Checkbox**: Habit completion toggles, task checkoffs with haptic feedback
  - **Input/Textarea**: Data entry across all modules, Knox chat input
  - **Select**: Category selection (expenses, workout types)
  - **Sheet**: Mobile drawer for module navigation
  - **Badge**: Priority indicators, streak counters, status labels
  - **Separator**: Visual dividers maintaining neumorphic aesthetic
  - **ScrollArea**: Long lists of tasks, habits, expenses
  - **Tooltip**: Contextual help for advanced features

- **Customizations**:
  - **Neumorphic Card Component**: Custom card variant with dual box-shadow (light + dark) and pressed state with inset shadow
  - **Stat Metric Component**: Animated counter with large typography and icon
  - **AI Response Bubble**: Chat-style component with typing indicator and distinctive Knox styling
  - **Workout Timer Card**: Specialized component with large timer display and control buttons
  - **Streak Badge**: Visual indicator with flame icon and celebration animation at milestones

- **States**:
  - **Buttons**: Default (elevated neumorphic), Hover (increased elevation), Active (inset shadow pressed effect), Disabled (reduced contrast)
  - **Inputs**: Default (subtle inset), Focus (purple ring glow), Error (red tint with icon), Success (subtle green glow)
  - **Cards**: Rest (base neumorphic), Hover (elevated with subtle glow), Active/Selected (inset with accent border)

- **Icon Selection**:
  - Dashboard: House
  - Habits: CheckCircle / Target
  - Finance: CurrencyDollar / ChartBar
  - Tasks: ListChecks
  - Knox: BrainCircuit / ChatCircle
  - Workouts: Barbell / Timer
  - Shopping: ShoppingCart / ListBullets
  - Calendar: Calendar / CalendarDots
  - Vault: Lock / ShieldCheck
  - Add Actions: Plus / PlusCircle
  - Priority: ArrowUp (high) / ArrowRight (medium) / ArrowDown (low)
  - Streaks: Fire / Flame
  - Success: CheckCircle
  - AI Generating: Sparkle / Pulse

- **Spacing**: Consistent 4-based scale (4px, 8px, 16px, 24px, 32px, 48px) with cards using p-6, lists using gap-4, sections using gap-8, page margins using px-4 md:px-8

- **Mobile**: 
  - Bottom navigation bar for primary modules on mobile (<768px)
  - Sheet component for auxiliary navigation and settings
  - Stacked layouts for dashboard metrics (grid on desktop)
  - Full-screen dialogs on mobile for add/edit forms
  - Larger touch targets (min 44x44px) for all interactive elements
  - Simplified charts on mobile with horizontal scroll for detailed data
