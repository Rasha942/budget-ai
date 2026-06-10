const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");

const {
  orchestrate,
  analyze,
  detectAnomaly,
  parseTransaction,
} = require("./services/agents.js");
const {
  getTransactions,
  deleteTransaction,
  saveTransaction,
  updateTransaction,
} = require("./services/Transactions.js");
const { verifyToken } = require("./services/authMiddleware");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();
const { admin } = require("./services/firebaseAdmin");
const { db } = require("./services/firebase");
const { doc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");
const {
  createWorkspace,
  joinWorkspace,
  deleteWorkspace,
  generateInviteCode,
} = require("./services/workspace");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchPlaceholder() {
  const topics = [
    "אוכל",
    "תחבורה",
    "קניות",
    "בידור",
    "חשבונות",
    "בריאות",
    "ביגוד",
    "מסעדות",
    "נסיעות",
    "ספורט",
    "טכנולוגיה",
  ];
  const styles = [
    "שאלה מצחיקה",
    "טיפ פיננסי קצר",
    "משפט מוטיבציה על חיסכון",
    "שאלה ישירה",
    "אמירה סרקסטית על כסף",
  ];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Write a single Hebrew placeholder for a budget app input field.
      Topic: ${randomTopic}
      Style: ${randomStyle}
      Max 8 words. Return only the text, no explanation.`,
      },
    ],
  });
  return response.content[0].text.trim();
}

app.get("/placeholder", async (req, res) => {
  try {
    const placeholder = await fetchPlaceholder();
    res.json({ placeholder });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch placeholder" });
  }
});

app.post("/transaction", verifyToken, async (req, res) => {
  try {
    const { text, workspaceId } = req.body;
    const userEmail = req.user.email;

    const transactions = await getTransactions(workspaceId);

    const decision = await orchestrate(text, transactions);

    if (decision.action === "answer") {
      const answer = await analyze(text, transactions);
      return res.json({ type: "answer", message: answer });
    }

    const transaction = await parseTransaction(text);
    await saveTransaction(transaction, workspaceId, userEmail);

    const anomaly = await detectAnomaly(transaction, transactions);

    res.json({
      type: "saved",
      transaction,
      anomaly: anomaly || null,
    });
  } catch (error) {
    console.error("Transaction error:", error.message);
    res.status(500).json({ error: "Failed to process input" });
  }
});

app.get("/summary", verifyToken, async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const transactions = await getTransactions(workspaceId);
    const summary = {};
    transactions.forEach((t) => {
      if (!summary[t.category]) summary[t.category] = 0;
      summary[t.category] += t.amount;
    });
    const total = Object.values(summary).reduce((sum, val) => sum + val, 0);
    res.json({ summary, total });
  } catch (error) {
    console.error("Summary error:", error.message);
    res.status(500).json({ error: "Failed to get summary" });
  }
});

app.post("/auth/signin", async (req, res) => {
  try {
    const { idToken } = req.body;

    const firebaseToken = await admin
      .auth()
      .verifyIdToken(idToken)
      .catch(async () => {
        const userResponse = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`,
        );
        const userInfo = await userResponse.json();

        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUserByEmail(userInfo.email);
        } catch {
          firebaseUser = await admin.auth().createUser({
            email: userInfo.email,
            displayName: userInfo.name,
          });
        }
        return {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          uid: firebaseUser.uid,
        };
      });

    const email = firebaseToken.email;
    const name =
      firebaseToken.name || firebaseToken.displayName || email.split("@")[0];

    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);

    let workspaceIds = [];
    let workspaceId;
    let isNewUser = false;
    if (userDoc.exists()) {
      workspaceId = userDoc.data().workspaceIds[0];
      workspaceIds = userDoc.data().workspaceIds;
    } else {
      isNewUser = true;
    }

    res.json({ user: { email, name }, workspaceId, workspaceIds, isNewUser });
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ error: "Authentication failed" });
  }
});

