const { parseTransaction } = require("./parseTransaction");
const { saveTransaction } = require("./saveTransaction");

async function test() {
  const input = "קפה ושוקולד 42 שקל";

  console.log("parsing transaction...");
  const transaction = await parseTransaction(input);
  console.log("parsed:", transaction);

  console.log("saving to sheet...");
  await saveTransaction(transaction);
  console.log("saved!");
}

test();
