import { generateAutomatonDOT } from "./utils/generateDOT.js";

const testData = {
    transitions: {
        "q0": {
            "0": ["q1"],
            "1": ["q0"]
        },
        "q1": {
            "0": ["q0"],
            "1": ["q1"]
        }
    },
    start_state: "q0",
    end_states: ["q1"],
    states: ["q0", "q1"],
    symbols: ["0", "1"]
};

try {
    const dot = generateAutomatonDOT(testData);
    console.log("Generated DOT:");
    console.log(dot);
} catch (err) {
    console.error("Error:", err);
}
