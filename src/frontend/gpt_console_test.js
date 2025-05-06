// gpt_console_test.js (Node 18+ version, using built-in fetch)
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Load API key from .security/openai.env
const envPath = path.resolve(__dirname, "../../.security/openai.env");
if (!fs.existsSync(envPath)) {
  console.error("❌ Missing .security/openai.env");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyLine = envContent.split("\n").find(line => line.startsWith("OPENAI_API_KEY="));
const apiKey = apiKeyLine?.split("=")[1];

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY not found in .security/openai.env");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function sendToGPT(prompt) {
  const body = {
    model: "gpt-4",
    messages: [
      { role: "user", content: prompt }
    ]
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.choices && data.choices[0]) {
      console.log("\n🤖 GPT:", data.choices[0].message.content);
    } else {
      console.error("\n⚠️ Unexpected GPT response:", data);
    }
  } catch (err) {
    console.error("❌ Error calling OpenAI:", err);
  }
}

function promptLoop() {
  rl.question("\n> ", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    await sendToGPT(input);
    promptLoop();
  });
}

console.log("📣 GPT Console Started — type \"exit\" to quit");
promptLoop();
