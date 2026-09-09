# Project TODO & Development Roadmap

**Project Title:** Web-Based Waste and Refuse Management System for Ikere-Ekiti Residents  
**Tech Stack:** Full-Stack Next.js (App Router), PostgreSQL, Prisma ORM, Leaflet.js (OpenStreetMap), Tailwind CSS  
**Scope Adjustments:** Map-based coordinate picking (no live GPS truck tracking), No payment gateway integration (final-year project scope).

---

## Design Instruction

Use the admin-dashboard as a boilerplate for the UI, the dashboard should have the same look and feel with the pages in the admin-dashboard project at the root directory of this project. Just use the folder as an prototype to follow for the UI and UX only.

## Phase 1: Environment Setup & Database Architecture

- [x] **1.1 Project Initialization**
  - [x] Initialize Next.js project with App Router and TypeScript.
  - [x] Configure Tailwind CSS and Lucide React (or similar icon library) for mobile-first responsive UI.
  - [x] Set up version control (Git repository and GitHub backup).
- [x] **1.2 Database & ORM Configuration**
  - [x] Provision PostgreSQL database (local or cloud-hosted via Supabase/Neon).
  - [x] Configure Prisma ORM connection.
  - [x] Define Database Schema:
    - [x] `User` model (Fields: `id`, `name`, `email`, `password_hash`, `role` [RESIDENT, ADMIN, CREW], timestamps).
    - [x] `WasteReport` model (Fields: `id`, `user_id`, `category`, `description`, `image_url`, `latitude`, `longitude`, `quarter` [Uro, Oke-Osun, Odo-Oja, Ogbontioro, Olowo-Ijesa], `status` [PENDING, ASSIGNED, RESOLVED], timestamps).
    - [x] `PickupSchedule` model (Fields: `id`, `quarter`, `day_of_week`, `crew_assigned`, timestamps).
  - [x] Run initial database migrations and seed default admin accounts and collection schedules.

---

## Phase 2: Core Backend & API Development (Next.js Route Handlers / Server Actions)

- [x] **2.1 Authentication Module**
  - [x] Implement user registration and login endpoints with secure password hashing (bcrypt).
  - [x] Set up session/JWT authentication middleware for role-based route protection (Resident vs. Admin/Crew).
- [x] **2.2 Waste Reporting Endpoints**
  - [x] Create API route/Server Action to handle form submissions (multipart/form-data for images).
  - [x] Integrate cloud file storage (Vercel Blob, Cloudinary, or Supabase Storage) for resident-submitted waste photographs.
  - [x] Build endpoints to fetch reports filtered by user ID or admin quarter filters.
- [x] **2.3 Admin & Status Management Endpoints**
  - [x] Build API route for administrators to update report status (`PENDING` → `ASSIGNED` → `RESOLVED`).
  - [x] Build API route for fetching aggregated system analytics (total complaints, resolution rates).

---

## Phase 3: Frontend User Portal (Residents)

- [x] **3.1 Public Landing & Schedule Page**
  - [x] Design a clean, mobile-responsive landing page outlining the system's purpose for Ikere residents.
  - [x] Implement the Sanitation & Collection Schedule view categorized by the five major quarters (Uro, Oke-Osun, Odo-Oja, Ogbontioro, Olowo-Ijesa).
- [x] **3.2 Waste Reporting Interface**
  - [x] Build a mobile-optimized multi-step form for reporting waste accumulation or illegal dumping.
  - [x] Implement camera/file upload input for photographic evidence.
  - [x] **Map Integration:** Embed Leaflet.js / React-Leaflet to allow residents to click and pin exact locations on a map of Ikere-Ekiti.
- [x] **3.3 Resident Dashboard**
  - [x] Create a personal dashboard tracking submitted reports with real-time status badges (Pending, Assigned, Resolved).

---

## Phase 4: Administrative Dashboard & GIS Mapping

- [x] **4.1 Admin Layout & Overview**
  - [x] Build protected admin layout with sidebar navigation and metrics summary cards (Total Reports, Pending Issues, Resolved Issues).
- [x] **4.2 Report Management Table & Filtering**
  - [x] Implement tabular view of all incoming complaints with filters for quarters and status.
  - [x] Add action controls allowing admins to update status and assign collection crews.
- [x] **4.3 Admin GIS Map Visualization**
  - [x] Embed Leaflet.js dashboard map displaying clustered markers for all active waste reports across Ikere quarters to assist manual route planning.

---

## Phase 5: Testing, Optimization & Documentation

- [x] **5.1 Testing & Quality Assurance**
  - [x] Perform unit testing on API routes and database queries.
  - [x] Conduct User Acceptance Testing (UAT) simulating mobile network constraints and responsive layouts on low-end smartphones.
  - [x] Fix UI bugs, layout overflows, and form validation edge cases.
- [x] **5.2 Deployment & Final Polish**
  - [x] Deploy Next.js application to production platform (Vercel or custom VPS).
  - [x] Configure environment variables (`DATABASE_URL`, storage credentials, authentication secrets).
  - [x] Prepare project documentation, user manual, and system architecture report for academic defense.
