import RegistrationToken from "../models/RegistrationToken.js";
import moduleHelper from "../util/moduleHelpers.js";

const createRegistrationToken = (request, response) => {
  const token = moduleHelper.encryptData(request.body);

  moduleHelper
    .getToday(1, "hour")
    .then((dates) => {
      const entryDate = dates.entry_date;
      const expiryDate = dates.expiry_date;

      const registrationToken = new RegistrationToken({
        token: token.token,
        iv: token.iv,
        entry_date: entryDate,
        expiry_date: expiryDate,
      });

      registrationToken
        .save()
        .then((result) => {
          console.log(
            `registration token successfully created: ${token.token}`
          );
          response.status(201).json({ token: result.token });
        })
        .catch((error) => {
          console.log(error);
          response
            .status(500)
            .json({ message: "unable to process token generation." });
        });
    })
    .catch((error) => {
      console.log(error);
      response
        .status(500)
        .json({ message: "unable to process token generation." });
    });
};

export default { createRegistrationToken };
