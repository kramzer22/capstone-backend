import mongoose from "mongoose";
import { ref, uploadBytes } from "firebase/storage";

import Venue from "../models/Venue.js";

import hostHelpers from "../helpers/hostHelpers.js";

import storage from "../util/firebaseConfig.js";
import moduleCheckers from "../util/moduleCheckers.js";
import moduleHelpers from "../util/moduleHelpers.js";

const registerHost = async (request, response) => {
  const registrationToken = request.query.token_id;
  try {
    const newHost = await hostHelpers.registerHost(
      registrationToken,
      request.body
    );
    response
      .status(201)
      .json({ message: "host successfully registered", newHost });
  } catch (error) {
    if (error instanceof moduleCheckers.CustomError) {
      response.status(error.status).json({ message: error.message });
    } else {
      console.log(error);
      response.status(500).json("internal server problem");
    }
  }
};

const getVenue = async (request, response) => {
  try {
    const userData = request.userData;
    const venues = await Venue.find({ email: userData.email });

    response.status(200).json(venues);
  } catch (error) {
    console.log(error);
    response.status(500).json("internal server problem");
  }
};

const registerVenue = async (request, response) => {
  const bodyData = request.body;
  try {
    const user = request.userData;

    const venue = new Venue({
      email: user.email,
      venue_name: bodyData.venue_name,
      address: {
        province: bodyData.address.province.name,
        city: bodyData.address.city.name,
        barangay: bodyData.address.barangay.name,
        street: bodyData.address.street,
      },
      description: bodyData.description,
    });

    await venue.save();

    response.status(201).json(venue);
  } catch (error) {
    console.log(error);
    response.status(500).json("internal server problem");
  }
};

const updateVenue = async (request, response) => {
  const bodyData = request.body;
  try {
    const venueId = new mongoose.Types.ObjectId(bodyData.venue_id);
    const user = request.userData;

    const updateVenue = await Venue.findByIdAndUpdate(
      { _id: venueId },
      {
        $set: {
          email: user.email,
          venue_name: bodyData.venue_name,
          "address.province": bodyData.address.province.name,
          "address.city": bodyData.address.city.name,
          "address.barangay": bodyData.address.barangay.name,
          "address.street": bodyData.address.street,
          description: bodyData.description,
        },
      },
      { new: true }
    );

    response.status(200).json(updateVenue);
  } catch (error) {
    console.log(error);
    response.status(500).json("internal server problem");
  }
};

const uploadVenueImage = async (request, response) => {
  const uploadedFile = request.file;
  try {
    const venueId = new mongoose.Types.ObjectId(request.body.venue_id);
    const venue = await Venue.findById({
      _id: venueId,
    });
    if (!venue) {
      throw new moduleCheckers.CustomError(
        "id is invalid or malformed",
        401,
        "invalidIdError"
      );
    }
    const fileName = await moduleHelpers.generateUniqueID();
    const storageRef = ref(storage, fileName);
    const metadata = {
      contentType: "image/jpeg",
    };
    const snapshot = await uploadBytes(
      storageRef,
      uploadedFile.buffer,
      metadata
    );
    console.log(snapshot);
    const imageLocation = `https://firebasestorage.googleapis.com/v0/b/easygigph-7d555.appspot.com/o/${snapshot.metadata.fullPath}?alt=media`;

    const updateVenue = await Venue.findByIdAndUpdate(
      { _id: venueId },
      {
        $push: {
          images: {
            image: {
              link: imageLocation,
              name: snapshot.metadata.name,
            },
          },
        },
      },
      { new: true }
    );

    response.status(200).json({ venue_id: updateVenue });
  } catch (error) {
    console.log(error);
    if (error instanceof moduleCheckers.CustomError) {
      response.status(error.status).json({ message: error.message });
    } else {
      response.status(500).json("internal server problem");
    }
  }
};

export default {
  registerHost,
  updateVenue,
  getVenue,
  registerVenue,
  uploadVenueImage,
};
