import express from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import taskValidation from "./task.validation";
import checkBoardAccess from "../../middleware/checkBoardAccess";
import columnService from "../column/column.service";
import taskController from "./task.controller";
import taskService from "./task.service";

const router = express.Router();

router.post(
  "/",
  auth(),
  validateRequest(taskValidation.createTask),
  checkBoardAccess({
    resolveBoardId: async (req) =>
      columnService.getColumnBoardId(req.body.columnId),
  }),
  taskController.createTask,
);

router.patch(
  "/:taskId",
  auth(),
  checkBoardAccess({
    resolveBoardId: async (req) =>
      taskService.getTaskBoardId(req.params.taskId as string),
  }),
  validateRequest(taskValidation.updateTask),
  taskController.updateTask,
);

router.delete(
  "/:taskId",
  auth(),
  checkBoardAccess({
    resolveBoardId: async (req) =>
      taskService.getTaskBoardId(req.params.taskId as string),
  }),
  taskController.deleteTask,
);

export const taskRoutes = router;
