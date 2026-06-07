const { admin } = require("./firebaseAdmin");

async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // try Firebase ID token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch {
      // fall back to Google access token
      const userResponse = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
      );
      const userInfo = await userResponse.json();

      if (userInfo.email) {
        req.user = { email: userInfo.email, name: userInfo.name };
        return next();
      }
      throw new Error("Invalid token");
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { verifyToken };
