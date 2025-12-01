import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivateRoute, PublicRoute } from '@/components/layout/RouteGuards';
import { Login, AuthCallback, Dashboard, FormBuilder, PublicForm } from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public Form (accessible without auth) */}
          <Route path="/f/:formId" element={<PublicForm />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/form-builder"
            element={
              <PrivateRoute>
                <FormBuilder />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e2e8f0',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;