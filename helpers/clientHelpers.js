import mongoose from "mongoose";
import { body, validationResult } from "express-validator";

import Client from "../models/Client.js";
import User from "../models/User.js";
import TransactionToken from "../models/TransactionToken.js";

import moduleHelpers from "../util/moduleHelpers.js";

// This code validates the information entered before proceeding

const validationRulesForClientData = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
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
      const mobileNumberPattern = /^\d{11}$/; // Example pattern for a 10-digit mobile number

      if (!mobileNumberPattern.test(cleanedValue)) {
        reject("Invalid mobile number format");
      }

      resolve();
    });
  }),
];

const handleErrorsForClientData = async (request, response, next) => {
  const validationErrors = validationResult(request);

  if (!validationErrors.isEmpty()) {
    console.log(validationErrors.array());
    return response.status(400).json({ errors: validationErrors.array() });
  } else if (!request.body.email) {
    return response.status(400).json({ error: "email is missing" });
  }

  try {
    if (await checkEmailForDuplicate(request.body.email)) {
      return response.status(403).json({ error: "email duplicate found" });
    }

    next();
  } catch (error) {
    console.log("input data error");
    return response.status(500).json({ message: "Internal server error" });
  }
};

const registerClient = async (registrationToken) => {
  try {
    const data = JSON.parse(
      moduleHelpers.decryptData(registrationToken.token, registrationToken.iv)
    );
    const registrationDate = (await moduleHelpers.getToday(1, "hour"))
      .entry_date;
    const encryptedPassword = await moduleHelpers.hashData(data.password);
    const user = new User({
      email: data.email,
      password: encryptedPassword,
      role: "client",
      entry_date: registrationDate,
    });

    const client = new Client({
      email: data.email,
      name: {
        first_name: data.name.first_name,
        last_name: data.name.last_name,
      },
      number: data.number,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await user.save();
      await client.save();
      await TransactionToken.findOneAndUpdate(
        { token: registrationToken.token },
        { key_status: "used" },
        { new: false }
      );

      await session.commitTransaction();
      session.endSession();

      console.log("client user registered successfully");

      const emailData = {
        email: data.email,
        role: "client",
        entry_date: registrationDate,
      };
      try {
        await moduleHelpers.sendEmailVerification(emailData);
      } catch (error) {
      } finally {
        return client;
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

export default {
  validationRulesForClientData,
  handleErrorsForClientData,
  registerClient,
};
