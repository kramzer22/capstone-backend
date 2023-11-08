import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: String,
  iv: String,
  key_status: {
    type: String,
    default: "available",
  },
  entry_date: Date,
  expiry_date: Date,
});

tokenSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const RegistrationToken = mongoose.model("registration_token", tokenSchema);

export default RegistrationToken;
