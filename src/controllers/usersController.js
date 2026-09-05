import { supabase } from "../config/supabase.js";
import { HttpError } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";
import {
  assertEmail,
  assertPassword,
  assertRequired,
  assertRole,
  publicUser,
} from "../utils/validation.js";

export async function listUsers(req, res) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, email, rol, activo, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  res.json({ ok: true, data });
}

export async function getUser(req, res) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, email, rol, activo, created_at, updated_at")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Usuario no encontrado");
  res.json({ ok: true, data });
}

export async function createUser(req, res) {
  assertRequired(req.body, ["nombre", "email", "password", "rol"]);

  const payload = {
    nombre: String(req.body.nombre).trim(),
    email: assertEmail(req.body.email),
    password_hash: await hashPassword(assertPassword(req.body.password)),
    rol: assertRole(req.body.rol),
    activo: req.body.activo !== undefined ? Boolean(req.body.activo) : true,
  };

  const { data, error } = await supabase
    .from("usuarios")
    .insert(payload)
    .select("id, nombre, email, rol, activo, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "El email ya está registrado");
    }
    throw error;
  }

  res.status(201).json({ ok: true, data: publicUser(data) });
}

export async function updateUser(req, res) {
  const updates = {};

  if (req.body.nombre !== undefined) updates.nombre = String(req.body.nombre).trim();
  if (req.body.email !== undefined) updates.email = assertEmail(req.body.email);
  if (req.body.rol !== undefined) updates.rol = assertRole(req.body.rol);
  if (req.body.activo !== undefined) updates.activo = Boolean(req.body.activo);
  if (req.body.password) {
    updates.password_hash = await hashPassword(assertPassword(req.body.password));
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "No hay campos para actualizar");
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", req.params.id)
    .select("id, nombre, email, rol, activo, created_at, updated_at")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "El email ya está registrado");
    }
    throw error;
  }
  if (!data) throw new HttpError(404, "Usuario no encontrado");

  res.json({ ok: true, data });
}

export async function deleteUser(req, res) {
  if (req.usuario.id === req.params.id) {
    throw new HttpError(400, "No puedes eliminar tu propia cuenta");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Usuario no encontrado");

  res.json({ ok: true, message: "Usuario eliminado" });
}
