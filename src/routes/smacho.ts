import { Router } from "express";
import controller from "../controllers/smacho";

const router = Router();

router.get("/token-id/:id", controller.getSmachoForToken);

router.get("/account/:address");

export default router;
