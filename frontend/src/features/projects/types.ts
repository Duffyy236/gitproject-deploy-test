// src/features/projects/types.ts
// Purpose: Domain types for projects, groups, and related entities.
// Notes:
// - The Project type matches what the backend returns.
// - ProjectPayload excludes backend-controlled fields (id, teacherId).
// - Group types are used by the student group creation flow.

export type Project = {
    id: number;
    key: string; // unique slug for public access (/student/:projectKey)
    name: string;
    organization: string;
    groupSizeMin: number;
    groupSizeMax: number | null;
    groupNamePattern: string;
    teacherId: number;
};

// Payload for create/update operations (frontend → backend)
export type ProjectPayload = Omit<Project, 'id' | 'teacherId'>;

// Optional aliases (for clarity)
export type CreateProjectPayload = ProjectPayload;
export type UpdateProjectPayload = ProjectPayload;

// Basic student identity
export type Student = {
    id: number;
    name: string;
    githubEmail: string;
};

// Member of a group within a project
export type GroupMember = {
    groupId: number;
    studentId: number;
    projectId: number;
    student: Student;
};

// A group belonging to a project
export type Group = {
    id: number;
    name: string;
    projectId: number;
    members: GroupMember[];
};

// Payload for group creation from the student page
export type CreateGroupMember = {
    name: string;
    githubEmail: string;
};

export type CreateGroupPayload = {
    members: CreateGroupMember[];
};
