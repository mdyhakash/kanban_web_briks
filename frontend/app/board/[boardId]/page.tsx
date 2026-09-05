import { Board } from "@/types/types";

import { Navbar } from "@/components/navbar";
import { Board as KanbanBoard } from "@/components/kanban/board";
import { BoardSidebar } from "@/components/board-sidebar";

import { authFetch } from "@/services/auth-fetch";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  const [boardResult, userResult, boardsResult] = await Promise.all([
    authFetch<Board>(`/board/${boardId}`),
    authFetch<{ id: string }>("/auth/me"),
    authFetch<Board[]>("/board"),
  ]);

  if (!boardResult.success) {
    throw new Error(boardResult.message);
  }

  if (!userResult.success) {
    throw new Error(userResult.message);
  }

  const board = boardResult.data;
  const user = userResult.data;
  const boards = boardsResult.success ? boardsResult.data : [board];

  return (
    <div className="flex h-screen">
      <BoardSidebar boards={boards} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar board={board} userId={user.id} />
        <KanbanBoard board={board} />
      </div>
    </div>
  );
}
