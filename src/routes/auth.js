import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { register, login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return next();

    const payload = jwt.verify(token, env.jwtSecret);
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol, activo")
      .eq("id", payload.sub)
      .maybeSingle();

    if (usuario?.activo) req.usuario = usuario;
    next();
  } catch {
    next();
  }
}

authRouter.post("/register", optionalAuth, asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAuth, asyncHandler(me));
