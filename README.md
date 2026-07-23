# ISMS-Flow Compliance Tracker

An open-source, lightweight web application designed to track, organize, and manage compliance with the **ISO/IEC 27001:2022** standard. It functions as an interactive compliance workspace that maps security controls, policies, risks, and evidence.

---

## Key Features

1. **Compliance Dashboard**
   - Live readiness maturity score based on completed clauses and Annex controls.
   - Maturity progress trends.
   - Interactive 5x5 Likelihood x Impact Risk Matrix plotting active risks.

2. **Clause Tracking (Sections 4 - 10)**
   - Interactive checklist tracker for all core ISO 27001 standard clauses.
   - Detail drawers containing implementation guidelines and objective text.

3. **Annex A Controls Library**
   - Full support for the 93 Annex A controls in the ISO 27001:2022 revision.
   - Categorized into *Organizational*, *People*, *Physical*, and *Technological* controls.

4. **Centralized Evidence Mapping Hub**
   - Pre-mapped ISO 27001 compliance evidence requirements for every control and clause.
   - Centralized document portal to link external assets (SharePoint, Trust Portals, Google Drive) with automatic requirements guidance.

5. **Risk Register**
   - Identify, evaluate, and mitigate organization-wide security risks.
   - Computes inherent and residual risk scores using a standard 5x5 matrix.

6. **Statement of Applicability (SoA) Builder**
   - Seamlessly include/exclude controls with custom applicability justifications.

7. **Audit Registry**
   - Log internal/external audits, record findings, and track remediation tasks.

8. **Identity & Access Management (IAM)**
   - Administrative portal to manage workspace settings, scope definitions, and user permissions.
   - Supports role-based access:
     - **Admin**: Full read/write access and user account management.
     - **Monitor**: Read-only access to all dashboards and documents.

---

## Technology Stack

- **Framework**: Next.js (React App Router)
- **Styling**: Vanilla CSS (Custom Responsive Theme)
- **Database / ORM**: Prisma ORM with a lightweight SQLite database

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (installed with Node)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/takke2607/isms-flow.git
   cd isms-flow
   ```

2. **Install Dependencies**
   Install the workspaces packages from the root directory:
   ```bash
   npm install
   ```

3. **Setup Database**
   Initialize the SQLite database schema and run the seed script:
   ```bash
   cd apps/web
   npx prisma migrate dev --name init
   npx prisma db seed
   cd ../..
   ```

4. **Run the Application**
   You can start the Next.js development server using the root convenience script:
   ```bash
   .\start.bat
   ```
   Or run the npm script directly:
   ```bash
   npm run dev
   ```
   The portal will be active at [http://localhost:3000](http://localhost:3000).

---

## Access Credentials

| Role | Default Username | Default Password | Default Email |
| :--- | :--- | :--- | :--- |
| **Global Admin** | `admin` | `admin@123` | `admin@example.com` |
| **Monitor User** | `monitor` | `password` | `monitor@example.com` |

*Note: Logged-in users can update their username and password at any time via the **Settings -> My Profile** tab.*

---

## License

This project is open-source and available under the MIT License.
