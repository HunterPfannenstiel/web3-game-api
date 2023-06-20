import { Router } from "express";
import controller from "../../controllers/database/web";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.post("/login", controller.postLogin);

router.post("/wallet-link", authMiddleware(true), controller.postLinkWallet);

router.get("/challenge", controller.getSigningChallenge);

export default router;
