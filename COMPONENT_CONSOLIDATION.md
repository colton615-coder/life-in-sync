# Component Library Consolidation

## Overview
This document outlines the consolidation of duplicate components into a single source of truth, standardizing styles and improving maintainability.

## Card Component Consolidation

### Before
The codebase had **three different Card implementations**:
1. `@/components/Card.tsx` - Simple wrapper with basic styling
2. `@/components/NeumorphicCard.tsx` - Full-featured neumorphic card with animations and variants
3. `@/components/ui/card.tsx` - shadcn Card component with header/footer subcomponents

### After
**Single Source of Truth: `NeumorphicCard`**

The `NeumorphicCard` component is now the standard card component used across the application, with these features:
- Neumorphic styling with dual-shadow depth effects
- Optional hover animations
- Pressed state support
- Inset variant for input-like appearance
- Glow border effect
- Motion animations (can be disabled with `animate={false}`)
- Consistent with the app's design language

### Migration Guide

**Old Pattern (Card.tsx):**
```tsx
import { Card } from '@/components/Card'

<Card className="glass-card">
  Content
</Card>
```

**New Pattern (NeumorphicCard):**
```tsx
import { NeumorphicCard } from '@/components/NeumorphicCard'

<NeumorphicCard animate={false}>
  Content
</NeumorphicCard>
```

**For static cards (no animation):**
```tsx
<NeumorphicCard animate={false} className="border-primary/20">
  Content
</NeumorphicCard>
```

**For interactive cards:**
```tsx
<NeumorphicCard hover pressed onClick={handleClick}>
  Content
</NeumorphicCard>
```

### shadcn Card Component
The `@/components/ui/card.tsx` remains available for specific use cases requiring structured headers/footers:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

## Updated Components

The following components have been updated to use `NeumorphicCard`:
- ✅ `Finance.tsx` - All card instances migrated
- ✅ `StatsCard.tsx` - Wrapper component updated
- ✅ `DashboardWidget.tsx` - Already using NeumorphicCard

## Benefits

1. **Consistency**: Single component ensures uniform appearance
2. **Maintainability**: Changes to card styling happen in one place
3. **Performance**: Reduced bundle size by eliminating duplicate code
4. **Type Safety**: Better TypeScript support with well-defined props
5. **Flexibility**: More options (hover, pressed, inset, glow) without multiple components

## Props Reference

### NeumorphicCard Props
```typescript
interface NeumorphicCardProps {
  children: ReactNode
  className?: string
  hover?: boolean        // Enable hover lift effect
  pressed?: boolean      // Enable press/tap effect
  inset?: boolean        // Inset appearance (like an input)
  glow?: boolean         // Add glow border on hover
  onClick?: () => void   // Click handler
  animate?: boolean      // Enable motion animations (default: true)
}
```

## Removal Status

- ❌ `@/components/Card.tsx` - **DEPRECATED** (can be removed after verifying no imports remain)
- ✅ `@/components/NeumorphicCard.tsx` - **PRIMARY CARD COMPONENT**
- ✅ `@/components/ui/card.tsx` - **KEPT** for specific shadcn patterns

## Next Steps

1. Search codebase for remaining `import { Card } from '@/components/Card'` imports
2. Migrate any remaining usages to `NeumorphicCard`
3. Remove `@/components/Card.tsx` once all migrations are complete
4. Update any documentation referencing the old Card component
