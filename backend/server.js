import express from "express";
import cors from "cors";
import { checkFAType } from "./utils/checkFAType.js"; // <-- import your separated logic
import { generateAutomatonDOT } from "./utils/generateDOT.js"; // <-- import DOT generation logic

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/check-fa-type", async (req, res) => {
    console.log("Received request:", req.body);

    try {
        const result = await checkFAType(req.body);
        res.json(result);
    } catch (err) {
        console.error("Error checking FA type:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/generate-automaton-image", async (req, res) => {
    console.log("Received image generation request:", req.body);

    try {
        const { transitions, start_state, end_states, states, symbols } = req.body;

        // Generate DOT notation for the automaton
        const dotString = generateAutomatonDOT({
            transitions,
            start_state,
            end_states,
            states,
            symbols
        });

        res.json({
            success: true,
            dot: dotString
        });
    } catch (err) {
        console.error("Error generating automaton image:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});