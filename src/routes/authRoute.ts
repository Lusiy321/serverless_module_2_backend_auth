import { Request, Response, Router } from "express";
import AuthController from "../controllers/authController";

const router = Router();

router.post("/sign-up", async (req: Request, res: Response) => {
  AuthController.signUp(req, res);
});

router.post("/sign-in", async (req: Request, res: Response) => {
  AuthController.signIn(req, res);
  console.log(req.body);
});

router.get("/me", async (req: Request, res: Response) => {
  AuthController.me(req, res);
  console.log("work");
});

export default router;
