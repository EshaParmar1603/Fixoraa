
Fixora Backend Server
Production-ready backend built with Node.js, Express, PostgreSQL, Prisma, JWT, and Socket.IO.

Setup & Installation
1. Install Dependencies
bash

cd server
npm install
2. Configure Environment Variables
Copy .env.example to .env and update the PostgreSQL connection URL:

bash

cp .env.example .env
Ensure your PostgreSQL server is running and DATABASE_URL is set:

env

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fixora_db?schema=public"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
3. Run Prisma Migrations & Generate Client
bash

npx prisma migrate dev --name init
npx prisma generate
4. Seed Initial Data
Seeds administrative account, providers, categories, services, schedules, appliances, and sample bookings:

bash

npm run prisma:seed
5. Start the Server
Development mode with nodemon:

bash

npm run dev
Production mode:

bash

npm start
Seed Accounts
Admin Account: admin@fixora.com / Password123!
Plumbing Provider: alex.plumber@fixora.com / Password123!
Electrical Provider: sarah.electric@fixora.com / Password123!
Cleaning Provider: mike.cleaning@fixora.com / Password123!
Customer Account: john.customer@fixora.com / Password123!
API Base Endpoints
Health Check: GET /api/health
Auth: /api/auth (/register, /login, /logout, /me, /change-password)
Users: /api/users
Categories: /api/categories
Services: /api/services
Providers: /api/providers
Bookings: /api/bookings
Reviews: /api/reviews
Favorites: /api/favorites
Chat & Messages: /api/messages
Notifications: /api/notifications
Appliances & Reminders: /api/appliances
Bills & Warranties: /api/documents
Complaints: /api/complaints
Payments: /api/payments
Admin: /api/admin (/dashboard/stats, /users, /providers/:id/verify, /bookings, /complaints)