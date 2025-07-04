export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  researchAreas?: string[];
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  RESEARCHER = 'researcher',
  ADMIN = 'admin',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer'
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  handleLoginCallback: () => Promise<User>;
  handleLogoutCallback: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
  researchAreas?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
