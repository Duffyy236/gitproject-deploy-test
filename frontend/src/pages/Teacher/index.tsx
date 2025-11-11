import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProjects from '../../features/projects/hooks/useProjects';
import { useAuth } from '../../features/auth/context/AuthContext';
import type { Project } from '../../features/projects/types';
import styles from './Teacher.module.scss';


export default function TeacherPage() {
    const {
        projects = [],
        loading,
        error,
        refresh,
    } = useProjects() as {
        projects: Project[] | undefined;
        loading: boolean;
        error: boolean;
        refresh: () => void;
    };

    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    function buildStudentUrl(projectKey: string) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/student/${encodeURIComponent(projectKey)}`;
    }

    async function copyLink(projectKey: string) {
        const url = buildStudentUrl(projectKey);
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const tmp = document.createElement('textarea');
                tmp.value = url;
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand('copy');
                document.body.removeChild(tmp);
            }
            setCopiedKey(projectKey);
            window.setTimeout(() => setCopiedKey(null), 1200);
        } catch {
            // Ignorer erreurs
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Espace enseignant</h1>
                <p>Chargement des projets…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Espace enseignant</h1>
                <p className={styles.error}>Échec du chargement des projets.</p>
                <button className={styles.refresh} onClick={refresh}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Espace enseignant</h1>
                <div className={styles.actions}>
                    <Link to="/editing/new" className={styles.primaryAction}>
                        Nouveau projet
                    </Link>
                    <button
                        className={styles.logout}
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                    >
                        Se déconnecter
                    </button>
                </div>
            </header>

            {projects.length === 0 ? (
                <p>Aucun projet pour le moment.</p>
            ) : (
                <ul className={styles.list}>
                    {projects.map((p: Project) => {
                        const isCopied = copiedKey === p.key;

                        return (
                            <li key={p.id} className={styles.item}>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemTitle}>{p.name}</div>
                                    <div className={styles.itemMeta}>
                                        <span className={styles.badge}>clé: {p.key}</span>
                                        <span className={styles.sep}>•</span>
                                        <span className={styles.muted}>org: {p.organization}</span>
                                    </div>

                                    <div className={styles.shareBlock}>
                                        <label className={styles.shareLabel}>Lien étudiant</label>
                                        <div className={styles.shareRow}>

                                            <button
                                                type="button"
                                                className={styles.copyBtn}
                                                onClick={() => copyLink(p.key)}
                                                aria-label="Copier le lien"
                                            >
                                                {isCopied ? 'Copié' : 'Copier'}
                                            </button>

                                        </div>
                                    </div>
                                </div>

                                <div className={styles.itemActions}>
                                    <Link to={`/editing/${p.key}`} className={styles.link}>
                                        Modifier
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
