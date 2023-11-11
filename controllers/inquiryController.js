import mongoose from "mongoose";

import RegistrationToken from "../models/RegistrationToken.js";
import AdminKey from "../models/AdminKey.js";
import Inquiry from "../models/Inquiry.js";

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

const getAllInquiry = async (request, response) => {
  try {
    const key_id = request.query.key_id;
    const email = request.query.email;
    const status = request.query.request;
    if (!key_id || !(await AdminKey.findOne({ api_key: key_id }))) {
      throw new Error("invalidKeyError");
    }
    let inquiryList;
    if (email && status) {
      inquiryList = await Inquiry.find({ email: email, status: status });
    } else if (email) {
      inquiryList = await Inquiry.find({ email: email });
    } else if (status) {
      inquiryList = await Inquiry.find({ status: status });
    } else {
      inquiryList = await Inquiry.find({});
    }

    if (inquiryList.length > 0) {
      response.status(200).json(inquiryList);
    } else {
      response.status(200).json({ result: "empty" });
    }
  } catch (error) {
    if (error.message === "invalidKeyError") {
      console.log("missing or invalid key");
      response.status(401).json({ message: "Unauthorized access." });
    } else {
      console.log("Unable to process transaction");
      response
        .status(500)
        .json({ message: "Failed to process transaction. Try again." });
    }
  }
};

const getInquiry = async (request, response) => {
  try {
    const id = new mongoose.Types.ObjectId(request.params.id);

    const key_id = request.query.key_id;
    if (!key_id || !(await AdminKey.findOne({ api_key: key_id }))) {
      console.log("missing or invalid key");
      throw new Error("invalidKeyError");
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      console.log("invalid id");
      throw new Error("invalidIdError");
    }

    response.status(200).json(inquiry);
  } catch (error) {
    if (error.message === "invalidKeyError") {
      response.status(401).json({ message: "Unauthorized access." });
    } else if (error.message === "invalidIdError") {
      response.status(404).json({ message: "Id doesn't exist." });
    } else {
      console.log("Unable to process transaction", error);
      response
        .status(500)
        .json({ message: "Failed to process transaction. Try again." });
    }
  }
};

export default {
  createUserInquiry,
  getAllInquiry,
  getInquiry,
};
