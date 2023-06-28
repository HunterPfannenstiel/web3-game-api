import { Router } from "express";
import controller from "@controllers/blockchain";

const router = Router();

router.get("/user-tokens", controller.getUsersTokens);

export default router;
