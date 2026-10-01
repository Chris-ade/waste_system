# System Architecture & Database ER Diagrams

This document details the architectural layout, component boundaries, and database entity-relationship schema for the **Waste Management System**.

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Next.js)"]
        subgraph PublicFacing["Resident & Public Portal"]
            Home["Landing Page (/)"]
            ReportPage["Report Incident (/report)"]
            AuthPages["Auth (/login, /register)"]
            Dashboard["Resident Dashboard (/dashboard)"]
        end
        subgraph AdminFacing["Admin Portal (/admin)"]
            AdminOverview["Admin Dashboard (/admin)"]
            AdminReports["Reports Data Table (/admin/reports)"]
            AdminMap["GIS Incident Map (/admin/map)"]
            AdminCrew["Crew Management (/admin/crew)"]
            AdminSchedules["Pickup Schedules (/admin/schedules)"]
        end
        UIElements["UI Libraries & Components:<br/>• Tailwind CSS<br/>• Shadcn UI<br/>• TanStack Table<br/>• Leaflet & React-Leaflet Map"]
    end

    subgraph SecurityLayer["Security & Gateway Layer"]
        Middleware["Next.js Middleware (Edge Runtime)<br/>• Session Verification (JWT)<br/>• Role-Based Access Control (RBAC)<br/>• Auth Redirections"]
    end

    subgraph APILayer["Backend & API Layer (Next.js Route Handlers)"]
        AuthAPI["/api/auth<br/>(login, register, logout, me)"]
        ReportsAPI["/api/reports & /api/reports/:id<br/>(CRUD, triage, assignments, status)"]
        UploadAPI["/api/upload<br/>(Evidence photo upload)"]
        CrewAPI["/api/crew<br/>(Crew member management)"]
        SchedulesAPI["/api/schedules<br/>(Quarterly pickup schedules)"]
        AnalyticsAPI["/api/admin/analytics<br/>(KPI metrics, incident counts)"]
    end

    subgraph DataLayer["Persistence & Storage Layer"]
        Prisma["Prisma ORM"]
        Postgres[("PostgreSQL Database")]
        LocalUploads[("Local File Storage<br/>/public/uploads")]
    end

    %% Client Interactions through Middleware
    PublicFacing --> Middleware
    AdminFacing --> Middleware

    %% Middleware forwarding to API Routes
    Middleware --> AuthAPI
    Middleware --> ReportsAPI
    Middleware --> UploadAPI
    Middleware --> CrewAPI
    Middleware --> SchedulesAPI
    Middleware --> AnalyticsAPI

    %% Route Handlers to Persistence Layer
    AuthAPI --> Prisma
    ReportsAPI --> Prisma
    CrewAPI --> Prisma
    SchedulesAPI --> Prisma
    AnalyticsAPI --> Prisma
    UploadAPI --> LocalUploads

    %% Prisma to Database
    Prisma --> Postgres
