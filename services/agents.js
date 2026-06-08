const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function orchestrate(userInput, transactions) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    system: `You are an orchestrator for a Hebrew budget app. 
Decide what the user wants based on their input.
Return ONLY a JSON object, no explanation.

If the input looks like a transaction (amount + item) return:
{"action": "save"}

If the input is a question about spending return:
{"action": "answer"}

Examples:
"קפה 45 שקל" → {"action": "save"}
"כמה הוצאתי על אוכל?" → {"action": "answer"}
"סופר 200" → {"action": "save"}
"מה ההוצאה הכי גדולה שלי?" → {"action": "answer"}`,
    messages: [
      {
        role: "user",
        content: `transaction history:${JSON.stringify(transactions, null, 2)} 
        
        
        User question:${userInput}`,
      },
    ],
  });

  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function parseTransaction(userInput) {
  const today = new Date().toISOString().split("T")[0];
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Extract transaction details from this text and return ONLY a JSON object, nothing else, no explanation:

"${userInput}"

Today's date is ${today}. Use this as the date unless the user specifies otherwise.

Return this exact format:
{
  "amount": 42,
  "currency": "ILS",
  "category": "Food",
  "description": "Coffee and sandwich",
  "date": "dd-mm-yyyy"
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

async function analyze(userInput, transactions) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: `You are a personal finance analyst for a Hebrew budget app.
You have access to the user's transaction history.
Answer questions about their spending in Hebrew.
Be concise, friendly, and specific with numbers.
Always mention exact amounts in ₪.`,
    messages: [
      {
        role: "user",
        content: `Transaction history:
${JSON.stringify(transactions, null, 2)}

User question: ${userInput}`,
      },
    ],
  });

  return response.content[0].text.trim();
}

async function detectAnomaly(transaction, transactions) {
  if (transactions.length < 5) return null;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 150,
    system: `You are an anomaly detector for a Hebrew budget app.
Compare a new transaction to the user's history.
If the transaction is unusual or much higher than normal for that category, return a warning in Hebrew.
If it's normal, return null.
Return ONLY a JSON object:
{"anomaly": true, "message": "warning in Hebrew"} or {"anomaly": false}`,
    messages: [
      {
        role: "user",
        content: `New transaction: ${JSON.stringify(transaction)}
      
Transaction history: ${JSON.stringify(transactions, null, 2)}`,
      },
    ],
  });

  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, "").trim();
  const result = JSON.parse(clean);
  return result.anomaly ? result.message : null;
}

module.exports = { orchestrate, analyze, detectAnomaly, parseTransaction };
