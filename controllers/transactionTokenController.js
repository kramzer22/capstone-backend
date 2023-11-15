import mongoose from "mongoose";

import transactionTokenHelper from "../helpers/transactionTokenHelper.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelper from "../util/moduleHelpers.js";

const registrationTypes = transactionTokenHelper.TOKEN_TYPES;

const registerTransactionToken = async (request, response, next) => {
  const regType = request.params.type;
  if (
    regType &&
    registrationTypes.find((item) => item === regType.toLowerCase())
  ) {
    try {
      if (regType === "host-invite") {
        const apiKey = request.query.api_key;
        const email = await transactionTokenHelper.createHostInviteToken(
          apiKey,
          request.body,
          regType
        );
        console.log(`email invitation for: ${email} successfully submitted`);
        response.status(201).json({
          message: `email invitation for: ${email} successfully submitted`,
        });
      } else if (regType === "client-registration") {
        await moduleCheckers.checkUserEmailForDuplicate(request, response);

        const token = await transactionTokenHelper.createToken(
          request.body,
          15,
          "minute",
          regType
        );

        response.status(201).json({
          message: `registration token successfully created`,
          token: token,
        });
      } else {
        console.log("\nEndpoint doesn't exist");
        throw new moduleCheckers.CustomError("Endpoint doesn't exist", 404);
      }
    } catch (error) {
      if (error instanceof moduleCheckers.CustomError) {
        response
          .status(error.status)
          .json({ message: error.message, error: error.errorResponse });
      } else {
        console.log(error);
        response.status(500).json("Internal server problem");
      }
    }
  } else {
    response.status(404).json({ message: "Endpoint doesn't exist" });
  }
};

const checkTransactionToken = async (request, response, tokenType, next) => {
  console.log(tokenType);
  if (tokenType && registrationTypes.find((item) => item === tokenType)) {
    try {
      const token = request.query.token_id;
      const tokenResult = await transactionTokenHelper.isTokenValid(
        token,
        tokenType
      );
      console.log(
        `${tokenType} token is valid until: ${tokenResult.expiry_date}`
      );
      request.tokenResult = tokenResult;
      next();
    } catch (error) {
      if (error instanceof moduleCheckers.CustomError) {
        response.status(error.status).json({ message: error.message });
      } else {
        console.log(error);
        response.status(500).json("Internal server problem");
      }
    }
  } else {
    response.status(404).json({ message: "Endpoint doesn't exist" });
  }
};

const createTransactionTokenAndUpdateToken = async (
  request,
  response,
  d,
  n,
  type
) => {
  try {
    const tokenResult = request.tokenResult;
    const token = moduleHelper.encryptData(request.body);
    const dates = await moduleHelper.getToday(n, d);
    const entryDate = dates.entry_date;
    const expiryDate = dates.expiry_date;

    const registrationToken = new RegistrationToken({
      token: token.token,
      iv: token.iv,
      transaction_type: type,
      entry_date: entryDate,
      expiry_date: expiryDate,
    });

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const newToken = await registrationToken.save();
      await RegistrationToken.findByIdAndUpdate(
        { _id: tokenResult._id },
        { key_status: "used" },
        { new: false }
      );

      response.status(201).json({ token: newToken.token });
    } catch (error) {
      console.log("error saving token");
      await session.abortTransaction();
      session.endSession();

      throw error;
    }
  } catch (error) {
    response
      .status(500)
      .json({ message: "unable to process token generation." });
  }
};

export default {
  registerTransactionToken,
  checkTransactionToken,
  createTransactionTokenAndUpdateToken,
};
