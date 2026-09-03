import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { boardController } from "./board.controller";
import { BoardValidation } from "./board.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.post(
  "/",
  auth(),
  validateRequest(BoardValidation.createBoard),
  boardController.createBoard,
);

router.get("/", auth(), boardController.getMyBoards);

router.get("/:boardId", auth(), boardController.getBoardById);
router.patch(
  "/:boardId",
  auth(),
  validateRequest(BoardValidation.updateBoard),
  boardController.updateBoard,
);

router.delete(
  "/:boardId",
  auth(),
  boardController.deleteBoard
);

export const boardRoutes = router;
