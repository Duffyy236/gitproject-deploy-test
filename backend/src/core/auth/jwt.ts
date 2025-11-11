// --- core/auth/jwt.ts ---
import * as jwt from "jsonwebtoken";


const SECRET: jwt.Secret = process.env.JWT_SECRET ?? "dev_secret_change_me";
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1d") as jwt.SignOptions["expiresIn"];


export type AppJwtPayload = {
    sub: number; // Teacher ID
    email: string;
};


/**
 * Signs and returns a JWT containing the user payload
 */
export function signJwt(payload: AppJwtPayload): string {
    return jwt.sign(payload, SECRET, {
        algorithm: "HS256",
        expiresIn: EXPIRES_IN,
    });
}


/**
 * Verifies and extracts payload from a JWT
 */
export function verifyJwt(token: string): AppJwtPayload {
    const decoded = jwt.verify(token, SECRET);


    if (typeof decoded === "string" || !decoded) {
        throw new Error("Invalid token payload");
    }


    const d = decoded as jwt.JwtPayload & { email?: string; sub?: string | number };


    const email = d.email;
    const subRaw = d.sub;


    if (typeof email !== "string") throw new Error("Invalid token payload (email)");
    if (typeof subRaw !== "string" && typeof subRaw !== "number") {
        throw new Error("Invalid token payload (sub)");
    }


    const sub = typeof subRaw === "string" ? Number(subRaw) : subRaw;
    if (!Number.isFinite(sub)) throw new Error("Invalid token payload (sub NaN)");


    return { sub, email };
}