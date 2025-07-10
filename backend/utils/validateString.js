import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function validateString(data) {
    return new Promise((resolve, reject) => {
        const cppExecutable = path.join(__dirname, "..", "..", "cpp", "StringValidator.exe");
        const cppProcess = spawn(cppExecutable);

        cppProcess.stdin.write(JSON.stringify(data));
        cppProcess.stdin.end();

        let output = "";

        cppProcess.stdout.on("data", (chunk) => {
            output += chunk.toString();
        });

        cppProcess.stderr.on("data", (err) => {
            console.error("C++ stderr:", err.toString());
        });

        cppProcess.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`C++ process exited with code ${code}`));
                return;
            }

            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (e) {
                reject(new Error("Error parsing C++ output: " + e.message));
            }
        });
    });
}
