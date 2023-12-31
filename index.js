import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";

import transactionTokenRoute from "./routes/transactionRoute.js";
import userRouter from "./routes/userRoute.js";
import clientRouter from "./routes/clientRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import adminRouter from "./routes/adminRouter.js";
import hostRouter from "./routes/hostRouter.js";
import venueRoute from "./routes/venueRoute.js";
import notificationRouter from "./routes/notificationRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import messagingRouter from "./routes/messagingRouter.js";

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

app.use("/api/token", transactionTokenRoute);
app.use("/api/user", userRouter);
app.use("/api/client", clientRouter);
app.use("/api/host", hostRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/venues", venueRoute);
app.use("/api/notification", notificationRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/messaging", messagingRouter);

app.listen(PORT, () => {
  console.log("Server is now running on port: " + PORT);
});
