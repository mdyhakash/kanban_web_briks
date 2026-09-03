import { prisma } from "../../lib/prisma";

const createColumn = async (boardId: string, title: string) => {
  const lastColumn = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
  });

  const position = lastColumn ? lastColumn.position + 1 : 1;

  const column = await prisma.column.create({
    data: { title, boardId, position },
  });

  return column;
};

const updateColumn = async (columnId: string, title: string) => {
  const column = await prisma.column.update({
    where: { id: columnId },
    data: { title },
  });

  return column;
};

const deleteColumn = async (columnId: string) => {
  await prisma.column.delete({ where: { id: columnId } });
  return null;
};

const getColumnBoardId = async (columnId: string): Promise<string | null> => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });

  return column?.boardId ?? null;
};

const columnService = {
  createColumn,
  updateColumn,
  deleteColumn,
  getColumnBoardId,
};

export default columnService;
