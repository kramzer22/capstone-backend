import express from "express";

import transactionTokenController from "../controllers/transactionTokenController.js";
import clientHelpers from "../helpers/clientHelpers.js";
import inquiryHelpers from "../helpers/inquiryHelpers.js";

const transactionTokenRoute = express.Router();

transactionTokenRoute.post(
  "/register/:type",
  transactionTokenController.registerTransactionToken
);

transactionTokenRoute.get(
  "/:type",
  transactionTokenController.checkTransactionToken,
  (_request, response) => {
    response.status(200).json({ message: "token is valid" });
  }
);


transactionTokenRoute.post(
  "/contact-inquiry",
  inquiryHelpers.validationRulesForInquiryData,
  inquiryHelpers.handleErrorsForInquiryData,
  (request, response) => {
    transactionTokenController.createTransactionToken(
      request,
      response,
      "hour",
      1,
      "contact-inquiry"
    );
  }
);

export default transactionTokenRoute;
