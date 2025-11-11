// --- projects/routes.ts ---
import { Router } from "express";
import { requireAuth } from "../../core/auth/requireAuth";
import { projectsController } from "./controller";

export const projectsRouter = Router();

projectsRouter.get("/key/:key", projectsController.getByKey);

// Apply authentication middleware to all routes
projectsRouter.use(requireAuth);

projectsRouter.get("/", projectsController.list);
projectsRouter.get("/:id", projectsController.getOne);
projectsRouter.post("/", projectsController.create);
projectsRouter.put("/:id", projectsController.update);

