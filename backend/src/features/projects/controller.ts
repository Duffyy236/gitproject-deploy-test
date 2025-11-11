// --- projects/controller.ts ---
import type { Request, Response, NextFunction } from "express";
import { projectsService } from "./service";
import { createProjectSchema, updateProjectSchema } from "./validators";


export const projectsController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await projectsService.listForTeacher(req.user.id);
            res.json({ items });
        } catch (e) { next(e); }
    },


    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const project = await projectsService.getOneOwned(req.user.id, id);
            res.json(project);
        } catch (e) { next(e); }
    },


    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const parsed = createProjectSchema.parse(req.body);

            const fixed = {
                ...parsed,
                groupSizeMax: parsed.groupSizeMax ?? null, // Convert undefined → null
            };

            const created = await projectsService.create(req.user.id, fixed);
            res.status(201).json(created);
        } catch (e) {
            next(e);
        }
    },



    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const parsed = updateProjectSchema.parse(req.body);
            const updated = await projectsService.update(req.user.id, id, parsed);
            res.json(updated);
        } catch (e) { next(e); }
    },
    async getByKey(req: Request, res: Response, next: NextFunction) {
        try {
            const key = req.params.key;
            const project = await projectsService.getByKey(key);
            if (!project) {
                return res.status(404).json({ error: { message: "Projet introuvable" } });
            }
            res.json(project);
        } catch (e) { next(e); }
    }

};