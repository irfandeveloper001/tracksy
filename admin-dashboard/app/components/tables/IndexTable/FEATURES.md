# IndexTable Features Showcase

## 🎨 Visual Components

### 1. IndexFilters Bar
```
┌─────────────────────────────────────────────────────────────────┐
│ [All] [Unpaid] [Open] [Closed] [+ Create view]                  │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 [Search...........................] [Filters 2] [Sort ▼] [Save]│
│                                                                  │
│ Filters: [Customer enabled ×] [Money spent: $100-$500 ×] Clear  │
├─────────────────────────────────────────────────────────────────┤
│ Filter Panel (when expanded):                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│ │ Status      │ │ Tagged with │ │ Money Spent │               │
│ │ ☑ Enabled   │ │ [_________] │ │ $0 ═══●═══ $2000 │       │
│ │ ☐ Invited   │ │             │ │             │               │
│ └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 2. IndexTable
```
┌──────────────────────────────────────────────────────────────────┐
│ 2 orders selected                              [Clear selection] │
├──┬──────────┬───────────────┬─────────────┬─────────────────────┤
│☑ │ Order    │ Date          │ Customer    │ Payment │ Status    │
├──┼──────────┼───────────────┼─────────────┼─────────┼──────────┤
│☑ │ #1020    │ Jul 20 4:34pm │ J. Stanton  │ [Paid]  │[Unfulfilled]│
│☐ │ #1019    │ Jul 20 3:46pm │ R. Westerfelt│[Partial]│[Unfulfilled]│
│☑ │ #1018    │ Jul 20 3:44pm │ L. Carder   │ [Paid]  │[Unfulfilled]│
└──┴──────────┴───────────────┴─────────────┴─────────┴──────────┘
   [1] [2] [3] ... [10]  →  (Pagination - to be added)
```

### 3. Badges
```
✅ Complete/Success    → Green badge     [Paid]
⚠️  Partial/Warning   → Yellow badge    [Partially paid]
⭕ Incomplete/Pending  → Gray badge      [Unfulfilled]
❌ Critical/Error      → Red badge       [Failed]
ℹ️  Info              → Blue badge      [Processing]
🔶 Attention          → Orange badge    [Review needed]
```

---

## 🎯 Feature Breakdown

### Search
- **Type:** Full-text search
- **Features:** 
  - Real-time filtering
  - Clear button (X)
  - Placeholder customization
- **UX:** Instant feedback, smooth interaction

### Filters
- **Types Available:**
  1. ChoiceList (multi-select checkboxes)
  2. RangeSlider (dual-handle numeric range)
  3. Text Input (tag/keyword search)
  4. Custom (build your own)

- **Features:**
  - Collapsible filter panel
  - Applied filters display with badges
  - Individual filter removal
  - "Clear all" functionality
  - Filter count indicator

### Sorting
- **Features:**
  - Multiple sort fields
  - Ascending/Descending
  - Custom direction labels (A-Z, Z-A, Oldest first, etc.)
  - Dropdown menu
  - Current sort indicator

### Tabs/Views
- **Features:**
  - Multiple saved views
  - Default "All" view (locked)
  - Create new views
  - Rename views
  - Duplicate views
  - Delete views
  - Tab actions dropdown
  - Active tab indicator

### Selection
- **Features:**
  - Checkbox for each row
  - "Select all" checkbox
  - Indeterminate state (some selected)
  - Selection count display
  - Clear selection button
  - Selected rows highlighting
  - Bulk action support

### Table Display
- **Features:**
  - Sortable columns
  - Column alignment (start/center/end)
  - Row hover effect
  - Selected row highlighting
  - Condensed mode for mobile
  - Loading state
  - Empty state
  - Smooth transitions

---

## 🎨 Design Tokens

### Colors
```css
/* Primary */
--primary: #2563eb;        /* blue-600 */
--primary-hover: #1d4ed8;  /* blue-700 */
--primary-light: #eff6ff;  /* blue-50 */

/* Success */
--success: #16a34a;        /* green-600 */
--success-light: #f0fdf4;  /* green-50 */

/* Warning */
--warning: #ca8a04;        /* yellow-600 */
--warning-light: #fefce8;  /* yellow-50 */

/* Error */
--error: #dc2626;          /* red-600 */
--error-light: #fef2f2;    /* red-50 */

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-900: #111827;
```

### Typography
```css
/* Headings */
--text-2xl: 1.5rem;    /* Page titles */
--text-lg: 1.125rem;   /* Section titles */
--text-base: 1rem;     /* Body text */
--text-sm: 0.875rem;   /* Table cells, filters */
--text-xs: 0.75rem;    /* Badges, helper text */

