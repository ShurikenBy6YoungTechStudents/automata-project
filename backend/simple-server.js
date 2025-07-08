import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate-automaton-image", async (req, res) => {
    console.log("Received image generation request:", req.body);

    try {
        const { transitions, start_state, end_states, states, symbols } = req.body;
        
        // Simple DOT generation without external module
        let dot = 'digraph FiniteAutomaton {\n';
        dot += '  rankdir=LR;\n';
        dot += '  size="8,5";\n';
        dot += '  node [shape = circle];\n\n';

        // Add invisible start node for arrow pointing to start state
        dot += '  start [shape=point, style=invis];\n';
        dot += `  start -> "${start_state}" [label="start"];\n\n`;

        // Define final states with double circles
        if (end_states && end_states.length > 0) {
            const finalStatesStr = end_states.map(state => `"${state}"`).join(' ');
            dot += `  node [shape = doublecircle]; ${finalStatesStr};\n`;
        }

        // Reset node shape for regular states
        dot += '  node [shape = circle];\n\n';

        // Add transitions
        const transitionMap = new Map();

        for (const [fromState, stateTransitions] of Object.entries(transitions)) {
            for (const [symbol, toStates] of Object.entries(stateTransitions)) {
                if (toStates && toStates.length > 0) {
                    for (const toState of toStates) {
                        const key = `${fromState}->${toState}`;
                        if (!transitionMap.has(key)) {
                            transitionMap.set(key, []);
                        }
                        transitionMap.get(key).push(symbol);
                    }
                }
            }
        }

        // Generate transition edges with combined labels
        for (const [transition, symbols] of transitionMap.entries()) {
            const [fromState, toState] = transition.split('->');
            const label = symbols.join(', ');
            dot += `  "${fromState}" -> "${toState}" [label="${label}"];\n`;
        }

        dot += '}\n';
        console.log('Generated DOT:', dot);

        res.json({ 
            success: true, 
            dot: dot 
        });
    } catch (err) {
        console.error("Error generating automaton image:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(5000, () => {
    console.log("Simple server running on port 5000");
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});
