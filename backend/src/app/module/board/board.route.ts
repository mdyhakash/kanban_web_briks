import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { boardController } from "./board.controller";
import { BoardValidation } from "./board.validation";
import { validateRequest } from "../../middleware/validateRequest";
import checkBoardAccess from "../../middleware/checkBoardAccess";

const router = Router();

router.post(
  "/",
  auth(),
  validateRequest(BoardValidation.createBoard),
  boardController.createBoard,
);

router.get("/", auth(), boardController.getMyBoards);

router.get(
  "/:boardId",
  auth(),
  checkBoardAccess(),
  boardController.getBoardById,
);

router.patch(
  "/:boardId",
  auth(),
  checkBoardAccess({ requireOwner: true }),
  validateRequest(BoardValidation.updateBoard),
  boardController.updateBoard,
);

router.delete(
  "/:boardId",
  auth(),
  checkBoardAccess({ requireOwner: true }),
  boardController.deleteBoard,
);

router.post(
  "/:boardId/share",
  auth(),
  checkBoardAccess({ requireOwner: true }),
  validateRequest(BoardValidation.shareBoard),
  boardController.shareBoard,
);

router.delete(
  "/:boardId/members/:memberId",
  auth(),
  checkBoardAccess({ requireOwner: true }),
  boardController.removeBoardMember,
);
export const boardRoutes = router;
