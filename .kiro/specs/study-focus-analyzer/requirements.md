# Requirements Document

## Introduction

Study Focus Analyzer is a productivity web application that tracks and visualizes how users spend their learning focus time. It is a direct reinterpretation of an Expense & Budget Visualizer: instead of money transactions and spending categories, it records study activities and focus durations. All functional requirements of an Expense & Budget Visualizer are preserved and mapped to the study-focus domain. The application runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, with data persisted in the Browser Local Storage API.

## Glossary

- **Application**: The Study Focus Analyzer single-page web application.
- **Activity**: A single study session entry consisting of an Activity_Name, Duration, and Activity_Type. Equivalent to a financial transaction.
- **Activity_Name**: A user-supplied text label describing the study task (e.g., "Read Chapter 5"). Equivalent to Item Name.
- **Duration**: A positive numeric value representing the length of a study session in minutes. Equivalent to Amount.
- **Activity_Type**: The category of a study session. One of: Deep_Study, Practice_Coding, or Distraction_Break. Equivalent to Category (Food → Deep_Study, Transport → Practice_Coding, Fun → Distraction_Break).
- **Total_Focus_Time**: The sum of all Activity Duration values currently stored. Equivalent to Total Balance.
- **Activity_List**: The scrollable on-screen list of all recorded Activities.
- **Input_Form**: The HTML form used to create a new Activity.
- **Pie_Chart**: The Chart.js pie chart that visualises the distribution of Duration across Activity_Types.
- **Local_Storage**: The Browser Local Storage API used to persist Activity data between sessions.
- **Dark_Mode**: An alternative colour scheme with dark backgrounds and light text.
- **Custom_Category**: A user-defined Activity_Type beyond the three built-in types.
- **Sort_Control**: A UI control that reorders the Activity_List by a chosen criterion.

---

## Requirements

### Requirement 1: Activity Input Form

**User Story:** As a student, I want to enter a study activity with its name, duration, and type, so that I can record how I spend my focus time.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field for Activity_Name, a numeric field for Duration (in minutes), and a dropdown selector for Activity_Type.
2. THE Input_Form SHALL include the built-in Activity_Type options: Deep_Study, Practice_Coding, and Distraction_Break.
3. WHEN the user submits the Input_Form with all fields populated, THE Application SHALL add the new Activity to the Activity_List.
4. WHEN the user submits the Input_Form with all fields populated, THE Application SHALL save the new Activity to Local_Storage.
5. WHEN the user submits the Input_Form with all fields populated, THE Application SHALL update Total_Focus_Time to reflect the added Duration.
6. WHEN the user submits the Input_Form with all fields populated, THE Application SHALL update the Pie_Chart to reflect the new Activity_Type distribution.
7. WHEN the user submits the Input_Form with all fields populated, THE Application SHALL clear all Input_Form fields to their default empty state.
8. IF the user submits the Input_Form with one or more fields empty, THEN THE Application SHALL prevent submission and display a validation message identifying the missing field(s).
9. IF the user enters a Duration value that is not a positive number, THEN THE Application SHALL prevent submission and display a validation message.

---

### Requirement 2: Activity List Display

**User Story:** As a student, I want to see all my recorded study activities in a scrollable list, so that I can review my focus history.

#### Acceptance Criteria

1. THE Activity_List SHALL display each Activity with its Activity_Name, Duration (in minutes), and Activity_Type.
2. THE Activity_List SHALL be contained in a scrollable area so that any number of Activities can be viewed without breaking the page layout.
3. THE Activity_List SHALL display a delete button for each Activity.
4. WHEN the Application loads, THE Activity_List SHALL be populated from data stored in Local_Storage.

---

### Requirement 3: Delete Activity

**User Story:** As a student, I want to delete a recorded activity, so that I can correct mistakes or remove irrelevant entries.

#### Acceptance Criteria

1. WHEN the user activates the delete button for an Activity, THE Application SHALL remove that Activity from the Activity_List.
2. WHEN the user activates the delete button for an Activity, THE Application SHALL remove that Activity from Local_Storage.
3. WHEN the user activates the delete button for an Activity, THE Application SHALL update Total_Focus_Time to subtract the deleted Activity's Duration.
4. WHEN the user activates the delete button for an Activity, THE Application SHALL update the Pie_Chart to reflect the revised Activity_Type distribution.

---

### Requirement 4: Total Focus Time Display

**User Story:** As a student, I want to see my total accumulated focus time at a glance, so that I can track my overall study effort.

#### Acceptance Criteria

1. THE Application SHALL display Total_Focus_Time prominently at the top of the page.
2. WHEN an Activity is added, THE Application SHALL recalculate and display the updated Total_Focus_Time without requiring a page reload.
3. WHEN an Activity is deleted, THE Application SHALL recalculate and display the updated Total_Focus_Time without requiring a page reload.
4. WHEN the Application loads, THE Application SHALL calculate Total_Focus_Time from all Activities stored in Local_Storage and display the result.

