"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createColumnAction } from "@/lib/actions/columnAction";

export function AddColumnComposer({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const action = createColumnAction.bind(null, boardId);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (!open) {
    return (
      <Button
        variant="ghost"
        className="h-10 w-72 shrink-0 justify-start gap-2 border border-dashed text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" /> Add column
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        setOpen(false);
      }}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-lg border bg-secondary/40 p-2"
    >
      <Input name="title" autoFocus placeholder="Column name" />
      {state?.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
