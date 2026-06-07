const { db } = require("./firebase");
const {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
} = require("firebase/firestore");
require("dotenv").config();

async function getTransactions(workspaceId) {
  const q = query(
    collection(db, "workspaces", workspaceId, "transactions"),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function deleteTransaction(workspaceId, transactionId) {
  await deleteDoc(
    doc(db, "workspaces", workspaceId, "transactions", transactionId),
  );
}

module.exports = { getTransactions, deleteTransaction };
