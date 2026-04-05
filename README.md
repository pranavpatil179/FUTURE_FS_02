# ⚡ LeadFlow — Client Lead Management System (Mini CRM)

A full-stack CRM system for tracking and managing leads. Built with a modern, premium UI/UX, featuring a dynamic dark/light mode, vivid neon structural accents (`#00f0ff` & `#375fd8`), 3D analytics charts, and `Carvelo` typography.

## 🚀 Features

- **Lead Listing** — View all leads with name, email, company, source, status, and timestamps
- **Status Pipeline** — Navigate leads through logical pipeline stages: `New → Contacted → Converted`
- **Follow-up Notes** — Add timestamped notes directly to individual leads to preserve context
- **3D Analytics Dashboard** — Immersive 3D interactive charts for lead trends, pipeline breakdown, and source distribution
- **Theme Toggle** — Switch seamlessly between an electric Dark Neon UI and a clean Light workspace
- **Security Bypassed (Demo Mode)** — Authentication and login requirements have been removed for immediate portfolio review and dashboard access.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Recharts |
| Backend | Node.js + Express.js |
| Database | SQLite (via better-sqlite3) |

## ⚙️ Setup & Run (Local Development)

### 1. Seed the Database (first time only)
```bash
cd backend
npm run seed
```

### 2. Start the Backend
```bash
cd backend
npm run dev
# Runs on localhost:5001
```

### 3. Start the Frontend
```bash
cd frontend
npm run dev
# Vite runs on localhost:5174 (or 5173 depending on port availability)
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List leads (supports `?search=&status=&source=`) |
| GET | `/api/leads/stats` | Analytics summary |
| GET | `/api/leads/:id` | Single lead + notes |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead/status |
| POST | `/api/leads/:id/notes` | Add note |
| DELETE | `/api/leads/:id/notes/:noteId` | Delete note |
| DELETE | `/api/leads/:id` | Delete lead |

## 💼 Business Value

> *"I built this system to manage real clients."*

- Track every lead from the moment they are sourced from a website contact form or network.
- Never miss a follow-up with timestamped, chronological notes.
- Evaluate performance instantly through premium, immersive 3D chart analytics.
