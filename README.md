# Groceries CRUD Application

Live demo: https://groceries.ahmadfirdaus.dev

## Development setup 
### Setup backend application
1. Move to backend directory `cd backend/`
2. Install dependencies `npm install`
3. Copy and fill up database environment variables `cp .env.example .env`
4. Run application `npm run dev`
5. (Optional) Test backend application `npm run test`

### Setup frontend application
1. Move to backend directory `cd frontend/`
2. Install dependencies `npm install`
3. Copy and fill up `BASE_API_URL` variable `cp .env.example .env`
4. Run application `npm run dev`

## Production setup
Run application using docker compose `docker compose up -d`