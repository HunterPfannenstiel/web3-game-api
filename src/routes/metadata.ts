import express from "express";
import controller from "../controllers/metadata";

const router = express.Router();

router.get("/smol", controller.getUserSmolMetadata);

router.get("/:contract", controller.getUserMetadata);

export default router;
