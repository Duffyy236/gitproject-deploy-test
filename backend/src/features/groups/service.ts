// --- groups/service.ts ---
import { groupsRepo } from "./repo";
import { projectsRepo } from "../projects/repo";
import { renderGroupName } from "./name";
import type { CreateGroupPayload } from "./validators";

import { githubClient } from "../../integrations/github";
import { prisma } from "../../db/prisma/client";
import { ApiError } from "../../core/http/ApiError";


export const groupsService = {
    /**
     * For students: create a group + add members (public route)
     */
    async createWithMembers(projectId: number, payload: CreateGroupPayload) {
        const project = await projectsRepo.getById(projectId);
        if (!project) throw new Error("Project not found");


        const base = await projectsRepo.countGroups(projectId);
        let n = base + 1;
        let group;


        for (;;) {
            const name = renderGroupName(project.groupNamePattern, n);
            try {
                group = await groupsRepo.create({ name, project: { connect: { id: projectId } } });
                break;
            } catch (e: any) {
                if (e?.code === "P2002") {
                    n++; // retry if name already exists
                    continue;
                }
                throw e;
            }
        }


        const members = [];
        for (const m of payload.members) {
            const student = await groupsRepo.upsertStudentByEmail(m.name, m.githubEmail);
            const link = await groupsRepo.addMembership(group.id, student.id, projectId);
            members.push(link);
        }

        //  --- Provisionnement GitHub ---
        const org = project.organization;                    // ex: "org-algo"
        const repoName = `${project.name}-${group.name}`;    // convention demandée

// Récupérer le token PAT du prof propriétaire du projet
        const teacher = await prisma.teacher.findUnique({ where: { id: project.teacherId } });
        if (!teacher?.githubToken) {
            throw new ApiError(502, "GitHub token manquant pour l'enseignant propriétaire du projet");
        }

        const gh = githubClient(teacher.githubToken);

        try {
            // a) Créer le dépôt (privé + README via auto_init)
            await gh.createOrgRepo(org, repoName).catch((e: any) => {
                const status = e?.status;
                const msg = String(e?.message || "");
                // Idempotence minimale : si le nom existe déjà, on continue
                if (status === 422 && msg.includes("name already exists")) return;
                throw e;
            });

            // b) Ajouter chaque membre en permission "push"
            for (const link of members) {
                const username = link.student.githubEmail; // <-- utilisé comme "username" GitHub
                await gh.addRepoCollaborator(org, repoName, username, "push").catch((e: any) => {
                    // On journalise mais on n'échoue pas toute l'opération pour un membre
                    console.warn(`[GitHub] collaborator failed for ${username}:`, e?.status, e?.message);
                });
            }
        } catch (e: any) {
            // Erreur bloquante côté GitHub -> 502
            throw new ApiError(502, "GitHub provisioning failed", e);
        }


        return { ...group, members };
    },


    /**
     * For teacher: list groups and members for a project
     */
    async listWithMembers(projectId: number, teacherId: number) {
        const project = await projectsRepo.findOwned(projectId, teacherId);
        if (!project) throw new Error("Project not found");


        return groupsRepo.listWithMembers(projectId);
    },
};