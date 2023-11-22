import express from "express";

import Venue from "../models/Venue.js";

import venueController from "../controllers/venueController.js";
import transactionTokenController from "../controllers/transactionTokenController.js";
import userHelpers from "../helpers/userHelpers.js";
import venueHelpers from "../helpers/venueHelpers.js";

const venueRoute = express.Router();

venueRoute.get("/", async (_request, response) => {
  try {
    const result = await Venue.find({});
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
});

venueRoute.post(
  "/booking/",
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
    userHelpers.isValidUser(request, response, next, "client");
  },
  venueHelpers.checkVenueValidity,
  venueController.createVenueBooking
);

export default venueRoute;
