import mongoose from "mongoose";

const hostSchema = new mongoose.Schema({});

hostSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Host = mongoose.model("host", hostSchema);

export default Host;
