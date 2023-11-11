import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";

import registrationRouter from "./routes/registrationRouter.js";
import clientRouter from "./routes/clientRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import adminRouter from "./routes/adminRouter.js";
import hostRouter from "./routes/hostRouter.js";

dotenv.config();

const app = express();

const mongoDBPath = process.env.ENV_MONGO_DB_PATH;

morgan.token("req-body", (req) => JSON.stringify(req.body));

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body\n"
  )
);

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect(mongoDBPath);

const PORT = 3001;

app.use("/api/token", registrationRouter);
app.use("/api/client", clientRouter);
app.use("/api/host", hostRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log("Server is now running on port: " + PORT);
});
