import { body, validationResult } from "express-validator";

import User from "../models/User.js";
import Token from "../models/Key.js";
import clientHelpers from "../helpers/clientHelpers.js";
import Client from "../models/Client.js";

function createUserClient(request, response) {
  const validationErrors = validationResult(request);

  if (!validationErrors.isEmpty()) {
    return response.status(400).json({ errors: validationErrors.array() });
  }

  const requestBody = request.body;

  User.find({ email: requestBody.email })
    .then((users) => {
      if (users.length === 0) {
        clientHelpers
          .runCreateClientTransaction(requestBody)
          .then((newUser) => {
            console.log(newUser);
            response.status(201).json({
              message: "Client successfully added",
              email: newUser.email,
            });
          })
          .catch((error) => {
            response
              .status(400)
              .json({ message: "Failed to process transaction", error });
          });
      } else {
        response.status(400).json({ message: "Already a member" });
      }
    })
    .catch((error) => {
      response.status(500).json({ message: "Failed to find user", error });
    });
}

const validateClientData = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("first_name").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, " ").trim();

      if (cleanedValue.length < 1) {
        reject("First name should not be empty.");
      } else if (/[^a-zA-Z\s-']/.test(cleanedValue)) {
        reject(
          "First name should only contain alphabets, spaces, hyphens, and apostrophes."
        );
      } else {
        resolve();
      }
    });
  }),
  body("last_name").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, " ").trim();

      if (cleanedValue.length < 1) {
        reject("Last name should not be empty.");
      } else if (/[^a-zA-Z\s-']/.test(cleanedValue)) {
        reject(
          "Last name should only contain alphabets, spaces, hyphens, and apostrophes."
        );
      } else {
        resolve();
      }
    });
  }),
  body("number").custom((value) => {
    return new Promise((resolve, reject) => {
      const cleanedValue = value.replace(/\s+/g, "").trim();
      const mobileNumberPattern = /^\d{11}$/; // Example pattern for a 10-digit mobile number

      if (!mobileNumberPattern.test(cleanedValue)) {
        reject("Invalid mobile number format");
      }

      resolve();
    });
  }),
];

// Find all user
function getAllClient(request, response) {
  const keyID = request.query.key_id;
  Token.findById(keyID)
    .then((key) => {
      if (key && key.user_aceess === true && key.key_status === "available") {
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
  validateClientData,
};
