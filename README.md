# Games Hub

A browser arcade built with Next.js App Router. It bundles a collection of lightweight, instant-play games behind a single clean interface.

## Overview

Games Hub is designed for quick sessions with zero install friction. The project uses modern React patterns with Next.js and is configured for Cloudflare deployment.

## Included Games

- 2048 Lite
- Asteroid Drift
- Brick Breaker
- Bug Squash
- Coins Dice
- Color Switch
- Flappy Jump
- Memory Match
- Pong
- Snake
- Stack Towers
- Whack-a-Mole
- Word Rain

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Biome
- OpenNext + Cloudflare Workers

## Getting Started

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
bun run dev
bun run build
bun run build:worker
bun run deploy
bun run lint
bun run lint:fix
bun run format
```

## Deployment

Cloudflare deployment is configured via OpenNext:

```bash
bun run build:worker
bun run deploy
```
