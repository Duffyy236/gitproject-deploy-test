// --- auth/routes.ts ---
import { Router } from "express";
import { login } from "./service";
import { requireAuth } from "../../core/auth/requireAuth";

export const authRouter = Router();

/**
 * Route: POST /auth/login
 * Purpose: Authenticates a teacher and returns a JWT + user info
 */
authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};

// Basic input validation
    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: { message: "email and password are required" } });
    }


    const result = await login(email, password);
    if (!result) {
        return res.status(401).json({ error: { message: "Invalid credentials" } });
    }


    return res.json(result);
});

/**
 * Route: GET /auth/me
 * Purpose: Returns the authenticated user from JWT
 * Header: Authorization: Bearer <token>
 */
authRouter.get("/me", requireAuth, (req, res) => {
    return res.json({ user: req.user });
});