// src/app.ts
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { router } from "./routes";
import { errorHandler } from "./core/http/errorHandler";

// Features
import { authRouter } from "./features/auth/routes";
import { projectsRouter } from "./features/projects/routes";
import { groupsRouter } from "./features/groups/routes";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());

// anti brute-force uniquement sur le login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_LOGIN || 10),
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/auth/login", loginLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api", groupsRouter);
app.use("/api", router);

// Gestion d’erreurs
app.use(errorHandler);

export { app };
