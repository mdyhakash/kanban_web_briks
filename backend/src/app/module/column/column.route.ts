import express from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import columnValidation from "./column.validation";
import columnController from "./column.controller";
import checkBoardAccess from "../../middleware/checkBoardAccess";
import columnService from "./column.service";

const router = express.Router();

router.post(
  "/",
  auth(),
  validateRequest(columnValidation.createColumn),
  checkBoardAccess({
    resolveBoardId: async (req) => req.body.boardId ?? null,
  }),

  columnController.createColumn,
);

router.patch(
  "/:columnId",
  auth(),
  checkBoardAccess({
    resolveBoardId: async (req) =>
      columnService.getColumnBoardId(req.params.columnId as string),
  }),
  validateRequest(columnValidation.updateColumn),
  columnController.updateColumn,
);

router.delete(
  "/:columnId",
  auth(),
  checkBoardAccess({
    resolveBoardId: async (req) =>
      columnService.getColumnBoardId(req.params.columnId as string),
  }),
  columnController.deleteColumn,
);

export const columnRoutes = router;
