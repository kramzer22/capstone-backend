import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  first_name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  last_name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  number: {
    type: String,
    required: true,
    minlength: 11,
    maxlength: 11,
  },
  note: {
    type: String,
    required: true,
    minlength: 11,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "ongoing", "completed"],
  },
  entry_date: Date,
});

inquirySchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Inquiry = mongoose.model("inquiry", inquirySchema);

export default Inquiry;
