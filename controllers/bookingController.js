import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";

const declineBooking = async (request, response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingData = request.bookingData;
    const notificationClient = new Notification({
      email: bookingData.client_email,
      notification_type: "booking_declined",
      title: "Booking request declined",
      message: `Host: ${bookingData.host_email}
        Venue: ${bookingData.venue_name}
        Package selected: ${bookingData.package.name}
        Price: ₱${bookingData.package.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
        Date booked: ${bookingData.book_date}`,
      entry_date: bookingData.entry_date,
    });

    await notificationClient.save();

    const bookingResult = await Booking.findByIdAndUpdate(
      { _id: bookingData.id },
      { $set: { booking_status: "declined" } },
      { new: true }
    );

    await session.commitTransaction();
    session.endSession();

    console.log(bookingResult);
    response.status(200).json(bookingResult);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    response.status(500).json("Internal server problem");
  }
};

const acceptBooking = async (request, response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingData = request.bookingData;
    const notificationClient = new Notification({
      email: bookingData.client_email,
      notification_type: "booking_accepted",
      title: "Booking request accepted",
      message: `Host: ${bookingData.host_email}
        Venue: ${bookingData.venue_name}
        Package selected: ${bookingData.package.name}
        Price: ₱${bookingData.package.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
        Date booked: ${bookingData.book_date}`,
      entry_date: bookingData.entry_date,
    });

    await notificationClient.save();

    const bookingResult = await Booking.findByIdAndUpdate(
      { _id: bookingData.id },
      { $set: { booking_status: "payment" } },
      { new: true }
    );

    await session.commitTransaction();
    session.endSession();

    console.log(bookingResult);
    response.status(200).json(bookingResult);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    response.status(500).json("Internal server problem");
  }
};

export default { declineBooking, acceptBooking };
