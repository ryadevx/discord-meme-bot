interface UserData {
  role: string;
  canViewAllMemes?: boolean;
}

export const isAdmin = (user: UserData): boolean => user.role === "admin";
export const canViewAll = (user: UserData): boolean => user.role === 'admin' || user.canViewAllMemes === true;