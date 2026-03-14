# NikahMatch - Matrimony Backend API

A REST API backend for the NikahMatch matrimony/marriage matchmaking web application built with Node.js, Express.js, and MongoDB native driver.

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** native driver (no Mongoose)
- **JWT** authentication
- **bcryptjs** for password hashing
- **multer** for image uploads
- **dotenv** for environment variables

## Features

- User registration and authentication (JWT)
- Profile management with photo upload
- Smart matching algorithm (opposite gender, religion, age preferences)
- Interest system (send, accept, reject)
- Messaging system (only between accepted connections)
- Admin panel (user management, blocking, stats)
- Pagination and search/filter on profiles

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Variables:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password

### Seed Data

```bash
npm run seed
```

This creates sample users, interests, messages, and an admin account.

**Test Credentials:**
- Users: `ayesha@example.com` / `password123` or `hasan@example.com` / `password123`
- Admin: `admin@matrimony.com` / `admin123`

### Run

```bash
npm start
# or for development
npm run dev
```

## API Routes

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Users
- `GET /api/users` - Browse profiles (with filters & pagination)
- `GET /api/users/matches` - Get matched profiles based on preferences
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update own profile
- `POST /api/users/upload/profile` - Upload profile photo
- `POST /api/users/upload/gallery` - Upload gallery photo
- `POST /api/users/logout` - Logout

### Interests
- `POST /api/interests/send` - Send interest
- `PUT /api/interests/respond` - Accept/reject interest
- `GET /api/interests/my` - Get sent and received interests

### Messages
- `POST /api/messages/send` - Send message (accepted connections only)
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get messages with a user

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Dashboard stats
- `DELETE /api/admin/user/:id` - Delete user
- `PUT /api/admin/block/:id` - Block/unblock user

## Folder Structure

```
backend/
  server.js          # Entry point
  config/
    db.js            # MongoDB connection
  routes/
    auth.routes.js
    user.routes.js
    interest.routes.js
    message.routes.js
    admin.routes.js
  controllers/
    auth.controller.js
    user.controller.js
    interest.controller.js
    message.controller.js
    admin.controller.js
  middleware/
    authMiddleware.js # JWT auth & admin middleware
  utils/
    helpers.js       # Validation & utility functions
  seed.js            # Database seeder
  uploads/           # Uploaded images
```
