import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { boardService } from "./board.service";
import { sendResponse } from "../../utils/sendResponse";

const createBoard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await boardService.createBoard(req.user!.userId, req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Board created successfully.",
      data: result,
    });
  },
);

const getMyBoards = catchAsync(async (req: Request, res: Response) => {
  const result = await boardService.getMyBoards(req.user!.userId);

  sendResponse(res, {
    statusCode: 200,
    message: "Boards retrieved successfully.",
    data: result,
  });
});
const getBoardById = catchAsync(async (req: Request, res: Response) => {
  const result = await boardService.getBoradById(req.params.boardId as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Board retrieved successfully.",
    data: result,
  });
});
const updateBoard = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const userId = req.user!.userId;
  const payload = req.body;
  const result = await boardService.updateBoard(
    boardId as string,
    userId as string,
    payload,
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Board retrieved successfully.",
    data: result,
  });
});

const deleteBoard = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const userId = req.user!.userId;
  await boardService.deleteBoard(boardId as string, userId as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Board deleted successfully.",
    data: null,
  });
});
export const boardController = {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
};
