import express from "express";
import cors from "cors";
import morgan from 'morgan';
import automatonRoutes from "./routes/automatonRoutes.js";
import { initDatabase } from "./database/db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Use routes
app.use("/api", automatonRoutes);

// Initialize database before starting server
initDatabase().then(() => {
    app.listen(5000, () => {
        console.log("Server running on port 5000");
        console.log("Database initialized successfully");
    });
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
