import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { kelas } from "./kelas.schema";

export const siswa = pgTable("siswa", {
    id: serial("id").primaryKey(),
    nama: text("nama").notNull(),
    email: text("email").notNull().unique(),
    kelasId: integer("kelas_id").references(() => kelas.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
});

export const siswaRelations = relations(siswa, ({ one }) => ({
    kelas: one(kelas, {
        fields: [siswa.kelasId],
        references: [kelas.id],
    }),
}));
