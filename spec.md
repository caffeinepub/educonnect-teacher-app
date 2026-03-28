# New Teachment

## Current State
Teachment is a comprehensive teacher app PWA with 11 nav sections: Dashboard, Students, Attendance, Assignments, Gradebook, Announcements, Schedule, Messages, Recordings, Live Classes, Profile. Backend is Motoko with classes, students, attendance, assignments, grades, announcements, schedule, messages, and profile APIs. Frontend uses React/TypeScript/Tailwind with shadcn/ui. Profile and Live Classes data is stored in localStorage.

## Requested Changes (Diff)

### Add
- **Quiz/Test Builder** (`Quiz.tsx`): New page. Teacher can create quizzes with a title, class, and multiple-choice questions (question text + 4 options + correct answer index). Quizzes saved to localStorage. Each quiz can be viewed to see questions. Teacher can delete quizzes.
- **Student Portal** (`StudentPortal.tsx`): New page. Shows a student-facing view -- teacher selects a student from a dropdown, and sees that student's assignments (from backend), grades (from backend), and attendance summary. Useful for parent-teacher meetings or reviewing a student's progress.
- **Homework Submission Tracking**: In `Assignments.tsx`, add a "Submissions" tab in the detail dialog. Teacher can mark each student as "Submitted" or "Not Submitted" for that assignment. Submission state stored in localStorage (`teachment_submissions`).
- **Notification Bell**: In `App.tsx`, make the bell icon functional. When clicked, show a dropdown of upcoming live sessions (within 24 hours) from `teachment_live_classes` localStorage. If browser supports Notification API, request permission and show a desktop notification for sessions starting within 15 minutes.
- **Rename app** to "New Teachment" everywhere: App.tsx sidebar brand text, header title, manifest.json app name, PWA name.

### Modify
- `App.tsx`: Add Quiz and Student Portal to navItems and pageComponents. Update brand name from "Teachment" to "New Teachment". Make bell icon functional with a notification dropdown.
- `Assignments.tsx`: Add submissions tracking tab in the detail dialog.
- `src/frontend/public/manifest.json`: Update `name` and `short_name` to "New Teachment".

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/pages/Quiz.tsx` with quiz builder UI (localStorage-based).
2. Create `src/frontend/src/pages/StudentPortal.tsx` with student progress view (uses backend actor for assignments, grades, attendance).
3. Update `src/frontend/src/pages/Assignments.tsx` to add homework submission tracking per student per assignment (localStorage).
4. Update `src/frontend/src/App.tsx`: add Quiz and StudentPortal pages, rename "Teachment" to "New Teachment", implement notification bell dropdown.
5. Update `src/frontend/public/manifest.json` to use "New Teachment" as name.
6. Validate build.
