Employer Profile - Frontend UI guide

Overview
- Purpose: Provide a compact UI for employers to view and edit their profile (avatar, position, associated company).
- API base: `/employer/profile` (GET, PUT, PATCH avatar, DELETE).

Endpoints
- GET /employer/profile/:id
  - Returns employer profile data: `employer_id`, `user_id`, `company`, `position`, `avatar_url`, `user` (user fields).
  - Public endpoint.

- PUT /employer/profile
  - Auth: JWT (role `employer`).
  - Body: `company_id?: string`, `position?: string`.
  - Response: updated profile in `data`.

- PATCH /employer/profile/avatar
  - Auth: JWT (role `employer`).
  - Form field: `avatar` (file). Accepts `image/jpeg`, `image/png`, `image/gif`.
  - Response: `{ message, data: { avatar_url, avatar_download_url } }`.

- DELETE /employer/profile
  - Auth: JWT (role `employer`).
  - Deletes employer profile record.

Frontend UI suggestions
- View screen (Employer Profile)
  - Header: avatar (circular), employer name (from `user`), position, company name (if available).
  - Sections: Contact (email/phone from `user`), Company (link to company page), Actions (Edit profile, Change avatar).

- Edit screen / modal
  - Fields: `position` (text), `company` (select or autocomplete by `company_id`).
  - Save button calls `PUT /employer/profile` with JSON body.
  - On success: refresh profile view with returned `data`.

- Change avatar
  - UI: small camera overlay button on avatar image opens file picker.
  - Upload: send `multipart/form-data` with field `avatar` to `PATCH /employer/profile/avatar`.
  - Show preview immediately; optimistically update avatar URL after successful response.

- Error handling
  - Show validation errors returned from API (e.g., invalid company id).
  - Handle upload errors and show retry.

Notes for frontend implementer
- Include Authorization header with Bearer token for protected endpoints.
- Respect CORS and file size limits (backend may enforce limits via middleware).
- Use `avatar_download_url` or `avatar_url` returned by API for display.

Example fetch calls
- Fetch profile:
  fetch(`/employer/profile/${id}`)

- Update profile:
  fetch('/employer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' }, body: JSON.stringify({ position: 'CTO' }) })

- Upload avatar:
  const form = new FormData();
  form.append('avatar', file);
  fetch('/employer/profile/avatar', { method: 'PATCH', body: form, headers: { Authorization: 'Bearer <token>' } });

Style guidelines
- Avatar: 96x96 circle on desktop, 64x64 on mobile.
- Use accessible labels on inputs and buttons.

End.
