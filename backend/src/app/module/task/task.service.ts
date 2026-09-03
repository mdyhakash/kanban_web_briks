import { prisma } from "../../lib/prisma";
import { ICreateTask, IUpdateTask } from "./task.interface";

const createTask = async (columnId: string, payload: ICreateTask) => {
  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { position: "desc" },
  });

  const position = lastTask ? lastTask.position + 1 : 1;

  const task = await prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      columnId,
      position,
    },
  });

  return task;
};

const updateTask = async (taskId: string, payload: IUpdateTask) => {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: payload,
  });

  return task;
};

const deleteTask = async (taskId: string) => {
  await prisma.task.delete({ where: { id: taskId } });
  return null;
};

const getTaskBoardId = async (taskId: string): Promise<string | null> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { column: { select: { boardId: true } } },
  });

  return task?.column.boardId ?? null;
};

const taskService = {
  createTask,
  updateTask,
  deleteTask,
  getTaskBoardId,
};

export default taskService;
