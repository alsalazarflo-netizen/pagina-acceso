import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentsController.js";

export const departmentsRouter = Router();

departmentsRouter.use(requireAuth);
departmentsRouter.get("/", asyncHandler(listDepartments));
departmentsRouter.get("/:id", asyncHandler(getDepartment));
departmentsRouter.post("/", requireRoles("admin", "gerente"), asyncHandler(createDepartment));
departmentsRouter.put("/:id", requireRoles("admin", "gerente"), asyncHandler(updateDepartment));
departmentsRouter.delete("/:id", requireRoles("admin"), asyncHandler(deleteDepartment));
