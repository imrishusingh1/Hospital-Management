import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import Landing from './pages/Landing';

// Placeholder components for other pages
const DoctorDashboard = () => <div className="p-6 card">Doctor Dashboard Coming Soon</div>;
const PatientDashboard = () => <div className="p-6 card">Patient Dashboard Coming Soon</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<div>User Management</div>} />
              <Route path="/admin/appointments" element={<div>All Appointments</div>} />
            </Route>
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<div>My Appointments</div>} />
              <Route path="/doctor/patients" element={<div>My Patients</div>} />
            </Route>
          </Route>

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<div>Book Appointment</div>} />
              <Route path="/patient/profile" element={<div>My Profile</div>} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
