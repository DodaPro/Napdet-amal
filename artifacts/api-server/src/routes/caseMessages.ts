import { Router, type IRouter, type Request, type Response } from "express";
import { eq, asc } from "drizzle-orm";
import { db, caseMessagesTable, notificationsTable, casesTable } from "@workspace/db";

const router: IRouter = Router();

function getSession(req: Request) {
  return (req as any).session ?? {};
}

router.get("/cases/:id/messages", async (req: Request, res: Response): Promise<void> => {
  const caseId = parseInt(String(req.params.id), 10);
  if (isNaN(caseId)) {
    res.status(400).json({ error: "معرف الحالة غير صحيح" });
    return;
  }

  const messages = await db
    .select()
    .from(caseMessagesTable)
    .where(eq(caseMessagesTable.caseId, caseId))
    .orderBy(asc(caseMessagesTable.createdAt))
    .limit(200);

  res.json(messages.map(formatMessage));
});

router.post("/cases/:id/messages", async (req: Request, res: Response): Promise<void> => {
  const session = getSession(req);
  if (!session.userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول للمشاركة في النقاش" });
    return;
  }

  const caseId = parseInt(String(req.params.id), 10);
  if (isNaN(caseId)) {
    res.status(400).json({ error: "معرف الحالة غير صحيح" });
    return;
  }

  const { content, type, voteTitle, voteExpense } = req.body as {
    content?: string;
    type?: string;
    voteTitle?: string;
    voteExpense?: string;
  };

  if (!content || !content.trim()) {
    res.status(400).json({ error: "محتوى الرسالة مطلوب" });
    return;
  }

  if (content.trim().length > 1000) {
    res.status(400).json({ error: "الرسالة طويلة جداً (الحد الأقصى 1000 حرف)" });
    return;
  }

  const msgType = type === "vote_request" ? "vote_request" : "message";

  if (msgType === "vote_request") {
    if (!voteTitle || !voteTitle.trim()) {
      res.status(400).json({ error: "عنوان طلب التصويت مطلوب" });
      return;
    }
    if (!voteExpense || isNaN(parseFloat(voteExpense)) || parseFloat(voteExpense) <= 0) {
      res.status(400).json({ error: "المبلغ المطلوب غير صحيح" });
      return;
    }
  }

  const [caseRow] = await db
    .select({ title: casesTable.title })
    .from(casesTable)
    .where(eq(casesTable.id, caseId))
    .limit(1);

  if (!caseRow) {
    res.status(404).json({ error: "الحالة غير موجودة" });
    return;
  }

  const [inserted] = await db
    .insert(caseMessagesTable)
    .values({
      caseId,
      authorId: session.userId,
      authorName: session.userName ?? "مستخدم",
      type: msgType,
      content: content.trim(),
      voteTitle: msgType === "vote_request" ? voteTitle!.trim() : null,
      voteExpense: msgType === "vote_request" ? voteExpense!.trim() : null,
    })
    .returning();

  await db.insert(notificationsTable).values({
    type: "community_message",
    title: msgType === "vote_request" ? "طلب تصويت جديد في لوحة المجتمع" : "رسالة جديدة في لوحة المجتمع",
    message:
      msgType === "vote_request"
        ? `طلب ${session.userName ?? "مستخدم"} التصويت على مصروف إضافي "${voteTitle}" للحالة: ${caseRow.title}`
        : `كتب ${session.userName ?? "مستخدم"} في حالة "${caseRow.title}": ${content.trim().substring(0, 100)}${content.trim().length > 100 ? "..." : ""}`,
    recipientId: null,
    relatedId: caseId,
    isRead: false,
  });

  res.status(201).json(formatMessage(inserted));
});

function formatMessage(m: typeof caseMessagesTable.$inferSelect) {
  return {
    id: m.id,
    caseId: m.caseId,
    authorId: m.authorId,
    authorName: m.authorName,
    type: m.type,
    content: m.content,
    voteTitle: m.voteTitle,
    voteExpense: m.voteExpense,
    createdAt: m.createdAt.toISOString(),
  };
}

export default router;
