# Calendar UI Plan

## Data Inputs
- `completedDays`: set of YYYY-MM-DD strings for the current month.
- Optional `dayDetails`: map date -> { routineTitle, durationMinutes } (for tooltip).

## Rendering
- Use a simple month grid (7 columns). Week starts Sunday.
- For each day cell:
  - Show day number (1..31)
  - If date in `completedDays`, add a filled dot or highlight background.

## Interaction
- Tap a completed day to show a lightweight popover:
  - Routine title
  - Duration (e.g., 20 min)

## Accessibility
- Large tap targets (min 44px height)
- High contrast highlight
- Optional legend: "Completed" with dot indicator
