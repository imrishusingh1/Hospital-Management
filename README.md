# Healthcare Workflow System

A complete MERN stack application for managing hospital workflows. Features role-based access control for Admins, Doctors, and Patients.

## Features
- **Admin**: Dashboard with analytics (Recharts), manage users and appointments.
- **Doctor**: View assigned appointments, prescribe medicine, view patients.
- **Patient**: Book appointments, view history, access prescriptions.
- **Backend Architecture**: Node.js, Express, MongoDB, JWT Auth, Audit Logging, Rate Limiting, structured MVC pattern. Redis support for caching analytics.
- **Frontend Architecture**: React (Vite), Tailwind CSS, Context API for state management, Axios interceptors.

## Requirements
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)
- Redis (Optional, used for caching if `REDIS_URL` is set in the backend `.env`)

## Project Setup

### 1. Database and Environment
The `.env` file is already created in the `backend/` directory with sensible defaults for local development.

#### SMTP + Approval system (Admin/Doctor)
Admin and Doctor account creation is **approval-based**. When someone tries to sign up as Admin or Doctor, the backend emails an approval link to `rishukrsingh99p@gmail.com`. Only after clicking that link will the account be created and able to log in.

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
# Optional
SMTP_FROM=your_gmail@gmail.com
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
- **Doctor2**: `doctor2@healthflow.com` / `password123`
- **Patient**: `patient@healthflow.com` / `password123`
- **Patient2**: `patient2@healthflow.com` / `password123`
- **Patient3**: `patient3@healthflow.com` / `password123`

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, React-Router, Recharts, Lucide-React, React-Hot-Toast.
- **Backend**: Express.js, Mongoose, JsonWebToken, Bcryptjs, Redis, Helmet, Morgan.

## Future Enhancements
- Integration with payment gateways for consultation fees.
- Real-time chat between doctor and patient using Socket.io.
- Advanced pagination and filtering on the frontend.
