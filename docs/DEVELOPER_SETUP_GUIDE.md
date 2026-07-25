# Developer Setup Guide

## Prerequisites
- Node.js >= 18.x
- MySQL Server >= 8.0 (Database name: `home`)
- npm >= 9.x

## Environment Setup
Create `.env` in the root server folder with:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=home
JWT_SECRET=super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create `client/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Installation & Running

### 1. Backend Server
```bash
npm install
node server/index.js
```

### 2. Frontend Application
```bash
cd client
npm install
npm run dev
```

## Running Database Migrations
Migrations execute sequentially in `server/database/migrations/`:
- `001_initial_schema.sql` through `019_production_optimization_and_indexing.sql`.
