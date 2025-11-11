import { useEffect, useState } from 'react';
import { getGroupsByProjectId } from '../api'; // ← déjà dans projects/api.ts
import type { Group } from '../types';

export default function useProjectGroups(projectId?: number) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown | null>(null);

    useEffect(() => {
        if (!projectId) return;

        setLoading(true);
        setError(null);

        getGroupsByProjectId(projectId)
            .then(setGroups)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [projectId]);

    return { groups, loading, error };
}
