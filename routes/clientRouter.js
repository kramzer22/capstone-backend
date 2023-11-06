import express from "express";
import User from "../models/User.js";

import clientController from "../controllers/clientController.js";

const clientRouter = express.Router();

clientRouter.get("/", clientController.getAllClient);

clientRouter.post(
  "/",
  clientController.validateClientData,
  clientController.createUserClient
);

export default clientRouter;
