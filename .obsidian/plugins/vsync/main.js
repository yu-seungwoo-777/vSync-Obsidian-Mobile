"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => VSyncPlugin
});
module.exports = __toCommonJS(index_exports);
var import_obsidian4 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  serverUrl: "",
  vaultId: "",
  apiKey: "",
  autoSync: true,
  skippedPaths: [],
  currentVersion: "",
  downloadUrl: ""
};

// src/settings-tab.ts
var import_obsidian2 = require("obsidian");

// src/connection-modal.ts
var import_obsidian = require("obsidian");
var ConnectionModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onClose) {
    super(app);
    this.plugin = plugin;
    this.onCloseCallback = onClose;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    contentEl.empty();
    titleEl.setText("\uBCFC\uD2B8 \uC5F0\uACB0 \uC124\uC815");
    const serverUrl = { value: this.plugin.settings.serverUrl || "" };
    const vaultId = { value: this.plugin.settings.vaultId || "" };
    const apiKey = { value: this.plugin.settings.apiKey || "" };
    new import_obsidian.Setting(contentEl).setName("Server URL").setDesc("Vector server URL (\uC608: http://localhost:3000)").addText((text) => text.setPlaceholder("http://localhost:3000").setValue(serverUrl.value).onChange((value) => {
      serverUrl.value = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Vault ID").setDesc("Vector \uC11C\uBC84\uC5D0\uC11C \uBC1C\uAE09\uBC1B\uC740 Vault ID").addText((text) => text.setPlaceholder("Enter vault ID").setValue(vaultId.value).onChange((value) => {
      vaultId.value = value;
    }));
    new import_obsidian.Setting(contentEl).setName("API Key").setDesc("\uC778\uC99D\uC6A9 API Key").addText((text) => {
      text.setPlaceholder("Enter API key").setValue(apiKey.value).onChange((value) => {
        apiKey.value = value;
      });
      text.inputEl.type = "password";
    });
    new import_obsidian.Setting(contentEl).addButton((btn) => btn.setButtonText("\uC784\uC2DC\uC800\uC7A5").onClick(async () => {
      try {
        this.plugin.settings.serverUrl = serverUrl.value;
        this.plugin.settings.vaultId = vaultId.value;
        this.plugin.settings.apiKey = apiKey.value;
        await this.plugin.saveSettings();
        new import_obsidian.Notice("\uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      } catch (error) {
        new import_obsidian.Notice(`\uC800\uC7A5 \uC2E4\uD328: ${error.message}`);
      }
    })).addButton((btn) => btn.setButtonText("\uC5F0\uACB0").setClass("mod-cta").onClick(async () => {
      btn.setButtonText("\uC5F0\uACB0 \uC911...");
      btn.setDisabled(true);
      const validation = this.validateServerUrl(serverUrl.value);
      if (!validation.valid) {
        new import_obsidian.Notice(`\uC5F0\uACB0 \uC2E4\uD328: ${validation.error}`);
        btn.setButtonText("\uC5F0\uACB0");
        btn.setDisabled(false);
        return;
      }
      const success = await this.checkAuth(serverUrl.value, vaultId.value, apiKey.value);
      if (success) {
        this.plugin.settings.serverUrl = serverUrl.value;
        this.plugin.settings.vaultId = vaultId.value;
        this.plugin.settings.apiKey = apiKey.value;
        await this.plugin.saveSettings();
        new import_obsidian.Notice("\uC5F0\uACB0 \uC131\uACF5");
        this.close();
      } else {
        btn.setButtonText("\uC5F0\uACB0");
        btn.setDisabled(false);
      }
    })).addButton((btn) => btn.setButtonText("\uC5F0\uACB0\uD574\uC81C").onClick(() => {
      if (this.plugin.syncService) {
        this.plugin.cleanup();
        new import_obsidian.Notice("\uC5F0\uACB0\uC774 \uD574\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      }
      this.close();
    }));
  }
  onClose() {
    this.contentEl.empty();
    this.onCloseCallback?.();
  }
  /**
   * @MX:WARN: [AUTO] SSRF 방지 URL 검증
   * @MX:REASON: 사용자 입력 URL 검증으로 사설 IP 및 비HTTPS 차단
   */
  validateServerUrl(url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return { valid: false, error: "HTTP \uB610\uB294 HTTPS \uD504\uB85C\uD1A0\uCF5C\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4" };
      }
      const hostname = parsed.hostname;
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
      if (parsed.protocol === "http:" && !isLocalhost) {
        return { valid: false, error: "HTTPS\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4 (localhost\uB294 HTTP \uD5C8\uC6A9)" };
      }
      const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.)/;
      if (privateIpPattern.test(hostname) && !isLocalhost) {
        return { valid: false, error: "\uC0AC\uC124 IP \uC8FC\uC18C\uB294 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 URL \uD615\uC2DD\uC785\uB2C8\uB2E4" };
    }
  }
  async checkAuth(serverUrl, vaultId, apiKey) {
    if (!serverUrl) {
      new import_obsidian.Notice("Server URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694");
      return false;
    }
    if (!vaultId || !apiKey) {
      new import_obsidian.Notice("Vault ID\uC640 API Key\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694");
      return false;
    }
    try {
      const response = await fetch(`${serverUrl}/v1/vault/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify({ vaultId, apiKey })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error("[Auth Check Error]", error);
      new import_obsidian.Notice(`\uC778\uC99D \uC2E4\uD328: ${error.message}`);
      return false;
    }
  }
};

// src/settings-tab.ts
var VSyncSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    this.renderConnectionSection(containerEl);
    this.renderSyncControlSection(containerEl);
    this.renderAutoSyncSection(containerEl);
    this.renderSkippedPathsSection(containerEl);
    this.renderDownloadSection(containerEl);
  }
  isConnected() {
    return !!this.plugin.syncService;
  }
  renderConnectionSection(containerEl) {
    const connected = this.isConnected();
    const serverUrl = this.plugin.settings.serverUrl;
    new import_obsidian2.Setting(containerEl).setName("\uBCFC\uD2B8 \uC5F0\uACB0").setDesc(
      connected ? `\uC5F0\uACB0\uB428 - ${serverUrl}` : serverUrl ? `\uC5F0\uACB0 \uC548 \uB428 - ${serverUrl}` : "\uC5F0\uACB0 \uC548 \uB428"
    ).addButton((button) => {
      if (connected) {
        button.setButtonText("\uC5F0\uACB0\uB428").setClass("mod-cta");
      } else {
        button.setButtonText("\uC5F0\uACB0 \uC124\uC815");
      }
      button.onClick(() => {
        new ConnectionModal(this.app, this.plugin, () => this.display()).open();
      });
    });
  }
  /**
  * @MX:WARN: [AUTO] 동기화 시작/중지 - cleanup/initializeSync 직접 호출
  * @MX:REASON: syncService 라이프사이클 관리로 인해 부작용 가능
  */
  renderSyncControlSection(containerEl) {
    new import_obsidian2.Setting(containerEl).setName("\uB3D9\uAE30\uD654 \uC81C\uC5B4").setDesc("\uB3D9\uAE30\uD654 \uC2DC\uC791/\uC911\uC9C0").addButton((button) => {
      if (this.plugin.syncService) {
        button.setButtonText("\uB3D9\uAE30\uD654 \uC911\uC9C0");
      } else {
        button.setButtonText("\uB3D9\uAE30\uD654 \uC2DC\uC791");
      }
      button.setDisabled(!this.isConnected());
      button.onClick(async () => {
        if (this.plugin.syncService) {
          this.plugin.cleanup();
        } else {
          this.plugin.initializeSync();
        }
        this.display();
      });
    });
  }
  renderAutoSyncSection(containerEl) {
    new import_obsidian2.Setting(containerEl).setName("Auto Sync").setDesc("Automatically sync file changes").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoSync).onChange(async (value) => {
      this.plugin.settings.autoSync = value;
      await this.plugin.saveSettings();
    }));
  }
  renderSkippedPathsSection(containerEl) {
    new import_obsidian2.Setting(containerEl).setName("Skipped Paths").setDesc("Paths to skip during sync (one per line)").addTextArea((text) => text.setPlaceholder(".obsidian\n.trash").setValue(this.plugin.settings.skippedPaths.join("\n")).onChange(async (value) => {
      this.plugin.settings.skippedPaths = value.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
      await this.plugin.saveSettings();
    }));
  }
  renderDownloadSection(containerEl) {
    const downloadUrlInput = { value: this.plugin.settings.downloadUrl || "" };
    let downloadButton = null;
    new import_obsidian2.Setting(containerEl).setName("\uD50C\uB7EC\uADF8\uC778 \uC5C5\uB370\uC774\uD2B8").setDesc("v" + (this.plugin.settings.currentVersion || this.plugin.manifest.version)).addText((text) => text.setPlaceholder("https://example.com/main.js").setValue(downloadUrlInput.value).onChange(async (value) => {
      downloadUrlInput.value = value;
      this.plugin.settings.downloadUrl = value;
      await this.plugin.saveSettings();
      downloadButton?.setDisabled(!value);
    })).addButton((button) => {
      downloadButton = button;
      button.setButtonText("\uB2E4\uC6B4\uB85C\uB4DC").setDisabled(!downloadUrlInput.value).setClass("mod-cta").onClick(async () => {
        if (!downloadUrlInput.value) return;
        button.setButtonText("\uB2E4\uC6B4\uB85C\uB4DC \uC911...");
        button.setDisabled(true);
        try {
          const baseUrl = downloadUrlInput.value.replace(/\/+$/, "");
          const ts = Date.now();
          const files = [
            { url: `${baseUrl}/public/v1/plugin/main.js?_t=${ts}`, name: "main.js" },
            { url: `${baseUrl}/public/v1/plugin/manifest.json?_t=${ts}`, name: "manifest.json" },
            { url: `${baseUrl}/public/v1/plugin/styles.css?_t=${ts}`, name: "styles.css" }
          ];
          for (const file of files) {
            const res = await fetch(file.url, { cache: "no-store" });
            if (!res.ok && file.name === "styles.css") continue;
            if (!res.ok) throw new Error(`${file.name} \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328 (${res.status})`);
            const content = await res.text();
            await this.plugin.app.vault.adapter.write(
              `.obsidian/plugins/vsync/${file.name}`,
              content
            );
          }
          new import_obsidian2.Notice("\uC5C5\uB370\uC774\uD2B8 \uC644\uB8CC. Obsidian\uC744 \uC7AC\uC2DC\uC791\uD574\uC8FC\uC138\uC694.");
        } catch (error) {
          new import_obsidian2.Notice(`\uC5C5\uB370\uC774\uD2B8 \uC2E4\uD328: ${error.message}`);
        } finally {
          button.setButtonText("\uB2E4\uC6B4\uB85C\uB4DC");
          button.setDisabled(false);
        }
      });
    });
  }
};

// src/conflict-modal.ts
var import_obsidian3 = require("obsidian");
var ConflictModal = class extends import_obsidian3.Modal {
  constructor(app, conflict) {
    super(app);
    this.conflict = conflict;
    this.chosen = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("conflict-modal");
    contentEl.createEl("h2", { text: "\uB3D9\uAE30\uD654 \uCDA9\uB3CC" });
    contentEl.createEl("p", {
      text: `"${this.conflict.path}" \uD30C\uC77C\uC774 \uB85C\uCEEC\uACFC \uC11C\uBC84\uC5D0\uC11C \uB2E4\uB974\uAC8C \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`
    });
    const infoEl = contentEl.createDiv({ cls: "conflict-info" });
    infoEl.createEl("p", {
      text: `\uB85C\uCEEC \uD574\uC2DC: ${this.conflict.localHash.slice(0, 12)}...`
    });
    infoEl.createEl("p", {
      text: `\uC11C\uBC84 \uD574\uC2DC: ${this.conflict.serverHash.slice(0, 12)}...`
    });
    const btnContainer = contentEl.createDiv({ cls: "conflict-buttons" });
    const localBtn = btnContainer.createEl("button", {
      text: "\uB85C\uCEEC \uBC84\uC804 \uC720\uC9C0",
      cls: "mod-cta"
    });
    localBtn.addEventListener("click", () => {
      this.chosen = true;
      this.close();
      this.resolve("local");
    });
    const serverBtn = btnContainer.createEl("button", {
      text: "\uC11C\uBC84 \uBC84\uC804\uC73C\uB85C \uAD50\uCCB4"
    });
    serverBtn.addEventListener("click", () => {
      this.chosen = true;
      this.close();
      this.resolve("server");
    });
  }
  onClose() {
    this.contentEl.empty();
    if (!this.chosen) {
      this.reject(new Error(`\uC0AC\uC6A9\uC790\uAC00 \uCDA9\uB3CC \uD574\uACB0\uC744 \uAC74\uB108\uB700: ${this.conflict.path}`));
    }
  }
  wait() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.open();
    });
  }
};

// src/offline-queue.ts
var MAX_QUEUE_SIZE = 1e3;
var TTL_MS = 7 * 24 * 60 * 60 * 1e3;
var OfflineQueue = class {
  constructor() {
    this.items = [];
  }
  /**
   * Add item to queue
   * Removes oldest item if queue is full
   * Replaces duplicate items with same type and file identifier
   */
  add(type, payload) {
    const duplicateIndex = this.items.findIndex((item) => {
      if (item.type !== type) return false;
      switch (type) {
        case "file:create":
        case "file:update":
          return item.payload.path === payload.path;
        case "file:delete":
        case "file:rename":
          return item.payload.fileId === payload.fileId;
        default:
          return false;
      }
    });
    if (duplicateIndex !== -1) {
      this.items[duplicateIndex] = {
        type,
        payload,
        timestamp: Date.now(),
        id: crypto.randomUUID()
      };
      return;
    }
    if (this.items.length >= MAX_QUEUE_SIZE) {
      this.items.shift();
    }
    this.items.push({
      type,
      payload,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
  }
  /**
   * Get all items, filtering out expired items
   * Removes expired items from internal state
   */
  getAll() {
    const now = Date.now();
    this.items = this.items.filter((item) => now - item.timestamp < TTL_MS);
    return [...this.items];
  }
  /**
   * Clear all items from queue
   */
  clear() {
    this.items = [];
  }
  /**
   * Get current queue size (before filtering expired items)
   */
  size() {
    return this.items.length;
  }
};

// src/sync-service.ts
var SyncService = class {
  constructor(serverUrl, vaultId, apiKey) {
    this.serverUrl = serverUrl;
    this.vaultId = vaultId;
    this.apiKey = apiKey;
    this.ws = null;
    this._state = "offline";
    this.stateListeners = [];
    this.messageListeners = [];
    // Reconnection with exponential backoff
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInitialDelay = 1e3;
    // 1 second
    this.reconnectMaxDelay = 3e4;
    // 30 seconds
    this.reconnectMultiplier = 2;
    this.explicitlyDisconnected = false;
    // Phase 3: Server message handling
    this.callbacks = null;
    this.pendingMessages = /* @__PURE__ */ new Map();
    this.recentlyAcknowledged = /* @__PURE__ */ new Map();
    this.ACK_EXPIRY_MS = 1e4;
    // 10 seconds
    // Phase 5: Debounce timers
    this.debounceTimers = /* @__PURE__ */ new Map();
    this.DEBOUNCE_MS = 500;
    // 500ms
    // 재동기화 상태 (Reconnection Sync State)
    this.isReconnecting = false;
    this.liveSyncQueue = [];
    this.queue = new OfflineQueue();
  }
  /**
   * 콜백 설정 (Phase 3)
   */
  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }
  get state() {
    return this._state;
  }
  /**
   * Get current reconnection attempt count
   */
  getReconnectAttempt() {
    return this.reconnectAttempt;
  }
  /**
   * Register listener for state changes
   * Returns unsubscribe function
   */
  onStateChange(listener) {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }
  /**
   * Register listener for server messages
   * Returns unsubscribe function
   */
  onMessage(handler) {
    this.messageListeners.push(handler);
    return () => {
      this.messageListeners = this.messageListeners.filter((h) => h !== handler);
    };
  }
  setState(state) {
    this._state = state;
    this.stateListeners.forEach((l) => l(state));
  }
  /**
   * Calculate reconnection delay with exponential backoff
   */
  getReconnectDelay() {
    const delay = this.reconnectInitialDelay * Math.pow(this.reconnectMultiplier, this.reconnectAttempt);
    return Math.min(delay, this.reconnectMaxDelay);
  }
  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.setState("error");
      return;
    }
    this.reconnectAttempt++;
    this.setState("reconnecting");
    const delay = this.getReconnectDelay();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
  /**
   * Clear reconnection timer
   */
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  /**
   * Connect to WebSocket server
   */
  connect() {
    const url = `${this.serverUrl}/v1/ws/${this.vaultId}?key=${this.apiKey}`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.clearReconnectTimer();
      this.explicitlyDisconnected = false;
      this.setState("connected");
      this.startReconnectSync();
    };
    this.ws.onclose = () => {
      if (!this.explicitlyDisconnected) {
        this.scheduleReconnect();
      } else {
        this.setState("offline");
      }
    };
    this.ws.onerror = () => {
      this.setState("error");
    };
    this.ws.onmessage = (event) => {
      try {
        const raw = event.data.toString();
        const message = JSON.parse(raw);
        this.dispatchServerMessage(message);
        this.messageListeners.forEach((listener) => {
          try {
            listener(message);
          } catch (error) {
            console.error("Error in message listener:", error);
          }
        });
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
  }
  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.explicitlyDisconnected = true;
    this.clearReconnectTimer();
    this.reconnectAttempt = 0;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState("offline");
  }
  /**
   * Pause syncing (REQ-PL-301)
   */
  pause() {
    this.setState("paused");
  }
  /**
   * Resume syncing
   */
  resume() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.setState("connected");
    } else {
      this.setState("offline");
    }
  }
  /**
   * Send file create event
   */
  sendFileCreate(path, content) {
    this.pendingMessages.set(path, { type: "file:create", path, timestamp: Date.now() });
    this.sendOrQueue("file:create", { path, content });
  }
  /**
   * 재동기화 요청 전송 (REQ-RT-101, REQ-RT-102)
   */
  sendSyncReconnect(localFiles) {
    this.sendOrQueue("sync:reconnect", { payload: { localFiles } });
  }
  /**
   * 재동기화 완료 알림 전송 (REQ-FS-202)
   */
  sendSyncReconnectComplete(uploaded, downloaded, conflicts) {
    this.sendOrQueue("sync:reconnect-complete", { payload: { uploaded, downloaded, conflicts } });
  }
  /**
   * Send file update event with content hash
   * Phase 5: Debounce 적용 (REQ-LC-402)
   */
  async sendFileUpdate(fileId, path, content) {
    const existingTimer = this.debounceTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(async () => {
      this.pendingMessages.set(path, { type: "file:update", path, timestamp: Date.now() });
      this.sendOrQueue("file:update", { fileId, path, content });
      this.debounceTimers.delete(path);
    }, this.DEBOUNCE_MS);
    this.debounceTimers.set(path, timer);
  }
  /**
   * Send file delete event
   */
  sendFileDelete(fileId) {
    this.pendingMessages.set(fileId, { type: "file:delete", path: fileId, timestamp: Date.now() });
    this.sendOrQueue("file:delete", { fileId });
  }
  /**
   * Send file rename event
   */
  sendFileRename(fileId, oldPath, newPath) {
    this.pendingMessages.set(newPath, { type: "file:rename", path: newPath, timestamp: Date.now() });
    this.sendOrQueue("file:rename", { fileId, oldPath, newPath });
  }
  /**
   * Send message or queue when offline
   */
  sendOrQueue(type, payload) {
    if (this._state === "paused") {
      return;
    }
    const message = JSON.stringify({ type, ...payload });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.queue.add(type, payload);
    }
  }
  /**
   * Flush offline queue when connection is established (REQ-PL-109)
   */
  flushQueue() {
    const items = this.queue.getAll();
    for (const item of items) {
      const message = JSON.stringify({ type: item.type, ...item.payload });
      this.ws?.send(message);
    }
    this.queue.clear();
  }
  /**
   * Phase 3: 서버 메시지 디스패치
   * @MX:ANCHOR: [AUTO] 서버 메시지 타입별 핸들러 라우팅
   * @MX:REASON: REQ-SS-101 to REQ-SS-108 - 서버 메시지 처리 로직
   */
  dispatchServerMessage(message) {
    this.cleanupRecentlyAcknowledged();
    if (this.isReconnecting && message.type !== "sync:reconnect-response" && message.type !== "sync:ack") {
      this.liveSyncQueue.push(message);
      return;
    }
    switch (message.type) {
      case "sync:ack":
        this.handleSyncAck(message);
        break;
      case "file:created":
        this.handleFileCreated(message);
        break;
      case "file:updated":
        this.handleFileUpdated(message);
        break;
      case "file:deleted":
        this.handleFileDeleted(message);
        break;
      case "file:renamed":
        this.handleFileRenamed(message);
        break;
      case "conflict:detected":
        this.handleConflictDetected(message);
        break;
      case "sync:error":
        this.handleSyncError(message);
        break;
      case "sync:reconnect-response":
        this.handleReconnectResponse(message);
        break;
    }
  }
  /**
   * T3.2: handleSyncAck (REQ-SS-101)
   */
  handleSyncAck(message) {
    const { fileId, path } = message;
    this.recentlyAcknowledged.set(fileId, Date.now());
    if (path) {
      const pending = this.pendingMessages.get(path);
      if (pending) {
        this.pendingMessages.delete(path);
        this.callbacks?.onFileIdUpdate(path, fileId);
        return;
      }
    }
    for (const [key, value] of this.pendingMessages.entries()) {
      if (key === fileId || value.path === fileId) {
        this.pendingMessages.delete(key);
        if (this.callbacks && value.path) {
          this.callbacks.onFileIdUpdate(value.path, fileId);
        }
        break;
      }
    }
  }
  /**
   * T3.3: handleFileCreated (REQ-SS-102)
   */
  handleFileCreated(message) {
    const { file } = message;
    if (!this.callbacks) return;
    if (this.isSelfOriginated(file.id)) {
      return;
    }
    if (this.callbacks.pathExists && this.callbacks.pathExists(file.path)) {
      return;
    }
    if (file.content !== void 0) {
      this.callbacks.onFileCreate(file.path, file.content);
      this.callbacks.onFileIdUpdate(file.path, file.id);
    }
  }
  /**
   * T3.4: handleFileUpdated (REQ-SS-103)
   */
  handleFileUpdated(message) {
    const { file } = message;
    if (!this.callbacks) return;
    if (this.isSelfOriginated(file.id)) {
      return;
    }
    const localPath = this.callbacks.getPathByFileId(file.id);
    if (!localPath) {
      if (this.callbacks.queueResolution) {
        this.callbacks.queueResolution(file.id, file.path);
      }
      return;
    }
    if (this.callbacks.hasUnsavedChanges && this.callbacks.hasUnsavedChanges(localPath)) {
      if (this.callbacks.onConflict) {
        this.callbacks.onConflict({
          type: "unsaved_changes",
          fileId: file.id,
          path: localPath,
          serverContent: file.content
        });
      }
      return;
    }
    if (file.content !== void 0) {
      this.callbacks.onFileUpdate(localPath, file.content);
    }
  }
  /**
   * T3.5: handleFileDeleted (REQ-SS-104)
   */
  handleFileDeleted(message) {
    const { fileId } = message;
    if (!this.callbacks) return;
    if (this.isSelfOriginated(fileId)) {
      return;
    }
    const localPath = this.callbacks.getPathByFileId(fileId);
    if (!localPath) {
      if (this.callbacks.queueResolution) {
        this.callbacks.queueResolution(fileId, void 0);
      }
      return;
    }
    this.callbacks.onFileDelete(localPath);
    this.callbacks.onFileIdRemove(localPath);
  }
  /**
   * T3.6: handleFileRenamed (REQ-SS-105)
   */
  handleFileRenamed(message) {
    const { file } = message;
    if (!this.callbacks) return;
    if (this.isSelfOriginated(file.id)) {
      return;
    }
    const oldPath = this.callbacks.getPathByFileId(file.id);
    if (!oldPath) {
      if (this.callbacks.queueResolution) {
        this.callbacks.queueResolution(file.id, file.path);
      }
      return;
    }
    this.callbacks.onFileRename(oldPath, file.path);
    this.callbacks.onFileIdUpdate(file.path, file.id);
  }
  /**
   * T3.7: handleConflictDetected (REQ-SS-106)
   */
  handleConflictDetected(message) {
    const { conflictId, fileId, clientHash } = message;
    if (!this.callbacks) return;
    const localPath = this.callbacks.getPathByFileId(fileId);
    if (!localPath) {
      console.warn(`[SyncService] Conflict detected but fileId not found: ${fileId}`);
      return;
    }
    const localContent = this.callbacks.readFile ? this.callbacks.readFile(localPath) : "";
    if (this.callbacks.onConflict) {
      this.callbacks.onConflict({
        conflictId,
        fileId,
        path: localPath,
        localContent,
        clientHash
      });
    }
    if (this.callbacks.onNotice) {
      this.callbacks.onNotice(`\uCDA9\uB3CC \uAC10\uC9C0: ${localPath}`);
    }
  }
  /**
   * T3.8: handleSyncError (REQ-SS-107)
   */
  handleSyncError(message) {
    const { code, message: errorMessage } = message;
    if (!this.callbacks) return;
    let category = "server";
    if (code) {
      if (code.startsWith("AUTH_")) {
        category = "auth";
      } else if (code.startsWith("NETWORK_")) {
        category = "network";
      } else if (code.startsWith("VALIDATION_")) {
        category = "validation";
      }
    }
    console.error(`[SyncService] Error [${category}]:`, { code, message: errorMessage });
    if (this.callbacks.onError) {
      this.callbacks.onError({
        category,
        code: code || "UNKNOWN",
        message: errorMessage || "Unknown error"
      });
    }
    if (category === "auth" && this.callbacks.triggerReconnect) {
      this.callbacks.triggerReconnect();
    }
    if (category === "validation") {
      this.pause();
    }
  }
  /**
   * T3.9: handleReconnectResponse (REQ-FC-102)
   * 서버 파일 목록 응답 처리
   */
  handleReconnectResponse(message) {
    if (!this.callbacks?.onReconnectResponse) return;
    this.callbacks.onReconnectResponse(message.payload.serverFiles);
  }
  /**
   * Phase 4: 자가 origin 판별 (REQ-IS-301)
   * @MX:ANCHOR: [AUTO] 자가 변경 메시지 필터링
   * @MX:REASON: REQ-IS-301 - Echo loop 방지를 위한 자가 origin 감지
   */
  isSelfOriginated(fileId) {
    for (const value of this.pendingMessages.values()) {
      if (value.path === fileId) {
        return true;
      }
    }
    return this.recentlyAcknowledged.has(fileId);
  }
  /**
   * Phase 4: 최근 승인된 메시지 정리 (10초 경과)
   */
  cleanupRecentlyAcknowledged() {
    const now = Date.now();
    for (const [fileId, timestamp] of this.recentlyAcknowledged.entries()) {
      if (now - timestamp > this.ACK_EXPIRY_MS) {
        this.recentlyAcknowledged.delete(fileId);
      }
    }
  }
  /**
   * 오프라인 큐 플러시 및 연결 해제 (REQ-CW-103, REQ-UL-202)
   * @param timeout - 플러시 대기 최대 시간 (ms)
   */
  async flushAndDisconnect(timeout) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.flushQueue();
    }
    const remainingMessages = this.queue.size();
    if (remainingMessages > 0) {
      console.warn(
        `[SyncService] flushAndDisconnect: ${remainingMessages} messages unsent after ${timeout}ms timeout`
      );
    }
    this.disconnect();
  }
  /**
   * Debounce 타이머 정리 (REQ-CW-103)
   */
  cleanupTimers() {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
  /**
   * 재동기화 시작 (REQ-RT-101, REQ-RT-102, REQ-RT-103)
   * 연결/재연결 시 자동 호출
   */
  async startReconnectSync() {
    if (this.isReconnecting) return;
    if (!this.callbacks?.collectLocalFiles) {
      this.flushQueue();
      return;
    }
    this.isReconnecting = true;
    this.setState("syncing");
    try {
      this.callbacks.showStatusBar?.("\uC7AC\uB3D9\uAE30\uD654 \uC2DC\uC791 \uC911...");
      const localFiles = await this.callbacks.collectLocalFiles();
      this.sendSyncReconnect(localFiles);
    } catch (error) {
      console.error("[ReconnectSync] \uC2DC\uC791 \uC2E4\uD328:", error);
      this.isReconnecting = false;
      this.setState("connected");
      this.flushQueue();
      this.callbacks.onError?.({
        category: "sync",
        code: "RECONNECT_SYNC_FAILED",
        message: error instanceof Error ? error.message : "Reconnect sync failed"
      });
    }
  }
  /**
   * 재동기화 응답 처리 후 동기화 수행 (REQ-FC-103)
   * 서버 파일 목록을 받아 로컬과 비교하여 업로드/다운로드/충돌 해결
   */
  async performReconnectSync(serverFiles) {
    if (!this.callbacks) return;
    const localFiles = await this.callbacks.collectLocalFiles?.() ?? [];
    const localMap = new Map(localFiles.map((f) => [f.path, f.hash]));
    const serverMap = new Map(serverFiles.map((f) => [f.path, f]));
    let uploaded = 0;
    let downloaded = 0;
    let conflicts = 0;
    const totalFiles = localFiles.length + serverFiles.filter((sf) => !localMap.has(sf.path)).length;
    let processed = 0;
    for (const localFile of localFiles) {
      if (!serverMap.has(localFile.path)) {
        try {
          const content = this.callbacks.readFileAsync ? await this.callbacks.readFileAsync(localFile.path) : "";
          this.sendFileCreate(localFile.path, content);
          uploaded++;
        } catch (error) {
          console.error(`[ReconnectSync] \uC5C5\uB85C\uB4DC \uC2E4\uD328: ${localFile.path}`, error);
        }
      } else {
        const serverFile = serverMap.get(localFile.path);
        this.callbacks.onFileIdUpdate(localFile.path, serverFile.fileId);
        if (localFile.hash !== serverFile.currentHash) {
          const conflictInfo = {
            fileId: serverFile.fileId,
            path: localFile.path,
            localHash: localFile.hash,
            serverHash: serverFile.currentHash
          };
          if (this.callbacks.resolveConflict) {
            try {
              const choice = await this.callbacks.resolveConflict(conflictInfo);
              await new Promise((r) => setTimeout(r, 100));
              if (choice === "local") {
                const content = this.callbacks.readFileAsync ? await this.callbacks.readFileAsync(localFile.path) : "";
                this.sendOrQueue("file:update", {
                  fileId: serverFile.fileId,
                  path: localFile.path,
                  content,
                  hash: "",
                  resolveConflict: true
                });
                uploaded++;
              } else {
                await this.downloadServerFile(serverFile.fileId, localFile.path);
                this.sendOrQueue("file:update", {
                  fileId: serverFile.fileId,
                  resolveConflict: true,
                  resolveStrategy: "keep_server"
                });
                downloaded++;
              }
            } catch (error) {
              console.error(`[ReconnectSync] \uCDA9\uB3CC \uD574\uACB0 \uC2E4\uD328: ${localFile.path}`, error);
              conflicts++;
            }
          } else {
            conflicts++;
            if (this.callbacks.onConflict) {
              this.callbacks.onConflict({ type: "reconnect_conflict", ...conflictInfo });
            }
          }
        }
      }
      processed++;
      this.callbacks.showStatusBar?.(`\uC7AC\uB3D9\uAE30\uD654 \uC911: ${processed}/${totalFiles} \uD30C\uC77C`);
    }
    for (const serverFile of serverFiles) {
      if (!localMap.has(serverFile.path)) {
        try {
          this.callbacks.onFileIdUpdate(serverFile.path, serverFile.fileId);
          await this.downloadServerFile(serverFile.fileId, serverFile.path);
          downloaded++;
        } catch (error) {
          console.error(`[ReconnectSync] \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${serverFile.path}`, error);
        }
        processed++;
        this.callbacks.showStatusBar?.(`\uC7AC\uB3D9\uAE30\uD654 \uC911: ${processed}/${totalFiles} \uD30C\uC77C`);
      }
    }
    this.sendSyncReconnectComplete(uploaded, downloaded, conflicts);
    this.queue.clear();
    this.isReconnecting = false;
    this.flushLiveSyncQueue();
    this.callbacks.onNotice?.(`\uC7AC\uB3D9\uAE30\uD654 \uC644\uB8CC: ${uploaded}\uAC1C \uC5C5\uB85C\uB4DC, ${downloaded}\uAC1C \uB2E4\uC6B4\uB85C\uB4DC, ${conflicts}\uAC1C \uCDA9\uB3CC`);
    this.callbacks.clearStatusBar?.();
    this.setState("connected");
  }
  /**
   * 서버 파일 다운로드 (REQ-FS-102)
   */
  async downloadServerFile(fileId, path) {
    if (!this.callbacks) return;
    try {
      const baseUrl = this.serverUrl.replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/v1/${this.vaultId}/files/${fileId}?include_content=true`,
        {
          headers: { "Authorization": `Bearer ${this.apiKey}` }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const content = data.content ?? "";
      if (this.callbacks.pathExists?.(path)) {
        await this.callbacks.onFileUpdate(path, content);
      } else {
        await this.callbacks.onFileCreate(path, content);
      }
    } catch (error) {
      console.error(`[ReconnectSync] \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${fileId}`, error);
      throw error;
    }
  }
  /**
   * 라이브 싱크 이벤트 큐 플러시 (REQ-RT-202)
   */
  flushLiveSyncQueue() {
    for (const event of this.liveSyncQueue) {
      try {
        this.dispatchServerMessage(event);
      } catch (error) {
        console.error("[ReconnectSync] \uD050 \uC774\uBCA4\uD2B8 \uCC98\uB9AC \uC2E4\uD328:", error);
      }
    }
    this.liveSyncQueue = [];
  }
  /**
   * 재동기화 진행 중인지 확인
   */
  get isSyncing() {
    return this.isReconnecting;
  }
};

// src/hash-utils.ts
async function hashContent(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// src/index.ts
var FileIdTracker = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.pathToFileId = {};
    this.fileIdToPath = /* @__PURE__ */ new Map();
  }
  setFileId(path, fileId) {
    if (!fileId) return;
    this.pathToFileId[path] = fileId;
    this.fileIdToPath.set(fileId, path);
  }
  /**
   * path로 fileId 조회
   */
  getFileId(path) {
    return this.pathToFileId[path];
  }
  /**
   * fileId로 path 조회
   */
  getPath(fileId) {
    return this.fileIdToPath.get(fileId);
  }
  /**
   * 매핑 제거
   */
  removeFileId(path) {
    const fileId = this.pathToFileId[path];
    if (fileId) {
      delete this.pathToFileId[path];
      this.fileIdToPath.delete(fileId);
    }
  }
  /**
   * 매핑 저장 (REQ-FM-202)
   * @MX:NOTE: [AUTO] 기존 데이터 병합으로 settings 덮어쓰기 버그 수정
   */
  async saveMappings() {
    await this.plugin.saveData({
      settings: this.plugin.settings,
      fileIdMappings: this.pathToFileId
    });
  }
  /**
   * 매핑 로드 (REQ-FM-204)
   */
  async loadMappings() {
    const data = await this.plugin.loadData();
    if (data && "fileIdMappings" in data) {
      const mappings = data.fileIdMappings;
      this.pathToFileId = { ...mappings };
      this.fileIdToPath = /* @__PURE__ */ new Map();
      for (const [path, fileId] of Object.entries(mappings)) {
        this.fileIdToPath.set(fileId, path);
      }
    }
  }
  /**
   * 스테일 매핑 제거 (REQ-FM-204)
   */
  async validateMappings() {
    const stalePaths = [];
    for (const path of Object.keys(this.pathToFileId)) {
      const exists = await this.plugin.app.vault.adapter.exists(path);
      if (!exists) {
        stalePaths.push(path);
      }
    }
    for (const path of stalePaths) {
      this.removeFileId(path);
    }
    if (stalePaths.length > 0) {
      await this.saveMappings();
    }
  }
};
var ResolutionQueue = class {
  constructor() {
    this.queue = /* @__PURE__ */ new Set();
    this.maxSize = 100;
  }
  /**
   * path를 큐에 추가 (LRU eviction)
   */
  add(path) {
    if (this.queue.size >= this.maxSize) {
      const first = this.queue.values().next().value;
      if (first) this.queue.delete(first);
    }
    this.queue.add(path);
  }
  /**
   * path를 큐에서 제거
   */
  remove(path) {
    this.queue.delete(path);
  }
  /**
   * path가 큐에 있는지 확인
   */
  has(path) {
    return this.queue.has(path);
  }
  /**
   * 큐 처리 (REQ-RQ-301, REQ-RQ-302)
   */
  async processQueue(syncService, fileIdTracker) {
    const pathsToProcess = Array.from(this.queue);
    for (const path of pathsToProcess) {
      const fileId = fileIdTracker.getFileId(path);
      if (fileId) {
        await syncService.sendFileUpdate(fileId, path, "");
      } else {
        syncService.sendFileCreate(path, "");
      }
      this.remove(path);
    }
  }
  /**
   * 큐 처리 (REQ-BF-503)
   * @deprecated processQueue 사용 권장
   */
  async process() {
    for (const path of this.queue) {
      console.warn(`[ResolutionQueue] Pending fileId resolution for: ${path}`);
    }
  }
  /**
   * 큐 비우기
   */
  clear() {
    this.queue.clear();
  }
  /**
   * 큐 크기 반환
   */
  size() {
    return this.queue.size;
  }
};
var VSyncPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.syncService = null;
    this.eventRefs = [];
    this.lastConnectedSettings = { serverUrl: "", vaultId: "", apiKey: "" };
    /**
     * StatusBar 업데이트 (REQ-UI-001, REQ-UI-002)
     */
    this.statusBarItem = null;
  }
  async onload() {
    this.fileIdTracker = new FileIdTracker(this);
    this.resolutionQueue = new ResolutionQueue();
    await this.loadSettings();
    await this.fileIdTracker.loadMappings();
    if (this.settings.currentVersion !== this.manifest.version) {
      this.settings.currentVersion = this.manifest.version;
      await this.saveSettings();
    }
    this.app.workspace.onLayoutReady(() => {
      this.initializeSync();
    });
    this.addSettingTab(new VSyncSettingTab(this.app, this));
  }
  onunload() {
    this.cleanup();
  }
  /**
   * Initialize sync service when settings are configured
   */
  initializeSync() {
    if (!this.settings.serverUrl || !this.settings.vaultId || !this.settings.apiKey) {
      return;
    }
    this.syncService = new SyncService(
      this.settings.serverUrl,
      this.settings.vaultId,
      this.settings.apiKey
    );
    const callbacks = {
      onFileIdUpdate: (path, fileId) => {
        this.fileIdTracker.setFileId(path, fileId);
        this.resolutionQueue.remove(path);
      },
      onFileIdRemove: (path) => {
        this.fileIdTracker.removeFileId(path);
      },
      getPathByFileId: (fileId) => {
        return this.fileIdTracker.getPath(fileId);
      },
      getFileIdByPath: (path) => {
        return this.fileIdTracker.getFileId(path);
      },
      onFileCreate: async (path, content) => {
        await this.app.vault.create(path, content);
      },
      onFileUpdate: async (path, content) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian4.TFile) {
          await this.app.vault.modify(file, content);
        }
      },
      onFileDelete: async (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file) {
          await this.app.vault.delete(file);
        }
      },
      onFileRename: async (oldPath, newPath) => {
        const file = this.app.vault.getAbstractFileByPath(oldPath);
        if (file) {
          await this.app.vault.rename(file, newPath);
        }
      },
      onConflict: (conflictInfo) => {
        console.warn("[Conflict]", conflictInfo);
      },
      onNotice: (message) => {
        new import_obsidian4.Notice(message);
      },
      hasUnsavedChanges: () => {
        return false;
      },
      readFile: (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian4.TFile) {
          return "";
        }
        return "";
      },
      pathExists: (path) => {
        return this.app.vault.getAbstractFileByPath(path) !== null;
      },
      triggerReconnect: () => {
        this.syncService?.connect();
      },
      onError: (error) => {
        console.error("[SyncService Error]", error);
        new import_obsidian4.Notice(`\uB3D9\uAE30\uD654 \uC624\uB958: ${error.message}`);
      },
      queueResolution: (_fileId, path) => {
        if (path) {
          this.resolutionQueue.add(path);
        }
      },
      // 재동기화 콜백 (Reconnection Sync Callbacks)
      onReconnectResponse: (serverFiles) => {
        this.syncService?.performReconnectSync(serverFiles);
      },
      collectLocalFiles: async () => {
        return this.collectLocalFiles();
      },
      readFileAsync: async (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian4.TFile) {
          return this.app.vault.read(file);
        }
        return "";
      },
      showStatusBar: (message) => {
        this.updateStatusBar(message);
      },
      clearStatusBar: () => {
        this.clearStatusBar();
      },
      resolveConflict: async (conflict) => {
        const modal = new ConflictModal(this.app, conflict);
        return modal.wait();
      }
    };
    this.syncService.setCallbacks(callbacks);
    this.lastConnectedSettings = {
      serverUrl: this.settings.serverUrl,
      vaultId: this.settings.vaultId,
      apiKey: this.settings.apiKey
    };
    this.registerEvents();
    this.syncService.connect();
  }
  /**
   * Register Obsidian vault event handlers
   */
  registerEvents() {
    const createRef = this.app.vault.on("create", (file) => {
      if (file instanceof import_obsidian4.TFile && !this.isSkipped(file.path)) {
        this.handleFileCreate(file);
      }
    });
    const modifyRef = this.app.vault.on("modify", (file) => {
      if (file instanceof import_obsidian4.TFile && !this.isSkipped(file.path)) {
        this.handleFileModify(file);
      }
    });
    const deleteRef = this.app.vault.on("delete", (file) => {
      if (file instanceof import_obsidian4.TFile && !this.isSkipped(file.path)) {
        this.handleFileDelete(file);
      }
    });
    const renameRef = this.app.vault.on("rename", (file, oldPath) => {
      if (file instanceof import_obsidian4.TFile && !this.isSkipped(file.path)) {
        this.handleFileRename(file, oldPath);
      }
    });
    this.eventRefs = [createRef, modifyRef, deleteRef, renameRef];
    this.eventRefs.forEach((ref) => this.registerEvent(ref));
  }
  /**
   * Handle file create event (REQ-EH-401)
   */
  async handleFileCreate(file) {
    if (this.syncService?.isSyncing) return;
    try {
      const content = await this.app.vault.read(file);
      this.syncService?.sendFileCreate(file.path, content);
    } catch (error) {
      console.error("[handleFileCreate]", {
        handler: "handleFileCreate",
        path: file.path,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  /**
   * Handle file modify event (REQ-BF-504, REQ-EH-401)
   */
  async handleFileModify(file) {
    if (this.syncService?.isSyncing) return;
    try {
      const content = await this.app.vault.read(file);
      const fileId = this.fileIdTracker.getFileId(file.path);
      if (!fileId) {
        this.syncService?.sendFileCreate(file.path, content);
        return;
      }
      await this.syncService?.sendFileUpdate(fileId, file.path, content);
    } catch (error) {
      console.error("[handleFileModify]", {
        handler: "handleFileModify",
        path: file.path,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  /**
   * Handle file delete event (REQ-BF-501, REQ-EH-401)
   */
  async handleFileDelete(file) {
    if (this.syncService?.isSyncing) return;
    try {
      const fileId = this.fileIdTracker.getFileId(file.path);
      if (!fileId) {
        console.warn(`[FileIdTracker] fileId not found for path: ${file.path}`);
        return;
      }
      this.syncService?.sendFileDelete(fileId);
      this.fileIdTracker.removeFileId(file.path);
    } catch (error) {
      console.error("[handleFileDelete]", {
        handler: "handleFileDelete",
        path: file.path,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  /**
   * Handle file rename event (REQ-BF-502, REQ-EH-401)
   */
  async handleFileRename(file, oldPath) {
    if (this.syncService?.isSyncing) return;
    try {
      const fileId = this.fileIdTracker.getFileId(oldPath);
      if (!fileId) {
        console.warn(`[FileIdTracker] fileId not found for path: ${oldPath}`);
        return;
      }
      this.syncService?.sendFileRename(fileId, oldPath, file.path);
      this.fileIdTracker.removeFileId(oldPath);
      this.fileIdTracker.setFileId(file.path, fileId);
    } catch (error) {
      console.error("[handleFileRename]", {
        handler: "handleFileRename",
        path: file.path,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  /**
   * 로컬 파일 목록 수집 (REQ-FC-101)
   * 해시 계산 및 skippedPaths/바이너리 필터링 포함
   */
  async collectLocalFiles() {
    const allFiles = this.app.vault.getFiles();
    const eligible = allFiles.filter(
      (f) => !this.isBinaryFile(f.path) && !this.isSkipped(f.path)
    );
    const settled = await Promise.allSettled(
      eligible.map(async (file) => {
        const content = await this.app.vault.read(file);
        const hash = await hashContent(content);
        return { path: file.path, hash };
      })
    );
    return settled.filter((r) => r.status === "fulfilled").map((r) => r.value);
  }
  /**
   * 바이너리 파일 확인 (REQ-FC-302)
   */
  isBinaryFile(path) {
    const binaryExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".pdf", ".zip", ".tar", ".gz"];
    return binaryExtensions.some((ext) => path.toLowerCase().endsWith(ext));
  }
  updateStatusBar(message) {
    if (!this.statusBarItem) {
      this.statusBarItem = this.addStatusBarItem();
    }
    this.statusBarItem.setText(message);
  }
  /**
   * StatusBar 클리어
   */
  clearStatusBar() {
    if (this.statusBarItem) {
      this.statusBarItem.setText("");
    }
  }
  /**
   * Check if path should be skipped
   */
  isSkipped(path) {
    if (!this.settings.autoSync) {
      return true;
    }
    return this.settings.skippedPaths.some((pattern) => {
      if (pattern.startsWith("*")) {
        return path.endsWith(pattern.slice(1));
      }
      return path.startsWith(pattern);
    });
  }
  /**
   * Cleanup resources on unload (REQ-UL-201, REQ-UL-202)
   */
  cleanup() {
    this.fileIdTracker.saveMappings().catch(
      (e) => console.error("[cleanup] saveMappings \uC2E4\uD328:", e)
    );
    if (this.syncService) {
      this.syncService.flushAndDisconnect(2e3).catch(
        (e) => console.error("[cleanup] flushAndDisconnect \uC2E4\uD328:", e)
      );
      this.syncService.cleanupTimers();
    }
    this.eventRefs.forEach((ref) => this.app.vault.offref(ref));
    this.eventRefs = [];
    this.syncService = null;
    this.lastConnectedSettings = { serverUrl: "", vaultId: "", apiKey: "" };
  }
  /**
   * Load settings from storage
   */
  async loadSettings() {
    const data = await this.loadData() || {};
    const { settings: _nested, ...saved } = data.settings || data;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  }
  /**
   * Save settings to storage (REQ-LC-401)
   * 연결 설정 변경 시 재연결 트리거
   */
  async saveSettings() {
    const { settings: _, ...clean } = this.settings;
    await this.saveData({ settings: clean });
    const connectionChanged = this.settings.serverUrl !== this.lastConnectedSettings.serverUrl || this.settings.vaultId !== this.lastConnectedSettings.vaultId || this.settings.apiKey !== this.lastConnectedSettings.apiKey;
    if (connectionChanged) {
      this.cleanup();
      this.initializeSync();
    }
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvc2V0dGluZ3MtdGFiLnRzIiwgInNyYy9jb25uZWN0aW9uLW1vZGFsLnRzIiwgInNyYy9jb25mbGljdC1tb2RhbC50cyIsICJzcmMvb2ZmbGluZS1xdWV1ZS50cyIsICJzcmMvc3luYy1zZXJ2aWNlLnRzIiwgInNyYy9oYXNoLXV0aWxzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIFZlY3RvciBPYnNpZGlhbiBQbHVnaW4gLSBNYWluIHBsdWdpbiBjbGFzc1xuICogQE1YOkFOQ0hPUjogW0FVVE9dIFBsdWdpbiBsaWZlY3ljbGUgYW5kIE9ic2lkaWFuIGV2ZW50IGludGVncmF0aW9uXG4gKiBATVg6UkVBU09OOiBSRVEtUEwtMTAxIHRvIFJFUS1QTC0xMDYgLSBQbHVnaW4gbG9hZCwgZXZlbnQgaGFuZGxlcnMsIHN5bmMgb3JjaGVzdHJhdGlvblxuICovXG5cbmltcG9ydCB7IFBsdWdpbiwgVEZpbGUsIEV2ZW50UmVmLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBWU3luY1NldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzLXRhYic7XG5pbXBvcnQgdHlwZSB7IFZTeW5jU2V0dGluZ3MsIEZpbGVJZE1hcCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgQ29uZmxpY3RNb2RhbCB9IGZyb20gJy4vY29uZmxpY3QtbW9kYWwnO1xuaW1wb3J0IHsgU3luY1NlcnZpY2UsIHR5cGUgU3luY0NhbGxiYWNrcyB9IGZyb20gJy4vc3luYy1zZXJ2aWNlJztcbmltcG9ydCB7IGhhc2hDb250ZW50IH0gZnJvbSAnLi9oYXNoLXV0aWxzJztcblxuLyoqXG4gKiBGaWxlSWRUcmFja2VyIC0gcGF0aCBcdTIxOTQgZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUFEMDBcdUI5QUNcbiAqIEBNWDpBTkNIT1I6IFtBVVRPXSBGaWxlSWQgXHVCOUU0XHVENTUxIENSVUQgXHVCQzBGIFx1QzlDMFx1QzE4RFx1QzEzMVxuICogQE1YOlJFQVNPTjogUkVRLUZNLTIwMSB0byBSRVEtRk0tMjA0IC0gXHVDNTkxXHVCQzI5XHVENUE1IGZpbGVJZCBcdUI5RTRcdUQ1NTEgXHVDNzIwXHVDOUMwXG4gKi9cbmNsYXNzIEZpbGVJZFRyYWNrZXIge1xuICBwcml2YXRlIHBhdGhUb0ZpbGVJZDogRmlsZUlkTWFwID0ge307XG4gIHByaXZhdGUgZmlsZUlkVG9QYXRoOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGx1Z2luOiBWU3luY1BsdWdpbikge31cblxuICAvKipcbiAgICogZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUMxMjRcdUM4MTVcbiAgICovXG4gIHNldEZpbGVJZChwYXRoOiBzdHJpbmcsIGZpbGVJZDogdm9pZCk6IHZvaWQ7XG4gIHNldEZpbGVJZChwYXRoOiBzdHJpbmcsIGZpbGVJZDogc3RyaW5nKTogdm9pZDtcbiAgc2V0RmlsZUlkKHBhdGg6IHN0cmluZywgZmlsZUlkOiBzdHJpbmcgfCB2b2lkKTogdm9pZCB7XG4gICAgaWYgKCFmaWxlSWQpIHJldHVybjtcbiAgICB0aGlzLnBhdGhUb0ZpbGVJZFtwYXRoXSA9IGZpbGVJZDtcbiAgICB0aGlzLmZpbGVJZFRvUGF0aC5zZXQoZmlsZUlkLCBwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBwYXRoXHVCODVDIGZpbGVJZCBcdUM4NzBcdUQ2OENcbiAgICovXG4gIGdldEZpbGVJZChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnBhdGhUb0ZpbGVJZFtwYXRoXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmaWxlSWRcdUI4NUMgcGF0aCBcdUM4NzBcdUQ2OENcbiAgICovXG4gIGdldFBhdGgoZmlsZUlkOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmZpbGVJZFRvUGF0aC5nZXQoZmlsZUlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUI5RTRcdUQ1NTEgXHVDODFDXHVBQzcwXG4gICAqL1xuICByZW1vdmVGaWxlSWQocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZmlsZUlkID0gdGhpcy5wYXRoVG9GaWxlSWRbcGF0aF07XG4gICAgaWYgKGZpbGVJZCkge1xuICAgICAgZGVsZXRlIHRoaXMucGF0aFRvRmlsZUlkW3BhdGhdO1xuICAgICAgdGhpcy5maWxlSWRUb1BhdGguZGVsZXRlKGZpbGVJZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QjlFNFx1RDU1MSBcdUM4MDBcdUM3QTUgKFJFUS1GTS0yMDIpXG4gICAqIEBNWDpOT1RFOiBbQVVUT10gXHVBRTMwXHVDODc0IFx1QjM3MFx1Qzc3NFx1RDEzMCBcdUJDRDFcdUQ1NjlcdUM3M0NcdUI4NUMgc2V0dGluZ3MgXHVCMzZFXHVDNUI0XHVDNEYwXHVBRTMwIFx1QkM4NFx1QURGOCBcdUMyMThcdUM4MTVcbiAgICovXG4gIGFzeW5jIHNhdmVNYXBwaW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlRGF0YSh7XG4gICAgICBzZXR0aW5nczogdGhpcy5wbHVnaW4uc2V0dGluZ3MsXG4gICAgICBmaWxlSWRNYXBwaW5nczogdGhpcy5wYXRoVG9GaWxlSWQsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHVCOUU0XHVENTUxIFx1Qjg1Q1x1QjREQyAoUkVRLUZNLTIwNClcbiAgICovXG4gIGFzeW5jIGxvYWRNYXBwaW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5wbHVnaW4ubG9hZERhdGEoKTtcbiAgICBpZiAoZGF0YSAmJiAnZmlsZUlkTWFwcGluZ3MnIGluIGRhdGEpIHtcbiAgICAgIGNvbnN0IG1hcHBpbmdzID0gKGRhdGEgYXMgYW55KS5maWxlSWRNYXBwaW5ncyBhcyBGaWxlSWRNYXA7XG4gICAgICB0aGlzLnBhdGhUb0ZpbGVJZCA9IHsgLi4ubWFwcGluZ3MgfTtcbiAgICAgIHRoaXMuZmlsZUlkVG9QYXRoID0gbmV3IE1hcCgpO1xuICAgICAgZm9yIChjb25zdCBbcGF0aCwgZmlsZUlkXSBvZiBPYmplY3QuZW50cmllcyhtYXBwaW5ncykpIHtcbiAgICAgICAgdGhpcy5maWxlSWRUb1BhdGguc2V0KGZpbGVJZCwgcGF0aCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QzJBNFx1RDE0Q1x1Qzc3QyBcdUI5RTRcdUQ1NTEgXHVDODFDXHVBQzcwIChSRVEtRk0tMjA0KVxuICAgKi9cbiAgYXN5bmMgdmFsaWRhdGVNYXBwaW5ncygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdGFsZVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgcGF0aCBvZiBPYmplY3Qua2V5cyh0aGlzLnBhdGhUb0ZpbGVJZCkpIHtcbiAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKTtcbiAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgIHN0YWxlUGF0aHMucHVzaChwYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBwYXRoIG9mIHN0YWxlUGF0aHMpIHtcbiAgICAgIHRoaXMucmVtb3ZlRmlsZUlkKHBhdGgpO1xuICAgIH1cbiAgICBpZiAoc3RhbGVQYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICBhd2FpdCB0aGlzLnNhdmVNYXBwaW5ncygpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdXRpb25RdWV1ZSAtIGZpbGVJZCBcdUIyMDRcdUI3N0QgXHVENTc0XHVBQ0IwIFx1RDA1MFxuICogQE1YOk5PVEU6IFtBVVRPXSBMUlUgZXZpY3Rpb25cdUM3M0NcdUI4NUMgXHVCMjA0XHVCNzdEIGZpbGVJZCBcdUNEOTRcdUM4MDFcbiAqIEBNWDpSRUFTT046IFJFUS1CRi01MDMgLSBmaWxlSWQgXHVCMjA0XHVCNzdEIFx1QzJEQyBcdUFDQkRcdUFDRTAgXHVCODVDXHVBREY4IFx1QkMwRiBwYXRoIHJlc29sdXRpb24gXHVEMDUwXG4gKi9cbmNsYXNzIFJlc29sdXRpb25RdWV1ZSB7XG4gIHByaXZhdGUgcXVldWU6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICBwcml2YXRlIHJlYWRvbmx5IG1heFNpemUgPSAxMDA7XG5cbiAgLyoqXG4gICAqIHBhdGhcdUI5N0MgXHVEMDUwXHVDNUQwIFx1Q0Q5NFx1QUMwMCAoTFJVIGV2aWN0aW9uKVxuICAgKi9cbiAgYWRkKHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlLnNpemUgPj0gdGhpcy5tYXhTaXplKSB7XG4gICAgICAvLyBcdUNDQUIgXHVCQzg4XHVDOUY4IFx1RDU2RFx1QkFBOSBcdUM4MUNcdUFDNzAgKExSVSlcbiAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5xdWV1ZS52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICBpZiAoZmlyc3QpIHRoaXMucXVldWUuZGVsZXRlKGZpcnN0KTtcbiAgICB9XG4gICAgdGhpcy5xdWV1ZS5hZGQocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogcGF0aFx1Qjk3QyBcdUQwNTBcdUM1RDBcdUMxMUMgXHVDODFDXHVBQzcwXG4gICAqL1xuICByZW1vdmUocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5xdWV1ZS5kZWxldGUocGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogcGF0aFx1QUMwMCBcdUQwNTBcdUM1RDAgXHVDNzg4XHVCMjk0XHVDOUMwIFx1RDY1NVx1Qzc3OFxuICAgKi9cbiAgaGFzKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnF1ZXVlLmhhcyhwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQwNTAgXHVDQzk4XHVCOUFDIChSRVEtUlEtMzAxLCBSRVEtUlEtMzAyKVxuICAgKi9cbiAgYXN5bmMgcHJvY2Vzc1F1ZXVlKHN5bmNTZXJ2aWNlOiBTeW5jU2VydmljZSwgZmlsZUlkVHJhY2tlcjogRmlsZUlkVHJhY2tlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1Q0M5OFx1QjlBQ1x1RDU2MCBcdUFDQkRcdUI4NUMgXHVCQUE5XHVCODVEIFx1QzIxOFx1QzlEMSAoU2V0XHVDNzQ0IFx1QzIxQ1x1RDY4Q1x1RDU1OFx1QkE3NFx1QzExQyBcdUMyMThcdUM4MTVcdUQ1NThcdUJBNzQgXHVDNTQ4IFx1QjQyOClcbiAgICBjb25zdCBwYXRoc1RvUHJvY2VzcyA9IEFycmF5LmZyb20odGhpcy5xdWV1ZSk7XG5cbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHNUb1Byb2Nlc3MpIHtcbiAgICAgIGNvbnN0IGZpbGVJZCA9IGZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKHBhdGgpO1xuXG4gICAgICBpZiAoZmlsZUlkKSB7XG4gICAgICAgIC8vIGZpbGVJZFx1QUMwMCBcdUM3ODhcdUM3M0NcdUJBNzQgdXBkYXRlIFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUM4MDRcdUMxQTFcbiAgICAgICAgYXdhaXQgc3luY1NlcnZpY2Uuc2VuZEZpbGVVcGRhdGUoZmlsZUlkLCBwYXRoLCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaWxlSWRcdUFDMDAgXHVDNUM2XHVDNzNDXHVCQTc0IGNyZWF0ZSBcdUJBNTRcdUMyRENcdUM5QzAgXHVDODA0XHVDMUExIChwYXRoXHVCOUNDKVxuICAgICAgICBzeW5jU2VydmljZS5zZW5kRmlsZUNyZWF0ZShwYXRoLCAnJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1Q0M5OFx1QjlBQ1x1QjQxQyBcdUQ1NkRcdUJBQTkgXHVDODFDXHVBQzcwXG4gICAgICB0aGlzLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHVEMDUwIFx1Q0M5OFx1QjlBQyAoUkVRLUJGLTUwMylcbiAgICogQGRlcHJlY2F0ZWQgcHJvY2Vzc1F1ZXVlIFx1QzBBQ1x1QzZBOSBcdUFEOENcdUM3QTVcbiAgICovXG4gIGFzeW5jIHByb2Nlc3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHVENjA0XHVDN0FDXHVCMjk0IFx1Qjg1Q1x1QURGOFx1QjlDQyBcdUNEOUNcdUI4MjVcbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5xdWV1ZSkge1xuICAgICAgY29uc29sZS53YXJuKGBbUmVzb2x1dGlvblF1ZXVlXSBQZW5kaW5nIGZpbGVJZCByZXNvbHV0aW9uIGZvcjogJHtwYXRofWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQwNTAgXHVCRTQ0XHVDNkIwXHVBRTMwXG4gICAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnF1ZXVlLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogXHVEMDUwIFx1RDA2Q1x1QUUzMCBcdUJDMThcdUQ2NThcbiAgICovXG4gIHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZS5zaXplO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZTeW5jUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IFZTeW5jU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBzeW5jU2VydmljZTogU3luY1NlcnZpY2UgfCBudWxsID0gbnVsbDtcbiAgZmlsZUlkVHJhY2tlciE6IEZpbGVJZFRyYWNrZXI7XG4gIHJlc29sdXRpb25RdWV1ZSE6IFJlc29sdXRpb25RdWV1ZTtcbiAgcHJpdmF0ZSBldmVudFJlZnM6IEV2ZW50UmVmW10gPSBbXTtcbiAgcHJpdmF0ZSBsYXN0Q29ubmVjdGVkU2V0dGluZ3MgPSB7IHNlcnZlclVybDogJycsIHZhdWx0SWQ6ICcnLCBhcGlLZXk6ICcnIH07XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIC8vIEluaXRpYWxpemUgdHJhY2tlcnMgYWZ0ZXIgcGx1Z2luIGlzIGxvYWRlZCAoaGFzIGFwcCBjb250ZXh0KVxuICAgIHRoaXMuZmlsZUlkVHJhY2tlciA9IG5ldyBGaWxlSWRUcmFja2VyKHRoaXMpO1xuICAgIHRoaXMucmVzb2x1dGlvblF1ZXVlID0gbmV3IFJlc29sdXRpb25RdWV1ZSgpO1xuXG4gICAgLy8gUkVRLVBMLTEwMTogUGx1Z2luIGxvYWQgXHUyMTkyIHNldHRpbmdzIGluaXRcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gUkVRLUxPLTIwMzogZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUI4NUNcdUI0RENcbiAgICBhd2FpdCB0aGlzLmZpbGVJZFRyYWNrZXIubG9hZE1hcHBpbmdzKCk7XG5cbiAgICAvLyBTeW5jIGN1cnJlbnRWZXJzaW9uIGZyb20gbWFuaWZlc3QgYW5kIHBlcnNpc3RcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5jdXJyZW50VmVyc2lvbiAhPT0gdGhpcy5tYW5pZmVzdC52ZXJzaW9uKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmN1cnJlbnRWZXJzaW9uID0gdGhpcy5tYW5pZmVzdC52ZXJzaW9uO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICAvLyBSRVEtUEwtMTAyOiBJbml0aWFsaXplIFx1MjE5MiB3b3Jrc3BhY2Uub25MYXlvdXRSZWFkeVxuICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVN5bmMoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlZ2lzdGVyIHNldHRpbmdzIHRhYlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgVlN5bmNTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG4gIH1cblxuICBvbnVubG9hZCgpIHtcbiAgICB0aGlzLmNsZWFudXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHN5bmMgc2VydmljZSB3aGVuIHNldHRpbmdzIGFyZSBjb25maWd1cmVkXG4gICAqL1xuICBpbml0aWFsaXplU3luYygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3Muc2VydmVyVXJsIHx8ICF0aGlzLnNldHRpbmdzLnZhdWx0SWQgfHwgIXRoaXMuc2V0dGluZ3MuYXBpS2V5KSB7XG4gICAgICByZXR1cm47IC8vIFNldHRpbmdzIG5vdCBjb25maWd1cmVkIHlldFxuICAgIH1cblxuICAgIHRoaXMuc3luY1NlcnZpY2UgPSBuZXcgU3luY1NlcnZpY2UoXG4gICAgICB0aGlzLnNldHRpbmdzLnNlcnZlclVybCxcbiAgICAgIHRoaXMuc2V0dGluZ3MudmF1bHRJZCxcbiAgICAgIHRoaXMuc2V0dGluZ3MuYXBpS2V5LFxuICAgICk7XG5cbiAgICAvLyBSRVEtQ1ctMTAxLCBSRVEtQ1ctMTAyOiBTeW5jQ2FsbGJhY2tzIFx1QzEyNFx1QzgxNVxuICAgIGNvbnN0IGNhbGxiYWNrczogU3luY0NhbGxiYWNrcyA9IHtcbiAgICAgIG9uRmlsZUlkVXBkYXRlOiAocGF0aCwgZmlsZUlkKSA9PiB7XG4gICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zZXRGaWxlSWQocGF0aCwgZmlsZUlkKTtcbiAgICAgICAgdGhpcy5yZXNvbHV0aW9uUXVldWUucmVtb3ZlKHBhdGgpO1xuICAgICAgfSxcbiAgICAgIG9uRmlsZUlkUmVtb3ZlOiAocGF0aCkgPT4ge1xuICAgICAgICB0aGlzLmZpbGVJZFRyYWNrZXIucmVtb3ZlRmlsZUlkKHBhdGgpO1xuICAgICAgfSxcbiAgICAgIGdldFBhdGhCeUZpbGVJZDogKGZpbGVJZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5maWxlSWRUcmFja2VyLmdldFBhdGgoZmlsZUlkKTtcbiAgICAgIH0sXG4gICAgICBnZXRGaWxlSWRCeVBhdGg6IChwYXRoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKHBhdGgpO1xuICAgICAgfSxcbiAgICAgIG9uRmlsZUNyZWF0ZTogYXN5bmMgKHBhdGgsIGNvbnRlbnQpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKHBhdGgsIGNvbnRlbnQpO1xuICAgICAgfSxcbiAgICAgIG9uRmlsZVVwZGF0ZTogYXN5bmMgKHBhdGgsIGNvbnRlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKTtcbiAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRmlsZURlbGV0ZTogYXN5bmMgKHBhdGgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKTtcbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5kZWxldGUoZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkZpbGVSZW5hbWU6IGFzeW5jIChvbGRQYXRoLCBuZXdQYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgob2xkUGF0aCk7XG4gICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQucmVuYW1lKGZpbGUsIG5ld1BhdGgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25Db25mbGljdDogKGNvbmZsaWN0SW5mbykgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tDb25mbGljdF0nLCBjb25mbGljdEluZm8pO1xuICAgICAgfSxcbiAgICAgIG9uTm90aWNlOiAobWVzc2FnZSkgPT4ge1xuICAgICAgICBuZXcgTm90aWNlKG1lc3NhZ2UpO1xuICAgICAgfSxcbiAgICAgIGhhc1Vuc2F2ZWRDaGFuZ2VzOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gc3R1YiBmb3Igbm93XG4gICAgICB9LFxuICAgICAgcmVhZEZpbGU6IChwYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG4gICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICAvLyBcdUIzRDlcdUFFMzAgXHVDNzdEXHVBRTMwXHVCMjk0IFx1QkQ4OFx1QUMwMFx1QjJBNVx1RDU1OFx1QkJDMFx1Qjg1QyBcdUJFNDggXHVCQjM4XHVDNzkwXHVDNUY0IFx1QkMxOFx1RDY1OFxuICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9LFxuICAgICAgcGF0aEV4aXN0czogKHBhdGgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKSAhPT0gbnVsbDtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyUmVjb25uZWN0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3luY1NlcnZpY2U/LmNvbm5lY3QoKTtcbiAgICAgIH0sXG4gICAgICBvbkVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNTZXJ2aWNlIEVycm9yXScsIGVycm9yKTtcbiAgICAgICAgbmV3IE5vdGljZShgXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzYyNFx1Qjk1ODogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgfSxcbiAgICAgIHF1ZXVlUmVzb2x1dGlvbjogKF9maWxlSWQsIHBhdGgpID0+IHtcbiAgICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgICB0aGlzLnJlc29sdXRpb25RdWV1ZS5hZGQocGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDRjVDXHVCQzMxIChSZWNvbm5lY3Rpb24gU3luYyBDYWxsYmFja3MpXG4gICAgICBvblJlY29ubmVjdFJlc3BvbnNlOiAoc2VydmVyRmlsZXMpID0+IHtcbiAgICAgICAgdGhpcy5zeW5jU2VydmljZT8ucGVyZm9ybVJlY29ubmVjdFN5bmMoc2VydmVyRmlsZXMpO1xuICAgICAgfSxcbiAgICAgIGNvbGxlY3RMb2NhbEZpbGVzOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3RMb2NhbEZpbGVzKCk7XG4gICAgICB9LFxuICAgICAgcmVhZEZpbGVBc3luYzogYXN5bmMgKHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSxcbiAgICAgIHNob3dTdGF0dXNCYXI6IChtZXNzYWdlKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzQmFyKG1lc3NhZ2UpO1xuICAgICAgfSxcbiAgICAgIGNsZWFyU3RhdHVzQmFyOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xlYXJTdGF0dXNCYXIoKTtcbiAgICAgIH0sXG4gICAgICByZXNvbHZlQ29uZmxpY3Q6IGFzeW5jIChjb25mbGljdCkgPT4ge1xuICAgICAgICBjb25zdCBtb2RhbCA9IG5ldyBDb25mbGljdE1vZGFsKHRoaXMuYXBwLCBjb25mbGljdCk7XG4gICAgICAgIHJldHVybiBtb2RhbC53YWl0KCk7XG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0aGlzLnN5bmNTZXJ2aWNlLnNldENhbGxiYWNrcyhjYWxsYmFja3MpO1xuXG4gICAgdGhpcy5sYXN0Q29ubmVjdGVkU2V0dGluZ3MgPSB7XG4gICAgICBzZXJ2ZXJVcmw6IHRoaXMuc2V0dGluZ3Muc2VydmVyVXJsLFxuICAgICAgdmF1bHRJZDogdGhpcy5zZXR0aW5ncy52YXVsdElkLFxuICAgICAgYXBpS2V5OiB0aGlzLnNldHRpbmdzLmFwaUtleSxcbiAgICB9O1xuXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50cygpO1xuICAgIHRoaXMuc3luY1NlcnZpY2UuY29ubmVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIE9ic2lkaWFuIHZhdWx0IGV2ZW50IGhhbmRsZXJzXG4gICAqL1xuICBwcml2YXRlIHJlZ2lzdGVyRXZlbnRzKCk6IHZvaWQge1xuICAgIC8vIFJFUS1QTC0xMDM6IEZpbGUgY3JlYXRlXG4gICAgY29uc3QgY3JlYXRlUmVmID0gdGhpcy5hcHAudmF1bHQub24oJ2NyZWF0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmICF0aGlzLmlzU2tpcHBlZChmaWxlLnBhdGgpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZUNyZWF0ZShmaWxlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJFUS1QTC0xMDQ6IEZpbGUgbW9kaWZ5XG4gICAgY29uc3QgbW9kaWZ5UmVmID0gdGhpcy5hcHAudmF1bHQub24oJ21vZGlmeScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmICF0aGlzLmlzU2tpcHBlZChmaWxlLnBhdGgpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZU1vZGlmeShmaWxlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJFUS1QTC0xMDU6IEZpbGUgZGVsZXRlXG4gICAgY29uc3QgZGVsZXRlUmVmID0gdGhpcy5hcHAudmF1bHQub24oJ2RlbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmICF0aGlzLmlzU2tpcHBlZChmaWxlLnBhdGgpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZURlbGV0ZShmaWxlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJFUS1QTC0xMDY6IEZpbGUgcmVuYW1lXG4gICAgY29uc3QgcmVuYW1lUmVmID0gdGhpcy5hcHAudmF1bHQub24oJ3JlbmFtZScsIChmaWxlLCBvbGRQYXRoKSA9PiB7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmICF0aGlzLmlzU2tpcHBlZChmaWxlLnBhdGgpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZVJlbmFtZShmaWxlLCBvbGRQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZXZlbnRSZWZzID0gW2NyZWF0ZVJlZiwgbW9kaWZ5UmVmLCBkZWxldGVSZWYsIHJlbmFtZVJlZl07XG4gICAgdGhpcy5ldmVudFJlZnMuZm9yRWFjaChyZWYgPT4gdGhpcy5yZWdpc3RlckV2ZW50KHJlZikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmaWxlIGNyZWF0ZSBldmVudCAoUkVRLUVILTQwMSlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsZUNyZWF0ZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTFcdUM1RDBcdUIyOTQgXHVCNzdDXHVDNzc0XHVCRTBDIFx1QzJGMVx1RDA2QyBcdUM3NzRcdUJDQTRcdUQyQjggXHVCQjM0XHVDMkRDIChSRVEtUlQtMTAzKVxuICAgIGlmICh0aGlzLnN5bmNTZXJ2aWNlPy5pc1N5bmNpbmcpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgIHRoaXMuc3luY1NlcnZpY2U/LnNlbmRGaWxlQ3JlYXRlKGZpbGUucGF0aCwgY29udGVudCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1toYW5kbGVGaWxlQ3JlYXRlXScsIHtcbiAgICAgICAgaGFuZGxlcjogJ2hhbmRsZUZpbGVDcmVhdGUnLFxuICAgICAgICBwYXRoOiBmaWxlLnBhdGgsXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGZpbGUgbW9kaWZ5IGV2ZW50IChSRVEtQkYtNTA0LCBSRVEtRUgtNDAxKVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVGaWxlTW9kaWZ5KGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzkxMVx1QzVEMFx1QjI5NCBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUJCMzRcdUMyRENcbiAgICBpZiAodGhpcy5zeW5jU2VydmljZT8uaXNTeW5jaW5nKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICBjb25zdCBmaWxlSWQgPSB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKGZpbGUucGF0aCk7XG5cbiAgICAgIGlmICghZmlsZUlkKSB7XG4gICAgICAgIC8vIGZpbGVJZFx1QUMwMCBcdUM1QzZcdUM3M0NcdUJBNzQgZmlsZTpjcmVhdGVcdUI4NUMgXHVDODA0XHVDMUExXG4gICAgICAgIHRoaXMuc3luY1NlcnZpY2U/LnNlbmRGaWxlQ3JlYXRlKGZpbGUucGF0aCwgY29udGVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zeW5jU2VydmljZT8uc2VuZEZpbGVVcGRhdGUoZmlsZUlkLCBmaWxlLnBhdGgsIGNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbaGFuZGxlRmlsZU1vZGlmeV0nLCB7XG4gICAgICAgIGhhbmRsZXI6ICdoYW5kbGVGaWxlTW9kaWZ5JyxcbiAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmaWxlIGRlbGV0ZSBldmVudCAoUkVRLUJGLTUwMSwgUkVRLUVILTQwMSlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsZURlbGV0ZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTFcdUM1RDBcdUIyOTQgXHVCNzdDXHVDNzc0XHVCRTBDIFx1QzJGMVx1RDA2QyBcdUM3NzRcdUJDQTRcdUQyQjggXHVCQjM0XHVDMkRDXG4gICAgaWYgKHRoaXMuc3luY1NlcnZpY2U/LmlzU3luY2luZykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGVJZCA9IHRoaXMuZmlsZUlkVHJhY2tlci5nZXRGaWxlSWQoZmlsZS5wYXRoKTtcblxuICAgICAgaWYgKCFmaWxlSWQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbRmlsZUlkVHJhY2tlcl0gZmlsZUlkIG5vdCBmb3VuZCBmb3IgcGF0aDogJHtmaWxlLnBhdGh9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zeW5jU2VydmljZT8uc2VuZEZpbGVEZWxldGUoZmlsZUlkKTtcbiAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5yZW1vdmVGaWxlSWQoZmlsZS5wYXRoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZUZpbGVEZWxldGVdJywge1xuICAgICAgICBoYW5kbGVyOiAnaGFuZGxlRmlsZURlbGV0ZScsXG4gICAgICAgIHBhdGg6IGZpbGUucGF0aCxcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZmlsZSByZW5hbWUgZXZlbnQgKFJFUS1CRi01MDIsIFJFUS1FSC00MDEpXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZUZpbGVSZW5hbWUoZmlsZTogVEZpbGUsIG9sZFBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTFcdUM1RDBcdUIyOTQgXHVCNzdDXHVDNzc0XHVCRTBDIFx1QzJGMVx1RDA2QyBcdUM3NzRcdUJDQTRcdUQyQjggXHVCQjM0XHVDMkRDXG4gICAgaWYgKHRoaXMuc3luY1NlcnZpY2U/LmlzU3luY2luZykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGVJZCA9IHRoaXMuZmlsZUlkVHJhY2tlci5nZXRGaWxlSWQob2xkUGF0aCk7XG5cbiAgICAgIGlmICghZmlsZUlkKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0ZpbGVJZFRyYWNrZXJdIGZpbGVJZCBub3QgZm91bmQgZm9yIHBhdGg6ICR7b2xkUGF0aH1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN5bmNTZXJ2aWNlPy5zZW5kRmlsZVJlbmFtZShmaWxlSWQsIG9sZFBhdGgsIGZpbGUucGF0aCk7XG4gICAgICB0aGlzLmZpbGVJZFRyYWNrZXIucmVtb3ZlRmlsZUlkKG9sZFBhdGgpOyAvLyBSZW1vdmUgb2xkIG1hcHBpbmdcbiAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zZXRGaWxlSWQoZmlsZS5wYXRoLCBmaWxlSWQpOyAvLyBBZGQgbmV3IG1hcHBpbmdcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZUZpbGVSZW5hbWVdJywge1xuICAgICAgICBoYW5kbGVyOiAnaGFuZGxlRmlsZVJlbmFtZScsXG4gICAgICAgIHBhdGg6IGZpbGUucGF0aCxcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUI4NUNcdUNFRUMgXHVEMzBDXHVDNzdDIFx1QkFBOVx1Qjg1RCBcdUMyMThcdUM5RDEgKFJFUS1GQy0xMDEpXG4gICAqIFx1RDU3NFx1QzJEQyBcdUFDQzRcdUMwQjAgXHVCQzBGIHNraXBwZWRQYXRocy9cdUJDMTRcdUM3NzRcdUIxMDhcdUI5QUMgXHVENTQ0XHVEMTMwXHVCOUMxIFx1RDNFQ1x1RDU2OFxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBjb2xsZWN0TG9jYWxGaWxlcygpOiBQcm9taXNlPEFycmF5PHsgcGF0aDogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCBhbGxGaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCk7XG5cbiAgICBjb25zdCBlbGlnaWJsZSA9IGFsbEZpbGVzLmZpbHRlcihcbiAgICAgIGYgPT4gIXRoaXMuaXNCaW5hcnlGaWxlKGYucGF0aCkgJiYgIXRoaXMuaXNTa2lwcGVkKGYucGF0aCksXG4gICAgKTtcblxuICAgIGNvbnN0IHNldHRsZWQgPSBhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoXG4gICAgICBlbGlnaWJsZS5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBoYXNoQ29udGVudChjb250ZW50KTtcbiAgICAgICAgcmV0dXJuIHsgcGF0aDogZmlsZS5wYXRoLCBoYXNoIH07XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHNldHRsZWRcbiAgICAgIC5maWx0ZXIoKHIpOiByIGlzIFByb21pc2VGdWxmaWxsZWRSZXN1bHQ8eyBwYXRoOiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9PiA9PiByLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcpXG4gICAgICAubWFwKHIgPT4gci52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogXHVCQzE0XHVDNzc0XHVCMTA4XHVCOUFDIFx1RDMwQ1x1Qzc3QyBcdUQ2NTVcdUM3NzggKFJFUS1GQy0zMDIpXG4gICAqL1xuICBwcml2YXRlIGlzQmluYXJ5RmlsZShwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBiaW5hcnlFeHRlbnNpb25zID0gWycucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmdpZicsICcuYm1wJywgJy5zdmcnLCAnLnBkZicsICcuemlwJywgJy50YXInLCAnLmd6J107XG4gICAgcmV0dXJuIGJpbmFyeUV4dGVuc2lvbnMuc29tZShleHQgPT4gcGF0aC50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKGV4dCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXR1c0JhciBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggKFJFUS1VSS0wMDEsIFJFUS1VSS0wMDIpXG4gICAqL1xuICBwcml2YXRlIHN0YXR1c0Jhckl0ZW06IGFueSA9IG51bGw7XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdGF0dXNCYXIobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnN0YXR1c0Jhckl0ZW0pIHtcbiAgICAgIHRoaXMuc3RhdHVzQmFySXRlbSA9IHRoaXMuYWRkU3RhdHVzQmFySXRlbSgpO1xuICAgIH1cbiAgICB0aGlzLnN0YXR1c0Jhckl0ZW0uc2V0VGV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0dXNCYXIgXHVEMDc0XHVCOUFDXHVDNUI0XG4gICAqL1xuICBwcml2YXRlIGNsZWFyU3RhdHVzQmFyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0YXR1c0Jhckl0ZW0pIHtcbiAgICAgIHRoaXMuc3RhdHVzQmFySXRlbS5zZXRUZXh0KCcnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgcGF0aCBzaG91bGQgYmUgc2tpcHBlZFxuICAgKi9cbiAgcHJpdmF0ZSBpc1NraXBwZWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLmF1dG9TeW5jKSB7XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gU2tpcCBhbGwgaWYgYXV0b1N5bmMgaXMgZGlzYWJsZWRcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy5za2lwcGVkUGF0aHMuc29tZShwYXR0ZXJuID0+IHtcbiAgICAgIGlmIChwYXR0ZXJuLnN0YXJ0c1dpdGgoJyonKSkge1xuICAgICAgICByZXR1cm4gcGF0aC5lbmRzV2l0aChwYXR0ZXJuLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXRoLnN0YXJ0c1dpdGgocGF0dGVybik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW51cCByZXNvdXJjZXMgb24gdW5sb2FkIChSRVEtVUwtMjAxLCBSRVEtVUwtMjAyKVxuICAgKi9cbiAgY2xlYW51cCgpOiB2b2lkIHtcbiAgICAvLyBSRVEtVUwtMjAxOiBmaWxlSWQgXHVCOUU0XHVENTUxIFx1QzgwMFx1QzdBNSAoZmlyZS1hbmQtZm9yZ2V0KVxuICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zYXZlTWFwcGluZ3MoKS5jYXRjaChlID0+XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2xlYW51cF0gc2F2ZU1hcHBpbmdzIFx1QzJFNFx1RDMyODonLCBlKSxcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuc3luY1NlcnZpY2UpIHtcbiAgICAgIC8vIFJFUS1VTC0yMDE6IFx1QzYyNFx1RDUwNFx1Qjc3Q1x1Qzc3OCBcdUQwNTAgXHVDOTg5XHVDMkRDIFx1RDUwQ1x1QjdFQ1x1QzJEQyBcdUMyRENcdUIzQzRcbiAgICAgIHRoaXMuc3luY1NlcnZpY2UuZmx1c2hBbmREaXNjb25uZWN0KDIwMDApLmNhdGNoKGUgPT5cbiAgICAgICAgY29uc29sZS5lcnJvcignW2NsZWFudXBdIGZsdXNoQW5kRGlzY29ubmVjdCBcdUMyRTRcdUQzMjg6JywgZSksXG4gICAgICApO1xuXG4gICAgICAvLyBSRVEtVUwtMjAxOiBkZWJvdW5jZSBcdUQwQzBcdUM3NzRcdUJBMzggXHVDODE1XHVCOUFDXG4gICAgICB0aGlzLnN5bmNTZXJ2aWNlLmNsZWFudXBUaW1lcnMoKTtcbiAgICB9XG5cbiAgICAvLyBcdUFFMzBcdUM4NzQgXHVDODE1XHVCOUFDIFx1Qjg1Q1x1QzlDMVxuICAgIHRoaXMuZXZlbnRSZWZzLmZvckVhY2gocmVmID0+IHRoaXMuYXBwLnZhdWx0Lm9mZnJlZihyZWYpKTtcbiAgICB0aGlzLmV2ZW50UmVmcyA9IFtdO1xuICAgIHRoaXMuc3luY1NlcnZpY2UgPSBudWxsO1xuICAgIHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzID0geyBzZXJ2ZXJVcmw6ICcnLCB2YXVsdElkOiAnJywgYXBpS2V5OiAnJyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgc2V0dGluZ3MgZnJvbSBzdG9yYWdlXG4gICAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGF0YSA9IChhd2FpdCB0aGlzLmxvYWREYXRhKCkpIHx8IHt9O1xuICAgIGNvbnN0IHsgc2V0dGluZ3M6IF9uZXN0ZWQsIC4uLnNhdmVkIH0gPSBkYXRhLnNldHRpbmdzIHx8IGRhdGE7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIHNhdmVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHNldHRpbmdzIHRvIHN0b3JhZ2UgKFJFUS1MQy00MDEpXG4gICAqIFx1QzVGMFx1QUNCMCBcdUMxMjRcdUM4MTUgXHVCQ0MwXHVBQ0JEIFx1QzJEQyBcdUM3QUNcdUM1RjBcdUFDQjAgXHVEMkI4XHVCOUFDXHVBQzcwXG4gICAqL1xuICBhc3luYyBzYXZlU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyBzZXR0aW5nczogXywgLi4uY2xlYW4gfSA9IHRoaXMuc2V0dGluZ3MgYXMgYW55O1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEoeyBzZXR0aW5nczogY2xlYW4gfSk7XG5cbiAgICAvLyBSRVEtTEMtNDAxOiBcdUQ2NUNcdUMxMzEgXHVDNUYwXHVBQ0IwIFx1QzEyNFx1QzgxNVx1QUNGQyBcdUQ2MDRcdUM3QUMgXHVDMTI0XHVDODE1IFx1QkU0NFx1QUQ1MFxuICAgIGNvbnN0IGNvbm5lY3Rpb25DaGFuZ2VkID1cbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VydmVyVXJsICE9PSB0aGlzLmxhc3RDb25uZWN0ZWRTZXR0aW5ncy5zZXJ2ZXJVcmwgfHxcbiAgICAgIHRoaXMuc2V0dGluZ3MudmF1bHRJZCAhPT0gdGhpcy5sYXN0Q29ubmVjdGVkU2V0dGluZ3MudmF1bHRJZCB8fFxuICAgICAgdGhpcy5zZXR0aW5ncy5hcGlLZXkgIT09IHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzLmFwaUtleTtcblxuICAgIGlmIChjb25uZWN0aW9uQ2hhbmdlZCkge1xuICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgICB0aGlzLmluaXRpYWxpemVTeW5jKCk7XG4gICAgfVxuICB9XG5cbn1cbiIsICIvKipcbiAqIFBsdWdpbiBzZXR0aW5ncyBmb3IgVmVjdG9yIE9ic2lkaWFuIHBsdWdpblxuICogQE1YOk5PVEU6IFtBVVRPXSBTZXR0aW5ncyBkYXRhIHN0cnVjdHVyZSAoVUkgaXMgaW4gc2V0dGluZ3MtdGFiLnRzKVxuICovXG5cbmltcG9ydCB0eXBlIHsgVlN5bmNTZXR0aW5ncyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgeyB0eXBlIFZTeW5jU2V0dGluZ3MgfTtcblxuLyoqXG4gKiBEZWZhdWx0IHBsdWdpbiBzZXR0aW5nc1xuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogVlN5bmNTZXR0aW5ncyA9IHtcbiAgc2VydmVyVXJsOiAnJyxcbiAgdmF1bHRJZDogJycsXG4gIGFwaUtleTogJycsXG4gIGF1dG9TeW5jOiB0cnVlLFxuICBza2lwcGVkUGF0aHM6IFtdLFxuICBjdXJyZW50VmVyc2lvbjogJycsXG4gIGRvd25sb2FkVXJsOiAnJyxcbn07XG4iLCAiaW1wb3J0IHsgUGx1Z2luU2V0dGluZ1RhYiwgQXBwLCBTZXR0aW5nLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBDb25uZWN0aW9uTW9kYWwgfSBmcm9tICcuL2Nvbm5lY3Rpb24tbW9kYWwnO1xuXG4vKipcbiAqIFBsdWdpbiBzZXR0aW5ncyB0YWJcbiAqIEBNWDpOT1RFOiBbQVVUT10gU2V0dGluZ3MgVUkgd2l0aCBjb25uZWN0aW9uIHN0YXR1cywgc3luYyBjb250cm9sLCBhdXRvLXN5bmMsIGFuZCBwbHVnaW4gdXBkYXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBWU3luY1NldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogYW55KSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICB0aGlzLnJlbmRlckNvbm5lY3Rpb25TZWN0aW9uKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLnJlbmRlclN5bmNDb250cm9sU2VjdGlvbihjb250YWluZXJFbCk7XG4gICAgdGhpcy5yZW5kZXJBdXRvU3luY1NlY3Rpb24oY29udGFpbmVyRWwpO1xuICAgIHRoaXMucmVuZGVyU2tpcHBlZFBhdGhzU2VjdGlvbihjb250YWluZXJFbCk7XG4gICAgdGhpcy5yZW5kZXJEb3dubG9hZFNlY3Rpb24oY29udGFpbmVyRWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnBsdWdpbi5zeW5jU2VydmljZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyQ29ubmVjdGlvblNlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgY29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZCgpO1xuICAgIGNvbnN0IHNlcnZlclVybCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLnNlcnZlclVybDtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1QkNGQ1x1RDJCOCBcdUM1RjBcdUFDQjAnKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgIGNvbm5lY3RlZFxuICAgICAgICAgID8gYFx1QzVGMFx1QUNCMFx1QjQyOCAtICR7c2VydmVyVXJsfWBcbiAgICAgICAgICA6IHNlcnZlclVybFxuICAgICAgICAgICAgPyBgXHVDNUYwXHVBQ0IwIFx1QzU0OCBcdUI0MjggLSAke3NlcnZlclVybH1gXG4gICAgICAgICAgICA6ICdcdUM1RjBcdUFDQjAgXHVDNTQ4IFx1QjQyOCcsXG4gICAgICApXG4gICAgICAuYWRkQnV0dG9uKGJ1dHRvbiA9PiB7XG4gICAgICAgIGlmIChjb25uZWN0ZWQpIHtcbiAgICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnXHVDNUYwXHVBQ0IwXHVCNDI4Jykuc2V0Q2xhc3MoJ21vZC1jdGEnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnXHVDNUYwXHVBQ0IwIFx1QzEyNFx1QzgxNScpO1xuICAgICAgICB9XG4gICAgICAgIGJ1dHRvbi5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICBuZXcgQ29ubmVjdGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLnBsdWdpbiwgKCkgPT4gdGhpcy5kaXNwbGF5KCkpLm9wZW4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuXHQgKiBATVg6V0FSTjogW0FVVE9dIFx1QjNEOVx1QUUzMFx1RDY1NCBcdUMyRENcdUM3OTEvXHVDOTExXHVDOUMwIC0gY2xlYW51cC9pbml0aWFsaXplU3luYyBcdUM5QzFcdUM4MTEgXHVENjM4XHVDRDlDXG5cdCAqIEBNWDpSRUFTT046IHN5bmNTZXJ2aWNlIFx1Qjc3Q1x1Qzc3NFx1RDUwNFx1QzBBQ1x1Qzc3NFx1RDA3NCBcdUFEMDBcdUI5QUNcdUI4NUMgXHVDNzc4XHVENTc0IFx1QkQ4MFx1Qzc5MVx1QzZBOSBcdUFDMDBcdUIyQTVcblx0ICovXG4gIHByaXZhdGUgcmVuZGVyU3luY0NvbnRyb2xTZWN0aW9uKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM4MUNcdUM1QjQnKVxuICAgICAgLnNldERlc2MoJ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUMyRENcdUM3OTEvXHVDOTExXHVDOUMwJylcbiAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IHtcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLnN5bmNTZXJ2aWNlKSB7XG4gICAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTFcdUM5QzAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzJEQ1x1Qzc5MScpO1xuICAgICAgICB9XG4gICAgICAgIGJ1dHRvbi5zZXREaXNhYmxlZCghdGhpcy5pc0Nvbm5lY3RlZCgpKTtcblxuICAgICAgICBidXR0b24ub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMucGx1Z2luLnN5bmNTZXJ2aWNlKSB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5jbGVhbnVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLmluaXRpYWxpemVTeW5jKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJBdXRvU3luY1NlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQXV0byBTeW5jJylcbiAgICAgIC5zZXREZXNjKCdBdXRvbWF0aWNhbGx5IHN5bmMgZmlsZSBjaGFuZ2VzJylcbiAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxuICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1N5bmMpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvU3luYyA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclNraXBwZWRQYXRoc1NlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnU2tpcHBlZCBQYXRocycpXG4gICAgICAuc2V0RGVzYygnUGF0aHMgdG8gc2tpcCBkdXJpbmcgc3luYyAob25lIHBlciBsaW5lKScpXG4gICAgICAuYWRkVGV4dEFyZWEodGV4dCA9PiB0ZXh0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignLm9ic2lkaWFuXFxuLnRyYXNoJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNraXBwZWRQYXRocy5qb2luKCdcXG4nKSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNraXBwZWRQYXRocyA9IHZhbHVlXG4gICAgICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAubWFwKGxpbmUgPT4gbGluZS50cmltKCkpXG4gICAgICAgICAgICAuZmlsdGVyKGxpbmUgPT4gbGluZS5sZW5ndGggPiAwKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJEb3dubG9hZFNlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgZG93bmxvYWRVcmxJbnB1dCA9IHsgdmFsdWU6IHRoaXMucGx1Z2luLnNldHRpbmdzLmRvd25sb2FkVXJsIHx8ICcnIH07XG4gICAgbGV0IGRvd25sb2FkQnV0dG9uOiBhbnkgPSBudWxsO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHVENTBDXHVCN0VDXHVBREY4XHVDNzc4IFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOCcpXG4gICAgICAuc2V0RGVzYygndicgKyAodGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VycmVudFZlcnNpb24gfHwgdGhpcy5wbHVnaW4ubWFuaWZlc3QudmVyc2lvbikpXG4gICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdodHRwczovL2V4YW1wbGUuY29tL21haW4uanMnKVxuICAgICAgICAuc2V0VmFsdWUoZG93bmxvYWRVcmxJbnB1dC52YWx1ZSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGRvd25sb2FkVXJsSW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kb3dubG9hZFVybCA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIGRvd25sb2FkQnV0dG9uPy5zZXREaXNhYmxlZCghdmFsdWUpO1xuICAgICAgICB9KSlcbiAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IHtcbiAgICAgICAgZG93bmxvYWRCdXR0b24gPSBidXR0b247XG4gICAgICAgIGJ1dHRvblxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMnKVxuICAgICAgICAgIC5zZXREaXNhYmxlZCghZG93bmxvYWRVcmxJbnB1dC52YWx1ZSlcbiAgICAgICAgICAuc2V0Q2xhc3MoJ21vZC1jdGEnKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghZG93bmxvYWRVcmxJbnB1dC52YWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzkxMS4uLicpO1xuICAgICAgICAgICAgYnV0dG9uLnNldERpc2FibGVkKHRydWUpO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBiYXNlVXJsID0gZG93bmxvYWRVcmxJbnB1dC52YWx1ZS5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbiAgICAgICAgICAgICAgY29uc3QgdHMgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IFtcbiAgICAgICAgICAgICAgICB7IHVybDogYCR7YmFzZVVybH0vcHVibGljL3YxL3BsdWdpbi9tYWluLmpzP190PSR7dHN9YCwgbmFtZTogJ21haW4uanMnIH0sXG4gICAgICAgICAgICAgICAgeyB1cmw6IGAke2Jhc2VVcmx9L3B1YmxpYy92MS9wbHVnaW4vbWFuaWZlc3QuanNvbj9fdD0ke3RzfWAsIG5hbWU6ICdtYW5pZmVzdC5qc29uJyB9LFxuICAgICAgICAgICAgICAgIHsgdXJsOiBgJHtiYXNlVXJsfS9wdWJsaWMvdjEvcGx1Z2luL3N0eWxlcy5jc3M/X3Q9JHt0c31gLCBuYW1lOiAnc3R5bGVzLmNzcycgfSxcbiAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChmaWxlLnVybCwgeyBjYWNoZTogJ25vLXN0b3JlJyB9IGFzIFJlcXVlc3RJbml0KTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlcy5vayAmJiBmaWxlLm5hbWUgPT09ICdzdHlsZXMuY3NzJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgJHtmaWxlLm5hbWV9IFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUMyRTRcdUQzMjggKCR7cmVzLnN0YXR1c30pYCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmFkYXB0ZXIud3JpdGUoXG4gICAgICAgICAgICAgICAgICBgLm9ic2lkaWFuL3BsdWdpbnMvdnN5bmMvJHtmaWxlLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOCBcdUM2NDRcdUI4Q0MuIE9ic2lkaWFuXHVDNzQ0IFx1QzdBQ1x1QzJEQ1x1Qzc5MVx1RDU3NFx1QzhGQ1x1QzEzOFx1QzY5NC4nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IFx1QzJFNFx1RDMyODogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ1x1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQycpO1xuICAgICAgICAgICAgICBidXR0b24uc2V0RGlzYWJsZWQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBNb2RhbCwgQXBwLCBTZXR0aW5nLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSBWU3luY1BsdWdpbiBmcm9tICcuL2luZGV4JztcblxuLyoqXG4gKiBDb25uZWN0aW9uIHNldHRpbmdzIG1vZGFsXG4gKiBATVg6Tk9URTogW0FVVE9dIE9ic2lkaWFuIE1vZGFsIGZvciBzZXJ2ZXIgVVJMLCB2YXVsdCBJRCwgQVBJIGtleSBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHBsdWdpbjogVlN5bmNQbHVnaW47XG5cdHByaXZhdGUgb25DbG9zZUNhbGxiYWNrPzogKCkgPT4gdm9pZDtcblxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBWU3luY1BsdWdpbiwgb25DbG9zZT86ICgpID0+IHZvaWQpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xuXHRcdHRoaXMub25DbG9zZUNhbGxiYWNrID0gb25DbG9zZTtcblx0fVxuXG5cdG9uT3BlbigpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCwgdGl0bGVFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHR0aXRsZUVsLnNldFRleHQoJ1x1QkNGQ1x1RDJCOCBcdUM1RjBcdUFDQjAgXHVDMTI0XHVDODE1Jyk7XG5cblx0XHRjb25zdCBzZXJ2ZXJVcmwgPSB7IHZhbHVlOiB0aGlzLnBsdWdpbi5zZXR0aW5ncy5zZXJ2ZXJVcmwgfHwgJycgfTtcblx0XHRjb25zdCB2YXVsdElkID0geyB2YWx1ZTogdGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRJZCB8fCAnJyB9O1xuXHRcdGNvbnN0IGFwaUtleSA9IHsgdmFsdWU6IHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleSB8fCAnJyB9O1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGVudEVsKVxuXHRcdFx0LnNldE5hbWUoJ1NlcnZlciBVUkwnKVxuXHRcdFx0LnNldERlc2MoJ1ZlY3RvciBzZXJ2ZXIgVVJMIChcdUM2MDg6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCknKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignaHR0cDovL2xvY2FsaG9zdDozMDAwJylcblx0XHRcdFx0LnNldFZhbHVlKHNlcnZlclVybC52YWx1ZSlcblx0XHRcdFx0Lm9uQ2hhbmdlKHZhbHVlID0+IHsgc2VydmVyVXJsLnZhbHVlID0gdmFsdWU7IH0pKTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5zZXROYW1lKCdWYXVsdCBJRCcpXG5cdFx0XHQuc2V0RGVzYygnVmVjdG9yIFx1QzExQ1x1QkM4NFx1QzVEMFx1QzExQyBcdUJDMUNcdUFFMDlcdUJDMUJcdUM3NDAgVmF1bHQgSUQnKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB0ZXh0XG5cdFx0XHRcdC5zZXRQbGFjZWhvbGRlcignRW50ZXIgdmF1bHQgSUQnKVxuXHRcdFx0XHQuc2V0VmFsdWUodmF1bHRJZC52YWx1ZSlcblx0XHRcdFx0Lm9uQ2hhbmdlKHZhbHVlID0+IHsgdmF1bHRJZC52YWx1ZSA9IHZhbHVlOyB9KSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnQVBJIEtleScpXG5cdFx0XHQuc2V0RGVzYygnXHVDNzc4XHVDOTlEXHVDNkE5IEFQSSBLZXknKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB7XG5cdFx0XHRcdHRleHRcblx0XHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ0VudGVyIEFQSSBrZXknKVxuXHRcdFx0XHRcdC5zZXRWYWx1ZShhcGlLZXkudmFsdWUpXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKHZhbHVlID0+IHsgYXBpS2V5LnZhbHVlID0gdmFsdWU7IH0pO1xuXHRcdFx0XHR0ZXh0LmlucHV0RWwudHlwZSA9ICdwYXNzd29yZCc7XG5cdFx0XHR9KTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnXHVDNzg0XHVDMkRDXHVDODAwXHVDN0E1Jylcblx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zZXJ2ZXJVcmwgPSBzZXJ2ZXJVcmwudmFsdWU7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy52YXVsdElkID0gdmF1bHRJZC52YWx1ZTtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleSA9IGFwaUtleS52YWx1ZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZSgnXHVDMTI0XHVDODE1XHVDNzc0IFx1QzgwMFx1QzdBNVx1QjQxOFx1QzVDOFx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKGBcdUM4MDBcdUM3QTUgXHVDMkU0XHVEMzI4OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSlcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnXHVDNUYwXHVBQ0IwJylcblx0XHRcdFx0LnNldENsYXNzKCdtb2QtY3RhJylcblx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUM1RjBcdUFDQjAgXHVDOTExLi4uJyk7XG5cdFx0XHRcdFx0YnRuLnNldERpc2FibGVkKHRydWUpO1xuXG5cdFx0XHRcdFx0Y29uc3QgdmFsaWRhdGlvbiA9IHRoaXMudmFsaWRhdGVTZXJ2ZXJVcmwoc2VydmVyVXJsLnZhbHVlKTtcblx0XHRcdFx0XHRpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoYFx1QzVGMFx1QUNCMCBcdUMyRTRcdUQzMjg6ICR7dmFsaWRhdGlvbi5lcnJvcn1gKTtcblx0XHRcdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUM1RjBcdUFDQjAnKTtcblx0XHRcdFx0XHRcdGJ0bi5zZXREaXNhYmxlZChmYWxzZSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgc3VjY2VzcyA9IGF3YWl0IHRoaXMuY2hlY2tBdXRoKHNlcnZlclVybC52YWx1ZSwgdmF1bHRJZC52YWx1ZSwgYXBpS2V5LnZhbHVlKTtcblx0XHRcdFx0XHRpZiAoc3VjY2Vzcykge1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3Muc2VydmVyVXJsID0gc2VydmVyVXJsLnZhbHVlO1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRJZCA9IHZhdWx0SWQudmFsdWU7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlLZXkgPSBhcGlLZXkudmFsdWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoJ1x1QzVGMFx1QUNCMCBcdUMxMzFcdUFDRjUnKTtcblx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YnRuLnNldEJ1dHRvblRleHQoJ1x1QzVGMFx1QUNCMCcpO1xuXHRcdFx0XHRcdFx0YnRuLnNldERpc2FibGVkKGZhbHNlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKVxuXHRcdFx0LmFkZEJ1dHRvbihidG4gPT4gYnRuXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdcdUM1RjBcdUFDQjBcdUQ1NzRcdUM4MUMnKVxuXHRcdFx0XHQub25DbGljaygoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMucGx1Z2luLnN5bmNTZXJ2aWNlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5jbGVhbnVwKCk7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKCdcdUM1RjBcdUFDQjBcdUM3NzQgXHVENTc0XHVDODFDXHVCNDE4XHVDNUM4XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdH0pKTtcblx0fVxuXG5cdG9uQ2xvc2UoKTogdm9pZCB7XG5cdFx0dGhpcy5jb250ZW50RWwuZW1wdHkoKTtcblx0XHR0aGlzLm9uQ2xvc2VDYWxsYmFjaz8uKCk7XG5cdH1cblxuXHQvKipcblx0ICogQE1YOldBUk46IFtBVVRPXSBTU1JGIFx1QkMyOVx1QzlDMCBVUkwgXHVBQzgwXHVDOTlEXG5cdCAqIEBNWDpSRUFTT046IFx1QzBBQ1x1QzZBOVx1Qzc5MCBcdUM3ODVcdUI4MjUgVVJMIFx1QUM4MFx1Qzk5RFx1QzczQ1x1Qjg1QyBcdUMwQUNcdUMxMjQgSVAgXHVCQzBGIFx1QkU0NEhUVFBTIFx1Q0MyOFx1QjJFOFxuXHQgKi9cblx0cHJpdmF0ZSB2YWxpZGF0ZVNlcnZlclVybCh1cmw6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHRpZiAocGFyc2VkLnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiBwYXJzZWQucHJvdG9jb2wgIT09ICdodHRwOicpIHtcblx0XHRcdFx0cmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0hUVFAgXHVCNjEwXHVCMjk0IEhUVFBTIFx1RDUwNFx1Qjg1Q1x1RDFBMFx1Q0Y1Q1x1QjlDQyBcdUM5QzBcdUM2RDBcdUQ1NjlcdUIyQzhcdUIyRTQnIH07XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBob3N0bmFtZSA9IHBhcnNlZC5ob3N0bmFtZTtcblx0XHRcdGNvbnN0IGlzTG9jYWxob3N0ID0gaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnIHx8IGhvc3RuYW1lID09PSAnMTI3LjAuMC4xJyB8fCBob3N0bmFtZSA9PT0gJzo6MSc7XG5cdFx0XHRpZiAocGFyc2VkLnByb3RvY29sID09PSAnaHR0cDonICYmICFpc0xvY2FsaG9zdCkge1xuXHRcdFx0XHRyZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSFRUUFNcdUFDMDAgXHVENTQ0XHVDNjk0XHVENTY5XHVCMkM4XHVCMkU0IChsb2NhbGhvc3RcdUIyOTQgSFRUUCBcdUQ1QzhcdUM2QTkpJyB9O1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgcHJpdmF0ZUlwUGF0dGVybiA9IC9eKDEwXFwufDE3MlxcLigxWzYtOV18MlswLTldfDNbMDFdKVxcLnwxOTJcXC4xNjhcXC58MTY5XFwuMjU0XFwuKS87XG5cdFx0XHRpZiAocHJpdmF0ZUlwUGF0dGVybi50ZXN0KGhvc3RuYW1lKSAmJiAhaXNMb2NhbGhvc3QpIHtcblx0XHRcdFx0cmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1x1QzBBQ1x1QzEyNCBJUCBcdUM4RkNcdUMxOENcdUIyOTQgXHVDNUYwXHVBQ0IwXHVENTYwIFx1QzIxOCBcdUM1QzZcdUMyQjVcdUIyQzhcdUIyRTQnIH07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1x1QzcyMFx1RDZBOFx1RDU1OFx1QzlDMCBcdUM1NEFcdUM3NDAgVVJMIFx1RDYxNVx1QzJERFx1Qzc4NVx1QjJDOFx1QjJFNCcgfTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGNoZWNrQXV0aChzZXJ2ZXJVcmw6IHN0cmluZywgdmF1bHRJZDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmICghc2VydmVyVXJsKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdTZXJ2ZXIgVVJMXHVDNzQ0IFx1Qzc4NVx1QjgyNVx1RDU3NFx1QzhGQ1x1QzEzOFx1QzY5NCcpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoIXZhdWx0SWQgfHwgIWFwaUtleSkge1xuXHRcdFx0bmV3IE5vdGljZSgnVmF1bHQgSURcdUM2NDAgQVBJIEtleVx1Qjk3QyBcdUM3ODVcdUI4MjVcdUQ1NzRcdUM4RkNcdUMxMzhcdUM2OTQnKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtzZXJ2ZXJVcmx9L3YxL3ZhdWx0L3ZlcmlmeWAsIHtcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdFx0XHRcdCdYLUFQSS1LZXknOiBhcGlLZXksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgdmF1bHRJZCwgYXBpS2V5IH0pLFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHRcdFx0Y29uc3QgZXJyb3JEYXRhOiBhbnkgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHsgZXJyb3I6ICdVbmtub3duIGVycm9yJyB9KSk7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihlcnJvckRhdGEuZXJyb3IgfHwgYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGRhdGE6IGFueSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcblx0XHRcdHJldHVybiBkYXRhLnZhbGlkID09PSB0cnVlO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ1tBdXRoIENoZWNrIEVycm9yXScsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoYFx1Qzc3OFx1Qzk5RCBcdUMyRTRcdUQzMjg6ICR7ZXJyb3IubWVzc2FnZX1gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xuXG5leHBvcnQgdHlwZSBDb25mbGljdENob2ljZSA9ICdsb2NhbCcgfCAnc2VydmVyJztcblxuZXhwb3J0IGludGVyZmFjZSBDb25mbGljdEluZm8ge1xuXHRmaWxlSWQ6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRsb2NhbEhhc2g6IHN0cmluZztcblx0c2VydmVySGFzaDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFx1QjNEOVx1QUUzMFx1RDY1NCBcdUNEQTlcdUIzQ0MgXHVENTc0XHVBQ0IwIFx1QkFBOFx1QjJFQ1xuICogXHVDMEFDXHVDNkE5XHVDNzkwXHVDNUQwXHVBQzhDIFx1Qjg1Q1x1Q0VFQy9cdUMxMUNcdUJDODQgXHVCQzg0XHVDODA0IFx1QzkxMSBcdUMxMjBcdUQwREQgXHVDODFDXHVBQ0Y1XG4gKi9cbmV4cG9ydCBjbGFzcyBDb25mbGljdE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIHJlc29sdmUhOiAoY2hvaWNlOiBDb25mbGljdENob2ljZSkgPT4gdm9pZDtcblx0cHJpdmF0ZSByZWplY3QhOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuXHRwcml2YXRlIGNob3NlbiA9IGZhbHNlO1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGFwcDogQXBwLFxuXHRcdHByaXZhdGUgY29uZmxpY3Q6IENvbmZsaWN0SW5mbyxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0fVxuXG5cdG9uT3BlbigpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoJ2NvbmZsaWN0LW1vZGFsJyk7XG5cblx0XHRjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnXHVCM0Q5XHVBRTMwXHVENjU0IFx1Q0RBOVx1QjNDQycgfSk7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuXHRcdFx0dGV4dDogYFwiJHt0aGlzLmNvbmZsaWN0LnBhdGh9XCIgXHVEMzBDXHVDNzdDXHVDNzc0IFx1Qjg1Q1x1Q0VFQ1x1QUNGQyBcdUMxMUNcdUJDODRcdUM1RDBcdUMxMUMgXHVCMkU0XHVCOTc0XHVBQzhDIFx1QzIxOFx1QzgxNVx1QjQxOFx1QzVDOFx1QzJCNVx1QjJDOFx1QjJFNC5gLFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaW5mb0VsID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogJ2NvbmZsaWN0LWluZm8nIH0pO1xuXHRcdGluZm9FbC5jcmVhdGVFbCgncCcsIHtcblx0XHRcdHRleHQ6IGBcdUI4NUNcdUNFRUMgXHVENTc0XHVDMkRDOiAke3RoaXMuY29uZmxpY3QubG9jYWxIYXNoLnNsaWNlKDAsIDEyKX0uLi5gLFxuXHRcdH0pO1xuXHRcdGluZm9FbC5jcmVhdGVFbCgncCcsIHtcblx0XHRcdHRleHQ6IGBcdUMxMUNcdUJDODQgXHVENTc0XHVDMkRDOiAke3RoaXMuY29uZmxpY3Quc2VydmVySGFzaC5zbGljZSgwLCAxMil9Li4uYCxcblx0XHR9KTtcblxuXHRcdGNvbnN0IGJ0bkNvbnRhaW5lciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdjb25mbGljdC1idXR0b25zJyB9KTtcblxuXHRcdGNvbnN0IGxvY2FsQnRuID0gYnRuQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG5cdFx0XHR0ZXh0OiAnXHVCODVDXHVDRUVDIFx1QkM4NFx1QzgwNCBcdUM3MjBcdUM5QzAnLFxuXHRcdFx0Y2xzOiAnbW9kLWN0YScsXG5cdFx0fSk7XG5cdFx0bG9jYWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNob3NlbiA9IHRydWU7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHR0aGlzLnJlc29sdmUoJ2xvY2FsJyk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBzZXJ2ZXJCdG4gPSBidG5Db250YWluZXIuY3JlYXRlRWwoJ2J1dHRvbicsIHtcblx0XHRcdHRleHQ6ICdcdUMxMUNcdUJDODQgXHVCQzg0XHVDODA0XHVDNzNDXHVCODVDIFx1QUQ1MFx1Q0NCNCcsXG5cdFx0fSk7XG5cdFx0c2VydmVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5jaG9zZW4gPSB0cnVlO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0dGhpcy5yZXNvbHZlKCdzZXJ2ZXInKTtcblx0XHR9KTtcblx0fVxuXG5cdG9uQ2xvc2UoKTogdm9pZCB7XG5cdFx0dGhpcy5jb250ZW50RWwuZW1wdHkoKTtcblx0XHRpZiAoIXRoaXMuY2hvc2VuKSB7XG5cdFx0XHR0aGlzLnJlamVjdChuZXcgRXJyb3IoYFx1QzBBQ1x1QzZBOVx1Qzc5MFx1QUMwMCBcdUNEQTlcdUIzQ0MgXHVENTc0XHVBQ0IwXHVDNzQ0IFx1QUM3NFx1QjEwOFx1QjcwMDogJHt0aGlzLmNvbmZsaWN0LnBhdGh9YCkpO1xuXHRcdH1cblx0fVxuXG5cdHdhaXQoKTogUHJvbWlzZTxDb25mbGljdENob2ljZT4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuXHRcdFx0dGhpcy5yZWplY3QgPSByZWplY3Q7XG5cdFx0XHR0aGlzLm9wZW4oKTtcblx0XHR9KTtcblx0fVxufVxuIiwgIi8qKlxuICogT2ZmbGluZSBxdWV1ZSBmb3Igc3RvcmluZyBzeW5jIGV2ZW50cyB3aGVuIGNvbm5lY3Rpb24gaXMgdW5hdmFpbGFibGVcbiAqIEBNWDpOT1RFOiBbQVVUT10gRklGTyBxdWV1ZSB3aXRoIDctZGF5IFRUTCBhbmQgbWF4IDEwMDAgaXRlbXNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFF1ZXVlSXRlbSwgV1NNZXNzYWdlVHlwZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCBNQVhfUVVFVUVfU0laRSA9IDEwMDA7XG5jb25zdCBUVExfTVMgPSA3ICogMjQgKiA2MCAqIDYwICogMTAwMDsgLy8gNyBkYXlzXG5cbi8qKlxuICogT2ZmbGluZSBxdWV1ZSBmb3Igc3RvcmluZyBzeW5jIGV2ZW50cyB3aGVuIG9mZmxpbmVcbiAqIEF1dG9tYXRpY2FsbHkgcmVtb3ZlcyBleHBpcmVkIGl0ZW1zICg3LWRheSBUVEwpIGFuZCBlbmZvcmNlcyBtYXggc2l6ZVxuICovXG5leHBvcnQgY2xhc3MgT2ZmbGluZVF1ZXVlIHtcbiAgcHJpdmF0ZSBpdGVtczogUXVldWVJdGVtW10gPSBbXTtcblxuICAvKipcbiAgICogQWRkIGl0ZW0gdG8gcXVldWVcbiAgICogUmVtb3ZlcyBvbGRlc3QgaXRlbSBpZiBxdWV1ZSBpcyBmdWxsXG4gICAqIFJlcGxhY2VzIGR1cGxpY2F0ZSBpdGVtcyB3aXRoIHNhbWUgdHlwZSBhbmQgZmlsZSBpZGVudGlmaWVyXG4gICAqL1xuICBhZGQodHlwZTogV1NNZXNzYWdlVHlwZSwgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIC8vIENoZWNrIGZvciBkdXBsaWNhdGUgYW5kIHJlcGxhY2UgaWYgZm91bmRcbiAgICBjb25zdCBkdXBsaWNhdGVJbmRleCA9IHRoaXMuaXRlbXMuZmluZEluZGV4KChpdGVtKSA9PiB7XG4gICAgICBpZiAoaXRlbS50eXBlICE9PSB0eXBlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIE1hdGNoIGJ5IGZpbGUgaWRlbnRpZmllciBiYXNlZCBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmlsZTpjcmVhdGUnOlxuICAgICAgICBjYXNlICdmaWxlOnVwZGF0ZSc6XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ucGF5bG9hZC5wYXRoID09PSBwYXlsb2FkLnBhdGg7XG4gICAgICAgIGNhc2UgJ2ZpbGU6ZGVsZXRlJzpcbiAgICAgICAgY2FzZSAnZmlsZTpyZW5hbWUnOlxuICAgICAgICAgIHJldHVybiBpdGVtLnBheWxvYWQuZmlsZUlkID09PSBwYXlsb2FkLmZpbGVJZDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZHVwbGljYXRlSW5kZXggIT09IC0xKSB7XG4gICAgICAvLyBSZXBsYWNlIGR1cGxpY2F0ZSB3aXRoIG5ldyBpdGVtXG4gICAgICB0aGlzLml0ZW1zW2R1cGxpY2F0ZUluZGV4XSA9IHtcbiAgICAgICAgdHlwZSxcbiAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTm8gZHVwbGljYXRlIGZvdW5kLCBhZGQgbmV3IGl0ZW1cbiAgICBpZiAodGhpcy5pdGVtcy5sZW5ndGggPj0gTUFYX1FVRVVFX1NJWkUpIHtcbiAgICAgIHRoaXMuaXRlbXMuc2hpZnQoKTsgLy8gUmVtb3ZlIG9sZGVzdFxuICAgIH1cblxuICAgIHRoaXMuaXRlbXMucHVzaCh7XG4gICAgICB0eXBlLFxuICAgICAgcGF5bG9hZCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgaXRlbXMsIGZpbHRlcmluZyBvdXQgZXhwaXJlZCBpdGVtc1xuICAgKiBSZW1vdmVzIGV4cGlyZWQgaXRlbXMgZnJvbSBpbnRlcm5hbCBzdGF0ZVxuICAgKi9cbiAgZ2V0QWxsKCk6IFF1ZXVlSXRlbVtdIHtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLmZpbHRlcihpdGVtID0+IG5vdyAtIGl0ZW0udGltZXN0YW1wIDwgVFRMX01TKTtcbiAgICByZXR1cm4gWy4uLnRoaXMuaXRlbXNdO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIGFsbCBpdGVtcyBmcm9tIHF1ZXVlXG4gICAqL1xuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLml0ZW1zID0gW107XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgcXVldWUgc2l6ZSAoYmVmb3JlIGZpbHRlcmluZyBleHBpcmVkIGl0ZW1zKVxuICAgKi9cbiAgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgfVxufVxuIiwgIi8qKlxuICogV2ViU29ja2V0IHN5bmMgc2VydmljZSBmb3IgVmVjdG9yIE9ic2lkaWFuIHBsdWdpblxuICogQE1YOkFOQ0hPUjogW0FVVE9dIENvcmUgc3luYyBsb2dpYyAtIGhhbmRsZXMgV2ViU29ja2V0IGNvbW11bmljYXRpb24sIG9mZmxpbmUgcXVldWUsIHN0YXRlIG1hbmFnZW1lbnRcbiAqIEBNWDpSRUFTT046IFJFUS1QTC0xMDEgdG8gUkVRLVBMLTEwOSAtIENvcmUgc3luYyBzZXJ2aWNlIHdpdGggb2ZmbGluZSBxdWV1ZSwgc3RhdGUgbWFuYWdlbWVudCwgcGF1c2UvcmVzdW1lXG4gKi9cblxuaW1wb3J0IHsgT2ZmbGluZVF1ZXVlIH0gZnJvbSAnLi9vZmZsaW5lLXF1ZXVlJztcbmltcG9ydCB0eXBlIHsgU3luY1N0YXRlLCBXU01lc3NhZ2VUeXBlLCBTZXJ2ZXJNZXNzYWdlIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7IFN5bmNSZWNvbm5lY3RSZXNwb25zZU1lc3NhZ2UgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBTeW5jQ2FsbGJhY2sgXHVDNzc4XHVEMTMwXHVEMzk4XHVDNzc0XHVDMkE0IC0gVmF1bHQgXHVDNzkxXHVDNUM1IFx1QkMwRiBcdUI5RTRcdUQ1NTEgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4XHVCOTdDIFx1QzcwNFx1RDU1QyBcdUNGNUNcdUJDMzFcbiAqIEBNWDpOT1RFOiBbQVVUT10gT2JzaWRpYW4gQVBJIFx1Qzc1OFx1Qzg3NFx1QzEzMSBcdUM4MUNcdUFDNzBcdUI5N0MgXHVDNzA0XHVENTVDIFx1Q0Y1Q1x1QkMzMSBcdUQzMjhcdUQxMzRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTeW5jQ2FsbGJhY2tzIHtcbiAgb25GaWxlSWRVcGRhdGU6IChwYXRoOiBzdHJpbmcsIGZpbGVJZDogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkZpbGVJZFJlbW92ZTogKHBhdGg6IHN0cmluZykgPT4gdm9pZDtcbiAgZ2V0UGF0aEJ5RmlsZUlkOiAoZmlsZUlkOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgZ2V0RmlsZUlkQnlQYXRoOiAocGF0aDogc3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIG9uRmlsZUNyZWF0ZTogKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBvbkZpbGVVcGRhdGU6IChwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgb25GaWxlRGVsZXRlOiAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBvbkZpbGVSZW5hbWU6IChvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgb25Db25mbGljdDogKGNvbmZsaWN0SW5mbzogYW55KSA9PiB2b2lkO1xuICBvbk5vdGljZTogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZDtcbiAgaGFzVW5zYXZlZENoYW5nZXM/OiAocGF0aDogc3RyaW5nKSA9PiBib29sZWFuO1xuICByZWFkRmlsZT86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZztcbiAgcGF0aEV4aXN0cz86IChwYXRoOiBzdHJpbmcpID0+IGJvb2xlYW47XG4gIHRyaWdnZXJSZWNvbm5lY3Q/OiAoKSA9PiB2b2lkO1xuICBvbkVycm9yPzogKGVycm9yOiB7IGNhdGVnb3J5OiBzdHJpbmc7IGNvZGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nIH0pID0+IHZvaWQ7XG4gIHF1ZXVlUmVzb2x1dGlvbj86IChmaWxlSWQ6IHN0cmluZywgcGF0aD86IHN0cmluZykgPT4gdm9pZDtcbiAgLy8gXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1Q0Y1Q1x1QkMzMSAoUmVjb25uZWN0aW9uIFN5bmMgQ2FsbGJhY2tzKVxuICBvblJlY29ubmVjdFJlc3BvbnNlPzogKHNlcnZlckZpbGVzOiBBcnJheTx7IGZpbGVJZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGN1cnJlbnRIYXNoOiBzdHJpbmcgfT4pID0+IHZvaWQ7XG4gIGNvbGxlY3RMb2NhbEZpbGVzPzogKCkgPT4gUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgaGFzaDogc3RyaW5nIH0+PjtcbiAgcmVhZEZpbGVBc3luYz86IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcbiAgc2hvd1N0YXR1c0Jhcj86IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQ7XG4gIGNsZWFyU3RhdHVzQmFyPzogKCkgPT4gdm9pZDtcbiAgLy8gXHVDREE5XHVCM0NDIFx1RDU3NFx1QUNCMCBcdUNGNUNcdUJDMzFcbiAgcmVzb2x2ZUNvbmZsaWN0PzogKGNvbmZsaWN0OiB7IGZpbGVJZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGxvY2FsSGFzaDogc3RyaW5nOyBzZXJ2ZXJIYXNoOiBzdHJpbmcgfSkgPT4gUHJvbWlzZTwnbG9jYWwnIHwgJ3NlcnZlcic+O1xufVxuXG4vKipcbiAqIFdlYlNvY2tldCBzeW5jIHNlcnZpY2VcbiAqIE1hbmFnZXMgV2ViU29ja2V0IGNvbm5lY3Rpb24sIG9mZmxpbmUgcXVldWUsIGFuZCBzeW5jIHN0YXRlXG4gKiBATVg6QU5DSE9SOiBbQVVUT10gQ29yZSBzeW5jIGxvZ2ljIC0gaGFuZGxlcyBXZWJTb2NrZXQgY29tbXVuaWNhdGlvbiwgb2ZmbGluZSBxdWV1ZSwgc3RhdGUgbWFuYWdlbWVudFxuICogQE1YOlJFQVNPTjogUkVRLVBMLTEwMSB0byBSRVEtUEwtMTA5IC0gQ29yZSBzeW5jIHNlcnZpY2Ugd2l0aCBvZmZsaW5lIHF1ZXVlLCBzdGF0ZSBtYW5hZ2VtZW50LCBwYXVzZS9yZXN1bWVcbiAqL1xuZXhwb3J0IGNsYXNzIFN5bmNTZXJ2aWNlIHtcbiAgcHJpdmF0ZSB3czogV2ViU29ja2V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcXVldWU6IE9mZmxpbmVRdWV1ZTtcbiAgcHJpdmF0ZSBfc3RhdGU6IFN5bmNTdGF0ZSA9ICdvZmZsaW5lJztcbiAgcHJpdmF0ZSBzdGF0ZUxpc3RlbmVyczogKChzdGF0ZTogU3luY1N0YXRlKSA9PiB2b2lkKVtdID0gW107XG4gIHByaXZhdGUgbWVzc2FnZUxpc3RlbmVyczogKChtZXNzYWdlOiBhbnkpID0+IHZvaWQpW10gPSBbXTtcblxuICAvLyBSZWNvbm5lY3Rpb24gd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gIHByaXZhdGUgcmVjb25uZWN0VGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVjb25uZWN0QXR0ZW1wdCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWF4UmVjb25uZWN0QXR0ZW1wdHMgPSAxMDtcbiAgcHJpdmF0ZSByZWFkb25seSByZWNvbm5lY3RJbml0aWFsRGVsYXkgPSAxMDAwOyAvLyAxIHNlY29uZFxuICBwcml2YXRlIHJlYWRvbmx5IHJlY29ubmVjdE1heERlbGF5ID0gMzAwMDA7IC8vIDMwIHNlY29uZHNcbiAgcHJpdmF0ZSByZWFkb25seSByZWNvbm5lY3RNdWx0aXBsaWVyID0gMjtcbiAgcHJpdmF0ZSBleHBsaWNpdGx5RGlzY29ubmVjdGVkID0gZmFsc2U7XG5cbiAgLy8gUGhhc2UgMzogU2VydmVyIG1lc3NhZ2UgaGFuZGxpbmdcbiAgcHJpdmF0ZSBjYWxsYmFja3M6IFN5bmNDYWxsYmFja3MgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBwZW5kaW5nTWVzc2FnZXM6IE1hcDxzdHJpbmcsIHsgdHlwZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IHRpbWVzdGFtcDogbnVtYmVyIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHJlY2VudGx5QWNrbm93bGVkZ2VkOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHJlYWRvbmx5IEFDS19FWFBJUllfTVMgPSAxMDAwMDsgLy8gMTAgc2Vjb25kc1xuXG4gIC8vIFBoYXNlIDU6IERlYm91bmNlIHRpbWVyc1xuICBwcml2YXRlIGRlYm91bmNlVGltZXJzOiBNYXA8c3RyaW5nLCBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0Pj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgREVCT1VOQ0VfTVMgPSA1MDA7IC8vIDUwMG1zXG5cbiAgLy8gXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzBDMVx1RDBEQyAoUmVjb25uZWN0aW9uIFN5bmMgU3RhdGUpXG4gIHByaXZhdGUgaXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBsaXZlU3luY1F1ZXVlOiBTZXJ2ZXJNZXNzYWdlW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHNlcnZlclVybDogc3RyaW5nLFxuICAgIHByaXZhdGUgdmF1bHRJZDogc3RyaW5nLFxuICAgIHByaXZhdGUgYXBpS2V5OiBzdHJpbmcsXG4gICkge1xuICAgIHRoaXMucXVldWUgPSBuZXcgT2ZmbGluZVF1ZXVlKCk7XG4gIH1cblxuICAvKipcbiAgICogXHVDRjVDXHVCQzMxIFx1QzEyNFx1QzgxNSAoUGhhc2UgMylcbiAgICovXG4gIHNldENhbGxiYWNrcyhjYWxsYmFja3M6IFN5bmNDYWxsYmFja3MpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcbiAgfVxuXG4gIGdldCBzdGF0ZSgpOiBTeW5jU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCByZWNvbm5lY3Rpb24gYXR0ZW1wdCBjb3VudFxuICAgKi9cbiAgZ2V0UmVjb25uZWN0QXR0ZW1wdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJlY29ubmVjdEF0dGVtcHQ7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgbGlzdGVuZXIgZm9yIHN0YXRlIGNoYW5nZXNcbiAgICogUmV0dXJucyB1bnN1YnNjcmliZSBmdW5jdGlvblxuICAgKi9cbiAgb25TdGF0ZUNoYW5nZShsaXN0ZW5lcjogKHN0YXRlOiBTeW5jU3RhdGUpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgICB0aGlzLnN0YXRlTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLnN0YXRlTGlzdGVuZXJzID0gdGhpcy5zdGF0ZUxpc3RlbmVycy5maWx0ZXIobCA9PiBsICE9PSBsaXN0ZW5lcik7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBsaXN0ZW5lciBmb3Igc2VydmVyIG1lc3NhZ2VzXG4gICAqIFJldHVybnMgdW5zdWJzY3JpYmUgZnVuY3Rpb25cbiAgICovXG4gIG9uTWVzc2FnZShoYW5kbGVyOiAobWVzc2FnZTogYW55KSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlTGlzdGVuZXJzLnB1c2goaGFuZGxlcik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMubWVzc2FnZUxpc3RlbmVycyA9IHRoaXMubWVzc2FnZUxpc3RlbmVycy5maWx0ZXIoaCA9PiBoICE9PSBoYW5kbGVyKTtcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRTdGF0ZShzdGF0ZTogU3luY1N0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLnN0YXRlTGlzdGVuZXJzLmZvckVhY2gobCA9PiBsKHN0YXRlKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHJlY29ubmVjdGlvbiBkZWxheSB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICovXG4gIHByaXZhdGUgZ2V0UmVjb25uZWN0RGVsYXkoKTogbnVtYmVyIHtcbiAgICBjb25zdCBkZWxheSA9IHRoaXMucmVjb25uZWN0SW5pdGlhbERlbGF5ICogTWF0aC5wb3codGhpcy5yZWNvbm5lY3RNdWx0aXBsaWVyLCB0aGlzLnJlY29ubmVjdEF0dGVtcHQpO1xuICAgIHJldHVybiBNYXRoLm1pbihkZWxheSwgdGhpcy5yZWNvbm5lY3RNYXhEZWxheSk7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGUgcmVjb25uZWN0aW9uIHdpdGggZXhwb25lbnRpYWwgYmFja29mZlxuICAgKi9cbiAgcHJpdmF0ZSBzY2hlZHVsZVJlY29ubmVjdCgpOiB2b2lkIHtcbiAgICAvLyBDaGVjayBiZWZvcmUgc2NoZWR1bGluZyBpZiB3ZSd2ZSBhbHJlYWR5IHJlYWNoZWQgbWF4IGF0dGVtcHRzXG4gICAgaWYgKHRoaXMucmVjb25uZWN0QXR0ZW1wdCA+PSB0aGlzLm1heFJlY29ubmVjdEF0dGVtcHRzKSB7XG4gICAgICAvLyBNYXggYXR0ZW1wdHMgcmVhY2hlZCwgdHJhbnNpdGlvbiB0byBlcnJvciBzdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZSgnZXJyb3InKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJlY29ubmVjdEF0dGVtcHQrKztcbiAgICB0aGlzLnNldFN0YXRlKCdyZWNvbm5lY3RpbmcnKTtcblxuICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXRSZWNvbm5lY3REZWxheSgpO1xuICAgIHRoaXMucmVjb25uZWN0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuY29ubmVjdCgpO1xuICAgIH0sIGRlbGF5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciByZWNvbm5lY3Rpb24gdGltZXJcbiAgICovXG4gIHByaXZhdGUgY2xlYXJSZWNvbm5lY3RUaW1lcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5yZWNvbm5lY3RUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVjb25uZWN0VGltZXIpO1xuICAgICAgdGhpcy5yZWNvbm5lY3RUaW1lciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbm5lY3QgdG8gV2ViU29ja2V0IHNlcnZlclxuICAgKi9cbiAgY29ubmVjdCgpOiB2b2lkIHtcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLnNlcnZlclVybH0vdjEvd3MvJHt0aGlzLnZhdWx0SWR9P2tleT0ke3RoaXMuYXBpS2V5fWA7XG4gICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQodXJsKTtcblxuICAgIHRoaXMud3Mub25vcGVuID0gKCkgPT4ge1xuICAgICAgLy8gUmVzZXQgcmVjb25uZWN0aW9uIHN0YXRlIG9uIHN1Y2Nlc3NmdWwgY29ubmVjdGlvblxuICAgICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0ID0gMDtcbiAgICAgIHRoaXMuY2xlYXJSZWNvbm5lY3RUaW1lcigpO1xuICAgICAgdGhpcy5leHBsaWNpdGx5RGlzY29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoJ2Nvbm5lY3RlZCcpO1xuXG4gICAgICAvLyBSRVEtUlQtMTAxLCBSRVEtUlQtMTAyOiBcdUM1RjBcdUFDQjAgXHVDMkRDIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUQyQjhcdUI5QUNcdUFDNzBcbiAgICAgIHRoaXMuc3RhcnRSZWNvbm5lY3RTeW5jKCk7XG4gICAgfTtcblxuICAgIHRoaXMud3Mub25jbG9zZSA9ICgpID0+IHtcbiAgICAgIC8vIE9ubHkgcmVjb25uZWN0IGlmIG5vdCBleHBsaWNpdGx5IGRpc2Nvbm5lY3RlZFxuICAgICAgaWYgKCF0aGlzLmV4cGxpY2l0bHlEaXNjb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVJlY29ubmVjdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgnb2ZmbGluZScpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLndzLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKCdlcnJvcicpO1xuICAgIH07XG5cbiAgICB0aGlzLndzLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gZXZlbnQuZGF0YS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShyYXcpIGFzIFNlcnZlck1lc3NhZ2U7XG5cbiAgICAgICAgLy8gUGhhc2UgMzogXHVDMTFDXHVCQzg0IFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUI1MTRcdUMyQTRcdUQzMjhcdUNFNThcbiAgICAgICAgdGhpcy5kaXNwYXRjaFNlcnZlck1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICAgICAgLy8gRGlzcGF0Y2ggdG8gYWxsIHJlZ2lzdGVyZWQgbWVzc2FnZSBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5tZXNzYWdlTGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsaXN0ZW5lcihtZXNzYWdlKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gbWVzc2FnZSBsaXN0ZW5lcjonLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSBXZWJTb2NrZXQgbWVzc2FnZTonLCBlcnJvcik7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gV2ViU29ja2V0IHNlcnZlclxuICAgKi9cbiAgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLmV4cGxpY2l0bHlEaXNjb25uZWN0ZWQgPSB0cnVlO1xuICAgIHRoaXMuY2xlYXJSZWNvbm5lY3RUaW1lcigpO1xuICAgIHRoaXMucmVjb25uZWN0QXR0ZW1wdCA9IDA7XG5cbiAgICBpZiAodGhpcy53cykge1xuICAgICAgdGhpcy53cy5jbG9zZSgpO1xuICAgICAgdGhpcy53cyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoJ29mZmxpbmUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZSBzeW5jaW5nIChSRVEtUEwtMzAxKVxuICAgKi9cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSgncGF1c2VkJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdW1lIHN5bmNpbmdcbiAgICovXG4gIHJlc3VtZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKCdjb25uZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSgnb2ZmbGluZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGZpbGUgY3JlYXRlIGV2ZW50XG4gICAqL1xuICBzZW5kRmlsZUNyZWF0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIFBoYXNlIDQ6IHBlbmRpbmdNZXNzYWdlc1x1QzVEMCBcdUNEOTRcdUFDMDBcbiAgICB0aGlzLnBlbmRpbmdNZXNzYWdlcy5zZXQocGF0aCwgeyB0eXBlOiAnZmlsZTpjcmVhdGUnLCBwYXRoLCB0aW1lc3RhbXA6IERhdGUubm93KCkgfSk7XG4gICAgdGhpcy5zZW5kT3JRdWV1ZSgnZmlsZTpjcmVhdGUnLCB7IHBhdGgsIGNvbnRlbnQgfSk7XG4gIH1cblxuICAvKipcbiAgICogXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzY5NFx1Q0NBRCBcdUM4MDRcdUMxQTEgKFJFUS1SVC0xMDEsIFJFUS1SVC0xMDIpXG4gICAqL1xuICBzZW5kU3luY1JlY29ubmVjdChsb2NhbEZpbGVzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgaGFzaDogc3RyaW5nIH0+KTogdm9pZCB7XG4gICAgdGhpcy5zZW5kT3JRdWV1ZSgnc3luYzpyZWNvbm5lY3QnLCB7IHBheWxvYWQ6IHsgbG9jYWxGaWxlcyB9IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM2NDRcdUI4Q0MgXHVDNTRDXHVCOUJDIFx1QzgwNFx1QzFBMSAoUkVRLUZTLTIwMilcbiAgICovXG4gIHNlbmRTeW5jUmVjb25uZWN0Q29tcGxldGUodXBsb2FkZWQ6IG51bWJlciwgZG93bmxvYWRlZDogbnVtYmVyLCBjb25mbGljdHM6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2VuZE9yUXVldWUoJ3N5bmM6cmVjb25uZWN0LWNvbXBsZXRlJywgeyBwYXlsb2FkOiB7IHVwbG9hZGVkLCBkb3dubG9hZGVkLCBjb25mbGljdHMgfSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGZpbGUgdXBkYXRlIGV2ZW50IHdpdGggY29udGVudCBoYXNoXG4gICAqIFBoYXNlIDU6IERlYm91bmNlIFx1QzgwMVx1QzZBOSAoUkVRLUxDLTQwMilcbiAgICovXG4gIGFzeW5jIHNlbmRGaWxlVXBkYXRlKGZpbGVJZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFBoYXNlIDU6IFx1QUUzMFx1Qzg3NCBcdUQwQzBcdUM3NzRcdUJBMzggXHVDREU4XHVDMThDXG4gICAgY29uc3QgZXhpc3RpbmdUaW1lciA9IHRoaXMuZGVib3VuY2VUaW1lcnMuZ2V0KHBhdGgpO1xuICAgIGlmIChleGlzdGluZ1RpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQoZXhpc3RpbmdUaW1lcik7XG4gICAgfVxuXG4gICAgLy8gUGhhc2UgNTogXHVDMEM4IFx1RDBDMFx1Qzc3NFx1QkEzOCBcdUMxMjRcdUM4MTVcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgLy8gUGhhc2UgNDogcGVuZGluZ01lc3NhZ2VzXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgICAgdGhpcy5wZW5kaW5nTWVzc2FnZXMuc2V0KHBhdGgsIHsgdHlwZTogJ2ZpbGU6dXBkYXRlJywgcGF0aCwgdGltZXN0YW1wOiBEYXRlLm5vdygpIH0pO1xuXG4gICAgICAvLyBoYXNoIFx1QkJGOFx1QzgwNFx1QzFBMTogXHVDNzdDXHVCQzE4IFx1RDNCOFx1QzlEMVx1QzVEMFx1QzExQyBcdUQ1NzRcdUMyREMgXHVCRTQ0XHVBRDUwXHVCMjk0IFx1RDU2RFx1QzBDMSBcdUNEQTlcdUIzQ0NcdUI4NUMgXHVDNjI0XHVEMEQwXHVDOUMwXHVCNDI4IChcdUMwQzggXHVENTc0XHVDMkRDIFx1MjI2MCBcdUFFMzBcdUM4NzQgXHVENTc0XHVDMkRDKVxuICAgICAgLy8gXHVDREE5XHVCM0NDIFx1QUMxMFx1QzlDMFx1QjI5NCBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMkRDXHVDNUQwXHVCOUNDIFx1QzIxOFx1RDU4OVxuICAgICAgdGhpcy5zZW5kT3JRdWV1ZSgnZmlsZTp1cGRhdGUnLCB7IGZpbGVJZCwgcGF0aCwgY29udGVudCB9KTtcblxuICAgICAgLy8gXHVEMEMwXHVDNzc0XHVCQTM4IFx1QzgxQ1x1QUM3MFxuICAgICAgdGhpcy5kZWJvdW5jZVRpbWVycy5kZWxldGUocGF0aCk7XG4gICAgfSwgdGhpcy5ERUJPVU5DRV9NUyk7XG5cbiAgICB0aGlzLmRlYm91bmNlVGltZXJzLnNldChwYXRoLCB0aW1lcik7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBmaWxlIGRlbGV0ZSBldmVudFxuICAgKi9cbiAgc2VuZEZpbGVEZWxldGUoZmlsZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBQaGFzZSA0OiBwZW5kaW5nTWVzc2FnZXNcdUM1RDAgXHVDRDk0XHVBQzAwIChmaWxlSWRcdUI5N0Mga2V5XHVCODVDIFx1QzBBQ1x1QzZBOSlcbiAgICB0aGlzLnBlbmRpbmdNZXNzYWdlcy5zZXQoZmlsZUlkLCB7IHR5cGU6ICdmaWxlOmRlbGV0ZScsIHBhdGg6IGZpbGVJZCwgdGltZXN0YW1wOiBEYXRlLm5vdygpIH0pO1xuICAgIHRoaXMuc2VuZE9yUXVldWUoJ2ZpbGU6ZGVsZXRlJywgeyBmaWxlSWQgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBmaWxlIHJlbmFtZSBldmVudFxuICAgKi9cbiAgc2VuZEZpbGVSZW5hbWUoZmlsZUlkOiBzdHJpbmcsIG9sZFBhdGg6IHN0cmluZywgbmV3UGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gUGhhc2UgNDogcGVuZGluZ01lc3NhZ2VzXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzLnNldChuZXdQYXRoLCB7IHR5cGU6ICdmaWxlOnJlbmFtZScsIHBhdGg6IG5ld1BhdGgsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9KTtcbiAgICB0aGlzLnNlbmRPclF1ZXVlKCdmaWxlOnJlbmFtZScsIHsgZmlsZUlkLCBvbGRQYXRoLCBuZXdQYXRoIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgbWVzc2FnZSBvciBxdWV1ZSB3aGVuIG9mZmxpbmVcbiAgICovXG4gIHByaXZhdGUgc2VuZE9yUXVldWUodHlwZTogV1NNZXNzYWdlVHlwZSwgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gJ3BhdXNlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoeyB0eXBlLCAuLi5wYXlsb2FkIH0pO1xuXG4gICAgaWYgKHRoaXMud3MgJiYgdGhpcy53cy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgdGhpcy53cy5zZW5kKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnF1ZXVlLmFkZCh0eXBlLCBwYXlsb2FkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmx1c2ggb2ZmbGluZSBxdWV1ZSB3aGVuIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWQgKFJFUS1QTC0xMDkpXG4gICAqL1xuICBwcml2YXRlIGZsdXNoUXVldWUoKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLnF1ZXVlLmdldEFsbCgpO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KHsgdHlwZTogaXRlbS50eXBlLCAuLi5pdGVtLnBheWxvYWQgfSk7XG4gICAgICB0aGlzLndzPy5zZW5kKG1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLnF1ZXVlLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogUGhhc2UgMzogXHVDMTFDXHVCQzg0IFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUI1MTRcdUMyQTRcdUQzMjhcdUNFNThcbiAgICogQE1YOkFOQ0hPUjogW0FVVE9dIFx1QzExQ1x1QkM4NCBcdUJBNTRcdUMyRENcdUM5QzAgXHVEMEMwXHVDNzg1XHVCQ0M0IFx1RDU3OFx1QjRFNFx1QjdFQyBcdUI3N0NcdUM2QjBcdUQzMDVcbiAgICogQE1YOlJFQVNPTjogUkVRLVNTLTEwMSB0byBSRVEtU1MtMTA4IC0gXHVDMTFDXHVCQzg0IFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUNDOThcdUI5QUMgXHVCODVDXHVDOUMxXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoU2VydmVyTWVzc2FnZShtZXNzYWdlOiBTZXJ2ZXJNZXNzYWdlKTogdm9pZCB7XG4gICAgLy8gUGhhc2UgNDogXHVDRDVDXHVBREZDIFx1QzJCOVx1Qzc3OFx1QjQxQyBcdUJBNTRcdUMyRENcdUM5QzAgXHVDODE1XHVCOUFDICgxMFx1Q0QwOCBcdUFDQkRcdUFDRkMpXG4gICAgdGhpcy5jbGVhbnVwUmVjZW50bHlBY2tub3dsZWRnZWQoKTtcblxuICAgIC8vIFJFUS1SVC0yMDE6IFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTEgXHVCNzdDXHVDNzc0XHVCRTBDIFx1QzJGMVx1RDA2QyBcdUM3NzRcdUJDQTRcdUQyQjggXHVEMDUwXHVDNzg5XG4gICAgaWYgKHRoaXMuaXNSZWNvbm5lY3RpbmcgJiYgbWVzc2FnZS50eXBlICE9PSAnc3luYzpyZWNvbm5lY3QtcmVzcG9uc2UnICYmIG1lc3NhZ2UudHlwZSAhPT0gJ3N5bmM6YWNrJykge1xuICAgICAgdGhpcy5saXZlU3luY1F1ZXVlLnB1c2gobWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3N5bmM6YWNrJzpcbiAgICAgICAgdGhpcy5oYW5kbGVTeW5jQWNrKG1lc3NhZ2UgYXMgeyB0eXBlOiAnc3luYzphY2snOyBmaWxlSWQ6IHN0cmluZyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmaWxlOmNyZWF0ZWQnOlxuICAgICAgICB0aGlzLmhhbmRsZUZpbGVDcmVhdGVkKG1lc3NhZ2UgYXMgeyB0eXBlOiAnZmlsZTpjcmVhdGVkJzsgZmlsZTogeyBpZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGNvbnRlbnQ/OiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9IH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpbGU6dXBkYXRlZCc6XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZVVwZGF0ZWQobWVzc2FnZSBhcyB7IHR5cGU6ICdmaWxlOnVwZGF0ZWQnOyBmaWxlOiB7IGlkOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgaGFzaDogc3RyaW5nIH0gfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZmlsZTpkZWxldGVkJzpcbiAgICAgICAgdGhpcy5oYW5kbGVGaWxlRGVsZXRlZChtZXNzYWdlIGFzIHsgdHlwZTogJ2ZpbGU6ZGVsZXRlZCc7IGZpbGVJZDogc3RyaW5nIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpbGU6cmVuYW1lZCc6XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZVJlbmFtZWQobWVzc2FnZSBhcyB7IHR5cGU6ICdmaWxlOnJlbmFtZWQnOyBmaWxlOiB7IGlkOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgaGFzaDogc3RyaW5nIH0gfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29uZmxpY3Q6ZGV0ZWN0ZWQnOlxuICAgICAgICB0aGlzLmhhbmRsZUNvbmZsaWN0RGV0ZWN0ZWQobWVzc2FnZSBhcyB7IHR5cGU6ICdjb25mbGljdDpkZXRlY3RlZCc7IGNvbmZsaWN0SWQ6IHN0cmluZzsgZmlsZUlkOiBzdHJpbmc7IGNsaWVudEhhc2g/OiBzdHJpbmcgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc3luYzplcnJvcic6XG4gICAgICAgIHRoaXMuaGFuZGxlU3luY0Vycm9yKG1lc3NhZ2UgYXMgeyB0eXBlOiAnc3luYzplcnJvcic7IGNvZGU/OiBzdHJpbmc7IG1lc3NhZ2U/OiBzdHJpbmcgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc3luYzpyZWNvbm5lY3QtcmVzcG9uc2UnOlxuICAgICAgICB0aGlzLmhhbmRsZVJlY29ubmVjdFJlc3BvbnNlKG1lc3NhZ2UgYXMgU3luY1JlY29ubmVjdFJlc3BvbnNlTWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUMy4yOiBoYW5kbGVTeW5jQWNrIChSRVEtU1MtMTAxKVxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVTeW5jQWNrKG1lc3NhZ2U6IHsgdHlwZTogJ3N5bmM6YWNrJzsgZmlsZUlkOiBzdHJpbmc7IHBhdGg/OiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgZmlsZUlkLCBwYXRoIH0gPSBtZXNzYWdlO1xuXG4gICAgLy8gXHVDRDVDXHVBREZDIFx1QzJCOVx1Qzc3OFx1QjQxQyBcdUJDODRcdUQzN0NcdUM1RDAgXHVDRDk0XHVBQzAwXG4gICAgdGhpcy5yZWNlbnRseUFja25vd2xlZGdlZC5zZXQoZmlsZUlkLCBEYXRlLm5vdygpKTtcblxuICAgIC8vIGZpbGU6Y3JlYXRlIGFjazogcGF0aFx1Qjg1QyBcdUM5QzFcdUM4MTEgXHVCOUU0XHVDRTZEXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdNZXNzYWdlcy5nZXQocGF0aCk7XG4gICAgICBpZiAocGVuZGluZykge1xuICAgICAgICB0aGlzLnBlbmRpbmdNZXNzYWdlcy5kZWxldGUocGF0aCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzPy5vbkZpbGVJZFVwZGF0ZShwYXRoLCBmaWxlSWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHVBRTMwXHVDODc0IFx1Qjg1Q1x1QzlDMTogZmlsZUlkIFx1QUUzMFx1QkMxOCBcdUI5RTRcdUNFNkQgKGZpbGU6dXBkYXRlLCBmaWxlOmRlbGV0ZSwgZmlsZTpyZW5hbWUpXG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5wZW5kaW5nTWVzc2FnZXMuZW50cmllcygpKSB7XG4gICAgICBpZiAoa2V5ID09PSBmaWxlSWQgfHwgdmFsdWUucGF0aCA9PT0gZmlsZUlkKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzLmRlbGV0ZShrZXkpO1xuXG4gICAgICAgIC8vIGZpbGVJZCBcdUI5RTRcdUQ1NTEgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IFx1Q0Y1Q1x1QkMzMVxuICAgICAgICBpZiAodGhpcy5jYWxsYmFja3MgJiYgdmFsdWUucGF0aCkge1xuICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkVXBkYXRlKHZhbHVlLnBhdGgsIGZpbGVJZCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFQzLjM6IGhhbmRsZUZpbGVDcmVhdGVkIChSRVEtU1MtMTAyKVxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVGaWxlQ3JlYXRlZChtZXNzYWdlOiB7IHR5cGU6ICdmaWxlOmNyZWF0ZWQnOyBmaWxlOiB7IGlkOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgaGFzaDogc3RyaW5nIH0gfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgZmlsZSB9ID0gbWVzc2FnZTtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzKSByZXR1cm47XG5cbiAgICAvLyBQaGFzZSA0OiBcdUM3OTBcdUFDMDAgb3JpZ2luIFx1Q0NCNFx1RDA2Q1xuICAgIGlmICh0aGlzLmlzU2VsZk9yaWdpbmF0ZWQoZmlsZS5pZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUQzMENcdUM3N0NcdUM3NzQgXHVDNzc0XHVCQkY4IFx1Qzg3NFx1QzdBQ1x1RDU1OFx1QjI5NFx1QzlDMCBcdUQ2NTVcdUM3NzhcbiAgICBpZiAodGhpcy5jYWxsYmFja3MucGF0aEV4aXN0cyAmJiB0aGlzLmNhbGxiYWNrcy5wYXRoRXhpc3RzKGZpbGUucGF0aCkpIHtcbiAgICAgIHJldHVybjsgLy8gXHVDNzc0XHVCQkY4IFx1Qzg3NFx1QzdBQ1x1RDU1OFx1QkE3NCBcdUFDNzRcdUIxMDhcdUI3MDBcbiAgICB9XG5cbiAgICAvLyBcdUQzMENcdUM3N0MgXHVDMEREXHVDMTMxXG4gICAgaWYgKGZpbGUuY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vbkZpbGVDcmVhdGUoZmlsZS5wYXRoLCBmaWxlLmNvbnRlbnQpO1xuXG4gICAgICAvLyBmaWxlSWQgXHVCOUU0XHVENTUxIFx1Q0Q5NFx1QUMwMFxuICAgICAgdGhpcy5jYWxsYmFja3Mub25GaWxlSWRVcGRhdGUoZmlsZS5wYXRoLCBmaWxlLmlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVDMuNDogaGFuZGxlRmlsZVVwZGF0ZWQgKFJFUS1TUy0xMDMpXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUZpbGVVcGRhdGVkKG1lc3NhZ2U6IHsgdHlwZTogJ2ZpbGU6dXBkYXRlZCc7IGZpbGU6IHsgaWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBjb250ZW50Pzogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfSB9KTogdm9pZCB7XG4gICAgY29uc3QgeyBmaWxlIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIFBoYXNlIDQ6IFx1Qzc5MFx1QUMwMCBvcmlnaW4gXHVDQ0I0XHVEMDZDXG4gICAgaWYgKHRoaXMuaXNTZWxmT3JpZ2luYXRlZChmaWxlLmlkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpbGVJZFx1Qjg1QyBcdUFDQkRcdUI4NUMgXHVDODcwXHVENjhDXG4gICAgY29uc3QgbG9jYWxQYXRoID0gdGhpcy5jYWxsYmFja3MuZ2V0UGF0aEJ5RmlsZUlkKGZpbGUuaWQpO1xuXG4gICAgaWYgKCFsb2NhbFBhdGgpIHtcbiAgICAgIC8vIFJFUS1TUy0xMDg6IGZpbGVJZCBcdUIyMDRcdUI3N0QgXHVDMkRDIHJlc29sdXRpb24gXHVEMDUwXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLnF1ZXVlUmVzb2x1dGlvbikge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5xdWV1ZVJlc29sdXRpb24oZmlsZS5pZCwgZmlsZS5wYXRoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUJCRjhcdUM4MDBcdUM3QTUgXHVCQ0MwXHVBQ0JEIFx1Q0NCNFx1RDA2Q1xuICAgIGlmICh0aGlzLmNhbGxiYWNrcy5oYXNVbnNhdmVkQ2hhbmdlcyAmJiB0aGlzLmNhbGxiYWNrcy5oYXNVbnNhdmVkQ2hhbmdlcyhsb2NhbFBhdGgpKSB7XG4gICAgICAvLyBcdUNEQTlcdUIzQ0MgXHVDMEREXHVDMTMxXG4gICAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Db25mbGljdCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vbkNvbmZsaWN0KHtcbiAgICAgICAgICB0eXBlOiAndW5zYXZlZF9jaGFuZ2VzJyxcbiAgICAgICAgICBmaWxlSWQ6IGZpbGUuaWQsXG4gICAgICAgICAgcGF0aDogbG9jYWxQYXRoLFxuICAgICAgICAgIHNlcnZlckNvbnRlbnQ6IGZpbGUuY29udGVudCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHVEMzBDXHVDNzdDIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOFxuICAgIGlmIChmaWxlLmNvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25GaWxlVXBkYXRlKGxvY2FsUGF0aCwgZmlsZS5jb250ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVDMuNTogaGFuZGxlRmlsZURlbGV0ZWQgKFJFUS1TUy0xMDQpXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUZpbGVEZWxldGVkKG1lc3NhZ2U6IHsgdHlwZTogJ2ZpbGU6ZGVsZXRlZCc7IGZpbGVJZDogc3RyaW5nIH0pOiB2b2lkIHtcbiAgICBjb25zdCB7IGZpbGVJZCB9ID0gbWVzc2FnZTtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzKSByZXR1cm47XG5cbiAgICAvLyBQaGFzZSA0OiBcdUM3OTBcdUFDMDAgb3JpZ2luIFx1Q0NCNFx1RDA2Q1xuICAgIGlmICh0aGlzLmlzU2VsZk9yaWdpbmF0ZWQoZmlsZUlkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpbGVJZFx1Qjg1QyBcdUFDQkRcdUI4NUMgXHVDODcwXHVENjhDXG4gICAgY29uc3QgbG9jYWxQYXRoID0gdGhpcy5jYWxsYmFja3MuZ2V0UGF0aEJ5RmlsZUlkKGZpbGVJZCk7XG5cbiAgICBpZiAoIWxvY2FsUGF0aCkge1xuICAgICAgLy8gUkVRLVNTLTEwODogZmlsZUlkIFx1QjIwNFx1Qjc3RCBcdUMyREMgcmVzb2x1dGlvbiBcdUQwNTBcdUM1RDAgXHVDRDk0XHVBQzAwXG4gICAgICBpZiAodGhpcy5jYWxsYmFja3MucXVldWVSZXNvbHV0aW9uKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnF1ZXVlUmVzb2x1dGlvbihmaWxlSWQsIHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHVEMzBDXHVDNzdDIFx1QzBBRFx1QzgxQ1xuICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZURlbGV0ZShsb2NhbFBhdGgpO1xuXG4gICAgLy8gXHVCOUU0XHVENTUxIFx1QzgxQ1x1QUM3MFxuICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkUmVtb3ZlKGxvY2FsUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogVDMuNjogaGFuZGxlRmlsZVJlbmFtZWQgKFJFUS1TUy0xMDUpXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUZpbGVSZW5hbWVkKG1lc3NhZ2U6IHsgdHlwZTogJ2ZpbGU6cmVuYW1lZCc7IGZpbGU6IHsgaWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfSB9KTogdm9pZCB7XG4gICAgY29uc3QgeyBmaWxlIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIFBoYXNlIDQ6IFx1Qzc5MFx1QUMwMCBvcmlnaW4gXHVDQ0I0XHVEMDZDXG4gICAgaWYgKHRoaXMuaXNTZWxmT3JpZ2luYXRlZChmaWxlLmlkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZpbGVJZFx1Qjg1QyBcdUFFMzBcdUM4NzQgXHVBQ0JEXHVCODVDIFx1Qzg3MFx1RDY4Q1xuICAgIGNvbnN0IG9sZFBhdGggPSB0aGlzLmNhbGxiYWNrcy5nZXRQYXRoQnlGaWxlSWQoZmlsZS5pZCk7XG5cbiAgICBpZiAoIW9sZFBhdGgpIHtcbiAgICAgIC8vIFJFUS1TUy0xMDg6IGZpbGVJZCBcdUIyMDRcdUI3N0QgXHVDMkRDIHJlc29sdXRpb24gXHVEMDUwXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLnF1ZXVlUmVzb2x1dGlvbikge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5xdWV1ZVJlc29sdXRpb24oZmlsZS5pZCwgZmlsZS5wYXRoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUQzMENcdUM3N0MgXHVDNzc0XHVCOTg0IFx1QkNDMFx1QUNCRFxuICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZVJlbmFtZShvbGRQYXRoLCBmaWxlLnBhdGgpO1xuXG4gICAgLy8gXHVCOUU0XHVENTUxIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOFxuICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkVXBkYXRlKGZpbGUucGF0aCwgZmlsZS5pZCk7XG4gIH1cblxuICAvKipcbiAgICogVDMuNzogaGFuZGxlQ29uZmxpY3REZXRlY3RlZCAoUkVRLVNTLTEwNilcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlQ29uZmxpY3REZXRlY3RlZChtZXNzYWdlOiB7IHR5cGU6ICdjb25mbGljdDpkZXRlY3RlZCc7IGNvbmZsaWN0SWQ6IHN0cmluZzsgZmlsZUlkOiBzdHJpbmc7IGNsaWVudEhhc2g/OiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29uZmxpY3RJZCwgZmlsZUlkLCBjbGllbnRIYXNoIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIGZpbGVJZFx1Qjg1QyBcdUFDQkRcdUI4NUMgXHVDODcwXHVENjhDXG4gICAgY29uc3QgbG9jYWxQYXRoID0gdGhpcy5jYWxsYmFja3MuZ2V0UGF0aEJ5RmlsZUlkKGZpbGVJZCk7XG5cbiAgICBpZiAoIWxvY2FsUGF0aCkge1xuICAgICAgY29uc29sZS53YXJuKGBbU3luY1NlcnZpY2VdIENvbmZsaWN0IGRldGVjdGVkIGJ1dCBmaWxlSWQgbm90IGZvdW5kOiAke2ZpbGVJZH1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUI4NUNcdUNFRUMgXHVCMEI0XHVDNkE5IFx1Qzc3RFx1QUUzMFxuICAgIGNvbnN0IGxvY2FsQ29udGVudCA9IHRoaXMuY2FsbGJhY2tzLnJlYWRGaWxlID8gdGhpcy5jYWxsYmFja3MucmVhZEZpbGUobG9jYWxQYXRoKSA6ICcnO1xuXG4gICAgLy8gXHVDREE5XHVCM0NDIFx1QzgxNVx1QkNGNCBcdUM4MDBcdUM3QTUgXHVCQzBGIFx1QzBBQ1x1QzZBOVx1Qzc5MCBcdUM1NENcdUI5QkNcbiAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Db25mbGljdCkge1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25Db25mbGljdCh7XG4gICAgICAgIGNvbmZsaWN0SWQsXG4gICAgICAgIGZpbGVJZCxcbiAgICAgICAgcGF0aDogbG9jYWxQYXRoLFxuICAgICAgICBsb2NhbENvbnRlbnQsXG4gICAgICAgIGNsaWVudEhhc2gsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Ob3RpY2UpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uTm90aWNlKGBcdUNEQTlcdUIzQ0MgXHVBQzEwXHVDOUMwOiAke2xvY2FsUGF0aH1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVDMuODogaGFuZGxlU3luY0Vycm9yIChSRVEtU1MtMTA3KVxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVTeW5jRXJyb3IobWVzc2FnZTogeyB0eXBlOiAnc3luYzplcnJvcic7IGNvZGU/OiBzdHJpbmc7IG1lc3NhZ2U/OiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29kZSwgbWVzc2FnZTogZXJyb3JNZXNzYWdlIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIFx1QzVEMFx1QjdFQyBcdUNFNzRcdUQxNENcdUFDRTBcdUI5QUMgXHVCRDg0XHVCOTU4XG4gICAgbGV0IGNhdGVnb3J5ID0gJ3NlcnZlcic7XG4gICAgaWYgKGNvZGUpIHtcbiAgICAgIGlmIChjb2RlLnN0YXJ0c1dpdGgoJ0FVVEhfJykpIHtcbiAgICAgICAgY2F0ZWdvcnkgPSAnYXV0aCc7XG4gICAgICB9IGVsc2UgaWYgKGNvZGUuc3RhcnRzV2l0aCgnTkVUV09SS18nKSkge1xuICAgICAgICBjYXRlZ29yeSA9ICduZXR3b3JrJztcbiAgICAgIH0gZWxzZSBpZiAoY29kZS5zdGFydHNXaXRoKCdWQUxJREFUSU9OXycpKSB7XG4gICAgICAgIGNhdGVnb3J5ID0gJ3ZhbGlkYXRpb24nO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1QUQ2Q1x1Qzg3MFx1RDY1NFx1QjQxQyBcdUM1RDBcdUI3RUMgXHVCODVDXHVBREY4XG4gICAgY29uc29sZS5lcnJvcihgW1N5bmNTZXJ2aWNlXSBFcnJvciBbJHtjYXRlZ29yeX1dOmAsIHsgY29kZSwgbWVzc2FnZTogZXJyb3JNZXNzYWdlIH0pO1xuXG4gICAgLy8gXHVDNUQwXHVCN0VDIFx1Q0Y1Q1x1QkMzMVxuICAgIGlmICh0aGlzLmNhbGxiYWNrcy5vbkVycm9yKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vbkVycm9yKHtcbiAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgIGNvZGU6IGNvZGUgfHwgJ1VOS05PV04nLFxuICAgICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQXV0aCBcdUM1RDBcdUI3RUM6IFx1QzdBQ1x1QzVGMFx1QUNCMCBcdUQyQjhcdUI5QUNcdUFDNzBcbiAgICBpZiAoY2F0ZWdvcnkgPT09ICdhdXRoJyAmJiB0aGlzLmNhbGxiYWNrcy50cmlnZ2VyUmVjb25uZWN0KSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy50cmlnZ2VyUmVjb25uZWN0KCk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGlvbiBcdUM1RDBcdUI3RUM6IFx1QjNEOVx1QUUzMFx1RDY1NCBcdUM3N0NcdUMyRENcdUM4MTVcdUM5QzBcbiAgICBpZiAoY2F0ZWdvcnkgPT09ICd2YWxpZGF0aW9uJykge1xuICAgICAgdGhpcy5wYXVzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUMy45OiBoYW5kbGVSZWNvbm5lY3RSZXNwb25zZSAoUkVRLUZDLTEwMilcbiAgICogXHVDMTFDXHVCQzg0IFx1RDMwQ1x1Qzc3QyBcdUJBQTlcdUI4NUQgXHVDNzUxXHVCMkY1IFx1Q0M5OFx1QjlBQ1xuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVSZWNvbm5lY3RSZXNwb25zZShtZXNzYWdlOiBTeW5jUmVjb25uZWN0UmVzcG9uc2VNZXNzYWdlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcz8ub25SZWNvbm5lY3RSZXNwb25zZSkgcmV0dXJuO1xuICAgIHRoaXMuY2FsbGJhY2tzLm9uUmVjb25uZWN0UmVzcG9uc2UobWVzc2FnZS5wYXlsb2FkLnNlcnZlckZpbGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQaGFzZSA0OiBcdUM3OTBcdUFDMDAgb3JpZ2luIFx1RDMxMFx1QkNDNCAoUkVRLUlTLTMwMSlcbiAgICogQE1YOkFOQ0hPUjogW0FVVE9dIFx1Qzc5MFx1QUMwMCBcdUJDQzBcdUFDQkQgXHVCQTU0XHVDMkRDXHVDOUMwIFx1RDU0NFx1RDEzMFx1QjlDMVxuICAgKiBATVg6UkVBU09OOiBSRVEtSVMtMzAxIC0gRWNobyBsb29wIFx1QkMyOVx1QzlDMFx1Qjk3QyBcdUM3MDRcdUQ1NUMgXHVDNzkwXHVBQzAwIG9yaWdpbiBcdUFDMTBcdUM5QzBcbiAgICovXG4gIHByaXZhdGUgaXNTZWxmT3JpZ2luYXRlZChmaWxlSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vIHBlbmRpbmdNZXNzYWdlcyBcdUNDQjRcdUQwNkNcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHRoaXMucGVuZGluZ01lc3NhZ2VzLnZhbHVlcygpKSB7XG4gICAgICBpZiAodmFsdWUucGF0aCA9PT0gZmlsZUlkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlY2VudGx5QWNrbm93bGVkZ2VkIFx1Q0NCNFx1RDA2Q1xuICAgIHJldHVybiB0aGlzLnJlY2VudGx5QWNrbm93bGVkZ2VkLmhhcyhmaWxlSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBoYXNlIDQ6IFx1Q0Q1Q1x1QURGQyBcdUMyQjlcdUM3NzhcdUI0MUMgXHVCQTU0XHVDMkRDXHVDOUMwIFx1QzgxNVx1QjlBQyAoMTBcdUNEMDggXHVBQ0JEXHVBQ0ZDKVxuICAgKi9cbiAgcHJpdmF0ZSBjbGVhbnVwUmVjZW50bHlBY2tub3dsZWRnZWQoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBmb3IgKGNvbnN0IFtmaWxlSWQsIHRpbWVzdGFtcF0gb2YgdGhpcy5yZWNlbnRseUFja25vd2xlZGdlZC5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChub3cgLSB0aW1lc3RhbXAgPiB0aGlzLkFDS19FWFBJUllfTVMpIHtcbiAgICAgICAgdGhpcy5yZWNlbnRseUFja25vd2xlZGdlZC5kZWxldGUoZmlsZUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHVDNjI0XHVENTA0XHVCNzdDXHVDNzc4IFx1RDA1MCBcdUQ1MENcdUI3RUNcdUMyREMgXHVCQzBGIFx1QzVGMFx1QUNCMCBcdUQ1NzRcdUM4MUMgKFJFUS1DVy0xMDMsIFJFUS1VTC0yMDIpXG4gICAqIEBwYXJhbSB0aW1lb3V0IC0gXHVENTBDXHVCN0VDXHVDMkRDIFx1QjMwMFx1QUUzMCBcdUNENUNcdUIzMDAgXHVDMkRDXHVBQzA0IChtcylcbiAgICovXG4gIGFzeW5jIGZsdXNoQW5kRGlzY29ubmVjdCh0aW1lb3V0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBcdUM1RjBcdUFDQjBcdUI0MUMgXHVDMEMxXHVEMERDXHVDNUQwXHVDMTFDIFx1RDA1MCBcdUQ1MENcdUI3RUNcdUMyREMgXHVDMkRDXHVCM0M0XG4gICAgaWYgKHRoaXMud3MgJiYgdGhpcy53cy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgdGhpcy5mbHVzaFF1ZXVlKCk7XG4gICAgfVxuXG4gICAgLy8gXHVEMEMwXHVDNzg0XHVDNTQ0XHVDNkMzIFx1QUNCRFx1QUNGQyBcdUMyREMgXHVCMEE4XHVDNzQwIFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUI4NUNcdUFERjhcbiAgICBjb25zdCByZW1haW5pbmdNZXNzYWdlcyA9IHRoaXMucXVldWUuc2l6ZSgpO1xuICAgIGlmIChyZW1haW5pbmdNZXNzYWdlcyA+IDApIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYFtTeW5jU2VydmljZV0gZmx1c2hBbmREaXNjb25uZWN0OiAke3JlbWFpbmluZ01lc3NhZ2VzfSBtZXNzYWdlcyB1bnNlbnQgYWZ0ZXIgJHt0aW1lb3V0fW1zIHRpbWVvdXRgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJvdW5jZSBcdUQwQzBcdUM3NzRcdUJBMzggXHVDODE1XHVCOUFDIChSRVEtQ1ctMTAzKVxuICAgKi9cbiAgY2xlYW51cFRpbWVycygpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHRpbWVyIG9mIHRoaXMuZGVib3VuY2VUaW1lcnMudmFsdWVzKCkpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgfVxuICAgIHRoaXMuZGVib3VuY2VUaW1lcnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMkRDXHVDNzkxIChSRVEtUlQtMTAxLCBSRVEtUlQtMTAyLCBSRVEtUlQtMTAzKVxuICAgKiBcdUM1RjBcdUFDQjAvXHVDN0FDXHVDNUYwXHVBQ0IwIFx1QzJEQyBcdUM3OTBcdUIzRDkgXHVENjM4XHVDRDlDXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHN0YXJ0UmVjb25uZWN0U3luYygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5pc1JlY29ubmVjdGluZykgcmV0dXJuO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3M/LmNvbGxlY3RMb2NhbEZpbGVzKSB7XG4gICAgICAvLyBcdUNGNUNcdUJDMzFcdUM3NzQgXHVDNUM2XHVDNzNDXHVCQTc0IFx1QUUzMFx1Qzg3NCBmbHVzaFF1ZXVlXHVCOUNDIFx1QzIxOFx1RDU4OVxuICAgICAgdGhpcy5mbHVzaFF1ZXVlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pc1JlY29ubmVjdGluZyA9IHRydWU7XG4gICAgdGhpcy5zZXRTdGF0ZSgnc3luY2luZycpO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1QzlDNFx1RDU4OVx1Qjk2MCBcdUQ0NUNcdUMyREMgKFJFUS1VSS0xMDEpXG4gICAgICB0aGlzLmNhbGxiYWNrcy5zaG93U3RhdHVzQmFyPy4oJ1x1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUMyRENcdUM3OTEgXHVDOTExLi4uJyk7XG5cbiAgICAgIC8vIDEuIFx1Qjg1Q1x1Q0VFQyBcdUQzMENcdUM3N0MgXHVCQUE5XHVCODVEIFx1QzIxOFx1QzlEMSAoUkVRLUZDLTEwMSlcbiAgICAgIGNvbnN0IGxvY2FsRmlsZXMgPSBhd2FpdCB0aGlzLmNhbGxiYWNrcy5jb2xsZWN0TG9jYWxGaWxlcygpO1xuXG4gICAgICAvLyAyLiBcdUMxMUNcdUJDODRcdUM1RDAgXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzY5NFx1Q0NBRCAoUkVRLUZDLTEwMilcbiAgICAgIHRoaXMuc2VuZFN5bmNSZWNvbm5lY3QobG9jYWxGaWxlcyk7XG5cbiAgICAgIC8vIGZsdXNoUXVldWVcdUIyOTQgXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzY0NFx1QjhDQyBcdUQ2QzQgXHVDMjE4XHVENTg5XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSZWNvbm5lY3RTeW5jXSBcdUMyRENcdUM3OTEgXHVDMkU0XHVEMzI4OicsIGVycm9yKTtcbiAgICAgIHRoaXMuaXNSZWNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoJ2Nvbm5lY3RlZCcpO1xuICAgICAgdGhpcy5mbHVzaFF1ZXVlKCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uRXJyb3I/Lih7XG4gICAgICAgIGNhdGVnb3J5OiAnc3luYycsXG4gICAgICAgIGNvZGU6ICdSRUNPTk5FQ1RfU1lOQ19GQUlMRUQnLFxuICAgICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdSZWNvbm5lY3Qgc3luYyBmYWlsZWQnLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM3NTFcdUIyRjUgXHVDQzk4XHVCOUFDIFx1RDZDNCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMjE4XHVENTg5IChSRVEtRkMtMTAzKVxuICAgKiBcdUMxMUNcdUJDODQgXHVEMzBDXHVDNzdDIFx1QkFBOVx1Qjg1RFx1Qzc0NCBcdUJDMUJcdUM1NDQgXHVCODVDXHVDRUVDXHVBQ0ZDIFx1QkU0NFx1QUQ1MFx1RDU1OFx1QzVFQyBcdUM1QzVcdUI4NUNcdUI0REMvXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDL1x1Q0RBOVx1QjNDQyBcdUQ1NzRcdUFDQjBcbiAgICovXG4gIGFzeW5jIHBlcmZvcm1SZWNvbm5lY3RTeW5jKFxuICAgIHNlcnZlckZpbGVzOiBBcnJheTx7IGZpbGVJZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGN1cnJlbnRIYXNoOiBzdHJpbmcgfT4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsRmlsZXMgPSBhd2FpdCB0aGlzLmNhbGxiYWNrcy5jb2xsZWN0TG9jYWxGaWxlcz8uKCkgPz8gW107XG4gICAgY29uc3QgbG9jYWxNYXAgPSBuZXcgTWFwKGxvY2FsRmlsZXMubWFwKGYgPT4gW2YucGF0aCwgZi5oYXNoXSkpO1xuICAgIGNvbnN0IHNlcnZlck1hcCA9IG5ldyBNYXAoc2VydmVyRmlsZXMubWFwKGYgPT4gW2YucGF0aCwgZl0pKTtcblxuICAgIGxldCB1cGxvYWRlZCA9IDA7XG4gICAgbGV0IGRvd25sb2FkZWQgPSAwO1xuICAgIGxldCBjb25mbGljdHMgPSAwO1xuICAgIGNvbnN0IHRvdGFsRmlsZXMgPSBsb2NhbEZpbGVzLmxlbmd0aCArIHNlcnZlckZpbGVzLmZpbHRlcihzZiA9PiAhbG9jYWxNYXAuaGFzKHNmLnBhdGgpKS5sZW5ndGg7XG4gICAgbGV0IHByb2Nlc3NlZCA9IDA7XG5cbiAgICAvLyBcdUI4NUNcdUNFRUMgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdTIxOTIgXHVDNUM1XHVCODVDXHVCNERDIChSRVEtRlMtMTAxKVxuICAgIGZvciAoY29uc3QgbG9jYWxGaWxlIG9mIGxvY2FsRmlsZXMpIHtcbiAgICAgIGlmICghc2VydmVyTWFwLmhhcyhsb2NhbEZpbGUucGF0aCkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBcdUMyRTRcdUM4MUMgXHVEMzBDXHVDNzdDIFx1QjBCNFx1QzZBOSBcdUM3N0RcdUFFMzBcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jYWxsYmFja3MucmVhZEZpbGVBc3luY1xuICAgICAgICAgICAgPyBhd2FpdCB0aGlzLmNhbGxiYWNrcy5yZWFkRmlsZUFzeW5jKGxvY2FsRmlsZS5wYXRoKVxuICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICB0aGlzLnNlbmRGaWxlQ3JlYXRlKGxvY2FsRmlsZS5wYXRoLCBjb250ZW50KTtcbiAgICAgICAgICB1cGxvYWRlZCsrO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtSZWNvbm5lY3RTeW5jXSBcdUM1QzVcdUI4NUNcdUI0REMgXHVDMkU0XHVEMzI4OiAke2xvY2FsRmlsZS5wYXRofWAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gXHVDNTkxXHVDQUJEXHVDNUQwIFx1Qzg3NFx1QzdBQyBcdTIxOTIgXHVENTc0XHVDMkRDIFx1QkU0NFx1QUQ1MCAoUkVRLUZDLTIwMSlcbiAgICAgICAgY29uc3Qgc2VydmVyRmlsZSA9IHNlcnZlck1hcC5nZXQobG9jYWxGaWxlLnBhdGgpITtcbiAgICAgICAgLy8gXHVDREE5XHVCM0NDIFx1RDMwQ1x1Qzc3Q1x1QjNDNCBmaWxlSWQgXHVCOUU0XHVENTUxIFx1RDY1NVx1QjlCRFxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vbkZpbGVJZFVwZGF0ZShsb2NhbEZpbGUucGF0aCwgc2VydmVyRmlsZS5maWxlSWQpO1xuICAgICAgICBpZiAobG9jYWxGaWxlLmhhc2ggIT09IHNlcnZlckZpbGUuY3VycmVudEhhc2gpIHtcbiAgICAgICAgICAvLyBcdUNEQTlcdUIzQ0MgXHVBQzEwXHVDOUMwIChSRVEtRkMtMjAyLCBSRVEtRlMtMTA1KVxuICAgICAgICAgIGNvbnN0IGNvbmZsaWN0SW5mbyA9IHtcbiAgICAgICAgICAgIGZpbGVJZDogc2VydmVyRmlsZS5maWxlSWQsXG4gICAgICAgICAgICBwYXRoOiBsb2NhbEZpbGUucGF0aCxcbiAgICAgICAgICAgIGxvY2FsSGFzaDogbG9jYWxGaWxlLmhhc2gsXG4gICAgICAgICAgICBzZXJ2ZXJIYXNoOiBzZXJ2ZXJGaWxlLmN1cnJlbnRIYXNoLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAodGhpcy5jYWxsYmFja3MucmVzb2x2ZUNvbmZsaWN0KSB7XG4gICAgICAgICAgICAvLyBcdUMwQUNcdUM2QTlcdUM3OTAgXHVDMTIwXHVEMEREIFVJXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjaG9pY2UgPSBhd2FpdCB0aGlzLmNhbGxiYWNrcy5yZXNvbHZlQ29uZmxpY3QoY29uZmxpY3RJbmZvKTtcbiAgICAgICAgICAgICAgLy8gXHVDNzc0XHVDODA0IFx1QkFBOFx1QjJFQ1x1Qzc3NCBcdUM2NDRcdUM4MDRcdUQ3ODggXHVCMkVCXHVENzhDIFx1RDZDNCBcdUIyRTRcdUM3NEMgXHVCQUE4XHVCMkVDIFx1QzVGNFx1QUUzMCBcdUM3MDRcdUQ1NzQgXHVCMzAwXHVBRTMwXG4gICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDApKTtcbiAgICAgICAgICAgICAgaWYgKGNob2ljZSA9PT0gJ2xvY2FsJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmNhbGxiYWNrcy5yZWFkRmlsZUFzeW5jXG4gICAgICAgICAgICAgICAgICA/IGF3YWl0IHRoaXMuY2FsbGJhY2tzLnJlYWRGaWxlQXN5bmMobG9jYWxGaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgICAgIC8vIHJlc29sdmVDb25mbGljdCBcdUQ1MENcdUI3OThcdUFERjhcdUI4NUMgXHVDMTFDXHVCQzg0IFx1Q0UyMSBcdUFFMzBcdUM4NzQgY29uZmxpY3QgXHVDNzkwXHVCM0Q5IFx1RDU3NFx1QUNCMFxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZE9yUXVldWUoJ2ZpbGU6dXBkYXRlJywge1xuICAgICAgICAgICAgICAgICAgZmlsZUlkOiBzZXJ2ZXJGaWxlLmZpbGVJZCxcbiAgICAgICAgICAgICAgICAgIHBhdGg6IGxvY2FsRmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgIGhhc2g6ICcnLFxuICAgICAgICAgICAgICAgICAgcmVzb2x2ZUNvbmZsaWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHVwbG9hZGVkKys7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kb3dubG9hZFNlcnZlckZpbGUoc2VydmVyRmlsZS5maWxlSWQsIGxvY2FsRmlsZS5wYXRoKTtcbiAgICAgICAgICAgICAgICAvLyBcdUMxMUNcdUJDODQgXHVDRTIxIFx1QkJGOFx1RDU3NFx1QUNCMCBjb25mbGljdFx1QjNDNCBrZWVwX3NlcnZlclx1Qjg1QyBcdUQ1NzRcdUFDQjBcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRPclF1ZXVlKCdmaWxlOnVwZGF0ZScsIHtcbiAgICAgICAgICAgICAgICAgIGZpbGVJZDogc2VydmVyRmlsZS5maWxlSWQsXG4gICAgICAgICAgICAgICAgICByZXNvbHZlQ29uZmxpY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICByZXNvbHZlU3RyYXRlZ3k6ICdrZWVwX3NlcnZlcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZG93bmxvYWRlZCsrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gXHVDREE5XHVCM0NDIFx1RDU3NFx1QUNCMCBcdUMyRTRcdUQzMjg6ICR7bG9jYWxGaWxlLnBhdGh9YCwgZXJyb3IpO1xuICAgICAgICAgICAgICBjb25mbGljdHMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gXHVDRjVDXHVCQzMxIFx1QzVDNlx1QzczQ1x1QkE3NCBcdUJCRjhcdUQ1NzRcdUFDQjAgXHVDREE5XHVCM0NDXHVCODVDIFx1Q0U3NFx1QzZCNFx1RDJCOFxuICAgICAgICAgICAgY29uZmxpY3RzKys7XG4gICAgICAgICAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Db25mbGljdCkge1xuICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vbkNvbmZsaWN0KHsgdHlwZTogJ3JlY29ubmVjdF9jb25mbGljdCcsIC4uLmNvbmZsaWN0SW5mbyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByb2Nlc3NlZCsrO1xuICAgICAgdGhpcy5jYWxsYmFja3Muc2hvd1N0YXR1c0Jhcj8uKGBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOTExOiAke3Byb2Nlc3NlZH0vJHt0b3RhbEZpbGVzfSBcdUQzMENcdUM3N0NgKTtcbiAgICB9XG5cbiAgICAvLyBcdUMxMUNcdUJDODQgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdTIxOTIgXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIChSRVEtRlMtMTAyKVxuICAgIGZvciAoY29uc3Qgc2VydmVyRmlsZSBvZiBzZXJ2ZXJGaWxlcykge1xuICAgICAgaWYgKCFsb2NhbE1hcC5oYXMoc2VydmVyRmlsZS5wYXRoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIGZpbGVJZCBcdUI5RTRcdUQ1NTEgXHVDODAwXHVDN0E1IFx1RDZDNCBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0RENcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vbkZpbGVJZFVwZGF0ZShzZXJ2ZXJGaWxlLnBhdGgsIHNlcnZlckZpbGUuZmlsZUlkKTtcbiAgICAgICAgICAvLyBSRVNUIEFQSVx1Qjg1QyBcdUQzMENcdUM3N0MgXHVCMEI0XHVDNkE5IFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQ1xuICAgICAgICAgIGF3YWl0IHRoaXMuZG93bmxvYWRTZXJ2ZXJGaWxlKHNlcnZlckZpbGUuZmlsZUlkLCBzZXJ2ZXJGaWxlLnBhdGgpO1xuICAgICAgICAgIGRvd25sb2FkZWQrKztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtzZXJ2ZXJGaWxlLnBhdGh9YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHByb2Nlc3NlZCsrO1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5zaG93U3RhdHVzQmFyPy4oYFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTE6ICR7cHJvY2Vzc2VkfS8ke3RvdGFsRmlsZXN9IFx1RDMwQ1x1Qzc3Q2ApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM2NDRcdUI4Q0MgKFJFUS1GUy0yMDIpXG4gICAgdGhpcy5zZW5kU3luY1JlY29ubmVjdENvbXBsZXRlKHVwbG9hZGVkLCBkb3dubG9hZGVkLCBjb25mbGljdHMpO1xuXG4gICAgLy8gXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1RDZDNCBcdUM2MjRcdUQ1MDRcdUI3N0NcdUM3NzggXHVEMDUwIFx1QkIzNFx1RDZBOFx1RDY1NCAoc3RhbGUgXHVDNzc0XHVCQ0E0XHVEMkI4IFx1QzdBQ1x1QzBERCBcdUJDMjlcdUM5QzApXG4gICAgdGhpcy5xdWV1ZS5jbGVhcigpO1xuXG4gICAgLy8gXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzBDMVx1RDBEQyBcdUQ1NzRcdUM4MUMgKGZsdXNoTGl2ZVN5bmNRdWV1ZSBcdUM4MDRcdUM1RDAgXHVENTc0XHVDODFDXHVENTc0XHVDNTdDIFx1QkIzNFx1RDU1QyBwdXNoIFx1QkMyOVx1QzlDMClcbiAgICB0aGlzLmlzUmVjb25uZWN0aW5nID0gZmFsc2U7XG5cbiAgICAvLyBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUQwNTAgXHVDQzk4XHVCOUFDIChSRVEtUlQtMjAyKVxuICAgIHRoaXMuZmx1c2hMaXZlU3luY1F1ZXVlKCk7XG5cbiAgICAvLyBVSSBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggKFJFUS1VSS0xMDUpXG4gICAgdGhpcy5jYWxsYmFja3Mub25Ob3RpY2U/LihgXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzY0NFx1QjhDQzogJHt1cGxvYWRlZH1cdUFDMUMgXHVDNUM1XHVCODVDXHVCNERDLCAke2Rvd25sb2FkZWR9XHVBQzFDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQywgJHtjb25mbGljdHN9XHVBQzFDIFx1Q0RBOVx1QjNDQ2ApO1xuICAgIHRoaXMuY2FsbGJhY2tzLmNsZWFyU3RhdHVzQmFyPy4oKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoJ2Nvbm5lY3RlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QzExQ1x1QkM4NCBcdUQzMENcdUM3N0MgXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIChSRVEtRlMtMTAyKVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBkb3dubG9hZFNlcnZlckZpbGUoZmlsZUlkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBiYXNlVXJsID0gdGhpcy5zZXJ2ZXJVcmwucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgICAgIGAke2Jhc2VVcmx9L3YxLyR7dGhpcy52YXVsdElkfS9maWxlcy8ke2ZpbGVJZH0/aW5jbHVkZV9jb250ZW50PXRydWVgLFxuICAgICAgICB7XG4gICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLmFwaUtleX1gIH0sXG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyB7IGNvbnRlbnQ/OiBzdHJpbmcgfTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXRhLmNvbnRlbnQgPz8gJyc7XG5cbiAgICAgIC8vIFx1Qjg1Q1x1Q0VFQyBcdUQzMENcdUM3N0MgXHVDMEREXHVDMTMxIFx1QjYxMFx1QjI5NCBcdUIzNkVcdUM1QjRcdUM0RjBcdUFFMzAgKFx1Q0RBOVx1QjNDQyBcdUQ1NzRcdUFDQjAgXHVDMkRDIFx1Qzc3NFx1QkJGOCBcdUM4NzRcdUM3QUNcdUQ1NThcdUIyOTQgXHVEMzBDXHVDNzdDIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOClcbiAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5wYXRoRXhpc3RzPy4ocGF0aCkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3Mub25GaWxlVXBkYXRlKHBhdGgsIGNvbnRlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3Mub25GaWxlQ3JlYXRlKHBhdGgsIGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gXHVEMzBDXHVDNzdDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUMyRTRcdUQzMjg6ICR7ZmlsZUlkfWAsIGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUQwNTAgXHVENTBDXHVCN0VDXHVDMkRDIChSRVEtUlQtMjAyKVxuICAgKi9cbiAgcHJpdmF0ZSBmbHVzaExpdmVTeW5jUXVldWUoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBldmVudCBvZiB0aGlzLmxpdmVTeW5jUXVldWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hTZXJ2ZXJNZXNzYWdlKGV2ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSZWNvbm5lY3RTeW5jXSBcdUQwNTAgXHVDNzc0XHVCQ0E0XHVEMkI4IFx1Q0M5OFx1QjlBQyBcdUMyRTRcdUQzMjg6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxpdmVTeW5jUXVldWUgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOUM0XHVENTg5IFx1QzkxMVx1Qzc3OFx1QzlDMCBcdUQ2NTVcdUM3NzhcbiAgICovXG4gIGdldCBpc1N5bmNpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZWNvbm5lY3Rpbmc7XG4gIH1cbn1cbiIsICIvKipcbiAqIFNIQS0yNTYgaGFzaGluZyB1dGlsaXRpZXMgZm9yIGNvbnRlbnQgaW50ZWdyaXR5XG4gKiBATVg6Tk9URTogW0FVVE9dIFVzZXMgV2ViIENyeXB0byBBUEkgKGF2YWlsYWJsZSBpbiBPYnNpZGlhbi9FbGVjdHJvbiBlbnZpcm9ubWVudClcbiAqL1xuXG4vLyBUZXh0RW5jb2RlciBpcyBnbG9iYWxseSBhdmFpbGFibGUgaW4gT2JzaWRpYW4vRWxlY3Ryb25cblxuLyoqXG4gKiBDb21wdXRlIFNIQS0yNTYgaGFzaCBvZiBjb250ZW50IHN0cmluZ1xuICogQHBhcmFtIGNvbnRlbnQgLSBUaGUgY29udGVudCB0byBoYXNoXG4gKiBAcmV0dXJucyBIZXgtZW5jb2RlZCBTSEEtMjU2IGhhc2ggKDY0IGhleCBjaGFyYWN0ZXJzKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaENvbnRlbnQoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICBjb25zdCBkYXRhID0gZW5jb2Rlci5lbmNvZGUoY29udGVudCk7XG4gIGNvbnN0IGhhc2ggPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdCgnU0hBLTI1NicsIGRhdGEpO1xuICByZXR1cm4gQXJyYXkuZnJvbShuZXcgVWludDhBcnJheShoYXNoKSlcbiAgICAubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAuam9pbignJyk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFNQSxJQUFBQSxtQkFBZ0Q7OztBQ016QyxJQUFNLG1CQUFrQztBQUFBLEVBQzdDLFdBQVc7QUFBQSxFQUNYLFNBQVM7QUFBQSxFQUNULFFBQVE7QUFBQSxFQUNSLFVBQVU7QUFBQSxFQUNWLGNBQWMsQ0FBQztBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsYUFBYTtBQUNmOzs7QUNwQkEsSUFBQUMsbUJBQXVEOzs7QUNBdkQsc0JBQTRDO0FBT3JDLElBQU0sa0JBQU4sY0FBOEIsc0JBQU07QUFBQSxFQUkxQyxZQUFZLEtBQVUsUUFBcUIsU0FBc0I7QUFDaEUsVUFBTSxHQUFHO0FBQ1QsU0FBSyxTQUFTO0FBQ2QsU0FBSyxrQkFBa0I7QUFBQSxFQUN4QjtBQUFBLEVBRUEsU0FBZTtBQUNkLFVBQU0sRUFBRSxXQUFXLFFBQVEsSUFBSTtBQUMvQixjQUFVLE1BQU07QUFDaEIsWUFBUSxRQUFRLHdDQUFVO0FBRTFCLFVBQU0sWUFBWSxFQUFFLE9BQU8sS0FBSyxPQUFPLFNBQVMsYUFBYSxHQUFHO0FBQ2hFLFVBQU0sVUFBVSxFQUFFLE9BQU8sS0FBSyxPQUFPLFNBQVMsV0FBVyxHQUFHO0FBQzVELFVBQU0sU0FBUyxFQUFFLE9BQU8sS0FBSyxPQUFPLFNBQVMsVUFBVSxHQUFHO0FBRTFELFFBQUksd0JBQVEsU0FBUyxFQUNuQixRQUFRLFlBQVksRUFDcEIsUUFBUSxt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TztBQUFBLElBQ1Q7QUFFQSxXQUFPLEtBQUssU0FBUyxhQUFhLEtBQUssYUFBVztBQUNoRCxVQUFJLFFBQVEsV0FBVyxHQUFHLEdBQUc7QUFDM0IsZUFBTyxLQUFLLFNBQVMsUUFBUSxNQUFNLENBQUMsQ0FBQztBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxLQUFLLFdBQVcsT0FBTztBQUFBLElBQ2hDLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxVQUFnQjtBQUVkLFNBQUssY0FBYyxhQUFhLEVBQUU7QUFBQSxNQUFNLE9BQ3RDLFFBQVEsTUFBTSx3Q0FBOEIsQ0FBQztBQUFBLElBQy9DO0FBRUEsUUFBSSxLQUFLLGFBQWE7QUFFcEIsV0FBSyxZQUFZLG1CQUFtQixHQUFJLEVBQUU7QUFBQSxRQUFNLE9BQzlDLFFBQVEsTUFBTSw4Q0FBb0MsQ0FBQztBQUFBLE1BQ3JEO0FBR0EsV0FBSyxZQUFZLGNBQWM7QUFBQSxJQUNqQztBQUdBLFNBQUssVUFBVSxRQUFRLFNBQU8sS0FBSyxJQUFJLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFDeEQsU0FBSyxZQUFZLENBQUM7QUFDbEIsU0FBSyxjQUFjO0FBQ25CLFNBQUssd0JBQXdCLEVBQUUsV0FBVyxJQUFJLFNBQVMsSUFBSSxRQUFRLEdBQUc7QUFBQSxFQUN4RTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLE9BQVEsTUFBTSxLQUFLLFNBQVMsS0FBTSxDQUFDO0FBQ3pDLFVBQU0sRUFBRSxVQUFVLFNBQVMsR0FBRyxNQUFNLElBQUksS0FBSyxZQUFZO0FBQ3pELFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixLQUFLO0FBQUEsRUFDM0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEVBQUUsVUFBVSxHQUFHLEdBQUcsTUFBTSxJQUFJLEtBQUs7QUFDdkMsVUFBTSxLQUFLLFNBQVMsRUFBRSxVQUFVLE1BQU0sQ0FBQztBQUd2QyxVQUFNLG9CQUNKLEtBQUssU0FBUyxjQUFjLEtBQUssc0JBQXNCLGFBQ3ZELEtBQUssU0FBUyxZQUFZLEtBQUssc0JBQXNCLFdBQ3JELEtBQUssU0FBUyxXQUFXLEtBQUssc0JBQXNCO0FBRXRELFFBQUksbUJBQW1CO0FBQ3JCLFdBQUssUUFBUTtBQUNiLFdBQUssZUFBZTtBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUVGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
