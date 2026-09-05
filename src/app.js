import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { departmentsRouter } from "./routes/departments.js";
import { employeesRouter } from "./routes/employees.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, service: "sistema-administracion-api" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/usuarios", usersRouter);
  app.use("/api/departamentos", departmentsRouter);
  app.use("/api/empleados", employeesRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
