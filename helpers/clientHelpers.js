import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";

import Client from "../models/Client.js";
import User from "../models/User.js";
import RegistrationToken from "../models/RegistrationToken.js";

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

const checkEmailForDuplicate = async (email) => {
  try {
    const result = await User.findOne({ email: email });
    return !!result; // Convert the result to a boolean (true if found, false if not found)
  } catch (error) {
    throw error;
  }
};

const runCreateClientTransaction = async (requestBody, tokenID) => {
  try {
    const data = JSON.parse(requestBody);
    const hash = await moduleHelpers.hashData(data.password);

    const user = new User({
      email: data.email.toLowerCase(),
      password: hash,
      role: "client",
    });
    const client = new Client({
      email: data.email.toLowerCase(),
      first_name: data.first_name.toLowerCase(),
      last_name: data.last_name.toLowerCase(),
      number: data.number,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await user.save();
      await client.save();
      await RegistrationToken.findOneAndUpdate(
        { _id: tokenID },
        { key_status: "used" },
        { new: false }
      );

      await session.commitTransaction();
      session.endSession();

      return client;
    } catch (error) {
      console.error("client creation failed");

      await session.abortTransaction();
      session.endSession();

      await RegistrationToken.findOneAndUpdate(
        { _id: tokenID },
        { key_status: "fail" },
        { new: false }
      );

      throw error;
    }
  } catch (error) {
    console.error("password hashing failed");

    await RegistrationToken.findOneAndUpdate(
      { _id: tokenID },
      { key_status: "fail" },
      { new: false }
    );

    throw error;
  }
};

export default {
  validationRulesForClientData,
  handleErrorsForClientData,
  runCreateClientTransaction,
};
