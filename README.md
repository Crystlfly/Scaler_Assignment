# Trello Clone - Advanced Task Management Platform

An advanced, highly interactive task management application built with
the PERN stack, featuring real-time drag-and-drop and optimistic UI
rendering.

------------------------------------------------------------------------

## 🚀 Quick Start (Recommended)

The application is split into a monorepo containing a **client
(Vite/React)** and a **server (Node/Express)**.

### Prerequisites

-   Node.js installed
-   A PostgreSQL database (e.g., local, Neon.tech, or Supabase)

### Run Command

Open your terminal in the project root and run the following commands in
**two separate terminal windows**.

**Terminal 1 (Backend):**

``` bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend):**

``` bash
cd client
npm install
npm run dev
```

Access the application at:

    http://localhost:5173

------------------------------------------------------------------------

## ⚡ Setup & Seeding

The application relies on **Prisma ORM** to sync the database schema.

The command below automatically creates all tables (`Boards`, `Lists`,
`Cards`, `Users`, etc.) in your PostgreSQL database:

``` bash
npx prisma db push
```

### Auto-Seeding Logic

When a user creates a new **Board** from the UI, the backend
automatically seeds that board with three default lists:

-   TODO\
-   In Progress\
-   Done

These lists are inserted in the correct **fractional order**.

------------------------------------------------------------------------

## 🛠 Tech Stack

**Frontend** - React.js (Vite) - Tailwind CSS - Axios

**Backend** - Node.js - Express.js

**Database & ORM** - PostgreSQL - Prisma ORM

**Interactions** - `@hello-pangea/dnd` for fluid drag-and-drop

------------------------------------------------------------------------

## ✨ Key Features

-   **Fluid Drag-and-Drop:** Reorder lists and move cards between lists
    instantly using `@hello-pangea/dnd` and fractional indexing for
    optimized database writes.
-   **Optimistic UI:** State updates happen instantly on the client side
    before the server responds, providing a zero-latency, native-app
    feel.
-   **Advanced Filtering:** Filter tasks by due date status (Overdue,
    Due Soon) and assigned members using dynamic state arrays.
-   **Comprehensive Task Details:** Cards support descriptions,
    checklists, due dates, custom labels, file attachments, and a
    comment activity feed.
-   **Dynamic Board Management:** Create multiple boards, customize
    background colors, and auto-generate default lists (TODO, In
    Progress, Done) on initialization.
-   **Robust Data Architecture:** Utilizes a highly normalized
    PostgreSQL database with complex One-to-Many and Many-to-Many
    relationships handled via Prisma ORM.

------------------------------------------------------------------------

## 📂 Project Structure

    client/src/components/
        Board.jsx
        List.jsx
        Card.jsx

    client/src/components/ModalComponents/
        DatePicker.jsx
        LabelPicker.jsx
        MemberPicker.jsx
        AttachmentPicker.jsx

    server/prisma/
        schema.prisma

    server/routes/
        boards.js
        cards.js
        lists.js

-   **client/src/components/** → Core UI rendering components.
-   **client/src/components/ModalComponents/** → Modular pickers for the
    card modal using click-outside-to-close logic.
-   **server/prisma/schema.prisma** → Source of truth for the database
    schema.
-   **server/routes/** → Express API routes handling CRUD operations.

------------------------------------------------------------------------

## 👤 Author

**Anusha Singh**
