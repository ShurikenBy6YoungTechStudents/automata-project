import express from "express";
import { checkFATypeHandler, generateDOTHandler, testInputStringHandler, minimizeDFAHandler, convertNFAtoDFAHandler } from "../controllers/automatonController.js";

const router = express.Router();

router.post("/check-fa-type", checkFATypeHandler);
router.post("/generate-automaton-image", generateDOTHandler);
router.post("/test-input-string", testInputStringHandler);
router.post("/minimize-dfa", minimizeDFAHandler);
router.post("/convert-nfa-to-dfa", convertNFAtoDFAHandler);

export default router;