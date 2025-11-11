// src/app/App.tsx
// Purpose: Define application routes with public/private separation,
//          default redirect to /login, login wrapper that redirects if already authenticated,
//          explicit /editing/new route for creation, and a 404 fallback.
//
// Public routes: /login, /student/:projectKey
// Private routes: /teacher, /editing/new, /editing/:projectKey

import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import { useAuth } from '../features/auth/context/AuthContext';

// Pages
import LoginPage from '../pages/Login';
import TeacherPage from '../pages/Teacher';
import StudentPage from '../pages/Student';
import EditingPage from '../pages/Editing';

// Minimal 404 page
function NotFound() {
    return (
        <div style={{ maxWidth: 640, margin: '24px auto' }}>
            <h1>404</h1>
            <p>La page demandée est introuvable.</p>
            <p>
                <Link to="/login">Aller à la page de connexion</Link>
            </p>
        </div>
    );
}

// Wrapper for /login that redirects authenticated users to /teacher.
// Waits for hydration to avoid premature redirects during session restore.
function LoginRoute() {
    const { user, isHydrated } = useAuth();

    if (!isHydrated) {
        return null; // or a lightweight loading indicator
    }

    if (user) {
        return <Navigate to="/teacher" replace />;
    }

    return <LoginPage />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default landing */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public routes */}
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/student/:projectKey" element={<StudentPage />} />

                {/* Private routes */}
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute>
                            <TeacherPage />
                        </ProtectedRoute>
                    }
                />
                {/* Explicit creation route */}
                <Route
                    path="/editing/new"
                    element={
                        <ProtectedRoute>
                            <EditingPage />
                        </ProtectedRoute>
                    }
                />
                {/* Edition by project key */}
                <Route
                    path="/editing/:projectKey"
                    element={
                        <ProtectedRoute>
                            <EditingPage />
                        </ProtectedRoute>
                    }
                />

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
