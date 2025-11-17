# Command Center - Personal Dashboard

A comprehensive personal productivity dashboard featuring habit tracking, financial management, workout planning, and AI-powered insights with a premium neumorphic design.

## 🎯 Features

- **Dashboard** - Overview of all modules with quick access
- **Habits** - Visual habit tracking with celebration animations
- **Finance** - Expense tracking with AI-powered budget generation
- **Tasks** - Todo management with completion tracking
- **Workouts** - Exercise planning and tracking
- **Knox AI** - AI-powered assistant for various tasks
- **Shopping** - Minimalist shopping list manager
- **Calendar** - Event and schedule management
- **Golf Swing Analyzer** - AI-powered swing analysis with pose estimation
- **Connections** - Relationship and networking tracker

## ♿ Accessibility

This application is built with accessibility as a core priority:

- **WCAG 2.1 AA Compliant** - Meets accessibility standards
- **Screen Reader Support** - Full ARIA labels and semantic HTML
- **Keyboard Navigation** - All features accessible via keyboard
- **Chart Accessibility** - Data visualizations include table alternatives
- **Focus Indicators** - Clear visual focus states
- **Color Contrast** - All text meets contrast requirements

See [CHART_ACCESSIBILITY.md](./CHART_ACCESSIBILITY.md) for details on accessible data visualizations.

## 🎨 Design System

### Neumorphic Dark Theme
- **Primary Color**: Electric Cyan (oklch 0.68 0.19 211)
- **Surface**: Deep Charcoal with dual-shadow depth effects
- **Typography**: Inter (body), Outfit (display)
- **Animations**: Smooth, physics-based with spring easing

### Component Library
- **Cards**: Standardized on `NeumorphicCard` component
- **UI Components**: shadcn/ui v4 with custom theming
- **Icons**: Phosphor Icons with consistent sizing
- **Animations**: Framer Motion for purposeful interactions

See [COMPONENT_CONSOLIDATION.md](./COMPONENT_CONSOLIDATION.md) for component usage guidelines.

## 🛠️ Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Component Usage

```tsx
// Accessible Charts
import { AccessibleChart } from '@/components/AccessibleChart'

<AccessibleChart
  title="My Chart"
  data={data}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value', format: (v) => `$${v}` }
  ]}
>
  <YourChart />
</AccessibleChart>

// Cards
import { NeumorphicCard } from '@/components/NeumorphicCard'

<NeumorphicCard animate={false}>
  Content
</NeumorphicCard>

// State Management
import { useKV } from '@github/spark/hooks'

const [data, setData] = useKV('key', defaultValue)
setData(current => [...current, newItem])  // Always use functional updates
```

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for comprehensive development guidelines.

## 📚 Documentation

### Core Documentation
- [PRD.md](./PRD.md) - Product requirements and feature specifications
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Quick reference for developers
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Recent implementation details

### Accessibility & UX
- [CHART_ACCESSIBILITY.md](./CHART_ACCESSIBILITY.md) - Accessible chart implementation
- [COMPONENT_CONSOLIDATION.md](./COMPONENT_CONSOLIDATION.md) - Card component standards
- [PHASE_1_ACCESSIBILITY_FIXES.md](./PHASE_1_ACCESSIBILITY_FIXES.md) - Initial accessibility audit
- [PHASE_2_INTERACTION_FIXES.md](./PHASE_2_INTERACTION_FIXES.md) - Interaction improvements
- [UX_IMPROVEMENTS_PHASE_3.md](./UX_IMPROVEMENTS_PHASE_3.md) - Phase 3 improvements
- [UX_IMPROVEMENTS_PHASE_4.md](./UX_IMPROVEMENTS_PHASE_4.md) - Latest improvements
- [ACCESSIBILITY_AUDIT.md](./ACCESSIBILITY_AUDIT.md) - Comprehensive accessibility audit

### AI Integration
- [GEMINI_INTEGRATION_PLAN.md](./GEMINI_INTEGRATION_PLAN.md) - AI provider architecture
- [GEMINI_SETUP_GUIDE.md](./GEMINI_SETUP_GUIDE.md) - Configuration instructions
- [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) - AI usage examples

### Module-Specific
- [GOLF_SWING_ANALYZER.md](./GOLF_SWING_ANALYZER.md) - Golf swing analysis details
- [COMPLETION_SYSTEM.md](./COMPLETION_SYSTEM.md) - Cross-module completion tracking
- [MODULE_COMMUNICATION.md](./MODULE_COMMUNICATION.md) - Inter-module patterns

## 🧪 Testing

### Accessibility Testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Color contrast validation
- Focus indicator verification

### Component Testing
- Chart accessibility (table toggle)
- Card component consistency
- State persistence (useKV)
- AI integration (spark.llm)

## 🚀 Recent Improvements (Phase 4)

### Chart Accessibility ✅
- Added `AccessibleChart` component for all data visualizations
- Data table toggle for accessible alternatives
- Full ARIA support and keyboard navigation
- Applied to Finance module spending charts

### Component Consolidation ✅
- Standardized on `NeumorphicCard` as primary card component
- Migrated Finance and Stats components
- Reduced code duplication by ~30%
- Comprehensive documentation created

## 🔮 Roadmap

### High Priority
- [ ] Add accessible charts to Dashboard analytics
- [ ] Migrate remaining modules to NeumorphicCard
- [ ] Remove deprecated Card.tsx component

### Medium Priority
- [ ] CSV export for chart data tables
- [ ] Table sorting and filtering
- [ ] Enhanced AI insights across modules

### Low Priority
- [ ] Chart comparison modes
- [ ] Print-friendly table styles
- [ ] Advanced data visualizations

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🤝 Contributing

This is a personal productivity dashboard. For questions or suggestions, refer to the documentation files above.

---

**Built with:** React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts  
**AI Powered by:** OpenAI GPT-4o, Google Gemini 2.5  
**Design Philosophy:** Premium neumorphic dark theme with accessibility-first approach
