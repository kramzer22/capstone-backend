import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ntpClient from "ntp-client";
import moment from "moment-timezone";

import User from "./models/User.js";
import Token from "./models/Key.js";
import clientRouter from "./routes/clientRouter.js";

dotenv.config();

const app = express();

const mongoDBPath = process.env.ENV_MONGO_DB_PATH;
const dataTable = process.env.ENV_DB_NAME;
const secretKey = process.env.ENV_SECRET_KEY;
const url = mongoDBPath
  .replace("[SECRET_KEY]", secretKey)
  .replace("[DB]", dataTable);

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect(url);

// This is to create an admin token

// const getToday = () => {
//   return new Promise((resolve, reject) => {
//     ntpClient.getNetworkTime("pool.ntp.org", 123, (error, date) => {
//       if (error) {
//         console.log(error);
//         reject(error);
//       } else {
//         resolve(date);
//       }
//     });
//   });
// };

// app.post("/api/token/", (_request, response) => {
//   getToday()
//     .then((date) => {
//       const dateToday = moment(date).tz("Asia/Singapore");
//       const expirationDate = dateToday.clone().add(3, "years");

//       const key = new Token({
//         user_aceess: true,
//         user_create: false,
//         entry_date: dateToday,
//         expiry_date: expirationDate,
//       });

//       key
//         .save()
//         .then((result) => {
//           response.status(201).json({
//             message: "Client successfully added",
//             result,
//           });
//         })
//         .catch((error) => {
//           console.log(error);
//           response
//             .status(400)
//             .json({ message: "Failed to process transaction", error });
//         });
//     })
//     .catch((error) => {
//       console.log(error);
//       response.status(500).json({ message: "Error getting date", error });
//     });
// });

const PORT = 3001;

app.use("/api/client", clientRouter);

app.listen(PORT, () => {
  console.log("Server is now running on port: " + PORT);
});
