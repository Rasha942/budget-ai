const express = require("express");
const cors = require("cors");
const { parseTransaction } = require("./services/parseTransaction");
const { saveTransaction } = require("./services/saveTransaction");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchPlaceholder() {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Generate a single short placeholder text for a budget app input field. 
      It can be a funny one-liner, a finance tip, or a casual question about spending.
      Write it in Hebrew. Max 8 words. Return only the text, nothing else.`,
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
app.post("/transaction", async (req, res) => {
  try {
    const { text } = req.body;
    const transaction = await parseTransaction(text);
    await saveTransaction(transaction);
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to save transaction" });
  }
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
