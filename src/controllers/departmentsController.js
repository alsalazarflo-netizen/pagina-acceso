import { supabase } from "../config/supabase.js";
import { HttpError } from "../middleware/errorHandler.js";
import { assertRequired } from "../utils/validation.js";

export async function listDepartments(req, res) {
  const { data, error } = await supabase
    .from("departamentos")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  res.json({ ok: true, data });
}

export async function getDepartment(req, res) {
  const { data, error } = await supabase
    .from("departamentos")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Departamento no encontrado");
  res.json({ ok: true, data });
}

export async function createDepartment(req, res) {
  assertRequired(req.body, ["nombre"]);

  const { data, error } = await supabase
    .from("departamentos")
    .insert({
      nombre: String(req.body.nombre).trim(),
      descripcion: req.body.descripcion ? String(req.body.descripcion).trim() : null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "Ya existe un departamento con ese nombre");
    }
    throw error;
  }

  res.status(201).json({ ok: true, data });
}

export async function updateDepartment(req, res) {
  const updates = { updated_at: new Date().toISOString() };
  if (req.body.nombre !== undefined) updates.nombre = String(req.body.nombre).trim();
  if (req.body.descripcion !== undefined) {
    updates.descripcion = req.body.descripcion ? String(req.body.descripcion).trim() : null;
  }

  const { data, error } = await supabase
    .from("departamentos")
    .update(updates)
    .eq("id", req.params.id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "Ya existe un departamento con ese nombre");
    }
    throw error;
  }
  if (!data) throw new HttpError(404, "Departamento no encontrado");

  res.json({ ok: true, data });
}

export async function deleteDepartment(req, res) {
  const { data, error } = await supabase
    .from("departamentos")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Departamento no encontrado");

  res.json({ ok: true, message: "Departamento eliminado" });
}
