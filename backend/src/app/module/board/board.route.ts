import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { boardController } from "./board.controller";
import { BoardValidation } from "./board.validation";
import { validateRequest } from "../../middleware/validateRequest";
import isBoardOwner from "../../middleware/isBoardOwner";

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
  isBoardOwner,
  validateRequest(BoardValidation.updateBoard),
  boardController.updateBoard,
);

router.delete("/:boardId", auth(), isBoardOwner, boardController.deleteBoard);

router.post(
  "/:boardId/share",
  auth(),
  isBoardOwner,
  validateRequest(BoardValidation.shareBoard),
  boardController.shareBoard,
);

router.delete(
  "/:boardId/members/:memberId",
  auth(),
  isBoardOwner,
  boardController.removeBoardMember,
);
export const boardRoutes = router;
