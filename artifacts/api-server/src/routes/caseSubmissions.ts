import { Router, type IRouter, type Request } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, caseSubmissionsTable, casesTable } from "@workspace/db";
import { createNotification } from "../lib/notify";

const router: IRouter = Router();

const ADMIN_ROLES = ["super_admin", "sub_admin", "moderator"];

function getSession(req: Request) {
  return (req as any).session ?? {};
}

function requireAdmin(req: any, res: any): boolean {
  const session = getSession(req);
  if (!session.userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return false;
  }
  if (!ADMIN_ROLES.includes(session.userRole ?? "")) {
    res.status(403).json({ error: "غير مصرح" });
    return false;
  }
  return true;
}

const SubmitCaseBody = z.object({
  submitterName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  caseDetails: z.string().min(1),
});

const ApproveCaseBody = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  patientName: z.string().min(2),
  patientAge: z.number().int().min(1).max(120),
  hospital: z.string().min(2),
  targetAmount: z.number().min(100),
  sharePrice: z.number().min(10),
  urgencyLevel: z.enum(["critical", "high", "medium"]),
  imageUrl: z.string().url().optional().nullable(),
  medicalReportUrl: z.string().url().optional().nullable(),
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

  await createNotification({
    type: "admin_case_submission",
    title: `طلب حالة جديدة من ${parsed.data.submitterName}`,
    message: parsed.data.caseDetails.slice(0, 120),
    relatedId: submission.id,
  });

  res.status(201).json(formatSubmission(submission));
});

router.get("/case-submissions", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const submissions = await db
    .select()
    .from(caseSubmissionsTable)
    .orderBy(caseSubmissionsTable.createdAt);

  res.json(submissions.map(formatSubmission));
});

router.post("/case-submissions/:id/approve", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صحيح" });
    return;
  }

  const [submission] = await db
    .select()
    .from(caseSubmissionsTable)
    .where(eq(caseSubmissionsTable.id, id));

  if (!submission) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  const parsed = ApproveCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetAmount, sharePrice } = parsed.data;
  const totalShares = Math.floor(targetAmount / sharePrice);

  const [newCase] = await db.insert(casesTable).values({
    title: parsed.data.title,
    description: parsed.data.description,
    patientName: parsed.data.patientName,
    patientAge: parsed.data.patientAge,
    hospital: parsed.data.hospital,
    targetAmount: targetAmount.toFixed(2),
    sharePrice: sharePrice.toFixed(2),
    urgencyLevel: parsed.data.urgencyLevel,
    totalShares,
    collectedAmount: "0",
    soldShares: 0,
    status: "active",
    imageUrl: parsed.data.imageUrl ?? null,
    medicalReportUrl: parsed.data.medicalReportUrl ?? null,
  }).returning();

  await db
    .update(caseSubmissionsTable)
    .set({ status: "approved" })
    .where(eq(caseSubmissionsTable.id, id));

  await createNotification({
    type: "case_approved",
    title: "تم قبول ونشر حالة جديدة",
    message: `تم نشر الحالة: ${parsed.data.title}`,
  });

  res.status(201).json({ caseId: newCase.id });
});

router.post("/case-submissions/:id/reject", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صحيح" });
    return;
  }

  await db
    .update(caseSubmissionsTable)
    .set({ status: "rejected" })
    .where(eq(caseSubmissionsTable.id, id));

  res.json({ ok: true });
});

function formatSubmission(s: typeof caseSubmissionsTable.$inferSelect) {
  return {
    id: s.id,
    submitterName: s.submitterName,
    phone: s.phone,
    address: s.address,
    caseDetails: s.caseDetails,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  };
}

export default router;
