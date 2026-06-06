require("dotenv").config();
const { google } = require("googleapis");
const creds = require("./google-cred.json");

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

auth
  .getClient()
  .then((client) => {
    const drive = google.drive({ version: "v3", auth: client });
    return drive.files.list({ pageSize: 1 });
  })
  .then((res) => console.log("Drive access works!", res.data))
  .catch((err) => console.error("Error:", err.message));
