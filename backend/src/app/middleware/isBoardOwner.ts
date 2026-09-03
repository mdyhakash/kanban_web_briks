import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";

const isBoardOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const requesterId = req.user!.userId;

    const board = await prisma.board.findUnique({
      where: {
        id: boardId as string,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!board) {
      throw new Error("Board not found");
    }

    if (board.ownerId !== requesterId) {
      throw new Error("You are not authorized to perform this action");
    }

    next();
  },
);

export default isBoardOwner;
