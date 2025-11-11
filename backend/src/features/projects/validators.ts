// --- projects/validators.ts ---
import { z } from "zod";


export const createProjectSchema = z.object({
    key: z.string().min(1),
    name: z.string().min(1),
    organization: z.string().min(1),
    groupSizeMin: z.number().int().min(1),
    groupSizeMax: z.number().int().min(1).optional(),
    groupNamePattern: z.string().min(1),
});


export const updateProjectSchema = createProjectSchema.partial().refine(
    (data) => {
        if (data.groupSizeMin && data.groupSizeMax) {
            return data.groupSizeMax >= data.groupSizeMin;
        }
        return true;
    },
    { message: "groupSizeMax must be >= groupSizeMin" }
);


export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;