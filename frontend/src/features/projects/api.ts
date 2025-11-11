// src/features/projects/api.ts
// Purpose: Project-related HTTP calls using typed http helpers.

import { http } from '../../shared/lib/api';
import type {
    Project,
    ProjectPayload,
    Group,
    CreateGroupPayload,
} from './types';

const PROJECTS_PATH = '/projects';

// GET /projects
export async function list(): Promise<Project[]> {
    const res = await http.get<{ items: Project[] }>(PROJECTS_PATH);
    console.log("Résultat brut de /projects :", res);
    return res.items; // ✅ Extraction du tableau
}

// GET /projects/:id
export async function getOne(id: number): Promise<Project> {
    return http.get<Project>(`${PROJECTS_PATH}/${id}`);
}

// GET /projects/key/:key   (adapt path to your backend)
export async function getByKey(key: string): Promise<Project> {
    return http.get<Project>(`${PROJECTS_PATH}/key/${encodeURIComponent(key)}`);
}

// POST /projects
export async function create(payload: ProjectPayload): Promise<Project> {
    return http.post<Project>(PROJECTS_PATH, payload);
}

// PUT /projects/:id
export async function update(id: number, payload: ProjectPayload): Promise<Project> {
    return http.put<Project>(`${PROJECTS_PATH}/${id}`, payload);
}

// DELETE /projects/:id
export async function remove(id: number): Promise<void> {
    return http.delete<void>(`${PROJECTS_PATH}/${id}`);
}

// Fonction pour les étudiants (publique)
export async function createStudentGroup(
    projectId: number,
    payload: CreateGroupPayload
): Promise<Group> {
    return http.post<Group>(`/groups/project/${projectId}`, payload);
}

export async function getGroupsByProjectId(projectId: number): Promise<Group[]> {
    const res = await http.get<{ groups: Group[] }>(`/groups/project/${projectId}`);
    return res.groups;
}

