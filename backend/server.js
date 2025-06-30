import express from "express";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

app.post("/api/generate-dot", (req, res) => {
    const data = req.body;

    const inputFile = path.join("cpp", "automaton_input.json");
    fs.writeFileSync(inputFile, JSON.stringify(data));

    execFile("./cpp/automaton_test.exe", [inputFile], (error, stdout, stderr) => {
        if (error) {
            console.error("Exec error:", error);
            return res.status(500).send("Error running C++ code");
        }
        res.json({ dot: stdout });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
