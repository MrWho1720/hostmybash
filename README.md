# HostMyBash

A script hosting platform — like pastebin for bash scripts. Host scripts, get a URL, run them anywhere with `curl`.

```bash
bash <(curl -s https://yourname.endever.in/install-your-script)
```

---

## Features

- **Script Hosting** — Create, edit, and manage bash scripts via a web dashboard
- **Subdomain System** — Each user gets a subdomain (e.g. `yourname.endever.in`)
- **Raw Script Serving** — Scripts served as `text/plain`, directly usable with `curl | bash`
- **Slug-Based URLs** — Clean URLs like `/install-nginx`, `/setup-docker`
- **Visibility Controls** — Public, unlisted, or private scripts
- **Run Counter** — Track how many times each script has been curled
- **Authentication** — Session-based auth with bcrypt password hashing

---

## Architecture

```
Browser (Dashboard)              curl (any machine)
    |                                |
    | REST API                       | GET /slug
    v                                v
NGINX (TLS, Rate Limiting)     NGINX (Wildcard *.endever.in)
    |                                |
    v                                v
Next.js (:3000)                Next.js (:3000)
    |--- Dashboard UI               |--- Proxy detects subdomain
    |--- API Routes                  |--- Rewrites to /s/user/slug
    |--- Drizzle ORM                 |--- Returns raw text/plain
    |        |
    v        v
      PostgreSQL
```

---

## Tech Stack

| Component   | Technology               |
|-------------|--------------------------|
| Framework   | Next.js 16.2.2           |
| UI          | React 19, Tailwind CSS 4 |
| Language    | TypeScript 5             |
| Runtime     | Bun                      |
| ORM         | Drizzle ORM 0.45.2      |
| Database    | PostgreSQL               |
| Auth        | Lucia 3.2.2, bcrypt      |
| Validation  | Zod 4.3.6               |
| Proxy       | NGINX with Let's Encrypt |

---

## Project Structure

```
hostmybash/
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Login & register pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── scripts/              # Script list, detail, create
│   │   │   └── layout.tsx            # Auth-guarded dashboard
│   │   ├── api/
│   │   │   ├── auth/                 # register, login, logout, me
│   │   │   └── scripts/              # CRUD
│   │   ├── s/[username]/[slug]/      # Raw script endpoint
│   │   │   └── route.ts
│   │   ├── components/
│   │   │   └── Sidebar.tsx
│   │   ├── global-error.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── auth/                     # Lucia config, password hashing
│   │   ├── db/                       # Drizzle client & schema
│   │   └── validation/               # Zod schemas
│   └── proxy.ts                      # Subdomain routing middleware
├── deploy/
│   ├── nginx.conf                    # Wildcard subdomain NGINX config
│   └── hostmybash.service            # Systemd unit
├── drizzle.config.ts
├── package.json
└── .env.example
```

---

## Prerequisites

- **Bun** >= 1.0
- **PostgreSQL** >= 15
- **NGINX** (production)
- **Certbot** (for wildcard TLS via Let's Encrypt)

---

## Installation

### 1. Clone and install

```bash
git clone https://github.com/your-org/hostmybash.git
cd hostmybash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database URL and domain
```

### 3. Set up the database

```bash
sudo -u postgres createuser hostmybash -P
sudo -u postgres createdb hostmybash -O hostmybash
bun run drizzle-kit push
```

### 4. Run

```bash
# Development
bun dev

# Production
bun run build
bun run start
```

---

## Environment Variables

| Variable            | Description                  | Example                                                      |
|---------------------|------------------------------|--------------------------------------------------------------|
| `POSTGRES_HOST`     | Postgres server host         | `localhost`                                                  |
| `POSTGRES_PORT`     | Postgres server port         | `5432`                                                       |
| `POSTGRES_USER`      | Postgres username            | `hostmybash`                                                 |
| `POSTGRES_PASSWORD`  | Postgres user password       | `pass`                                                       |
| `POSTGRES_DB`        | Postgres database name       | `hostmybash`                                                 |
| `MAIN_HOST`    | Primary domain               | `endever.in`                                                 |
| `NODE_ENV`     | Environment mode             | `development` or `production`                                |

---

## Database Schema

| Table      | Description                                      |
|------------|--------------------------------------------------|
| `users`    | User accounts (email, username, password hash)   |
| `sessions` | Lucia auth sessions                              |
| `scripts`  | Hosted scripts (slug, content, visibility, etc.) |

---

## How It Works

### Subdomain Routing

1. User registers with username `alice`
2. DNS wildcard `*.endever.in` points to the server
3. `alice.endever.in/install-nginx` hits NGINX
4. Next.js proxy middleware detects subdomain `alice`
5. Rewrites request to `/s/alice/install-nginx`
6. Route handler looks up script, returns raw `text/plain`

### Visibility

| Level      | Dashboard | curl via URL | Listed publicly |
|------------|-----------|--------------|-----------------|
| **Public** | Yes       | Yes          | Yes             |
| **Unlisted** | Yes    | Yes          | No              |
| **Private** | Yes      | No           | No              |

---

## API Reference

### Authentication

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| POST   | `/api/auth/register` | Create account         |
| POST   | `/api/auth/login`    | Login                  |
| POST   | `/api/auth/logout`   | Destroy session        |
| GET    | `/api/auth/me`       | Get current user info  |

### Scripts

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | `/api/scripts`       | List your scripts      |
| POST   | `/api/scripts`       | Create new script      |
| GET    | `/api/scripts/[id]`  | Get script details     |
| PUT    | `/api/scripts/[id]`  | Update script          |
| DELETE | `/api/scripts/[id]`  | Delete script          |

### Raw Script (Public)

| Method | Endpoint                                    | Description          |
|--------|---------------------------------------------|----------------------|
| GET    | `https://username.endever.in/slug`          | Serve raw script     |
| GET    | `https://endever.in/s/username/slug`        | Direct raw endpoint  |

---

## Production Deployment

### 1. Build

```bash
bun run build
```

### 2. Wildcard DNS

Add an A record for `*.endever.in` pointing to your server IP.

### 3. Wildcard TLS Certificate

```bash
# Using Certbot with DNS challenge for wildcard
sudo certbot certonly --manual --preferred-challenges dns \
  -d endever.in -d '*.endever.in'
```

### 4. NGINX

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/hostmybash
sudo ln -sf /etc/nginx/sites-available/hostmybash /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> **Note:** The Next.js 14/15 App Router relies on chunked streaming. NGINX uses HTTP/1.0 for reverse proxying by default, which will cause Next.js streams to hang indefinitely. Ensure your NGINX proxy locations define `proxy_http_version 1.1;` and `proxy_set_header Connection "";` as demonstrated in the included `deploy/nginx.conf` file.


### 5. Systemd Service

```bash
sudo cp deploy/hostmybash.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now hostmybash
```

---

## Security

- Scripts are **never executed server-side** — only stored and served as text
- Session cookies use `httpOnly`, `secure`, `sameSite=lax`
- Passwords hashed with bcrypt (12 rounds)
- Input validated with Zod on every endpoint
- Rate limiting: 5 req/min auth, 30 req/min API, 60 req/min script serving
- HTTPS enforced with HSTS
- Private scripts return 403 on curl attempts

---

## License

All rights reserved.
