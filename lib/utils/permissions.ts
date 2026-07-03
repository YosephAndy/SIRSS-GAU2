import { UserRole } from '@/types/auth';

/**
 * Role-based access control rules for SIRSS-GAU.
 */

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'manage:users',
    'manage:drivers',
    'manage:routes',
    'manage:zones',
    'manage:schedules',
    'manage:incidents',
    'manage:reports',
    'manage:alerts',
    'manage:analytics',
    'view:driver_dashboard',
    'view:citizen_dashboard',
  ],
  DRIVER: [
    'view:driver_dashboard',
    'view:assigned_routes',
    'report:operational_incidents',
    'share:gps_location',
  ],
  CITIZEN: [
    'view:citizen_dashboard',
    'view:schedules',
    'view:realtime_map',
    'report:environmental_incidents',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
