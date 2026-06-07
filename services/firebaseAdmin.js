require("dotenv").config();
const admin = require("firebase-admin");

console.log("HAS CREDENTIALS:", !!process.env.FIREBASE_ADMIN_CREDENTIALS);

const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
  : require("./firebase-admin-cred.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

module.exports = { admin };
