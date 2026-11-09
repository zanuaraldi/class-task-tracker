// backend/src/db/seeds/dev.seed.ts
import db from "../connection";
import { kelas, siswa } from "../schema";

export async function runSeed() {
    console.log("🌱 Seeding database...");

    const insertedClasses = await db
        .insert(kelas)
        .values([{ nama: "Kelas A" }, { nama: "Kelas B" }])
        .returning();

    await db.insert(siswa).values([
        {
            nama: "Budi Santoso",
            email: "budi@example.com",
            kelasId: insertedClasses[0].id,
        },
        {
            nama: "Ani Lestari",
            email: "ani@example.com",
            kelasId: insertedClasses[1].id,
        },
    ]);

    console.log("✅ Seeding selesai!");
}

if (import.meta.main) {
    runSeed().finally(() => process.exit(0));
}