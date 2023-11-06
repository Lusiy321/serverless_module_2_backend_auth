import express from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService } from "../services/userService";

const SECRET_KEY = `${process.env.JWT_SECRET}`;

class AuthController {
  static async signUp(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    console.log(email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userExists = await UserService.findUserByEmail(email);
      if (userExists.email === email) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserService.registerUser(email, hashedPassword);
      return res
        .status(201)
        .json({ message: "User registered successfully", data: user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Registration failed" });
    }
  }

  static async signIn(req: express.Request, res: express.Response) {
    const { email, password } = req.body;

    const user = await UserService.findUserByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const passwordMatch = await UserService.comparePasswords(
      password,
      user.encrypted_password
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Генерация JWT-токена
    const token = jwt.sign({ email }, SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_TTL,
    });

    res.cookie("token", token, { httpOnly: true });

    res.json({ message: "Authentication successful", token });
  }

  static async me(req: express.Request, res: express.Response) {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");

    if (!bearer) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const accessToken = jwt.verify(token, SECRET_KEY) as JwtPayload;
      res.json({ email: accessToken.email });
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  }
}

export default AuthController;
