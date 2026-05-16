# Implementation Tasks

## Task List

- [x] 1. Project scaffold and Kiro workspace
  - Create `index.html` with semantic HTML structure (header, main, form, list, chart canvas)
  - Create `css/style.css` with CSS custom properties for light/dark theming
  - Create `js/script.js` with state variables and `init()` entry point
  - Create `.kiro/specs/study-focus-analyzer/` directory with `.config.kiro`
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 2. Local Storage persistence layer
  - Implement `saveActivities()` / `loadActivities()` with JSON serialisation and try/catch error handling
  - Implement `saveCustomCats()` / `loadCustomCats()` with JSON serialisation and try/catch error handling
  - Implement `saveTheme()` / `loadTheme()` for theme persistence
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3. Activity Input Form
  - Render form with Activity_Name text input, Duration number input, Activity_Type select
  - Implement `validateForm()` with per-field inline error messages
  - Implement form submit handler: validate → create activity object with `uid()` → push to `activities[]` → save → `updateUI()` → reset fields
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 4. Total Focus Time display
  - Implement `renderTotal()` to sum all durations and update `#totalTime`
  - Call `renderTotal()` inside `updateUI()`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Activity List rendering and delete
  - Implement `renderActivityList()` using `getSortedActivities()` to build DOM items
  - Implement `escapeHtml()` to sanitise user input before DOM insertion
  - Implement event-delegated delete handler on `#activityList`
  - Show/hide `#listEmpty` based on list length
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

- [x] 6. Chart.js pie chart
  - Load Chart.js from CDN in `index.html`
  - Implement `renderChart()` to aggregate durations by type and create/update the Chart instance
  - Implement empty-state handling (hide canvas, show `#chartEmpty`)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Custom categories (Optional Challenge 1)
  - Implement `syncTypeDropdown()` to append custom options to the Activity_Type select
  - Implement `renderCustomCatTags()` to display removable pill tags
  - Implement add-custom-category handler with duplicate/empty validation
  - Implement remove-custom-category handler (event-delegated on tag list)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Sort transactions (Optional Challenge 2)
  - Implement `getSortedActivities()` returning a sorted shallow copy by name / duration / type / default
  - Wire `#sortControl` change event to update `sortMode` and call `renderActivityList()`
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 9. Dark / Light mode toggle (Optional Challenge 3)
  - Define dark-theme CSS custom properties under `[data-theme="dark"]`
  - Implement `applyTheme(theme)` to set `data-theme` attribute and update toggle icon
  - Wire `#themeToggle` click event to toggle and persist theme
  - Restore saved theme on `init()`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Initialisation and integration
  - Implement `init()` to orchestrate: load theme → load data → sync dropdown → render tags → `updateUI()`
  - Implement `updateUI()` as the single master render call: `renderTotal()` + `renderActivityList()` + `renderChart()`
  - Verify all event listeners are registered before `init()` is called
  - _Requirements: 1.3–1.7, 2.4, 4.4, 5.4, 6.3, 6.4, 9.4_
