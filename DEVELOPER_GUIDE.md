# Developer Quick Reference Guide

## Component Usage Standards

### Cards

**✅ Use NeumorphicCard (Primary)**
```tsx
import { NeumorphicCard } from '@/components/NeumorphicCard'

// Static card (no animation)
<NeumorphicCard animate={false}>
  Content here
</NeumorphicCard>

// Interactive card
<NeumorphicCard hover pressed onClick={handleClick}>
  Content here
</NeumorphicCard>

// Variants
<NeumorphicCard inset>Input-like card</NeumorphicCard>
<NeumorphicCard glow hover>Glowing hover effect</NeumorphicCard>
```

**⚠️ Use ui/card (Special Cases Only)**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Only when you need structured header/footer
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**❌ Don't Use**
```tsx
import { Card } from '@/components/Card'  // DEPRECATED
```

### Charts & Data Visualization

**✅ Always Use AccessibleChart Wrapper**
```tsx
import { AccessibleChart } from '@/components/AccessibleChart'

<AccessibleChart
  title="Your Chart Title"
  description="Optional description"
  data={yourData}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value', format: (v) => `$${v.toFixed(2)}` }
  ]}
  ariaLabel="Descriptive label for screen readers"
>
  <ResponsiveContainer width="100%" height={200}>
    <YourChart>
      {/* Chart components */}
    </YourChart>
  </ResponsiveContainer>
</AccessibleChart>
```

**Key Points:**
- Always provide `title` and meaningful `columns`
- Use `format` function for readable data (currency, dates, percentages)
- Provide descriptive `ariaLabel` with context
- Data should be an array of objects with consistent keys

### Icons

**✅ Use Phosphor Icons**
```tsx
import { Heart, Plus, Trash } from '@phosphor-icons/react'

<Heart size={20} weight="regular" />
<Plus size={24} weight="bold" />
<Trash size={16} weight="fill" />
```

**Weight Guidelines:**
- `regular` - Default for most cases
- `bold` - Emphasis or buttons
- `fill` - Active/selected states
- `duotone` - Decorative/large icons

### Buttons

**✅ Use shadcn Button**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Plus /></Button>
```

### State Management

**✅ Persistent Data (useKV)**
```tsx
import { useKV } from '@github/spark/hooks'

// Data that survives page refresh
const [todos, setTodos] = useKV('todos', [])

// Always use functional updates
setTodos(current => [...current, newItem])  // ✅ CORRECT
setTodos([...todos, newItem])               // ❌ WRONG (stale closure)
```

**✅ Temporary State (useState)**
```tsx
import { useState } from 'react'

// UI state that doesn't need to persist
const [isOpen, setIsOpen] = useState(false)
const [inputValue, setInputValue] = useState('')
```

### AI Integration

**✅ Use spark.llm for AI Calls**
```tsx
// Creating prompts (REQUIRED)
const prompt = spark.llmPrompt`Generate a ${type} based on ${data}`

// Calling AI
const text = await spark.llm(prompt)                 // Text response
const json = await spark.llm(prompt, 'gpt-4o', true) // JSON response
```

**Important:**
- ALWAYS use `spark.llmPrompt` template literal
- JSON mode returns stringified JSON (must parse)
- Request arrays as object properties: `{ items: [...] }`

### Styling

**✅ Use Tailwind Classes**
```tsx
// Spacing (8px scale)
className="p-4 gap-3 space-y-2"

// Colors (use CSS variables)
className="bg-primary text-primary-foreground"
className="bg-card text-card-foreground"
className="border-border"

// Responsive
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"

// Neumorphic effects (use classes)
className="neumorphic-card"      // Raised card
className="neumorphic-inset"     // Inset/pressed
className="glow-border"          // Glow on hover
className="button-glow"          // Glowing button
```

### Animations

**✅ Use Framer Motion Sparingly**
```tsx
import { motion } from 'framer-motion'

// Simple animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Hover effects
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  Click me
</motion.button>
```

**⚠️ Remember:**
- Use `animate={false}` on NeumorphicCard when nested in motion.div
- Respect `prefers-reduced-motion`
- Keep durations under 500ms

### Toast Notifications

**✅ Use Sonner**
```tsx
import { toast } from 'sonner'

toast.success('Action completed!')
toast.error('Something went wrong')
toast.info('Helpful information')
toast.warning('Be careful')

// With description
toast.success('Saved!', {
  description: 'Your changes have been saved successfully'
})
```

### Forms

**✅ Use shadcn Form Components**
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

<div className="space-y-2">
  <Label htmlFor="input-id">Label</Label>
  <Input
    id="input-id"
    type="text"
    placeholder="Placeholder"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>
```

**Important:**
- Always provide `id` on inputs
- Always provide matching `htmlFor` on labels
- Use descriptive placeholders

### Accessibility Checklist

When creating new components:

- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on custom controls
- [ ] Semantic HTML elements
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Labels on form inputs
- [ ] Screen reader tested

### Performance Tips

**✅ Do:**
- Use functional updates with useKV
- Memoize expensive calculations
- Lazy load heavy components
- Optimize images
- Use CSS for animations when possible

**❌ Don't:**
- Store large objects in state unnecessarily
- Re-render entire lists on single item change
- Use inline function props in loops
- Animate on every render
- Load unused libraries

### Common Patterns

**Modal Dialog**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Tabs**
```tsx
import { TabGroup } from '@/components/TabGroup'

<TabGroup
  tabs={[
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2', icon: <Icon /> }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

**Stats Display**
```tsx
import { StatCard } from '@/components/StatCard'

<StatCard
  stats={[
    { value: '$1,234', label: 'Revenue', gradient: 'from-primary to-primary/70' },
    { value: 42, label: 'Users' },
    { value: '95%', label: 'Satisfaction' }
  ]}
/>
```

## Quick Troubleshooting

### TypeScript Errors
- Check imports are from correct paths
- Verify prop names match interface
- Use functional updates with useKV
- Parse JSON responses from spark.llm

### Styling Issues
- Use Tailwind classes, not inline styles
- Check responsive breakpoints (md:, lg:)
- Verify CSS variable names (--primary not --color-primary in Tailwind)
- Check if component needs `animate={false}`

### Performance Issues
- Profile with React DevTools
- Check for unnecessary re-renders
- Memoize expensive calculations
- Lazy load heavy components

## Resources

- [PRD.md](./PRD.md) - Product requirements
- [COMPONENT_CONSOLIDATION.md](./COMPONENT_CONSOLIDATION.md) - Card migration
- [CHART_ACCESSIBILITY.md](./CHART_ACCESSIBILITY.md) - Accessible charts
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Phosphor Icons](https://phosphoricons.com/)
- [Framer Motion](https://www.framer.com/motion/)
