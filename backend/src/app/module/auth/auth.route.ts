import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";
import { auth } from "../../middleware/checkAuth";

const router = Router();
router.post(
  "/register",
  validateRequest(AuthValidation.RegisterZodSchema),
  authController.registerUser,
);
router.post(
  "/login",
  validateRequest(AuthValidation.LoginZodSchema),
  authController.loginUser,
);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", auth(), authController.getMe);
router.post("/logout", authController.logoutUser);

export const authRoutes = router;
