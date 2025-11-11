// src/features/auth/ProtectedRoute.tsx
// Purpose: Guard component to protect private routes.
// Notes:
// - Waits for `isHydrated` to avoid premature redirects during session restore.
// - Redirects unauthenticated users to /login.
// - Renders children when authenticated.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
    const { user, isHydrated } = useAuth();

    // While auth is still restoring (checking token), render nothing or a loader placeholder.
    if (!isHydrated) return null;

    // After hydration, if there is no authenticated user, redirect to login.
    if (!user) return <Navigate to="/login" replace />;

    // Authenticated: render the protected content.
    return <>{children}</>;
}
