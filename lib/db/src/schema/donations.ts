import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  donorName: text("donor_name").notNull(),
  shares: integer("shares").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  coverFees: boolean("cover_fees").notNull().default(false),
  anonymous: boolean("anonymous").notNull().default(false),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status"),
  transferScreenshotUrl: text("transfer_screenshot_url"),
  senderPhone: text("sender_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
