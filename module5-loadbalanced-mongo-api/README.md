# Module 5 – Load-Balanced MongoDB API

Express API that bridges sensors to MongoDB with CRUD and `/health` for ALB.

## Run locally
1. Create `.env` with `PORT=3000` and your `MONGO_URI`.
2. Install and start:
```bash
npm install
npm run dev
```
3. Try:
```bash
curl http://localhost:3000/health
```

## CRUD
- POST `/api/readings`
- GET `/api/readings`
- GET `/api/readings/:id`
- PUT `/api/readings/:id`
- DELETE `/api/readings/:id`

## Simulator
```bash
API_BASE_URL=http://localhost:3000 npm run sensor
```

## Deploy (ALB + 2× EC2 + Atlas)
- See `DEPLOYMENT.md` for step-by-step guide.

## Error handling
Basic centralized handler is included. Ask to extend with validations/retries.
