export function hasAnyRole(userRoles: string, requiredRoles: string[]): boolean {
  if (!userRoles) return false;
  const roles = userRoles.split(',').map(r => r.trim());
  return requiredRoles.some(r => roles.includes(r));
}

export function hasAllRoles(userRoles: string, requiredRoles: string[]): boolean {
  if (!userRoles) return false;
  const roles = userRoles.split(',').map(r => r.trim());
  return requiredRoles.every(r => roles.includes(r));
}

export const ADMIN_ROLES = ['ADMIN', 'admin', '超级管理员'];

export function isAdmin(userRoles: string, userId?: string | number): boolean {
  if (userId === 1 || userId === '1') return true;
  return hasAnyRole(userRoles, ADMIN_ROLES);
}
