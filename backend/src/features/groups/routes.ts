import { Router } from "express";
import { groupsController } from "./controller";
import { requireAuth } from "../../core/auth/requireAuth";

export const groupsRouter = Router();

// ✅ Public (student) route to create group + members
// POST /api/groups/project/:projectId
groupsRouter.post("/groups/project/:projectId", groupsController.createWithMembers);

// ✅ Private (teacher) route to list groups of a project
// GET /api/groups/project/:projectId
groupsRouter.get("/groups/project/:projectId", requireAuth, groupsController.list);
