const { getOrCreateMonthlySheet } = require("./storage");

getOrCreateMonthlySheet("ar9zxURl16wrlyuoUcnm")
  .then((sheetId) => console.log("Sheet ID:", sheetId))
  .catch((err) => {
    console.error("Error message:", err.message);
    console.error("Error details:", err.errors);
    console.error("Full error:", err);
  });
