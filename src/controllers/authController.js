import { supabase } from "../config/supabase.js";
import { HttpError } from "../middleware/errorHandler.js";
import { signToken } from "../middleware/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  assertEmail,
  assertPassword,
  assertRequired,
  assertRole,
  publicUser,
} from "../utils/validation.js";

async function countUsers() {
  const { count, error } = await supabase
    .from("usuarios")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

export async function register(req, res) {
  assertRequired(req.body, ["nombre", "email", "password"]);

  const nombre = String(req.body.nombre).trim();
  const email = assertEmail(req.body.email);
  const password = assertPassword(req.body.password);
  const total = await countUsers();

  let rol = "empleado";
  if (total === 0) {
    rol = "admin";
  } else if (!req.usuario || req.usuario.rol !== "admin") {
    throw new HttpError(403, "Solo un administrador puede registrar usuarios");
  } else if (req.body.rol) {
    rol = assertRole(req.body.rol);
  }

  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from("usuarios")
    .insert({ nombre, email, password_hash, rol })
    .select("id, nombre, email, rol, activo, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "El email ya está registrado");
    }
    throw error;
  }

  const token = signToken(data);
  res.status(201).json({ ok: true, token, usuario: publicUser(data) });
}

export async function login(req, res) {
  assertRequired(req.body, ["email", "password"]);

  const email = assertEmail(req.body.email);
  const password = String(req.body.password);

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!usuario || !usuario.activo) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const valid = await verifyPassword(password, usuario.password_hash);
  if (!valid) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const token = signToken(usuario);
  res.json({ ok: true, token, usuario: publicUser(usuario) });
}

export async function me(req, res) {
  res.json({ ok: true, usuario: req.usuario });
}
