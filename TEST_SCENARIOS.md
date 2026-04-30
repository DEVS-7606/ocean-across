# Ocean Across — Test Scenarios

Run `docker compose up --build` and wait for all 4 containers to be healthy (~60s) before starting.
Base URL: **http://localhost**

---

## Prerequisites

- App is running: `docker compose up`
- You have **two GitHub accounts** (for multi-user scenarios). If not, use a second browser in incognito for the second account.
- GitHub OAuth app callback URL is set to `http://localhost/social-auth/complete/github/`

---

## 1. Auth Flows

---

### 1.1 New User Signup — User Role

**Goal:** First-time GitHub login lands on role selection, picking "learn" sets User role and redirects to catalog.

**Steps:**
1. Visit `http://localhost`
2. Click **Sign in with GitHub**
3. GitHub asks for authorization → click **Authorize**
4. You are redirected to `http://localhost/select-role`
5. Click **"I want to learn"**
6. Click **Continue**

**Expected:**
- Redirected to `http://localhost` (home/catalog page)
- Navbar shows your GitHub avatar and a **My Dashboard** link
- Session catalog is visible

---

### 1.2 New User Signup — Creator Role

**Goal:** Picking "create" sets Creator role and redirects to Creator Dashboard.

**Steps:**
1. Use a fresh GitHub account (or clear cookies first)
2. Visit `http://localhost` → **Sign in with GitHub** → authorize
3. On `/select-role` click **"I want to create"**
4. Click **Continue**

**Expected:**
- Redirected to `/creator` (Creator Dashboard)
- Navbar shows **Creator Dashboard** link
- Dashboard shows empty sessions list and a **New Session** button

---

### 1.3 Returning User Skips Role Page

**Goal:** A user who already has a role set is never shown role selection again.

**Steps:**
1. Sign in with a GitHub account that previously completed role selection
2. Complete the OAuth flow on GitHub

**Expected:**
- Redirected directly to home (User) or `/creator` (Creator)
- `/select-role` is never shown

---

### 1.4 Logout

**Goal:** Logout blacklists the refresh token and clears the session.

**Steps:**
1. Sign in as any user
2. Click the **Logout** button in the Navbar
3. After logout, manually visit `http://localhost/creator` in the address bar

**Expected:**
- After logout: redirected to home, Navbar shows **Sign in with GitHub**
- Visiting `/creator` manually: redirected to login (not accessible)
- Old refresh token is blacklisted — if you try `POST /api/auth/token/refresh/` with the old token, you get `401 Token is blacklisted`

---

## 2. User Flows

---

### 2.1 Browse Session Catalog

**Goal:** Unauthenticated and authenticated users can both browse sessions.

**Steps:**
1. Visit `http://localhost` without logging in
2. Observe the session cards
3. Now log in as a User role and revisit `http://localhost`

**Expected (both cases):**
- Sessions are listed with: title, description, price (₹ formatted), date/time, available spots
- Sessions with 0 spots remaining show as **Full** or disable the book button
- Past sessions (date already passed) are not shown in the active catalog

---

### 2.2 Book a Session

**Goal:** A User can successfully book an available session.

**Steps:**
1. Log in as a **User** role account
2. On the home catalog, click any session card with spots available
3. On the session detail page, click **Book Now**
4. Observe the toast notification

**Expected:**
- Success toast: "Booking confirmed!" (or similar)
- The **Available Spots** count on the session decreases by 1
- Revisit the session detail — spots count is still reduced (not a UI-only change)

---

### 2.3 View Own Bookings (My Dashboard)

**Goal:** User can see all their bookings separated into upcoming and past.

**Steps:**
1. Log in as User and book at least one session
2. Click **My Dashboard** in the Navbar

**Expected:**
- **Upcoming bookings** section shows sessions with a future date
- **Past bookings** section shows sessions whose date has already passed
- Each booking row shows: session title, creator name, date/time, price paid, status badge

---

### 2.4 Cancel a Booking

**Goal:** A User can cancel their own booking and the session spots are restored.

