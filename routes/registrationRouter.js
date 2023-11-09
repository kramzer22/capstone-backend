import express from "express";

import registrationTokenController from "../controllers/registrationTokenController.js";
import clientHelpers from "../helpers/clientHelpers.js";
import inquiryHelpers from "../helpers/inquiryHelpers.js";

const registrationRouter = express.Router();

registrationRouter.post(
  "/register-client",
  clientHelpers.validationRulesForClientData,
  clientHelpers.handleErrorsForClientData,
  (request, response) => {
    registrationTokenController.createTransactionToken(
      request,
      response,
      "hour",
      1,
      "client-registration"
    );
  }
);

registrationRouter.post(
  "/contact-inquiry",
  inquiryHelpers.validationRulesForInquiryData,
  inquiryHelpers.handleErrorsForInquiryData,
  (request, response) => {
    RegistrationTokenController.createTransactionToken(
      request,
      response,
      "hour",
      1,
      "contact-inquiry"
    );
  }
);

export default registrationRouter;
