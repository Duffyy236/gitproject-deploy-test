import { Router } from "express";
import { ApiError } from "./core/http/ApiError"; // ⬅️ ajout

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// Démo d'une erreur contrôlée
router.get("/boom", (_req, _res) => {
    throw new ApiError(400, "Bad request example", { hint: "demo only" });
});

export { router };
