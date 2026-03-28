# Teachment

## Current State
Full teacher app with Dashboard, Students, Attendance, Assignments, Gradebook, Announcements, Schedule, Messages, Recordings, Profile. PWA enabled.

## Requested Changes (Diff)

### Add
- Live Classes section (Live Class Hub): Teachers can schedule live sessions with a title, class name, date/time, and a Zoom/Google Meet join link. Saved sessions are listed with a "Join Now" button that opens the link. Sessions can be deleted.

### Modify
- App.tsx: Add `live-classes` page type, import LiveClasses component, add to navItems and mobile menu

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/LiveClasses.tsx` with form to schedule a session and list of upcoming/past sessions
2. Update App.tsx to include the new page
