"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

import { Board as BoardType, Column as ColumnType, Task } from "@/types/types";
import { moveTaskAction } from "@/lib/actions/taskAction";
import { Column } from "./column";
import { AddColumnComposer } from "./add-column-composer";
import { TaskCard } from "./task-card";

export function Board({ board }: { board: BoardType }) {
  const router = useRouter();
  const dndId = useId();
  const [columns, setColumns] = useState<ColumnType[]>(
    [...(board.columns ?? [])].sort((a, b) => a.position - b.position),
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setColumns(
      [...(board.columns ?? [])].sort((a, b) => a.position - b.position),
    );
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function findTask(taskId: string) {
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) return { task, column };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const found = findTask(event.active.id as string);
    if (found) setActiveTask(found.task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const source = findTask(activeId);
    if (!source) return;

    const overIsColumn = columns.some((c) => c.id === overId);
    const destColumn = overIsColumn
      ? columns.find((c) => c.id === overId)!
      : columns.find((c) => c.tasks.some((t) => t.id === overId))!;
    if (!destColumn) return;

    const destWithoutActive = destColumn.tasks.filter((t) => t.id !== activeId);
    const foundIndex = overIsColumn
      ? -1
      : destWithoutActive.findIndex((t) => t.id === overId);
    const index = foundIndex === -1 ? destWithoutActive.length : foundIndex;

    setColumns((prev) =>
      prev.map((c) => {
        if (c.id === source.column.id && c.id !== destColumn.id) {
          return { ...c, tasks: c.tasks.filter((t) => t.id !== activeId) };
        }
        if (c.id === destColumn.id) {
          const tasks = [...destWithoutActive];
          tasks.splice(index, 0, { ...source.task, columnId: destColumn.id });
          return { ...c, tasks };
        }
        return c;
      }),
    );

    try {
      await moveTaskAction(board.id, activeId, {
        columnId: destColumn.id,
        index,
      });
    } catch {
      router.refresh();
    }
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full min-w-0 min-h-0 flex-1 flex-wrap content-start gap-4 overflow-y-auto p-6">
        {columns.map((column) => (
          <Column
            key={column.id}
            boardId={board.id}
            column={column}
            tasks={column.tasks}
          />
        ))}
        <AddColumnComposer boardId={board.id} />
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} boardId={board.id} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
