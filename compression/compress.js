(function initCompression(ns) {
  const MAX_WORDS = 12;

  function toWords(text) {
    return text
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);
  }

  function truncateWords(text, maxWords = MAX_WORDS) {
    const words = toWords(text);
    if (words.length <= maxWords) {
      return words.join(" ");
    }
    return words.slice(0, maxWords).join(" ");
  }

  function extractCandidates(message) {
    const lines = message
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length ? lines : [message.trim()];
  }

  function localCompress(messages, maxItems = 7) {
    const userMessages = messages.filter((msg) => msg.role === "user");
    const assistantMessages = messages.filter((msg) => msg.role === "assistant");
    const ordered = [...userMessages, ...assistantMessages];
    const bullets = [];

    ordered.forEach((msg) => {
      const candidates = extractCandidates(msg.content);
      candidates.forEach((candidate) => {
        if (bullets.length >= maxItems) {
          return;
        }
        const trimmed = truncateWords(candidate, MAX_WORDS);
        if (!trimmed) {
          return;
        }
        bullets.push(trimmed);
      });
    });

    return bullets.slice(0, maxItems);
  }

  async function openAICompress(messages, settings) {
    const { apiKey, apiEndpoint, apiModel } = settings;
    if (!apiKey) {
      throw new Error("Missing API key");
    }

    const prompt = [
      "Compress the conversation into <=7 bullets.",
      "Rules:",
      "- Bullets only, no extra text.",
      "- Max 12 words per bullet.",
      "- Preserve user phrasing; do not add new ideas."
    ].join("\n");

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: messages
              .map((msg) => `[${msg.role}] ${msg.content}`)
              .join("\n")
          }
        ],
        max_tokens: 200,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const lines = content
      .split("\n")
      .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean);

    return lines.slice(0, 7).map((line) => truncateWords(line, MAX_WORDS));
  }

  ns.compression = {
    localCompress,
    openAICompress
  };
})(window.WorkingMemory || (window.WorkingMemory = {}));
