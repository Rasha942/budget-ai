const admin = require("firebase-admin");
require("dotenv").config();
const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
  : require("./firebase-admin-cred.json");

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-admin-cred.json")),
});

module.exports = { admin };
