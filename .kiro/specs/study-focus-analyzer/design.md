# Design Document

## Overview

Study Focus Analyzer is a single-page web application built with HTML, CSS, and Vanilla JavaScript. It mirrors the data model of an Expense & Budget Visualizer but replaces financial transactions with study-session activities. All state is held in memory and persisted to the Browser Local Storage API. Chart.js (loaded from CDN) renders the pie chart. No build step, server, or framework is required.

---

## Architecture

### File Structure

```
project-root/
├── index.html          ← Single HTML entry point; loads CSS and JS
├── css/
│   └── style.css       ← All styles; CSS custom properties for theming
├── js/
│   └── script.js       ← All application logic
└── .kiro/
    └── specs/
        └── study-focus-analyzer/
            ├── .config.kiro
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

### Runtime Architecture

```
index.html
  │
  ├── <link> css/style.css          (loaded synchronously)
  ├── <script> Chart.js CDN         (loaded synchronously, before body)
  └── <script> js/script.js         (deferred via placement at end of body)
        │
        ├── State layer             (in-memory arrays + Local Storage)
        ├── Render layer            (DOM manipulation functions)
        └── Event layer             (form submit, delete, sort, theme, custom cats)
```

---

## Data Model

### Activity Object

```js
{
  id:       string,   // uid() — Date.now base-36 + random suffix
  name:     string,   // Activity_Name — user-supplied text
  duration: number,   // positive float, minutes
  type:     string,   // Activity_Type label (built-in or custom)
}
```

### Local Storage Keys

| Key               | Value                          | Purpose                        |
|-------------------|--------------------------------|--------------------------------|
| `sfa_activities`  | JSON array of Activity objects | Persist the activity list      |
| `sfa_custom_cats` | JSON array of strings          | Persist custom category names  |
| `sfa_theme`       | `"light"` or `"dark"`          | Persist the selected theme     |

---

## Component Design

### 1. Input Form

- Three fields: text input (Activity_Name), number input (Duration ≥ 1), select (Activity_Type).
- Client-side validation on submit: all fields required, duration must be a positive number.
- On valid submit: push to `activities[]`, call `saveActivities()`, call `updateUI()`, reset fields.
- Inline `<span class="field-error">` elements display per-field validation messages.

### 2. Activity List

- Rendered by `renderActivityList()` into `#activityList` (a `role="list"` div).
- Each item is a flex row: coloured dot, name + type meta, duration badge, delete button.
- Scrollable via `max-height` + `overflow-y: auto` on the container.
- Empty state: `#listEmpty` paragraph shown when `activities.length === 0`.
- Delete: event-delegated `click` listener on the container reads `data-id` from the button.

### 3. Total Focus Time

- `renderTotal()` sums `activity.duration` for all items and writes to `#totalTime`.
- Called as part of `updateUI()` after every add or delete.

### 4. Pie Chart (Chart.js)

- `renderChart()` aggregates durations by type into a label/data/color arrays.
- On first render: creates a new `Chart` instance on `#focusChart` canvas.
- On subsequent renders: mutates `chartInstance.data` and calls `chartInstance.update()` (avoids destroy/recreate flicker).
- Empty state: destroys the instance (if any), hides canvas, shows `#chartEmpty` paragraph.
- Colours: built-in types have fixed hex values; custom categories cycle through an 8-colour palette.

### 5. Local Storage Persistence

- `saveActivities()` / `loadActivities()`: JSON stringify/parse of `activities[]`.
- `saveCustomCats()` / `loadCustomCats()`: JSON stringify/parse of `customCats[]`.
- `saveTheme()` / `loadTheme()`: plain string read/write.
- All load functions wrap `JSON.parse` in try/catch; on error they reset to empty state and log to console.

### 6. Custom Categories (Optional Challenge 1)

- `customCats[]` array holds user-defined type strings.
- `syncTypeDropdown()` removes all options beyond index 3 (the 3 built-ins + placeholder) and re-appends custom options.
- `renderCustomCatTags()` renders pill tags with a remove button.
- Removing a custom category does not delete activities that used it; their colour falls back gracefully.

### 7. Sort Transactions (Optional Challenge 2)

- `sortMode` variable tracks the current sort selection (`'default'`, `'name'`, `'duration'`, `'type'`).
- `getSortedActivities()` returns a sorted shallow copy of `activities[]`; the source array is never mutated.
- Sort is re-applied on every `renderActivityList()` call, including after add/delete.

### 8. Dark / Light Mode Toggle (Optional Challenge 3)

- CSS custom properties defined under `:root` (light) and `[data-theme="dark"]` (dark).
- `applyTheme(theme)` sets `document.documentElement.setAttribute('data-theme', theme)` and updates the toggle icon.
- Theme is persisted to Local Storage and restored on `init()`.
- Chart legend and border colours read CSS custom properties at render time so they adapt to the active theme.

---

## Event Flow

```
User submits form
  → validateForm() → if invalid: show errors, return
  → push activity to activities[]
  → saveActivities()
  → reset form fields
  → updateUI()
      → renderTotal()
      → renderActivityList()
      → renderChart()

User clicks delete button
  → filter activities[] by id
  → saveActivities()
  → updateUI()

User changes sort control
  → update sortMode
  → renderActivityList()

User clicks theme toggle
  → toggle data-theme attribute
  → saveTheme()
  → renderChart() (to update chart colours)

User adds custom category
  → validate (non-empty, not duplicate)
  → push to customCats[]
  → saveCustomCats()
  → syncTypeDropdown()
  → renderCustomCatTags()

User removes custom category tag
  → splice from customCats[]
  → saveCustomCats()
  → syncTypeDropdown()
  → renderCustomCatTags()
  → renderChart()

Application loads (init)
  → loadTheme() → applyTheme()
  → loadActivities()
  → loadCustomCats()
  → syncTypeDropdown()
  → renderCustomCatTags()
  → updateUI()
```

---

## Correctness Properties

### Property 1: Total Focus Time equals sum of all durations (Invariant)

After any add or delete operation, `Total_Focus_Time` displayed must equal the arithmetic sum of all `duration` values in `activities[]`.

- **Type**: Invariant
- **Test approach**: Property-based — generate random sequences of add/delete operations and assert `sum(activities.map(a => a.duration)) === parseInt(totalTimeEl.textContent)` after each operation.

### Property 2: Local Storage round-trip (Round-Trip Property)

Serialising `activities[]` to Local Storage and then deserialising it must produce an array that is deeply equal to the original.

- **Type**: Round-trip
- **Test approach**: Property-based — for any array of Activity objects, `JSON.parse(JSON.stringify(arr))` must deeply equal `arr`.

### Property 3: Delete is the inverse of add (Round-Trip Property)

Adding an activity and then deleting it by the same `id` must leave `activities[]` in the same state as before the add.

- **Type**: Round-trip / inverse operation
- **Test approach**: Example-based — add an activity, record the list length, delete it, assert length is restored and the item is absent.

### Property 4: Sort does not mutate source data (Invariant)

Calling `getSortedActivities()` must not change the order or contents of `activities[]`.

- **Type**: Invariant
- **Test approach**: Property-based — snapshot `activities[]` before and after calling `getSortedActivities()` and assert deep equality.

### Property 5: Empty state renders without error (Edge Case)

When `activities[]` is empty, `renderChart()` and `renderActivityList()` must complete without throwing a runtime error and must display the appropriate empty-state UI.

- **Type**: Edge case
- **Test approach**: Example-based — initialise with empty state, call render functions, assert no exception and that empty-state elements are visible.
