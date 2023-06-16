import { Router } from "express";
import controller from "../controllers/database";

const router = Router();

router.post("/claim", controller.postTokens);

router.post("/mint", controller.postMintTransaction);

router.post("/confirm-transaction", controller.postTransactionConfirmation);

router.post("/reclaim-transaction", controller.postReclaimTransaction);

router.get("/transaction-info", controller.getTransactionInfo);

router.get("/", (req, res, next) => {
  return res.status(200).json({ message: "hello from database" });
});

export default router;
