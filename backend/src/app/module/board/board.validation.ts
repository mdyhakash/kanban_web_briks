import { z } from "zod";

const createBoard = z.object({
  body: z.object({
    title: z.string("Title is required").min(1).max(120),
    description: z.string().max(500).optional(),
  }),
});

export const BoardValidation = {
  createBoard,
};
