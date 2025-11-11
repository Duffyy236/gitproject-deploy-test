import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as projectsApi from '../../features/projects/api';
import type { Project } from '../../features/projects/types';
import { Card, Button, TextField } from '../../shared/ui'; // ✅ index unique
import styles from './Student.module.scss';

type MemberInput = { name: string; githubEmail: string };

export default function StudentPage() {
    const { projectKey } = useParams<{ projectKey: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<MemberInput[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Chargement du projet
    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!projectKey) {
                setError('Clé de projet manquante.');
                setLoading(false);
                return;
            }
            try {
                const p = await projectsApi.getByKey(projectKey);
                if (cancelled) return;
                setProject(p);

                const min = Math.max(1, p.groupSizeMin ?? 1);
                setMembers(Array.from({ length: min }, () => ({ name: '', githubEmail: '' })));
            } catch (e: any) {
                if (!cancelled) setError(e.message || 'Projet introuvable.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [projectKey]);

    const minSize = project?.groupSizeMin ?? 1;
    const maxSize = project?.groupSizeMax ?? null;

    function setMember(i: number, key: keyof MemberInput, value: string) {
        setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
    }

    function addMember() {
        if (maxSize != null && members.length >= maxSize) return;
        setMembers([...members, { name: '', githubEmail: '' }]);
    }

    function removeMember(i: number) {
        if (members.length <= minSize) return;
        setMembers(members.filter((_, idx) => idx !== i));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!project) return;

        try {
            setSaving(true);
            await projectsApi.createStudentGroup(project.id, {
                members: members.map((m) => ({
                    name: m.name.trim(),
                    githubEmail: m.githubEmail.trim(),
                })),
            });
            setSaved(true);
        } catch (e: any) {
            setError(e.message || 'Erreur lors de la création du groupe.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <p>Chargement…</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Projet : {project.name}</h1>
            <p className={styles.subtitle}>
                Taille de groupe : min {minSize}
                {maxSize != null ? ` / max ${maxSize}` : ''}
            </p>

            {saved && <div className={styles.alertSuccess}>Groupe créé avec succès.</div>}
            {error && <div className={styles.alertError}>{error}</div>}

            <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.cardsGrid}>
                    {members.map((m, i) => (
                        <Card key={i} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitle}>Membre {i + 1}</div>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => removeMember(i)}
                                    disabled={saving || members.length <= minSize}
                                >
                                    Retirer
                                </Button>
                            </div>

                            <div className={styles.cardBody}>
                                <TextField
                                    id={`name-${i}`}
                                    label="Nom"
                                    placeholder="Prénom Nom"
                                    value={m.name}
                                    onChange={(v) => setMember(i, 'name', v)} // ⚠️ TextField doit appeler onChange(value: string)
                                />
                                <TextField
                                    id={`github-${i}`}
                                    label="Identifiant GitHub"
                                    placeholder="ex: octocat"
                                    value={m.githubEmail}
                                    onChange={(v) => setMember(i, 'githubEmail', v)}
                                />

                            </div>
                        </Card>
                    ))}
                </div>

                <div className={styles.actions}>
                    <Button
                        type="button"
                        onClick={addMember}
                        disabled={saving || (maxSize != null && members.length >= maxSize)}
                    >
                        Ajouter un membre
                    </Button>

                    <Button type="submit" disabled={saving}>
                        Créer le groupe
                    </Button>
                </div>
            </form>
        </div>
    );
}
