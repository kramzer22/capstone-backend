import mongoose from "mongoose";

import User from "../models/User.js";
import Host from "../models/Host.js";
import TransactionToken from "../models/TransactionToken.js";

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

export default { registerHost };
