// src/integrations/github.ts
import axios, { AxiosError } from "axios";

function asGitHubError(e: unknown) {
    const err = e as AxiosError<any>;
    const status = err?.response?.status;
    const message = err?.response?.data?.message ?? err?.message ?? "GitHub error";
    return { status, message, data: err?.response?.data };
}

export function githubClient(token: string) {
    const http = axios.create({
        baseURL: "https://api.github.com",
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
        },
        timeout: 15_000,
    });

    return {
        async createOrgRepo(org: string, name: string) {
            try {
                return await http.post(`/orgs/${encodeURIComponent(org)}/repos`, {
                    name,
                    private: true,
                    auto_init: true,       // crée README.md par défaut
                    has_issues: false,
                    has_projects: false,
                    has_wiki: false,
                });
            } catch (e) {
                throw asGitHubError(e);
            }
        },

        async addRepoCollaborator(
            org: string,
            repo: string,
            username: string,
            permission: "pull" | "push" | "maintain" | "admin" = "push"
        ) {
            try {
                return await http.put(
                    `/repos/${encodeURIComponent(org)}/${encodeURIComponent(repo)}/collaborators/${encodeURIComponent(username)}`,
                    null,
                    { params: { permission } }
                );
            } catch (e) {
                throw asGitHubError(e);
            }
        },
    };
}
