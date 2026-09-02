import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  totalPages?: number;
  totalGearCount?: number;
  total?: number;
  averageRating?: number;
};
type TResponseData<T> = {
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(data.statusCode).json({
    success: true,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
