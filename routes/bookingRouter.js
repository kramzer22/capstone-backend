import express from "express";

import Booking from "../models/Booking.js";

import bookingController from "../controllers/bookingController.js";
import transactionTokenController from "../controllers/transactionTokenController.js";

import bookingHelpers from "../helpers/bookingHelpers.js";
import userHelpers from "../helpers/userHelpers.js";
import moduleCheckers from "../util/moduleCheckers.js";
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
    const role = request.params.role;
    try {
      if (role === "host") {
        const bookings = await Booking.find({
          host_email: request.userData.email,
        }).sort({ entry_date: -1 });

        response.status(200).json(bookings);
      } else if (role === "client") {
        const bookings = await Booking.find({
          client_email: request.userData.email,
        }).sort({ entry_date: -1 });
        response.status(200).json(bookings);
      } else {
        throw new moduleCheckers.CustomError(
          "unauthorized access",
          401,
          "invalidAccess"
        );
      }
    } catch (error) {
      if (error.status === 401) {
        response.status(error.status).json({ message: error.message });
      }
      response.status(500).json({ message: "internal server problem" });
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
    const role = request.params.role;
    const transaction = request.params.instruction;
    if (transaction === "decline" && role === "host") {
      bookingController.declineBooking(request, response);
    } else if (transaction === "accept" && role === "host") {
      bookingController.acceptBooking(request, response);
    } else if (transaction === "payment" && role === "client") {
      bookingController.payBooking(request, response);
    } else {
      response.status(401).json({ message: "unauthorized transaction" });
    }
  }
);

export default bookingRouter;
