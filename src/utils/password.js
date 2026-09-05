import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export async function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptSaltRounds);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
