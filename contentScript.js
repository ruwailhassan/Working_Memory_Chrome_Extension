(function initWorkingMemoryApp(ns) {
  const { storage, compression, ui } = ns;
  if (!storage || !compression || !ui) {
    return;
  }

  const state = {
    nowStack: [],
    vault: [],
    settings: {}
  };

  const panel = ui.buildPanel();
  document.body.append(panel.container);

  function ensureMaxItems(items) {
    return items.slice(0, ui.MAX_ITEMS);
  }

  function syncUI() {
    ui.renderStack(panel.elements.stackList, state.nowStack, handleUpdateItem);
    ui.renderVault(panel.elements.vaultList, state.vault, handleRestoreVault);
    panel.elements.checkpointCountInput.value = state.settings.checkpointMessageCount;
    panel.elements.promptToggleInput.checked = state.settings.promptInjectionEnabled;
    panel.elements.apiToggleInput.checked = state.settings.useApiCompression;
    panel.elements.apiKeyInput.value = state.settings.apiKey;
    panel.elements.apiModelInput.value = state.settings.apiModel;
    panel.elements.apiEndpointInput.value = state.settings.apiEndpoint;
  }

  async function persistState(partial) {
    const updated = await storage.updateState(partial);
    state.nowStack = updated.nowStack;
    state.vault = updated.vault;
    state.settings = updated.settings;
    syncUI();
  }

  function handleUpdateItem(index, changes) {
    const updated = [...state.nowStack];
    if (changes.delete) {
      updated.splice(index, 1);
    } else {
      updated[index] = {
        ...updated[index],
        ...changes
      };
    }
    persistState({ nowStack: ensureMaxItems(updated) });
  }

  function handleRestoreVault(index) {
    const entry = state.vault[index];
    if (!entry) return;
    persistState({ nowStack: ensureMaxItems(entry.items) });
  }

  function collectMessages(limit) {
    const elements = Array.from(
      document.querySelectorAll('[data-message-author-role="user"], [data-message-author-role="assistant"]')
    );
    const messages = elements
      .map((el) => ({
        role: el.getAttribute("data-message-author-role"),
        content: el.innerText.trim()
      }))
      .filter((msg) => msg.content);

    return messages.slice(Math.max(messages.length - limit, 0));
  }

  function buildPromptInjectionText() {
    if (!state.nowStack.length) {
      return "";
    }
    const bullets = state.nowStack.map((item) => `- ${item.text}`).join("\n");
    return [
      "Working Memory:",
      bullets,
      "Instructions:",
      "- Respond in max 5 bullets",
      "- Preserve my working memory",
      "- Ask before explaining"
    ].join("\n");
  }

  function findTextarea() {
    return (
      document.querySelector("textarea") ||
      document.querySelector("[contenteditable='true']")
    );
  }

  function injectPromptIfNeeded() {
    if (!state.settings.promptInjectionEnabled) {
      return;
    }
    const textarea = findTextarea();
    if (!textarea) return;

    const injection = buildPromptInjectionText();
    if (!injection) return;

    const current = textarea.value || textarea.textContent || "";
    if (current.startsWith("Working Memory:")) {
      return;
    }
    const updated = `${injection}\n\n${current}`;

    if (typeof textarea.value !== "undefined") {
      textarea.value = updated;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      textarea.textContent = updated;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  async function handleCheckpoint() {
    const messages = collectMessages(state.settings.checkpointMessageCount);
    if (!messages.length) {
      return;
    }

    let bullets = [];
    if (state.settings.useApiCompression && state.settings.apiKey) {
      try {
        bullets = await compression.openAICompress(messages, state.settings);
      } catch (error) {
        bullets = compression.localCompress(messages, ui.MAX_ITEMS);
      }
    } else {
      bullets = compression.localCompress(messages, ui.MAX_ITEMS);
    }

    const items = bullets.map((text) => ({ text, pinned: false, protected: false }));
    persistState({ nowStack: ensureMaxItems(items) });
  }

  async function handleArchive() {
    if (!state.nowStack.length) return;
    const vault = [
      { timestamp: Date.now(), items: state.nowStack },
      ...state.vault
    ];
    persistState({ vault });
  }

  async function handleCopyPrompt() {
    const prompt = buildPromptInjectionText();
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
  }

  function handleAddItem() {
    if (state.nowStack.length >= ui.MAX_ITEMS) return;
    const updated = [...state.nowStack, { text: "", pinned: false, protected: false }];
    persistState({ nowStack: updated });
  }

  function attachListeners() {
    panel.elements.checkpointBtn.addEventListener("click", handleCheckpoint);
    panel.elements.archiveBtn.addEventListener("click", handleArchive);
    panel.elements.copyBtn.addEventListener("click", handleCopyPrompt);
    panel.elements.addItemBtn.addEventListener("click", handleAddItem);

    panel.elements.checkpointCountInput.addEventListener("change", (event) => {
      const value = Math.max(2, Math.min(50, Number(event.target.value)));
      persistState({ settings: { checkpointMessageCount: value } });
    });

    panel.elements.promptToggleInput.addEventListener("change", (event) => {
      persistState({ settings: { promptInjectionEnabled: event.target.checked } });
    });

    panel.elements.apiToggleInput.addEventListener("change", (event) => {
      persistState({ settings: { useApiCompression: event.target.checked } });
    });

    panel.elements.apiKeyInput.addEventListener("change", (event) => {
      persistState({ settings: { apiKey: event.target.value.trim() } });
    });

    panel.elements.apiModelInput.addEventListener("change", (event) => {
      persistState({ settings: { apiModel: event.target.value.trim() } });
    });

    panel.elements.apiEndpointInput.addEventListener("change", (event) => {
      persistState({ settings: { apiEndpoint: event.target.value.trim() } });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        injectPromptIfNeeded();
      }
    }, true);

    document.addEventListener("submit", () => {
      injectPromptIfNeeded();
    }, true);
  }

  storage.loadState().then((loaded) => {
    state.nowStack = ensureMaxItems(loaded.nowStack || []);
    state.vault = loaded.vault || [];
    state.settings = { ...storage.DEFAULT_STATE.settings, ...(loaded.settings || {}) };
    syncUI();
  });

  attachListeners();
})(window.WorkingMemory || (window.WorkingMemory = {}));
