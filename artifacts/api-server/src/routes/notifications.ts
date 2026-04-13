import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";

const router: IRouter = Router();

const ADMIN_ROLES = ["super_admin", "sub_admin", "moderator"];

function getSession(req: Request) {
  return (req as any).session ?? {};
}

router.get("/notifications", async (req, res): Promise<void> => {
  const session = getSession(req);
  if (!session.userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return;
  }

  const isAdmin = ADMIN_ROLES.includes(session.userRole ?? "");

  let rows;
  if (isAdmin) {
    rows = await db
      .select()
      .from(notificationsTable)
      .where(isNull(notificationsTable.recipientId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
  } else {
    rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.recipientId, session.userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
  }

  res.json(rows.map(formatNotification));
});

router.get("/notifications/unread-count", async (req, res): Promise<void> => {
  const session = getSession(req);
  if (!session.userId) {
    res.json({ count: 0 });
    return;
  }

  const isAdmin = ADMIN_ROLES.includes(session.userRole ?? "");

  let rows;
  if (isAdmin) {
    rows = await db
      .select()
      .from(notificationsTable)
      .where(
        and(isNull(notificationsTable.recipientId), eq(notificationsTable.isRead, false))
      );
  } else {
    rows = await db
      .select()
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.recipientId, session.userId),
          eq(notificationsTable.isRead, false)
        )
      );
  }

  res.json({ count: rows.length });
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const session = getSession(req);
  if (!session.userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return;
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صحيح" });
    return;
  }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id));

  res.json({ ok: true });
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const session = getSession(req);
  if (!session.userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return;
  }

  const isAdmin = ADMIN_ROLES.includes(session.userRole ?? "");

  if (isAdmin) {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(isNull(notificationsTable.recipientId));
  } else {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.recipientId, session.userId));
  }

  res.json({ ok: true });
});

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    recipientId: n.recipientId,
    relatedId: n.relatedId,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

export default router;
