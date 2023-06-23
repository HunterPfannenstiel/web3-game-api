import { Router } from "express";
import controller from "../../controllers/database";
import { authMiddleware } from "../../middleware/auth";

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

router.get("/user-tokens", authMiddleware(), controller.getUsersTokens);

router.get("/", (req, res, next) => {
  return res.status(200).json({ message: "hello from database" });
});

export default router;
