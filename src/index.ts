import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import authRoute from "./routes/authRoute";

const app: Application = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
