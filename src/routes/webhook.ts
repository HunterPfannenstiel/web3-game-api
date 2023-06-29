import { Router } from "express";
import controller from "@controllers/webhook";
import { validateAlchemySignature } from "@middleware/alchemy";

const router = Router();

router.post(
  "/game-mint",
  validateAlchemySignature("mint"),
  controller.postMintToGame
);

router.post("/confirm-transaction", controller.postConfirmTransaction);

export default router;