app.post("/workspace/create", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userEmail = req.user.email;
    const userName = req.user.name || userEmail;
    const workspaceId = await createWorkspace(userEmail, userName, name);
    res.json({ workspaceId });
  } catch (error) {
    console.error("Create workspace error:", error.message);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

app.post("/workspace/join", verifyToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userEmail = req.user.email;
    const workspaceId = await joinWorkspace(userEmail, inviteCode);
    res.json({ workspaceId });
  } catch (error) {
    console.error("Join workspace error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/transactions", verifyToken, async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const transactions = await getTransactions(workspaceId);
    res.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error.message);
    res.status(500).json({ error: "Failed to get transactions" });
  }
});

app.delete("/transaction/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { workspaceId } = req.query;
    await deleteTransaction(workspaceId, id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete transaction error:", error.message);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

app.put("/transaction/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const { workspaceId } = req.query;
    await updateTransaction(workspaceId, id, update);
    res.json({ success: true });
  } catch (error) {
    console.error("Update transaction error", error.message);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});
app.get("/workspace/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    let workspaceDoc = await getDoc(doc(db, "workspaces", id));
    if (!workspaceDoc.exists()) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    let data = workspaceDoc.data();
    const expiryDate = data.inviteExpiry?.toDate
      ? data.inviteExpiry.toDate()
      : new Date(data.inviteExpiry);
    const isExpired = new Date() > expiryDate;
    if (isExpired) {
      await updateDoc(doc(db, "workspaces", id), {
        inviteCode: generateInviteCode(),
        inviteExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      workspaceDoc = await getDoc(doc(db, "workspaces", id));
      data = workspaceDoc.data();
    }
    res.json({
      id: workspaceDoc.id,
      ...data,
      inviteExpiry: data.inviteExpiry?.toDate
        ? data.inviteExpiry.toDate().toISOString()
        : data.inviteExpiry,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    });
  } catch (error) {
    console.error("Get workspace error:", error.message);
    res.status(500).json({ error: "Failed to get workspace" });
  }
});

app.put("/workspace/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { updateDoc } = require("firebase/firestore");
    await updateDoc(doc(db, "workspaces", id), { name });
    res.json({ success: true });
  } catch (error) {
    console.error("Update workspace error:", error.message);
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

app.delete("/workspace/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    await deleteWorkspace(id, userEmail);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete workspace error:", error.message);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});

app.post("/export", verifyToken, async (req, res) => {
  try {
    const { transactions, fromDate, toDate } = req.body;

    const workbook = new ExcelJS.Workbook();

    const transSheet = workbook.addWorksheet("עסקאות");
    transSheet.addRow([
      "תאריך",
      "תיאור",
      "קטגוריה",
      "סכום",
      "מטבע",
      "נוסף על ידי",
    ]);

    transactions.forEach((t) => {
      transSheet.addRow([
        t.date,
        t.description,
        t.category,
        t.amount,
        t.currency,
        t.addedBy,
      ]);
    });
    const summarySheet = workbook.addWorksheet("סיכום");
    summarySheet.addRow(["קטגוריה", "סכום"]);

    const summary = transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += Number(t.amount);
      return acc;
    }, {});

    Object.entries(summary).forEach(([category, amount]) => {
      summarySheet.addRow([category, amount]);
    });

    const total = Object.values(summary).reduce((sum, val) => sum + val, 0);
    summarySheet.addRow(["סה״כ", total]);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=budget-${fromDate}-${toDate}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export error:", error.message);
    res.status(500).json({ error: "Failed to export" });
  }
});

app.delete("/user", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const { workspaceIds } = userDoc.data();
      // delete each workspace and its transactions
      for (const workspaceId of workspaceIds) {
        await deleteWorkspace(workspaceId, userEmail);
      }
      await deleteDoc(userRef);
    }
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().deleteUser(user.uid);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
