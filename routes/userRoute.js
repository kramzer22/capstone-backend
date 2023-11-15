import express from "express";

import moduleCheckers from "../util/moduleCheckers.js";

const userRouter = express.Router();

userRouter.get(
  "/check/:email",
  moduleCheckers.checkUserEmailForDuplicate,
  (_request, response) => {
    response.status(200).end();
  }
);

export default userRouter;
