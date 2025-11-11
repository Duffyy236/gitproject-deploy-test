// --- groups/name.ts ---
// Utility to render group name from pattern like "G-${n}"
export function renderGroupName(pattern: string, n: number) {
    return pattern.replace(/\$\{n\}/g, String(n));
}