# Web-Based Waste and Refuse Management System for Ikere-Ekiti Residents

A modern, full-stack municipal environmental sanitation platform designed for Ikere-Ekiti residents and local government authorities. The system streamlines refuse collection reporting, quarter-based schedule tracking, and GIS route planning for evacuation crews.

---

## 🚀 Key Features

### 1. Resident Portal
- **Interactive Multi-Step Reporting:** Report waste accumulation and illegal dumpsites with category selection, description, and landmarks.
- **Photographic Verification:** Upload or snap camera evidence of waste piles to assist crew resource planning.
- **Leaflet OpenStreetMap Coordinate Picker:** Pinpoint coordinates directly on a map centered on Ikere-Ekiti with GPS "Locate Me" support.
- **Quarter Sanitation Schedules:** View weekly collection timetables categorized across Ikere-Ekiti's five major quarters (*Uro, Oke-Osun, Odo-Oja, Ogbontioro, Olowo-Ijesa*).
- **Personal Incident Tracking:** Real-time tracking of submitted reports with status updates (`PENDING`, `ASSIGNED`, `RESOLVED`).

### 2. Administrative & GIS Command Console
- **Executive Metrics:** Summary cards for total complaints, pending dispatches, active assignments, and resolution rates.
- **GIS Heatmap & Route Visualizer:** Clustered, color-coded map markers representing active refuse sites across Ikere-Ekiti to facilitate manual truck route planning.
- **Tabular Report Management:** Filter reports by quarter and status, assign collection crews, add operational dispatch notes, and mark incidents resolved.
- **Sanitation Timetable & Crew Directory:** Manage weekly pickup schedules and municipal sanitation personnel assignments.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) with React 19 and TypeScript
- **Styling:** Tailwind CSS v4, Base UI, Shadcn UI patterns
- **Database & ORM:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **GIS Mapping:** [Leaflet.js](https://leafletjs.com/) with OpenStreetMap tiles
- **Authentication:** Edge-compatible JWT sessions via `jose` with `bcryptjs` password hashing

---

## 🔑 Demo & Evaluation Accounts

For academic review, testing, and evaluation:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@ikerewaste.ng` | `Admin@12345` | `/admin` (Full Command Center) |
| **Field Crew** | `crew@ikerewaste.ng` | `Crew@12345` | `/admin` (Crew Management) |
| **Resident** | `resident@ikerewaste.ng` | `Resident@12345` | `/dashboard` (Resident Portal) |

*A one-click demo credential filler is also provided on the `/login` screen.*

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v20+ or v24)
- PostgreSQL running locally or cloud-hosted (e.g., Supabase / Neon)
- `pnpm` (or npm)

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/waste_system_db?schema=public"
JWT_SECRET="your-secure-jwt-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Seeding
Push the Prisma schema and seed default Ikere quarters, admin accounts, and schedules:
```bash
# Push database schema
npx prisma db push

# Seed default accounts and schedules
pnpm run seed
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Ikere-Ekiti Municipal Quarters Covered

1. **Uro Quarter:** Northern residential and educational sector (Afao Road corridor).
2. **Oke-Osun Quarter:** Central commercial and market hub.
3. **Odo-Oja Quarter:** Downtown civic center and Post Office roundabout.
4. **Ogbontioro Quarter:** Southern expansion and residential neighborhoods.
5. **Olowo-Ijesa Quarter:** Eastern artisanal and suburban community.

---

## 📋 License & Attribution
Final-Year Project in Computer Engineering / Information Systems.  
Designed for Ikere Local Government Area Sanitation Department.
