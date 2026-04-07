# Student Internal Marks Assessment Portal

A **production-ready**, full-stack Student Internal Marks Assessment Portal built with **React + Vite + Tailwind CSS** on the frontend and **Node.js + Express + MySQL** on the backend. Features real-time notifications via Firebase, PDF marksheet generation, Excel export, AWS S3 file storage, and AWS SES email alerts.

---

## 🚀 Tech Stack

| Layer       | Technology                                              |
|-------------|--------------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion, Recharts  |
| Backend     | Node.js 20, Express 4, JWT Auth                        |
| Database    | MySQL 8 (local/RDS), Redis (optional)                  |
| Real-time   | Firebase Realtime DB + FCM                             |
| File Store  | AWS S3 + CloudFront                                    |
| Email       | AWS SES                                                |
| Deployment  | Docker, AWS Elastic Beanstalk, RDS, CloudFront         |

---

## 📁 Project Structure

```
Students_Internal_Marks_Assessment_Portal/
├── client/          # React frontend
├── server/          # Express backend
├── database/
│   ├── migrations/  # SQL table creation files
│   └── seeds/       # Demo data
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
└── .env.example
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 1. Clone and configure environment
```bash
# Copy env file
cp .env.example .env
# Edit .env with your MySQL credentials and other settings
```

### 2. Setup and seed the database
```bash
cd server
npm install
node scripts/migrate.js   # Creates all tables
node scripts/seed.js      # Inserts demo data
```

### 3. Start the backend
```bash
# Inside /server
npm run dev
# Server starts on http://localhost:5000
```

### 4. Start the frontend
```bash
cd ../client
npm install
npm run dev
# Client starts on http://localhost:5173
```

---

## 🐳 Docker (Full Stack)

```bash
# Build and start all services (MySQL + Server + Client)
cp .env.example .env
# Fill in your .env values, then:

docker-compose up --build

# Run migrations inside container
docker exec marks-portal-server node scripts/migrate.js
docker exec marks-portal-server node scripts/seed.js
```

Access at:
- **Frontend**: http://localhost
- **API**: http://localhost:5000
- **Health**: http://localhost:5000/health

---

## 🔑 Demo Credentials

All demo accounts use password: **`Password@123`**

| Role        | Email                      |
|-------------|----------------------------|
| Super Admin | superadmin@portal.edu      |
| Admin       | admin@portal.edu           |
| HOD (CSE)   | hod.cse@portal.edu         |
| Professor   | prof.ramesh@portal.edu     |
| Student     | student01@portal.edu       |

---

## ☁️ AWS Deployment Guide

### Architecture Overview

```
Users → CloudFront → S3 (React Build)
      ↘             ↘
        ALB → Elastic Beanstalk (Node.js API)
                    ↓
               RDS MySQL
```

---

### Step 1: Setup RDS MySQL

```bash
# AWS Console → RDS → Create Database
# Engine: MySQL 8.0
# DB Instance: db.t3.micro (free tier) or larger
# Multi-AZ: Enable for production
# Storage: 20 GB gp3, enable auto scaling

# Note the endpoint, e.g.:
# marks-portal-db.xxxx.us-east-1.rds.amazonaws.com

# Configure Security Group:
# - Allow inbound MySQL (3306) from Elastic Beanstalk SG only
```

### Step 2: Configure environment variables for production

Update `.env`:
```env
NODE_ENV=production
DB_HOST=marks-portal-db.xxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=student_marks_portal
DB_USER=admin
DB_PASSWORD=your_rds_password
```

### Step 3: Deploy Backend to Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application (from /server directory)
cd server
eb init marks-portal-api --platform node.js-20 --region us-east-1

# Create environment
eb create marks-portal-prod \
  --instance-type t3.small \
  --scale 1

# Set environment variables
eb setenv \
  NODE_ENV=production \
  PORT=5000 \
  DB_HOST=<rds-endpoint> \
  DB_NAME=student_marks_portal \
  DB_USER=admin \
  DB_PASSWORD=<rds-password> \
  JWT_SECRET=<your-strong-secret> \
  JWT_REFRESH_SECRET=<your-refresh-secret> \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=<key> \
  AWS_SECRET_ACCESS_KEY=<secret> \
  AWS_S3_BUCKET=marks-portal-files \
  AWS_SES_FROM_EMAIL=noreply@yourdomain.edu \
  FIREBASE_PROJECT_ID=<project-id> \
  COLLEGE_NAME="Government Engineering College"

# Deploy
eb deploy

# Run migrations on first deploy
eb ssh
cd /var/app/current
node scripts/migrate.js
node scripts/seed.js
```

### Step 4: Build and Deploy Frontend to S3 + CloudFront

```bash
# Create S3 bucket
aws s3 mb s3://marks-portal-frontend --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://marks-portal-frontend \
  --index-document index.html \
  --error-document index.html

# Build frontend
cd client
VITE_API_URL=https://api.yourdomain.edu npm run build

# Sync to S3
aws s3 sync dist/ s3://marks-portal-frontend \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html without cache
aws s3 cp dist/index.html s3://marks-portal-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### Step 5: Create CloudFront Distribution

```bash
# AWS Console → CloudFront → Create Distribution
# Origin: S3 bucket (marks-portal-frontend)
# Default Root Object: index.html
# Error Pages: 403 → /index.html (for SPA routing)
# Price Class: Use All Edge Locations
# Alternate Domain Names: portal.yourdomain.edu
# SSL Certificate: Request via ACM