**Steps:**
1. Log in as User, book a session — note the available spots count before booking
2. Go to **My Dashboard**
3. Click **Cancel** on the booking
4. Confirm the cancellation if a dialog appears
5. Go back to the session detail page

**Expected:**
- Booking disappears from My Dashboard
- Session's available spots count is restored (back to the count before you booked)
- Status of cancellation shows in My Dashboard if the booking still appears (status: Cancelled)

---

### 2.5 Book a Fully Booked Session

**Goal:** Booking a session with 0 spots returns an error.

**Setup:** Create a session with **capacity = 1** as a Creator, then book it once as a User to fill it.

**Steps:**
1. As a second User account, visit the session detail page for the full session
2. Click **Book Now**

**Expected:**
- Error toast: "No spots available" (or similar)
- Booking is NOT created
- Available spots remains at 0

---

### 2.6 Book the Same Session Twice

**Goal:** A user cannot hold two bookings for the same session.

**Steps:**
1. Log in as User and book a session successfully
2. Navigate back to the same session detail page
3. Click **Book Now** again

**Expected:**
- Error toast: "You have already booked this session" (or similar)
- No duplicate booking is created
- Available spots count is unchanged

---

## 3. Creator Flows

---

### 3.1 Create a New Session

**Goal:** A Creator can publish a new session that appears in the public catalog.

**Steps:**
1. Log in as **Creator** role
2. Go to **Creator Dashboard**
3. Click **New Session**
4. Fill in all fields:
   - **Title:** e.g. "React Advanced Patterns"
   - **Description:** e.g. "Deep dive into hooks and performance"
   - **Price:** e.g. 1500
   - **Date & Time:** any future date/time
   - **Capacity:** e.g. 10
5. Click **Create** / **Save**

**Expected:**
- Session appears in Creator Dashboard's sessions list
- Visit `http://localhost` (home) — the new session appears in the public catalog
- Price is displayed in ₹ with Indian locale formatting (e.g. ₹1,500)

---

### 3.2 Edit a Session

**Goal:** A Creator can update a session's details.

**Steps:**
1. Log in as Creator, go to **Creator Dashboard**
2. Find an existing session → click **Edit**
3. Change the price and capacity
4. Click **Save**

**Expected:**
- Updated values immediately reflected in Creator Dashboard
- Visit the public catalog — updated values shown there too
- If you reduce capacity below the current number of bookings, test what happens (ideally an error or it caps at current bookings)

---

### 3.3 Delete a Session

**Goal:** A Creator can remove a session.

**Steps:**
1. Log in as Creator, go to **Creator Dashboard**
2. Find a session (preferably one with no bookings) → click **Delete**
3. Confirm the deletion

**Expected:**
- Session removed from Creator Dashboard
- Session no longer appears in the public catalog at `http://localhost`
- Direct URL `/sessions/<id>` returns 404

---

### 3.4 View Bookings Received

**Goal:** Creator can see all users who have booked their sessions.

**Setup:** Have at least one User account book one of the Creator's sessions first.

**Steps:**
1. Log in as Creator
2. Go to **Creator Dashboard**
3. Click the **Bookings Received** tab

**Expected:**
- List shows each booking with: user name, session title, booking date, status
- Cancelled bookings (if any) show a Cancelled status badge
- Confirmed bookings show a Confirmed status badge

---

## 4. Permission & Security Flows

---

### 4.1 User Cannot Access Creator Dashboard

**Goal:** Users with the "user" role cannot reach creator-only pages.

**Steps:**
1. Log in as a **User** role account
2. Manually type `http://localhost/creator` in the address bar and press Enter

**Expected:**
- Redirected away (to home or a "not authorized" page)
- Creator Dashboard content is never shown

---

### 4.2 Creator Cannot Book a Session

**Goal:** Creators are blocked from booking sessions (only Users can book).

**Steps:**
1. Log in as a **Creator** role account
2. Visit `http://localhost` (home catalog)
3. Click a session card → go to session detail page
4. Try to click **Book Now** (or observe the UI)

