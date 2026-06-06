const { saveTransaction } = require("./saveTransaction");
const { getTransactions } = require("./getTransactions");

const testTransaction = {
  amount: 45,
  currency: "ILS",
  category: "אוכל",
  description: "קפה",
  date: "2026-06-07",
};

const workspaceId = "ar9zxURl16wrlyuoUcnm";
const userEmail = "raz@gmail.com";

async function test() {
  console.log("saving transaction...");
  await saveTransaction(testTransaction, workspaceId, userEmail);
  console.log("saved!");

  console.log("getting transactions...");
  const transactions = await getTransactions(workspaceId);
  console.log("transactions:", transactions);
}

test().catch((err) => console.error("Error:", err.message));
