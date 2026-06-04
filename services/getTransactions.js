const { google } = require("googleapis");
require("dotenv").config();
const credentials = process.env.GOOGLE_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : require("./google-cred.json");
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function getTransactions() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A2:E",
  });

  const rows = response.data.values || [];

  return rows.map((row) => ({
    date: row[0],
    description: row[1],
    category: row[2],
    amount: parseFloat(row[3]),
    currency: row[4],
  }));
}

getTransactions().then((data) => console.log(data));
