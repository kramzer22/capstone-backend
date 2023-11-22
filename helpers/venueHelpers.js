import mongoose from "mongoose";

import Venue from "../models/Venue.js";

import moduleCheckers from "../util/moduleCheckers.js";

const checkVenueValidity = async (request, response, next) => {
  const data = request.body;
  const venueId = new mongoose.Types.ObjectId(data.venue_id);
  const packageId = data.package_id;

  try {
    const venue = await Venue.findById({
      _id: venueId,
      "packages.id": packageId,
    });

    if (!venue) {
      throw new moduleCheckers.CustomError(
        "no such venue or package found",
        401,
        "invalidIdError"
      );
    }

    const selectedPackage = venue.packages.find(
      (item) => item.id === packageId
    );

    const bookingData = {
      venue_id: venue.id,
      client_email: request.userData.email,
      host_email: venue.email,
      venue_name: venue.venue_name,
      description: venue.description,
      address: venue.address,
      images: venue.images,
      book_date: data.select_date,
      package: selectedPackage,
    };
    console.log(bookingData);
    request.bookingData = bookingData;
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

export default { checkVenueValidity };
