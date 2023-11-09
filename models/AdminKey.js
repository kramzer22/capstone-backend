import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
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
  entry_date: Date,
  expiry_date: Date,
});
