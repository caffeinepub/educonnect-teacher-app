# Umar Teachment App

## Current State
The app has a Live Classes section that lets teachers schedule sessions with Zoom/Meet links. Students can click "Join Now" to open the external link. Sessions show a LIVE badge when imminent.

## Requested Changes (Diff)

### Add
- Student enrollment per session (students register their name and join up to 100 capacity)
- Live Q&A chat board per session (students/teacher can post questions and replies, stored in localStorage)
- Attendance auto-tracking: when a student clicks "Join Now" they are marked present in that session's attendance list
- Capacity counter showing enrolled / 100 students per session
- Session detail view (expandable panel) showing enrolled students, attendance, and Q&A chat

### Modify
- LiveClasses.tsx: extend session data model to include enrollments[], attendance[], and chat[] arrays
- Each session card now shows enrolled count and a "View Details" toggle
- "Join Now" button records the student as attended

### Remove
- Nothing removed

## Implementation Plan
1. Extend LiveSession interface with enrollments, attendance, chat fields
2. Add "Enroll" form: student enters their name, gets added to enrollment list (max 100)
3. Add session detail panel per session card: tabs for Enrolled Students, Attendance, Q&A Chat
4. Q&A Chat: simple message list with author + message input
5. Attendance: auto-recorded when Join Now is clicked after providing name
6. Show capacity badge (e.g. "12/100") on each session card
