import { prisma } from "../../lib/prisma";
import { ICreateTask, IMoveTask, IUpdateTask } from "./task.interface";

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
const moveTask = async (taskId: string, payload: IMoveTask) => {
  const { columnId, index } = payload;

  const task = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
    select: { column: { select: { boardId: true } } },
  });

  const destColumn = await prisma.column.findUniqueOrThrow({
    where: { id: columnId },
    select: { boardId: true },
  });

  if (destColumn.boardId !== task.column.boardId) {
    throw new Error("Cannot move a task to a column on a different board.");
  }

  const siblings = await prisma.task.findMany({
    where: { columnId, NOT: { id: taskId } },
    orderBy: { position: "asc" },
  });

  const before = siblings[index - 1];
  const after = siblings[index];

  let position: number;
  if (!before && !after) position = 1;
  else if (!before) position = after.position / 2;
  else if (!after) position = before.position + 1;
  else position = (before.position + after.position) / 2;

  return prisma.task.update({
    where: { id: taskId },
    data: { columnId, position },
  });
};
const taskService = {
  createTask,
  updateTask,
  deleteTask,
  getTaskBoardId,
  moveTask,
};

export default taskService;
