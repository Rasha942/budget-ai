const { db } = require("./firebase");
const { collection, addDoc } = require("firebase/firestore");
require("dotenv").config();

async function saveTransaction(transaction, workspaceId, userEmail) {
  await addDoc(collection(db, "workspaces", workspaceId, "transactions"), {
    ...transaction,
    addedBy: userEmail,
    createdAt: new Date(),
  });
}

module.exports = { saveTransaction };
