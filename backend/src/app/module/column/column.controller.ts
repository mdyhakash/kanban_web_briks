import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import columnService from "./column.service";
import { sendResponse } from "../../utils/sendResponse";

const createColumn = catchAsync(async (req: Request, res: Response) => {
  const result = await columnService.createColumn(
    req.body.boardId,
    req.body.title,
  );

  sendResponse(res, {
    statusCode: 201,
    message: "Column created successfully.",
    data: result,
  });
});

const updateColumn = catchAsync(async (req: Request, res: Response) => {
  const result = await columnService.updateColumn(
    req.params.columnId as string,
    req.body.title,
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Column updated successfully.",
    data: result,
  });
});

const deleteColumn = catchAsync(async (req: Request, res: Response) => {
  await columnService.deleteColumn(req.params.columnId as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Column deleted successfully.",
    data: null,
  });
});

const columnController = {
  createColumn,
  updateColumn,
  deleteColumn,
};

export default columnController;
