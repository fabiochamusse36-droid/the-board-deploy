# THE BOARD — Monorepo Reorganization Script
# Run from the repository root: C:\files\apps\the-board\color-match-sales-page
# This script moves the current frontend into /frontend and the API into /backend.

$ErrorActionPreference = "Stop"

Write-Host "THE BOARD — preparing monorepo structure" -ForegroundColor Yellow

if (!(Test-Path ".git")) {
  throw "Run this script from the repository root. .git was not found."
}

if (Test-Path ".env") {
  Copy-Item ".env" ".env.local.backup" -Force
  Write-Host "Saved local .env to .env.local.backup" -ForegroundColor Green
}

New-Item -ItemType Directory -Force -Path "frontend" | Out-Null
New-Item -ItemType Directory -Force -Path "backend" | Out-Null
New-Item -ItemType Directory -Force -Path "database" | Out-Null
New-Item -ItemType Directory -Force -Path "shared/types" | Out-Null
New-Item -ItemType Directory -Force -Path "shared/states" | Out-Null
New-Item -ItemType Directory -Force -Path "shared/validators" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/business" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/technical" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/gateway" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/operations" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts/db" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts/deploy" | Out-Null

$frontendItems = @(
  "src",
  "supabase",
  ".lovable",
  "AGENTS.md",
  "bun.lock",
  "bunfig.toml",
  "components.json",
  "eslint.config.js",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "README.md"
)

foreach ($item in $frontendItems) {
  if ((Test-Path $item) -and !(Test-Path "frontend/$item")) {
    Move-Item $item "frontend/" -Force
    Write-Host "Moved $item -> frontend/$item"
  }
}

if (Test-Path "apps/api") {
  if ((Test-Path "backend") -and ((Get-ChildItem "backend" -Force | Measure-Object).Count -eq 0)) {
    Remove-Item "backend" -Force
  }
  if (!(Test-Path "backend")) {
    Move-Item "apps/api" "backend" -Force
    Write-Host "Moved apps/api -> backend"
  }
}

if (Test-Path "backend/prisma") {
  Move-Item "backend/prisma" "database/prisma" -Force
  Write-Host "Moved backend/prisma -> database/prisma"
}

@'
THE_BOARD_WEB_URL=http://localhost:8080
THE_BOARD_API_URL=http://localhost:3333
DATABASE_URL=postgresql://the_board:the_board_password@localhost:5432/the_board
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=
GATEWAY_PROVIDER=mock
GATEWAY_BASE_URL=
GATEWAY_API_KEY=
GATEWAY_WEBHOOK_SECRET=change-me
JWT_SECRET=change-me
'@ | Set-Content ".env.example" -Encoding UTF8

if (Test-Path ".env.local.backup") {
  Copy-Item ".env.local.backup" "frontend/.env" -Force
  Write-Host "Restored local frontend env to frontend/.env" -ForegroundColor Green
}

Write-Host "Monorepo folders prepared." -ForegroundColor Green
Write-Host "Next: review git status before committing." -ForegroundColor Yellow
