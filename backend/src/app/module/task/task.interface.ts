export interface ICreateTask {
  title: string;
  description?: string;
}
export interface IUpdateTask {
  title?: string;
  description?: string;
}
export interface IMoveTask {
  columnId: string;
  index: number;
}
