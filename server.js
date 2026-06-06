const express = require("express");
const cors = require("cors");
const { parseTransaction } = require("./services/parseTransaction");
const { saveTransaction } = require("./services/saveTransaction");
const { getTransactions } = require("./services/getTransactions");
const { verifyToken } = require("./services/authMiddleware");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();
const { admin } = require("./services/firebaseAdmin");
const { db } = require("./services/firebase");
const { doc, getDoc, setDoc } = require("firebase/firestore");
const { createWorkspace } = require("./services/workspace");

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
    const transaction = await parseTransaction(text);
    await saveTransaction(transaction, workspaceId, userEmail);
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to save transaction" });
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

const PORT = process.env.PORT || 3000;
app.post("/auth/signin", async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);

    let workspaceId;

    if (userDoc.exists()) {
      workspaceId = userDoc.data().workspaceIds[0];
    } else {
      workspaceId = await createWorkspace(email, name, `${name}'s Budget`);
    }

    res.json({
      user: { email, name },
      workspaceId,
    });
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ error: "Authentication failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
