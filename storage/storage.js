(function initStorage(ns) {
  const DEFAULT_STATE = {
    nowStack: [],
    vault: [],
    settings: {
      checkpointMessageCount: 10,
      promptInjectionEnabled: false,
      useApiCompression: false,
      apiKey: "",
      apiEndpoint: "https://api.openai.com/v1/chat/completions",
      apiModel: "gpt-4o-mini"
    }
  };

  function getStorage() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return chrome.storage.local;
    }
    return null;
  }

  function loadState() {
    const storage = getStorage();
    if (!storage) {
      const raw = localStorage.getItem("wm_state");
      return Promise.resolve(raw ? JSON.parse(raw) : { ...DEFAULT_STATE });
    }

    return new Promise((resolve) => {
      storage.get(["wm_state"], (result) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          resolve({ ...DEFAULT_STATE });
          return;
        }
        resolve(result.wm_state ? result.wm_state : { ...DEFAULT_STATE });
      });
    });
  }

  function saveState(state) {
    const storage = getStorage();
    if (!storage) {
      localStorage.setItem("wm_state", JSON.stringify(state));
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      storage.set({ wm_state: state }, () => resolve());
    });
  }

  async function updateState(partial) {
    const current = await loadState();
    const next = {
      ...current,
      ...partial,
      settings: {
        ...current.settings,
        ...(partial.settings || {})
      }
    };
    await saveState(next);
    return next;
  }

  ns.storage = {
    DEFAULT_STATE,
    loadState,
    saveState,
    updateState
  };
})(window.WorkingMemory || (window.WorkingMemory = {}));
