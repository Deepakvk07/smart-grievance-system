import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProtectedRoute } from './components/ProtectedRoute';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ComplaintDetail } from './pages/citizen/ComplaintDetail';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminComplaintDetail } from './pages/admin/AdminComplaintDetail';

import { NotFound } from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Grievance User Portal (Public & Direct) */}
          <Route path="/" element={<CitizenDashboard />} />
          <Route path="/dashboard" element={<CitizenDashboard />} />

          {/* Public Complaint Tracking */}
          <Route path="/complaints/:id" element={<ComplaintDetail />} />

          {/* Legacy Citizen Routes Redirecting directly to the Website */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/submit" element={<Navigate to="/" replace />} />
          <Route path="/complaints" element={<Navigate to="/" replace />} />
          <Route path="/notifications" element={<Navigate to="/" replace />} />

          {/* Admin Public Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}
          />
          <Route
            path="/admin/departments"
            element={<AdminProtectedRoute><AdminDepartments /></AdminProtectedRoute>}
          />
          <Route
            path="/admin/complaints/:id"
            element={<AdminProtectedRoute><AdminComplaintDetail /></AdminProtectedRoute>}
          />

          {/* Legacy Duplicate Admin Routes -> Redirect to Unified Dashboard */}
          <Route
            path="/admin/priority-queue"
            element={<Navigate to="/admin/dashboard?tab=urgent" replace />}
          />
          <Route
            path="/admin/complaints"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/analytics"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/users"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/reports"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
