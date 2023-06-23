import { Router } from "express";
import controller from "../../controllers/database/web";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.post("/login-ethereum", controller.postLoginWithEthereum);

router.post("/wallet-link", authMiddleware(true), controller.postLinkWallet);

// router.get("/inventory", authMiddleware(true), controller.getInventory);

router.get("/token-metadata", controller.getTokenMetadata);

router.get("/transactions", authMiddleware(true), controller.getTransactions);

router.get("/challenge", controller.getSigningChallenge);

export default router;
