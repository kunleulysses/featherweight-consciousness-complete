// Simple in-memory storage for auth demo purposes
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
  premiumUntil?: Date;
  preferences?: any;
  createdAt: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

class MemoryAuthStorage {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();
  private userIdCounter = 1;

  async createUser(userData: CreateUserData): Promise<User> {
    const id = this.userIdCounter.toString();
    this.userIdCounter++;

    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isPremium: false,
      createdAt: new Date(),
    };

    this.users.set(id, user);
    this.emailToId.set(userData.email.toLowerCase(), id);

    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const id = this.emailToId.get(email.toLowerCase());
    if (!id) return undefined;
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);

    // Update email mapping if email changed
    if (updates.email && updates.email !== user.email) {
      this.emailToId.delete(user.email.toLowerCase());
      this.emailToId.set(updates.email.toLowerCase(), id);
    }

    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const memoryAuthStorage = new MemoryAuthStorage();
