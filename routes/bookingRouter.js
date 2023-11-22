import express from "express";

import Booking from "../models/Booking.js";

import bookingController from "../controllers/bookingController.js";
import transactionTokenController from "../controllers/transactionTokenController.js";

import bookingHelpers from "../helpers/bookingHelpers.js";
import userHelpers from "../helpers/userHelpers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const bookingRouter = express.Router();

bookingRouter.get(
  "/:role",
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
    const role = request.params.role;
    userHelpers.isValidUser(request, response, next, role);
  },
  async (request, response) => {
    try {
      const bookings = await Booking.find({
        host_email: request.userData.email,
      }).sort({ entry_date: -1 });

      response.status(200).json(bookings);
    } catch (error) {
      response.status(500).json("internal server problem");
    }
  }
);

bookingRouter.patch(
  "/:role/:book_id/:instruction",
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
    const role = request.params.role;
    userHelpers.isValidUser(request, response, next, role);
  },
  bookingHelpers.checkBookingValidity,
  (request, response) => {
    const transaction = request.params.instruction;
    if (transaction === "decline") {
      bookingController.declineBooking(request, response);
    } else if (transaction === "accept") {
      bookingController.acceptBooking(request, response);
    } else {
      response.status(401).json({ message: "unauthorized transaction" });
    }
  }
);

export default bookingRouter;
