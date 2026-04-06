#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
#  HostMyBash — Full Installation Script
#  Installs Node.js (via nvm), PostgreSQL, Nginx, and sets up
#  the HostMyBash panel with SSL via Certbot.
# ─────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()   { echo -e "${GREEN}[+]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
err()   { echo -e "${RED}[x]${NC} $*"; exit 1; }
info()  { echo -e "${BLUE}[i]${NC} $*"; }
step()  { echo -e "\n${CYAN}${BOLD}── $* ──${NC}\n"; }

# ─── Pre-flight checks ──────────────────────────────────────
[[ $EUID -ne 0 ]] && err "Please run as root: sudo bash install.sh"

command -v apt-get &>/dev/null || err "This script requires a Debian/Ubuntu system with apt."

# ─── Gather configuration ───────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║       HostMyBash — Panel Installer       ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

read -rp "$(echo -e "${BOLD}Domain name${NC} (e.g. example.com): ")" DOMAIN
[[ -z "$DOMAIN" ]] && err "Domain is required."

read -rp "$(echo -e "${BOLD}Install directory${NC} [/var/www/hostmybash]: ")" INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-/var/www/hostmybash}"

read -rp "$(echo -e "${BOLD}PostgreSQL database name${NC} [hostmybash]: ")" DB_NAME
DB_NAME="${DB_NAME:-hostmybash}"

read -rp "$(echo -e "${BOLD}PostgreSQL username${NC} [hostmybash]: ")" DB_USER
DB_USER="${DB_USER:-hostmybash}"

while true; do
  read -srp "$(echo -e "${BOLD}PostgreSQL password${NC}: ")" DB_PASS
  echo ""
  [[ -n "$DB_PASS" ]] && break
  warn "Password cannot be empty."
done

read -rp "$(echo -e "${BOLD}App port${NC} [3000]: ")" APP_PORT
APP_PORT="${APP_PORT:-3000}"

read -rp "$(echo -e "${BOLD}Set up SSL with Certbot?${NC} (y/n) [y]: ")" SETUP_SSL
SETUP_SSL="${SETUP_SSL:-y}"

if [[ "$SETUP_SSL" =~ ^[Yy] ]]; then
  read -rp "$(echo -e "${BOLD}Email for SSL certificate${NC}: ")" SSL_EMAIL
  [[ -z "$SSL_EMAIL" ]] && err "Email is required for SSL."
fi

read -rp "$(echo -e "${BOLD}Git repo URL${NC} [skip if code already exists]: ")" GIT_REPO

echo ""
info "Configuration summary:"
echo "  Domain:       $DOMAIN"
echo "  Directory:    $INSTALL_DIR"
echo "  Database:     $DB_NAME (user: $DB_USER)"
echo "  Port:         $APP_PORT"
echo "  SSL:          ${SETUP_SSL}"
echo "  Git repo:     ${GIT_REPO:-<local/existing>}"
echo ""
read -rp "$(echo -e "${BOLD}Continue?${NC} (y/n) [y]: ")" CONFIRM
CONFIRM="${CONFIRM:-y}"
[[ ! "$CONFIRM" =~ ^[Yy] ]] && err "Aborted."

# ─── System packages ────────────────────────────────────────
step "Updating system packages"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git build-essential \
  nginx certbot python3-certbot-nginx \
  postgresql postgresql-contrib \
  ufw jq

log "System packages installed."

# ─── PostgreSQL setup ────────────────────────────────────────
step "Configuring PostgreSQL"

systemctl enable --now postgresql

# Create user and database
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || {
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  log "PostgreSQL user '${DB_USER}' created."
}

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || {
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  log "PostgreSQL database '${DB_NAME}' created."
}

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
# Grant schema permissions (needed for PostgreSQL 15+)
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};" 2>/dev/null || true

log "PostgreSQL configured."

# ─── Node.js via nvm ────────────────────────────────────────
step "Installing Node.js"

export NVM_DIR="/root/.nvm"

