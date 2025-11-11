// --- groups/controller.ts ---
import type { Request, Response, NextFunction } from "express";
import { groupsService } from "./service";
import { createGroupWithMembersSchema } from "./validators";


export const groupsController = {
    async createWithMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = Number(req.params.projectId);
            if (!Number.isFinite(projectId)) {
                return res.status(400).json({ error: { message: "Invalid projectId" } });
            }


            const parsed = createGroupWithMembersSchema.parse(req.body);
            const group = await groupsService.createWithMembers(projectId, parsed);
            res.status(201).json(group);
        } catch (e) { next(e); }
    },


    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = Number(req.params.projectId);
            if (!Number.isFinite(projectId)) {
                return res.status(400).json({ error: { message: "Invalid projectId" } });
            }


            const groups = await groupsService.listWithMembers(projectId, req.user.id);
            res.json({ groups });
        } catch (e) { next(e); }
    },
};