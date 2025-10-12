Credit Task: Module 4 - Local Weather Web Service

What you built
- API that accepts sensor readings and stores them in a simple JSON database.
- Full CRUD endpoints for readings.
- Each CRUD operation persists to storage.
- Keeps and exposes the latest temperature reading.
- GET for readings filtered by map/location + external lookup using `weather-js`.
- Demo client to exercise endpoints.

Project structure
- `src/server.js`: Express server and routes.
- `src/utils/fileStore.js`: JSON file storage helper (`src/db.json`).
- `src/utils/weather.js`: `weather-js` wrapper.
- `src/client_demo.js`: Simple HTTP client to demo API.

Install & run
1) From the project folder:
```bash
npm install
node src/server.js
```
Server runs on port 4000 by default.

2) In another terminal, run demo:
```bash
node src/client_demo.js
```

Key endpoints
- POST `/api/readings` body: `{ temperature?, humidity?, wind?, smoke?, location?, timestamp? }`
- GET `/api/readings`
- GET `/api/readings/:id`
- PUT `/api/readings/:id`
- DELETE `/api/readings/:id`
- GET `/api/temperature/latest`
- GET `/api/readings/location?q=<text>`
- GET `/api/weather?q=<city, state>` (external `weather-js`)

Evidence mapping to rubric
- Complete CRUD: Implemented via `/api/readings` with GET/POST/PUT/DELETE.
- Persist each CRUD operation: Uses `fileStore` to read/write `src/db.json`.
- Record of latest temperature: `/api/temperature/latest` returns newest temperature by timestamp.
- GET endpoints for latest and by location: implemented as above.
- weather-js module: `/api/weather` wraps `weather-js` query by location string.
- Client demonstration: `src/client_demo.js` posts a reading, queries latest temperature, queries by location, and looks up external weather.

Notes on error handling
- Minimal validation on POST (requires at least one metric). Add more as needed (e.g., numeric range checks, required fields). Ask to expand if required.


