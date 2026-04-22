# Divelog

A full-stack web app for logging scuba dives. Built with React on the frontend and a Node.js REST API on the backend.

**Live app:** https://divelog-client.onrender.com
**API docs (Swagger):** https://divelog-api.onrender.com/docs

---

## Tech stack

**Frontend**
- React + Vite
- React Router
- Vanilla CSS

**Backend**
- Node.js + Express
- PostgreSQL (Supabase)
- JWT authentication (jsonwebtoken + bcryptjs)
- Input validation with Zod
- Swagger / OpenAPI 3.0 documentation
- Deployed on Render

---

## Features

- Register and log in with JWT authentication
- Log dives with depth, duration, visibility, water temp and notes
- Add a dive team with per-dive roles (diver, tender, standby diver, dive leader)
- Dashboard with aggregated stats — total dives, deepest dive, total bottom time, favourite site
- Logbook with filtering by location and role
- Public dive sites endpoint (no auth required)

---

## API endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, receive JWT |

### Dives (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dives` | List your dives (supports `?location=`, `?date_from=`, `?date_to=`, `?role=`) |
| POST | `/dives` | Log a new dive (with team) |
| GET | `/dives/stats` | Aggregated statistics |
| GET | `/dives/:id` | Single dive with team |
| DELETE | `/dives/:id` | Delete a dive |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sites` | List dive sites (no auth) |

---

## Running locally

### Backend

```bash
git clone https://github.com/Dave92117/divelog-api.git
cd divelog-api
npm install
cp .env.example .env
# Add your Supabase DATABASE_URL and a JWT_SECRET to .env
npm run dev
```

API runs at `http://localhost:3000`
Swagger UI at `http://localhost:3000/docs`

### Frontend

```bash
cd client
npm install
# Create client/.env with: VITE_API_URL=http://localhost:3000
npm run dev
```

Frontend runs at `http://localhost:5173`

### Database setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run `migrations/001_initial.sql` in the Supabase SQL Editor
4. Copy the Session Pooler connection string into your `.env`

---

## Example requests

**Register**
```bash
curl -X POST https://divelog-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"David","email":"david@example.com","password":"secret123"}'
```

**Log a dive**
```bash
curl -X POST https://divelog-api.onrender.com/dives \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-08-14",
    "location": "Ågotnes pier",
    "depth_m": 28,
    "duration_min": 45,
    "my_role": "diver",
    "visibility_m": 12,
    "water_temp_c": 14,
    "notes": "Spotted a seal",
    "team": [
      { "name": "Kjetil Haugen", "role": "standby_diver" },
      { "name": "Ole Berg", "role": "dive_leader" },
      { "name": "Marte Sætre", "role": "tender" }
    ]
  }'
```
