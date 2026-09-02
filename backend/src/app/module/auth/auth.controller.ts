import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { authServices } from "./auth.service";
import { setAuthCookie } from "../../utils/authCookies";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authServices.registerUser(payload);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: { result },
    });
  },
);

const loginUser = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await authServices.loginUser(req.body);
  setAuthCookie(res, { accessToken, refreshToken });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
});

export const authController = {
  registerUser,
  loginUser,
};
