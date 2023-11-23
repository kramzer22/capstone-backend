import mongoose from "mongoose";

import Booking from "../models/Booking.js";

import moduleCheckers from "../util/moduleCheckers.js";

const checkBookingValidity = async (request, response, next) => {
  const bookingId = new mongoose.Types.ObjectId(request.params.book_id);

  try {
    const booking = await Booking.findById({ _id: bookingId });

    if (!booking) {
      throw new moduleCheckers.CustomError(
        "no such booking found",
        401,
        "invalidIdError"
      );
    }

    request.bookingData = booking;
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof moduleCheckers.CustomError) {
      response.status(error.status).json({ message: error.message });
    } else {
      response.status(500).json("internal server problem");
    }
  }
};

export default { checkBookingValidity };
