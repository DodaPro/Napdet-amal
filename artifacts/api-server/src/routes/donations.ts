import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, donationsTable } from "@workspace/db";
import { ListDonationsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/donations", async (req, res): Promise<void> => {
  const parsed = ListDonationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { caseId, limit, offset } = parsed.data;
  let query = db.select().from(donationsTable).orderBy(donationsTable.createdAt).$dynamic();

  if (caseId) {
    query = query.where(eq(donationsTable.caseId, caseId));
  }
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  const donations = await query;
  res.json(donations.map(d => ({
    id: d.id,
    caseId: d.caseId,
    donorName: d.anonymous ? "متبرع مجهول" : d.donorName,
    shares: d.shares,
    amount: Number(d.amount),
    coverFees: d.coverFees,
    anonymous: d.anonymous,
    createdAt: d.createdAt.toISOString(),
  })));
});

export default router;
