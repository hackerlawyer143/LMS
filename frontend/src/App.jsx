import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import CourseAssignments from './pages/CourseAssignments';
import CourseQuizzes from './pages/CourseQuizzes';
import QuizTake from './pages/QuizTake';
import CourseResults from './pages/CourseResults';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Catalog />} />
            <Route path="course/:id" element={<CourseDetail />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route
              path="dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="course/:courseId/assignments"
              element={
                <PrivateRoute>
                  <CourseAssignments />
                </PrivateRoute>
              }
            />
            <Route
              path="course/:courseId/quizzes"
              element={
                <PrivateRoute>
                  <CourseQuizzes />
                </PrivateRoute>
              }
            />
            <Route
              path="quiz/:id"
              element={
                <PrivateRoute>
                  <QuizTake />
                </PrivateRoute>
              }
            />
            <Route
              path="course/:courseId/results"
              element={
                <PrivateRoute>
                  <CourseResults />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/reports"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminReports />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
