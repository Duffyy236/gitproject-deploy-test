// src/features/projects/hooks/useProjects.ts
// Purpose: Encapsulate fetching logic for the projects list.
// Notes:
// - Uses the domain API `list()`.
// - Prevents state updates after unmount.
// - Exposes a `refresh()` function to reload on demand.

import { useCallback, useEffect, useRef, useState } from 'react';
import { list } from '../../projects/api';
import type { Project } from '../../projects/types';

type UseProjectsResult = {
    projects: Project[];
    loading: boolean;
    error: unknown;
    refresh: () => Promise<void>;
};

export default function useProjects(): UseProjectsResult {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);

    // Track mount status to avoid setState on unmounted component
    const mountedRef = useRef(false);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const refresh = useCallback(async () => {
        if (!mountedRef.current) return;
        setLoading(true);
        setError(null);
        try {
            const data = await list();
            if (mountedRef.current) setProjects(data);
        } catch (e) {
            if (mountedRef.current) setError(e);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { projects, loading, error, refresh };
}
