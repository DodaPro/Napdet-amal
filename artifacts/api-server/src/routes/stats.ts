import { Router, type IRouter } from "express";
import { eq, count, sum, avg } from "drizzle-orm";
import { db, casesTable, donationsTable, usersTable } from "@workspace/db";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const [caseStats] = await db.select({
    totalCases: count(casesTable.id),
    activeCases: count(eq(casesTable.status, "active")),
  }).from(casesTable);

  const activeCasesResult = await db.select({ count: count(casesTable.id) })
    .from(casesTable).where(eq(casesTable.status, "active"));
  const fundedCasesResult = await db.select({ count: count(casesTable.id) })
    .from(casesTable).where(eq(casesTable.status, "funded"));

  const [donationStats] = await db.select({
    totalDonations: sum(donationsTable.amount),
    totalSharesSold: sum(donationsTable.shares),
    totalDonors: count(donationsTable.id),
  }).from(donationsTable);

  const allCases = await db.select({
    targetAmount: casesTable.targetAmount,
    collectedAmount: casesTable.collectedAmount,
  }).from(casesTable);

  let avgFunding = 0;
  if (allCases.length > 0) {
    const fundingPcts = allCases.map(c =>
      Number(c.targetAmount) > 0 ? (Number(c.collectedAmount) / Number(c.targetAmount)) * 100 : 0
    );
    avgFunding = fundingPcts.reduce((a, b) => a + b, 0) / fundingPcts.length;
  }

  res.json({
    totalDonations: Number(donationStats.totalDonations ?? 0),
    totalCases: caseStats.totalCases,
    activeCases: activeCasesResult[0]?.count ?? 0,
    fundedCases: fundedCasesResult[0]?.count ?? 0,
    totalDonors: donationStats.totalDonors,
    totalSharesSold: Number(donationStats.totalSharesSold ?? 0),
    averageFundingPercent: Math.round(avgFunding * 10) / 10,
  });
});

router.get("/stats/recent-activity", async (req, res): Promise<void> => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? parsed.data.limit : 10;

  const recentDonations = await db
    .select({
      id: donationsTable.id,
      donorName: donationsTable.donorName,
      anonymous: donationsTable.anonymous,
      caseTitle: casesTable.title,
      caseId: casesTable.id,
      amount: donationsTable.amount,
      shares: donationsTable.shares,
      createdAt: donationsTable.createdAt,
    })
    .from(donationsTable)
    .leftJoin(casesTable, eq(donationsTable.caseId, casesTable.id))
    .orderBy(donationsTable.createdAt)
    .limit(limit);

  const items = recentDonations.map(d => ({
    id: d.id,
    type: "donation" as const,
    donorName: d.anonymous ? "متبرع مجهول" : d.donorName,
    caseTitle: d.caseTitle ?? "",
    caseId: d.caseId ?? 0,
    amount: Number(d.amount),
    shares: d.shares,
    createdAt: d.createdAt.toISOString(),
  }));

  res.json(items);
});

export default router;
