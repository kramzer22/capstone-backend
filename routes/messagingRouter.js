import express from "express";
import mongoose from "mongoose";

import Message from "../models/Message.js";
import Host from "../models/Host.js";

import transactionTokenController from "../controllers/transactionTokenController.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";
import userHelpers from "../helpers/userHelpers.js";
import { updateMetadata } from "firebase/storage";

const messagingRouter = express.Router();

messagingRouter.post(
  "/",
  (request, response, next) => {
    const tokenType = "user-login";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  (request, response, next) => {
    userHelpers.isValidUser(request, response, next, request.body.role);
  },
  async (request, response) => {
    const senderRole = request.body.role;
    const senderEmail = request.userData.email;
    const recipient = request.body.recipient;

    try {
      const messageData = await Message.findOne({
        "users.client_email": senderRole === "client" ? senderEmail : recipient,
        "users.host_email": senderRole === "client" ? recipient : senderEmail,
      }).sort({ update_date: -1 });

      const hostData = await Host.findOne({
        email: senderRole === "client" ? recipient : senderEmail,
      });

      const responseData = {
        messageData,
        host_name: hostData.business_name,
      };

      response.status(200).json(responseData);
    } catch (error) {
      response.status(500).json({ mesage: "internal server error" });
    }
  }
);

messagingRouter.post(
  "/send",
  (request, response, next) => {
    const tokenType = "user-login";
    transactionTokenController.checkTransactionToken(
      request,
      response,
      tokenType,
      next
    );
  },
  (request, response, next) => {
    userHelpers.isValidUser(request, response, next, request.body.role);
  },
  async (request, response) => {
    const senderRole = request.body.role;
    const senderEmail = request.userData.email;
    const recipient = request.body.recipient;
    const message = request.body.message;

    try {
      const dates = await moduleHelpers.getToday(2, "hours");

      const messageData = await Message.findOne({
        "users.client_email": senderRole === "client" ? senderEmail : recipient,
        "users.host_email": senderRole === "client" ? recipient : senderEmail,
      });

      if (messageData) {
        response.status(200).json({ message: "conversation exist" });
      } else {
        const newMessageData = new Message({
          users: {
            client_email: senderRole === "client" ? senderEmail : recipient,
            host_email: senderRole === "client" ? recipient : senderEmail,
          },
          messages: [
            {
              user_email: senderEmail,
              content: message,
              date_entry: dates.entry_date,
            },
          ],

          entry_date: dates.entry_date,
          update_date: dates.entry_date,
        });

        await newMessageData.save();

        response.status(200).json({ message: "message successfully sent" });
      }
    } catch (error) {
      response.status(500).json({ mesage: "internal server error" });
    }
  }
);

export default messagingRouter;