---

### Requirement 5: Pie Chart Visualisation

**User Story:** As a student, I want to see a pie chart of my focus time by activity type, so that I can understand how I distribute my study effort.

#### Acceptance Criteria

1. THE Application SHALL render a Pie_Chart using the Chart.js library that shows the proportion of total Duration attributed to each Activity_Type.
2. WHEN an Activity is added, THE Application SHALL update the Pie_Chart automatically without requiring a page reload.
3. WHEN an Activity is deleted, THE Application SHALL update the Pie_Chart automatically without requiring a page reload.
4. WHEN the Application loads, THE Application SHALL render the Pie_Chart using Activity data retrieved from Local_Storage.
5. IF no Activities are recorded, THEN THE Application SHALL display the Pie_Chart in an empty or placeholder state without throwing a runtime error.

---

### Requirement 6: Local Storage Persistence

**User Story:** As a student, I want my study activities to be saved between browser sessions, so that I do not lose my focus history when I close the tab.

#### Acceptance Criteria

1. WHEN an Activity is added, THE Application SHALL serialise and write the complete Activity_List to Local_Storage.
2. WHEN an Activity is deleted, THE Application SHALL serialise and write the updated Activity_List to Local_Storage.
3. WHEN the Application loads, THE Application SHALL deserialise the Activity_List from Local_Storage and restore all previously saved Activities.
4. IF Local_Storage contains no data on load, THEN THE Application SHALL initialise with an empty Activity_List and a Total_Focus_Time of zero.
5. IF Local_Storage data cannot be parsed, THEN THE Application SHALL initialise with an empty Activity_List and log a descriptive error to the browser console.

---

### Requirement 7: Custom Categories (Optional Challenge 1)

**User Story:** As a student, I want to create my own activity types beyond the built-in three, so that I can tailor the tracker to my personal study workflow.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a mechanism for the user to add a Custom_Category name.
2. WHEN the user adds a Custom_Category, THE Application SHALL append it to the Activity_Type dropdown so it is selectable for new Activities.
3. WHEN the user adds a Custom_Category, THE Application SHALL persist the Custom_Category list to Local_Storage.
4. WHEN the Application loads, THE Application SHALL restore all previously saved Custom_Categories into the Activity_Type dropdown.
5. THE Pie_Chart SHALL include Custom_Category slices alongside the built-in Activity_Type slices.

---

### Requirement 8: Sort Transactions (Optional Challenge 2)

**User Story:** As a student, I want to sort my activity list by different criteria, so that I can quickly find or review specific entries.

#### Acceptance Criteria

1. THE Application SHALL provide a Sort_Control that allows the user to sort the Activity_List by Activity_Name (alphabetical ascending), Duration (descending), or Activity_Type (alphabetical ascending).
2. WHEN the user changes the Sort_Control selection, THE Application SHALL reorder the Activity_List display immediately without modifying the underlying stored order in Local_Storage.
3. WHEN a new Activity is added, THE Application SHALL apply the currently selected sort order to the updated Activity_List display.

---

### Requirement 9: Dark / Light Mode Toggle (Optional Challenge 3)

**User Story:** As a student, I want to switch between dark and light colour schemes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Application SHALL display a toggle control that switches between Dark_Mode and the default light colour scheme.
2. WHEN the user activates the Dark_Mode toggle, THE Application SHALL apply a dark background and light text colour scheme to all visible UI elements.
3. WHEN the user deactivates the Dark_Mode toggle, THE Application SHALL restore the default light colour scheme to all visible UI elements.
4. WHEN the Application loads, THE Application SHALL restore the previously selected colour scheme from Local_Storage.
5. WHEN the user changes the colour scheme, THE Application SHALL persist the selected scheme to Local_Storage.

---

### Requirement 10: Technology and Deployment Constraints

**User Story:** As a developer, I want the application to run without any build step or server, so that it can be opened directly in a browser and deployed via GitHub Pages.

#### Acceptance Criteria

1. THE Application SHALL be implemented using HTML, CSS, and Vanilla JavaScript only, with no frameworks, transpilers, or backend dependencies.
2. THE Application SHALL load and operate correctly when index.html is opened directly in Chrome, Firefox, Edge, and Safari without a local server.
3. THE Application SHALL store all data exclusively in Local_Storage with no network requests to external servers for data persistence.
4. THE Application SHALL consist of exactly one HTML file (index.html), one CSS file (css/style.css), and one JavaScript file (js/script.js).
5. THE Application SHALL load Chart.js from a CDN reference within index.html so that no local installation is required.