# After creation, note the CloudFront URL:
# https://xxxx.cloudfront.net
```

### Step 6: Configure AWS SES for Email

```bash
# Verify sender domain
aws ses verify-domain-identity --domain yourdomain.edu

# Add DKIM records to your DNS
# Request production access (out of sandbox) via AWS Console

# Test email
aws ses send-email \
  --from noreply@yourdomain.edu \
  --destination ToAddresses=test@email.com \
  --message Subject={Data="Test",Charset=UTF-8},Body={Text={Data="SES works!",Charset=UTF-8}}
```

### Step 7: Configure AWS S3 for File Uploads

```bash
# Create bucket for uploads
aws s3 mb s3://marks-portal-uploads --region us-east-1

# Set bucket policy (allow EB role to read/write)
aws s3api put-bucket-policy \
  --bucket marks-portal-uploads \
  --policy file://s3-policy.json

# Configure CORS
aws s3api put-bucket-cors \
  --bucket marks-portal-uploads \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["https://portal.yourdomain.edu"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'
```

### Step 8: Point Custom Domain

```bash
# Route 53 → Create A Record (alias) pointing to:
# - portal.yourdomain.edu → CloudFront distribution
# - api.yourdomain.edu → Elastic Beanstalk Load Balancer

# Update .env and rebuild client with correct API URL
VITE_API_URL=https://api.yourdomain.edu
```

---

## 📊 Database Schema Summary

| Table                      | Purpose                                 |
|----------------------------|-----------------------------------------|
| roles                      | User roles (superadmin, admin, hod, ...) |
| departments                | Academic departments                    |
| branches                   | Course branches per department          |
| semesters                  | Semester definitions                    |
| sections                   | Class sections                          |
| users                      | All system users                        |
| student_profiles           | Extended student info, USN              |
| subjects                   | Course subjects with max marks          |
| professor_subject_mapping  | Professor ↔ Subject ↔ Section           |
| marks                      | CIE, Assignment, Lab, Attendance marks  |
| marks_audit                | Audit trail for every marks change      |
| marks_lock_config          | Lock/unlock marks per subject           |
| attendance                 | Daily attendance records                |
| attendance_summary         | Cached attendance % per student/subject |
| notifications              | In-app notifications                    |
| audit_logs                 | System-wide audit trail                 |
| academic_calendar          | Events, holidays, deadlines             |
| refresh_tokens             | JWT refresh token store                 |

---

## 🎯 User Roles & Permissions

| Role          | Capabilities                                                    |
|---------------|-----------------------------------------------------------------|
| **Super Admin** | Full system control, all CRUD, audit logs, analytics           |
| **Admin**     | Manage college, bulk import students, reports, lock marks       |
| **HOD**       | Approve/reject marks, department analytics, reports             |
| **Professor** | Enter marks, mark attendance, bulk upload via Excel             |
| **Student**   | View own marks, attendance, download PDF marksheet             |

---

## 📝 API Endpoints

### Auth
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/login             | Login                |
| POST   | /api/auth/refresh           | Refresh access token |
| POST   | /api/auth/logout            | Logout               |
| POST   | /api/auth/forgot-password   | Request reset link   |
| POST   | /api/auth/reset-password    | Reset password       |
| GET    | /api/auth/me                | Get current user     |

### Users
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/users                  | List users (filtered)|
| POST   | /api/users                  | Create user          |
| GET    | /api/users/:id              | Get user by ID       |
| PATCH  | /api/users/:id              | Update user          |
| DELETE | /api/users/:id              | Deactivate user      |
| POST   | /api/users/bulk-import      | Bulk import via Excel|
| GET    | /api/users/stats            | System statistics    |

### Marks
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| GET    | /api/marks/section          | Get section marks    |
| GET    | /api/marks/student/:id      | Get student marks    |
| POST   | /api/marks                  | Create/update marks  |
| POST   | /api/marks/submit           | Submit for approval  |
| POST   | /api/marks/approve          | Approve marks (HOD)  |
| POST   | /api/marks/lock             | Lock/unlock marks    |
| POST   | /api/marks/bulk-upload      | Bulk upload Excel    |

### Attendance
| Method | Endpoint                         | Description           |
|--------|---------------------------------|-----------------------|
| POST   | /api/attendance                  | Mark attendance       |
| GET    | /api/attendance/section          | Get section records   |
| GET    | /api/attendance/section/summary  | Attendance summary    |
| GET    | /api/attendance/student/:id      | Student attendance    |

### Reports
| Method | Endpoint                         | Description           |
|--------|---------------------------------|-----------------------|
| GET    | /api/reports/marksheet/:id       | PDF marksheet         |
| GET    | /api/reports/marks/excel         | Excel marks export    |
| GET    | /api/reports/attendance/excel    | Excel attendance export|
| GET    | /api/reports/analytics           | Department analytics  |

---

## 🔒 Security Features

- JWT access tokens (7d) + refresh tokens (30d) with rotation
- bcrypt password hashing (12 rounds)
- Role-based access control (RBAC) middleware
- Rate limiting (300 req/15min global, 20 req/15min auth)
- Helmet.js security headers
- CORS configuration
- Input validation with express-validator + Zod
- SQL injection prevention (parameterized queries)
- Audit logging for all critical operations
- Marks lock mechanism to prevent unauthorized changes

---

## 🧪 Environment Variables Reference

See `.env.example` for the full list of required environment variables.

---

## 📄 License

MIT License — Free to use for educational purposes.

---

Built with ❤️ for academic excellence — Student Marks Portal 2025
