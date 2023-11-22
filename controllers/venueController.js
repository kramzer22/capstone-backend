import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";

import moduleHelpers from "../util/moduleHelpers.js";

const createVenueBooking = async (request, response) => {
  const bookingData = request.bookingData;

  console.log(bookingData);

  try {
    const dates = await moduleHelpers.getToday(3, "hours");

    const notificationHost = new Notification({
      email: bookingData.host_email,
      notification_type: "booking_request",
      title: "Booking request",
      message: `User: ${bookingData.client_email}
        Venue: ${bookingData.venue_name}
        Package selected: ${bookingData.package.name}
        Price: ₱${bookingData.package.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
        Date booked: ${bookingData.book_date}`,
      entry_date: dates.entry_date,
    });

    const notificationClient = new Notification({
      email: bookingData.client_email,
      notification_type: "booking_request",
      title: "Booking request",
      message: `Host: ${bookingData.host_email}
        Venue: ${bookingData.venue_name}
        Package selected: ${bookingData.package.name}
        Price: ₱${bookingData.package.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
        Date booked: ${bookingData.book_date}`,
      entry_date: dates.entry_date,
    });

    const booking = new Booking({
      client_email: bookingData.client_email,
      host_email: bookingData.host_email,
      entry_date: dates.entry_date,
      book_date: bookingData.book_date,
      venue_id: bookingData.venue_id,
      venue_name: bookingData.venue_name,
      description: bookingData.description,
      address: bookingData.address,
      images: bookingData.images,
      package: bookingData.package,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    await notificationHost.save();
    await notificationClient.save();
    await booking.save();

    response.status(201).json(booking);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    response.status(500).json("internal server problem");
  }
};

export default { createVenueBooking };
