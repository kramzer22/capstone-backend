import AdminKey from "../models/AdminKey.js";

import moduleHelpers from "../util/moduleHelpers.js";

const createAdminToken = async (request, response) => {
  try {
    const secretKey = request.query.secret;
    if (!secretKey && process.env.ENV_SECRET_KEY !== secretKey) {
      throw new Error("invalidKeyError");
    }
    const dates = await moduleHelpers.getToday(3, "month");
    const apiKey = await moduleHelpers.hashData(dates.entry_date.toString());

    const adminKey = new AdminKey({
      api_key: apiKey,
      entry_date: dates.entry_date,
      expiry_date: dates.expiry_date,
    });

    const result = await adminKey.save();
    console.log(`new admin API key created: ${result.api_key}`);
    response.status(201).json({
      message: "new admin API key created",
      key: result.api_key,
      entry_date: result.entry_date,
      expiry_date: result.expiry_date,
    });
  } catch (error) {
    if (error.message === "invalidKeyError") {
      console.log("missing or invalid key");
      response.status(401).json({ message: "Unauthorized access." });
    } else {
      console.log("Unable to process transaction");
      response
        .status(500)
        .json({ message: "Failed to process transaction. Try again." });
    }
  }
};

export default { createAdminToken };
