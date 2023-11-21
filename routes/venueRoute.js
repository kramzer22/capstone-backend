import express from "express";

import Venue from "../models/Venue.js";

const venueRoute = express.Router();

venueRoute.get("/", async (_request, response) => {
  try {
    const result = await Venue.find({});
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json(error);
  }
});

export default venueRoute;
