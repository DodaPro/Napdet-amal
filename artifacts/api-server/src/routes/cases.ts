import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, casesTable, donationsTable } from "@workspace/db";
import {
  ListCasesQueryParams,
  CreateCaseBody,
  GetCaseParams,
  UpdateCaseParams,
  UpdateCaseBody,
  DeleteCaseParams,
  DonateToCaseParams,
  DonateToCaseBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cases", async (req, res): Promise<void> => {
  const parsed = ListCasesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, limit, offset } = parsed.data;
  let query = db.select().from(casesTable).$dynamic();

  if (status) {
    query = query.where(eq(casesTable.status, status as "active" | "funded" | "closed"));
  }
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  const cases = await query;
  res.json(cases.map(formatCase));
});

router.post("/cases", async (req, res): Promise<void> => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetAmount, sharePrice } = parsed.data;
  const totalShares = Math.floor(Number(targetAmount) / Number(sharePrice));

  const [newCase] = await db.insert(casesTable).values({
    ...parsed.data,
    totalShares,
    collectedAmount: "0",
    soldShares: 0,
  }).returning();

  res.status(201).json(formatCase(newCase));
});

router.get("/cases/:id", async (req, res): Promise<void> => {
  const params = GetCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [caseItem] = await db.select().from(casesTable).where(eq(casesTable.id, params.data.id));
  if (!caseItem) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  res.json(formatCase(caseItem));
});

router.patch("/cases/:id", async (req, res): Promise<void> => {
  const params = UpdateCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db.update(casesTable).set(parsed.data).where(eq(casesTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  res.json(formatCase(updated));
});

router.delete("/cases/:id", async (req, res): Promise<void> => {
  const params = DeleteCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(casesTable).where(eq(casesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/cases/:id/donate-vodafone", async (req, res): Promise<void> => {
  const params = DonateToCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const VodafoneBody = z.object({
    donorName: z.string().min(1),
    shares: z.number().int().min(1),
    coverFees: z.boolean().optional(),
    anonymous: z.boolean().optional(),
    senderPhone: z.string().min(1),
    transferScreenshotUrl: z.string().optional(),
  });

  const vParsed = VodafoneBody.safeParse(req.body);
  if (!vParsed.success) {
    res.status(400).json({ error: vParsed.error.message });
    return;
  }

  const [caseItem] = await db.select().from(casesTable).where(eq(casesTable.id, params.data.id));
  if (!caseItem) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  if (caseItem.status !== "active") {
    res.status(400).json({ error: "Case is not active" });
    return;
  }

  const sharesAvailable = caseItem.totalShares - caseItem.soldShares;
  if (vParsed.data.shares > sharesAvailable) {
    res.status(400).json({ error: "Not enough shares available" });
    return;
  }

  const amount = Number(caseItem.sharePrice) * vParsed.data.shares;
  const feeAmount = vParsed.data.coverFees ? amount * 0.025 : 0;
  const totalAmount = amount + feeAmount;

  const [donation] = await db.insert(donationsTable).values({
    caseId: params.data.id,
    donorName: vParsed.data.anonymous ? "فاعل خير" : vParsed.data.donorName,
    shares: vParsed.data.shares,
    amount: totalAmount.toFixed(2),
    coverFees: vParsed.data.coverFees ?? false,
    anonymous: vParsed.data.anonymous ?? false,
    paymentMethod: "vodafone_cash",
    paymentStatus: "pending",
    transferScreenshotUrl: vParsed.data.transferScreenshotUrl ?? null,
    senderPhone: vParsed.data.senderPhone,
  }).returning();

  res.status(201).json({
    id: donation.id,
    caseId: donation.caseId,
    donorName: donation.donorName,
    shares: donation.shares,
    amount: Number(donation.amount),
    coverFees: donation.coverFees,
    anonymous: donation.anonymous,
    paymentMethod: donation.paymentMethod,
    paymentStatus: donation.paymentStatus,
    transferScreenshotUrl: donation.transferScreenshotUrl,
    senderPhone: donation.senderPhone,
    createdAt: donation.createdAt.toISOString(),
  });
});

router.post("/cases/:id/donate", async (req, res): Promise<void> => {
  const params = DonateToCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = DonateToCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [caseItem] = await db.select().from(casesTable).where(eq(casesTable.id, params.data.id));
  if (!caseItem) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  if (caseItem.status !== "active") {
    res.status(400).json({ error: "Case is not active" });
    return;
  }

  const sharesAvailable = caseItem.totalShares - caseItem.soldShares;
  if (parsed.data.shares > sharesAvailable) {
    res.status(400).json({ error: "Not enough shares available" });
    return;
  }

  const amount = Number(caseItem.sharePrice) * parsed.data.shares;
  const feeAmount = parsed.data.coverFees ? amount * 0.025 : 0;
  const totalAmount = amount + feeAmount;

  const [donation] = await db.insert(donationsTable).values({
    caseId: params.data.id,
    donorName: parsed.data.donorName,
    shares: parsed.data.shares,
    amount: totalAmount.toFixed(2),
    coverFees: parsed.data.coverFees ?? false,
    anonymous: parsed.data.anonymous ?? false,
  }).returning();

  const newCollected = Number(caseItem.collectedAmount) + amount;
  const newSold = caseItem.soldShares + parsed.data.shares;
  const newStatus = newSold >= caseItem.totalShares ? "funded" : "active";

  await db.update(casesTable).set({
    collectedAmount: newCollected.toFixed(2),
    soldShares: newSold,
    status: newStatus,
  }).where(eq(casesTable.id, params.data.id));

  res.status(201).json({
    id: donation.id,
    caseId: donation.caseId,
    donorName: donation.donorName,
    shares: donation.shares,
    amount: Number(donation.amount),
    coverFees: donation.coverFees,
    anonymous: donation.anonymous,
    createdAt: donation.createdAt.toISOString(),
  });
});

function formatCase(c: typeof casesTable.$inferSelect) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    patientName: c.patientName,
    patientAge: c.patientAge,
    hospital: c.hospital,
    targetAmount: Number(c.targetAmount),
    collectedAmount: Number(c.collectedAmount),
    sharePrice: Number(c.sharePrice),
    totalShares: c.totalShares,
    soldShares: c.soldShares,
    status: c.status,
    urgencyLevel: c.urgencyLevel,
    imageUrl: c.imageUrl,
    medicalReportUrl: c.medicalReportUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export default router;
