import RegistrationToken from "../models/RegistrationToken.js";

import inquiryHelpers from "../helpers/inquiryHelpers.js";
import moduleHelper from "../util/moduleHelpers.js";

function createUserInquiry(request, response) {
  const tokenID = request.query.token_id;

  RegistrationToken.findOne({
    token: tokenID,
    key_status: "available",
    transaction_type: "contact-inquiry",
  })
    .then((result) => {
      if (!result) {
        response.status(403).json({ message: "invalid token" });
      }

      const data = moduleHelper.decryptData(result.token, result.iv);

      inquiryHelpers
        .runCreateInquiryTransaction(data, result._id)
        .then((newInquiry) => {
          console.log("New inquiry added", newInquiry);
          response.status(201).json({
            message: "successfully added inquiry",
            emai: newInquiry.email,
          });
        })
        .catch((error) => {
          response
            .status(400)
            .json({ message: "failed to register inquiry", error });
        });
    })
    .catch((error) => {
      response.status(403).json({ message: "invalid token", error });
    });
}

export default {
  createUserInquiry,
};
