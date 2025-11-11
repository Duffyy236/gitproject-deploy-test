// src/index.tsx
// Purpose: React application entry point.
// Notes:
// - Imports global styles once for the entire app.
// - Wraps <App /> with <AppProviders /> to inject global contexts (auth, etc.).

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import AppProviders from './app/providers/AppProviders';

// Import global styles (only once)
import './shared/styles/index.scss';

// Mount the app under #root with React.StrictMode for extra checks in dev
createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>
);
