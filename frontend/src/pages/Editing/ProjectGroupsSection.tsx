import useProjectGroups from '../../features/projects/hooks/useProjectGroups.ts';
import styles from './ProjectGroupsSection.module.scss';

type Props = {
    projectId?: number;
};

export default function ProjectGroupsSection({ projectId }: Props) {
    const { groups, loading, error } = useProjectGroups(projectId);
    const errorMessage = error ? String(error) : null;

    if (!projectId) return null;

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>Groupes du projet</h2>

            {loading && <p>Chargement des groupes…</p>}
            {errorMessage && <p className={styles.error}>Erreur : {errorMessage}</p>}

            {groups.length === 0 && !loading && <p>Aucun groupe créé pour ce projet.</p>}

            <ul className={styles.groupList}>
                {groups.map((g) => (
                    <li key={g.id} className={styles.groupItem}>
                        <strong className={styles.groupName}>{g.name}</strong>
                        <ul className={styles.memberList}>
                            {g.members.map((m) => (
                                <li key={`${m.groupId}-${m.studentId}`}>
                                    {m.student.name} — <em>{m.student.githubEmail}</em>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </section>
    );
}
