import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import Landing from './pages/Landing';
import PublicDoctorProfile from './pages/PublicDoctorProfile';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientRecords from './pages/patient/PatientRecords';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorProfile from './pages/doctor/DoctorProfile';

import UserManagement from './pages/admin/UserManagement';
import AllAppointments from './pages/admin/AllAppointments';
import ServiceManagement from './pages/admin/ServiceManagement';
import FAQManagement from './pages/admin/FAQManagement';
import PatientChat from './pages/patient/PatientChat';
import DoctorChat from './pages/doctor/DoctorChat';

import NotFound from './pages/NotFound';
import ApprovalStatus from './pages/ApprovalStatus';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              maxWidth: '420px',
            },
            success: { iconTheme: { primary: '#107c9f', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/doctor-profile/:id" element={<PublicDoctorProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/approve" element={<ApprovalStatus />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/appointments" element={<AllAppointments />} />
              <Route path="/admin/services" element={<ServiceManagement />} />
              <Route path="/admin/faqs" element={<FAQManagement />} />
            </Route>
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/chat" element={<DoctorChat />} />
            </Route>
          </Route>

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient/records" element={<PatientRecords />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/patient/chat" element={<PatientChat />} />
            </Route>
          </Route>
          
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
