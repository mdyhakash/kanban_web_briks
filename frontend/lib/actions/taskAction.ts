"use server";

import { authFetch } from "@/services/auth-fetch";
import { revalidatePath } from "next/cache";

export async function createTaskAction(
  boardId: string,
  columnId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  const result = await authFetch("/task", {
    method: "POST",
    body: JSON.stringify({
      columnId,
      title,
      description: description || undefined,
    }),
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath(`/board/${boardId}`);

  return { success: true };
}

export async function updateTaskAction(
  boardId: string,
  taskId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  const result = await authFetch(`/task/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title,
      description: description || undefined,
    }),
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath(`/board/${boardId}`);

  return { success: true };
}

export async function deleteTaskAction(boardId: string, taskId: string) {
  const result = await authFetch(`/task/${taskId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath(`/board/${boardId}`);
}

export async function moveTaskAction(
  boardId: string,
  taskId: string,
  payload: {
    columnId: string;
    index: number;
  },
) {
  const result = await authFetch(`/task/${taskId}/move`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath(`/board/${boardId}`);
}
