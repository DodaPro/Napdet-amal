import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseSubmissionsTable = pgTable("case_submissions", {
  id: serial("id").primaryKey(),
  submitterName: text("submitter_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  caseDetails: text("case_details").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseSubmissionSchema = createInsertSchema(caseSubmissionsTable).omit({ id: true, createdAt: true });
export type InsertCaseSubmission = z.infer<typeof insertCaseSubmissionSchema>;
export type CaseSubmission = typeof caseSubmissionsTable.$inferSelect;
