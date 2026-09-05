import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Board } from "@/types/types";
import { CreateBoardDialog } from "@/components/create-board-dialog";
import { authFetch } from "@/services/auth-fetch";
import { AppNavbar } from "@/components/share/app-navbar";

export default async function BoardsPage() {
  const result = await authFetch<Board[]>("/board");

  if (!result.success) {
    if (
      result.message ===
      "You are not logged in. Please log in to access this resource."
    ) {
      redirect("/login");
    }

    throw new Error(result.message);
  }

  const boards = result.data;

  return (
    <>
      <AppNavbar />
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Your boards</h1>
          <CreateBoardDialog />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/board/${board.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{board.title}</CardTitle>
                </CardHeader>

                <CardContent className="text-xs text-muted-foreground">
                  {board._count?.columns ?? 0} columns · owned by{" "}
                  {board.owner.name}
                </CardContent>
              </Card>
            </Link>
          ))}

          {boards.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No boards yet — create one to get started.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
