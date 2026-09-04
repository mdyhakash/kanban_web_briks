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
const moveTask = z.object({
  columnId: z.string("columnId is required"),
  index: z.number("index is required").int().min(0),
});

const taskValidation = {
  createTask,
  updateTask,
  moveTask,
};

export default taskValidation;
