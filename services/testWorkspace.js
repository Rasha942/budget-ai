const { createWorkspace } = require("./workspace");

createWorkspace("test@gmail.com", "Test User", "Test Workspace")
  .then((id) => console.log("Workspace created:", id))
  .catch((err) => console.error("Error:", err.message));
