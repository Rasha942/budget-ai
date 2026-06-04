const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function parseTransaction(userInput) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Extract transaction details from this text and return ONLY a JSON object, nothing else, no explanation:

"${userInput}"

Return this exact format:
{
  "amount": 42,
  "currency": "ILS",
  "category": "Food",
  "description": "Coffee and sandwich",
  "date": "2026-06-03"
}

Categories: אוכל, תחבורה, קניות, חשבונות, בריאות (רפואי בלבד), קוסמטיקה, בידור (סרטים, משחקי וידאו וכו'), אחר
If none of these fit, invent an appropriate category name in Hebrew.`,
      },
    ],
  });
  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, "").trim();
  const transaction = JSON.parse(clean);
  return transaction;
}

module.exports = { parseTransaction };
