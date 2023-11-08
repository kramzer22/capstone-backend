import express from "express";

import clientController from "../controllers/clientController.js";

const clientRouter = express.Router();

clientRouter.get("/");

clientRouter.post("/register-client", clientController.createUserClient);

export default clientRouter;
