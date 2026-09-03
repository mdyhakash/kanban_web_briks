import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import taskService from "./task.service";
import { sendResponse } from "../../utils/sendResponse";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.createTask(req.body.columnId, req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "Task created successfully.",
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.updateTask(
    req.params.taskId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    message: "Task updated successfully.",
    data: result,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.taskId as string);

  sendResponse(res, {
    statusCode: 200,
    message: "Task deleted successfully.",
    data: null,
  });
});

const taskController = {
  createTask,
  updateTask,
  deleteTask,
};

export default taskController;
