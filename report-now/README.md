# ReportNow – Citizen Issue Reporting Platform

ReportNow is a full-stack Next.js application for capturing, triaging, and resolving citizen-reported municipal issues. The platform blends geospatial capture, AI-assisted categorisation, and collaborative workflows to help Singapore agencies respond quickly and transparently.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Database & Prisma Workflow](#database--prisma-workflow)
- [AI Services](#ai-services)
- [Styling & UI System](#styling--ui-system)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Production Build & Deployment](#production-build--deployment)
- [Project Structure](#project-structure)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Contributing](#contributing)
- [Resources](#resources)
- [License](#license)

---

## Overview

ReportNow brings together everything required to manage real-world service requests:

- **Rapid Capture:** Citizens report issues with location, media uploads, and contextual metadata.
- **Smart Triage:** AI categorisation and duplicate detection reduce manual sorting and ensure the right government agency is notified.
- **Transparent Resolution:** Role-based dashboards, notifications, timelines, and reviews keep stakeholders aligned from submission to closure.

---

## Key Features

- Issue reporting with geocoding, media attachments, and SingPass-style authentication flows.
- AI-generated agency routing using OpenAI Chat Completions.
- Duplicate detection to merge overlapping submissions automatically.
- Administrative dashboards for case management, invite workflows, and status tracking.
- Review, timeline, and notification modules for citizen feedback and transparency.
- Comprehensive automated testing and Word-formatted IEEE 829 QA documentation.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router) with React 19 and Turbopack.
- **Backend/API:** Next.js route handlers with Prisma ORM.
- **Database:** PostgreSQL (compatible with MySQL or SQLite for local prototyping).
- **Authentication:** NextAuth (Credentials provider, JWT sessions).
- **Styling:** Tailwind CSS 4, shadcn/ui primitives, custom utility helper `cn`.
- **Mapping:** Leaflet & React Leaflet for geospatial interactions.
- **AI Services:** OpenAI Chat Completions (`gpt-5-mini`) for categorisation and duplicate detection.
- **Tooling:** ESLint 9, Jest 29, python-docx, dotenv CLI.

---

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm (or pnpm/yarn/bun)
- PostgreSQL instance (local Docker or managed service)
- Python 3.10+ (for generating Word QA reports)
- Git for version control

### Installation

```bash
git clone <repository-url>
cd report-now
npm install
```

---

## Environment Configuration

Create `.env` and `.env.test` at the project root. Key variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/reportnow"
NEXTAUTH_SECRET="dev-secret"
OPENAI_API_KEY="sk-..."
ENABLE_DUPLICATE_DETECTION=true
DUPLICATE_MODEL="gpt-5-mini"
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=...
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="ReportNow <no-reply@reportnow.sg>"
```

See `.env` and `.env.test` in the repo for a full template. Keep secrets out of version control.

---

## Development

Start the local development server (defaults to http://localhost:3000):

```bash
npm run dev
```

Useful scripts:

```bash
npm run lint              # ESLint checks
npm run test              # Jest test suite (runInBand)
```

---

## Database & Prisma Workflow

1. **Configure** `DATABASE_URL` in `.env`.
2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```
3. **Run Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Seed / Inspect**
   - Add seeding scripts as required.
   - `npx prisma studio` to inspect data.

Prisma models live in `prisma/schema.prisma` covering users, issues, reviews, and invites.

---

## AI Services

### Categorisation (`src/lib/actions.js`)
- Accepts title, description, and optional image URLs.
- Uses OpenAI to return a single agency acronym (e.g., `NEA`, `LTA`).
- Validates inputs and rethrows errors for higher-level handling.

### Duplicate Detection (`src/lib/duplicate-detection.js`)
- Builds a prompt comparing the new issue with recent submissions.
- Expects JSON response to determine duplicates.
- Updates `duplicateId` / `duplicateReason` fields via Prisma.
- Controlled by `ENABLE_DUPLICATE_DETECTION` and `DUPLICATE_MODEL` env vars.

For local tests, OpenAI calls are mocked to avoid external requests.

---

## Styling & UI System

- Tailwind CSS 4 configuration (`tailwind.config.mjs`).
- `src/styles/globals.css` imports Tailwind base/components/utilities.
- shadcn/ui components and custom modules under `src/components`.
- `cn` helper merges class names using `clsx` and `tailwind-merge`.
- Map UI built on Leaflet + React Leaflet for issue geolocation.

---

## Testing & Quality Assurance

### Automated Tests

- Located in `src/app/api/**/route.test.js`, `src/lib/*.test.js`, and `tests/`.
- Mocks Prisma, OpenAI, Cloudinary, and NextAuth to keep tests deterministic.
- `jest.config.js` wraps `next/jest`; `jest.setup.js` loads `.env.test` and polyfills (`TextEncoder`, `File`, etc.).
- Coverage snapshot (30 Oct 2025): **92.82% statements / 74.71% branches / 93.47% functions / 93.70% lines**.

Run the full suite:

```bash
npm run test
npx jest --coverage --runInBand
```

### QA Documentation

- `tests/test-plan.md` – IEEE 829-compliant test plan.
- `tests/test-cases.md` – Catalogue mapped to requirement IDs.
- `tests/requirements-coverage.md` – Requirements traceability matrix.

---

## Production Build & Deployment

Create an optimised build:

```bash
npm run build
npm run start   # serve production build
```

### Deployment Targets

- **Vercel:** Zero-config hosting tailored for Next.js.
- **Self-Hosted:** Containerise the app, provide environment variables, connect to managed PostgreSQL, and run `npm run start`.
- Ensure secrets (OpenAI, Cloudinary, SMTP, NextAuth) are set in the deployment environment.

---

## Project Structure

```
report-now/
├─ prisma/                 # Prisma schema & migrations
├─ public/                 # Static assets
├─ reports/                # QA documents
├─ scripts/                # Utility scripts (e.g., report generator)
├─ src/
│  ├─ app/                 # App Router pages & API routes
│  ├─ components/          # UI components and layout sections
│  ├─ lib/                 # Utilities, AI integrations, helpers
│  └─ styles/              # Tailwind/global styling
├─ tests/                  # QA documentation + supporting tests
├─ jest.config.js
├─ jest.setup.js
└─ package.json
```

---

## Continuous Integration

Recommended CI workflow (GitHub Actions / GitLab CI / Azure Pipelines):

1. Install dependencies (`npm ci`).
2. Run lint checks (`npm run lint`).
3. Execute tests (`npm run test` and `npx jest --coverage --runInBand`).
4. Build and deploy upon success.

Vercel Deploy Previews can be tied to pull requests for real-time UI validation.

---

## Troubleshooting & FAQ

**Issue:** AI categorisation fails locally.  
**Fix:** Ensure `OPENAI_API_KEY` is set. Use mocks or disable features via `ENABLE_DUPLICATE_DETECTION=false` when offline.

**Issue:** Prisma migrations failing.  
**Fix:** Verify `DATABASE_URL`, run `npx prisma migrate resolve`, or reset with `npx prisma migrate reset` (dev only).

**Issue:** Tailwind classes not applying.  
**Fix:** Ensure `tailwind.config.mjs` content paths match actual locations and that `globals.css` imports Tailwind directives.

**Issue:** Cloudinary upload errors.  
**Fix:** Confirm `CLOUDINARY_*` env vars; in tests Cloudinary is mocked, so production-only issues usually relate to credentials.

---

## Contributing

Contributions are encouraged! To contribute:

1. Fork the repository.
2. Create a feature or bugfix branch.
3. Implement changes, update tests/documentation.
4. Run `npm run lint` and `npm run test`.
5. Open a pull request summarising your changes and referencing related issues.

Please avoid committing real secrets or personal data.

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Leaflet / React Leaflet](https://react-leaflet.js.org/)
- [NextAuth.js](https://next-auth.js.org/)

---

## License

ReportNow is released under the [MIT License](LICENSE). Contributions are accepted under the same terms.

---