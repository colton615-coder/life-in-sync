# Life in Sync - AI Coding Agent Instructions

## Project Overview

**Life in Sync** is a comprehensive personal dashboard built with React + TypeScript + Vite, leveraging GitHub Spark's platform for AI and state management. It integrates 11 modules: Dashboard, Habits, Finance, Tasks, Workouts, Knox AI Coach, Shopping, Calendar, Golf Swing Analyzer, Connections, and Settings.

**Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, Framer Motion, GitHub Spark (AI + KV store), Google Gemini API (optional)

## Critical Architecture Patterns

### 1. GitHub Spark Platform Integration

The app runs on GitHub Spark platform with **global window APIs** - never import these:

```typescript
// ✅ CORRECT - Access directly from window
const [data, setData] = useKV('key', [])
const prompt = window.spark.llmPrompt`Generate ${thing}`
const response = await window.spark.llm(prompt, 'gpt-4o', jsonMode)
const user = await spark.user()

// ❌ WRONG - Never try to import
import { spark } from '@github/spark' // This doesn't exist
```

**Key Spark APIs:**
- `useKV(key, defaultValue)` - Persistent state (like localStorage but better)
- `window.spark.llm(prompt, model, jsonMode)` - AI calls (must use `spark.llmPrompt` template)
- `window.spark.kv.get/set/delete` - Direct KV access
- `spark.user()` - Current user info

**Build Requirements**: Vite plugins are order-sensitive in `vite.config.ts`:
```typescript
plugins: [
  react(),
  tailwindcss(),
  createIconImportProxy(), // Must be before sparkPlugin
  sparkPlugin(),
]
```

### 2. State Management: useKV Pattern

**ALWAYS use functional updates** to avoid stale closures:

```typescript
// ✅ CORRECT
setTodos(current => [...current, newTodo])
setExpenses(current => current.filter(e => e.id !== id))

// ❌ WRONG - Will lose data on concurrent updates
setTodos([...todos, newTodo])
```

**Storage Keys Convention**: `{module}-{datatype}` (e.g., `'habits-list'`, `'financial-profile'`)

### 3. Dual AI Provider System

AI routing with automatic fallback:

```typescript
// Option 1: Direct Spark LLM (always available)
const prompt = window.spark.llmPrompt`Generate ${request}`
const result = await window.spark.llm(prompt, 'gpt-4o', true) // JSON mode

// Option 2: AI Router (with Gemini fallback)
import { ai } from '@/lib/ai/provider'
const response = await ai.generate({
  prompt: 'Your prompt here',
  jsonMode: true,
  provider: 'auto' // or 'spark' or 'gemini'
})
```

**JSON Mode Requirements**: 
- Always request objects, not arrays: `{ items: [...] }` not `[...]`
- Parse response: `JSON.parse(response)` for Spark, `response.text` for AI Router
- Validate structure before using

### 4. Module Architecture

All modules follow this pattern in `src/components/modules/`:

```typescript
export function ModuleName() {
  const [data, setData] = useKV<DataType[]>('module-data', [])
  const [activeTab, setActiveTab] = useState('main')
  
  // Functional updates only
  const handleAction = useCallback(() => {
    setData(current => /* transform current */)
  }, [setData])
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader title="Module" subtitle="Description" />
      {/* Content */}
    </div>
  )
}
```

**Cross-Module Communication**: Use `moduleBridge` from `@/lib/module-bridge` for events between modules.

## Component & Styling Standards

### Card Components

**Primary**: `NeumorphicCard` for all card-based UI
```tsx
import { NeumorphicCard } from '@/components/NeumorphicCard'

<NeumorphicCard hover pressed onClick={handler}>Content</NeumorphicCard>
<NeumorphicCard inset>Input-like appearance</NeumorphicCard>
<NeumorphicCard glow>Glowing border effect</NeumorphicCard>
```

**Avoid**: `@/components/Card` (deprecated) - use NeumorphicCard instead

### Icons

Use Phosphor Icons exclusively:
```tsx
import { Heart, Plus, Trash } from '@phosphor-icons/react'
<Heart size={20} weight="regular" /> // default
<Plus size={24} weight="bold" />     // emphasis
<Trash size={16} weight="fill" />    // active state
```

### Accessible Charts

Wrap all data visualizations:
```tsx
import { AccessibleChart } from '@/components/AccessibleChart'

<AccessibleChart
  title="Chart Title"
  data={data}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'amount', label: 'Amount', format: (v) => `$${v}` }
  ]}
  ariaLabel="Descriptive context for screen readers"
>
  <ResponsiveContainer>{/* Chart */}</ResponsiveContainer>
</AccessibleChart>
```

