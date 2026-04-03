import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, votesTable } from "@workspace/db";
import {
  ListVotesQueryParams,
  CreateVoteBody,
  GetVoteParams,
  CastVoteParams,
  CastVoteBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/votes", async (req, res): Promise<void> => {
  const parsed = ListVotesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { caseId, status } = parsed.data;
  let query = db.select().from(votesTable).$dynamic();

  if (caseId) query = query.where(eq(votesTable.caseId, caseId));
  if (status) query = query.where(eq(votesTable.status, status as "open" | "closed"));

  const votes = await query;
  res.json(votes.map(formatVote));
});

router.post("/votes", async (req, res): Promise<void> => {
  const parsed = CreateVoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [vote] = await db.insert(votesTable).values({
    ...parsed.data,
    yesCount: 0,
    noCount: 0,
    status: "open",
  }).returning();

  res.status(201).json(formatVote(vote));
});

router.get("/votes/:id", async (req, res): Promise<void> => {
  const params = GetVoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [vote] = await db.select().from(votesTable).where(eq(votesTable.id, params.data.id));
  if (!vote) {
    res.status(404).json({ error: "Vote not found" });
    return;
  }

  res.json(formatVote(vote));
});

router.post("/votes/:id/cast", async (req, res): Promise<void> => {
  const params = CastVoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CastVoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [vote] = await db.select().from(votesTable).where(eq(votesTable.id, params.data.id));
  if (!vote) {
    res.status(404).json({ error: "Vote not found" });
    return;
  }

  if (vote.status !== "open") {
    res.status(400).json({ error: "Vote is closed" });
    return;
  }

  const updateData = parsed.data.choice === "yes"
    ? { yesCount: vote.yesCount + 1 }
    : { noCount: vote.noCount + 1 };

  const [updated] = await db.update(votesTable).set(updateData).where(eq(votesTable.id, params.data.id)).returning();

  res.json(formatVote(updated));
});

function formatVote(v: typeof votesTable.$inferSelect) {
  return {
    id: v.id,
    caseId: v.caseId,
    title: v.title,
    description: v.description,
    expense: Number(v.expense),
    yesCount: v.yesCount,
    noCount: v.noCount,
    status: v.status,
    result: v.result,
    createdAt: v.createdAt.toISOString(),
    closedAt: v.closedAt ? v.closedAt.toISOString() : null,
  };
}

export default router;
