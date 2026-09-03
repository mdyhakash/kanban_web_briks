import { z } from "zod";

const createColumn = z.object({
  title: z.string("Title is required").min(1).max(100),
  boardId: z.string("boardId is required").uuid(),
});

const updateColumn = z.object({
  title: z.string().min(1).max(100).optional(),
});

const columnValidation = {
  createColumn,
  updateColumn,
};

export default columnValidation;
