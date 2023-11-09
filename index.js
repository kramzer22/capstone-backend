import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import registrationRouter from "./routes/registrationRouter.js";
import clientRouter from "./routes/clientRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";

dotenv.config();

const app = express();

const mongoDBPath = process.env.ENV_MONGO_DB_PATH;

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect(mongoDBPath);

const PORT = 3001;

app.use("/api/token", registrationRouter);
app.use("/api/client", clientRouter);
app.use("/api/inquiry", inquiryRouter);

app.listen(PORT, () => {
  console.log("Server is now running on port: " + PORT);
});
