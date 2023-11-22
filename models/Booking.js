import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  client_email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  host_email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  booking_status: {
    type: String,
    required: true,
    default: "approval_pending",
  },
  entry_date: {
    type: Date,
    required: true,
  },
  book_date: {
    type: Date,
    required: true,
  },
  venue_id: {
    type: String,
    required: true,
  },
  venue_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: {
      province: String,
      city: String,
      barangay: String,
      street: String,
    },
    required: true,
    _id: false,
  },
  images: [
    {
      _id: false,
      link: String,
      name: String,
    },
  ],
  package: {
    type: {
      id: String,
      name: String,
      description: String,
      price: Number,
      inclusions: [String],
    },
    _id: false,
    required: true,
  },
});

bookingSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    returnedObject.complete_address = `${returnedObject.address.street} ${returnedObject.address.barangay}, ${returnedObject.address.city}, ${returnedObject.address.province}`;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Booking = mongoose.model("booking", bookingSchema);

export default Booking;
