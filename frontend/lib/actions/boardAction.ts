"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authFetch } from "@/services/auth-fetch";
import { Board } from "@/types/types";

export async function createBoardAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  const result = await authFetch("/board", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  if (!result.success) {
    return { error: result.message };
  }

  const board = result.data as Board;

  redirect(`/board/${board.id}`);
}

export async function updateBoardAction(
  boardId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  const result = await authFetch(`/board/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath(`/board/${boardId}`);
  revalidatePath("/");

  return { success: true };
}

export async function deleteBoardAction(boardId: string) {
  const result = await authFetch(`/board/${boardId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    throw new Error(result.message || "Failed to delete board");
  }

  revalidatePath("/");

  return {
    success: true,
  };
}

export async function shareBoardAction(
  boardId: string,
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const result = await authFetch(`/board/${boardId}/share`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath(`/board/${boardId}`);

  return { success: true };
}

export async function removeMemberAction(boardId: string, memberId: string) {
  const result = await authFetch(`/board/${boardId}/members/${memberId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath(`/board/${boardId}`);
}
