import type { AuthUser } from "@/lib/auth";

export type AppRole = "super_admin" | "organization_admin" | "organization_user";

export function getUserRole(user: AuthUser | null): AppRole {
  if (!user) return "organization_user";
  if (user.isSuperAdmin || user.role === "super_admin" || user.role === "SUPER_ADMIN") {
    return "super_admin";
  }
  if (user.isOrganizationAdmin || user.role === "organization_admin" || user.role === "ORG_ADMIN") {
    return "organization_admin";
  }
  return "organization_user";
}

const ROUTE_ROLES: Record<string, AppRole[]> = {
  "/dashboard": ["super_admin", "organization_admin", "organization_user"],
  "/cases": ["super_admin", "organization_admin", "organization_user"],
  "/clients": ["super_admin", "organization_admin", "organization_user"],
  "/contacts": ["super_admin", "organization_admin", "organization_user"],
  "/documents": ["super_admin", "organization_admin", "organization_user"],
  "/tasks": ["super_admin", "organization_admin", "organization_user"],
  "/reports": ["super_admin", "organization_admin"],
  "/users": ["super_admin", "organization_admin"],
  "/organizations": ["super_admin"],
  "/notifications": ["super_admin", "organization_admin", "organization_user"],
  "/settings": ["super_admin", "organization_admin", "organization_user"],
};

export function canAccessPath(pathname: string, user: AuthUser | null): boolean {
  const role = getUserRole(user);
  const route = Object.keys(ROUTE_ROLES)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`));
  if (!route) return true;
  return ROUTE_ROLES[route].includes(role);
}
