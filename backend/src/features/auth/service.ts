// --- auth/service.ts ---
import { prisma } from "../../db/prisma/client";
import bcrypt from "bcrypt";
import { signJwt } from "../../core/auth/jwt";


/**
 * Logs in a teacher by checking credentials and returning a signed JWT
 */
export async function login(email: string, password: string) {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) return null; // Email not found


    const ok = await bcrypt.compare(password, teacher.passwordHash);
    if (!ok) return null; // Password mismatch


    const token = signJwt({ sub: teacher.id, email: teacher.email });


    return {
        token,
        teacher: { id: teacher.id, email: teacher.email },
    };
}