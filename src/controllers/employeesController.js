import { supabase } from "../config/supabase.js";
import { HttpError } from "../middleware/errorHandler.js";
import { assertRequired } from "../utils/validation.js";

function employeePayload(body, { partial = false } = {}) {
  if (!partial) {
    assertRequired(body, ["nombre"]);
  }

  const payload = {};
  if (body.nombre !== undefined) payload.nombre = String(body.nombre).trim();
  if (body.puesto !== undefined) payload.puesto = body.puesto ? String(body.puesto).trim() : null;
  if (body.salario !== undefined) payload.salario = body.salario === null ? null : Number(body.salario);
  if (body.fecha_ingreso !== undefined) payload.fecha_ingreso = body.fecha_ingreso || null;
  if (body.usuario_id !== undefined) payload.usuario_id = body.usuario_id || null;
  if (body.departamento_id !== undefined) payload.departamento_id = body.departamento_id || null;
  if (body.activo !== undefined) payload.activo = Boolean(body.activo);

  if (payload.salario !== undefined && payload.salario !== null && Number.isNaN(payload.salario)) {
    throw new HttpError(400, "El salario debe ser un número");
  }

  return payload;
}

export async function listEmployees(req, res) {
  const { data, error } = await supabase
    .from("empleados")
    .select(
      "*, departamento:departamentos(id, nombre), usuario:usuarios(id, nombre, email, rol)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  res.json({ ok: true, data });
}

export async function getEmployee(req, res) {
  const { data, error } = await supabase
    .from("empleados")
    .select(
      "*, departamento:departamentos(id, nombre), usuario:usuarios(id, nombre, email, rol)"
    )
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Empleado no encontrado");
  res.json({ ok: true, data });
}

export async function createEmployee(req, res) {
  const payload = employeePayload(req.body);

  const { data, error } = await supabase
    .from("empleados")
    .insert(payload)
    .select(
      "*, departamento:departamentos(id, nombre), usuario:usuarios(id, nombre, email, rol)"
    )
    .single();

  if (error) throw error;
  res.status(201).json({ ok: true, data });
}

export async function updateEmployee(req, res) {
  const payload = employeePayload(req.body, { partial: true });
  if (Object.keys(payload).length === 0) {
    throw new HttpError(400, "No hay campos para actualizar");
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("empleados")
    .update(payload)
    .eq("id", req.params.id)
    .select(
      "*, departamento:departamentos(id, nombre), usuario:usuarios(id, nombre, email, rol)"
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Empleado no encontrado");

  res.json({ ok: true, data });
}

export async function deleteEmployee(req, res) {
  const { data, error } = await supabase
    .from("empleados")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Empleado no encontrado");

  res.json({ ok: true, message: "Empleado eliminado" });
}
