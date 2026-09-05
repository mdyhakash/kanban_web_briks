"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "@/components/create-board-dialog";
import { Board } from "@/types/types";
import { cn } from "@/lib/utils";

export function BoardSidebar({ boards }: { boards: Board[] }) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    setCollapsed((prev) => !prev);
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b p-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 overflow-hidden"
          >
            <LayoutDashboard className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate font-semibold">Boards</span>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {boards.map((board) => {
          const active = pathname === `/board/${board.id}`;

          return (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              title={collapsed ? board.title : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                active && "bg-accent text-accent-foreground font-medium",
                collapsed && "justify-center px-0",
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                {board.title.slice(0, 1).toUpperCase()}
              </span>

              {!collapsed && <span className="truncate">{board.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <CreateBoardDialog collapsed={collapsed} />
      </div>
    </aside>
  );
}
