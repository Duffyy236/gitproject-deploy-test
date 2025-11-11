// --- core/auth/requireAuth.ts ---
import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "./jwt";


/**
 * Middleware to protect routes requiring authentication
 * Validates Bearer token and attaches user info to req.user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.header("authorization") || "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return res.status(401).json({ error: { message: "Missing token" } });
    }


    try {
        const payload = verifyJwt(match[1]);
        req.user = { id: payload.sub, email: payload.email }; // Set authenticated user
        next();
    } catch {
        return res.status(401).json({ error: { message: "Invalid or expired token" } });
    }
}