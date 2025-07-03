import express from "express";
import cors from "cors";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

const app = express();

// Add CORS middleware
app.use(cors());
app.use(express.json());

app.post("/api/check-fa-type", (req, res) => {
    console.log("Received request:", req.body); // Log incoming request

    const data = req.body;
    const inputFile = path.join("cpp", "input.json");

    try {
        // Write input data to file
        fs.writeFileSync(inputFile, JSON.stringify(data));

        // Execute C++ program
        execFile("./cpp/DFAorNFA.exe", [inputFile], (error, stdout, stderr) => {
            if (error) {
                console.error("Execution error:", error);
                return res.status(500).json({ 
                    success: false, 
                    error: "Error running C++ program" 
                });
            }

            if (stderr) {
                console.error("C++ stderr:", stderr);
            }

            console.log("C++ stdout:", stdout);

            try {
                const result = JSON.parse(stdout);
                res.json(result);
            } catch (parseError) {
                console.error("Parse error:", parseError);
                res.status(500).json({ 
                    success: false, 
                    error: "Error parsing C++ output" 
                });
            }
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});