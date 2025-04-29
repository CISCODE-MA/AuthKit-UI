// src/models/User.ts
export interface RoleWithPerms {
  name: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  /** e.g. ["admin", "manager"] */
  roles: string[];
  permissions?: string[]; // or a more complex shape // ["menus:create","menus:read", …]
  modules: string[];           // ["menus","inventory"]
  tenantId: string;
  // add more fields as needed
}