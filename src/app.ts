import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import metadataRouter from "./routes/metadata";
import smachoRouter from "./routes/smacho";
import signMessageRouter from "./routes/sign-message";
import databaseRouter from "./routes/database";
import webRouter from "./routes/database/web";
import webhookRouter from "./routes/webhook";
import { addAlchemyContextToRequest } from "@middleware/alchemy";

if (process.env.NODE_ENV !== "production") config();

const app = express();
app.use(express.json({ verify: addAlchemyContextToRequest }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.MARKETPLACE_DOMIAN!);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use("/metadata", metadataRouter);
app.use("/smacho", smachoRouter);
app.use("/sign-message", signMessageRouter);
app.use("/database/web", webRouter);
app.use("/database", databaseRouter);
app.use("/webhook", webhookRouter);

app.get("/", (req, res, next) => {
  return res.status(200).json({ message: "hello" });
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  return res.status(error.statusCode || 500).json({ message: error.message });
});

app.listen(process.env.PORT);
