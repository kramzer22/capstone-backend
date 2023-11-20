import fetch from "node-fetch";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

import moduleCheckers from "./moduleCheckers.js";
import RegistrationToken from "../models/TransactionToken.js";

const monthAbbreviations = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const generateUniqueID = async () => {
  try {
    const dateString = await getToday().toString(36).entry_date;
    const randomness = Math.random().toString(36).substr(2);
    const buffer = Buffer.from(dateString + randomness, "utf-8");
    return buffer.toString("hex");
  } catch (error) {
    throw error;
  }
};

const getToday = async (n, d) => {
  try {
    const response = await fetch(
      "http://worldtimeapi.org/api/timezone/America/New_York"
    );

    if (!response.ok) {
      throw new Error("fail to fetch current date");
    }

    const data = await response.json();
    const entryDate = moment(data.datetime).tz("Asia/Singapore");
    const expiryDate = entryDate.clone().add(n, d);

    return { entry_date: entryDate, expiry_date: expiryDate };
  } catch (error) {
    throw error;
  }
};

const encryptData = (data) => {
  const secretKey = process.env.ENV_SECRET_KEY;
  const iv = crypto.randomBytes(16);
  const ivHex = iv.toString("hex");
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    iv
  );
  let encryptData = cipher.update(JSON.stringify(data), "utf8", "hex");
  encryptData += cipher.final("hex");

  return { token: encryptData, iv: ivHex };
};

const decryptData = (encryptData, iv) => {
  const secretKey = process.env.ENV_SECRET_KEY;
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    Buffer.from(iv, "hex")
  );
  let decryptJSON = decipher.update(
    Buffer.from(encryptData, "hex"),
    "hex",
    "utf8"
  );
  decryptJSON += decipher.final("utf8");

  return decryptJSON;
};

const hashData = async (data) => {
  const saltRounds = 10;
  try {
    return await bcrypt.hash(data, saltRounds);
  } catch (error) {
    throw error;
  }
};

const compareHashData = async (plainData, hashedData) => {
  try {
    return await bcrypt.compare(plainData, hashedData);
  } catch (error) {
    throw error;
  }
};

const checkTokenValidity = async (tokenID, transactionType) => {
  try {
    const tokenResult = await RegistrationToken.findOne({
      token: tokenID,
      key_status: "available",
      transaction_type: transactionType,
    });

    if (!tokenResult) {
      throw new Error("invalidTokenError");
    }

    return tokenResult;
  } catch (error) {
    throw new Error(error);
  }
};

const sendMailToUser = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ENV_MAILER,
        pass: process.env.ENV_MAILER_PASSWORD,
      },
    });

    const mail = {
      from: process.env.ENV_MAILER,
      to: email,
      subject: subject,
      text: message,
    };

    const result = await transporter.sendMail(mail);
    return result;
  } catch (error) {
    throw error;
  }
};

const sendEmailVerification = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  console.log(data);
  try {
    const dates = await getToday(30, "days");
    console.log(dates);
    const encryptResult = encryptData(data);
    const registrationToken = new RegistrationToken({
      token: encryptResult.token,
      iv: encryptResult.iv,
      transaction_type: "email-verify",
      entry_date: dates.entry_date,
      expiry_date: dates.expiry_date,
    });

    await registrationToken.save();

    try {
      const subject = "Email verification from Easygigph";
      const message = `We hope this message finds you well. Congratulations on successfully registering to Easygigph.\n\nPlease verify your email by clicking the link below \n\nhttp://localhost:5173/register/verify/?token_id=${encryptResult.token}`;
      await sendMailToUser(data.email, subject, message);

      await session.commitTransaction();
      session.endSession();

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return false;
    }
  } catch (error) {
    return false;
  }
};

export default {
  generateUniqueID,
  getToday,
  encryptData,
  decryptData,
  hashData,
  compareHashData,
  checkTokenValidity,
  sendMailToUser,
  monthAbbreviations,
  sendEmailVerification,
};
