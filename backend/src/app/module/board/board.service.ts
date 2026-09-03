import { prisma } from "../../lib/prisma";
import { ICreateBoard, IUpdateBoard } from "./board.interface";

const createBoard = async (userId: string, payload: ICreateBoard) => {
  const board = await prisma.$transaction(async (tx) => {
    const newBoard = await tx.board.create({
      data: {
        title: payload.title,
        description: payload.description,
        ownerId: userId,
      },
    });

    await tx.boardMember.create({
      data: {
        boardId: newBoard.id,
        userId,
        role: "OWNER",
      },
    });
    return newBoard;
  });
  return board;
};

const getMyBoards = async (userId: string) => {
  const boards = await prisma.board.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: { select: { columns: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return boards;
};

const getBoradById = async (boardId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      columns: {
        orderBy: {
          position: "asc",
        },
        include: {
          tasks: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });
  if (!board) {
    throw new Error("Board not found.");
  }
  return board;
};

const updateBoard = async (
  boardId: string,
  userId: string,
  payload: IUpdateBoard,
) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  if (board.ownerId !== userId) {
    throw new Error("You are not authorized to update this board");
  }

  return prisma.board.update({
    where: {
      id: boardId,
    },
    data: payload,
  });
};

const deleteBoard = async (boardId: string, userId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  if (board.ownerId !== userId) {
    throw new Error("You are not authorized to delete this board");
  }

  await prisma.board.delete({
    where: {
      id: boardId,
    },
  });

  return null;
};

export const boardService = {
  createBoard,
  getMyBoards,
  getBoradById,
  updateBoard,
  deleteBoard,
};
