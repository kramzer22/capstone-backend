import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  name: {
    type: {
      first_name: {
        type: String,
        minlength: 1,
        maxlength: 100,
      },
      last_name: {
        type: String,
        minlength: 1,
        maxlength: 100,
      },
    },
    required: true,
    _id: false,
  },
  number: {
    type: String,
    required: true,
    minlength: 11,
    maxlength: 11,
  },
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
