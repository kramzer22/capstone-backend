import mongoose from "mongoose";

import RegistrationToken from "../models/RegistrationToken.js";
import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const inviteHost = async (request, response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const data = request.customData;
    const registrationToken = new RegistrationToken({
      token: data.token,
      iv: data.iv,
      transaction_type: "host-invite",
      entry_date: data.entry_date,
      expiry_date: data.expiry_date,
    });

    await registrationToken.save();

    try {
      const subject = "Invitation request from Easygigph";
      const message = `We hope this message finds you well. We are excited to extend an invitation to you to join our platform and become a valued member of our community.\nClick the link below to start\n\nhttp://localhost:5173/register/?user=host&token=${data.token}`;
      await moduleHelpers.sendMailToUser(data.email, subject, message);

      await session.commitTransaction();
      session.endSession();

      response.status(201).json({
        message: "invitation successfully created.",
        sent_to: data.email,
        token_id: data.token,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      response
        .status(500)
        .json({ message: "Failed to process transaction. Try again." });
    }
  } catch (error) {
    response
      .status(500)
      .json({ message: "Failed to process transaction. Try again." });
  }
};

const checkInviteDataValidity = async (request, response, next) => {
  const data = request.body;
  if (!data.email) {
    response.status(400).json({ message: "Email for invitation is missing" });
  }

  const emailCheckResult = moduleCheckers.isValidEmail(data.email);
  if (!emailCheckResult.result) {
    response.status(400).json({ message: "Invalid email" });
  }

  request.customData = { email: emailCheckResult.value };
  try {
    const dates = await moduleHelpers.getToday(1, "month");
    const customData = {
      email: emailCheckResult.value,
      entry_date: dates.entry_date,
      expiry_date: dates.expiry_date,
    };

    const tokenResult = moduleHelpers.encryptData(customData);
    request.customData = {
      email: customData.email,
      entry_date: customData.entry_date,
      expiry_date: customData.expiry_date,
      token: tokenResult.token,
      iv: tokenResult.iv,
    };
    next();
  } catch (error) {
    console.log("Unable to process transaction");
    response
      .status(500)
      .json({ message: "Failed to process transaction. Try again." });
  }
};

const checkTokenValidity = async (request, response, next) => {
  try {
    const tokenValue = request.query.token_id;

    if (!tokenValue) {
      return response.status(401).json({ message: "token is missing" });
    }

    const tokenResult = await RegistrationToken.findOne({
      token: tokenValue,
      transaction_type: "host-invite",
      key_status: "available",
    });

    if (!tokenResult) {
      return response.status(401).json({ message: "token is invalid" });
    }
    next();
  } catch (error) {
    console.log("Unable to process transaction");
    response
      .status(500)
      .json({ message: "Failed to process transaction. Try again." });
  }
};

export default { inviteHost, checkInviteDataValidity, checkTokenValidity };
