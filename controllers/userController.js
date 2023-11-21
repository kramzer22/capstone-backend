import mongoose from "mongoose";

import User from "../models/User.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const checkEmail = (request, response) => {
  response.status(200).end();
};

const checkLoginCredentials = async (request, response, next) => {
  const loginData = request.body;
  console.log(loginData);
  try {
    if (!loginData.email || !loginData.password) {
      console.log("user data missing");
      throw new moduleCheckers.CustomError(
        "missing user data",
        401,
        "invalidUser"
      );
    }
    try {
      const user = await User.findOne({
        email: loginData.email.toLowerCase(),
      });

      if (!user) {
        console.log(`user not found: ${loginData.email}`);
        throw new moduleCheckers.CustomError(
          "user not found",
          401,
          "invalidCredentials"
        );
      }

      if (
        !(await moduleHelpers.compareHashData(
          loginData.password,
          user.password
        ))
      ) {
        console.log(`invalid user password`);
        throw new moduleCheckers.CustomError(
          "invalid user password",
          401,
          "invalidCredentials"
        );
      }
      request.userInfo = user;
      next();
    } catch (error) {
      throw error;
    }
  } catch (error) {
    if (error instanceof moduleCheckers.CustomError) {
      response
        .status(error.status)
        .json({ message: error.message, error: error.errorResponse });
    } else {
      console.log(error);
      response.status(500).json({ message: "Internal server problem" });
    }
  }
};

const checkUserToken = async (request, response) => {
  const tokenResult = request.tokenResult;

  const data = JSON.parse(
    moduleHelpers.decryptData(tokenResult.token, tokenResult.iv)
  );
  try {
    const user = await User.findOne({
      email: data.email.toLowerCase(),
    });

    if (!user) {
      console.log(`user not found: ${loginData.email}`);
      throw new moduleCheckers.CustomError(
        "user not found",
        401,
        "invalidCredentials"
      );
    }

    if (!(await moduleHelpers.compareHashData(data.password, user.password))) {
      console.log(`invalid user password`);
      throw new moduleCheckers.CustomError(
        "invalid user password",
        401,
        "invalidCredentials"
      );
    }
    response
      .status(200)
      .json({
        message: "valid user token",
        user_role: user.role,
        email: user.email,
      });
  } catch (error) {
    if (error instanceof moduleCheckers.CustomError) {
      response
        .status(error.status)
        .json({ message: error.message, error: error.errorResponse });
    } else {
      console.log(error);
      response.status(500).json({ message: "Internal server problem" });
    }
  }
};

export default { checkLoginCredentials, checkUserToken };