if [[ ! -d "$NVM_DIR" ]]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

# Load nvm
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 22
nvm use 22
nvm alias default 22

log "Node.js $(node -v) installed."

# ─── Install bun (used as package manager) ──────────────────
if ! command -v bun &>/dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi

log "Bun $(bun --version) installed."

# ─── Application code ───────────────────────────────────────
step "Setting up application"

if [[ -n "${GIT_REPO}" ]]; then
  if [[ -d "$INSTALL_DIR/.git" ]]; then
    info "Git repo already exists at $INSTALL_DIR, pulling latest..."
    cd "$INSTALL_DIR"
    git pull
  else
    mkdir -p "$(dirname "$INSTALL_DIR")"
    git clone "$GIT_REPO" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
else
  [[ ! -d "$INSTALL_DIR" ]] && err "Directory $INSTALL_DIR does not exist and no git repo provided."
  cd "$INSTALL_DIR"
fi

log "Application code ready at $INSTALL_DIR."

# ─── Environment file ───────────────────────────────────────
step "Creating environment configuration"

cat > "$INSTALL_DIR/.env" <<EOF
# Database
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASS}
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=${DB_NAME}

# Domain
MAIN_HOST=${DOMAIN}

# Environment
NODE_ENV=production
EOF

chmod 600 "$INSTALL_DIR/.env"
log ".env file created."

# ─── Install dependencies ───────────────────────────────────
step "Installing dependencies"
cd "$INSTALL_DIR"
bun install --frozen-lockfile 2>/dev/null || bun install
log "Dependencies installed."

# ─── Database migration ─────────────────────────────────────
step "Running database migrations"

