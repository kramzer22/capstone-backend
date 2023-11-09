import mongoose from "mongoose";
import { body, validationResult } from "express-validator";

import RegistrationToken from "../models/RegistrationToken.js";
import Inquiry from "../models/Inquiry.js";

import moduleHelper from "../util/moduleHelpers.js";

const validationRulesForInquiryData = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("first_name").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, " ").trim();

      if (cleanedValue.length < 1) {
        reject("First name should not be empty.");
      } else if (/[^a-zA-Z\s-']/.test(cleanedValue)) {
        reject(
          "First name should only contain alphabets, spaces, hyphens, and apostrophes."
        );
      } else {
        resolve();
      }
    });
  }),
  body("last_name").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, " ").trim();

      if (cleanedValue.length < 1) {
        reject("Last name should not be empty.");
      } else if (/[^a-zA-Z\s-']/.test(cleanedValue)) {
        reject(
          "Last name should only contain alphabets, spaces, hyphens, and apostrophes."
        );
      } else {
        resolve();
      }
    });
  }),
  body("number").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, "").trim();
      const mobileNumberPattern = /^\d{11}$/;

      if (!mobileNumberPattern.test(cleanedValue)) {
        reject("Invalid mobile number format");
      }

      resolve();
    });
  }),
  body("note").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, " ").trim();

      if (cleanedValue.length < 20) {
        reject("Last name should not be empty.");
      } else {
        resolve();
      }
    });
  }),
];

const handleErrorsForInquiryData = async (request, response, next) => {
  const validationErrors = validationResult(request);

  if (!validationErrors.isEmpty()) {
    console.log(validationErrors.array());
    return response.status(400).json({ errors: validationErrors.array() });
  } else if (!request.body.email) {
    return response.status(400).json({ error: "email is missing" });
  }

  // try {
  //   const isDuplicate = await checkEmailForDuplicate(request.body.email);
  //   console.log(isDuplicate);
  //   if (isDuplicate) {
  //     return response.status(403).json({ error: "email duplicate found" });
  //   }
  //   next();
  // } catch (error) {
  //   console.log(error);
  //   return response.status(500).json({ error: "Internal server error" });
  // }
  next();
};

const runCreateInquiryTransaction = async (requestBody, tokenID) => {
  try {
    const data = JSON.parse(requestBody);

    const dates = await moduleHelper.getToday(1, "hour");
    const entryDate = dates.entry_date;

    const inquiry = new Inquiry({
      email: data.email.toLowerCase(),
      first_name: data.first_name.toLowerCase(),
      last_name: data.last_name.toLowerCase(),
      number: data.number,
      note: data.note,
      entry_date: entryDate,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await inquiry.save();
      await RegistrationToken.findOneAndUpdate(
        { _id: tokenID },
        { key_status: "used" },
        { new: false }
      );

      await session.commitTransaction();
      session.endSession();

      return inquiry;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();

      return error;
    }
  } catch (error) {
    try {
      await RegistrationToken.findOneAndDelete({ _id: tokenID });
    } catch {
      console.error("Error deleting token:", deleteError);
    }

    return error;
  }
};

export default {
  validationRulesForInquiryData,
  handleErrorsForInquiryData,
  runCreateInquiryTransaction,
};
