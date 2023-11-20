import mongoose from "mongoose";

import User from "../models/User.js";
import Host from "../models/Host.js";
import Venue from "../models/Venue.js";
import TransactionToken from "../models/TransactionToken.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const registerHost = async (registrationToken, data) => {
  try {
    const months = moduleHelpers.monthAbbreviations;
    const registrationDate = (await moduleHelpers.getToday(1, "hour"))
      .entry_date;
    const encryptedPassword = await moduleHelpers.hashData(data.password);
    const user = new User({
      email: data.email,
      password: encryptedPassword,
      role: "host",
      entry_date: registrationDate,
    });

    const host = new Host({
      email: data.email,
      name: {
        first_name: data.name.first_name,
        last_name: data.name.last_name,
      },
      dob: new Date(data.dob.year, months[data.dob.month], data.dob.day),
      gender: data.gender,
      business_name: data.business_name,
      address: {
        province: data.address.province.name,
        city: data.address.city.name,
        barangay: data.address.barangay.name,
        street: data.address.street,
      },
      number: {
        mobile: data.number.mobile,
        landline: data.number.landline,
      },
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await user.save();
      await host.save();
      await TransactionToken.findOneAndUpdate(
        { token: registrationToken },
        { key_status: "used" },
        { new: false }
      );

      await session.commitTransaction();
      session.endSession();

      console.log("host user registered successfully");

      const emailData = {
        email: data.email,
        role: "host",
        entry_date: registrationDate,
      };
      try {
        await moduleHelpers.sendEmailVerification(emailData);
      } catch (error) {
      } finally {
        return host;
      }
    } catch (error) {
      console.log("fail to save host data");

      await session.abortTransaction();
      session.endSession();

      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const checkVenueAndEmailValidity = async (request, response, next) => {
  const venueId = new mongoose.Types.ObjectId(request.params.id);

  try {
    const venue = await Venue.findById({ _id: venueId });

    if (!venue) {
      throw new moduleCheckers.CustomError(
        "id is invalid or malformed",
        401,
        "invalidIdError"
      );
    }

    if (venue.email !== request.userData.email) {
      throw new moduleCheckers.CustomError(
        "request denied invalid host token",
        401,
        "invalidIdError"
      );
    }

    request.venueData = venue;
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

export default { registerHost, checkVenueAndEmailValidity };
