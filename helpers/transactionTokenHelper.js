import mongoose from "mongoose";
import moment from "moment-timezone";

import TransactionToken from "../models/TransactionToken.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const TOKEN_TYPES = ["host-invite", "client-registration", "user-login"];

const createHostInviteToken = async (apiKey, data, tokenType) => {
  try {
    await moduleCheckers.isValidAPIkey(apiKey);

    const email = data.email;
    if (moduleCheckers.isValidEmail(email)) {
      const entryDate = await moduleHelpers.getToday(30, "day");
      const encryptToken = moduleHelpers.encryptData({
        email: email.toLowerCase(),
        entry_date: entryDate.entry_date,
      });

      const transactionToken = new TransactionToken({
        token: encryptToken.token,
        iv: encryptToken.iv,
        transaction_type: tokenType,
        entry_date: entryDate.entry_date,
        expiry_date: entryDate.expiry_date,
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await transactionToken.save();

        const subject = "Invitation request from Easygigph";
        const message = `We hope this message finds you well. We are excited to extend an invitation to you to join our platform and become a valued member of our community.\nClick the link below to start\n\nhttps://kramzer22.github.io/capstone-event-booking-app/#//register/?user=host&token=${transactionToken.token}`;
        await moduleHelpers.sendMailToUser(email, subject, message);

        await session.commitTransaction();
        session.endSession();

        return email;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw Error;
      }
    } else {
      throw new moduleCheckers.CustomError("email is invalid/missing", 400);
    }
  } catch (error) {
    throw error;
  }
};

const createClientRegistrationToken = async (data, n, d, tokenType) => {
  try {
    const email = data.email;
    if (moduleCheckers.isValidEmail(email)) {
      const entryDate = await moduleHelpers.getToday(n, d);
      const encryptToken = moduleHelpers.encryptData(data);

      const transactionToken = new TransactionToken({
        token: encryptToken.token,
        iv: encryptToken.iv,
        transaction_type: tokenType,
        entry_date: entryDate.entry_date,
        expiry_date: entryDate.expiry_date,
      });

      await transactionToken.save();

      return transactionToken.token;
    } else {
      throw new moduleCheckers.CustomError("email is invalid/missing", 400);
    }
  } catch (error) {
    throw error;
  }
};

const createGenericToken = async (data, n, d, tokenType) => {
  try {
    const entryDate = await moduleHelpers.getToday(n, d);
    const encryptToken = moduleHelpers.encryptData(data);

    const transactionToken = new TransactionToken({
      token: encryptToken.token,
      iv: encryptToken.iv,
      transaction_type: tokenType,
      entry_date: entryDate.entry_date,
      expiry_date: entryDate.expiry_date,
    });

    await transactionToken.save();

    return transactionToken.token;
  } catch (error) {
    throw error;
  }
};

const isTokenValid = async (token, tokenType) => {
  try {
    if (token) {
      const currentDate = (await moduleHelpers.getToday(1, "hours")).entry_date;
      try {
        const tokenResult = await TransactionToken.findOne({
          token: token,
          key_status: "available",
        });
        if (tokenResult && tokenResult.transaction_type === tokenType) {
          const expiryDate = moment(tokenResult.expiry_date);
          if (expiryDate.isBefore(currentDate)) {
            throw new moduleCheckers.CustomError("token is expired", 401);
          } else {
            return tokenResult;
          }
        } else {
          throw new moduleCheckers.CustomError("token is invalid", 401);
        }
      } catch (error) {
        throw error;
      }
    } else {
      throw new moduleCheckers.CustomError("token is missing", 400);
    }
  } catch (error) {
    throw error;
  }
};

export default {
  TOKEN_TYPES,
  createHostInviteToken,
  createClientRegistrationToken,
  createGenericToken,
  isTokenValid,
};
