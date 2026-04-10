# Divelog API

A REST API for logging scuba dives, built with Node.js, Express, and PostgreSQL.

**Live API:** _add your Render URL here_  
**Swagger docs:** _your-render-url_/docs

---

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Zod
- **Docs:** Swagger / OpenAPI 3.0
- **Deployment:** Render

---

## Getting started locally

### 1. Clone and install

```bash
git clone https://github.com/yourusername/divelog-api.git
cd divelog-api
npm install
```

### 2. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and paste + run the contents of `migrations/001_initial.sql`
4. Go to **Project Settings → Database** and copy the **Connection string (URI)**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=any_long_random_string_here
PORT=3000
```

### 4. Run

```bash
npm run dev
```

API runs at `http://localhost:3000`  
Swagger UI at `http://localhost:3000/docs`

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

## Deploying to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Start command:** `npm start`
5. Add environment variables:
   - `DATABASE_URL` → your Supabase connection string
   - `JWT_SECRET` → a random secret
   - `NODE_ENV` → `production`
6. Deploy

---

## Example requests

### Register
```bash
curl -X POST https://your-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"David","email":"david@example.com","password":"secret123"}'
```

### Log a dive
```bash
curl -X POST https://your-api.onrender.com/dives \
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
