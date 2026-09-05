"use server";

import { authFetch } from "@/services/auth-fetch";
import { revalidatePath } from "next/cache";

export async function createColumnAction(
  boardId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  const result = await authFetch("/column", {
    method: "POST",
    body: JSON.stringify({
      boardId,
      title,
    }),
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath(`/board/${boardId}`);

  return { success: true };
}

export async function renameColumnAction(
  boardId: string,
  columnId: string,
  title: string,
) {
  const result = await authFetch(`/column/${columnId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath(`/board/${boardId}`);
}

export async function deleteColumnAction(boardId: string, columnId: string) {
  const result = await authFetch(`/column/${columnId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath(`/board/${boardId}`);
}
