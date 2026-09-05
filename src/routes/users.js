import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRoles("admin"));
usersRouter.get("/", asyncHandler(listUsers));
usersRouter.get("/:id", asyncHandler(getUser));
usersRouter.post("/", asyncHandler(createUser));
usersRouter.put("/:id", asyncHandler(updateUser));
usersRouter.delete("/:id", asyncHandler(deleteUser));
