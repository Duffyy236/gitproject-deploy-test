// src/features/auth/context/AuthContext.tsx
// Purpose: Global authentication context for teachers.
// Highlights:
// - Restores session on mount (reads token from localStorage and calls meApi).
// - login(email, password) calls loginApi, stores token, and sets the user.
// - logout() clears token and user.
// - isHydrated indicates when the initial auth check has completed to avoid premature redirects.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loginApi, meApi } from '../../auth/api';

type TeacherUser = { id: number | string; email: string };
type User = TeacherUser | null;

type AuthContextValue = {
    user: User;
    isHydrated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const TOKEN_KEY = 'auth:token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    // Restore session on first mount if a token exists.
    useEffect(() => {
        let cancelled = false;

        async function restore() {
            try {
                const token = window.localStorage.getItem(TOKEN_KEY);
                if (!token) return;

                // meApi relies on Axios interceptor to attach Authorization header
                const profile = await meApi();
                if (!cancelled) setUser(profile);
            } catch {
                // Invalid token or network error -> clear stale token
                window.localStorage.removeItem(TOKEN_KEY);
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setIsHydrated(true);
            }
        }

        restore();
        return () => {
            cancelled = true;
        };
    }, []);

    // Perform login with credentials, persist token, and set user.
    async function login(email: string, password: string) {
        const { token, user } = await loginApi({ email, password });
        window.localStorage.setItem(TOKEN_KEY, token);
        setUser(user);
        setIsHydrated(true);
    }

    // Clear session
    function logout() {
        window.localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsHydrated(true);
    }

    const value = useMemo<AuthContextValue>(
        () => ({ user, isHydrated, login, logout }),
        [user, isHydrated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
