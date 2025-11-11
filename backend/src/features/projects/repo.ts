// --- projects/repo.ts ---
import { prisma } from "../../db/prisma/client";
import type { Prisma } from "@prisma/client";


export const projectsRepo = {
    listByTeacher(teacherId: number) {
        return prisma.project.findMany({
            where: { teacherId },
            orderBy: { id: "desc" },
        });
    },


    findOwned(projectId: number, teacherId: number) {
        return prisma.project.findFirst({
            where: { id: projectId, teacherId },
        });
    },


    create(data: Prisma.ProjectCreateInput) {
        return prisma.project.create({ data });
    },


    update(projectId: number, data: Prisma.ProjectUpdateInput) {
        return prisma.project.update({ where: { id: projectId }, data });
    },

    getById(projectId: number) {
        return prisma.project.findUnique({ where: { id: projectId } });
    },

    countGroups(projectId: number) {
        return prisma.group.count({ where: { projectId } });
    },
    findByKey(key: string) {
        return prisma.project.findUnique({ where: { key } });
    }

};

