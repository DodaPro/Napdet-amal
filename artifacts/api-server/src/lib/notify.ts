import { db, notificationsTable } from "@workspace/db";

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  recipientId?: number | null;
  relatedId?: number | null;
}) {
  await db.insert(notificationsTable).values({
    type: data.type,
    title: data.title,
    message: data.message,
    recipientId: data.recipientId ?? null,
    relatedId: data.relatedId ?? null,
    isRead: false,
  });
}
