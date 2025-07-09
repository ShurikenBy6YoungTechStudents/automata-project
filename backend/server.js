import express from "express";
import cors from "cors";
import automatonRoutes from "./routes/automatonRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Use routes
app.use("/api", automatonRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
