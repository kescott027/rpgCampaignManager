import { useEffect, useState } from "react";
import { checkMissingSecrets } from "../utils/checkSecrets";

export function useStartupMessages(sessionName = "Untitled Session") {
  const [messages, setMessages] = useState([]);
  const [missingKeyNotice, setMissingKeyNotice] = useState(false);

  useEffect(() => {
    const defaultMsg = {
      role: "gpt",
      text: `rpgCampaignManager – session ${sessionName} – start chatting to begin.`
    };

    checkMissingSecrets().then((res) => {
      const startupMessages = [defaultMsg];

      if (res.anyMissing) {
        startupMessages.push({
          role: "gpt",
          text: `⚠️ Missing API Keys

rpgCampaignManager is an AI-powered and cloud-enabled campaign management tool.

This app requires API keys for:

- OpenAI: https://platform.openai.com/account/api-keys
- Google Cloud Drive: https://developers.google.com/drive/api/guides/authentication

To securely enter your keys, type: **configure security**`
        });
      }

      setMessages(startupMessages);
      setMissingKeyNotice(res.anyMissing);
    });
  }, [sessionName]);

  return { messages, setMessages, missingKeyNotice };
}
