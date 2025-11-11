// --- groups/repo.ts ---
import { prisma } from "../../db/prisma/client";
import type { Prisma } from "@prisma/client";


export const groupsRepo = {
    create(data: Prisma.GroupCreateInput) {
        return prisma.group.create({ data });
    },


    listWithMembers(projectId: number) {
        return prisma.group.findMany({
            where: { projectId },
            include: {
                members: { include: { student: true } },
            },
            orderBy: { id: "asc" },
        });
    },


    upsertStudentByEmail(name: string, githubEmail: string) {
        return prisma.student.upsert({
            where: { githubEmail },
            update: { name },
            create: { name, githubEmail },
        });
    },


    addMembership(groupId: number, studentId: number, projectId: number) {
        return prisma.groupMember.create({
            data: { groupId, studentId, projectId },
            include: { student: true },
        });
    },
};