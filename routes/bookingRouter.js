import express from "express";

import Booking from "../models/Booking.js";

import transactionTokenController from "../controllers/transactionTokenController.js";

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
      // const todayDate = (await moduleHelpers.getToday(3, "hours")).entry_date;
      const bookings = await Booking.find({
        host_email: request.userData.email,
      });

      // const responseNotification = notifications.map((notification) => {
      //   const elapseDate = moduleHelpers.getDateDifference(
      //     notification.entry_date,
      //     todayDate
      //   );

      //   return { notification, elapse_time: bookings };
      // });

      response.status(200).json(bookings);
    } catch (error) {
      response.status(500).json("internal server problem");
    }
  }
);

export default bookingRouter;
