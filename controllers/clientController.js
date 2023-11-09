import Client from "../models/Client.js";

import clientHelpers from "../helpers/clientHelpers.js";

import moduleHelpers from "../util/moduleHelpers.js";

const createUserClient = async (request, response) => {
  try {
    const tokenID = request.query.token_id;

    const tokenResult = await moduleHelpers.checkTokenValidity(
      tokenID,
      "client-registration"
    );

    const data = moduleHelpers.decryptData(tokenResult.token, tokenResult.iv);

    const newClient = await clientHelpers.runCreateClientTransaction(
      data,
      tokenResult._id
    );

    console.log(
      `New user registered\nemail:${newClient.email}\nname:${newClient.first_name} ${newClient.last_name}`
    );

    response.status(201).json({
      message: "successfully registered client",
      emai: newClient.email,
    });
  } catch (error) {
    if (error.message === "invalidTokenError") {
      console.log("missing or invalid token");
      response.status(401).json({ message: "Unauthorized access." });
    } else {
      console.log("Unable to process transaction", error);
      response
        .status(500)
        .json({ message: "Failed to process client registration. Try again." });
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
  createUserClient,
};
