import express from "express";
import { 
    checkFATypeHandler, 
    generateDOTHandler, 
    testInputStringHandler, 
    minimizeDFAHandler, 
    convertNFAtoDFAHandler,
    // [NEW CODE] - Import new database handlers
    saveAutomatonHandler,
    getAutomataHandler,
    getAutomatonByIdHandler,
    updateAutomatonHandler,
    deleteAutomatonHandler
} from "../controllers/automatonController.js";

const router = express.Router();

// [UNCHANGED] - Existing routes
router.post("/check-fa-type", checkFATypeHandler);
router.post("/generate-automaton-image", generateDOTHandler);
router.post("/test-input-string", testInputStringHandler);
router.post("/minimize-dfa", minimizeDFAHandler);
router.post("/convert-nfa-to-dfa", convertNFAtoDFAHandler);

// [NEW CODE] - Database routes
router.post("/save-automaton", saveAutomatonHandler);
router.get("/automata", getAutomataHandler);
router.get("/automaton/:id", getAutomatonByIdHandler);
router.put("/automaton/:id", updateAutomatonHandler);
router.delete("/automaton/:id", deleteAutomatonHandler);

export default router;
