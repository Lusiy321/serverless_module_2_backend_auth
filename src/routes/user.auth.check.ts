import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService, supabase } from "../services/userService";
import { SECRET_KEY, TOKEN_TTL } from "../controllers/authController";

export async function userAuth(req: any, res: any, next: any) {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  try {
    if (bearer !== "Bearer") {
      return res
        .status(401)
        .json({ success: false, error: "Authentication failed" });
    }

    const { email } = jwt.verify(token, SECRET_KEY) as JwtPayload;
    if (!email) {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("accessToken", token);

      if (error) {
        return { error: error.message };
      }
      if (data) {
        const accessToken = jwt.sign({ email }, SECRET_KEY, {
          expiresIn: TOKEN_TTL,
        });
        const { error } = await supabase
          .from("users")
          .update({ accessToken: accessToken })
          .eq("id", data[0].id);

        if (error) {
          return { error: error.message };
        }
        return data;
      }
    }
    const user = await UserService.findUserByEmail(email);
    if (Array.isArray(user) && user.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (!user[0].accessToken) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication failed" });
    }
    req.user = user[0].refreshToken;
    next();
  } catch (error: any) {
    if (error.message === "invalid signature") {
      error.status = 401;
    }
    next(
      res.status(401).json({ success: false, error: "Authentication failed" })
    );
  }
}
