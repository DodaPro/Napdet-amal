import { Router, type IRouter, type Request } from "express";
import { eq, and } from "drizzle-orm";
import { db, donationsTable, casesTable } from "@workspace/db";
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

router.get("/admin/pending-donations", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const pending = await db
    .select({
      donation: donationsTable,
      caseTitle: casesTable.title,
    })
    .from(donationsTable)
    .leftJoin(casesTable, eq(donationsTable.caseId, casesTable.id))
    .where(
      and(
        eq(donationsTable.paymentMethod, "vodafone_cash"),
        eq(donationsTable.paymentStatus, "pending")
      )
    )
    .orderBy(donationsTable.createdAt);

  res.json(
    pending.map(({ donation, caseTitle }) => ({
      id: donation.id,
      caseId: donation.caseId,
      caseTitle: caseTitle ?? "",
      donorName: donation.donorName,
      senderPhone: donation.senderPhone ?? "",
      shares: donation.shares,
      amount: Number(donation.amount),
      transferScreenshotUrl: donation.transferScreenshotUrl ?? null,
      paymentStatus: donation.paymentStatus,
      createdAt: donation.createdAt.toISOString(),
    }))
  );
});

router.post("/admin/donations/:id/verify", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صحيح" });
    return;
  }

  const [donation] = await db
    .select()
    .from(donationsTable)
    .where(eq(donationsTable.id, id));

  if (!donation) {
    res.status(404).json({ error: "التبرع غير موجود" });
    return;
  }

  if (donation.paymentStatus !== "pending") {
    res.status(400).json({ error: "هذا التبرع تمت معالجته مسبقاً" });
    return;
  }

  await db
    .update(donationsTable)
    .set({ paymentStatus: "approved" })
    .where(eq(donationsTable.id, id));

  const [caseItem] = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.id, donation.caseId));

  if (caseItem) {
    const newCollected = Number(caseItem.collectedAmount) + Number(donation.amount);
    const newSold = caseItem.soldShares + donation.shares;
    const newStatus =
      newSold >= caseItem.totalShares ? "funded" : caseItem.status;

    await db
      .update(casesTable)
      .set({
        collectedAmount: newCollected.toFixed(2),
        soldShares: newSold,
        status: newStatus,
      })
      .where(eq(casesTable.id, donation.caseId));
  }

  await createNotification({
    type: "donation_verified",
    title: "تم التحقق من تبرع",
    message: `تم التحقق من تبرع ${donation.donorName} بقيمة ${Number(donation.amount)} جنيه`,
  });

  res.json({ ok: true });
});

router.post("/admin/donations/:id/reject", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صحيح" });
    return;
  }

  const [donation] = await db
    .select()
    .from(donationsTable)
    .where(eq(donationsTable.id, id));

  if (!donation) {
    res.status(404).json({ error: "التبرع غير موجود" });
    return;
  }

  await db
    .update(donationsTable)
    .set({ paymentStatus: "rejected" })
    .where(eq(donationsTable.id, id));

  res.json({ ok: true });
});

export default router;
