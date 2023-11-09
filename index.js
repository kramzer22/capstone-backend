import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import clientRouter from "./routes/clientRouter.js";
import registrationRouter from "./routes/registrationRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";

dotenv.config();

const app = express();

const mongoDBPath = process.env.ENV_MONGO_DB_PATH;
const dataTable = process.env.ENV_DB_NAME;
const secretKey = process.env.ENV_MONGO_SECRET_KEY;
const url = mongoDBPath
  .replace("[SECRET_KEY]", secretKey)
  .replace("[DB]", dataTable);

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect(url);

const PORT = 3001;

app.use("/api/token", registrationRouter);
app.use("/api/client", clientRouter);
app.use("/api/inquiry", inquiryRouter);

app.listen(PORT, () => {
  console.log("Server is now running on port: " + PORT);
});
