import { prisma } from "./client";
import bcrypt from "bcrypt";

// util: génère "G-1", "G-2"… à partir du pattern "G-${n}"
const nameFromPattern = (pattern: string, n: number) =>
    pattern.replace("${n}", String(n));

// crée/retourne le prochain nom de groupe disponible pour un projet
async function nextGroupName(projectId: number, pattern: string) {
    const count = await prisma.group.count({ where: { projectId } });
    // simple incrément — garanti unique par @@unique([projectId, name])
    return nameFromPattern(pattern, count + 1);
}

// crée un groupe avec nom auto (pattern + n), retourne le groupe
async function createGroupWithAutoName(projectId: number, pattern: string) {
    const name = await nextGroupName(projectId, pattern);
    return prisma.group.create({ data: { name, projectId } });
}

async function main() {
    // ————————————————————————
    // 1) TEACHERS
    // ————————————————————————
    const [t1, t2] = await Promise.all([
        prisma.teacher.upsert({
            where: { email: "prof@example.com" },
            update: {},
            create: {
                email: "prof@example.com",
                passwordHash: await bcrypt.hash("Admin123!", 10),
                githubToken: "ghp_demo_token_123",
            },
        }),
        prisma.teacher.upsert({
            where: { email: "jane.doe@school.edu" },
            update: {},
            create: {
                email: "jane.doe@school.edu",
                passwordHash: await bcrypt.hash("Admin456!", 10),
                githubToken: "ghp_demo_token_456",
            },
        }),
    ]);

    // ————————————————————————
    // 2) PROJECTS
    // ————————————————————————
    const [p1, p2, p3] = await Promise.all([
        prisma.project.upsert({
            where: { key: "demo-projet" },
            update: {},
            create: {
                key: "demo-projet",
                name: "Projet Démo",
                organization: "org-demo",
                groupSizeMin: 1,
                groupSizeMax: 5,
                groupNamePattern: "G-${n}",
                teacherId: t1.id,
            },
        }),
        prisma.project.upsert({
            where: { key: "algo-2025" },
            update: {},
            create: {
                key: "algo-2025",
                name: "Algo 2025",
                organization: "org-algo",
                groupSizeMin: 2,
                groupSizeMax: 4,
                groupNamePattern: "ALGO-${n}",
                teacherId: t1.id,
            },
        }),
        prisma.project.upsert({
            where: { key: "webapp-ii" },
            update: {},
            create: {
                key: "webapp-ii",
                name: "Web App II",
                organization: "org-webapp",
                groupSizeMin: 2,
                groupSizeMax: 6,
                groupNamePattern: "W-${n}",
                teacherId: t2.id,
            },
        }),
    ]);

    // ————————————————————————
    // 3) STUDENTS (upsert pour éviter doublons)
    // ————————————————————————
    const studentEmails = [
        "alice@example.com",
        "bob@example.com",
        "carol@example.com",
        "dave@example.com",
        "erin@example.com",
        "frank@example.com",
        "grace@example.com",
        "heidi@example.com",
        "ivan@example.com",
        "judy@example.com",
        "mallory@example.com",
        "oscar@example.com",
    ];
    const students = await Promise.all(
        studentEmails.map((email) =>
            prisma.student.upsert({
                where: { githubEmail: email },
                update: {},
                create: { name: email.split("@")[0], githubEmail: email },
            })
        )
    );

    // petit helper pour piocher des étudiants
    const takeN = (arr: typeof students, n: number) => arr.splice(0, n);

    // ————————————————————————
    // 4) GROUPS + MEMBERS
    //   - crée plusieurs groupes par projet
    //   - remplit selon groupSizeMin/Max
    // ————————————————————————
    // Projet p1 : 3 groupes (G-1, G-2, G-3)
    const g1 = await createGroupWithAutoName(p1.id, p1.groupNamePattern);
    const g2 = await createGroupWithAutoName(p1.id, p1.groupNamePattern);
    const g3 = await createGroupWithAutoName(p1.id, p1.groupNamePattern);

    // Projet p2 : 2 groupes (ALGO-1, ALGO-2)
    const g4 = await createGroupWithAutoName(p2.id, p2.groupNamePattern);
    const g5 = await createGroupWithAutoName(p2.id, p2.groupNamePattern);

    // Projet p3 : 1 groupe (W-1)
    const g6 = await createGroupWithAutoName(p3.id, p3.groupNamePattern);

    // Attribution des membres en respectant groupSizeMax (si défini)
    const assign = async (group: { id: number }, project: { id: number; groupSizeMax: number | null }) => {
        // si pas de max, on met 3 par défaut
        const size = project.groupSizeMax ?? 3;
        const chunk = takeN(students, Math.min(size, Math.max(1, size)));
        if (chunk.length === 0) return;

        await prisma.groupMember.createMany({
            data: chunk.map((s) => ({
                groupId: group.id,
                studentId: s.id,
                projectId: project.id,
            })),
            skipDuplicates: true, // au cas où on relance le seed
        });
    };

    await assign(g1, p1);
    await assign(g2, p1);
    await assign(g3, p1);
    await assign(g4, p2);
    await assign(g5, p2);
    await assign(g6, p3);

    // S’il reste des étudiants non placés (faute de place), on les ignore.
    // Tu peux aussi créer dynamiquement d'autres groupes si tu veux tout placer.

    // ————————————————————————
    // 5) Démonstration : création d’un groupe supplémentaire avec auto-n
    // ————————————————————————
    const extraGroup = await createGroupWithAutoName(p1.id, p1.groupNamePattern);
    // on tente d’y mettre 2 étudiants restants si dispo
    await assign(extraGroup, p1);

    console.log("✅ Seed enrichi OK");
}

main()
    .catch((e) => {
        console.error("❌ Erreur seed :", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
