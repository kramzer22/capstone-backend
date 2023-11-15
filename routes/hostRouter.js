import express from "express";

import hostController from "../controllers/hostController.js";

import moduleCheckers from "../util/moduleCheckers.js";
import transactionTokenController from "../controllers/transactionTokenController.js";

const hostRouter = express.Router();

hostRouter.post(
  "/register",
  (request, response, next) => {
    const tokenType = "host-invite";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  moduleCheckers.checkUserEmailForDuplicate,
  hostController.registerHost
);

export default hostRouter;
