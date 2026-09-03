import { z } from "zod";

const createTask = z.object({
  title: z.string("Title is required").min(1).max(200),
  description: z.string().max(1000).optional(),
  columnId: z.string("columnId is required"),
});

const updateTask = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

const taskValidation = {
  createTask,
  updateTask,
};

export default taskValidation;
