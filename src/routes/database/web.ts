import { Router } from "express";
import controller from "../../controllers/database/web";

const router = Router();

router.post("/login", controller.postLogin);

export default router;
