// src/app/providers/AppProviders.tsx
// Purpose: Wrap the entire app with global providers.
// Notes:
// - Keep this component minimal; add new providers here as the app grows.

import type { ReactNode } from 'react';
import { AuthProvider } from '../../features/auth/context/AuthContext';

type Props = { children: ReactNode };

export default function AppProviders({ children }: Props) {
    // Add more providers here if needed (ThemeProvider, QueryClientProvider, etc.)
    return <AuthProvider>{children}</AuthProvider>;
}
