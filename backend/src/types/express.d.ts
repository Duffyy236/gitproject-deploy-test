import "express";

declare global {
    namespace Express {
        /** Ce que contient req.user après requireAuth */
        interface User {
            id: number;
            email: string;
        }

        /** On étend le type Request pour inclure user */
        interface Request {
            user: User;
        }
    }
}

export {};
