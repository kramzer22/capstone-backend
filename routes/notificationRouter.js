import express from "express";

import Notification from "../models/Notification.js";

import transactionTokenController from "../controllers/transactionTokenController.js";

import userHelpers from "../helpers/userHelpers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const notificationRouter = express.Router();

notificationRouter.get(
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
    const role = request.params.role;
    userHelpers.isValidUser(request, response, next, role);
  },
  async (request, response) => {
    try {
      const todayDate = (await moduleHelpers.getToday(3, "hours")).entry_date;
      const notifications = await Notification.find({
        email: request.userData.email,
      });

      const responseNotification = notifications.map((notification) => {
        const elapseDate = moduleHelpers.getDateDifference(
          notification.entry_date,
          todayDate
        );

        return { notification, elapse_time: elapseDate };
      });

      response.status(200).json(responseNotification);
    } catch (error) {
      response.status(500).json("internal server problem");
    }
  }
);

export default notificationRouter;
