import AdminKey from "../models/AdminKey.js";

import validator from "validator";

const isValidEmail = (email) => {
  const cleanedEmail = email.trim().toLowerCase();
  if (!validator.isEmpty(cleanedEmail) && validator.isEmail(cleanedEmail)) {
    return { result: true, value: cleanedEmail };
  }

  return { result: false };
};

const checkApiKeyValidity = async (request, response, next) => {
  try {
    const key_id = request.query.key_id;
    if (!key_id) {
      console.log("missing key");
      response.status(401).json({ message: "Unauthorized access." });
    }
    
    const isValidKey = await AdminKey.findOne({ api_key: key_id });
    if (!isValidKey) {
      console.log("invalid key");
      return response.status(401).json({ message: "Invalid API key." });
    }

    next();
  } catch (error) {
    console.log("unable to process transaction", error);
    response
      .status(500)
      .json({ message: "Unable to process transaction. Try again." });
  }
};

export default { checkApiKeyValidity, isValidEmail };
