# Room Reservation – Frontend

Vue 3 + TypeScript + Vite web client for the room reservation system.

## Requirements

- Git
- Node.js 20+ and npm
- The backend running (see [room-reservation-backend](https://github.com/jakubkoldarz/room-reservation-backend))

## Get the code

```bash
git clone https://github.com/jakubkoldarz/room-reservation-frontend.git
cd room-reservation-frontend
```

## Configure

Copy the example environment file:

```bash
cp .env.example .env
```

`VITE_API_BASE_URL` is the backend address (default `http://localhost:5000`).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

To log in with a ready account, seed the backend first (see the backend README). Then use `admin@rooms.com` / `password`.

## Build

```bash
npm run build
```

The production files are written to `dist/`.
