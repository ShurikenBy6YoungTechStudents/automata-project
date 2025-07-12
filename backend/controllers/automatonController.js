import { checkFAType } from "../utils/checkFAType.js";
import { generateAutomatonDOT } from "../utils/generateDOT.js";
import { testInputStringWithCpp } from "../utils/InputString.js";
import { minimizeDFA } from "../utils/DFAMinimizer.js";

export const checkFATypeHandler = async (req, res) => {
    try {
        console.log("Received FA type check request:", JSON.stringify(req.body, null, 2));
        const result = await checkFAType(req.body);
        console.log("FA type check result:", result);
        res.json(result);
    } catch (err) {
        console.error("Error in checkFATypeHandler:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const generateDOTHandler = async (req, res) => {
    try {
        const { transitions, start_state, end_states, states, symbols } = req.body;
        const dotString = generateAutomatonDOT({ transitions, start_state, end_states, states, symbols });
        res.json({ success: true, dot: dotString });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const testInputStringHandler = async (req, res) => {
    console.log("Received string validation request:", req.body);

    try {
        const { transitions, start_state, end_states, input } = req.body;

        // Validate input
        if (!transitions || !start_state || !end_states || input === undefined) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: transitions, start_state, end_states, input"
            });
        }

        const cppResult = await testInputStringWithCpp({
            transitions,
            start_state,
            end_states,
            input_string: input
        });

        // The C++ program returns the complete result, so we pass it through
        res.json(cppResult);
    } catch (err) {
        console.error("Error in testInputStringHandler:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const minimizeDFAHandler = async (req, res) => {
    try {
        console.log("Received DFA minimization request:", JSON.stringify(req.body, null, 2));

        // Validate that it's a DFA first
        const typeResult = await checkFAType(req.body);
        if (!typeResult.success || typeResult.type !== "DFA") {
            return res.status(400).json({
                success: false,
                error: "Only DFAs can be minimized. This automaton is: " + (typeResult.type || "invalid")
            });
        }

        const result = await minimizeDFA(req.body);
        console.log("DFA minimization result:", result);
        res.json(result);
    } catch (err) {
        console.error("Error in minimizeDFAHandler:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
