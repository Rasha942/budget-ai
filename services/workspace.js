const { db } = require("./firebase");
const {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  getDocs,
} = require("firebase/firestore");
require("dotenv").config();

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

async function createWorkspace(userEmail, userName, workspaceName) {
  const inviteCode = generateInviteCode();

  const workspaceRef = await addDoc(collection(db, "workspaces"), {
    name: workspaceName,
    owner: userEmail,
    ownerName: userName,
    members: [userEmail],
    inviteCode: inviteCode,
    inviteExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    inviteUsed: false,
    createdAt: new Date(),
  });

  const userRef = doc(db, "users", userEmail);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    await updateDoc(userRef, {
      workspaceIds: [...userDoc.data().workspaceIds, workspaceRef.id],
    });
  } else {
    await setDoc(userRef, {
      email: userEmail,
      name: userName,
      workspaceIds: [workspaceRef.id],
    });
  }

  return workspaceRef.id;
}

async function joinWorkspace(userEmail, inviteCode) {
  const q = query(
    collection(db, "workspaces"),
    where("inviteCode", "==", inviteCode),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error("קוד הזמנה לא תקין");
  }

  const workspaceDoc = snapshot.docs[0];
  const workspace = workspaceDoc.data();

  if (workspace.inviteUsed) {
    throw new Error("קוד ההזמנה כבר שומש");
  }

  if (new Date() > workspace.inviteExpiry.toDate()) {
    throw new Error("קוד ההזמנה פג תוקף");
  }
  await updateDoc(workspaceDoc.ref, {
    members: [...workspace.members, userEmail],
    inviteUsed: true,
  });
  const userRef = doc(db, "users", userEmail);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    await updateDoc(userRef, {
      workspaceIds: [...userDoc.data().workspaceIds, workspaceDoc.id],
    });
  } else {
    await setDoc(userRef, {
      email: userEmail,
      workspaceIds: [workspaceDoc.id],
    });
  }

  return workspaceDoc.id;
}

async function deleteWorkspace(workspaceId, userEmail) {
  const transactionsRef = collection(
    db,
    "workspaces",
    workspaceId,
    "transactions",
  );
  const transactionsSnap = await getDocs(transactionsRef);
  for (const doc of transactionsSnap.docs) {
    await deleteDoc(doc.ref);
  }

  await deleteDoc(doc(db, "workspaces", workspaceId));

  const userRef = doc(db, "users", userEmail);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const workspaceIds = userDoc
      .data()
      .workspaceIds.filter((id) => id !== workspaceId);
    await updateDoc(userRef, { workspaceIds });
  }
}
module.exports = { createWorkspace, joinWorkspace, deleteWorkspace };
