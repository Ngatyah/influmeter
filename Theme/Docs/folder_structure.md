# FOLDER_STRUCTURE.md

## 🧠 Overview

This document outlines the recommended folder structure for the Influmeter platform. The project is organized into:

- `frontend/` – React (with Tailwind, ShadCN)
- `backend/` – NestJS (with PostgreSQL)
- `shared/` – Reusable contracts, types, utils
- `mobile/` – (Optional) Flutter app (phase 2)

---

## 📁 Root Directory

influmeter/
├── backend/
├── frontend/
├── mobile/ # (Optional Flutter app)
├── shared/ # Common DTOs, Enums, Interfaces
├── docs/ # Architecture, APIs, specs
├── .env # Root environment config
├── docker-compose.yml # Dev containers (Postgres, Redis)
├── README.md

## 🛠 backend/ (NestJS + PostgreSQL)

backend/
├── src/
│ ├── auth/ # JWT, OAuth, Guards, Passport strategies
│ ├── users/ # User CRUD (influencer + brand)
│ ├── influencers/ # Influencer-specific logic
│ ├── brands/ # Brand-specific logic
│ ├── campaigns/ # Campaign CRUD, participation
│ ├── content/ # Submission, approval, moderation
│ ├── discover/ # Matching engine, filters
│ ├── insights/ # AI summaries, performance metrics
│ ├── payments/ # Mpesa/Stripe integration
│ ├── notifications/ # WebSocket/push/email
│ ├── shared/ # Enums, constants, DTOs, interceptors
│ ├── database/ # TypeORM entities, seeds, migrations
│ ├── main.ts # App bootstrap
│ └── app.module.ts
├── test/ # e2e + unit tests
├── .env
├── tsconfig.json
├── package.json



## 🖥 frontend/ (React + Tailwind + ShadCN + Vite)

frontend/
├── src/
│ ├── components/ # Reusable UI (Button, Card, etc.)
│ ├── screens/
│ │ ├── auth/
│ │ ├── dashboard/
│ │ ├── campaign/
│ │ ├── discover/
│ │ ├── earnings/
│ │ ├── profile/
│ │ └── settings/
│ ├── layouts/ # Dashboard layout, auth layout, etc.
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Axios wrapper, auth logic
│ ├── context/ # AuthContext, ThemeContext
│ ├── router/ # React Router config
│ ├── assets/ # Images, logos
│ ├── themes/ # Tailwind config, dark mode
│ ├── types/ # TypeScript interfaces
│ └── main.tsx
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── .env
├── package.json


## 🔁 shared/

shared/
├── types/
│ ├── user.ts
│ ├── campaign.ts
│ ├── metrics.ts
│ └── enums.ts
├── dtos/
│ ├── influencer.dto.ts
│ ├── brand.dto.ts
│ └── campaign.dto.ts
├── constants.ts
├── validators/
│ └── joi-schemas.ts