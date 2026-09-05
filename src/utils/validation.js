import { HttpError } from "../middleware/errorHandler.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["admin", "gerente", "empleado"]);

export function isEmail(value) {
  return typeof value === "string" && EMAIL_RE.test(value.trim().toLowerCase());
}

export function assertEmail(email) {
  if (!isEmail(email)) {
    throw new HttpError(400, "Email inválido");
  }
  return email.trim().toLowerCase();
}

export function assertPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres");
  }
  return password;
}

export function assertRole(rol) {
  if (!ROLES.has(rol)) {
    throw new HttpError(400, "Rol inválido. Usa: admin, gerente o empleado");
  }
  return rol;
}

export function assertRequired(body, fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      throw new HttpError(400, `El campo ${field} es obligatorio`);
    }
  }
}

export function publicUser(usuario) {
  if (!usuario) return null;
  const { password_hash, ...safe } = usuario;
  return safe;
}
