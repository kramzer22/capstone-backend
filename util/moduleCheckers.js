import validator from "validator";

import AdminKey from "../models/AdminKey.js";
import User from "../models/User.js";
import RegistrationToken from "../models/TransactionToken.js";

import moduleHelpers from "./moduleHelpers.js";
import moment from "moment-timezone";

class CustomError extends Error {
  constructor(message, status, errorResponse) {
    super(message);
    this.status = status;
    this.errorResponse = errorResponse;
  }
}

const isValidEmail = (email) => {
  const cleanedEmail = email.trim().toLowerCase();
  if (!validator.isEmpty(cleanedEmail) && validator.isEmail(cleanedEmail)) {
    return true;
  }

  return false;
};

const checkUserEmailForDuplicate = async (request, response, next) => {
  try {
    const email = request.body.email
      ? request.body.email
      : request.params.email;
    if (!email) {
      throw new CustomError("email is missing", 401, "invalidEmail");
    }
    const result = await User.findOne({ email: email.toLowerCase() });
    if (result) {
      throw new CustomError("email duplicate found", 401, "invalidEmail");
    }

    if (next) {
      next();
    } else {
      return false;
    }
  } catch (error) {
    if (next) {
      if (error instanceof CustomError) {
        console.log(error.message);
        response
          .status(error.status)
          .json({ message: error.message, error: error.errorResponse });
      } else {
        console.log(error);
        response.status(500).json({ message: "Internal server problem" });
      }
    } else {
      console.log(error.message);
      throw error;
    }
  }
};

const isValidAPIkey = async (apiKey) => {
  try {
    if (!apiKey) {
      throw new CustomError("API key missing", 401);
    }

    const result = await AdminKey.findOne({ api_key: apiKey });
    if (!result) {
      throw new CustomError("invalid API key", 401);
    }
    return true;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export default {
  isValidAPIkey,
  isValidEmail,
  checkUserEmailForDuplicate,
  CustomError,
};
