import User from "../models/User.js";
import Client from "../models/Client.js";
import RegistrationToken from "../models/RegistrationToken.js";

import clientHelpers from "../helpers/clientHelpers.js";
import moduleHelpers from "../util/moduleHelpers.js";

function createUserClient(request, response) {
  const tokenID = request.query.token_id;

  RegistrationToken.findOne({ token: tokenID, key_status: "available" })
    .then((result) => {
      if (!result) {
        response.status(403).json({ message: "invalid token" });
      }

      const data = moduleHelpers.decryptData(result.token, result.iv);
      console.log(data);
      clientHelpers
        .runCreateClientTransaction(data, result._id)
        .then((newUser) => {
          console.log("New user registered", newUser);
          response.status(201).json({
            message: "successfully registered client",
            emai: newUser.email,
          });
        })
        .catch((error) => {
          response
            .status(400)
            .json({ message: "failed to register client", error });
        });
    })
    .catch((error) => {
      response.status(403).json({ message: "invalid token", error });
    });
  // Token.findById(keyID)
  //   .then((key) => {
  //     if (key && key.user_create === true && key.key_status === "available") {
  //       const validationErrors = validationResult(request);

  //       if (!validationErrors.isEmpty()) {
  //         return response
  //           .status(400)
  //           .json({ errors: validationErrors.array() });
  //       }

  //       const requestBody = request.body;
  //       User.find({ email: requestBody.email })
  //         .then((users) => {
  //           if (users.length === 0) {
  //             clientHelpers
  //               .runCreateClientTransaction(requestBody, key._id)
  //               .then((newUser) => {
  //                 console.log(newUser);
  //                 response.status(201).json({
  //                   message: "Client successfully added",
  //                   email: newUser.email,
  //                 });
  //               })
  //               .catch((error) => {
  //                 response
  //                   .status(400)
  //                   .json({ message: "Failed to process transaction", error });
  //               });
  //           } else {
  //             response.status(400).json({ message: "Already a member" });
  //           }
  //         })
  //         .catch((error) => {
  //           response
  //             .status(500)
  //             .json({ message: "Failed to find user", error });
  //         });
  //     } else {
  //       response.status(401).json({ message: "invalid API key" });
  //     }
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     response.status(401).json({ message: "transaction forbidden", error });
  //   });
}

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
