"use client";

import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { Task } from "@/types/types";
import { cn } from "@/lib/utils";
import { EditTaskDialog } from "./edit-task-dialog";

export function TaskCard({ task, boardId }: { task: Task; boardId: string }) {
  const [editing, setEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        onClick={() => setEditing(true)}
        className={cn(
          "group cursor-pointer select-none transition-shadow hover:shadow-md",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2 p-3 pb-0">
          <p className="text-sm font-medium leading-snug">{task.title}</p>
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </CardHeader>
        {task.description && (
          <CardContent className="p-3 pt-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          </CardContent>
        )}
      </Card>

      <EditTaskDialog
        boardId={boardId}
        task={task}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  );
}
