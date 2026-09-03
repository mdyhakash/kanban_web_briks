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

const updateBoard = async (boardId: string, payload: IUpdateBoard) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }
  return prisma.board.update({
    where: {
      id: boardId,
    },
    data: payload,
  });
};

const deleteBoard = async (boardId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }
  await prisma.board.delete({
    where: {
      id: boardId,
    },
  });

  return null;
};

const shareBoard = async (boardId: string, email: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const userToAdd = await prisma.user.findUnique({ where: { email: email } });

  if (!userToAdd) {
    throw new Error("No user found with that email.");
  }

  const existing = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: { boardId, userId: userToAdd.id },
    },
  });

  if (existing) {
    throw new Error("This user already has access to the board.");
  }

  const member = await prisma.boardMember.create({
    data: {
      boardId,
      userId: userToAdd.id,
      role: "MEMBER",
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return member;
};

const removeBoardMember = async (boardId: string, memberUserId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  if (memberUserId === board.ownerId) {
    throw new Error("Cannot remove the board owner.");
  }

  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: memberUserId,
      },
    },
  });

  if (!membership) {
    throw new Error("This user is not a member of the board.");
  }

  await prisma.boardMember.delete({
    where: {
      boardId_userId: {
        boardId,
        userId: memberUserId,
      },
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
  shareBoard,
  removeBoardMember,
};
