import express from "express";

import RegistrationTokenController from "../controllers/RegistrationTokenController.js";
import clientHelpers from "../helpers/clientHelpers.js";

const registrationRouter = express.Router();

registrationRouter.post(
  "/register-client",
  clientHelpers.validationRulesForClientData,
  clientHelpers.handleErrorsForClientData,
  RegistrationTokenController.createRegistrationToken
);

export default registrationRouter;
