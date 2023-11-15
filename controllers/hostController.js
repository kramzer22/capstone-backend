import moduleCheckers from "../util/moduleCheckers.js";
import hostHelpers from "../helpers/hostHelpers.js";

const registerHost = async (request, response) => {
  const registrationToken = request.query.token_id;
  try {
    const newHost = await hostHelpers.registerHost(
      registrationToken,
      request.body
    );
    response
      .status(201)
      .json({ message: "host successfully registered", newHost });
  } catch (error) {
    if (error instanceof moduleCheckers.CustomError) {
      response.status(error.status).json({ message: error.message });
    } else {
      console.log(error);
      response.status(500).json("Internal server problem");
    }
  }
};

export default {
  registerHost,
};
