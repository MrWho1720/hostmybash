# Advanced Auth & Profile System — Implementation Plan

## Phase 1: Database — Add Avatar & Bio to Users
- [ ] Add `avatar_url` and `bio` columns to `users` table schema
- [ ] Update Lucia `getUserAttributes` to include new fields
- [ ] Push schema to PostgreSQL

## Phase 2: Fix Registration UX
- [ ] Show specific messages: "Email already taken", "Username already taken"
- [ ] Add password confirmation field with mismatch error
- [ ] Real-time username availability check (debounced API call)
- [ ] Field-level error highlighting (red border on the failing field)
- [ ] Show success state before redirect

## Phase 3: Fix Login UX
- [ ] Clear error messages per scenario (no account, wrong password, deactivated)
- [ ] Loading spinner on submit button
- [ ] Redirect to intended page after login

## Phase 4: Profile API & Settings Page
- [ ] `GET /api/auth/me` — return full profile (avatar, bio, username, email, displayName)
- [ ] `PUT /api/auth/profile` — update displayName, bio, avatarUrl
- [ ] `PUT /api/auth/password` — change password (requires current password)
- [ ] Avatar system: Gravatar fallback from email hash, allow custom URL
- [ ] `/settings` dashboard page: edit name, bio, avatar, change password

## Phase 5: Sidebar User Profile Widget
- [ ] Fetch user profile on dashboard load
- [ ] Show avatar + displayName + @username in sidebar footer
- [ ] Link to `/settings`

## Phase 6: Public User Profile Page
- [ ] `username.endever.in/` (subdomain root) shows public profile
- [ ] Avatar, display name, bio, list of public scripts
- [ ] Proper 404 for non-existent users
