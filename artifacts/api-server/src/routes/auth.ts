import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const SUPER_ADMIN_EMAIL = "mahmoudalgdawy@gmail.com";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password } = req.body ?? {};

  if (
    !name || typeof name !== "string" || name.trim().length < 2 ||
    !email || !isValidEmail(email) ||
    !password || typeof password !== "string" || password.length < 6
  ) {
    res.status(400).json({ error: "بيانات غير صحيحة — تأكد من صحة جميع الحقول" });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing.length > 0) {
    res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? "super_admin" : "donor";

  const [newUser] = await db
    .insert(usersTable)
    .values({ name, email: email.toLowerCase(), passwordHash, role })
    .returning();

  const session = (req as any).session;
  session.userId = newUser.id;
  session.userEmail = newUser.email;
  session.userRole = newUser.role;
  session.userName = newUser.name;

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body ?? {};

  if (!email || !isValidEmail(email) || !password || typeof password !== "string") {
    res.status(400).json({ error: "بيانات غير صحيحة" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    return;
  }

  const session = (req as any).session;
  session.userId = user.id;
  session.userEmail = user.email;
  session.userRole = user.role;
  session.userName = user.name;

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res): Promise<void> => {
  const session = (req as any).session;
  if (!session?.userId) {
    res.status(401).json({ error: "غير مسجل الدخول" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  if (!user) {
    session.destroy(() => {});
    res.status(401).json({ error: "الجلسة منتهية" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res): void => {
  const session = (req as any).session;
  session.destroy(() => {
    res.clearCookie("nabdat_session");
    res.json({ ok: true });
  });
});

export default router;
