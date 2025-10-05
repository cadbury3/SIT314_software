Smart Seminar Room (Credit Task)

Setup
1) Copy .env.example to .env and set MONGODB_URI.
2) npm install
3) In one terminal: npm run start:hvac
4) In another: npm run start:edge
5) Optional: npm run start:sensors

Endpoints
- Edge: POST /ingest { type, value, unit, sourceId }
- HVAC: GET /hvac/status, POST /hvac/config


