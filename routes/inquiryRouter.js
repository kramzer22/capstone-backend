import express from "express";

import inquiryController from "../controllers/inquiryController.js";

const inquiryRouter = express.Router();

inquiryRouter.get("/");

inquiryRouter.post("/register-inquiry", inquiryController.createUserInquiry);

export default inquiryRouter;
