export type UserRole = "super_admin" | "admin" | "moderator" | "donor" | null;

export const SUPER_ADMIN_EMAIL = "mahmoudalgdawy@gmail.com";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "مدير عام",
  admin: "مسؤول",
  moderator: "مشرف",
  donor: "متبرع",
};

export function isAdminRole(role: UserRole): boolean {
  return role === "super_admin" || role === "admin" || role === "moderator";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
