const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function test() {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [{ role: "user", content: "Say hello!" }],
  });

  console.log(response.content[0].text);
}

test();
