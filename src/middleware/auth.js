import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { supabase } from "../config/supabase.js";
import { HttpError } from "./errorHandler.js";

export function signToken(usuario) {
  return jwt.sign(
    {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    env.jwtSecret,
    { expiresIn: "8h" }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Token de autenticación requerido");
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new HttpError(401, "Token inválido o expirado");
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol, activo, created_at, updated_at")
      .eq("id", payload.sub)
      .maybeSingle();

    if (error) throw error;
    if (!usuario || !usuario.activo) {
      throw new HttpError(401, "Usuario no autorizado");
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new HttpError(403, "No tienes permisos para esta acción"));
    }
    next();
  };
}
