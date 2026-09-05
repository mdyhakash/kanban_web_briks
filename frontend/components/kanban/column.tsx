"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Column as ColumnType, Task } from "@/types/types";
import { cn } from "@/lib/utils";

import {
  deleteColumnAction,
  renameColumnAction,
} from "@/lib/actions/columnAction";

import { TaskCard } from "./task-card";
import { AddTaskDialog } from "./add-task-dialog";

export function Column({
  boardId,
  column,
  tasks,
}: {
  boardId: string;
  column: ColumnType;
  tasks: Task[];
}) {
  const router = useRouter();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const taskIds = tasks.map((task) => task.id);

  async function commitRename() {
    setEditing(false);

    const trimmed = title.trim();

    if (!trimmed || trimmed === column.title) {
      setTitle(column.title);
      return;
    }

    try {
      await renameColumnAction(boardId, column.id, trimmed);

      router.refresh();
    } catch (error) {
      console.error("Failed to rename column:", error);

      // Reset title if rename fails
      setTitle(column.title);
    }
  }

  function handleDeleteClick() {
    setDeleteOpen(true);
  }


  async function handleDelete() {
    try {
      setDeleting(true);

      await deleteColumnAction(boardId, column.id);

      setDeleteOpen(false);

      router.refresh();
    } catch (error) {
      console.error("Failed to delete column:", error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex w-72 shrink-0 flex-col rounded-lg border bg-secondary/40">
        {/* Column Header */}
        <div className="flex items-center gap-2 rounded-t-lg border-b px-3 py-2.5">
          {/* Column Title / Rename Input */}
          {editing ? (
            <Input
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitRename();
                }

                if (e.key === "Escape") {
                  setTitle(column.title);
                  setEditing(false);
                }
              }}
              className="h-7 text-sm"
            />
          ) : (
            <h3
              className="cursor-text text-sm font-semibold"
              onClick={() => setEditing(true)}
            >
              {column.title}
            </h3>
          )}

          {/* Task Count */}
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              {/* Rename */}
              <DropdownMenuItem onClick={() => setEditing(true)}>
                Rename
              </DropdownMenuItem>

              {/* Delete */}
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDeleteClick}
              >
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tasks */}
        <ScrollArea className="flex-1">
          <div
            ref={setNodeRef}
            className={cn(
              "flex min-h-30 flex-col gap-2 p-2 transition-colors",
              isOver && "bg-accent/50",
            )}
          >
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} boardId={boardId} />
              ))}
            </SortableContext>
          </div>
        </ScrollArea>

        {/* Add Task */}
        <div className="border-t p-1.5">
          <AddTaskDialog
            boardId={boardId}
            columnId={column.id}
            columnTitle={column.title}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{column.title}"?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              column and all of its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete column"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
