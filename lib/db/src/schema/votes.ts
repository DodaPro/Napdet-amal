import { pgTable, text, serial, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const voteStatusEnum = pgEnum("vote_status", ["open", "closed"]);
export const voteResultEnum = pgEnum("vote_result", ["approved", "rejected"]);

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  expense: numeric("expense", { precision: 12, scale: 2 }).notNull(),
  yesCount: integer("yes_count").notNull().default(0),
  noCount: integer("no_count").notNull().default(0),
  status: voteStatusEnum("status").notNull().default("open"),
  result: voteResultEnum("result"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const insertVoteSchema = createInsertSchema(votesTable).omit({ id: true, createdAt: true });
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votesTable.$inferSelect;
