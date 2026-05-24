# portfolio-ui

Next.js frontend for [anjanvikas.dev](https://anjanvikas.dev). Talks to the
Go API in [portfolio-api](https://github.com/anjanvikas/portfolio-api).

## Prerequisites

- Node 20+ (project uses Node 24 LTS via nvm)
- The Go API running locally on `http://localhost:8080` (see portfolio-api README)

## Quick start

```bash
# 1. Copy env file
cp .env.local.example .env.local

# 2. Install deps
npm install

# 3. Start dev server
make dev   # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the Go API (e.g. `http://localhost:8080`) |

`.env.local` is git-ignored. Production values are configured in Vercel.

## Available commands

```bash
make dev     # next dev
make build   # next build
make lint    # next lint
make help    # list all targets
```
