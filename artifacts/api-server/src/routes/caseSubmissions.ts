import { Router, type IRouter } from "express";
import { db, caseSubmissionsTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const SubmitCaseBody = z.object({
  submitterName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  caseDetails: z.string().min(1),
});

router.post("/case-submissions", async (req, res): Promise<void> => {
  const parsed = SubmitCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [submission] = await db.insert(caseSubmissionsTable).values({
    submitterName: parsed.data.submitterName,
    phone: parsed.data.phone,
    address: parsed.data.address,
    caseDetails: parsed.data.caseDetails,
    status: "pending",
  }).returning();

  res.status(201).json({
    id: submission.id,
    submitterName: submission.submitterName,
    phone: submission.phone,
    address: submission.address,
    caseDetails: submission.caseDetails,
    status: submission.status,
    createdAt: submission.createdAt.toISOString(),
  });
});

export default router;
