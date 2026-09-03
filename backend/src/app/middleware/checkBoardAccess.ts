import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";

type ResolveBoardId = (req: Request) => Promise<string | null>;

const defaultResolver: ResolveBoardId = async (req) => {
  return req.params.boardId || req.body.boardId || null;
};

const checkBoardAccess = (options?: {
  resolveBoardId?: ResolveBoardId;
  requireOwner?: boolean;
}) => {
  const resolveBoardId = options?.resolveBoardId ?? defaultResolver;
  const requireOwner = options?.requireOwner ?? false;

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new Error("You are not authorized. Please login.");
    }

    const boardId = await resolveBoardId(req);

    if (!boardId) {
      throw new Error("Board could not be resolved from the request.");
    }

    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: req.user.userId,
        },
      },
    });

    if (!membership) {
      throw new Error("You do not have access to this board.");
    }

    if (requireOwner && membership.role !== "OWNER") {
      throw new Error("Only the board owner can perform this action.");
    }
    req.boardId = boardId;
    req.boardRole = membership.role;

    next();
  });
};

declare global {
  namespace Express {
    interface Request {
      boardId?: string;
      boardRole?: "OWNER" | "MEMBER";
    }
  }
}

export default checkBoardAccess;
