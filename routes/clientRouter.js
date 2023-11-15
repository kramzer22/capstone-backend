import express from "express";

import transactionTokenController from "../controllers/transactionTokenController.js";
import clientController from "../controllers/clientController.js";

const clientRouter = express.Router();

clientRouter.post(
  "/register",
  (request, response, next) => {
    const tokenType = "client-registration";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  clientController.registerClient
);

export default clientRouter;
