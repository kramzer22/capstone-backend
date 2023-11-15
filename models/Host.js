import mongoose from "mongoose";

const hostSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  name: {
    type: Object,
    required: true,
    first_name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true,
    },
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "others"],
  },
  business_name: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
    province: String,
    city: String,
    barangay: String,
    street: String,
  },
  number: {
    type: Object,
    required: true,
    mobile: {
      type: String,
      minlength: 11,
      maxlength: 11,
    },
    landline: {
      type: String,
    },
  },
  document_verified: {
    type: Boolean,
    default: false,
  },
});

hostSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Host = mongoose.model("host", hostSchema);

export default Host;
