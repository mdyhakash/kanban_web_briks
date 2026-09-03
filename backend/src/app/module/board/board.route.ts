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

export const boardRoutes = router;
