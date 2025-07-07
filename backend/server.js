import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/check-fa-type", (req, res) => {
    console.log("Received request:", req.body);

    const cppExecutable = path.join(__dirname, "..", "cpp", "DFAorNFA.exe");
    const cppProcess = spawn(cppExecutable);

    cppProcess.stdin.write(JSON.stringify(req.body));
    cppProcess.stdin.end();

    let output = "";
    cppProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    cppProcess.stderr.on("data", (data) => {
        console.error("C++ stderr:", data.toString());
    });

    cppProcess.on("close", (code) => {
        console.log("C++ exited with code:", code);

        try {
            const result = JSON.parse(output);
            res.json(result);
        } catch (err) {
            console.error("Parse error:", err);
            res.status(500).json({ success: false, error: "Error parsing C++ output" });
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});