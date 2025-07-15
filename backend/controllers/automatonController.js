import { checkFAType } from "../utils/checkFAType.js";
import { generateAutomatonDOT } from "../utils/generateDOT.js";
import { testInputStringWithCpp } from "../utils/InputString.js";
import { minimizeDFA } from "../utils/DFAMinimizer.js";
import { convertNFAtoDFA } from "../utils/NFAtoDFA.js";
import { getDatabase } from "../database/db.js";

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

export const convertNFAtoDFAHandler = async (req, res) => {
    try {
        console.log("Received NFA to DFA conversion request:", JSON.stringify(req.body, null, 2));

        // Validate required fields
        const { transitions, start_state, end_states, symbols, states } = req.body;
        if (!transitions || !start_state || !end_states || !symbols || !states) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: transitions, start_state, end_states, symbols, states"
            });
        }

        // Validate that it's an NFA first (optional check)
        const typeResult = await checkFAType(req.body);
        if (typeResult.success && typeResult.type === "DFA") {
            console.log("Warning: Converting DFA to DFA (no change expected)");
        }

        const result = await convertNFAtoDFA(req.body);
        console.log("NFA to DFA conversion result:", result);
        res.json(result);
    } catch (err) {
        console.error("Error in convertNFAtoDFAHandler:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const saveAutomatonHandler = async (req, res) => {
    try {
        const { name, states, symbols, startState, finalStates, transitions } = req.body;
        
        if (!name || !states || !symbols || !startState || !finalStates || !transitions) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name, states, symbols, startState, finalStates, transitions"
            });
        }

        const db = await getDatabase();
        const result = await db.run(
            `INSERT INTO automata (name, states, symbols, start_state, end_states, transitions)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                JSON.stringify(states),
                JSON.stringify(symbols),
                startState,
                JSON.stringify(finalStates),
                JSON.stringify(transitions)
            ]
        );

        res.json({
            success: true,
            id: result.lastID,
            message: "Automaton saved successfully"
        });
    } catch (err) {
        console.error("Error saving automaton:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getAutomataHandler = async (req, res) => {
    try {
        const db = await getDatabase();
        const automata = await db.all(
            `SELECT id, name, created_at, updated_at FROM automata ORDER BY updated_at DESC`
        );

        res.json({
            success: true,
            automata: automata
        });
    } catch (err) {
        console.error("Error fetching automata:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getAutomatonByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDatabase();
        
        const automaton = await db.get(
            `SELECT * FROM automata WHERE id = ?`,
            [id]
        );

        if (!automaton) {
            return res.status(404).json({
                success: false,
                error: "Automaton not found"
            });
        }

        // Parse JSON fields
        const result = {
            ...automaton,
            states: JSON.parse(automaton.states),
            symbols: JSON.parse(automaton.symbols),
            end_states: JSON.parse(automaton.end_states),
            transitions: JSON.parse(automaton.transitions)
        };

        res.json({
            success: true,
            automaton: result
        });
    } catch (err) {
        console.error("Error fetching automaton:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const updateAutomatonHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, states, symbols, startState, finalStates, transitions } = req.body;
        
        if (!name || !states || !symbols || !startState || !finalStates || !transitions) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields"
            });
        }

        const db = await getDatabase();
        const result = await db.run(
            `UPDATE automata 
             SET name = ?, states = ?, symbols = ?, start_state = ?, end_states = ?, transitions = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                name,
                JSON.stringify(states),
                JSON.stringify(symbols),
                startState,
                JSON.stringify(finalStates),
                JSON.stringify(transitions),
                id
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: "Automaton not found"
            });
        }

        res.json({
            success: true,
            message: "Automaton updated successfully"
        });
    } catch (err) {
        console.error("Error updating automaton:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteAutomatonHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDatabase();
        
        // Check if automaton exists
        const automaton = await db.get(
            `SELECT id FROM automata WHERE id = ?`,
            [id]
        );

        if (!automaton) {
            return res.status(404).json({
                success: false,
                error: "Automaton not found"
            });
        }

        // Delete the automaton
        const result = await db.run(
            `DELETE FROM automata WHERE id = ?`,
            [id]
        );

        if (result.changes > 0) {
            res.json({
                success: true,
                message: "Automaton deleted successfully"
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to delete automaton"
            });
        }
    } catch (err) {
        console.error("Error deleting automaton:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
