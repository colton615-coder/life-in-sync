# Chart Accessibility Implementation

## Overview
All data visualizations now include accessible alternatives, allowing users to view chart data in both visual and tabular formats. This ensures compliance with WCAG accessibility standards and improves usability for screen reader users.

## AccessibleChart Component

### Location
`@/components/AccessibleChart.tsx`

### Features
- **Data Table Toggle**: Button to switch between chart and table views
- **Smooth Transitions**: AnimatePresence for seamless view switching
- **ARIA Labels**: Proper semantic markup for screen readers
- **Keyboard Accessible**: All controls are keyboard navigable
- **Responsive**: Works on all screen sizes
- **Customizable**: Flexible column configuration and formatting

### Usage

```tsx
import { AccessibleChart } from '@/components/AccessibleChart'

<AccessibleChart
  title="Spending by Category"
  description="View your expenses broken down by category"
  data={categoryData}
  columns={[
    { key: 'name', label: 'Category' },
    { 
      key: 'value', 
      label: 'Amount', 
      format: (val) => `$${Number(val).toFixed(2)}` 
    },
    { 
      key: 'value', 
      label: 'Percentage', 
      format: (val) => `${((Number(val) / total) * 100).toFixed(1)}%` 
    }
  ]}
  ariaLabel="Spending by category chart showing 5 categories"
>
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      {/* Your chart components */}
    </PieChart>
  </ResponsiveContainer>
</AccessibleChart>
```

## Props Interface

```typescript
interface ChartDataRow {
  [key: string]: string | number
}

interface AccessibleChartProps {
  children: ReactNode              // Chart visualization
  data: ChartDataRow[]             // Data to display in table
  title: string                    // Chart/table title
  description?: string             // Optional description
  columns: {
    key: string                    // Data key to display
    label: string                  // Column header
    format?: (value: any) => string  // Optional formatter
  }[]
  className?: string               // Additional styles
  ariaLabel?: string              // Custom ARIA label
}
```

## Accessibility Features

### Screen Reader Support
- **ARIA Labels**: All controls have descriptive labels
- **ARIA Expanded**: Button states communicate table visibility
- **ARIA Controls**: Proper association between button and table
- **Role Attributes**: Semantic roles for regions and images

### Keyboard Navigation
- **Toggle Button**: Space/Enter to show/hide table
- **Table Navigation**: Standard Tab/Shift+Tab through cells
- **Focus Management**: Proper focus indicators on all interactive elements

### Visual Indicators
- **Button Icons**: Eye/EyeSlash icons indicate current state
- **Hover States**: Clear hover feedback on interactive elements
- **Transitions**: Smooth animations don't interfere with accessibility
- **Color Contrast**: All text meets WCAG AA standards

## Implementation Examples

### Finance Module - Spending Breakdown
Located in: `@/components/modules/Finance.tsx`

```tsx
<AccessibleChart
  title="Spending by Category"
  description="View your expenses broken down by category"
  data={categoryData}
  columns={[
    { key: 'name', label: 'Category' },
    { 
      key: 'value', 
      label: 'Amount', 
      format: (val) => `$${Number(val).toFixed(2)}` 
    },
    { 
      key: 'value', 
      label: 'Percentage', 
      format: (val) => `${((Number(val) / totalSpent) * 100).toFixed(1)}%` 
    }
  ]}
  ariaLabel={`Spending by category chart showing ${categoryData.length} categories with total spending of $${totalSpent.toFixed(2)}`}
>
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={categoryData}
        dataKey="value"
        {...}
      />
    </PieChart>
  </ResponsiveContainer>
</AccessibleChart>
```

## When to Use

### ✅ Use AccessibleChart For:
- Pie charts
- Bar charts
- Line graphs
- Area charts  
- Any visualization displaying tabular data

### ❌ Don't Use For:
- Decorative visualizations
- Progress indicators (use accessible alternatives)
- Live-updating charts (consider ARIA live regions instead)
- Extremely large datasets (>100 rows)

## Best Practices

### Data Formatting
```tsx
// ✅ Good - Formatted for readability
columns={[
  { key: 'amount', label: 'Amount', format: (val) => `$${val.toFixed(2)}` },
  { key: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() }
]}

// ❌ Bad - Raw values
columns={[
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date' }
]}
```

### ARIA Labels
```tsx
// ✅ Good - Descriptive and contextual
ariaLabel="Monthly sales chart showing revenue from January to December 2024"

// ❌ Bad - Generic
ariaLabel="Sales chart"
```

### Column Configuration
```tsx
// ✅ Good - Clear, concise headers
columns={[
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount ($)' },
  { key: 'percentage', label: 'Percent (%)' }
]}

// ❌ Bad - Unclear headers
columns={[
  { key: 'category', label: 'Cat' },
  { key: 'amount', label: 'Amt' },
  { key: 'percentage', label: '%' }
]}
```

## Future Enhancements

### Planned Features
- [ ] Export to CSV functionality
- [ ] Sort table columns
- [ ] Filter table data
- [ ] Print-friendly table view
- [ ] Dark mode table styling
- [ ] Sticky table headers for long datasets

### Module Migration Status
- ✅ Finance Module - Spending by Category chart
- ⏳ Dashboard Module - Pending chart additions
- ⏳ Workouts Module - Pending chart additions
- ⏳ Habits Module - Pending analytics charts

## Testing Checklist

When adding AccessibleChart to a new visualization:

- [ ] Table displays all relevant data from chart
- [ ] Toggle button is keyboard accessible
- [ ] Screen reader announces table visibility changes
- [ ] Column formatters display data correctly
- [ ] Table is responsive on mobile devices
- [ ] Empty state shows appropriate message
- [ ] ARIA labels are descriptive and accurate
- [ ] Transitions don't cause layout shifts
- [ ] Works with reduce-motion preferences

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Recharts Documentation](https://recharts.org/)
- [Framer Motion Accessibility](https://www.framer.com/motion/animation/#accessibility)
