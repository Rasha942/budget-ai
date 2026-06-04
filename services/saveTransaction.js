const { google } = require("googleapis");
require("dotenv").config();

const credentials = process.env.GOOGLE_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : require("./google-cred.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
async function setupSheet(client) {
  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A1:E1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [["תאריך", "תיאור", "קטגוריה", "סכום", "מטבע"]],
    },
  });
}

async function saveTransaction(transaction) {
  const client = await auth.getClient();
  await setupSheet(client);

  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A2:E",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        [
          transaction.date,
          transaction.description,
          transaction.category,
          transaction.amount,
          transaction.currency,
        ],
      ],
    },
  });
}

module.exports = { saveTransaction };
