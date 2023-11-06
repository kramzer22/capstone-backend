import mongoose from "mongoose";
import bcrypt from "bcrypt";

import Client from "../models/Client.js";
import User from "../models/User.js";

const hashPassword = (password) => {
  const saltRounds = 10;
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (error, hash) => {
      if (error) {
        reject(error);
      } else {
        resolve(hash);
      }
    });
  });
};

const runCreateClientTransaction = async (requestBody) => {
  try {
    const hash = await hashPassword(requestBody.password);

    const user = new User({
      email: requestBody.email,
      password: hash,
      type: "client",
    });
    const client = new Client({
      email: requestBody.email,
      first_name: requestBody.first_name,
      last_name: requestBody.last_name,
      number: requestBody.number,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await user.save();
      await client.save();

      await session.commitTransaction();
      session.endSession();

      return user; // or return any other value you need
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return error;
    }
  } catch (error) {
    return error;
  }
};

export default {
  runCreateClientTransaction,
};
