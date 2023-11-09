import mongoose from "mongoose";

const adminKeySchema = new mongoose.Schema({
  inquiry_access: {
    type: Boolean,
    default: false,
  },
  invite_organizer: {
    type: Boolean,
    default: false,
  },
  api_key: {
    type: String,
    required: true,
  },
  key_status: {
    type: String,
    default: "available",
  },
  entry_date: Date,
  expiry_date: Date,
});

adminKeySchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const RegistrationToken = mongoose.model("admin_token", adminKeySchema);

export default RegistrationToken;
