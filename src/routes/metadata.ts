import express from "express";
import controller from "../controllers/metadata";

const router = express.Router();

router.get("/:contract", controller.getUserMetadata);

export default router;
