import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import leadRoutes from "./routes/leadRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(" DB error:", err));

app.use("/api/leads", leadRoutes);

app.get("/", (req, res) => res.send("Urban Cruise LMS Backend Running"));
app.listen(process.env.PORT || 5000, () => console.log("Server started"));
