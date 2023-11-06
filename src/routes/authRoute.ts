import { Request, Response, Router } from "express";
import AuthController from "../controllers/authController";

const router = Router();

router.post("/auth/sign-up", async (req: Request, res: Response) => {
  AuthController.signUp;
});

router.post("/auth/sign-in", async (req: Request, res: Response) => {
  AuthController.signIn;
});

router.get("/me", async (req: Request, res: Response) => {
  AuthController.me(req, res);
});

export default router;
