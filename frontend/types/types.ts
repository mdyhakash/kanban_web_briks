export interface User {
  id: string;
  name: string;
  email: string;
}

export interface BoardMember {
  id: string;
  role: "OWNER" | "MEMBER";
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  columns?: Column[];
  _count?: { columns: number };
  createdAt: string;
  updatedAt: string;
}
