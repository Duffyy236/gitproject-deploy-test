// src/pages/Login/index.tsx
// Purpose: Handle teacher login using email and password with external CSS module.
// Notes:
// - Keeps local form state (email/password).
// - Delegates session creation to AuthContext via login(email, password).
// - Displays a basic error message on failure and disables the form while submitting.

import {type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import styles from './Login.module.scss';

export default function LoginPage() {
    // Local form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState<string>('');

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        // Basic client-side validation
        if (!email || !password) {
            setErrorMsg('Veuillez renseigner votre email et votre mot de passe.');
            return;
        }

        try {
            setSubmitting(true);
            await login(email, password);
            navigate('/teacher', { replace: true });
        } catch (err: any) {
            // `api` normalizes errors to have a readable message; fallback if missing
            setErrorMsg(err?.message || "Échec de la connexion. Vérifiez vos identifiants.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Connexion</h1>
            <p className={styles.subtitle}>
                Entrez vos identifiants enseignants pour accéder à l’espace.
            </p>

            {errorMsg && <div className={styles.alert}>{errorMsg}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                    Email
                    <input
                        type="email"
                        autoComplete="email"
                        className={styles.input}
                        placeholder="nom.prenom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                    />
                </label>

                <label className={styles.label}>
                    Mot de passe
                    <input
                        type="password"
                        autoComplete="current-password"
                        className={styles.input}
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={submitting}
                    />
                </label>

                <button type="submit" className={styles.submit} disabled={submitting}>
                    {submitting ? 'Connexion…' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
}
