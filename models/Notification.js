import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  notification_type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  entry_date: {
    type: Date,
    required: true,
  },
});

notificationSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;
