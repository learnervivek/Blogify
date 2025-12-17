const jwt = require("jsonwebtoken");

function validateToken(token) {
  return jwt.verify(token, "secret-key");
}

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }
    try {
      const userPayload = validateToken(tokenCookieValue);
      if (userPayload?.profileImageURL?.startsWith("/public/")) {
        userPayload.profileImageURL = userPayload.profileImageURL.replace(
          "/public/",
          "/"
        );
      }
      req.user = userPayload;
    } catch (error) {}
    return next();
  };
}
module.exports = {
  checkForAuthenticationCookie,
};
