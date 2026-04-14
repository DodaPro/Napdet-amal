import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { casesTable } from "./cases";
import { usersTable } from "./users";

export const messageTypeEnum = pgEnum("message_type", ["message", "vote_request"]);

export const caseMessagesTable = pgTable("case_messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  type: messageTypeEnum("type").notNull().default("message"),
  content: text("content").notNull(),
  voteTitle: text("vote_title"),
  voteExpense: text("vote_expense"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CaseMessage = typeof caseMessagesTable.$inferSelect;
