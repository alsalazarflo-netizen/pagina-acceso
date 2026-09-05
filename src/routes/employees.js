import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeesController.js";

export const employeesRouter = Router();

employeesRouter.use(requireAuth);
employeesRouter.get("/", asyncHandler(listEmployees));
employeesRouter.get("/:id", asyncHandler(getEmployee));
employeesRouter.post("/", requireRoles("admin", "gerente"), asyncHandler(createEmployee));
employeesRouter.put("/:id", requireRoles("admin", "gerente"), asyncHandler(updateEmployee));
employeesRouter.delete("/:id", requireRoles("admin"), asyncHandler(deleteEmployee));
