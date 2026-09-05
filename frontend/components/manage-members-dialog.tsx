"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Board } from "@/types/types";
import {
  removeMemberAction,
  shareBoardAction,
} from "@/lib/actions/boardAction";

export function ManageMembersDialog({
  board,
  open,
  onOpenChange,
}: {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const action = shareBoardAction.bind(null, board.id);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [isRemoving, startRemoveTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleRemove(memberId: string) {
    setRemovingId(memberId);

    startRemoveTransition(async () => {
      try {
        await removeMemberAction(board.id, memberId);
        router.refresh();
      } catch (error) {
        toast.error("Failed to remove member", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setRemovingId(null);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share &quot;{board.title}&quot;</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex gap-2">
          <Input
            name="email"
            type="email"
            placeholder="teammate@example.com"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add"}
          </Button>
        </form>
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="mt-2 space-y-2">
          {board.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {m.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.role.toLowerCase()}
                  </p>
                </div>
              </div>
              {m.role !== "OWNER" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isRemoving && removingId === m.id}
                  onClick={() => handleRemove(m.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
