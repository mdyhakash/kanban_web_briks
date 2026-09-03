import { prisma } from "../../lib/prisma";
import { ICreateBoard } from "./board.interface";

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

export const boardService = {
  createBoard,
  getMyBoards,
};
