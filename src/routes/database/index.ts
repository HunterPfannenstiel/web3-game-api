import { Router } from "express";
import controller from "../../controllers/database";
import { authMiddleware } from "../../middleware/auth";
import { body } from "express-validator";
import { ServerError } from "@customObjects/ServerError";
import {
  validateConfirmPassword,
  validatePasswordLength,
  validateUserName,
} from "@middleware/signup";

const router = Router();

router.post("/claim", authMiddleware(false), controller.postTokens);

router.post("/mint", authMiddleware(true), controller.postMintTransaction);

router.post("/confirm-transaction", controller.postTransactionConfirmation);

router.post(
  "/reclaim-transaction",
  authMiddleware(),
  controller.postReclaimTransaction
);

router.get(
  "/transaction-info",
  authMiddleware(),
  controller.getTransactionInfo
);

router.post("/login", controller.postLogin);

router.post(
  "/signup",
  validateConfirmPassword,
  validatePasswordLength,
  validateUserName,
  controller.postSignup
);

router.post("/logout", controller.postLogout);

router.get("/user-tokens", authMiddleware(), controller.getUsersTokens);

export default router;
