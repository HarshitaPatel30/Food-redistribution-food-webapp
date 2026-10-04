# Food Redistribution Platform

A full-stack demo that helps donors offer surplus food and lets recipient organizations claim it before it expires. The React dashboard and listing screens use a Spring Boot REST API, with application records persisted through JPA to MySQL.

## Problem solved

Usable surplus food is often discarded while nearby community organizations need donations. This project demonstrates a small, traceable workflow for publishing available food, claiming it, and confirming pickup or handoff.

## Features implemented

- Create and browse food listings with quantity, category, location, and expiry time.
- Persist listing and claim records through the backend API.
- Allow a recipient to claim an available listing; reject duplicate, unavailable, or expired claims.
- Mark expired available listings as `EXPIRED` during reads and dashboard aggregation, and through a scheduled check every five minutes.
- Create a one-time verification token with a claim and render it as a QR code in the browser.
- Verify the token against the persisted claim. Successful verification changes the claim to `VERIFIED` and the listing to `DELIVERED`; reuse is rejected.
- Load dashboard totals from the backend.

## Architecture

```text
React + Vite browser app
        │ HTTP JSON (VITE_API_URL)
        ▼
Spring Boot REST controllers
        │
        ▼
Services: listing, claim, expiry, verification, dashboard
        │ Spring Data JPA
        ▼
MySQL database (H2 for automated integration tests)
```

The current frontend has a demo role chooser, but there is no backend identity or authorization layer. Listings and claims are shared demo data.

## Tech stack

- Frontend: React, Vite, React Router, JavaScript, npm
- Backend: Java 17, Spring Boot 3.5.9, Spring Web, Spring Data JPA, Maven Wrapper
- Database: MySQL at runtime; H2 for backend tests
- Verification display: browser-generated QR image containing the backend-issued claim token

## API workflow

1. The donor submits a listing with a future expiry time to `POST /api/food/add`.
2. The frontend fetches listings from `GET /api/food/all`; dashboard counts come from `GET /api/dashboard/stats`.
3. A recipient submits `{ "foodId": 1, "ngoName": "Example NGO", "contactInfo": "contact@example.org" }` to `POST /api/claim/add`.
4. The backend checks availability and expiry, persists the claim and verification token, and changes the listing status to `CLAIMED`.
5. The backend rejects a second claim for that listing. Expired listings cannot be claimed.

Primary endpoints:

- `GET /api/food/all`, `GET /api/food/{id}`, `GET /api/food/status/{status}`
- `POST /api/food/add`
- `GET /api/claim/all`, `GET /api/claim/{id}`, `GET /api/claim/food/{foodId}`
- `POST /api/claim/add`
- `POST /api/claim/verify/{token}`
- `GET /api/dashboard/stats`

## QR verification

A successful claim response includes a unique token. The frontend renders that token as a QR code. A user can read it with a separate QR reader and enter or paste the token on the Verify QR screen. That screen sends the token to `POST /api/claim/verify/{token}`; the backend looks up the persisted claim, rejects invalid or already-used tokens, and records successful verification and delivery status. The page does not scan QR images or access a camera.

## Expiry handling

The backend rejects a claim if the listing expiry time has passed, even if its saved status was still `AVAILABLE`. Expired available listings are persisted as `EXPIRED` when listings are read, dashboard statistics are requested, or the scheduled expiry task runs. All expiry decisions use the backend clock.

## Dashboard

The dashboard requests counts and summaries from `GET /api/dashboard/stats`; these values are computed from persisted listings and claims. The frontend does not use localStorage as the source of application records. The demo role choice is stored locally and is not authentication.

## Test and build results

The backend integration tests use an in-memory H2 database. They cover listing creation and retrieval, persisted claims, duplicate claim rejection, token verification and reuse rejection, delivered status, dashboard counts, and expiry rejection/status persistence.

Validation run on 2026-10-04:

- `backend\mvnw.cmd clean verify`: passed; 11 tests, 0 failures, 0 errors.
- `npm run build`: passed.
- `npm run lint`: passed.
- `npm audit`: passed; 0 vulnerabilities.
- `git diff --check`: passed.

## Local setup

Requirements:

- JDK 17
- MySQL 8 or a compatible MySQL server
- Node.js 20.19+ or 22.12+ and npm (required by Vite 7)

Create the database and a local application user:

```sql
CREATE DATABASE food_redistribution CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'food_app'@'localhost' IDENTIFIED BY 'choose-a-local-password';
GRANT ALL PRIVILEGES ON food_redistribution.* TO 'food_app'@'localhost';
```

The root `.env.example` documents backend variables; Spring Boot does not load `.env` automatically. Export these values in the backend process environment (replace the password with your local value):

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/food_redistribution'
$env:DB_USERNAME = 'food_app'
$env:DB_PASSWORD = 'your-local-password'
$env:SERVER_PORT = '8085'
$env:FRONTEND_URL = 'http://localhost:5173'
```

From the repository root, start the backend in one terminal:

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

In a second terminal, start the frontend:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. The frontend defaults to `http://localhost:8085` for the API. Set `VITE_API_URL` in the frontend environment before starting or building to use another API URL.

Run validation from the repository root:

```powershell
Set-Location backend
.\mvnw.cmd clean verify
Set-Location ..\frontend
npm ci
npm run build
npm run lint
npm audit
```

Hibernate currently uses `ddl-auto=update`, so the application expects a MySQL database and credentials supplied through the environment. H2 is configured for tests only.

## Limitations

- No authentication, account management, or backend authorization; the login/role chooser is only a frontend demo affordance.
- No camera access or in-app QR scanning; verification requires entering the token read from the displayed QR code.
- No live MySQL service, hosted deployment, or deployment pipeline has been verified.
- No database migration tool is configured; schema changes are handled with Hibernate `ddl-auto=update`.
- Records are not scoped to a donor or recipient identity.

## Security note

Never commit `.env` files or real credentials. Use environment variables or a deployment secrets manager; `.env.example` files contain placeholders only. Credential values were present in earlier Git history for this repository lineage. Removing them from the current files does not erase them from history: rotate any affected credentials and clean repository history before sharing or publishing a clone. No credentials are included in this README.
