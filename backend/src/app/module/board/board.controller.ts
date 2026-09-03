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
  const payload = req.body;
  const result = await boardService.updateBoard(boardId as string, payload);

  sendResponse(res, {
    statusCode: 200,
    message: "Board updated successfully.",
    data: result,
  });
});

const deleteBoard = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;
  await boardService.deleteBoard(boardId as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Board deleted successfully.",
    data: null,
  });
});

const shareBoard = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const { email } = req.body;
  const userId = req.user!.userId;
  const result = await boardService.shareBoard(
    boardId as string,
    email as string,
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Board shared successfully.",
    data: result,
  });
});
const removeBoardMember = catchAsync(async (req: Request, res: Response) => {
  const { boardId, memberId } = req.params;
  const userId = req.user!.userId;
  const result = await boardService.removeBoardMember(
    boardId as string,
    memberId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Member removed successfully.",
    data: result,
  });
});
export const boardController = {
  createBoard,
  getMyBoards,
  getBoardById,
  updateBoard,
  deleteBoard,

  shareBoard,
  removeBoardMember,
};
