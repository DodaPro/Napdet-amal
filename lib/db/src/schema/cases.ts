import { pgTable, text, serial, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseStatusEnum = pgEnum("case_status", ["active", "funded", "closed"]);
export const urgencyLevelEnum = pgEnum("urgency_level", ["critical", "high", "medium"]);

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  hospital: text("hospital").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  collectedAmount: numeric("collected_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  sharePrice: numeric("share_price", { precision: 10, scale: 2 }).notNull(),
  totalShares: integer("total_shares").notNull().default(0),
  soldShares: integer("sold_shares").notNull().default(0),
  status: caseStatusEnum("status").notNull().default("active"),
  urgencyLevel: urgencyLevelEnum("urgency_level").notNull().default("high"),
  imageUrl: text("image_url"),
  medicalReportUrl: text("medical_report_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
