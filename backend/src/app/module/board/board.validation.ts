import { z } from "zod";

const createBoard = z.object({
  title: z.string("Title is required").min(1).max(120),
  description: z.string().max(500).optional(),
});

const updateBoard = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
});
export const BoardValidation = {
  createBoard,
  updateBoard,
};
