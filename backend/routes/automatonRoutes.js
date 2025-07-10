import express from "express";
import { checkFATypeHandler, generateDOTHandler, testInputStringHandler } from "../controllers/automatonController.js";

const router = express.Router();

router.post("/check-fa-type", checkFATypeHandler);
router.post("/generate-automaton-image", generateDOTHandler);
router.post("/test-input-string", testInputStringHandler);

export default router;