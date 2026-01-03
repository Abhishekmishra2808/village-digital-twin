# 🗄️ Database Setup Guide

## MongoDB Installation & Setup

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Windows: Run the installer, select "Complete" installation
   - macOS: `brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB Service**
   - Windows: MongoDB runs as a service automatically
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free tier (M0 cluster)

2. **Create Cluster**
   - Click "Build a Database"
   - Select "Shared" (Free)
   - Choose your region
   - Click "Create Cluster"

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Update `.env` file:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/village-twin
     
     ```
     

## Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - File: `backend/.env`
   - Update these values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/village-twin
   JWT_SECRET=your-secret-key-change-this
   GEMINI_API_KEY=your-gemini-api-key
   ADMIN_EMAIL=admin@village.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start Backend Server**
   ```bash
   node server.js
   ```

## What Happens on First Run

The server will automatically:

1. ✅ **Connect to MongoDB**
2. ✅ **Create default admin user**
   - Email: `admin@village.com`
   - Password: `admin123`
   - Role: `admin`

3. ✅ **Seed Government Schemes**
   - 5 demo schemes (Swachh Bharat, Jal Jeevan, PMAY, etc.)
   - With realistic data (budgets, phases, vendor reports)

4. ✅ **Start WebSocket Server**
   - Real-time updates every 5 seconds
   - Broadcasts scheme changes to all connected clients

## Database Collections

### 1. **users**
- Stores user accounts with encrypted passwords
- Fields: name, email, password (hashed), role, village, phone
- Indexes: email (unique)

### 2. **schemes**
- Government schemes with all details
- Fields: id, name, category, budget, progress, phases, etc.
- Indexes: id (unique), lastUpdated

### 3. **feedbacks**
- AI-processed citizen feedback
- Fields: schemeId, rating, rawComment (hidden), aiSummary, concerns, sentiment
- Indexes: schemeId + createdAt
- **Note**: `rawComment` is never exposed to admin (select: false)

## Test the System

### 1. **Register New Users**

```bash
# POST http://localhost:3001/api/auth/register
{
  "name": "Test Citizen",
  "email": "test@village.com",
  "password": "test123",
  "role": "user"
}
```

### 2. **Login**

```bash
# POST http://localhost:3001/api/auth/login
{
  "email": "admin@village.com",
  "password": "admin123"
}
```

Response includes JWT token - store this for authenticated requests.

### 3. **Submit Feedback (AI Processed)**

```bash
# POST http://localhost:3001/api/schemes/<scheme-id>/feedback
{
  "rating": 4,
  "comment": "The work quality is good but there are some delays",
  "isUrgent": false
}
```

Gemini AI will:
- Anonymize the comment
- Extract key concerns
- Classify sentiment
- Determine urgency level
- Store only AI summary (not raw text)

### 4. **View Schemes with Feedback**

```bash
# GET http://localhost:3001/api/schemes
```

Returns all schemes with citizen ratings and feedback counts.

## Demo Accounts

After first run, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@village.com | admin123 |
| **Field Worker** | field@village.com | field123 |
| **Citizen** | citizen@village.com | user123 |

*Note: Field Worker and Citizen accounts need to be registered first.*

## Troubleshooting

### MongoDB Connection Failed

```
❌ MongoDB connection failed: connect ECONNREFUSED
```

**Solution:**
- Ensure MongoDB is running: `mongosh` should connect
- Check MONGODB_URI in `.env`
- For Windows: Check if MongoDB service is running in Services

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
- Kill process using port 3001
- Or change PORT in `.env`

### Gemini AI Errors

```
❌ Gemini AI Error: API key not valid
```

**Solution:**
- Verify GEMINI_API_KEY in `.env`
- Check API key at: https://makersuite.google.com/app/apikey

## Production Deployment

For production:

1. Use strong JWT_SECRET (random 32+ char string)
2. Use MongoDB Atlas with IP whitelist
3. Enable MongoDB encryption at rest
4. Add rate limiting for API endpoints
5. Use HTTPS for all connections
6. Set NODE_ENV=production

## Data Privacy

🔒 **Privacy Features:**
- Raw citizen comments are stored but **never** exposed to admin
- Only AI-processed summaries are shown
- Feedback collection has `select: false` for `rawComment`
- No user identification in feedback records
- JWT tokens for secure authentication

---

## Quick Start Commands

```bash
# 1. Start MongoDB (if local)
# Windows: Automatically runs as service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 2. Start Backend
cd backend
node server.js

# 3. Start Frontend (in new terminal)
cd ..
npm run dev

# 4. Open browser
http://localhost:5173
```

**Login with:** admin@village.com / admin123

You're ready to go! 🚀
