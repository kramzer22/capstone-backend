import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  users: {
    type: {
      client_email: String,
      host_email: String,
    },
    required: true,
    _id: false,
  },
  messages: [
    {
      user_email: String,
      content: String,
      date_entry: Date,
      _id: false,
    },
  ],

  entry_date: {
    type: Date,
    required: true,
  },
  update_date: {
    type: Date,
    required: true,
  },
});

messageSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Message = mongoose.model("message", messageSchema);

export default Message;
