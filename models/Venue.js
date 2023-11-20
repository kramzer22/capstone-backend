import mongoose from "mongoose";

const venueSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  venue_name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
    trim: true,
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
  description: {
    type: String,
    required: true,
    minlength: 1,
  },
  images: [
    {
      _id: false,
      link: String,
      name: String,
    },
  ],
  packages: [
    {
      _id: false,
      id: String,
      name: String,
      description: String,
      price: Number,
      inclusions: [String],
    },
  ],
});

venueSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Venue = mongoose.model("venue", venueSchema);

export default Venue;
