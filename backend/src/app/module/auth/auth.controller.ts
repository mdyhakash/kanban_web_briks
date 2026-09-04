import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { authServices } from "./auth.service";
import { clearAuthCookie, setAuthCookie } from "../../utils/authCookies";

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

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new Error("No refresh token found. Please log in again.");

  const { accessToken } = await authServices.refreshToken(token);
  setAuthCookie(res, { accessToken });

  sendResponse(res, {
    statusCode: 200,
    message: "Access token refreshed.",
    data: { accessToken },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.getMe(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Current user retrieved.",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  clearAuthCookie(res);
  sendResponse(res, {
    statusCode: 200,
    message: "Logged out successfully.",
    data: null,
  });
});

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
  logoutUser,
};
