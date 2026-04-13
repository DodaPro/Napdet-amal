export type UserRole = "super_admin" | "sub_admin" | "admin" | "moderator" | "donor" | null;

export const SUPER_ADMIN_EMAIL = "mahmoudalgdawy@gmail.com";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "مدير عام",
  sub_admin: "مسؤول",
  admin: "مسؤول",
  moderator: "مشرف",
  donor: "متبرع",
};

export function isAdminRole(role: UserRole): boolean {
  return role === "super_admin" || role === "admin" || role === "sub_admin" || role === "moderator";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
