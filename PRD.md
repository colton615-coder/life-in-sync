# Habit Tracker PRD

A visual habit tracking application where users set daily goals (like drinking 8 glasses of water) and tap interactive icons throughout the day to mark progress, with celebration animations upon completion to reinforce positive behavior.

**Experience Qualities**:
1. **Satisfying** - Each tap provides immediate visual feedback with icons filling up, creating a dopamine-rewarding experience
2. **Motivating** - Visual progress bars and celebration animations encourage users to complete their daily goals
3. **Simple** - No complex menus or settings—just set a goal, tap throughout the day, and watch progress

**Complexity Level**: Light Application (focused feature set with visual feedback and daily state tracking)
  - Single-purpose habit tracking tool with visual icon-based progress, celebration animations, and daily completion history

## Essential Features

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
- **Functionality**: Calendar view showing which days goals were completed, current streak counter
- **Purpose**: Provide long-term motivation through streak building and visual history
- **Trigger**: User views history tab or sees streak badge on main screen
- **Progression**: User completes daily goal → Completion logged with date → Calendar marks day as complete → Streak counter increments if consecutive → User can view past days
- **Success criteria**: Streak calculates correctly across day boundaries, history persists indefinitely, missed days clearly visible

## Edge Case Handling
- **Empty States**: Show welcoming prompt "Start your first habit!" with animated icon when no habits exist
- **Goal Already Complete**: Show success state when daily goal is reached; icons remain clickable to adjust progress
- **Date Boundaries**: Progress resets at midnight local time; completed days logged to history
- **Multiple Habits**: Support tracking multiple different habits simultaneously with separate progress for each
- **Accidental Taps**: Clicking filled icons adjusts progress backwards to that point, allowing easy corrections
- **Long Streaks**: Special milestone celebrations at 7, 30, 100 days with different animations
- **Data Loss Prevention**: Confirm before deleting habits; show toast with undo option

## Design Direction
The interface should feel playful yet focused, with clean modern aesthetics that emphasize the visual progress indicators. The design should evoke a sense of accomplishment and momentum through vibrant colors, smooth animations, and satisfying micro-interactions. A minimal interface with generous whitespace keeps the focus on the habit icons, while delightful animations reward progress.

## Color Selection
Triadic color scheme with energetic blues and complementary warm accents to create a vibrant, motivating atmosphere that celebrates progress.

- **Primary Color**: Bright Cyan Blue (oklch(0.65 0.20 220)) - Energetic and refreshing, perfect for water/hydration themes and primary actions
- **Secondary Colors**: 
  - Warm Coral (oklch(0.70 0.18 25)) - Supporting color for celebration states and secondary actions
  - Fresh Green (oklch(0.72 0.16 145)) - Success states and completed progress indicators
- **Accent Color**: Electric Purple (oklch(0.62 0.25 295)) - Highlight color for active states, streaks, and milestone celebrations
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.97 0.005 240)): Dark Text (oklch(0.20 0.01 240)) - Ratio 14.8:1 ✓
  - Card (White oklch(1.00 0 0)): Dark Text (oklch(0.20 0.01 240)) - Ratio 16.5:1 ✓
  - Primary (Bright Cyan Blue oklch(0.65 0.20 220)): White (oklch(1.00 0 0)) - Ratio 4.9:1 ✓
  - Secondary (Warm Coral oklch(0.70 0.18 25)): Dark Text (oklch(0.20 0.01 240)) - Ratio 6.5:1 ✓
  - Accent (Electric Purple oklch(0.62 0.25 295)): White (oklch(1.00 0 0)) - Ratio 5.2:1 ✓
  - Success (Fresh Green oklch(0.72 0.16 145)): Dark Text (oklch(0.20 0.01 240)) - Ratio 7.2:1 ✓

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
Animations should create a sense of progress and achievement, with icons that bounce and fill with color when tapped, and celebration animations that feel rewarding without being overwhelming. The balance leans toward delight—every interaction should feel satisfying.

- **Purposeful Meaning**: Icon fill animations communicate progress; bounce effects provide tactile feedback; confetti celebrates achievements; pulse effects draw attention to actionable buttons
- **Hierarchy of Movement**: 
  - Primary: Icon fill animation (scale + color transition), celebration confetti on completion
  - Secondary: Plus button pulse when tappable, card entrance animations, progress bar fills
  - Tertiary: Subtle hover states, streak badge glow, tab transitions

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
