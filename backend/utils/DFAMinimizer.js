import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function minimizeDFA(data) {
    return new Promise((resolve, reject) => {
        const cppExecutable = path.join(__dirname, "..", "..", "cpp", "MinimizeDFA.exe");
        console.log("Executing DFA minimization:", cppExecutable);
        console.log("Input data:", JSON.stringify(data, null, 2));

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
            console.log("C++ stdout:", output);
            console.log("C++ stderr:", errorOutput);

            if (code !== 0) {
                reject(new Error(`C++ process exited with code ${code}. Error: ${errorOutput}`));
                return;
            }

            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (e) {
                reject(new Error("Error parsing C++ output: " + e.message + ". Output was: " + output));
            }
        });

        cppProcess.on("error", (err) => {
            console.error("C++ process error:", err);
            reject(new Error("Failed to start C++ process: " + err.message));
        });
    });
}
