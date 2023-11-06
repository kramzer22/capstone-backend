import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  user_aceess: {
    type: Boolean,
    default: false,
  },
  user_create: {
    type: Boolean,
    default: false,
  },
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

const Token = mongoose.model("token", tokenSchema);

export default Token;
