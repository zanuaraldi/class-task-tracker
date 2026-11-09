import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { siswa } from "./siswa.schema";

export const kelas = pgTable("kelas", {
    id: serial("id").primaryKey(),
    nama: text("nama").notNull(),
});

export const kelasRelations = relations(kelas, ({ many }) => ({
    siswa: many(siswa),
}));