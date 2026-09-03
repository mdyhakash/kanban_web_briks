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
export const boardController = {
  createBoard,
  getMyBoards,
};
