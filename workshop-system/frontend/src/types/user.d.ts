export interface UserInfo {
  id: number;
  username: string;
  realName: string;
  phone: string;
  deptId: number;
  deptName: string;
  roleIds: string;
  roleCodes: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserItem {
  id: number;
  username: string;
  realName: string;
  phone: string;
  email: string;
  avatar: string;
  deptId: number;
  deptName: string;
  roleIds: string;
  status: number;
  lastLoginTime: string;
  createdAt: string;
}

export interface DeptItem {
  id: number;
  deptName: string;
  deptCode: string;
  parentId: number;
  sortOrder: number;
  status: number;
  children?: DeptItem[];
}

export interface RoleItem {
  id: number;
  roleName: string;
  roleCode: string;
  description: string;
  status: number;
}
