// src/pages/Editing/index.tsx
// Purpose: Create or edit a project using its projectKey in the URL.
// Routes:
//   - /editing/new             -> creation
//   - /editing/:projectKey     -> edition (load by key, update by id)
//
// Notes:
// - We load the project by key when editing, then update by numeric id.
// - We optionally guard edition by teacher ownership on the client, but the backend must enforce authorization.

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as projectsApi from '../../features/projects/api';
import type { Project } from '../../features/projects/types';
import TextField from '../../shared/ui/TextField/TextField';
import Button from '../../shared/ui/Button/Button';
import { useAuth } from '../../features/auth/context/AuthContext';
import styles from './Editing.module.scss';

import ProjectGroupsSection from './ProjectGroupsSection';

type FormState = {
    key: string;
    name: string;
    organization: string;
    groupSizeMin: number;
    groupSizeMax: number | null;
    groupNamePattern: string;
};

export default function EditingPage() {
    // projectKey is present in edition, absent in creation (/editing/new)
    const { projectKey } = useParams<{ projectKey?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Creation when URL is /editing/new or key is missing
    const isCreate = useMemo(() => !projectKey, [projectKey]);

    // Keep the loaded project for edition
    const [loadedProject, setLoadedProject] = useState<Project | null>(null);

    // Form state
    const [form, setForm] = useState<FormState>({
        key: '',
        name: '',
        organization: '',
        groupSizeMin: 1,
        groupSizeMax: null,
        groupNamePattern: 'G-${n}',
    });

    // UI state
    const [loading, setLoading] = useState<boolean>(!isCreate);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [forbidden, setForbidden] = useState<boolean>(false);

    // Load project when editing, by key
    const load = useCallback(async () => {
        if (!projectKey) return;
        setErr(null);
        setForbidden(false);
        setLoading(true);
        try {
            const p = await projectsApi.getByKey(projectKey);

            // Optional client guard: ensure the connected teacher owns the project.
            // The backend must enforce authorization anyway.
            if (user?.id != null && p.teacherId !== Number(user.id)) {
                setForbidden(true);
                setLoadedProject(null);
                return;
            }

            setLoadedProject(p);
            setForm({
                key: p.key,
                name: p.name,
                organization: p.organization,
                groupSizeMin: p.groupSizeMin,
                groupSizeMax: p.groupSizeMax,
                groupNamePattern: p.groupNamePattern,
            });
        } catch (e: any) {
            setErr(e.message || 'Failed to load project');
            setLoadedProject(null);
        } finally {
            setLoading(false);
        }
    }, [projectKey, user?.id]);

    useEffect(() => {
        if (!isCreate) {
            void load();
        } else {
            // Reset a clean form for creation mode
            setLoadedProject(null);
            setForm({
                key: '',
                name: '',
                organization: '',
                groupSizeMin: 1,
                groupSizeMax: 1,
                groupNamePattern: '',
            });
            setErr(null);
            setForbidden(false);
            setLoading(false);
        }
    }, [isCreate, load]);

    // Utilities for form updates
    function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    const toInt = (v: string, fallback = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    };

    // Submit handler
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setSaving(true);

        const payload = {
            key: isCreate ? 'GENERATE_ON_BACKEND' : form.key.trim(),
            name: form.name.trim(),
            organization: form.organization.trim(),
            groupSizeMin: Number(form.groupSizeMin) || 1,
            groupSizeMax:
                form.groupSizeMax === null || (form.groupSizeMax as unknown as string) === ''
                    ? null
                    : Number(form.groupSizeMax),
            groupNamePattern: (form.groupNamePattern.trim() + "-${n}"),
        };

        try {
            if (isCreate) {
                await projectsApi.create(payload);
            } else if (loadedProject) {
                await projectsApi.update(loadedProject.id, payload);
            }
            navigate('/teacher');
        } catch (e: any) {
            setErr(e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    // Screens
    if (loading) {
        return (
            <div className={styles.container}>
                <p>Chargement…</p>
            </div>
        );
    }

    if (!isCreate && forbidden) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Accès refusé</h1>
                <p className={styles.error}>
                    Vous ne pouvez pas éditer ce projet car il n’appartient pas à votre compte enseignant.
                </p>
                <div className={styles.actions}>
                    <Button onClick={() => navigate('/teacher')}>Retour à l’espace enseignant</Button>
                </div>
            </div>
        );
    }

    if (!isCreate && err) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Modifier le projet</h1>
                <p className={styles.error}>{err}</p>
                <div className={styles.actions}>
                    <Button onClick={() => navigate('/teacher')}>Retour</Button>
                </div>
            </div>
        );
    }

    // Main form
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{isCreate ? 'Créer un projet' : 'Modifier le projet'}</h1>
                <button className={styles.cancel} onClick={() => navigate('/teacher')}>
                    Annuler
                </button>
            </header>

            {err && <p className={styles.error}>{err}</p>}

            <form className={styles.form} onSubmit={onSubmit}>
                {!isCreate && (
                    <TextField
                        id="key"
                        label="Clé du projet"
                        placeholder="ex: algo-2025"
                        value={form.key}
                        onChange={(v) => onChange('key', v)}
                        disabled={true} // on continue de l’afficher mais verrouillé en édition
                    />
                )}

                <TextField
                    id="name"
                    label="Nom du projet"
                    placeholder="ex: Algo 2025"
                    value={form.name}
                    onChange={(v) => onChange('name', v)}
                />

                <TextField
                    id="organization"
                    label="Organisation GitHub"
                    placeholder="ex: org-algo"
                    value={form.organization}
                    onChange={(v) => onChange('organization', v)}
                />

                <div className={styles.twoCols}>
                    <TextField
                        id="groupSizeMin"
                        label="Taille minimale du groupe"
                        type="number"
                        value={String(form.groupSizeMin)}
                        onChange={(v) => onChange('groupSizeMin', toInt(v, 1))}
                        min={0}
                        step={1}
                    />
                    <TextField
                        id="groupSizeMax"
                        label="Taille maximale du groupe"
                        type="number"
                        value={form.groupSizeMax === null ? '' : String(form.groupSizeMax)}
                        onChange={(v) => onChange('groupSizeMax', v === '' ? null : toInt(v))}
                        min={0}
                        step={1}
                    />
                </div>

                <TextField
                    id="groupNamePattern"
                    label="Pattern nom de groupe"
                    placeholder="ex: Algo-Groupe"
                    value={form.groupNamePattern}
                    onChange={(v) => onChange('groupNamePattern', v)}
                />

                <div className={styles.actions}>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Enregistrement…' : isCreate ? 'Créer le projet' : 'Enregistrer'}
                    </Button>
                    {!isCreate && <span className={styles.hint}>info supprimer le pattern, si changement.</span>}
                </div>
            </form>
            {!isCreate && loadedProject && (
                <ProjectGroupsSection projectId={loadedProject.id} />
            )}
        </div>
    );
}
