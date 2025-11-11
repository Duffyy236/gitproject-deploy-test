import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: { message: err.message, details: err.details ?? null }
        });
    }
    console.error(err);
    return res.status(500).json({ error: { message: "Internal Server Error" } });
}
