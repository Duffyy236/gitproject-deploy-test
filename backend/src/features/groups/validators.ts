// backend/src/features/groups/validators.ts
import { z } from "zod";

// login GitHub: lettres/chiffres, tirets, max 39
const githubLoginRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const createGroupWithMembersSchema = z.object({
    members: z.array(
        z.object({
            name: z.string().min(1),
            // ⬇️ on garde la clé "githubEmail", mais on valide un login GitHub
            githubEmail: z.string().regex(githubLoginRegex, "Login GitHub invalide"),
            // Si tu veux tolérer encore un email pendant la transition, utilise:
            // githubEmail: z.union([z.string().email(), z.string().regex(githubLoginRegex)]),
        })
    ).min(1),
});

export type CreateGroupPayload = z.infer<typeof createGroupWithMembersSchema>;
