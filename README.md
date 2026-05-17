# Synapse Healthflow - Modern Healthcare Management Platform

A complete, enterprise-grade MERN stack application for managing hospital workflows. Designed with a premium, fully-responsive UI, this platform features strict role-based access control, real-time communication suites, and dynamic appointment lifecycle management for Admins, Doctors, and Patients.

## 🚀 Key Features

### 1. Real-Time Communication Suite (Telemedicine)
- **Live Chat (Socket.io):** Real-time, low-latency messaging between patients and doctors, locked until an appointment is confirmed.
- **WebRTC Video Calls:** Seamless peer-to-peer browser video consultations with toggleable mic/video, ringing animations, and auto-cleanup.
- **WhatsApp-Style Notifications:** Integrated call-logs directly inside the chat feed (e.g., "📞 Missed Video Call", "📞 Video Call Ended").
- **Media Sharing:** Securely send images, PDFs, and medical documents within the chat using Multer.
- **Read Receipts & Typing Indicators:** See exactly when the other person is typing or has read your message.

### 2. Patient Portal
- **Dashboard:** At-a-glance view of upcoming appointments, overall health statistics, and quick-action bookings.
- **Booking Engine:** Browse specialists, view their aggregated rating/reviews, and book appointments.
- **Reviews & Ratings:** Dynamically leave feedback for doctors post-appointment, which automatically recalibrates the doctor's average rating.
- **Medical Records:** Centralized space for tracking historical prescriptions and consultation outcomes.

### 3. Doctor Portal
- **Appointment Management:** Accept, manage, and complete incoming appointment requests.
- **Patient History:** Secure access to clinical history for assigned patients.
- **Digital Prescriptions:** Issue and log prescriptions digitally for completed consultations.

### 4. Admin Command Center
- **Analytics Dashboard:** Beautiful Recharts-driven metrics showing platform health, active appointments, and user demographics.
- **Role Approval System:** Robust approval pipeline for sensitive roles. Admin/Doctor registrations are sandboxed until an existing Admin approves them via email link.
- **Content Management:** Fully integrated CRUD operations for global platform FAQs.
- **User Oversight:** Complete visibility into all active accounts and appointments.

## ⚙️ Architecture & Tech Stack
- **Frontend Architecture**: React 18 (Vite), Tailwind CSS, React Router, Context API, Lucide-React icons, React-Hot-Toast.
- **Backend Architecture**: Node.js, Express 5, MongoDB (Mongoose 9), Socket.io, WebRTC (Browser APIs).
- **Security & Infrastructure**: 
  - JWT Authentication (localStorage) with robust middleware protection.
  - Bcryptjs for password hashing.
  - Rate limiting, Helmet security headers, and structured MVC patterns.
  - Redis support for caching expensive analytics queries.

## 📋 Requirements
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)
- Redis (Optional, used for caching if `REDIS_URL` is set in the backend `.env`)

## 🛠️ Project Setup

### 1. Database and Environment
The `.env` file is already created in the `backend/` directory with sensible defaults for local development.

#### SMTP + Approval system (Admin/Doctor)
Admin and Doctor account creation is **approval-based**. When someone tries to sign up as Admin or Doctor, the backend emails an approval link to the core administrator. Only after clicking that link will the account be created and able to log in.

If **`SMTP_USER` / `SMTP_PASS` are not set**, the server still saves the approval request, **does not crash**, prints the approval URL in the **backend console**, and in **development** returns `approvalLink` in the JSON response so you can paste it in the browser. For real email delivery, add Gmail below.

Add these variables to `backend/.env`:

```bash
# Used to build approval link URLs (clicked from email)
APPROVAL_BASE_URL=http://localhost:5000

# Gmail SMTP (use your Gmail + app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 2. Backend Setup
```bash
cd backend
npm install
# Run the seed script to populate initial Admin, Doctor, and Patient users
npm run seed
# Start the backend server
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Default Credentials (from Seed)
- **Admin**: `admin@healthflow.com` / `password123`
- **Doctor**: `doctor@healthflow.com` / `password123`
- **Patient**: `patient@healthflow.com` / `password123`
