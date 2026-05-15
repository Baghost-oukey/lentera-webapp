// src/services/userService.ts
import { db } from "../lib/db";

export class UserService {
  static async createUser(name: string, schoolLevel: string) {
    return await db.user.create({
      data: {
        name,
        schoolLevel,
        aiProfile: {
          interest: [],
          pace: "adaptive",
          tone: "friendly_mentor"
        }
      }
    });
  }

  static async getById(id: string) {
    return await db.user.findUnique({ where: { id } });
  }
}