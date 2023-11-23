import express from "express";

import Message from "../models/Message.js";
import Host from "../models/Host.js";

import transactionTokenController from "../controllers/transactionTokenController.js";

import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";
import userHelpers from "../helpers/userHelpers.js";

const messagingRouter = express.Router();

messagingRouter.get(
  "/:role",
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
    userHelpers.isValidUser(request, response, next, request.params.role);
  },
  async (request, response) => {
    const senderRole = request.params.role;
    const senderEmail = request.userData.email;

    try {
      const emailToSearch =
        senderRole === "client" ? "users.client_email" : "users.host_email";
      const messageData = await Message.find({
        [emailToSearch]: senderEmail,
      }).sort({ update_date: -1 });

      const modifiedMessageData = await Promise.all(
        messageData.map(async (data) => {
          const host = await Host.findOne({
            email: data.users.host_email,
          });
          const datesResult = await moduleHelpers.getToday(1, "hours");

          return {
            ...data.toJSON(),
            message: {
              ...data.messages[data.messages.length - 1].toJSON(),
              elapsed: moduleHelpers.getDateDifference(
                data.messages[data.messages.length - 1].date_entry,
                datesResult.entry_date
              ),
              who_is:
                senderEmail ===
                data.messages[data.messages.length - 1].user_email
                  ? "sender"
                  : "recipient",
            },
            host_name: host ? host.business_name : null,
          };
        })
      );

      response.status(200).json(modifiedMessageData);
    } catch (error) {
      response.status(500).json({ mesage: "internal server error" });
    }
  }
);

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

      const modifiedMessageData = !messageData
        ? null
        : {
            ...messageData.toJSON(),
            messages: await Promise.all(
              messageData.messages.map(async (message) => {
                const datesResult = await moduleHelpers.getToday(1, "hours");

                return {
                  user_email: message.user_email,
                  content: message.content,
                  date_entry: message.date_entry,
                  elapsed: moduleHelpers.getDateDifference(
                    message.date_entry,
                    datesResult.entry_date
                  ),
                  who_is:
                    senderEmail === message.user_email ? "sender" : "recipient",
                };
              })
            ),
          };

      if (modifiedMessageData && modifiedMessageData.messages) {
        modifiedMessageData.messages.sort(
          (a, b) => new Date(b.date_entry) - new Date(a.date_entry)
        );
      }

      const responseData = {
        ...modifiedMessageData,
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
        console.log("wawawee");
        await Message.updateOne(
          {
            "users.client_email":
              senderRole === "client" ? senderEmail : recipient,
            "users.host_email":
              senderRole === "client" ? recipient : senderEmail,
          },
          {
            $push: {
              messages: {
                user_email: senderEmail,
                content: message,
                date_entry: dates.entry_date,
              },
            },
            $set: {
              update_date: dates.entry_date,
            },
          },
          { new: false }
        );

        response.status(200).json({ message: "message successfully sent" });
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