**Expected:**
- Either the Book Now button is hidden/disabled for Creators
- Or clicking it returns an error: "Only users can book sessions" (or similar)
- No booking is created

---

### 4.3 Unauthenticated User Cannot Book

**Goal:** Booking requires authentication.

**Steps:**
1. Open a fresh incognito window (no login)
2. Visit `http://localhost` → click a session
3. On the session detail page, click **Book Now**

**Expected:**
- Redirected to login / GitHub OAuth
- No booking created

---

### 4.4 Creator Cannot Edit Another Creator's Session

**Goal:** A Creator can only edit/delete their own sessions.

**Setup:** Have two Creator accounts. Creator A creates a session.

**Steps:**
1. Log in as **Creator B**
2. Note the session ID of Creator A's session (visible in URL or catalog)
3. In your terminal run:
   ```bash
   curl -X PATCH http://localhost/api/sessions/creator/<session-id>/ \
     -H "Authorization: Bearer <creator-b-token>" \
     -H "Content-Type: application/json" \
     -d '{"price": 999}'
   ```

**Expected:**
- Response: `403 Forbidden`
- Session price is unchanged

---

### 4.5 User Cannot Cancel Another User's Booking

**Goal:** A User can only cancel their own bookings.

**Setup:** User A books a session. Note the booking ID from their dashboard or API.

**Steps:**
1. Log in as **User B**, get their JWT access token
2. Run:
   ```bash
   curl -X DELETE http://localhost/api/bookings/<user-a-booking-id>/cancel/ \
     -H "Authorization: Bearer <user-b-token>"
   ```

**Expected:**
- Response: `403 Forbidden` or `404 Not Found`
- User A's booking is untouched

---

## 5. Rate Limiting

---

### 5.1 Booking Endpoint Rate Limit (10 requests/min)

**Goal:** The booking endpoint rejects more than 10 requests per minute from the same client.

**Steps:**
1. Log in as User, get your access token from browser DevTools (Application → Local Storage → `access`)
2. Run this in your terminal (replace `<token>` and `<session-id>`):
   ```bash
   for i in {1..12}; do
     echo -n "Request $i: "
     curl -s -o /dev/null -w "%{http_code}\n" \
       -X POST http://localhost/api/bookings/sessions/<session-id>/book/ \
       -H "Authorization: Bearer <token>"
   done
   ```

**Expected:**
- Requests 1–10: `200` (success) or `400` (already booked / no spots) — but NOT `429`
- Requests 11–12: `429 Too Many Requests`

---

## 6. Quick Smoke Test (Full End-to-End in ~10 minutes)

Run through this sequence to validate the entire app in one pass:

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign up as Creator (Account A) | Lands on Creator Dashboard |
| 2 | Create 2 sessions (capacity 5 and capacity 1) | Both appear in public catalog |
| 3 | Logout | Returned to home, logged out |
| 4 | Sign up as User (Account B, incognito or second browser) | Lands on home catalog |
| 5 | Book the capacity-5 session | Success toast, spots = 4 |
| 6 | Try booking it again | Error: already booked |
| 7 | Go to My Dashboard | Booking visible under Upcoming |
| 8 | Cancel the booking | Booking gone, spots restored to 5 |
| 9 | Book the capacity-1 session | Success, spots = 0 |
| 10 | Sign in with a third account (or same, incognito) | Try to book the full session → error |
| 11 | Log back into Creator (Account A) | Check Bookings Received tab |
| 12 | Verify booking from User B is listed | Booking shown with user details |
| 13 | Edit the capacity-5 session, change price | Price updates in catalog |
| 14 | Delete the capacity-5 session | Gone from catalog and dashboard |

---

## Notes

- **JWT tokens** can be found in browser DevTools → Application → Local Storage if you need them for curl testing
- **Admin panel** is at `http://localhost/admin` — create a superuser with `docker compose exec backend python manage.py createsuperuser` to inspect DB state during testing
- **Container logs** for debugging: `docker compose logs backend -f` or `docker compose logs frontend -f`
