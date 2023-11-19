import User from "../models/User.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const isValidUser = async (request, response, next, userRole) => {
  const userToken = request.tokenResult;
  const data = JSON.parse(
    moduleHelpers.decryptData(userToken.token, userToken.iv)
  );
  try {
    const user = await User.findOne({ email: data.email, role: userRole });
    if (!user) {
      throw new moduleCheckers.CustomError(
        "user not found",
        401,
        "invalidUser"
      );
    }
    if (!(await moduleHelpers.compareHashData(data.password, user.password))) {
      throw new moduleCheckers.CustomError(
        "password mismatch",
        401,
        "invalidUser"
      );
    }

    request.userData = user;
    next();
  } catch (error) {
    if (error instanceof moduleCheckers.CustomError) {
      response.status(error.status).json({ message: error.message });
    } else {
      console.log(error);
      response.status(500).json("internal server problem");
    }
  }
};

export default { isValidUser };