# Use drizzle-kit to push schema to the database
npx drizzle-kit push --force 2>/dev/null || {
  warn "drizzle-kit push failed, attempting manual schema creation..."

  # Fallback: create tables directly from schema definition
  sudo -u postgres psql -d "${DB_NAME}" <<'EOSQL'
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      is_active BOOLEAN DEFAULT true
    );
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scripts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'public',
      run_count INTEGER NOT NULL DEFAULT 0,
      star_count INTEGER NOT NULL DEFAULT 0,
      fork_count INTEGER NOT NULL DEFAULT 0,
      forked_from_id UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_scripts_owner_slug ON scripts(owner_id, slug);
    CREATE INDEX IF NOT EXISTS idx_scripts_owner ON scripts(owner_id);
    CREATE INDEX IF NOT EXISTS idx_scripts_owner_visibility ON scripts(owner_id, visibility);
    CREATE INDEX IF NOT EXISTS idx_scripts_updated ON scripts(updated_at);
    CREATE INDEX IF NOT EXISTS idx_scripts_star_count ON scripts(star_count);
    CREATE INDEX IF NOT EXISTS idx_scripts_forked_from ON scripts(forked_from_id);

    CREATE TABLE IF NOT EXISTS stars (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_stars_user_script ON stars(user_id, script_id);
    CREATE INDEX IF NOT EXISTS idx_stars_script ON stars(script_id);
    CREATE INDEX IF NOT EXISTS idx_stars_user ON stars(user_id);

    CREATE TABLE IF NOT EXISTS forks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
      forked_script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
      forked_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_forks_source ON forks(source_script_id);
    CREATE INDEX IF NOT EXISTS idx_forks_forked_by ON forks(forked_by_id);

    CREATE TABLE IF NOT EXISTS activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      script_id UUID,
      target_user_id UUID,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_script ON activity(script_id);

    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

    CREATE TABLE IF NOT EXISTS script_tags (
      script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_script_tags_pk ON script_tags(script_id, tag_id);
    CREATE INDEX IF NOT EXISTS idx_script_tags_tag ON script_tags(tag_id);
EOSQL

  log "Manual schema creation complete."
}

log "Database schema ready."

# ─── Build the application ──────────────────────────────────
step "Building Next.js application"
cd "$INSTALL_DIR"
npx next build
log "Build complete."

# ─── systemd service ────────────────────────────────────────
step "Creating systemd service"

cat > /etc/systemd/system/hostmybash.service <<EOF
[Unit]
Description=HostMyBash Panel
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=$(which node) ${INSTALL_DIR}/node_modules/.bin/next start -p ${APP_PORT}
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
EnvironmentFile=${INSTALL_DIR}/.env

# Hardening
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=${INSTALL_DIR}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable hostmybash
systemctl start hostmybash

log "systemd service created and started."

# ─── Nginx configuration ────────────────────────────────────
step "Configuring Nginx"

cat > /etc/nginx/sites-available/hostmybash <<EOF
# ── Main domain + wildcard subdomains ──
server {
    listen 80;
    server_name ${DOMAIN} *.${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 4 32k;
    }

    # Static asset caching
    location /_next/static {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Favicon and static files
    location /favicon.ico {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        expires 30d;
    }

    # Max upload size (for large scripts)
    client_max_body_size 2M;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/hostmybash /etc/nginx/sites-enabled/hostmybash

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t || err "Nginx config test failed."
systemctl enable --now nginx
systemctl reload nginx

log "Nginx configured."

# ─── SSL with Certbot ───────────────────────────────────────
if [[ "$SETUP_SSL" =~ ^[Yy] ]]; then
  step "Setting up SSL certificate"

  certbot --nginx \
    -d "${DOMAIN}" \
    -d "*.${DOMAIN}" \
    --email "${SSL_EMAIL}" \
    --agree-tos \
    --non-interactive \
    --redirect \
    2>/dev/null || {
      warn "Wildcard SSL requires DNS validation. Trying main domain only..."
      certbot --nginx \
        -d "${DOMAIN}" \
        --email "${SSL_EMAIL}" \
        --agree-tos \
        --non-interactive \
        --redirect || warn "SSL setup failed. You can retry manually with: certbot --nginx -d ${DOMAIN}"
    }

  log "SSL configured."
fi

# ─── Firewall ───────────────────────────────────────────────
step "Configuring firewall"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force reload
log "Firewall configured (SSH + Nginx allowed)."

# ─── Verify ─────────────────────────────────────────────────
step "Verifying installation"

sleep 3

if systemctl is-active --quiet hostmybash; then
  log "HostMyBash service is running."
else
  warn "Service may not have started yet. Check: systemctl status hostmybash"
fi

if curl -sf -o /dev/null "http://127.0.0.1:${APP_PORT}"; then
  log "Application is responding on port ${APP_PORT}."
else
  warn "Application not responding yet. It may still be starting up."
fi

# ─── Done ────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║          HostMyBash installed successfully!          ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Panel URL:${NC}        https://${DOMAIN}"
echo -e "  ${BOLD}Install dir:${NC}      ${INSTALL_DIR}"
echo -e "  ${BOLD}Service:${NC}          systemctl status hostmybash"
echo -e "  ${BOLD}Nginx config:${NC}     /etc/nginx/sites-available/hostmybash"
echo -e "  ${BOLD}Logs:${NC}             journalctl -u hostmybash -f"
echo -e "  ${BOLD}Database:${NC}         psql -U ${DB_USER} -d ${DB_NAME}"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo -e "    systemctl restart hostmybash    # Restart the app"
echo -e "    systemctl stop hostmybash       # Stop the app"
echo -e "    journalctl -u hostmybash -f     # View live logs"
echo -e "    cd ${INSTALL_DIR} && npx next build  # Rebuild after changes"
echo ""
echo -e "  ${BOLD}Subdomain routing:${NC}"
echo -e "    user1.${DOMAIN}              → Public profile"
echo -e "    user1.${DOMAIN}/script-slug  → Run script via curl"
echo ""
echo -e "  ${YELLOW}Note:${NC} For wildcard subdomains, add a DNS A record:"
echo -e "    *.${DOMAIN}  →  $(curl -sf https://api.ipify.org 2>/dev/null || echo '<your-server-ip>')"
echo ""
