import fetch from "node-fetch";
import moment from "moment-timezone";
import crypto from "crypto";

const getToday = async (n, d) => {
  try {
    const response = await fetch(
      "http://worldtimeapi.org/api/timezone/America/New_York"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    const entryDate = moment(data.datetime).tz("Asia/Singapore");
    const expiryDate = entryDate.clone().add(n, d);

    return { entry_date: entryDate, expiry_date: expiryDate };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const encryptData = (data) => {
  const secretKey = process.env.ENV_SECRET_KEY;
  const iv = crypto.randomBytes(16);
  const ivHex = iv.toString("hex");
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    iv
  );
  let encryptData = cipher.update(JSON.stringify(data), "utf8", "hex");
  encryptData += cipher.final("hex");

  return { token: encryptData, iv: ivHex };
};

const decryptData = (encryptData, iv) => {
  const secretKey = process.env.ENV_SECRET_KEY;
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    Buffer.from(iv, "hex")
  );
  let decryptJSON = decipher.update(
    Buffer.from(encryptData, "hex"),
    "hex",
    "utf8"
  );
  decryptJSON += decipher.final("utf8");

  return decryptJSON;
};

export default { getToday, encryptData, decryptData };
