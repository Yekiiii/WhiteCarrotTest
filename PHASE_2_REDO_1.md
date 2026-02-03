You are enhancing Phase 2 of a MERN-based Careers Page Builder.

GOAL:
Implement a modern, Shopify-style drag-and-drop section editor for the Recruiter company editor page.

DESIGN REFERENCE:
- Shopify theme editor
- Modern SaaS dashboards (clean, card-based, minimal chrome)

TECH CONSTRAINTS:
- React (Vite)
- TypeScript
- Tailwind CSS
- Use @dnd-kit/core and @dnd-kit/sortable
- No other drag-and-drop libraries
- No Redux or complex state managers

SECTIONS DATA:
Each section has:
- id (string)
- type ("about" | "culture" | "jobs")
- enabled (boolean)
- order (number)

DRAG & DROP REQUIREMENTS:
- Sections should be displayed as draggable cards
- Dragging should reorder sections visually
- Reordering updates the `order` field in state
- Only enabled sections are draggable
- Disabled sections remain visible but not draggable
- Drag handle icon (≡) on the left side of each card
- Smooth drag animations
- Clear drop indicators

SECTION CARD UI:
Each draggable section card should include:
- Drag handle icon
- Section title (human readable)
- Short description (e.g. "Company overview", "Open roles")
- Toggle switch to enable/disable section
- Subtle hover and active states
- Rounded corners, border, soft shadow

UX RULES:
- Dragging should feel smooth and intentional
- Cursor changes on drag
- Section card elevates slightly while dragging
- Disabled sections appear visually muted
- Keyboard accessibility supported by dnd-kit defaults

STATE MANAGEMENT:
- Use local React state in CompanyEditor
- On drag end:
  - Recalculate section order
  - Update local state only
- Persist changes only when user clicks "Save"

DO NOT:
- Add nested sections
- Add drag-and-drop for jobs
- Add animations that feel playful or flashy
- Overcomplicate the logic
- Introduce new global state

STYLING DIRECTION:
- Clean
- Neutral colors
- White cards on light gray background
- Subtle borders and shadows
- Feels like a real production SaaS editor

OUTPUT EXPECTATION:
- Clean, readable, interview-ready code
- Separate components:
  - SectionList
  - DraggableSectionCard
- Use Tailwind utility classes
- Add short comments where logic is non-obvious
