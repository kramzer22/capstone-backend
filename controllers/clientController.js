import Client from "../models/Client.js";

import clientHelpers from "../helpers/clientHelpers.js";
import moduleCheckers from "../util/moduleCheckers.js";

const registerClient = async (request, response) => {
  const registrationToken = request.tokenResult;
  try {
    const newClient = await clientHelpers.registerClient(registrationToken);

    response
      .status(201)
      .json({ message: "client successfully registered", newClient });
  } catch (error) {
    if (error instanceof moduleCheckers.CustomError) {
      response.status(error.status).json({ message: error.message });
    } else {
      console.log(error);
      response.status(500).json("Internal server problem");
    }
  }
};

// Find all user
function getAllClient(request, response) {
  const keyID = request.query.key_id;
  Token.findById(keyID)
    .then((key) => {
      if (key && key.user_access === true && key.key_status === "available") {
        Client.find({})
          .then((result) => {
            const clients = result;
            console.log("fetched user table.", clients);
            response.status(200).json(clients);
          })
          .catch((error) => {
            console.log(error);
            response.status(500).json({ error: "Internal server error." });
          });
      } else {
        response.status(401).json({ message: "invalid API key" });
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(401).json({ message: "transaction forbidden", error });
    });
}

export default {
  getAllClient,
  registerClient,
};