### Styling with Tailwind 4

```tsx
// ✅ Use semantic color variables
className="bg-background text-foreground border-border"
className="bg-primary text-primary-foreground"

// ✅ 8px spacing scale
className="p-4 gap-3 space-y-6"

// ✅ Responsive design
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

**Theme Support**: App supports light/dark/system themes via `ThemeProvider` - always test both modes.

## Error Handling Pattern

**All AI calls and async operations must follow this pattern:**

```typescript
try {
  // 1. Validate input
  if (!window.spark.llm) {
    throw new Error('Spark LLM not available')
  }
  
  // 2. Make request
  const prompt = window.spark.llmPrompt`Request ${data}`
  const response = await window.spark.llm(prompt, 'gpt-4o', true)
  
  // 3. Validate response
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid AI response')
  }
  
  // 4. Parse JSON
  let parsed
  try {
    parsed = JSON.parse(response)
  } catch (e) {
    console.error('JSON parse error:', response)
    throw new Error('AI returned invalid JSON')
  }
  
  // 5. Validate structure
  if (!parsed.requiredField) {
    throw new Error('Missing required data in response')
  }
  
  // 6. Use with fallbacks
  const result = {
    field: parsed.field || 'default value'
  }
  
  toast.success('Success message')
} catch (error) {
  console.error('Operation failed:', error)
  const message = error instanceof Error ? error.message : 'Operation failed'
  toast.error('User-friendly title', {
    description: message
  })
}
```

**Error Boundaries**: Every module wrapped in `<ErrorBoundary>` in `App.tsx` - don't remove these.

## Development Workflows

### Running the App

```bash
npm run dev          # Start dev server (port 5000)
npm run build        # TypeScript + Vite build (use --noCheck to skip TS)
npm run preview      # Preview production build
npm run lint         # ESLint
npm run kill         # Kill process on port 5000 (fuser -k)
```

### Adding New Features

1. **New Module**: Create in `src/components/modules/`, add route to `App.tsx`, update `Module` type in `src/lib/types.ts`
2. **New Data Type**: Add interface to `src/lib/types.ts`, use `useKV` with typed state
3. **AI Feature**: Use `ai.generate()` with validation pattern above, add AIBadge to show provider
4. **Completion Tracking**: Use `src/lib/completion-tracker.ts` utilities for consistent stats

### Path Aliases

```typescript
import { Thing } from '@/components/Thing'  // @ = src/
import { type Type } from '@/lib/types'
import { utility } from '@/lib/utils'
```

## Common Pitfalls

1. **Stale Closures**: Always use functional updates with `useKV`: `setState(current => ...)`
2. **AI JSON Arrays**: Request `{ items: [] }` not bare arrays
3. **Spark APIs**: Never import `spark` - it's on `window` globally
4. **Card Components**: Use `NeumorphicCard`, not deprecated `Card`
5. **Theme Colors**: Use CSS variables (`bg-background`), not hardcoded colors
6. **Error Messages**: Provide user-friendly descriptions with toast, log technical details to console
7. **Animation on NeumorphicCard**: Set `animate={false}` when nested in `motion.div`

## Key Files Reference

- **Types**: `src/lib/types.ts` - All TypeScript interfaces
- **AI Router**: `src/lib/ai/provider.ts` - Dual provider logic
- **Completion System**: `src/lib/completion-tracker.ts` - Stats utilities
- **Module Bridge**: `src/lib/module-bridge.ts` - Cross-module events
- **Gemini Client**: `src/lib/gemini/client.ts` - Google AI integration
- **Theme Config**: `src/styles/theme.css` - Radix colors + CSS variables
- **Component Lib**: `src/components/ui/*` - shadcn/ui components

## Testing & Debugging

- **AI Issues**: Check console for detailed logs, response text, and validation failures
- **State Issues**: Use React DevTools, check KV store in browser console: `spark.kv.get('key')`
- **Theme Issues**: Toggle theme in Settings, inspect CSS variables in DevTools
- **Module Errors**: ErrorBoundary logs to console with stack traces

## Documentation

Extensive docs in root:
- `PRD.md` - Product requirements and design system
- `DEVELOPER_GUIDE.md` - Quick reference patterns
- `GEMINI_INTEGRATION_PLAN.md` - AI provider setup
- `COMPONENT_CONSOLIDATION.md` - Card migration guide
- `COMPLETION_SYSTEM.md` - Completion tracking details

---

**When in doubt**: Follow existing module patterns, use functional updates, validate AI responses, handle errors gracefully, and test in both light and dark themes.
