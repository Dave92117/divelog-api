# Divelog

A full-stack web app for logging dives. Built with React on the frontend and a Node.js REST API on the backend.

- **Live app:** https://divelog-client.onrender.com
- **API docs (Swagger):** https://divelog-api.onrender.com/docs

## Try it

Log in with the demo account. No sign-up needed.

- **Email:** `demo@example.com`
- **Password:** `DiveDemo2026`

The demo account has ten sample dives with dive teams, so the dashboard, logbook and dive details all show real data. If the demo data gets messy, [`seed/demo_seed.sql`](seed/demo_seed.sql) resets it.

> The app runs on Render's free tier. If nobody has used it for a while, the first load can take up to a minute while the server starts.

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
- Demo account with a re-runnable seed script

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

The API lives in the repo root and the React client in `client/`.

### Database

Create a PostgreSQL database (for example a free Supabase project) and run [`migrations/001_initial.sql`](migrations/001_initial.sql) to create the tables. To add the demo account, run [`seed/demo_seed.sql`](seed/demo_seed.sql) as well.

### Backend

Create a `.env` file in the repo root:

```bash
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret
```

Then start the API:

```bash
npm install
npm run dev
```

The API runs on http://localhost:3000, with Swagger docs at http://localhost:3000/docs.

### Frontend

```bash
cd client
npm install
npm run dev
```

The client calls `http://localhost:3000` by default. Set `VITE_API_URL` to point it at another API.

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