/* Weights */
--font-bold: 700;      /* #1020 order numbers */
--font-semibold: 600;  /* Column headers */
--font-medium: 500;    /* Buttons, totals */
--font-normal: 400;    /* Regular text */
```

### Spacing
```css
/* Padding */
--p-2: 0.5rem;    /* Condensed cells */
--p-3: 0.75rem;   /* Badges, small buttons */
--p-4: 1rem;      /* Regular cells, inputs */
--p-6: 1.5rem;    /* Container padding */

/* Margins */
--m-2: 0.5rem;    /* Between elements */
--m-4: 1rem;      /* Between sections */
--m-6: 1.5rem;    /* Between major sections */
```

### Borders & Shadows
```css
/* Borders */
--border-width: 1px;
--border-color: #e5e7eb;  /* gray-200 */
--border-radius: 0.5rem;  /* rounded-lg */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

---

## 📐 Layout Patterns

### Full Page Table
```typescript
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-6">Page Title</h1>
    <Card padding="none">
      <IndexFilters {...filterProps} />
      <IndexTable {...tableProps} />
    </Card>
  </div>
</div>
```

### Dashboard Widget Table
```typescript
<Card>
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">Recent Orders</h2>
    <Button variant="ghost" size="sm">View All</Button>
  </div>
  <IndexTable
    {...tableProps}
    condensed
  />
</Card>
```

### Modal Table
```typescript
<Modal size="xl">
  <Modal.Header>Select Items</Modal.Header>
  <Modal.Body padding="none">
    <IndexTable
      {...tableProps}
      selectedItems={selected}
      onSelectionChange={setSelected}
    />
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleConfirm}>Confirm Selection</Button>
  </Modal.Footer>
</Modal>
```

---

## 🎭 State Patterns

### Loading
```typescript
const [isLoading, setIsLoading] = useState(true);

<IndexTable
  loading={isLoading}
  {...otherProps}
/>
```

### Empty
```typescript
<IndexTable
  data={[]}
  emptyState={
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">No items yet</p>
      <Button onClick={handleCreate}>Create First Item</Button>
    </div>
  }
  {...otherProps}
/>
```

### Error
```typescript
{error ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <p className="text-red-800 mb-4">{error.message}</p>
    <Button onClick={handleRetry}>Retry</Button>
  </div>
) : (
  <IndexTable {...props} />
)}
```

---

## 🎪 Animation & Transitions

### Hover Effects
- Row hover: `bg-gray-50`
- Selected row: `bg-blue-50`
- Button hover: Darker shade + scale
- Badge: Subtle pulse on update

### Transitions
```css
/* Smooth transitions */
transition-colors: 150ms;
transition-shadow: 150ms;
transition-transform: 150ms;

/* Dropdown animations */
enter: 100ms ease-out
leave: 75ms ease-in
```

### Loading States
```typescript
// Spinner animation
animate-spin: rotation 1s linear infinite

// Skeleton loading
animate-pulse: opacity 1s ease-in-out infinite
```

---

## 🎯 Accessibility Features

### Keyboard Navigation
- `Tab`: Navigate through interactive elements
- `Space`: Toggle checkboxes
- `Enter`: Activate buttons
- `Escape`: Close modals/dropdowns
- `Arrow keys`: Navigate dropdowns

### Screen Readers
- ARIA labels on all interactive elements
- Role attributes for semantic meaning
- Live regions for dynamic content
- Focus management for modals
- Alt text for icons

### Focus Management
- Visible focus indicators
- Focus trap in modals
- Logical tab order
- Skip links for tables
- Focus restoration

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
- Full table with all columns
- Expanded filter panel
- Side-by-side layout
- Hover effects enabled

### Tablet (768px - 1023px)
- Condensed spacing
- Collapsible filters
- Horizontal scroll if needed
- Touch-friendly targets

### Mobile (≤767px)
- Auto condensed mode
- Stacked filters
- Full-width elements
- Larger touch targets
- Simplified layout

---

## 🏆 Best Practices

### Performance
✅ Use pagination for 100+ rows
✅ Debounce search (300ms)
✅ Memoize expensive computations
✅ Virtual scrolling for 1000+ rows
✅ Lazy load images/avatars

### UX
✅ Show loading states
✅ Provide empty states
✅ Use consistent badge colors
✅ Keep filters simple
✅ Add keyboard shortcuts
✅ Preserve scroll position

### Code
✅ Type everything with TypeScript
✅ Use useCallback for handlers
✅ Extract complex logic
✅ Keep components small
✅ Document custom behavior
✅ Write unit tests

---

## 🎊 You're Ready!

This component system has everything you need to build professional admin tables. Start with the demo, use the template, and customize to your needs!

**Demo:** Navigate to `/demo-table` in your admin dashboard
**Template:** `app/components/tables/IndexTable/Template.tsx`
**Example:** `app/components/tables/IndexTable/Example.tsx`

