const { db } = require("./firebase");
const {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} = require("firebase/firestore");
require("dotenv").config();

async function saveTransaction(transaction, workspaceId, userEmail) {
  await addDoc(collection(db, "workspaces", workspaceId, "transactions"), {
    ...transaction,
    addedBy: userEmail,
    createdAt: new Date(),
  });
}

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

async function updateTransaction(workspaceId, transactionId, update) {
  await updateDoc(
    doc(db, "workspaces", workspaceId, "transactions", transactionId),
    update,
  );
}

module.exports = {
  getTransactions,
  deleteTransaction,
  saveTransaction,
  updateTransaction,
};
