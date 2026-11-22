# Kudos: an Angular + NestJS demo app

Two users, Alice and Bob. One sends kudos to the other.

## Run it

Requires Node 22 or 24.

```bash
cd backend
npm install
npm run start:dev
```

The API listens on http://localhost:3000/api.

```bash
cd frontend
npm install
npm start
```

The app runs on http://localhost:4200. The Angular dev server forwards `/api` to the backend
(`frontend/proxy.conf.json`), so the backend needs no CORS setup.

## Try it

Open http://localhost:4200/?user=alice and http://localhost:4200/?user=bob in two tabs, then send kudos from one
to the other.

## API

| Method | Path           | Body                                  | Returns                                   |
|--------|----------------|---------------------------------------|-------------------------------------------|
| GET    | `/api/users`   |                                       | The users, without their emails           |
| POST   | `/api/session` | `{ userId }`                          | The current user, 404 if unknown          |
| POST   | `/api/kudos`   | `{ fromUserId, toUserId, message }`   | The kudos, 400 if the request is invalid  |

Tests: `cd backend && npm run test:e2e`.

## Demo shortcuts

- The users are hard-coded in `backend/src/users/users.service.ts`. There is no database.
- There is no login: the current user comes from the URL, and the backend trusts the ids it receives. A real app
  takes the user from its own authentication.
