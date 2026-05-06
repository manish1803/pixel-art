# Pixel Art Editor — Production-Grade Implementation Plan

## 1. Architecture Overview

### Architecture Type
Modular Monolith using Next.js App Router

### System Flow
Client → API Routes → Service Layer → Data Layer → MongoDB Atlas → External Services (Cloudinary, OAuth)

---

## 2. Core Improvements

### Service Layer (NEW)
Create:
`/services/project.service.ts`

Handles:
- createProject
- getUserProjects
- updateProject
- deleteProject

---

### State Management
- Zustand → UI state (editor)
- React Query → Server state (projects)

---

### Validation
Use Zod:
`/schemas/project.schema.ts`

---

### Error Handling
Standard API response:
```
{
  success: boolean,
  data?: any,
  error?: { message: string, code: string }
}
```

---

### Access Control
- Validate session in every API
- Ensure project belongs to user

---

## 3. Updated Phases

### Phase 1 — UI
- Dashboard
- Reusable UI components

### Phase 2 — Next.js Migration
- App Router
- Server vs Client components

### Phase 3 — Auth
- Auth.js (GitHub + Google)
- Guest mode

### Phase 4 — Database
- MongoDB Atlas
- Mongoose
- Pagination
- Indexing

---

## 4. Performance

- Debounced saving
- Optimistic UI
- Lazy loading
- Image optimization

---

## 5. Security

- Rate limiting
- Input validation
- Auth checks
- Mongo injection protection

---

## 6. Folder Structure

```
src/
├── app/
├── components/
├── services/
├── lib/
├── hooks/
├── store/
├── schemas/
├── types/
```

---

## 7. Dev Workflow

- Branching: main / dev / feat/*
- Commit standard: feat:, fix:
- PR checklist required

---

## 8. Testing

- Unit: services
- Integration: API
- E2E: Playwright

---

## 9. Future Enhancements

- Real-time collaboration
- Version history
- Public sharing
- Export (PNG/GIF)

---

## Final Notes

This transforms the project into an industry-level system design with scalability, maintainability, and performance.
