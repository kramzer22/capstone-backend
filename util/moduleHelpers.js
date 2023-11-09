import fetch from "node-fetch";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import crypto from "crypto";

import RegistrationToken from "../models/RegistrationToken.js";

const getToday = async (n, d) => {
  try {
    const response = await fetch(
      "http://worldtimeapi.org/api/timezone/America/New_York"
    );

    if (!response.ok) {
      throw new Error("dateFetchError");
    }

    const data = await response.json();
    const entryDate = moment(data.datetime).tz("Asia/Singapore");
    const expiryDate = entryDate.clone().add(n, d);

    return { entry_date: entryDate, expiry_date: expiryDate };
  } catch (error) {
    throw new Error("dateFetchError");
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
    throw new Error("bcryptHashError");
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

export default {
  getToday,
  encryptData,
  decryptData,
  hashData,
  checkTokenValidity,
};
