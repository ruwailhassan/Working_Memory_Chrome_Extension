(function initUI(ns) {
  const MAX_ITEMS = 7;

  function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function buildPanel() {
    const container = document.createElement("div");
    container.id = "wm-root";
    const shadow = container.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        height: 100vh;
        background: #0f172a;
        color: #e2e8f0;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        z-index: 2147483647;
        border-left: 1px solid #1e293b;
        display: flex;
        flex-direction: column;
      }
      .header {
        padding: 16px;
        border-bottom: 1px solid #1e293b;
        font-size: 16px;
        font-weight: 600;
      }
      .section {
        padding: 12px 16px;
        border-bottom: 1px solid #1e293b;
      }
      .section h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #94a3b8;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .item {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        background: #1e293b;
        padding: 8px;
        border-radius: 8px;
      }
      .bullet {
        margin-top: 4px;
      }
      .text {
        flex: 1;
        min-height: 20px;
        outline: none;
        font-size: 13px;
        line-height: 1.3;
      }
      .controls {
        display: flex;
        gap: 4px;
      }
      .icon-btn {
        border: 1px solid #334155;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 6px;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 11px;
      }
      .icon-btn.active {
        background: #2563eb;
        border-color: #2563eb;
      }
      .button-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      button.primary {
        flex: 1;
        border: none;
        background: #38bdf8;
        color: #0f172a;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      }
      button.secondary {
        flex: 1;
        border: 1px solid #334155;
        background: transparent;
        color: #e2e8f0;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
      }
      .toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 12px;
      }
      input[type="number"], input[type="text"], input[type="password"] {
        width: 100%;
        background: #0f172a;
        border: 1px solid #334155;
        color: #e2e8f0;
        padding: 6px;
        border-radius: 6px;
        font-size: 12px;
      }
      .vault-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 160px;
        overflow-y: auto;
      }
      .vault-item {
        background: #1e293b;
        padding: 6px;
        border-radius: 6px;
        font-size: 11px;
        display: flex;
        justify-content: space-between;
        gap: 6px;
      }
      .vault-item button {
        font-size: 10px;
      }
      .notice {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 4px;
      }
      .footer {
        margin-top: auto;
        padding: 8px 16px 16px;
        font-size: 10px;
        color: #94a3b8;
      }
    `;

    const panel = createElement("div", "panel");
    const header = createElement("div", "header", "Working Memory");
    const stackSection = createElement("div", "section");
    const stackTitle = createElement("h4", null, "Now Stack");
    const stackList = createElement("div", "stack");
    const addItemBtn = createElement("button", "secondary", "+ Add item");

    const actionSection = createElement("div", "section");
    const actionTitle = createElement("h4", null, "Actions");
    const buttonRow = createElement("div", "button-row");
    const checkpointBtn = createElement("button", "primary", "Checkpoint");
    const archiveBtn = createElement("button", "secondary", "Archive");
    const copyBtn = createElement("button", "secondary", "Copy as Prompt");

    const settingsSection = createElement("div", "section");
    const settingsTitle = createElement("h4", null, "Settings");
    const checkpointCountLabel = createElement("label", "toggle");
    const checkpointCountText = createElement("span", null, "Messages to scan");
    const checkpointCountInput = document.createElement("input");
    checkpointCountInput.type = "number";
    checkpointCountInput.min = "2";
    checkpointCountInput.max = "50";

    const promptToggleLabel = createElement("label", "toggle");
    const promptToggleText = createElement("span", null, "Prompt injection");
    const promptToggleInput = document.createElement("input");
    promptToggleInput.type = "checkbox";

    const apiToggleLabel = createElement("label", "toggle");
    const apiToggleText = createElement("span", null, "Use API compression");
    const apiToggleInput = document.createElement("input");
    apiToggleInput.type = "checkbox";

    const apiKeyInput = document.createElement("input");
    apiKeyInput.type = "password";
    apiKeyInput.placeholder = "OpenAI API key";

    const apiModelInput = document.createElement("input");
    apiModelInput.type = "text";
    apiModelInput.placeholder = "Model (e.g. gpt-4o-mini)";

    const apiEndpointInput = document.createElement("input");
    apiEndpointInput.type = "text";
    apiEndpointInput.placeholder = "API endpoint";

    const apiNotice = createElement("div", "notice", "If API fails, local compression is used.");

    const vaultSection = createElement("div", "section");
    const vaultTitle = createElement("h4", null, "Vault");
    const vaultList = createElement("div", "vault-list");

    const footer = createElement("div", "footer", "Stored locally in your browser.");

    stackSection.append(stackTitle, stackList, addItemBtn);
    buttonRow.append(checkpointBtn, archiveBtn, copyBtn);
    actionSection.append(actionTitle, buttonRow);

    checkpointCountLabel.append(checkpointCountText, checkpointCountInput);
    promptToggleLabel.append(promptToggleText, promptToggleInput);
    apiToggleLabel.append(apiToggleText, apiToggleInput);

    settingsSection.append(
      settingsTitle,
      checkpointCountLabel,
      promptToggleLabel,
      apiToggleLabel,
      apiKeyInput,
      apiModelInput,
      apiEndpointInput,
      apiNotice
    );

    vaultSection.append(vaultTitle, vaultList);

    panel.append(header, stackSection, actionSection, settingsSection, vaultSection, footer);
    shadow.append(style, panel);

    return {
      container,
      shadow,
      elements: {
        stackList,
        addItemBtn,
        checkpointBtn,
        archiveBtn,
        copyBtn,
        checkpointCountInput,
        promptToggleInput,
        apiToggleInput,
        apiKeyInput,
        apiModelInput,
        apiEndpointInput,
        vaultList
      }
    };
  }

  function renderStack(stackList, items, onUpdate) {
    stackList.innerHTML = "";
    items.forEach((item, index) => {
      const row = createElement("div", "item");
      const bullet = createElement("div", "bullet", "•");
      const text = createElement("div", "text");
      text.contentEditable = "true";
      text.textContent = item.text;
      text.addEventListener("blur", () => {
        onUpdate(index, { text: text.textContent.trim() });
      });

      const controls = createElement("div", "controls");
      const pinBtn = createElement("button", "icon-btn", "Pin");
      if (item.pinned) pinBtn.classList.add("active");
      pinBtn.addEventListener("click", () => {
        onUpdate(index, { pinned: !item.pinned });
      });

      const protectBtn = createElement("button", "icon-btn", "Protect");
      if (item.protected) protectBtn.classList.add("active");
      protectBtn.addEventListener("click", () => {
        onUpdate(index, { protected: !item.protected });
      });

      const deleteBtn = createElement("button", "icon-btn", "X");
      deleteBtn.addEventListener("click", () => {
        onUpdate(index, { delete: true });
      });

      controls.append(pinBtn, protectBtn, deleteBtn);
      row.append(bullet, text, controls);
      stackList.append(row);
    });
  }

  function renderVault(vaultList, vault, onRestore) {
    vaultList.innerHTML = "";
    vault.forEach((entry, index) => {
      const item = createElement("div", "vault-item");
      const label = createElement(
        "div",
        null,
        `${new Date(entry.timestamp).toLocaleString()} (${entry.items.length})`
      );
      const restoreBtn = createElement("button", "icon-btn", "Restore");
      restoreBtn.addEventListener("click", () => onRestore(index));
      item.append(label, restoreBtn);
      vaultList.append(item);
    });
  }

  ns.ui = {
    MAX_ITEMS,
    buildPanel,
    renderStack,
    renderVault
  };
})(window.WorkingMemory || (window.WorkingMemory = {}));
