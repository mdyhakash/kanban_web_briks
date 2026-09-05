"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Board } from "@/types/types";
import { deleteBoardAction } from "@/lib/actions/boardAction";
import { ManageMembersDialog } from "./manage-members-dialog";
import { RenameBoardDialog } from "./rename-board-dialog";
import { logoutAction } from "@/services/logoutAction";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  board: Board;
  userId: string;
}

export function Navbar({ board, userId }: NavbarProps) {
  const router = useRouter();

  const [membersOpen, setMembersOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = board.ownerId === userId;
  const handleDeleteBoard = async () => {
    if (!isOwner) {
      return;
    }

    try {
      setDeleting(true);

      await deleteBoardAction(board.id);

      setDeleteOpen(false);

      toast.success("Board deleted successfully");

      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete board", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Back to your boards"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <LayoutDashboard className="h-5 w-5 text-primary" />

          <span className="font-semibold">{board.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {board.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                <AvatarFallback className="text-xs">
                  {member.user.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setMembersOpen(true)}
          >
            <Users className="h-4 w-4" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  aria-label="Board options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!isOwner}
                onClick={() => {
                  if (!isOwner) return;
                  setRenameOpen(true);
                }}
              >
                Rename board
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                disabled={!isOwner}
                onClick={() => {
                  if (!isOwner) return;
                  setDeleteOpen(true);
                }}
              >
                Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => logoutAction()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <ManageMembersDialog
        board={board}
        open={membersOpen}
        onOpenChange={setMembersOpen}
        isOwner={isOwner}
      />

      <RenameBoardDialog
        board={board}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{board.title}"?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board and all of its columns and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleDeleteBoard}
              disabled={deleting || !isOwner}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
