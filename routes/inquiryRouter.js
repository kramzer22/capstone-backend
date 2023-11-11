import express from "express";

import inquiryController from "../controllers/inquiryController.js";

const inquiryRouter = express.Router();

inquiryRouter.get("/", inquiryController.getAllInquiry);

inquiryRouter.post("/register-inquiry", inquiryController.createUserInquiry);

inquiryRouter.get("/:id", inquiryController.getInquiry);

export default inquiryRouter;
