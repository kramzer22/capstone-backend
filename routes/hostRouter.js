import express from "express";

import hostController from "../controllers/hostController.js";

import moduleCheckers from "../util/moduleCheckers.js";

const hostRouter = express.Router();

hostRouter.post(
  "/invite",
  moduleCheckers.checkApiKeyValidity,
  hostController.checkInviteDataValidity,
  hostController.inviteHost
);

hostRouter.get(
  "/check",
  hostController.checkTokenValidity,
  (_request, response) => {
    response.status(200).json({ message: "valid token" });
  }
);

export default hostRouter;
