import { Router } from "express";
import controller from "../controllers/metadata";

const router = Router();

router.get("/smol", controller.getUserSmolMetadata); //Expects the 'account' query parameter that should be equal to an address

router.get("/:contract", controller.getUserMetadata);

export default router;
