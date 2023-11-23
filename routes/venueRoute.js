import express from "express";
import mongoose from "mongoose";

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

venueRoute.get("/:venue_id", async (request, response) => {
  try {
    console.log(request.params.venue_id);
    const venueId = new mongoose.Types.ObjectId(request.params.venue_id);
    const result = await Venue.findById({ _id: venueId });
    console.log(result);
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
