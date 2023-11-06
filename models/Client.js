import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String,
  number: String,
});

clientSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Client = mongoose.model("client", clientSchema);

export default Client;
