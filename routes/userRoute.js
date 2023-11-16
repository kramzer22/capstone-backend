import express from "express";

import userController from "../controllers/userController.js";
import transactionTokenController from "../controllers/transactionTokenController.js";

import moduleCheckers from "../util/moduleCheckers.js";

const userRouter = express.Router();

userRouter.get(
  "/check/:email",
  moduleCheckers.checkUserEmailForDuplicate,
  (_request, response) => {
    response.status(200).end();
  }
);

userRouter.post(
  "/login",
  userController.checkLoginCredentials,
  (request, response) => {
    request.params.type = "user-login";
    transactionTokenController.registerTransactionToken(request, response);
  }
);

userRouter.get(
  "/token/user-cookie",
  (request, response, next) => {
    const tokenType = "user-login";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  userController.checkUserToken
);

export default userRouter;
