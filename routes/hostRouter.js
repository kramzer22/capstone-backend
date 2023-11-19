import express from "express";

import upload from "../util/multer.js";
import hostController from "../controllers/hostController.js";

import userHelpers from "../helpers/userHelpers.js";

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

hostRouter.get(
  "/venue",
  (request, response, next) => {
    const tokenType = "user-login";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  (request, response, next) => {
    userHelpers.isValidUser(request, response, next, "host");
  },
  hostController.getVenue
);

hostRouter.post(
  "/venue",
  (request, response, next) => {
    const tokenType = "user-login";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  (request, response, next) => {
    userHelpers.isValidUser(request, response, next, "host");
  },
  hostController.registerVenue
);

hostRouter.patch(
  "/venue/images",
  (request, response, next) => {
    const tokenType = "user-login";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  (request, response, next) => {
    userHelpers.isValidUser(request, response, next, "host");
  },
  upload.single("image"),
  hostController.uploadVenueImage
);

export default hostRouter;
