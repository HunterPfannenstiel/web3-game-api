import { Router } from "express";
import controller from "../controllers/sign-message";

const router = Router();

router.get("/", controller.getSignedMessage);

router.get("/mint", controller.getMintingMessage);

export default router;
