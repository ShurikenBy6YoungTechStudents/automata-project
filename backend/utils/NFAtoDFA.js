import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function convertNFAtoDFA(data) {
    return new Promise((resolve, reject) => {
        const cppExecutable = path.join(__dirname, "..", "..", "cpp", "NFAtoDFA.exe");
        console.log("Executing NFA to DFA conversion:", cppExecutable);
        console.log("Input data:", JSON.stringify(data, null, 2));

        // Check if there are actually epsilon transitions in the NFA
        let hasEpsilonTransitions = false;
        if (data.transitions) {
            for (const state in data.transitions) {
                const stateTransitions = data.transitions[state];
                if (stateTransitions['ɛ'] && Array.isArray(stateTransitions['ɛ']) && stateTransitions['ɛ'].length > 0) {
                    hasEpsilonTransitions = true;
                    break;
                }
                if (stateTransitions['ε'] && Array.isArray(stateTransitions['ε']) && stateTransitions['ε'].length > 0) {
                    hasEpsilonTransitions = true;
                    break;
                }
            }
        }

        const cppProcess = spawn(cppExecutable);

        cppProcess.stdin.write(JSON.stringify(data));
        cppProcess.stdin.end();

        let output = "";
        let errorOutput = "";

        cppProcess.stdout.on("data", (chunk) => {
            output += chunk.toString();
        });

        cppProcess.stderr.on("data", (err) => {
            errorOutput += err.toString();
            console.error("C++ stderr:", err.toString());
        });

        cppProcess.on("close", (code) => {
            console.log("C++ process exited with code:", code);
            console.log("C++ output:", output);

            if (code !== 0) {
                console.error("C++ process failed with code:", code);
                console.error("Error output:", errorOutput);
                reject(new Error(`NFA to DFA conversion failed: ${errorOutput || 'Unknown error'}`));
                return;
            }

            try {
                const result = JSON.parse(output);
                console.log("Parsed result:", result);

                // Fix the epsilon_transitions_removed flag
                if (result.success && result.conversion_info) {
                    result.conversion_info.epsilon_transitions_removed = hasEpsilonTransitions;
                }

                resolve(result);
            } catch (parseError) {
                console.error("Failed to parse C++ output:", parseError);
                console.error("Raw output:", output);
                reject(new Error(`Failed to parse conversion result: ${parseError.message}`));
            }
        });

        cppProcess.on("error", (err) => {
            console.error("Failed to start C++ process:", err);
            reject(new Error(`Failed to start NFA to DFA conversion: ${err.message}`));
        });
    });
}
