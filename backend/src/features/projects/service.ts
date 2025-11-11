// --- projects/service.ts ---
import { projectsRepo } from "./repo";
import { nanoid } from 'nanoid';


export const projectsService = {
    async listForTeacher(teacherId: number) {
        return projectsRepo.listByTeacher(teacherId);
    },

    async getOneOwned(teacherId: number, projectId: number) {
        const project = await projectsRepo.findOwned(projectId, teacherId);
        if (!project) {
            const e: any = new Error("Project not found");
            e.status = 404;
            throw e;
        }
        return project;
    },

    async create(teacherId: number, payload: {
        name: string;
        organization: string;
        groupSizeMin: number;
        groupSizeMax: number | null;
        groupNamePattern: string;
    }) {
        const key = nanoid(10); // Génère une clé aléatoire de 10 caractères
        return projectsRepo.create({
            key,
            name: payload.name,
            organization: payload.organization,
            groupSizeMin: payload.groupSizeMin,
            groupSizeMax: payload.groupSizeMax ?? null,
            groupNamePattern: payload.groupNamePattern,
            teacher: { connect: { id: teacherId } },
        });
    },

    async update(teacherId: number, projectId: number, payload: Partial<{
        key: string;
        name: string;
        organization: string;
        groupSizeMin: number;
        groupSizeMax: number | null;
        groupNamePattern: string;
    }>) {
        await projectsService.getOneOwned(teacherId, projectId);
        return projectsRepo.update(projectId, payload);
    },
    async getByKey(key: string) {
        return projectsRepo.findByKey(key);
    }

};