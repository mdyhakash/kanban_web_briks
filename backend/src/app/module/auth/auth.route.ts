import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";

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

export const authRoutes = router;