```

### Architectural Breakdown

| Layer                     | Technologies                                                                                                          | Responsibilities                                                                                                                                                                                                        |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client / Presentation** | Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide Icons, Shadcn UI / Base UI, Leaflet, TanStack React Table v8 | Provides responsive user interfaces for residents to file reports and track updates, as well as an administrative command center for incident triage, mapping, crew allocation, and schedule planning.                  |
| **Security & Routing**    | Next.js Middleware (`proxy.ts`), `jose`, `jsonwebtoken`                                                               | Intercepts incoming requests to validate authentication cookies/JWT tokens, enforces role-based access rules (e.g. restricting `/admin/*` to `ADMIN` roles), and handles automatic redirection for authenticated users. |
| **Backend API Services**  | Next.js Route Handlers (`app/api/*`)                                                                                  | Serves modular RESTful API endpoints handling authentication, report CRUD, multipart image uploads, crew management, schedules, and analytics aggregations.                                                             |
| **Persistence & Storage** | PostgreSQL, Prisma ORM, Local Disk (`/public/uploads`)                                                                | Handles structured relation storage with strict schema constraints, foreign key referential integrity, and local file storage for photo evidence.                                                                       |

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    %% Entities
    USER {
        string id PK "cuid()"
        string name "User full name"
        string email UK "Unique email address"
        string password_hash "Bcrypt hashed password"
        string phone "Optional contact number"
        Quarter quarter "Optional residential quarter"
        Role role "Enum: RESIDENT, ADMIN, CREW (default: RESIDENT)"
        datetime created_at "Timestamp of creation"
        datetime updated_at "Timestamp of last modification"
    }

    WASTE_REPORT {
        string id PK "cuid()"
        string user_id FK "Optional reference to reporter (User)"
        string category "Incident type (e.g. Organic, Hazardous)"
        string description "Optional details"
        string image_url "Optional path to uploaded photo evidence"
        float latitude "GPS latitude coordinate"
        float longitude "GPS longitude coordinate"
        Quarter quarter "Municipal zone (Enum)"
        string address "Optional street / landmark description"
        ReportStatus status "Enum: PENDING, ASSIGNED, RESOLVED"
        string crew_assigned_id FK "Optional reference to assigned crew (User)"
        string admin_notes "Internal triage / resolution notes"
        datetime resolved_at "Timestamp when marked as resolved"
        datetime created_at "Submission timestamp"
        datetime updated_at "Last update timestamp"
    }

    PICKUP_SCHEDULE {
        string id PK "cuid()"
        Quarter quarter "Target municipal quarter"
        string day_of_week "Day name (e.g. Monday, Friday)"
        string time_slot "Optional window (e.g. Morning, 08:00 - 12:00)"
        string crew_assigned "Optional legacy display label"
        string crew_user_id FK "Optional reference to assigned crew member (User)"
        boolean is_active "Active status (default: true)"
        datetime created_at "Creation timestamp"
        datetime updated_at "Last modification timestamp"
    }

    %% Relationships
    USER ||--o{ WASTE_REPORT : "submits (UserReports: userId -> id)"
    USER ||--o{ WASTE_REPORT : "assigned to (CrewReports: crewAssignedId -> id)"
    USER ||--o{ PICKUP_SCHEDULE : "operates (CrewSchedules: crewUserId -> id)"
```

---

## 3. Schema Reference & Enums

### Enums

#### `Role`

Defines authorization levels across the system:

- `RESIDENT`: Standard citizen account. Can submit reports with geolocation and photos, and track submitted incident statuses in their dashboard.
- `CREW`: Field team member dispatched to inspect, collect, and resolve reported incidents.
- `ADMIN`: Municipal supervisor with full privileges across reports, GIS maps, crew management, schedules, and analytics.

#### `Quarter`

Defines administrative municipal zones for targeted waste management:

- `URO`
- `OKE_OSUN`
- `ODO_OJA`
- `OGBONTIORO`
- `OLOWO_IJESA`

#### `ReportStatus`

Tracks the lifecycle of an incident:

- `PENDING`: Newly submitted incident awaiting triage by administrators.
- `ASSIGNED`: Incident verified and assigned to a sanitation crew member for pickup.
- `RESOLVED`: Waste collected, site cleared, and issue closed.

---

## 4. Key Relational Connections

1. **User as Reporter vs. Dispatched Crew Member**:
   - `User.reports` (`UserReports`): One-to-many relationship linking a resident to all incident reports they have submitted (`onDelete: SetNull`).
   - `User.assignedTasks` (`CrewReports`): One-to-many relationship linking a crew member (`Role = CREW`) to incidents dispatched to them for remediation (`onDelete: SetNull`).

2. **Pickup Route Assignments**:
   - `User.schedules` (`CrewSchedules`): One-to-many relationship linking a crew member to regular waste collection schedules assigned to their municipal quarter (`onDelete: SetNull`).
