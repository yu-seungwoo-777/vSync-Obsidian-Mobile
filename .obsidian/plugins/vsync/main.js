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
var import_obsidian6 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  serverUrl: "",
  vaultId: "",
  apiKey: "",
  autoSync: true,
  syncEnabled: true,
  skippedPaths: [],
  currentVersion: "",
  downloadUrl: "",
  publicUrl: "",
  // 공유 링크 기능을 위한 공개 URL (SPEC-SHARE-001)
  vaultMappings: [],
  // 다중 볼트 매핑 배열 (SPEC-PLUGIN-MULTIVAULT-001)
  deviceId: ""
  // SPEC-SYNC-005: 디바이스 ID (비어 있으면 로드 시 자동 생성)
};
function migrateToMultiVault(settings) {
  if (settings.vaultMappings && settings.vaultMappings.length > 0) {
    return settings;
  }
  if (!settings.vaultId || settings.vaultId.trim() === "") {
    return {
      ...settings,
      vaultMappings: []
    };
  }
  if (!settings.apiKey || settings.apiKey.trim() === "") {
    console.warn("[migrateToMultiVault] vaultId\uAC00 \uC788\uC9C0\uB9CC apiKey\uAC00 \uB204\uB77D\uB428 \u2014 \uB9C8\uC774\uADF8\uB808\uC774\uC158 \uAC74\uB108\uB700");
    return {
      ...settings,
      vaultMappings: []
    };
  }
  return {
    ...settings,
    vaultMappings: [
      {
        folder: "",
        // 루트 폴더 (모든 파일)
        vaultId: settings.vaultId,
        apiKey: settings.apiKey,
        enabled: true
      }
    ]
  };
}

// src/settings-tab.ts
var import_obsidian2 = require("obsidian");

// src/connection-modal.ts
var import_obsidian = require("obsidian");
var ConnectionModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onClose, mappingIndex) {
    super(app);
    this.plugin = plugin;
    this.onCloseCallback = onClose;
    this.editingMappingIndex = mappingIndex;
  }
  onOpen() {
    const { contentEl, titleEl, containerEl } = this;
    contentEl.empty();
    titleEl.setText(this.editingMappingIndex !== void 0 ? "\uBCFC\uD2B8 \uC124\uC815 \uD3B8\uC9D1" : "\uBCFC\uD2B8 \uCD94\uAC00");
    const scrollContainer = containerEl.querySelector(".modal") ?? containerEl;
    scrollContainer.classList.add("mobile-scroll-container");
    const scrollToInput = (input) => {
      setTimeout(() => {
        const rect = input.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const offset = rect.top - containerRect.top + scrollContainer.scrollTop - containerRect.height / 3;
        scrollContainer.scrollTo({ top: offset, behavior: "smooth" });
      }, 300);
    };
    const existingMapping = this.editingMappingIndex !== void 0 ? (this.plugin.settings.vaultMappings ?? [])[this.editingMappingIndex] : void 0;
    const serverUrl = { value: this.plugin.settings.serverUrl || "" };
    const vaultId = { value: existingMapping?.vaultId || this.plugin.settings.vaultId || "" };
    const apiKey = { value: existingMapping?.apiKey || this.plugin.settings.apiKey || "" };
    const folder = { value: (existingMapping?.folder || "").replace(/ \(vSync\)$/, "") };
    new import_obsidian.Setting(contentEl).setName("\uC11C\uBC84 URL").setDesc("Vector \uC11C\uBC84 URL (\uC608: http://localhost:3000)").addText((text) => text.setPlaceholder("http://localhost:3000").setValue(serverUrl.value).onChange((value) => {
      serverUrl.value = value;
    }).then((el) => el.inputEl.addEventListener("focus", () => scrollToInput(el.inputEl))));
    new import_obsidian.Setting(contentEl).setName("\uBCFC\uD2B8 ID").setDesc("Vector \uC11C\uBC84\uC5D0\uC11C \uBC1C\uAE09\uBC1B\uC740 Vault ID").addText((text) => text.setPlaceholder("\uBCFC\uD2B8 ID\uB97C \uC785\uB825\uD558\uC138\uC694").setValue(vaultId.value).onChange((value) => {
      vaultId.value = value;
    }).then((el) => el.inputEl.addEventListener("focus", () => scrollToInput(el.inputEl))));
    new import_obsidian.Setting(contentEl).setName("API \uD0A4").setDesc("\uC778\uC99D\uC6A9 API Key").addText((text) => {
      text.setPlaceholder("API \uD0A4\uB97C \uC785\uB825\uD558\uC138\uC694").setValue(apiKey.value).onChange((value) => {
        apiKey.value = value;
      });
      text.inputEl.type = "password";
      text.inputEl.addEventListener("focus", () => scrollToInput(text.inputEl));
    });
    new import_obsidian.Setting(contentEl).setName("\uD3F4\uB354").setDesc(this.editingMappingIndex !== void 0 ? "\uD3F4\uB354\uBA85\uC740 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uBCC0\uACBD\uD558\uB824\uBA74 \uB9E4\uD551\uC744 \uC81C\uAC70 \uD6C4 \uB2E4\uC2DC \uCD94\uAC00\uD558\uC138\uC694." : "\uB3D9\uAE30\uD654\uD560 \uD3F4\uB354 \uC774\uB984 (\uB2E8\uC77C \uD3F4\uB354, \uC608: Projects)").addText((text) => text.setPlaceholder("\uC608: Projects").setValue(folder.value).onChange((value) => {
      folder.value = value;
    }).then((el) => {
      if (this.editingMappingIndex !== void 0) {
        el.inputEl.disabled = true;
      }
      el.inputEl.addEventListener("focus", () => scrollToInput(el.inputEl));
    }));
    contentEl.createEl("div", { cls: "mobile-keyboard-spacer" });
    new import_obsidian.Setting(contentEl).addButton((btn) => btn.setButtonText("\uC784\uC2DC\uC800\uC7A5").onClick(async () => {
      try {
        const trimmed = folder.value.trim();
        if (!trimmed) {
          new import_obsidian.Notice("\uD3F4\uB354\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694");
          return;
        }
        if (!/^[\p{L}\p{N} \-_]+$/u.test(trimmed)) {
          new import_obsidian.Notice("\uD55C\uAE00, \uC601\uBB38, \uC22B\uC790, \uACF5\uBC31, -, _\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.");
          return;
        }
        this.saveVaultMapping(serverUrl.value, vaultId.value, apiKey.value, trimmed);
        await this.plugin.saveSettings({ skipReconnect: true });
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
      const trimmed = folder.value.trim();
      if (!trimmed) {
        new import_obsidian.Notice("\uD3F4\uB354\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694");
        btn.setButtonText("\uC5F0\uACB0");
        btn.setDisabled(false);
        return;
      }
      if (!/^[\p{L}\p{N} \-_]+$/u.test(trimmed)) {
        new import_obsidian.Notice("\uD55C\uAE00, \uC601\uBB38, \uC22B\uC790, \uACF5\uBC31, -, _\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.");
        btn.setButtonText("\uC5F0\uACB0");
        btn.setDisabled(false);
        return;
      }
      const success = await this.checkAuth(serverUrl.value, vaultId.value, apiKey.value);
      if (success) {
        try {
          this.saveVaultMapping(serverUrl.value, vaultId.value, apiKey.value, trimmed);
        } catch (e) {
          new import_obsidian.Notice(e.message);
          btn.setButtonText("\uC5F0\uACB0");
          btn.setDisabled(false);
          return;
        }
        this.plugin.settings.syncEnabled = true;
        await this.plugin.saveSettings();
        new import_obsidian.Notice("\uC5F0\uACB0 \uC131\uACF5");
        this.close();
      } else {
        btn.setButtonText("\uC5F0\uACB0");
        btn.setDisabled(false);
      }
    }));
  }
  /**
   * 폴더 값을 포함하여 VaultMapping 저장
   * - 폴더명에 "(vSync)" 접미사 자동 추가
   * - 매핑 내 중복 경로 및 볼트 내 기존 폴더명 검증
   */
  saveVaultMapping(serverUrl, vaultId, apiKey, folder) {
    this.plugin.settings.serverUrl = serverUrl;
    this.plugin.settings.vaultId = vaultId;
    this.plugin.settings.apiKey = apiKey;
    const normalized = folder.replace(/^\/+|\/+$/g, "");
    const suffixed = normalized.endsWith(" (vSync)") ? normalized : `${normalized} (vSync)`;
    const existingMappings = this.plugin.settings.vaultMappings ?? [];
    const duplicateIndex = existingMappings.findIndex(
      (m, idx) => m.folder === suffixed && idx !== this.editingMappingIndex
    );
    if (duplicateIndex !== -1) {
      throw new Error(`'${suffixed}' \uD3F4\uB354\uB294 \uC774\uBBF8 \uB9E4\uD551\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.`);
    }
    const existingFolder = this.app.vault.getFolderByPath(suffixed);
    if (existingFolder) {
      new import_obsidian.Notice(`'${suffixed}' \uD3F4\uB354\uAC00 \uC774\uBBF8 \uC874\uC7AC\uD558\uC5EC \uD574\uB2F9 \uD3F4\uB354\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.`);
    }
    const mapping = {
      folder: suffixed,
      vaultId,
      apiKey,
      enabled: true
    };
    if (this.editingMappingIndex !== void 0) {
      const mappings = [...this.plugin.settings.vaultMappings ?? []];
      mappings[this.editingMappingIndex] = mapping;
      this.plugin.settings.vaultMappings = mappings;
    } else {
      this.plugin.settings.vaultMappings = [
        ...this.plugin.settings.vaultMappings ?? [],
        mapping
      ];
    }
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
        new import_obsidian.Notice("\uC0AC\uC124 IP \uC8FC\uC18C\uC5D0 \uC5F0\uACB0\uD569\uB2C8\uB2E4. \uB3D9\uC77C \uB124\uD2B8\uC6CC\uD06C\uC5D0 \uC788\uB294 \uC11C\uBC84\uC778\uC9C0 \uD655\uC778\uD558\uC138\uC694.");
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 URL \uD615\uC2DD\uC785\uB2C8\uB2E4" };
    }
  }
  async checkAuth(serverUrl, vaultId, apiKey) {
    if (!serverUrl) {
      new import_obsidian.Notice("\uC11C\uBC84 URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694");
      return false;
    }
    if (!vaultId || !apiKey) {
      new import_obsidian.Notice("\uBCFC\uD2B8 ID\uC640 API \uD0A4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694");
      return false;
    }
    try {
      const response = await fetch(`${serverUrl}/v1/vault/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
    this.renderVaultMappingsSection(containerEl);
    new import_obsidian2.Setting(containerEl).setName("\uB3D9\uAE30\uD654").setHeading();
    this.renderSyncControlSection(containerEl);
    this.renderAutoSyncSection(containerEl);
    new import_obsidian2.Setting(containerEl).setName("\uACE0\uAE09").setHeading();
    this.renderPublicUrlSection(containerEl);
    this.renderSkippedPathsSection(containerEl);
    this.renderDownloadSection(containerEl);
  }
  /**
   * 다중 볼트 매핑 관리 섹션 (추가/설정/제거/전체해제)
   */
  renderVaultMappingsSection(containerEl) {
    const mappings = this.plugin.settings.vaultMappings ?? [];
    const hasAnyConnection = !!this.plugin.syncService || !!this.plugin.vaultRouter;
    new import_obsidian2.Setting(containerEl).setName("\uBCFC\uD2B8 \uB9E4\uD551").setDesc(`\uC5F0\uACB0\uB41C \uBCFC\uD2B8: ${mappings.length}\uAC1C`).addButton((btn) => btn.setButtonText("\uBCFC\uD2B8 \uCD94\uAC00").setClass("mod-cta").onClick(() => {
      new ConnectionModal(this.app, this.plugin, () => this.display()).open();
    }));
    if (mappings.length === 0) {
      containerEl.createEl("p", {
        text: '\uC124\uC815\uB41C \uBCFC\uD2B8 \uB9E4\uD551\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. "\uBCFC\uD2B8 \uCD94\uAC00"\uB97C \uB20C\uB7EC \uC5F0\uACB0\uD558\uC138\uC694.',
        cls: "setting-item-description"
      });
      return;
    }
    for (let i = 0; i < mappings.length; i++) {
      const mapping = mappings[i];
      const mappingEl = containerEl.createDiv({ cls: "setting-item" });
      const infoEl = mappingEl.createDiv({ cls: "setting-item-info" });
      infoEl.createEl("div", { text: mapping.folder || "/ (\uB8E8\uD2B8)", cls: "setting-item-name" });
      infoEl.createEl("div", {
        text: `Vault: ${mapping.vaultId.slice(0, 8)}...${mapping.enabled ? "" : " (\uBE44\uD65C\uC131)"}`,
        cls: "setting-item-description"
      });
      const controlEl = mappingEl.createDiv({ cls: "setting-item-control" });
      const status = this.getVaultStatus(mapping);
      controlEl.createEl("span", {
        text: status === "connected" ? "\uC5F0\uACB0\uB428" : "\uC5F0\uACB0 \uC548 \uB428",
        cls: `vault-status-${status}`
      });
      if (status === "connected" && this.plugin.vaultRouter) {
        const service = this.plugin.vaultRouter.getSyncService(mapping.vaultId);
        const isPaused = service?.state === "paused";
        controlEl.createEl("button", {
          text: isPaused ? "\uB3D9\uAE30\uD654 \uC7AC\uAC1C" : "\uB3D9\uAE30\uD654 \uC911\uC9C0"
        }).addEventListener("click", async () => {
          if (service) {
            if (isPaused) {
              service.resume();
              new import_obsidian2.Notice(`${mapping.folder || "\uB8E8\uD2B8"} \uB3D9\uAE30\uD654 \uC7AC\uAC1C`);
            } else {
              service.pause();
              new import_obsidian2.Notice(`${mapping.folder || "\uB8E8\uD2B8"} \uB3D9\uAE30\uD654 \uC911\uC9C0`);
            }
            this.display();
          }
        });
      }
      controlEl.createEl("button", {
        text: "\uC124\uC815"
      }).addEventListener("click", () => {
        new ConnectionModal(this.app, this.plugin, () => this.display(), i).open();
      });
      controlEl.createEl("button", {
        text: "\uC81C\uAC70"
      }).addEventListener("click", async () => {
        const removedMapping = mappings[i];
        const newMappings = [...this.plugin.settings.vaultMappings ?? []];
        newMappings.splice(i, 1);
        this.plugin.settings.vaultMappings = newMappings;
        if (this.plugin.vaultRouter && removedMapping) {
          const service = this.plugin.vaultRouter.getSyncService(removedMapping.vaultId);
          if (service) {
            service.disconnect();
          }
          if (newMappings.length === 0) {
            this.plugin.cleanup();
          }
        }
        await this.plugin.saveSettings({ skipReconnect: true });
        this.display();
      });
    }
    if (hasAnyConnection) {
      new import_obsidian2.Setting(containerEl).setName("\uC804\uCCB4 \uC5F0\uACB0 \uD574\uC81C").setDesc("\uBAA8\uB4E0 \uBCFC\uD2B8 \uB9E4\uD551\uC744 \uC720\uC9C0\uD558\uBA74\uC11C \uC5F0\uACB0\uB9CC \uD574\uC81C").addButton((btn) => btn.setButtonText("\uC5F0\uACB0 \uD574\uC81C").onClick(async () => {
        this.plugin.settings.syncEnabled = false;
        await this.plugin.saveSettings({ skipReconnect: true });
        this.plugin.cleanup();
        new import_obsidian2.Notice("\uBAA8\uB4E0 \uC5F0\uACB0\uC774 \uD574\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        this.display();
      }));
    }
  }
  getVaultStatus(mapping) {
    if (!this.plugin.vaultRouter) return "disconnected";
    const service = this.plugin.vaultRouter.getSyncService(mapping.vaultId);
    return service ? "connected" : "disconnected";
  }
  renderSyncControlSection(containerEl) {
    const hasMappings = (this.plugin.settings.vaultMappings ?? []).length > 0;
    new import_obsidian2.Setting(containerEl).setName("\uB3D9\uAE30\uD654 \uC81C\uC5B4").setDesc("\uBAA8\uB4E0 \uBCFC\uD2B8\uC758 \uB3D9\uAE30\uD654 \uC2DC\uC791/\uC911\uC9C0").addButton((button) => {
      if (this.plugin.vaultRouter || this.plugin.syncService) {
        button.setButtonText("\uB3D9\uAE30\uD654 \uC911\uC9C0");
      } else {
        button.setButtonText("\uB3D9\uAE30\uD654 \uC2DC\uC791");
      }
      button.setDisabled(!hasMappings);
      button.onClick(async () => {
        if (this.plugin.vaultRouter || this.plugin.syncService) {
          this.plugin.settings.syncEnabled = false;
          await this.plugin.saveSettings({ skipReconnect: true });
          this.plugin.cleanup();
        } else {
          this.plugin.settings.syncEnabled = true;
          await this.plugin.saveSettings();
        }
        this.display();
      });
    });
  }
  renderAutoSyncSection(containerEl) {
    new import_obsidian2.Setting(containerEl).setName("\uC790\uB3D9 \uB3D9\uAE30\uD654").setDesc("\uD30C\uC77C \uBCC0\uACBD \uC2DC \uC790\uB3D9 \uB3D9\uAE30\uD654").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoSync).onChange(async (value) => {
      this.plugin.settings.autoSync = value;
      await this.plugin.saveSettings();
    }));
  }
  renderPublicUrlSection(containerEl) {
    new import_obsidian2.Setting(containerEl).setName("\uACF5\uC720 \uB9C1\uD06C URL").setDesc("\uC6F9 \uACF5\uC720 \uAE30\uB2A5\uC5D0 \uC0AC\uC6A9\uD560 \uACF5\uAC1C URL (\uC608: https://vector.example.com)").addText((text) => text.setPlaceholder("https://vector.example.com").setValue(this.plugin.settings.publicUrl || "").onChange(async (value) => {
      this.plugin.settings.publicUrl = value.replace(/\/+$/, "");
      await this.plugin.saveSettings();
    }));
  }
  renderSkippedPathsSection(containerEl) {
    new import_obsidian2.Setting(containerEl).setName("\uC81C\uC678 \uACBD\uB85C").setDesc("\uB3D9\uAE30\uD654\uC5D0\uC11C \uC81C\uC678\uD560 \uACBD\uB85C (\uD55C \uC904\uC5D0 \uD558\uB098)").addTextArea((text) => text.setPlaceholder(".obsidian\n.trash").setValue(this.plugin.settings.skippedPaths.join("\n")).onChange(async (value) => {
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

// src/sync-resolution-modal.ts
var import_obsidian4 = require("obsidian");

// src/file-tree.ts
var TREE_EXPAND_KEY = "vsync-tree-expanded";
function getStoredExpandedPaths() {
  try {
    const stored = sessionStorage.getItem(TREE_EXPAND_KEY);
    return stored ? new Set(JSON.parse(stored)) : /* @__PURE__ */ new Set();
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function storeExpandedPaths(paths) {
  try {
    sessionStorage.setItem(TREE_EXPAND_KEY, JSON.stringify([...paths]));
  } catch {
  }
}
function collectExpandedPaths(nodes) {
  const paths = [];
  function collect(nodes2) {
    for (const node of nodes2) {
      if (node.type === "folder") {
        if (node.expanded) paths.push(node.path);
        collect(node.children);
      }
    }
  }
  collect(nodes);
  return paths;
}
function compressTree(tree) {
  function compressNode(node) {
    if (node.type === "file") return node;
    const compressedChildren = node.children.map(compressNode);
    if (compressedChildren.length === 1 && compressedChildren[0].type === "folder") {
      const child = compressedChildren[0];
      return {
        ...node,
        name: node.name + "/" + child.name,
        path: node.path + "/" + child.name,
        children: child.children,
        expanded: node.expanded && child.expanded
      };
    }
    return {
      ...node,
      children: compressedChildren
    };
  }
  return tree.map(compressNode);
}
function propagateSelection(node, selected) {
  if (node.type === "file") {
    return {
      ...node,
      selected: selected ?? node.selected,
      indeterminate: false
    };
  }
  const newChildren = node.children.map(
    (child) => propagateSelection(child, selected)
  );
  const allSelected = newChildren.every((c) => c.selected);
  const someSelected = newChildren.some((c) => c.selected || c.indeterminate);
  return {
    ...node,
    children: newChildren,
    selected: selected ?? allSelected,
    indeterminate: selected === void 0 ? !allSelected && someSelected : false
  };
}
function renderFileTree(container, tree, callbacks, config) {
  const fragment = document.createDocumentFragment();
  function renderNode(node, parentEl) {
    if (node.type === "folder") {
      renderFolder(node, parentEl);
    } else {
      renderFile(node, parentEl);
    }
  }
  function renderFolder(node, parentEl) {
    const header = document.createElement("div");
    header.className = "vtree-folder-header";
    header.style.setProperty("--vtree-depth", String(node.depth * 14));
    const toggle = document.createElement("span");
    toggle.className = "vtree-toggle";
    toggle.textContent = node.expanded ? "\u25BC" : "\u25B6";
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      callbacks.onToggleExpand(node.path);
    });
    header.appendChild(toggle);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "vtree-checkbox";
    checkbox.checked = node.selected;
    checkbox.indeterminate = node.indeterminate;
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      callbacks.onToggleSelect(node.path, !node.selected);
    });
    header.appendChild(checkbox);
    const name = document.createElement("span");
    name.textContent = node.name;
    name.className = "vtree-folder-name";
    header.appendChild(name);
    parentEl.appendChild(header);
    if (node.expanded && node.children.length > 0) {
      node.children.forEach((child) => renderNode(child, parentEl));
    }
  }
  function renderFile(node, parentEl) {
    const item = document.createElement("div");
    item.className = "vtree-file-item";
    item.style.setProperty("--vtree-depth", String(node.depth * 14));
    const itemClass = config.getItemClass(node);
    if (itemClass) {
      item.classList.add(itemClass);
    }
    const info = document.createElement("div");
    info.className = "vtree-file-info";
    const iconContainer = document.createElement("span");
    iconContainer.className = "vtree-file-icon";
    const icon = config.getIcon(node);
    if (icon) {
      iconContainer.textContent = icon;
    }
    info.appendChild(iconContainer);
    const name = document.createElement("div");
    name.className = "vtree-file-name";
    name.textContent = node.name;
    info.appendChild(name);
    const meta = document.createElement("div");
    meta.className = "vtree-file-meta";
    meta.textContent = config.getMeta(node);
    info.appendChild(meta);
    const badge = config.getBadge(node);
    if (badge) {
      info.appendChild(badge);
    }
    item.appendChild(info);
    const actions = config.getActions(node);
    if (actions.length > 0) {
      const select = document.createElement("select");
      select.className = "vtree-action-select";
      for (const opt of actions) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
      }
      select.value = config.getSelectedAction(node);
      select.addEventListener("change", (e) => {
        const target = e.target;
        callbacks.onActionChange(node.path, target.value);
      });
      item.appendChild(select);
    }
    if (config.onClick) {
      item.addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".vtree-action-select")) return;
        config.onClick(node);
      });
    }
    parentEl.appendChild(item);
  }
  tree.forEach((node) => renderNode(node, fragment));
  container.appendChild(fragment);
}

// src/conflict-modal.ts
var import_obsidian3 = require("obsidian");

// ../../node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/base.js
var Diff = class {
  diff(oldStr, newStr, options = {}) {
    let callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if ("callback" in options) {
      callback = options.callback;
    }
    const oldString = this.castInput(oldStr, options);
    const newString = this.castInput(newStr, options);
    const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
    const newTokens = this.removeEmpty(this.tokenize(newString, options));
    return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
  }
  diffWithOptionsObj(oldTokens, newTokens, options, callback) {
    var _a;
    const done = (value) => {
      value = this.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return void 0;
      } else {
        return value;
      }
    };
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;
    const bestPath = [{ oldPos: -1, lastComponent: void 0 }];
    let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
    }
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    const execEditLength = () => {
      for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = void 0;
        }
        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = this.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = this.addToPath(removePath, false, true, 1, options);
        }
        newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    };
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback(void 0);
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        const ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  }
  addToPath(path, added, removed, oldPosInc, options) {
    const last = path.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: 1, added, removed, previousComponent: last }
      };
    }
  }
  extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
    }
    basePath.oldPos = oldPos;
    return newPos;
  }
  equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  }
  removeEmpty(array) {
    const ret = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  castInput(value, options) {
    return value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenize(value, options) {
    return Array.from(value);
  }
  join(chars) {
    return chars.join("");
  }
  postProcess(changeObjects, options) {
    return changeObjects;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(lastComponent, newTokens, oldTokens) {
    const components = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();
    const componentLen = components.length;
    let componentPos = 0, newPos = 0, oldPos = 0;
    for (; componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function(value2, i) {
            const oldValue = oldTokens[oldPos + i];
            return oldValue.length > value2.length ? oldValue : value2;
          });
          component.value = this.join(value);
        } else {
          component.value = this.join(newTokens.slice(newPos, newPos + component.count));
        }
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
        oldPos += component.count;
      }
    }
    return components;
  }
};

// ../../node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/line.js
var LineDiff = class extends Diff {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize;
  }
  equals(left, right, options) {
    if (options.ignoreWhitespace) {
      if (!options.newlineIsToken || !left.includes("\n")) {
        left = left.trim();
      }
      if (!options.newlineIsToken || !right.includes("\n")) {
        right = right.trim();
      }
    } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
      if (left.endsWith("\n")) {
        left = left.slice(0, -1);
      }
      if (right.endsWith("\n")) {
        right = right.slice(0, -1);
      }
    }
    return super.equals(left, right, options);
  }
};
var lineDiff = new LineDiff();
function diffLines(oldStr, newStr, options) {
  return lineDiff.diff(oldStr, newStr, options);
}
function tokenize(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, "\n");
  }
  const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (let i = 0; i < linesAndNewlines.length; i++) {
    const line = linesAndNewlines[i];
    if (i % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
}

// src/utils.ts
function formatDate(msOrIso) {
  const d = typeof msOrIso === "string" ? new Date(msOrIso) : new Date(msOrIso);
  if (isNaN(d.getTime())) return typeof msOrIso === "string" ? msOrIso : "";
  const y = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const h = d.getHours().toString().padStart(2, "0");
  const mi = d.getMinutes().toString().padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${mi}`;
}
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.classList.add("clipboard-fallback-textarea");
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

// src/conflict-modal.ts
var ConflictDiffModal = class extends import_obsidian3.Modal {
  constructor(app, conflict, onSelect) {
    super(app);
    this.conflict = conflict;
    this.onSelect = onSelect;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("conflict-diff-modal");
    this.titleEl.setText("\uCDA9\uB3CC \uBE44\uAD50");
    const pathEl = contentEl.createEl("p", {
      text: this.conflict.path,
      cls: "conflict-diff-path"
    });
    if (this.conflict.serverUpdatedAt) {
      pathEl.createSpan({
        cls: "conflict-diff-server-date",
        text: ` (\uC11C\uBC84: ${formatDate(this.conflict.serverUpdatedAt)})`
      });
    }
    if (this.conflict.isBinary) {
      contentEl.createEl("p", {
        text: "\uBC14\uC774\uB108\uB9AC \uD30C\uC77C\uC740 \uD14D\uC2A4\uD2B8 \uBE44\uAD50\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
        cls: "conflict-diff-binary-notice"
      });
      this.addVersionButtons(contentEl);
      return;
    }
    if (import_obsidian3.Platform.isMobile) {
      this.renderTabView(contentEl);
    } else {
      this.renderDiffPanels(contentEl);
      this.renderDiff();
      this.setupSyncScroll();
    }
    this.addVersionButtons(contentEl);
  }
  renderDiffPanels(container) {
    const diffContainer = container.createDiv({ cls: "conflict-diff-container" });
    const leftContainer = diffContainer.createDiv({ cls: "conflict-diff-panel-container" });
    leftContainer.createEl("div", {
      cls: "conflict-diff-panel-header",
      text: "\uB85C\uCEEC \uBC84\uC804"
    });
    this.leftPanel = leftContainer.createDiv({ cls: "conflict-diff-panel conflict-diff-local" });
    const rightContainer = diffContainer.createDiv({ cls: "conflict-diff-panel-container" });
    rightContainer.createEl("div", {
      cls: "conflict-diff-panel-header",
      text: "\uC11C\uBC84 \uBC84\uC804"
    });
    this.rightPanel = rightContainer.createDiv({ cls: "conflict-diff-panel conflict-diff-server" });
  }
  /**
   * REQ-MU-011: 모바일 탭 뷰 렌더링
   * createElement만 사용 (innerHTML 없음 - 보안 요구사항)
   */
  renderTabView(container) {
    const tabContainer = container.createDiv({ cls: "vmodal-tabs" });
    const localTab = tabContainer.createEl("button", {
      cls: "vmodal-tab vmodal-tab-active",
      text: "\uB85C\uCEEC \uBC84\uC804"
    });
    const serverTab = tabContainer.createEl("button", {
      cls: "vmodal-tab",
      text: "\uC11C\uBC84 \uBC84\uC804"
    });
    const contentContainer = container.createDiv({ cls: "vmodal-tab-content" });
    this.leftPanel = contentContainer.createDiv({ cls: "conflict-diff-panel conflict-diff-local" });
    this.rightPanel = contentContainer.createDiv({ cls: "conflict-diff-panel conflict-diff-server vmodal-hidden" });
    localTab.addEventListener("click", () => {
      localTab.classList.add("vmodal-tab-active");
      serverTab.classList.remove("vmodal-tab-active");
      this.leftPanel.classList.remove("vmodal-hidden");
      this.rightPanel.classList.add("vmodal-hidden");
    });
    serverTab.addEventListener("click", () => {
      serverTab.classList.add("vmodal-tab-active");
      localTab.classList.remove("vmodal-tab-active");
      this.rightPanel.classList.remove("vmodal-hidden");
      this.leftPanel.classList.add("vmodal-hidden");
    });
    this.renderDiff();
  }
  addVersionButtons(container) {
    new import_obsidian3.Setting(container).addButton(
      (btn) => btn.setButtonText("\uB85C\uCEEC \uBC84\uC804 \uC720\uC9C0").onClick(() => {
        this.onSelect("local");
        this.close();
      })
    ).addButton(
      (btn) => btn.setButtonText("\uC11C\uBC84 \uBC84\uC804\uC73C\uB85C \uAD50\uCCB4").setCta().onClick(() => {
        this.onSelect("server");
        this.close();
      })
    );
  }
  renderDiff() {
    const localLines = this.conflict.localContent.split("\n");
    const serverLines = this.conflict.serverContent.split("\n");
    const maxLines = 1e4;
    const previewLines = 1e3;
    if (localLines.length > maxLines || serverLines.length > maxLines) {
      this.leftPanel.createEl("div", {
        cls: "conflict-diff-warning",
        text: `\uB300\uC6A9\uB7C9 \uD30C\uC77C. \uCC98\uC74C ${previewLines}\uC904\uB9CC \uD45C\uC2DC (\uCD1D ${localLines.length}\uC904).`
      });
      this.rightPanel.createEl("div", {
        cls: "conflict-diff-warning",
        text: `\uB300\uC6A9\uB7C9 \uD30C\uC77C. \uCC98\uC74C ${previewLines}\uC904\uB9CC \uD45C\uC2DC (\uCD1D ${serverLines.length}\uC904).`
      });
    }
    const localContent = localLines.length > maxLines ? localLines.slice(0, previewLines).join("\n") : this.conflict.localContent;
    const serverContent = serverLines.length > maxLines ? serverLines.slice(0, previewLines).join("\n") : this.conflict.serverContent;
    const diff = diffLines(localContent, serverContent);
    diff.forEach((part) => {
      if (part.removed) {
        this.leftPanel.createDiv({
          cls: "conflict-diff-removed",
          text: part.value
        });
      } else if (part.added) {
        this.rightPanel.createDiv({
          cls: "conflict-diff-added",
          text: part.value
        });
      } else {
        this.leftPanel.createDiv({
          cls: "conflict-diff-unchanged",
          text: part.value
        });
        this.rightPanel.createDiv({
          cls: "conflict-diff-unchanged",
          text: part.value
        });
      }
    });
  }
  setupSyncScroll() {
    let syncing = false;
    const sync = (source, target) => {
      if (syncing) return;
      syncing = true;
      requestAnimationFrame(() => {
        target.scrollTop = source.scrollTop;
        syncing = false;
      });
    };
    this.leftPanel.addEventListener("scroll", () => sync(this.leftPanel, this.rightPanel));
    this.rightPanel.addEventListener("scroll", () => sync(this.rightPanel, this.leftPanel));
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/sync-resolution-modal.ts
function buildSyncFileTree(conflicts, localFiles) {
  const tree = [];
  const folderMap = /* @__PURE__ */ new Map();
  const storedPaths = getStoredExpandedPaths();
  for (const conflict of conflicts) {
    const pathParts = conflict.path.split("/").filter((p) => p.length > 0);
    let currentLevel = tree;
    let currentPath = "";
    for (let i = 0; i < pathParts.length; i++) {
      currentPath += (currentPath ? "/" : "") + pathParts[i];
      if (!folderMap.has(currentPath)) {
        const wasExpanded = storedPaths.size > 0 ? storedPaths.has(currentPath) : true;
        const folderNode = {
          name: pathParts[i],
          path: currentPath,
          type: "folder",
          children: [],
          depth: i,
          expanded: wasExpanded,
          selected: false,
          indeterminate: false
        };
        folderMap.set(currentPath, folderNode);
        currentLevel.push(folderNode);
      }
      currentLevel = folderMap.get(currentPath).children;
    }
    currentLevel.push({
      name: pathParts[pathParts.length - 1] || conflict.path,
      path: conflict.path,
      type: "file",
      children: [],
      depth: pathParts.length,
      expanded: false,
      selected: false,
      indeterminate: false,
      data: { kind: "conflict", conflict }
    });
  }
  for (const file of localFiles) {
    const pathParts = file.folder.split("/").filter((p) => p.length > 0);
    let currentLevel = tree;
    let currentPath = "";
    for (let i = 0; i < pathParts.length; i++) {
      currentPath += (currentPath ? "/" : "") + pathParts[i];
      if (!folderMap.has(currentPath)) {
        const wasExpanded = storedPaths.size > 0 ? storedPaths.has(currentPath) : true;
        const folderNode = {
          name: pathParts[i],
          path: currentPath,
          type: "folder",
          children: [],
          depth: i,
          expanded: wasExpanded,
          selected: false,
          indeterminate: false
        };
        folderMap.set(currentPath, folderNode);
        currentLevel.push(folderNode);
      }
      currentLevel = folderMap.get(currentPath).children;
    }
    currentLevel.push({
      name: file.basename,
      path: file.path,
      type: "file",
      children: [],
      depth: pathParts.length,
      expanded: false,
      selected: false,
      indeterminate: false,
      data: { kind: "local-only", localFile: file }
    });
  }
  return cleanTree(tree);
}
function cleanTree(nodes) {
  const filtered = nodes.filter((node) => node.type === "file" || hasFileDescendant(node)).map((node) => {
    if (node.type === "folder") {
      node.children = cleanTree(node.children);
    }
    return node;
  });
  return filtered.sort((a, b) => {
    const aKind = a.data?.kind;
    const bKind = b.data?.kind;
    if (aKind === "conflict" && bKind !== "conflict") return -1;
    if (aKind !== "conflict" && bKind === "conflict") return 1;
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
function hasFileDescendant(node) {
  if (node.type === "file") return true;
  return node.children.some(hasFileDescendant);
}
var CONFLICT_ACTIONS = [
  { value: "server", label: "\uC11C\uBC84 \uBC84\uC804" },
  { value: "local", label: "\uB85C\uCEEC \uBC84\uC804" }
];
var LOCAL_ACTIONS = [
  { value: "upload", label: "\uC5C5\uB85C\uB4DC" },
  { value: "skip", label: "\uAC74\uB108\uB6F0\uAE30" },
  { value: "delete", label: "\uC0AD\uC81C" }
];
function createRenderConfig(actions, onConflictClick) {
  return {
    getMeta(node) {
      const data = node.data;
      if (!data) return "";
      if (data.kind === "conflict" && data.conflict) {
        const c = data.conflict;
        const parts = [];
        const folder = c.path.substring(0, c.path.lastIndexOf("/")) || "/";
        if (folder !== "/") parts.push(folder);
        parts.push(`\uB85C\uCEEC: ${formatSize(c.localSize)}`);
        parts.push(`\uC11C\uBC84: ${formatSize(c.serverSize)}`);
        if (c.serverUpdatedAt) parts.push(`\uC11C\uBC84 \uC218\uC815: ${formatDate(c.serverUpdatedAt)}`);
        return parts.join(" \xB7 ");
      }
      if (data.localFile) {
        const f = data.localFile;
        const parts = [];
        if (f.folder !== "/") parts.push(f.folder);
        parts.push(formatSize(f.size));
        parts.push(formatDate(f.mtime));
        return parts.join(" \xB7 ");
      }
      return "";
    },
    getIcon(node) {
      if (node.data?.kind === "conflict") return "\u26A0\uFE0F";
      if (node.data?.localFile) return "\u{1F4E4}";
      return null;
    },
    getBadge(node) {
      const isBinary = node.data?.conflict?.isBinary ?? node.data?.localFile?.isBinary;
      if (!isBinary) return null;
      const badge = document.createElement("span");
      badge.className = "file-binary-badge";
      badge.textContent = "\uC774\uC9C4 \uD30C\uC77C";
      return badge;
    },
    getItemClass(node) {
      return node.data?.kind === "conflict" ? "vtree-conflict-item" : null;
    },
    getActions(node) {
      if (node.data?.kind === "conflict") return CONFLICT_ACTIONS;
      if (node.data?.localFile) return LOCAL_ACTIONS;
      return [];
    },
    getSelectedAction(node) {
      return actions.get(node.path) ?? "server";
    },
    onClick(node) {
      if (node.data?.kind === "conflict") {
        onConflictClick(node.path);
      }
    }
  };
}
var SyncResolutionModal = class extends import_obsidian4.Modal {
  constructor(app, conflicts, localFiles, onResolve, onCancel) {
    super(app);
    this.onResolve = onResolve;
    this.onCancel = onCancel;
    this.dismissed = false;
    this.currentFilter = "all";
    this.conflicts = conflicts;
    this.localFiles = localFiles;
    this.fileTree = buildSyncFileTree(conflicts, localFiles);
    this.actions = /* @__PURE__ */ new Map();
    for (const c of conflicts) {
      this.actions.set(c.path, c.selectedVersion === "local" ? "local" : "server");
    }
    for (const f of localFiles) {
      this.actions.set(f.path, "upload");
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sync-resolution-modal");
    this.renderTitle();
    this.renderDescription();
    if (this.conflicts.length > 0 && this.localFiles.length > 0) {
      this.renderFilterBar(contentEl);
    }
    const listEl = contentEl.createDiv({ cls: "sync-resolution-file-list vtree-container" });
    const compressedTree = compressTree(this.fileTree);
    this.renderTree(compressedTree, listEl);
    if (!import_obsidian4.Platform.isMobile) {
      this.renderExpandButtons(contentEl);
    }
    this.renderFooter(contentEl);
  }
  renderTitle() {
    const cc = this.conflicts.length;
    const lc = this.localFiles.length;
    let title;
    if (cc > 0 && lc > 0) {
      title = `\uB3D9\uAE30\uD654 \uC2B9\uC778 \xB7 \uCDA9\uB3CC ${cc} \xB7 \uB85C\uCEEC \uC804\uC6A9 ${lc}`;
    } else if (cc > 0) {
      title = `\uB3D9\uAE30\uD654 \uCDA9\uB3CC (${cc}\uAC1C)`;
    } else {
      title = `\uB85C\uCEEC \uC804\uC6A9 \uD30C\uC77C \uB3D9\uAE30\uD654 \uC2B9\uC778 (${lc}\uAC1C)`;
    }
    this.titleEl.setText(title);
  }
  renderDescription() {
    const total = this.conflicts.length + this.localFiles.length;
    this.contentEl.createEl("p", {
      text: `${total}\uAC1C \uD30C\uC77C\uC758 \uCC98\uB9AC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.`,
      cls: "sync-resolution-desc"
    });
  }
  renderFilterBar(container) {
    const filterBar = container.createDiv({ cls: "sync-filter-bar" });
    const filters = [
      { key: "all", label: "\uC804\uCCB4" },
      { key: "conflict", label: "\uCDA9\uB3CC\uB9CC" },
      { key: "local-only", label: "\uB85C\uCEEC \uC804\uC6A9" }
    ];
    for (const filter of filters) {
      const btn = filterBar.createEl("button", {
        text: filter.label,
        cls: `sync-filter-btn ${filter.key === this.currentFilter ? "is-active" : ""}`
      });
      btn.addEventListener("click", () => {
        this.currentFilter = filter.key;
        this.applyFilter();
        filterBar.querySelectorAll(".sync-filter-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    }
  }
  applyFilter() {
    const container = this.contentEl.querySelector(".vtree-container");
    if (!container) return;
    const items = container.querySelectorAll(".vtree-file-item");
    items.forEach((item) => {
      const el = item;
      const isConflict = el.classList.contains("vtree-conflict-item");
      switch (this.currentFilter) {
        case "all":
          el.classList.remove("vtree-hidden");
          break;
        case "conflict":
          el.classList.toggle("vtree-hidden", !isConflict);
          break;
        case "local-only":
          el.classList.toggle("vtree-hidden", isConflict);
          break;
      }
    });
    container.querySelectorAll(".vtree-folder-header").forEach((header) => {
      header.classList.remove("vtree-hidden");
    });
  }
  renderExpandButtons(container) {
    const buttonRow = container.createDiv({ cls: "vtree-button-row" });
    const expandAllBtn = buttonRow.createEl("button", {
      text: "\uBAA8\uB450 \uD3BC\uCE68",
      cls: "vtree-expand-btn"
    });
    const collapseAllBtn = buttonRow.createEl("button", {
      text: "\uBAA8\uB450 \uC811\uC74C",
      cls: "vtree-collapse-btn"
    });
    expandAllBtn.addEventListener("click", () => this.setAllExpanded(true));
    collapseAllBtn.addEventListener("click", () => this.setAllExpanded(false));
  }
  setAllExpanded(expanded) {
    function updateNode(node) {
      if (node.type === "folder") {
        node.expanded = expanded;
        node.children.forEach(updateNode);
      }
    }
    this.fileTree.forEach(updateNode);
    const expandedPaths = collectExpandedPaths(this.fileTree);
    storeExpandedPaths(new Set(expandedPaths));
    this.refreshTree();
  }
  renderTree(tree, container) {
    const callbacks = {
      onActionChange: (path, action) => {
        this.actions.set(path, action);
        const file = this.localFiles.find((f) => f.path === path);
        if (action === "delete" && file?.isBinary) {
          new import_obsidian4.Notice("\uBC14\uC774\uB108\uB9AC \uD30C\uC77C\uC744 \uC0AD\uC81C\uD558\uBA74 \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        }
      },
      onToggleExpand: (path) => {
        this.toggleNodeExpand(path);
        this.refreshTree();
      },
      onToggleSelect: (path, selected) => {
        this.toggleNodeSelect(path, selected);
        this.refreshTree();
      }
    };
    const config = createRenderConfig(this.actions, (path) => {
      const conflict = this.conflicts.find((c) => c.path === path);
      if (!conflict || conflict.isBinary) return;
      const diffModal = new ConflictDiffModal(
        this.app,
        conflict,
        (version) => {
          this.actions.set(path, version);
          this.refreshTree();
        }
      );
      diffModal.open();
    });
    renderFileTree(container, tree, callbacks, config);
  }
  toggleNodeExpand(path) {
    function updateNode(node) {
      if (node.path === path && node.type === "folder") {
        node.expanded = !node.expanded;
        return true;
      }
      if (node.type === "folder") {
        for (const child of node.children) {
          if (updateNode(child)) return true;
        }
      }
      return false;
    }
    this.fileTree.forEach((node) => updateNode(node));
    const expandedPaths = collectExpandedPaths(this.fileTree);
    storeExpandedPaths(new Set(expandedPaths));
  }
  toggleNodeSelect(path, selected) {
    function updateNode(node) {
      if (node.path === path) {
        if (node.type === "file") {
          return { ...node, selected };
        }
        return propagateSelection(node, selected);
      }
      if (node.type === "folder") {
        const updatedChildren = node.children.map(updateNode);
        const allSelected = updatedChildren.every((c) => c.selected);
        const someSelected = updatedChildren.some((c) => c.selected || c.indeterminate);
        return {
          ...node,
          children: updatedChildren,
          selected: allSelected,
          indeterminate: !allSelected && someSelected
        };
      }
      return node;
    }
    this.fileTree = this.fileTree.map((node) => updateNode(node));
    const syncActions = (node) => {
      if (node.type === "file") {
        if (node.data?.kind === "conflict") return;
        if (node.data?.localFile) {
          this.actions.set(node.path, node.selected ? "upload" : "skip");
        }
      }
      if (node.type === "folder") {
        node.children.forEach(syncActions);
      }
    };
    this.fileTree.forEach(syncActions);
  }
  refreshTree() {
    const container = this.contentEl.querySelector(".vtree-container");
    if (!container) return;
    container.empty();
    const compressedTree = compressTree(this.fileTree);
    this.renderTree(compressedTree, container);
    if (this.currentFilter !== "all") {
      this.applyFilter();
    }
  }
  renderFooter(container) {
    new import_obsidian4.Setting(container).addButton((btn) => btn.setButtonText("\uCDE8\uC18C").onClick(() => {
      this.dismissed = true;
      this.onCancel();
      this.close();
    })).addButton((btn) => btn.setButtonText("\uB3D9\uAE30\uD654").setCta().onClick(() => {
      this.dismissed = true;
      this.onResolve(this.actions);
      this.close();
    }));
  }
  onClose() {
    this.contentEl.empty();
    if (!this.dismissed) {
      this.onCancel();
    }
  }
};

// src/hash-utils.ts
async function hashContent(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashBinaryContent(data) {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// src/file-types.ts
var ALLOWED_EXTENSIONS = [
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".pdf",
  ".mp3",
  ".mp4",
  ".wav",
  ".ogg"
];
function extractExtension(filePath) {
  if (!filePath) {
    return "";
  }
  if (filePath.startsWith(".")) {
    return filePath.toLowerCase();
  }
  const lastDotIndex = filePath.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  return filePath.slice(lastDotIndex).toLowerCase();
}
function isAllowedExtension(filePath) {
  const ext = extractExtension(filePath);
  if (!ext) {
    return false;
  }
  return ALLOWED_EXTENSIONS.includes(ext);
}
function isBinaryFile(filePath) {
  const ext = extractExtension(filePath);
  if (!ext) {
    return false;
  }
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return false;
  }
  return ext !== ".md";
}

// src/share-service.ts
var PluginShareService = class {
  constructor(app, settings, showNotice, getFileIdByPath, _syncFileUpdate) {
    this.app = app;
    this.settings = settings;
    this.showNotice = showNotice;
    this.getFileIdByPath = getFileIdByPath;
  }
  /**
   * 공유 링크 생성 (REQ-SHARE-101)
   * @MX:NOTE: [AUTO] fileId 조회 → REST 생성 → 프론트매터 업데이트 → 클립보드 복사
   */
  async createShare(file, expires, silent = false) {
    if (!this.settings.publicUrl) {
      if (!silent) this.showNotice("\uACF5\uC720 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uC124\uC815\uC5D0\uC11C publicUrl\uC744 \uC124\uC815\uD574\uC8FC\uC138\uC694");
      return null;
    }
    try {
      const fileId = await this.getFileId(file);
      if (!fileId) {
        if (!silent) this.showNotice("\uD30C\uC77C\uC774 \uC11C\uBC84\uC5D0 \uB3D9\uAE30\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uB3D9\uAE30\uD654\uD574\uC8FC\uC138\uC694.");
        return null;
      }
      const baseUrl = this.settings.serverUrl.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/v1/${this.settings.vaultId}/shares`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.settings.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileId,
          expiresIn: expires,
          publicUrl: this.settings.publicUrl
        })
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(`[createShare] HTTP ${response.status}:`, errorText);
        if (!silent) this.showNotice(`\uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131 \uC2E4\uD328: HTTP ${response.status} - ${errorText}`);
        return null;
      }
      const shareData = await response.json();
      const existingStatus = await this.getShareStatus(file);
      const isReuse = existingStatus.shareId === shareData.id;
      await this.updateFrontmatterWithRetry(file, {
        share_id: shareData.id,
        share_url: shareData.shareUrl,
        share_expires: shareData.shareExpires || "unlimited"
      }, 3);
      await copyToClipboard(shareData.shareUrl);
      if (!silent) {
        this.showNotice(isReuse ? "\uB9CC\uB8CC \uC2DC\uAC04\uC774 \uAC31\uC2E0\uB418\uC5B4 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4." : "\uACF5\uC720 \uB9C1\uD06C\uAC00 \uC0DD\uC131\uB418\uC5B4 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      }
      return shareData.shareUrl;
    } catch (error) {
      console.error("[createShare] \uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131 \uC2E4\uD328:", error);
      if (!silent) this.showNotice(`\uACF5\uC720 \uC624\uB958: ${error?.message || error}`);
      return null;
    }
  }
  /**
   * 공유 중지 (REQ-SHARE-102)
   * @MX:NOTE: [AUTO] 프론트매터에서 shareId 조회 → REST 삭제 → 프론트매터 업데이트
   */
  async stopShare(file) {
    try {
      const shareId = await this.getShareIdFromFrontmatter(file);
      if (!shareId) {
        this.showNotice("\uACF5\uC720 \uC911\uC778 \uB9C1\uD06C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      const baseUrl = this.settings.serverUrl.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/v1/${this.settings.vaultId}/shares/${shareId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.settings.apiKey}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(`[stopShare] HTTP ${response.status}:`, errorText);
        this.showNotice(`\uACF5\uC720 \uC911\uC9C0 \uC2E4\uD328: HTTP ${response.status}`);
        return;
      }
      await this.removeShareFrontmatter(file);
      this.showNotice("\uACF5\uC720\uAC00 \uC911\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      console.error("[stopShare] \uACF5\uC720 \uC911\uC9C0 \uC2E4\uD328:", error);
      this.showNotice("\uACF5\uC720 \uC911\uC9C0 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
    }
  }
  /**
   * 공유 URL 다시 복사
   * @MX:NOTE: [AUTO] 프론트매터에서 share_url 조회하여 클립보드 복사
   */
  async copyShareUrl(file) {
    try {
      const shareUrl = await this.getShareUrlFromFrontmatter(file);
      if (!shareUrl) {
        this.showNotice("\uACF5\uC720 \uC911\uC778 \uB9C1\uD06C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      await copyToClipboard(shareUrl);
      this.showNotice("\uACF5\uC720 \uB9C1\uD06C\uAC00 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      console.error("[copyShareUrl] URL \uBCF5\uC0AC \uC2E4\uD328:", error);
      this.showNotice("URL \uBCF5\uC0AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
    }
  }
  /**
   * 공유 상태 조회 (REQ-SHARE-103)
   * @MX:NOTE: [AUTO] 프론트매터에서 공유 정보 읽기
   */
  async getShareStatus(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter;
    if (fm?.share_url || fm?.share_expires || fm?.share_id) {
      const shareUrl2 = fm?.share_url || null;
      const shareExpires2 = fm?.share_expires || null;
      const shareId2 = fm?.share_id || null;
      return { isShared: !!shareUrl2 && shareExpires2 !== "expired", shareUrl: shareUrl2, shareExpires: shareExpires2, shareId: shareId2 };
    }
    const fields = await this.readFrontmatterFields(file, "share_url", "share_expires", "share_id");
    const shareUrl = fields.get("share_url") || null;
    const shareExpires = fields.get("share_expires") || null;
    const shareId = fields.get("share_id") || null;
    return { isShared: !!shareUrl && shareExpires !== "expired", shareUrl, shareExpires, shareId };
  }
  /**
   * publicUrl 설정 확인
   */
  isPublicUrlConfigured() {
    return !!this.settings.publicUrl;
  }
  /**
   * 플러그인 시작 시 공유 동기화 (REQ-SHARE-104)
   * @MX:NOTE: [AUTO] 서버 공유 목록과 로컬 프론트매터 동기화
   */
  async syncSharesOnStartup() {
    if (!this.settings.publicUrl) {
      return;
    }
    try {
      const baseUrl = this.settings.serverUrl.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/v1/${this.settings.vaultId}/shares`, {
        headers: {
          "Authorization": `Bearer ${this.settings.apiKey}`
        }
      });
      if (!response.ok) {
        console.warn(`[syncSharesOnStartup] \uACF5\uC720 \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328: HTTP ${response.status}`);
        this.showNotice(`\uACF5\uC720 \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328: \uC11C\uBC84 \uC624\uB958 (HTTP ${response.status})`);
        return;
      }
      const shares = await response.json();
      const serverShareById = /* @__PURE__ */ new Map();
      for (const share of shares) {
        serverShareById.set(share.id, share);
      }
      const allFiles = this.app.vault.getFiles();
      for (const file of allFiles) {
        const localStatus = await this.getShareStatus(file);
        if (!localStatus.shareId && !localStatus.shareUrl) continue;
        const serverShare = localStatus.shareId ? serverShareById.get(localStatus.shareId) : null;
        if (serverShare && serverShare.isActive && !localStatus.shareUrl) {
          await this.updateFrontmatterWithRetry(file, {
            share_id: serverShare.id,
            share_url: serverShare.shareUrl,
            share_expires: serverShare.shareExpires || "unlimited"
          }, 1);
        } else if ((!serverShare || !serverShare.isActive) && localStatus.shareUrl && localStatus.shareExpires !== "expired") {
          await this.updateFrontmatterWithRetry(file, {
            share_expires: "expired"
          }, 1);
        }
      }
    } catch (error) {
      console.error("[syncSharesOnStartup] \uACF5\uC720 \uB3D9\uAE30\uD654 \uC2E4\uD328:", error);
    }
  }
  shouldSuppressModify(_filePath) {
    return false;
  }
  /**
   * 프론트매터 필드 조회 (캐시 우선, 파일 직접 읽기 폴백)
   * @MX:NOTE: [AUTO] metadataCache 캐시 미반영 시 vault.read로 폴백
   */
  async readFrontmatterField(file, ...keys) {
    const cache = this.app.metadataCache.getFileCache(file);
    for (const key of keys) {
      const val = cache?.frontmatter?.[key];
      if (val) return val;
    }
    const fields = await this.readFrontmatterFields(file, ...keys);
    for (const key of keys) {
      const val = fields.get(key);
      if (val) return val;
    }
    return null;
  }
  async readFrontmatterFields(file, ...keys) {
    const result = /* @__PURE__ */ new Map();
    try {
      const content = await this.app.vault.read(file);
      const yamlMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!yamlMatch) return result;
      for (const line of yamlMatch[1].split(/\r?\n/)) {
        for (const key of keys) {
          if (result.has(key)) continue;
          const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const kv = line.match(new RegExp(`^${escaped}:\\s*(.+)$`));
          if (kv) result.set(key, kv[1].trim().replace(/^['"]|['"]$/g, ""));
        }
      }
    } catch {
    }
    return result;
  }
  /**
   * fileId 조회 (프론트매터 또는 FileIdTracker)
   * @MX:NOTE: [AUTO] 프론트매터의 share_id 또는 id 필드 사용
   */
  async getFileId(file) {
    const trackedId = this.getFileIdByPath(file.path);
    if (trackedId) return trackedId;
    return this.readFrontmatterField(file, "id", "share_id");
  }
  /**
   * 프론트매터에서 shareId 조회
   */
  async getShareIdFromFrontmatter(file) {
    return this.readFrontmatterField(file, "share_id");
  }
  /**
   * 프론트매터에서 shareUrl 조회
   */
  async getShareUrlFromFrontmatter(file) {
    return this.readFrontmatterField(file, "share_url");
  }
  /**
   * 프론트매터 업데이트 (재시도 로직 포함)
   * @MX:NOTE: [AUTO] 공유 속성도 서버에 동기화되어야 하므로 modify 이벤트를 억제하지 않음
   */
  async updateFrontmatterWithRetry(file, data, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
          Object.assign(frontmatter, data);
        });
        return;
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }
  /**
   * 프론트매터에서 공유 관련 필드 제거
   */
  async removeShareFrontmatter(file) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      delete frontmatter.share_id;
      delete frontmatter.share_url;
      delete frontmatter.share_expires;
    });
  }
};

// src/share-modal.ts
var import_obsidian5 = require("obsidian");
var EXPIRY_OPTIONS = [
  { value: "1h", label: "1H" },
  { value: "1d", label: "1D" },
  { value: "7d", label: "7D" },
  { value: "unlimited", label: "No Limit" }
];
var ShareModal = class extends import_obsidian5.Modal {
  constructor(app, file, shareService, currentExpiration) {
    super(app);
    this.file = file;
    this.shareService = shareService;
    this.selected = "unlimited";
    this.isUpdate = !!currentExpiration;
    if (currentExpiration) {
      this.selected = currentExpiration;
    }
  }
  onOpen() {
    this.renderSelectPhase();
  }
  renderSelectPhase() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("share-modal");
    this.titleEl.setText(this.isUpdate ? "\uACF5\uC720 \uB9CC\uB8CC \uC2DC\uAC04 \uBCC0\uACBD" : "\uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131");
    new import_obsidian5.Setting(contentEl).setName("\uBB38\uC11C\uBA85").setDesc(this.file.basename).setClass("share-doc-info");
    contentEl.createDiv({ cls: "share-desc", text: "\uACF5\uC720 \uB9C1\uD06C \uB9CC\uB8CC \uC2DC\uAC04\uC744 \uC120\uD0DD\uD558\uC138\uC694" });
    const row = contentEl.createDiv({ cls: "share-expiry-row" });
    for (const opt of EXPIRY_OPTIONS) {
      const btn = row.createEl("button", {
        cls: "share-expiry-btn" + (this.selected === opt.value ? " is-active" : ""),
        text: opt.label
      });
      btn.addEventListener("click", () => {
        this.selected = opt.value;
        this.refreshActiveButton(row);
      });
    }
    new import_obsidian5.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("\uB2EB\uAE30").onClick(() => this.close())
    ).addButton(
      (btn) => btn.setButtonText("\uC0DD\uC131").setCta().onClick(async () => {
        btn.setButtonText("\uC0DD\uC131 \uC911...");
        btn.setDisabled(true);
        const url = await this.shareService.createShare(this.file, this.selected, true);
        if (url) {
          this.renderResultPhase(url);
        } else {
          new import_obsidian5.Notice("\uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
          btn.setButtonText("\uC0DD\uC131");
          btn.setDisabled(false);
        }
      })
    );
  }
  renderResultPhase(url) {
    const { contentEl } = this;
    contentEl.empty();
    this.titleEl.setText("\uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131 \uC644\uB8CC");
    new import_obsidian5.Setting(contentEl).setName("\uBB38\uC11C\uBA85").setDesc(this.file.basename).setClass("share-doc-info");
    new import_obsidian5.Setting(contentEl).setName("\uACF5\uC720 \uB9C1\uD06C").addText((text) => {
      text.setValue(url).setDisabled(true);
      text.inputEl.classList.add("share-link-input");
    });
    new import_obsidian5.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("\uB2EB\uAE30").onClick(() => this.close())
    ).addButton(
      (btn) => btn.setButtonText("\uB9C1\uD06C \uBCF5\uC0AC").setCta().onClick(async () => {
        await copyToClipboard(url);
        btn.setButtonText("\uBCF5\uC0AC\uB428");
        setTimeout(() => btn.setButtonText("\uB9C1\uD06C \uBCF5\uC0AC"), 1500);
      })
    );
  }
  refreshActiveButton(row) {
    const buttons = row.querySelectorAll(".share-expiry-btn");
    const values = EXPIRY_OPTIONS.map((o) => o.value);
    buttons.forEach((btn, i) => {
      btn.classList.toggle("is-active", this.selected === values[i]);
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/file-id-tracker.ts
var FileIdTracker = class {
  // Map<fileId, Map<vaultId, path>>
  constructor(plugin, storage) {
    this.plugin = plugin;
    this.storage = storage;
    // T-005: 중첩 구조로 변경 - Map<vaultId, Map<path, fileId>>
    this.vaultTrackers = /* @__PURE__ */ new Map();
    this.fileIdToPath = /* @__PURE__ */ new Map();
  }
  setFileId(arg1, arg2, arg3) {
    if (arg3 !== void 0) {
      const [vaultId, path, fileId] = [arg1, arg2, arg3];
      if (!fileId) return;
      if (!this.vaultTrackers.has(vaultId)) {
        this.vaultTrackers.set(vaultId, /* @__PURE__ */ new Map());
      }
      this.vaultTrackers.get(vaultId).set(path, fileId);
      if (!this.fileIdToPath.has(fileId)) {
        this.fileIdToPath.set(fileId, /* @__PURE__ */ new Map());
      }
      this.fileIdToPath.get(fileId).set(vaultId, path);
    } else {
      const [path, fileId] = [arg1, arg2];
      if (!fileId) return;
      const defaultVaultId = "default";
      if (!this.vaultTrackers.has(defaultVaultId)) {
        this.vaultTrackers.set(defaultVaultId, /* @__PURE__ */ new Map());
      }
      this.vaultTrackers.get(defaultVaultId).set(path, fileId);
      if (!this.fileIdToPath.has(fileId)) {
        this.fileIdToPath.set(fileId, /* @__PURE__ */ new Map());
      }
      this.fileIdToPath.get(fileId).set(defaultVaultId, path);
    }
  }
  getFileId(arg1, arg2) {
    if (arg2 !== void 0) {
      const [vaultId, path] = [arg1, arg2];
      return this.vaultTrackers.get(vaultId)?.get(path);
    } else {
      const path = arg1;
      return this.vaultTrackers.get("default")?.get(path);
    }
  }
  getPath(arg1, arg2) {
    if (arg2 !== void 0) {
      const [vaultId, fileId] = [arg1, arg2];
      return this.fileIdToPath.get(fileId)?.get(vaultId);
    } else {
      const fileId = arg1;
      return this.fileIdToPath.get(fileId)?.get("default");
    }
  }
  removeFileId(arg1, arg2) {
    if (arg2 !== void 0) {
      const [vaultId, path] = [arg1, arg2];
      const fileId = this.vaultTrackers.get(vaultId)?.get(path);
      if (fileId) {
        this.vaultTrackers.get(vaultId)?.delete(path);
        this.fileIdToPath.get(fileId)?.delete(vaultId);
      }
    } else {
      const path = arg1;
      const fileId = this.vaultTrackers.get("default")?.get(path);
      if (fileId) {
        this.vaultTrackers.get("default")?.delete(path);
        this.fileIdToPath.get(fileId)?.delete("default");
      }
    }
  }
  /**
   * 매핑 저장 (REQ-FM-202)
   * IndexedDB에 매핑 저장
   */
  async saveMappings() {
    for (const [vaultId, pathMap] of this.vaultTrackers.entries()) {
      for (const [path, fileId] of pathMap.entries()) {
        const existing = await this.storage.getFileMeta(vaultId, path);
        await this.storage.setFileMeta(vaultId, path, {
          fileId,
          hash: existing?.hash ?? "",
          mtime: existing?.mtime ?? 0,
          lastSyncTime: existing?.lastSyncTime ?? 0
        });
      }
    }
  }
  /**
   * IndexedDB에서 vault별 매핑 로드
   */
  async loadMappingsFromIndexedDB(vaultIds) {
    this.vaultTrackers.clear();
    this.fileIdToPath.clear();
    for (const vaultId of vaultIds) {
      const mappings = await this.storage.getAllFileMappingsByVault(vaultId);
      for (const { path, fileId } of mappings) {
        this.setFileId(vaultId, path, fileId);
      }
    }
  }
  /**
   * 스테일 매핑 제거 (REQ-FM-204)
   * T-005: 볼트별 검증 지원
   */
  async validateMappings(vaultId) {
    const vaultsToValidate = vaultId ? [vaultId] : Array.from(this.vaultTrackers.keys());
    for (const vId of vaultsToValidate) {
      const stalePaths = [];
      const pathMap = this.vaultTrackers.get(vId);
      if (!pathMap) continue;
      for (const path of pathMap.keys()) {
        const exists = await this.plugin.app.vault.adapter.exists(path);
        if (!exists) {
          stalePaths.push(path);
        }
      }
      for (const path of stalePaths) {
        this.removeFileId(vId, path);
      }
      if (stalePaths.length > 0) {
        await this.saveMappings();
      }
    }
  }
};

// src/resolution-queue.ts
var ResolutionQueue = class {
  constructor() {
    this.queue = /* @__PURE__ */ new Set();
    this.maxSize = 100;
  }
  add(path) {
    if (this.queue.size >= this.maxSize) {
      const first = this.queue.values().next().value;
      if (first) this.queue.delete(first);
    }
    this.queue.add(path);
  }
  remove(path) {
    this.queue.delete(path);
  }
  has(path) {
    return this.queue.has(path);
  }
  /**
   * 큐 처리 (REQ-RQ-301, REQ-RQ-302)
   */
  async processQueue(syncService, getFileId) {
    const pathsToProcess = Array.from(this.queue);
    for (const path of pathsToProcess) {
      const fileId = getFileId(path);
      if (fileId) {
        await syncService.sendFileUpdate(fileId, path, "");
      } else {
        syncService.sendFileCreate(path, "");
      }
      this.remove(path);
    }
  }
  clear() {
    this.queue.clear();
  }
  size() {
    return this.queue.size;
  }
};

// src/offline-queue.ts
var MAX_QUEUE_SIZE = 1e3;
var OfflineQueue = class {
  constructor(storage) {
    this.storage = storage;
  }
  /**
   * Add item to queue
   * Removes oldest item if queue is full
   * Replaces duplicate items with same type and file identifier
   */
  async add(type, payload) {
    const existingItems = await this.storage.getSyncQueueItems();
    const duplicate = existingItems.find((item) => {
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
    if (duplicate && duplicate.id) {
      await this.storage.deleteSyncQueueItem(duplicate.id);
    }
    const currentSize = await this.storage.countSyncQueueItems();
    if (currentSize >= MAX_QUEUE_SIZE && !duplicate) {
      await this.storage.deleteOldestSyncQueueItem();
    }
    await this.storage.addSyncQueueItem({
      type,
      payload,
      timestamp: Date.now()
    });
  }
  /**
   * Get all items, filtering out expired items
   */
  async getAll() {
    const items = await this.storage.getSyncQueueItems();
    return items.map((item) => ({
      ...item,
      id: item.id ? item.id.toString() : crypto.randomUUID(),
      type: item.type
    }));
  }
  /**
   * Clear all items from queue
   */
  async clear() {
    await this.storage.clearSyncQueue();
  }
  /**
   * Get current queue size
   */
  async size() {
    return await this.storage.countSyncQueueItems();
  }
};

// src/rest-client.ts
var BINARY_MIME_MAP = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg"
};
var RestClient = class {
  constructor(serverUrl, vaultId, apiKey) {
    this.baseUrl = serverUrl.replace(/\/$/, "");
    this.vaultId = vaultId;
    this.authHeaders = { "Authorization": `Bearer ${apiKey}` };
  }
  encodePath(filePath) {
    return filePath.startsWith("/") ? filePath.slice(1) : filePath;
  }
  /**
   * 바이너리 파일 업로드 (REQ-ATTACH-002)
   * @returns 서버 응답 JSON 또는 null
   */
  async uploadBinary(filePath, data) {
    const encodedPath = this.encodePath(filePath);
    const ext = "." + filePath.split(".").pop()?.toLowerCase();
    const contentType = BINARY_MIME_MAP[ext] || "application/octet-stream";
    const response = await fetch(
      `${this.baseUrl}/v1/${this.vaultId}/attachments/${encodedPath}`,
      {
        method: "PUT",
        headers: { ...this.authHeaders, "Content-Type": contentType },
        body: data
      }
    );
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      if (response.status === 400 && errorText.includes("already exists")) {
        return null;
      }
      throw new Error(`Binary upload failed: HTTP ${response.status} - ${errorText}`);
    }
    return response.json();
  }
  /**
   * 바이너리 파일 다운로드 (REQ-ATTACH-005)
   */
  async downloadBinary(filePath) {
    const encodedPath = this.encodePath(filePath);
    const response = await fetch(
      `${this.baseUrl}/v1/${this.vaultId}/attachments/${encodedPath}`,
      { headers: this.authHeaders }
    );
    if (!response.ok) {
      throw new Error(`Binary download failed: HTTP ${response.status}`);
    }
    return response.arrayBuffer();
  }
  /**
   * 텍스트 파일 다운로드 (REQ-FS-102)
   */
  async downloadFile(fileId) {
    const response = await fetch(
      `${this.baseUrl}/v1/${this.vaultId}/files/${fileId}?include_content=true`,
      { headers: this.authHeaders }
    );
    if (!response.ok) {
      throw new Error(`File download failed: HTTP ${response.status}`);
    }
    return response.json();
  }
  /**
   * 충돌 목록 조회
   */
  async fetchConflicts() {
    const response = await fetch(
      `${this.baseUrl}/v1/${this.vaultId}/conflicts`,
      { headers: this.authHeaders }
    );
    if (!response.ok) {
      throw new Error(`Fetch conflicts failed: HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.conflicts;
  }
  /**
   * 충돌 상세 조회
   */
  async fetchConflictDetail(conflictId) {
    const response = await fetch(
      `${this.baseUrl}/v1/${this.vaultId}/conflicts/${conflictId}`,
      { headers: this.authHeaders }
    );
    if (!response.ok) {
      throw new Error(`Fetch conflict detail failed: HTTP ${response.status}`);
    }
    return response.json();
  }
  /**
   * 공유 생성
   */
  async createShare(body) {
    return fetch(
      `${this.baseUrl}/v1/${this.vaultId}/shares`,
      {
        method: "POST",
        headers: { ...this.authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
  }
  /**
   * 공유 삭제
   */
  async deleteShare(shareId) {
    return fetch(
      `${this.baseUrl}/v1/${this.vaultId}/shares/${shareId}`,
      {
        method: "DELETE",
        headers: this.authHeaders
      }
    );
  }
  /**
   * 공유 목록 조회
   */
  async fetchShares() {
    return fetch(
      `${this.baseUrl}/v1/${this.vaultId}/shares`,
      { headers: this.authHeaders }
    );
  }
  /**
   * 인증 확인
   */
  async verifyAuth(vaultId, apiKey) {
    const response = await fetch(
      `${this.baseUrl}/v1/vault/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultId, apiKey })
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }
};

// src/sync-service.ts
var SyncService = class {
  constructor(serverUrl, vaultId, apiKey, folderPrefix = "", storage) {
    this.vaultId = vaultId;
    this.apiKey = apiKey;
    this.folderPrefix = folderPrefix;
    this.storage = storage;
    this.ws = null;
    this._state = "offline";
    this.stateListeners = [];
    this.messageListeners = [];
    // 서버에서 받아 로컬에 생성 중인 경로 (에코 방지)
    this.syncCreatedPaths = /* @__PURE__ */ new Set();
    // 서버에서 받아 로컬에 업데이트 중인 경로 (에코 방지)
    this.syncUpdatedPaths = /* @__PURE__ */ new Set();
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
    this.pendingRenames = /* @__PURE__ */ new Map();
    this.recentlyAcknowledged = /* @__PURE__ */ new Map();
    this.ACK_EXPIRY_MS = 1e4;
    // 10 seconds
    this.PENDING_RENAME_EXPIRY_MS = 3e5;
    // Phase 5: Debounce timers
    this.debounceTimers = /* @__PURE__ */ new Map();
    this.DEBOUNCE_MS = 2e3;
    // REQ-FV-110: 2초 디바운스
    // REQ-FV-120: 클라이언트 해시 캐시
    this.lastSentHash = /* @__PURE__ */ new Map();
    // 재동기화 상태 (Reconnection Sync State)
    this.isReconnecting = false;
    this.liveSyncQueue = [];
    // SPEC-SYNC-005: 디바이스 고유 ID (재연결 시나리오 분류용)
    this.deviceId = "";
    this.queue = new OfflineQueue(storage);
    this.restClient = new RestClient(serverUrl, vaultId, apiKey);
    this.folderPrefix = this.folderPrefix.replace(/^\/+|\/+$/g, "");
  }
  // 5 minutes - Issue 1
  /**
   * 부모 폴더가 존재하는지 확인하고 없으면 생성
   */
  async ensureParentFolder(path) {
    if (!this.callbacks?.ensureFolderExists) return;
    const lastSlash = path.lastIndexOf("/");
    if (lastSlash > 0) {
      await this.callbacks.ensureFolderExists(path.substring(0, lastSlash));
    }
  }
  /**
   * 경로 순회 공격 방지 (Path Traversal Prevention)
   * URL 인코딩된 우회 시도와 .. 세그먼트를 모두 차단
   */
  isValidVaultPath(path) {
    if (!path) return false;
    let decoded = path;
    try {
      decoded = decodeURIComponent(path);
    } catch {
      return false;
    }
    const segments = decoded.split("/");
    for (const segment of segments) {
      if (segment === ".." || segment === ".") return false;
    }
    if (decoded.includes("\\")) return false;
    return true;
  }
  /**
   * 서버 경로 → 로컬 경로 (폴더 접두사 추가)
   * 이전 형식(접두사 이미 포함) 경로는 그대로 반환
   */
  toLocalPath(serverPath) {
    if (!this.folderPrefix) return serverPath;
    if (serverPath.startsWith(this.folderPrefix + "/") || serverPath === this.folderPrefix) {
      return serverPath;
    }
    return `${this.folderPrefix}/${serverPath}`;
  }
  /**
   * 로컬 경로 → 서버 경로 (폴더 접두사 제거)
   */
  toServerPath(localPath) {
    if (!this.folderPrefix) return localPath;
    if (localPath.startsWith(this.folderPrefix + "/")) {
      return localPath.slice(this.folderPrefix.length + 1);
    }
    if (localPath === this.folderPrefix) return "";
    return localPath;
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
   * 서버에서 받아 생성한 파일인지 확인 (에코 방지, 일회성)
   */
  isSyncCreatedPath(path) {
    return this.syncCreatedPaths.delete(path);
  }
  /**
   * 서버에서 받아 업데이트한 파일인지 확인 (에코 방지, 일회성)
   */
  isSyncUpdatedPath(path) {
    return this.syncUpdatedPaths.delete(path);
  }
  /**
   * Get current reconnection attempt count
   */
  getReconnectAttempt() {
    return this.reconnectAttempt;
  }
  /**
   * 지정된 경로에 대기 중인 동기화 작업이 있는지 확인
   * file:create, file:rename, pendingRenames 모두 확인하여
   * handleFileModify의 중복 file:create를 방지
   */
  hasPendingSync(path) {
    if (this.pendingMessages.has(path)) return true;
    for (const value of this.pendingRenames.values()) {
      if (value.newLocalPath === path) return true;
    }
    return false;
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
    const url = `${this.restClient.baseUrl}/v1/ws/${this.vaultId}?key=${this.apiKey}`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.clearReconnectTimer();
      this.explicitlyDisconnected = false;
      this.setState("connected");
      this.startReconnectSync();
    };
    this.ws.onclose = () => {
      this.pendingRenames.clear();
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
   * Issue 2: 연결 해제 시 pendingRenames 정리
   */
  disconnect() {
    this.explicitlyDisconnected = true;
    this.clearReconnectTimer();
    this.reconnectAttempt = 0;
    this.pendingRenames.clear();
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      } else if (this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.onopen = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
      }
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
    const serverPath = this.toServerPath(path);
    if (!serverPath) {
      console.warn(`[SyncService] sendFileCreate: \uBE48 \uC11C\uBC84 \uACBD\uB85C \uBB34\uC2DC (local: ${path})`);
      return;
    }
    this.pendingMessages.set(path, { type: "file:create", path: serverPath, timestamp: Date.now() });
    this.sendOrQueue("file:create", { path: serverPath, content });
  }
  /**
   * 재동기화 요청 전송 (REQ-RT-101, REQ-RT-102)
   * SPEC-SYNC-005: deviceId와 mtime 포함 (있는 경우)
   */
  sendSyncReconnect(localFiles) {
    const relevant = this.folderPrefix ? localFiles.filter((f) => f.path.startsWith(this.folderPrefix + "/")) : localFiles;
    const serverFiles = this.folderPrefix ? relevant.map((f) => ({ path: this.toServerPath(f.path), hash: f.hash, mtime: f.mtime })) : relevant;
    const payload = {
      localFiles: serverFiles
    };
    if (this.deviceId) {
      payload.deviceId = this.deviceId;
    }
    this.sendOrQueue("sync:reconnect", { payload });
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
   * REQ-FV-120: 해시 비교로 중복 전송 스킵
   */
  async sendFileUpdate(fileId, path, content) {
    const serverPath = this.toServerPath(path);
    if (!serverPath) {
      console.warn(`[SyncService] sendFileUpdate: \uBE48 \uC11C\uBC84 \uACBD\uB85C \uBB34\uC2DC (local: ${path})`);
      return;
    }
    const contentHash = await hashContent(content);
    const lastHash = this.lastSentHash.get(path);
    if (lastHash === contentHash) {
      return;
    }
    this.lastSentHash.set(path, contentHash);
    const existingTimer = this.debounceTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(async () => {
      this.pendingMessages.set(path, { type: "file:update", path: serverPath, timestamp: Date.now() });
      const updatePayload = { fileId, path: serverPath, content };
      if (this.deviceId) {
        updatePayload.deviceId = this.deviceId;
      }
      if (this.callbacks?.getFileStat) {
        try {
          const stat = await this.callbacks.getFileStat(path);
          updatePayload.clientMtime = stat.mtime;
        } catch {
        }
      }
      this.sendOrQueue("file:update", updatePayload);
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
    const serverOld = this.toServerPath(oldPath);
    const serverNew = this.toServerPath(newPath);
    this.pendingMessages.set(newPath, { type: "file:rename", path: serverNew, timestamp: Date.now() });
    this.sendOrQueue("file:rename", { fileId, oldPath: serverOld, newPath: serverNew });
  }
  /**
   * 생성-이름변경 경쟁 조건 처리: fileId가 아직 없을 때 대기 중인 이름 변경을 큐잉
   *
   * 핵심: pendingMessages 키를 이동하지 않고 그대로 유지 (ack가 원래 경로로 돌아오기 때문)
   * 대신 pendingRenames에 원래 경로를 키로 저장하여 ack 수신 시 매칭
   */
  queuePendingRename(oldLocalPath, newLocalPath) {
    this.cleanupPendingRenames();
    const pending = this.pendingMessages.get(oldLocalPath);
    if (pending && pending.type === "file:create") {
      this.pendingRenames.set(oldLocalPath, {
        oldServerPath: pending.path,
        newServerPath: this.toServerPath(newLocalPath),
        oldLocalPath,
        newLocalPath,
        timestamp: Date.now()
      });
      return true;
    }
    for (const [key, value] of this.pendingRenames.entries()) {
      if (value.newLocalPath === oldLocalPath) {
        this.pendingRenames.set(key, {
          ...value,
          newServerPath: this.toServerPath(newLocalPath),
          newLocalPath,
          timestamp: Date.now()
        });
        return true;
      }
    }
    return false;
  }
  /**
   * Issue 1: 만료된 pendingRenames 정리 (5분 경과)
   */
  cleanupPendingRenames() {
    const now = Date.now();
    for (const [key, value] of this.pendingRenames.entries()) {
      if (now - value.timestamp > this.PENDING_RENAME_EXPIRY_MS) {
        this.pendingRenames.delete(key);
      }
    }
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
  async flushQueue() {
    const items = await this.queue.getAll();
    for (const item of items) {
      const message = JSON.stringify({ type: item.type, ...item.payload });
      this.ws?.send(message);
    }
    await this.queue.clear();
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
   * Issue 1: 만료된 pendingRenames 정리
   */
  handleSyncAck(message) {
    this.cleanupPendingRenames();
    const { fileId, path } = message;
    this.recentlyAcknowledged.set(fileId, Date.now());
    if (path) {
      const localPath = this.toLocalPath(path);
      const pending = this.pendingMessages.get(localPath);
      console.log(`[ACK] path=${path} localPath=${localPath} found=${!!pending}`);
      if (pending) {
        this.pendingMessages.delete(localPath);
        this.callbacks?.onFileIdUpdate(localPath, fileId);
        const pendingRename = this.pendingRenames.get(localPath);
        if (pendingRename) {
          console.log(`[ACK] processing pendingRename: ${localPath} \u2192 ${pendingRename.newLocalPath}`);
          this.pendingRenames.delete(localPath);
          this.sendFileRename(fileId, pendingRename.oldLocalPath, pendingRename.newLocalPath);
        }
        return;
      }
    }
    for (const [key, value] of this.pendingMessages.entries()) {
      if (key === fileId || value.path === fileId) {
        this.pendingMessages.delete(key);
        if (this.callbacks && value.path) {
          const localPath = this.toLocalPath(value.path);
          this.callbacks.onFileIdUpdate(localPath, fileId);
          const pendingRename = this.pendingRenames.get(localPath);
          if (pendingRename) {
            this.pendingRenames.delete(localPath);
            this.sendFileRename(fileId, pendingRename.oldLocalPath, pendingRename.newLocalPath);
          }
        }
        break;
      }
    }
  }
  /**
   * T3.3: handleFileCreated (REQ-SS-102)
   * REQ-ATTACH-005: Binary file download support
   */
  async handleFileCreated(message) {
    const { file } = message;
    if (!this.callbacks) return;
    if (this.isSelfOriginated(file.id)) {
      return;
    }
    const serverPath = file.path.replace(/^\//, "");
    const normalizedPath = this.toLocalPath(serverPath);
    if (!this.isValidVaultPath(normalizedPath)) {
      console.warn(`[handleFileCreated] \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uACBD\uB85C: ${normalizedPath}`);
      return;
    }
    if (this.callbacks.pathExists && this.callbacks.pathExists(normalizedPath)) {
      this.callbacks.onFileIdUpdate(normalizedPath, file.id);
      return;
    }
    if (isBinaryFile(normalizedPath)) {
      this.handleBinaryFileCreated({ ...file, path: normalizedPath });
      return;
    }
    try {
      this.syncCreatedPaths.add(normalizedPath);
      await this.ensureParentFolder(normalizedPath);
      if (file.content !== void 0) {
        await this.callbacks.onFileCreate(normalizedPath, file.content);
      } else {
        await this.downloadServerFile(file.id, normalizedPath);
      }
      this.callbacks.onFileIdUpdate(normalizedPath, file.id);
    } catch (error) {
      this.syncCreatedPaths.delete(normalizedPath);
      console.error(`[handleFileCreated] \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${normalizedPath}`, error);
      this.callbacks.onError?.({
        category: "sync",
        code: "DOWNLOAD_FAILED",
        message: `\uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${normalizedPath}`
      });
    }
  }
  /**
   * REQ-ATTACH-005: 바이너리 파일 생성 처리
   * REST GET으로 다운로드 후 콜백으로 로컬 저장
   */
  async handleBinaryFileCreated(file) {
    if (!this.callbacks) return;
    try {
      await this.ensureParentFolder(file.path);
      const data = await this.downloadBinaryFile(file.path);
      if (this.callbacks.onBinaryFileCreate) {
        await this.callbacks.onBinaryFileCreate(file.path, data);
      }
      this.callbacks.onFileIdUpdate(file.path, file.id);
    } catch (error) {
      console.error(`[handleBinaryFileCreated] \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${file.path}`, error);
      this.callbacks.onError?.({
        category: "sync",
        code: "BINARY_DOWNLOAD_FAILED",
        message: `Binary download failed for ${file.path}`
      });
    }
  }
  /**
   * T3.4: handleFileUpdated (REQ-SS-103)
   * REQ-ATTACH-005: Binary file download support
   */
  async handleFileUpdated(message) {
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
    if (!this.isValidVaultPath(localPath)) {
      console.warn(`[handleFileUpdated] \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uACBD\uB85C: ${localPath}`);
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
    if (isBinaryFile(localPath)) {
      this.handleBinaryFileUpdated(file.id, localPath);
      return;
    }
    try {
      this.syncUpdatedPaths.add(localPath);
      if (file.content !== void 0) {
        await this.callbacks.onFileUpdate(localPath, file.content);
      } else {
        await this.downloadServerFile(file.id, localPath);
      }
    } catch (error) {
      console.error(`[handleFileUpdated] \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${localPath}`, error);
      this.callbacks.onError?.({
        category: "sync",
        code: "DOWNLOAD_FAILED",
        message: `\uD30C\uC77C \uC5C5\uB370\uC774\uD2B8 \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${localPath}`
      });
    }
  }
  /**
   * REQ-ATTACH-005: 바이너리 파일 업데이트 처리
   * REST GET으로 다운로드 후 콜백으로 로컬 업데이트
   */
  async handleBinaryFileUpdated(fileId, localPath) {
    if (!this.callbacks) return;
    try {
      this.syncUpdatedPaths.add(localPath);
      const data = await this.downloadBinaryFile(localPath);
      if (this.callbacks.onBinaryFileUpdate) {
        await this.callbacks.onBinaryFileUpdate(localPath, data);
      }
    } catch (error) {
      console.error(`[handleBinaryFileUpdated] \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${localPath}`, error);
      this.callbacks.onError?.({
        category: "sync",
        code: "BINARY_DOWNLOAD_FAILED",
        message: `Binary download failed for ${localPath}`
      });
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
    const newLocalPath = this.toLocalPath(file.path);
    const oldPath = this.callbacks.getPathByFileId(file.id);
    if (!oldPath) {
      if (this.callbacks.queueResolution) {
        this.callbacks.queueResolution(file.id, newLocalPath);
      }
      return;
    }
    this.callbacks.onFileRename(oldPath, newLocalPath);
    this.callbacks.onFileIdUpdate(newLocalPath, file.id);
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
      this.callbacks.onNotice(`\uB3D9\uAE30\uD654 \uCDA9\uB3CC: ${localPath}`);
    }
  }
  /**
   * T3.8: handleSyncError (REQ-SS-107)
   */
  handleSyncError(message) {
    const { code, message: errorMessage } = message;
    if (!this.callbacks) return;
    if (errorMessage?.includes("already exists")) {
      console.log(`[SyncService] \uD30C\uC77C \uC774\uBBF8 \uC874\uC7AC (\uBB34\uC2DC): ${errorMessage}`);
      return;
    }
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
    console.error(`[SyncService] Error [${category}]: ${code || "UNKNOWN"} \u2014 ${errorMessage || "No message"}`);
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
    this.performReconnectSync(message.payload.serverFiles);
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
   * 바이너리 파일 업로드 (REQ-ATTACH-002)
   */
  async uploadBinaryFile(filePath, data) {
    try {
      const serverPath = this.toServerPath(filePath);
      const result = await this.restClient.uploadBinary(serverPath, data);
      if (!result) return null;
      const fileId = result.id ?? null;
      if (fileId) {
        this.recentlyAcknowledged.set(fileId, Date.now());
        this.callbacks?.onFileIdUpdate(filePath, fileId);
      }
      return fileId;
    } catch (error) {
      console.error(`[uploadBinaryFile] \uC5C5\uB85C\uB4DC \uC2E4\uD328: ${filePath}`, error);
      this.callbacks?.onError?.({
        category: "server",
        code: "BINARY_UPLOAD_FAILED",
        message: error instanceof Error ? error.message : "Binary upload failed"
      });
      return null;
    }
  }
  /**
   * 바이너리 파일 다운로드 (REQ-ATTACH-005)
   */
  async downloadBinaryFile(filePath) {
    return this.restClient.downloadBinary(filePath);
  }
  /**
   * 오프라인 큐 플러시 및 연결 해제 (REQ-CW-103, REQ-UL-202)
   * @param timeout - 플러시 대기 최대 시간 (ms)
   */
  async flushAndDisconnect(timeout) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      await this.flushQueue();
    }
    const remainingMessages = await this.queue.size();
    if (remainingMessages > 0) {
      console.warn(
        `[SyncService] flushAndDisconnect: ${remainingMessages} messages unsent after ${timeout}ms timeout`
      );
    }
    this.disconnect();
  }
  /**
   * Debounce 타이머 정리 (REQ-CW-103)
   * REQ-FV-120: 해시 캐시 정리
   */
  cleanupTimers() {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.lastSentHash.clear();
  }
  /**
   * 재동기화 시작 (REQ-RT-101, REQ-RT-102, REQ-RT-103)
   * 연결/재연결 시 자동 호출
   */
  async startReconnectSync() {
    if (this.isReconnecting) return;
    if (!this.callbacks?.collectLocalFiles) {
      await this.flushQueue();
      return;
    }
    this.isReconnecting = true;
    this.setState("syncing");
    try {
      this.callbacks.showStatusBar?.("\uC7AC\uB3D9\uAE30\uD654 \uC900\uBE44 \uC911...");
      const localFiles = await this.callbacks.collectLocalFiles();
      this.sendSyncReconnect(localFiles);
    } catch (error) {
      console.error("[ReconnectSync] \uC2DC\uC791 \uC2E4\uD328:", error);
      this.isReconnecting = false;
      this.setState("connected");
      await this.flushQueue();
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
   * T-012: 일괄 충돌 해결 지원
   */
  async performReconnectSync(serverFiles) {
    if (!this.callbacks) return;
    const allLocalFiles = await this.callbacks.collectLocalFiles?.() ?? [];
    const localFiles = this.folderPrefix ? allLocalFiles.filter((f) => f.path.startsWith(this.folderPrefix + "/")) : allLocalFiles;
    const localMap = new Map(localFiles.map((f) => [f.path, f.hash]));
    const serverMap = new Map(serverFiles.map((f) => [this.toLocalPath(f.path.replace(/^\//, "")), f]));
    let uploaded = 0;
    let downloaded = 0;
    let conflicts = 0;
    let userSkippedConflicts = false;
    const totalFiles = localFiles.length + serverFiles.filter((sf) => !localMap.has(sf.path)).length;
    let processed = 0;
    const conflictArray = [];
    const localOnlyFiles = [];
    for (const localFile of localFiles) {
      if (!serverMap.has(localFile.path)) {
        const basename = localFile.path.split("/").pop() || localFile.path;
        const folder = localFile.path.substring(0, localFile.path.lastIndexOf("/")) || "/";
        const stat = this.callbacks.getFileStat ? await this.callbacks.getFileStat(localFile.path) : { size: 0, mtime: Date.now() };
        localOnlyFiles.push({
          path: localFile.path,
          basename,
          folder,
          size: stat.size,
          mtime: stat.mtime,
          isBinary: isBinaryFile(localFile.path)
        });
      }
    }
    if (localOnlyFiles.length > 0) {
      if (this.callbacks.approveLocalUploads) {
        const actionMap = await this.callbacks.approveLocalUploads(localOnlyFiles);
        if (actionMap.size === 0) {
          console.log("[ReconnectSync] \uC0AC\uC6A9\uC790\uAC00 \uB85C\uCEEC \uC804\uC6A9 \uD30C\uC77C \uCC98\uB9AC\uB97C \uCDE8\uC18C\uD568");
        } else {
          for (const file of localOnlyFiles) {
            const action = actionMap.get(file.path);
            if (!action || action === "skip" /* Skip */) {
              continue;
            }
            try {
              if (action === "delete" /* Delete */) {
                if (this.callbacks.trashFile) {
                  await this.callbacks.trashFile(file.path);
                  console.log(`[ReconnectSync] \uB85C\uCEEC \uC804\uC6A9 \uD30C\uC77C \uC0AD\uC81C: ${file.path}`);
                }
              } else if (action === "upload" /* Upload */) {
                if (file.isBinary) {
                  const data = this.callbacks.readBinaryFileAsync ? await this.callbacks.readBinaryFileAsync(file.path) : new ArrayBuffer(0);
                  if (data.byteLength > 0) {
                    await this.uploadBinaryFile(file.path, data);
                    uploaded++;
                  }
                } else {
                  const content = this.callbacks.readFileAsync ? await this.callbacks.readFileAsync(file.path) : "";
                  this.sendFileCreate(file.path, content);
                  uploaded++;
                }
              }
            } catch (error) {
              console.error(`[ReconnectSync] \uB85C\uCEEC \uC804\uC6A9 \uD30C\uC77C \uCC98\uB9AC \uC2E4\uD328: ${file.path}`, error);
            }
          }
        }
      } else {
        for (const file of localOnlyFiles) {
          try {
            if (file.isBinary) {
              const data = this.callbacks.readBinaryFileAsync ? await this.callbacks.readBinaryFileAsync(file.path) : new ArrayBuffer(0);
              if (data.byteLength > 0) {
                await this.uploadBinaryFile(file.path, data);
                uploaded++;
              }
            } else {
              const content = this.callbacks.readFileAsync ? await this.callbacks.readFileAsync(file.path) : "";
              this.sendFileCreate(file.path, content);
              uploaded++;
            }
          } catch (error) {
            console.error(`[ReconnectSync] \uC5C5\uB85C\uB4DC \uC2E4\uD328: ${file.path}`, error);
          }
        }
      }
    }
    for (const localFile of localFiles) {
      if (serverMap.has(localFile.path)) {
        const serverFile = serverMap.get(localFile.path);
        this.callbacks.onFileIdUpdate(localFile.path, serverFile.fileId);
        if (localFile.hash !== serverFile.currentHash) {
          const action = serverFile.action;
          if (action === "download") {
            try {
              const data = await this.restClient.downloadFile(serverFile.fileId);
              const serverContent = data.content ?? "";
              if (this.callbacks.onFileUpdate) {
                await this.callbacks.onFileUpdate(localFile.path, serverContent);
              }
              downloaded++;
            } catch (err) {
              console.error(`[ReconnectSync] auto_download \uC2E4\uD328: ${localFile.path}`, err);
            }
          } else if (action === "upload") {
            try {
              const content = this.callbacks.readFileAsync ? await this.callbacks.readFileAsync(localFile.path) : "";
              this.sendOrQueue("file:update", { fileId: serverFile.fileId, path: serverFile.path, content });
              uploaded++;
            } catch (err) {
              console.error(`[ReconnectSync] auto_upload \uC2E4\uD328: ${localFile.path}`, err);
            }
          } else {
            conflictArray.push({
              conflictId: serverFile.fileId,
              path: localFile.path,
              localSize: localFile.path.length,
              serverSize: serverFile.currentHash.length,
              serverContent: "",
              localContent: "",
              selectedVersion: "server",
              serverUpdatedAt: serverFile.updatedAt
            });
          }
        }
      }
      processed++;
      this.callbacks.showStatusBar?.(`\uB3D9\uAE30\uD654 \uC911... (${processed}/${totalFiles})`);
    }
    if (conflictArray.length > 0 && this.callbacks.resolveConflicts) {
      this.callbacks.showStatusBar?.(`\uCDA9\uB3CC \uBD84\uC11D \uC911...`);
      const conflictsWithContent = await Promise.all(
        conflictArray.map(async (conflict) => {
          try {
            const localContent = this.callbacks?.readFileAsync != null ? await this.callbacks.readFileAsync(conflict.path) : "";
            let serverContent = "";
            try {
              const data = await this.restClient.downloadFile(conflict.conflictId);
              serverContent = data.content ?? "";
            } catch {
            }
            return {
              ...conflict,
              localContent,
              serverContent,
              localSize: localContent.length,
              serverSize: serverContent.length
            };
          } catch (error) {
            console.error(`[ReconnectSync] \uCDA9\uB3CC \uB0B4\uC6A9 \uAC00\uC838\uC624\uAE30 \uC2E4\uD328: ${conflict.path}`, error);
            return conflict;
          }
        })
      );
      let resolvedConflicts;
      try {
        resolvedConflicts = await this.callbacks.resolveConflicts(conflictsWithContent);
      } catch (error) {
        console.log("[ReconnectSync] \uC0AC\uC6A9\uC790\uAC00 \uCDA9\uB3CC \uD574\uACB0\uC744 \uAC74\uB108\uB700");
        userSkippedConflicts = true;
        conflicts = conflictArray.length;
        resolvedConflicts = [];
      }
      for (const conflict of resolvedConflicts) {
        try {
          if (conflict.selectedVersion === "local") {
            this.sendOrQueue("file:update", {
              fileId: conflict.conflictId,
              path: conflict.path,
              content: conflict.localContent,
              hash: "",
              resolveConflict: true
            });
            uploaded++;
          } else {
            await this.callbacks.onFileUpdate?.(conflict.path, conflict.serverContent);
            this.sendOrQueue("file:update", {
              fileId: conflict.conflictId,
              resolveConflict: true,
              resolveStrategy: "keep_server"
            });
            downloaded++;
          }
        } catch (error) {
          console.error(`[ReconnectSync] \uCDA9\uB3CC \uD574\uACB0 \uC801\uC6A9 \uC2E4\uD328: ${conflict.path}`, error);
          conflicts++;
        }
      }
    } else if (conflictArray.length > 0) {
      conflicts = conflictArray.length;
      if (this.callbacks.onConflict) {
        for (const conflict of conflictArray) {
          this.callbacks.onConflict({ type: "reconnect_conflict", ...conflict });
        }
      }
    }
    for (const serverFile of serverFiles) {
      const serverFilePath = serverFile.path.replace(/^\//, "");
      const normalizedPath = this.toLocalPath(serverFilePath);
      if (!localMap.has(normalizedPath)) {
        try {
          this.callbacks.onFileIdUpdate(normalizedPath, serverFile.fileId);
          if (isBinaryFile(normalizedPath)) {
            const data = await this.downloadBinaryFile(normalizedPath);
            await this.ensureParentFolder(normalizedPath);
            if (this.callbacks.onBinaryFileCreate) {
              await this.callbacks.onBinaryFileCreate(normalizedPath, data);
            }
          } else {
            await this.downloadServerFile(serverFile.fileId, normalizedPath);
          }
          downloaded++;
        } catch (error) {
          console.error(`[ReconnectSync] \uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: ${serverFile.path}`, error);
        }
        processed++;
        this.callbacks.showStatusBar?.(`\uB3D9\uAE30\uD654 \uC911... (${processed}/${totalFiles})`);
      }
    }
    this.sendSyncReconnectComplete(uploaded, downloaded, conflicts);
    this.queue.clear();
    this.isReconnecting = false;
    this.flushLiveSyncQueue();
    const skipMsg = userSkippedConflicts ? ` (${conflicts}\uAC1C \uCDA9\uB3CC \uAC74\uB108\uB700)` : conflicts > 0 ? `, ${conflicts}\uAC1C \uCDA9\uB3CC` : "";
    this.callbacks.onNotice?.(`\uC7AC\uB3D9\uAE30\uD654 \uC644\uB8CC: ${uploaded}\uAC1C \uC5C5\uB85C\uB4DC, ${downloaded}\uAC1C \uB2E4\uC6B4\uB85C\uB4DC${skipMsg}`);
    this.callbacks.clearStatusBar?.();
    this.setState("connected");
  }
  /**
   * 서버 파일 다운로드 (REQ-FS-102)
   */
  async downloadServerFile(fileId, path) {
    if (!this.callbacks) return;
    try {
      const data = await this.restClient.downloadFile(fileId);
      const content = data.content ?? "";
      if (this.callbacks.pathExists?.(path)) {
        await this.callbacks.onFileUpdate(path, content);
      } else {
        await this.ensureParentFolder(path);
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

// src/vault-router.ts
var VaultRouter = class {
  /**
   * VaultRouter 생성자
   */
  constructor(mappings, serverUrl, storage) {
    this.syncServices = /* @__PURE__ */ new Map();
    this.serverUrl = serverUrl;
    this.storage = storage;
    this.mappings = mappings.filter((m) => m.enabled).map((m) => ({
      folder: this.normalizeFolder(m.folder),
      vaultId: m.vaultId,
      apiKey: m.apiKey,
      enabled: m.enabled
    }));
    for (const mapping of this.mappings) {
      if (!this.syncServices.has(mapping.vaultId)) {
        const syncService = new SyncService(
          this.serverUrl,
          mapping.vaultId,
          mapping.apiKey,
          mapping.folder,
          this.storage
          // SPEC-SYNC-006: storage 전달
        );
        this.syncServices.set(mapping.vaultId, syncService);
      }
    }
  }
  /**
   * 폴더 경로 정규화 (선행/후행 슬래시 제거)
   *
   * @param folder - 원본 폴더 경로
   * @returns 정규화된 폴더 경로
   */
  normalizeFolder(folder) {
    return folder.replace(/^\/+|\/+$/g, "");
  }
  /**
   * 파일 경로 정규화 (선행 슬래시 제거)
   *
   * @param path - 원본 파일 경로
   * @returns 정규화된 파일 경로
   */
  normalizePath(path) {
    return path.replace(/^\/+/, "");
  }
  /**
   * REQ-006, REQ-008: 파일 경로를 기반으로 올바른 볼트 ID 라우팅
   *
   * @param path - 파일 경로
   * @returns 매핑된 볼트 ID 또는 null (매핑 없음)
   */
  /**
   * @MX:ANCHOR: [AUTO] 경로 기반 볼트 라우팅 - 모든 파일 이벤트의 진입점 (fan_in >= 3)
   * @MX:REASON: REQ-006, REQ-008 - 핵심 라우팅 로직으로 다수 핸들러에서 호출
   */
  route(path) {
    const normalizedPath = this.normalizePath(path);
    if (!normalizedPath) {
      return null;
    }
    let bestMatch = null;
    let bestMatchLength = -1;
    for (const mapping of this.mappings) {
      if (mapping.folder === "") {
        const currentLength = 0;
        if (currentLength > bestMatchLength) {
          bestMatch = mapping;
          bestMatchLength = currentLength;
        }
        continue;
      }
      if (normalizedPath.startsWith(mapping.folder + "/") || normalizedPath === mapping.folder) {
        const currentLength = mapping.folder.length;
        if (currentLength > bestMatchLength) {
          bestMatch = mapping;
          bestMatchLength = currentLength;
        }
      }
    }
    return bestMatch?.vaultId ?? null;
  }
  /**
   * REQ-009: 모든 SyncService 인스턴스 반환
   *
   * @returns vaultId → SyncService 맵
   */
  getSyncServices() {
    return this.syncServices;
  }
  /**
   * 특정 볼트의 SyncService 반환
   *
   * @param vaultId - 볼트 ID
   * @returns SyncService 인스턴스 또는 undefined
   */
  getSyncService(vaultId) {
    return this.syncServices.get(vaultId);
  }
  /**
   * 모든 SyncService에 콜백 설정
   *
   * @param callbacks - SyncService 콜백
   */
  setCallbacks(callbacks) {
    for (const syncService of this.syncServices.values()) {
      syncService.setCallbacks(callbacks);
    }
  }
  /**
   * 모든 SyncService 연결 시작 (REQ-010)
   */
  async connectAll() {
    const results = await Promise.allSettled(
      Array.from(this.syncServices.entries()).map(async ([vaultId, service]) => {
        try {
          await service.connect();
        } catch (e) {
          console.error(`[VaultRouter] \uBCFC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328 (${vaultId}):`, e);
        }
      })
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.warn(`[VaultRouter] ${failed.length}/${results.length} \uBCFC\uD2B8 \uC5F0\uACB0 \uC2E4\uD328`);
    }
  }
  /**
   * 모든 SyncService 연결 해제
   */
  disconnectAll() {
    for (const syncService of this.syncServices.values()) {
      syncService.disconnect();
    }
  }
  /**
   * @MX:NOTE: [AUTO] 다중 볼트 통합 상태 집계 (SPEC-PLUGIN-STATUS-001)
   * REQ-STATUS-003: 모든 SyncService 상태를 집계하여 통합 상태 반환
   *
   * 상태 집계 로직:
   * - 모든 볼트가 연결됨 → 'connected'
   * - 일부 볼트만 연결됨 → 'connected' (connected/total 형식으로 표시)
   * - 하나라도 에러 상태 → 'error'
   * - 하나라도 재연결 중 → 'reconnecting'
   * - 하나라도 동기화 중 → 'syncing'
   * - 하나라도 일시정지 → 'paused'
   * - 모두 오프라인 → 'offline'
   *
   * @returns 집계된 동기화 상태
   */
  getAggregateState() {
    const vaultIds = this.getVaultIds();
    const total = vaultIds.length;
    if (total === 0) {
      return { state: "offline", connected: 0, total: 0 };
    }
    let connectedCount = 0;
    const stateCounts = {
      error: 0,
      offline: 0,
      reconnecting: 0,
      syncing: 0,
      paused: 0,
      connected: 0
    };
    for (const vaultId of vaultIds) {
      const syncService = this.syncServices.get(vaultId);
      if (!syncService) continue;
      const state = syncService.state;
      stateCounts[state]++;
      if (state === "connected") {
        connectedCount++;
      }
    }
    let aggregateState = "offline";
    if (stateCounts.error > 0) {
      aggregateState = "error";
    } else if (stateCounts.reconnecting > 0) {
      aggregateState = "reconnecting";
    } else if (stateCounts.syncing > 0) {
      aggregateState = "syncing";
    } else if (stateCounts.paused > 0) {
      aggregateState = "paused";
    } else if (connectedCount > 0) {
      aggregateState = "connected";
    } else {
      aggregateState = "offline";
    }
    return {
      state: aggregateState,
      connected: connectedCount,
      total
    };
  }
  /**
   * REQ-STATUS-002: 모든 SyncService의 상태 변경 리스너 등록
   *
   * @param callback - 상태 변경 콜백
   * @returns 구독 해제 함수
   */
  onStateChange(callback) {
    const unsubscribers = [];
    for (const syncService of this.syncServices.values()) {
      const unsubscribe = syncService.onStateChange(() => {
        callback(this.getAggregateState());
      });
      unsubscribers.push(unsubscribe);
    }
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }
  /**
   * 활성화된 매핑 수 반환
   */
  getActiveMappingCount() {
    return this.mappings.length;
  }
  /**
   * 모든 매핑된 볼트 ID 반환
   */
  getVaultIds() {
    return Array.from(this.syncServices.keys());
  }
  /**
   * REQ-008: 특정 볼트에 속한 파일만 필터링
   *
   * @param vaultId - 볼트 ID
   * @param allFiles - 모든 로컬 파일 목록
   * @returns 해당 볼트에 속한 파일 목록
   */
  collectFilesForVault(vaultId, allFiles) {
    const mapping = this.mappings.find((m) => m.vaultId === vaultId);
    if (!mapping) {
      return [];
    }
    return allFiles.filter((file) => {
      const normalizedPath = this.normalizePath(file.path);
      if (mapping.folder === "") {
        return true;
      }
      return normalizedPath.startsWith(mapping.folder + "/") || normalizedPath === mapping.folder;
    });
  }
  /**
   * REQ-008: 특정 볼트에 대한 재동기화 수행
   *
   * @param vaultId - 볼트 ID
   * @param localFiles - 로컬 파일 목록
   */
  reconcileVault(vaultId, localFiles) {
    const syncService = this.syncServices.get(vaultId);
    if (!syncService) {
      return;
    }
    if (typeof syncService.reconcile === "function") {
      syncService.reconcile(localFiles);
    }
  }
  /**
   * REQ-008: 모든 볼트에 대한 재동기화 병렬 수행
   *
   * @param allFiles - 모든 로컬 파일 목록
   */
  reconcileAll(allFiles) {
    for (const mapping of this.mappings) {
      const vaultFiles = this.collectFilesForVault(mapping.vaultId, allFiles);
      this.reconcileVault(mapping.vaultId, vaultFiles);
    }
  }
};

// ../../node_modules/.pnpm/idb@8.0.3/node_modules/idb/build/index.js
var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
var idbProxyableTypes;
var cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
var transactionDoneMap = /* @__PURE__ */ new WeakMap();
var transformCache = /* @__PURE__ */ new WeakMap();
var reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener("success", success);
      request.removeEventListener("error", error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener("success", success);
    request.addEventListener("error", error);
  });
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
var idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap(this.request);
    };
  }
  return function(...args) {
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
var unwrap = (value) => reverseTransformCache.get(value);
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
  const request = indexedDB.open(name, version);
  const openPromise = wrap(request);
  if (upgrade) {
    request.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener("blocked", (event) => blocked(
      // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
      event.oldVersion,
      event.newVersion,
      event
    ));
  }
  openPromise.then((db) => {
    if (terminated)
      db.addEventListener("close", () => terminated());
    if (blocking) {
      db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {
  });
  return openPromise;
}
var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
var writeMethods = ["put", "add", "delete", "clear"];
var cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    return (await Promise.all([
      target2[targetFuncName](...args),
      isWrite && tx.done
    ]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
var advanceMethodProps = ["continue", "continuePrimaryKey", "advance"];
var methodMap = {};
var advanceResults = /* @__PURE__ */ new WeakMap();
var ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
var cursorIteratorTraps = {
  get(target, prop) {
    if (!advanceMethodProps.includes(prop))
      return target[prop];
    let cachedFunc = methodMap[prop];
    if (!cachedFunc) {
      cachedFunc = methodMap[prop] = function(...args) {
        advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
      };
    }
    return cachedFunc;
  }
};
async function* iterate(...args) {
  let cursor = this;
  if (!(cursor instanceof IDBCursor)) {
    cursor = await cursor.openCursor(...args);
  }
  if (!cursor)
    return;
  cursor = cursor;
  const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
  ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
  reverseTransformCache.set(proxiedCursor, unwrap(cursor));
  while (cursor) {
    yield proxiedCursor;
    cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
    advanceResults.delete(proxiedCursor);
  }
}
function isIteratorProp(target, prop) {
  return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get(target, prop, receiver) {
    if (isIteratorProp(target, prop))
      return iterate;
    return oldTraps.get(target, prop, receiver);
  },
  has(target, prop) {
    return isIteratorProp(target, prop) || oldTraps.has(target, prop);
  }
}));

// src/storage/indexed-db.ts
var DB_NAME = "vsync-storage";
var DB_VERSION = 1;
var STORE_FILE_META = "file-meta";
var STORE_SYNC_QUEUE = "sync-queue";
var STORE_SYNC_STATE = "sync-state";
var INDEX_VAULT_ID = "vaultId";
var INDEX_MTIME = "mtime";
var INDEX_TIMESTAMP = "timestamp";
var TTL_MS = 7 * 24 * 60 * 60 * 1e3;
var IndexedDBStorage = class {
  constructor() {
    this.db = null;
  }
  /**
   * 데이터베이스 열기
   * REQ-IDB-001: 데이터베이스 초기화
   */
  async openDB() {
    if (this.db) {
      return this.db;
    }
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_FILE_META)) {
          const fileMetaStore = db.createObjectStore(STORE_FILE_META);
          fileMetaStore.createIndex(INDEX_VAULT_ID, INDEX_VAULT_ID, { unique: false });
          fileMetaStore.createIndex(INDEX_MTIME, INDEX_MTIME, { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
          const syncQueueStore = db.createObjectStore(STORE_SYNC_QUEUE, {
            keyPath: "id",
            autoIncrement: true
          });
          syncQueueStore.createIndex(INDEX_TIMESTAMP, INDEX_TIMESTAMP, { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SYNC_STATE)) {
          const syncStateStore = db.createObjectStore(STORE_SYNC_STATE);
          syncStateStore.createIndex(INDEX_VAULT_ID, INDEX_VAULT_ID, { unique: false });
        }
      }
    });
    return this.db;
  }
  /**
   * 데이터베이스 닫기
   */
  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  /**
   * 파일 메타데이터 저장
   * REQ-IDB-003: 모든 연산은 비동기
   */
  async setFileMeta(vaultId, path, record) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = `${vaultId}:${path}`;
    await this.db.put(STORE_FILE_META, { ...record, key }, key);
  }
  /**
   * 파일 메타데이터 조회
   */
  async getFileMeta(vaultId, path) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = `${vaultId}:${path}`;
    const result = await this.db.get(STORE_FILE_META, key);
    if (!result) {
      return void 0;
    }
    const { key: _, ...record } = result;
    return record;
  }
  /**
   * 파일 메타데이터 삭제
   */
  async deleteFileMeta(vaultId, path) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = `${vaultId}:${path}`;
    await this.db.delete(STORE_FILE_META, key);
  }
  /**
   * 볼트의 모든 파일 메타데이터 조회
   */
  async getAllFileMetaByVault(vaultId) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const results = await this.db.getAll(STORE_FILE_META);
    const vaultRecords = results.filter((record) => record.key && record.key.startsWith(`${vaultId}:`)).map((record) => {
      const { key: _, ...meta } = record;
      return meta;
    });
    return vaultRecords;
  }
  /**
   * 볼트의 모든 파일 매핑 조회 (path 포함)
   * FileIdTracker에서 사용하기 위한 헬퍼 메서드
   */
  async getAllFileMappingsByVault(vaultId) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const results = await this.db.getAll(STORE_FILE_META);
    const vaultRecords = results.filter((record) => record.key && record.key.startsWith(`${vaultId}:`)).map((record) => {
      const path = record.key.substring(`${vaultId}:`.length);
      return { path, fileId: record.fileId };
    });
    return vaultRecords;
  }
  /**
   * 여러 파일 메타데이터 일괄 저장 (REQ-IDB-015)
   * 트랜잭션으로 원자성 보장
   */
  async batchSetFileMeta(items) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    if (items.length === 0) {
      return;
    }
    const tx = this.db.transaction(STORE_FILE_META, "readwrite");
    const store = tx.objectStore(STORE_FILE_META);
    await Promise.all(
      items.map(({ vaultId, path, record }) => {
        const key = `${vaultId}:${path}`;
        return store.put({ ...record, key }, key);
      })
    );
    await tx.done;
  }
  /**
   * 동기화 큐 아이템 추가
   * 자동 증가 ID 반환
   */
  async addSyncQueueItem(item) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = await this.db.add(STORE_SYNC_QUEUE, {
      ...item,
      timestamp: item.timestamp
    });
    return key;
  }
  /**
   * 동기화 큐 아이템 조회 (TTL 필터링 포함)
   * REQ-IDB-010: 만료 아이템 자동 제거 (7일 TTL)
   */
  async getSyncQueueItems() {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const now = Date.now();
    const allItems = await this.db.getAll(STORE_SYNC_QUEUE);
    const validItems = allItems.filter((item) => now - item.timestamp < TTL_MS);
    if (validItems.length < allItems.length) {
      const tx = this.db.transaction(STORE_SYNC_QUEUE, "readwrite");
      const store = tx.objectStore(STORE_SYNC_QUEUE);
      for (const item of allItems) {
        if (now - item.timestamp >= TTL_MS) {
          await store.delete(item.id);
        }
      }
      await tx.done;
    }
    return validItems.sort((a, b) => a.timestamp - b.timestamp);
  }
  /**
   * 가장 오래된 동기화 큐 아이템 삭제
   */
  async deleteOldestSyncQueueItem() {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const items = await this.db.getAll(STORE_SYNC_QUEUE);
    if (items.length === 0) {
      return;
    }
    const oldest = items.reduce(
      (prev, current) => prev.timestamp < current.timestamp ? prev : current
    );
    if (oldest.id) {
      await this.db.delete(STORE_SYNC_QUEUE, oldest.id);
    }
  }
  /**
   * 동기화 큐 비우기
   */
  async clearSyncQueue() {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    await this.db.clear(STORE_SYNC_QUEUE);
  }
  /**
   * 동기화 큐 아이템 개수 조회
   */
  async countSyncQueueItems() {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    return await this.db.count(STORE_SYNC_QUEUE);
  }
  /**
   * 동기화 큐 아이템 삭제 (ID로)
   */
  async deleteSyncQueueItem(id) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    await this.db.delete(STORE_SYNC_QUEUE, id);
  }
  /**
   * 동기화 상태 저장
   */
  async setSyncState(vaultId, path, record) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = `${vaultId}:${path}`;
    await this.db.put(STORE_SYNC_STATE, { ...record, key }, key);
  }
  /**
   * 동기화 상태 조회
   */
  async getSyncState(vaultId, path) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = `${vaultId}:${path}`;
    const result = await this.db.get(STORE_SYNC_STATE, key);
    if (!result) {
      return void 0;
    }
    const { key: _, ...state } = result;
    return state;
  }
  /**
   * 동기화 상태 삭제
   */
  async deleteSyncState(vaultId, path) {
    if (!this.db) {
      throw new Error("Database not opened. Call openDB() first.");
    }
    const key = `${vaultId}:${path}`;
    await this.db.delete(STORE_SYNC_STATE, key);
  }
};

// src/index.ts
var VSyncPlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.syncService = null;
    // @MX:TODO: T-004: 제거 예정 (VaultRouter로 대체)
    this.vaultRouter = null;
    // T-004: 다중 볼트 라우터
    this.shareService = null;
    this.eventRefs = [];
    this.lastConnectedSettings = { serverUrl: "", vaultId: "", apiKey: "" };
    // 생성-이름변경 경쟁 조건: handleFileCreate의 async read 전에 rename이 발생한 경우
    this.deferredRenames = /* @__PURE__ */ new Map();
    // T-014: SyncResolutionModal 중복 열림 방지
    this.conflictListModalOpen = false;
    // SPEC-PLUGIN-STATUS-001: 지속적 상태 표시줄 아이템 (기존 statusBarItem은 임시 메시지용)
    this.persistentStatusBarItem = null;
    this.stateChangeUnsubscribe = null;
    /**
     * StatusBar 업데이트 (REQ-UI-001, REQ-UI-002)
     */
    this.statusBarItem = null;
  }
  async onload() {
    this.resolutionQueue = new ResolutionQueue();
    await this.loadSettings();
    this.storage = new IndexedDBStorage();
    await this.storage.openDB();
    this.fileIdTracker = new FileIdTracker(this, this.storage);
    const vaultIds = this.settings.vaultMappings?.filter((m) => m.enabled).map((m) => m.vaultId) ?? [];
    if (this.settings.vaultId && !vaultIds.includes(this.settings.vaultId)) {
      vaultIds.push(this.settings.vaultId);
    }
    if (vaultIds.length > 0) {
      await this.fileIdTracker.loadMappingsFromIndexedDB(vaultIds);
    }
    if (this.settings.currentVersion !== this.manifest.version) {
      this.settings.currentVersion = this.manifest.version;
      await this.saveSettings();
    }
    this.shareService = new PluginShareService(
      this.app,
      this.settings,
      (msg) => new import_obsidian6.Notice(msg),
      (path) => this.fileIdTracker?.getFileId(path),
      (file) => this.handleFileModify(file)
    );
    this.app.workspace.onLayoutReady(() => {
      this.initializeSync().catch(
        (e) => console.error("[onload] initializeSync \uC2E4\uD328:", e)
      );
    });
    this.addSettingTab(new VSyncSettingTab(this.app, this));
    this.addCommand({
      id: "view-unresolved-conflicts",
      name: "VSync: \uBBF8\uD574\uACB0 \uCDA9\uB3CC \uBCF4\uAE30",
      callback: () => {
        this.handleViewUnresolvedConflicts();
      }
    });
    this.addCommand({
      id: "share-note",
      name: "\uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (checking) return true;
        if (!this.shareService?.isPublicUrlConfigured()) {
          new import_obsidian6.Notice("\uACF5\uC720 \uB9C1\uD06C URL\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uACF5\uC720 \uB9C1\uD06C URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
          return;
        }
        new ShareModal(this.app, file, this.shareService).open();
      }
    });
    this.addCommand({
      id: "share-update",
      name: "\uACF5\uC720 \uB9CC\uB8CC \uC2DC\uAC04 \uBCC0\uACBD",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (checking) return true;
        if (!this.shareService?.isPublicUrlConfigured()) {
          new import_obsidian6.Notice("\uACF5\uC720 \uB9C1\uD06C URL\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
          return;
        }
        this.shareService.getShareStatus(file).then((status) => {
          if (!status.isShared) {
            new import_obsidian6.Notice("\uACF5\uC720 \uC911\uC778 \uB9C1\uD06C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
            return;
          }
          const exp = ["1h", "1d", "7d", "unlimited"].includes(status.shareExpires) ? status.shareExpires : void 0;
          new ShareModal(this.app, file, this.shareService, exp).open();
        });
      }
    });
    this.addCommand({
      id: "copy-share-link",
      name: "\uACF5\uC720 \uB9C1\uD06C \uBCF5\uC0AC",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (checking) return true;
        this.shareService?.copyShareUrl(file);
      }
    });
    this.addCommand({
      id: "stop-share",
      name: "\uACF5\uC720 \uC911\uB2E8",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (checking) return true;
        this.shareService?.stopShare(file);
      }
    });
    this.registerEvent(this.app.workspace.on("file-menu", this.handleFileMenu.bind(this)));
  }
  onunload() {
    this.cleanup();
  }
  /**
   * Initialize sync service when settings are configured
   * T-004: 다중 볼트 지원 - VaultRouter 사용 또는 레거시 단일 SyncService 사용
   */
  async initializeSync() {
    const hasVaultMappings = this.settings.vaultMappings && this.settings.vaultMappings.length > 0;
    const hasLegacySettings = this.settings.vaultId && this.settings.apiKey;
    if (!hasVaultMappings && !hasLegacySettings) {
      return;
    }
    if (!this.settings.syncEnabled) {
      return;
    }
    if (hasVaultMappings) {
      this.vaultRouter = new VaultRouter(
        this.settings.vaultMappings ?? [],
        this.settings.serverUrl,
        this.storage
        // SPEC-SYNC-006: storage 전달
      );
      await this.ensureMappedFolders(this.settings.vaultMappings ?? []);
      const callbacks = this.createSyncCallbacks();
      this.vaultRouter.setCallbacks(callbacks);
      this.vaultRouter.connectAll().catch(
        (e) => console.error("[initializeSync] connectAll \uC2E4\uD328:", e)
      );
      this.lastConnectedSettings = {
        serverUrl: this.settings.serverUrl,
        vaultId: this.settings.vaultId || "",
        apiKey: this.settings.apiKey || ""
      };
      this.registerEvents();
      this.shareService.syncSharesOnStartup().catch(
        (e) => console.error("[initializeSync] syncSharesOnStartup \uC2E4\uD328:", e)
      );
      this.initializePersistentStatusBar();
      return;
    }
    if (hasLegacySettings) {
      const migratedSettings = migrateToMultiVault(this.settings);
      this.settings.vaultMappings = migratedSettings.vaultMappings;
      this.vaultRouter = new VaultRouter(
        this.settings.vaultMappings ?? [],
        this.settings.serverUrl,
        this.storage
        // SPEC-SYNC-006: storage 전달
      );
      await this.ensureMappedFolders(this.settings.vaultMappings ?? []);
      const callbacks = this.createSyncCallbacks();
      this.vaultRouter.setCallbacks(callbacks);
      this.vaultRouter.connectAll().catch(
        (e) => console.error("[initializeSync] connectAll \uC2E4\uD328 (legacy):", e)
      );
      this.lastConnectedSettings = {
        serverUrl: this.settings.serverUrl,
        vaultId: this.settings.vaultId,
        apiKey: this.settings.apiKey
      };
      this.registerEvents();
      this.shareService.syncSharesOnStartup().catch(
        (e) => console.error("[initializeSync] syncSharesOnStartup \uC2E4\uD328:", e)
      );
      this.initializePersistentStatusBar();
    }
  }
  /**
   * 매핑된 폴더가 없으면 자동 생성
   * 재시작/재연결 시 매핑된 폴더가 없는 경우 대응
   */
  async ensureMappedFolders(mappings) {
    for (const mapping of mappings) {
      if (!mapping.enabled) continue;
      if (!mapping.folder || mapping.folder.trim() === "") continue;
      const normalized = mapping.folder.replace(/^\/+|\/+$/g, "");
      if (!normalized) continue;
      try {
        const folder = this.app.vault.getFolderByPath(normalized);
        if (!folder) {
          await this.app.vault.createFolder(normalized);
          console.log(`[ensureMappedFolders] \uD3F4\uB354 \uC0DD\uC131: ${normalized}`);
        }
      } catch (e) {
        console.error(`[ensureMappedFolders] \uD3F4\uB354 \uC0DD\uC131 \uC2E4\uD328: ${normalized}`, e);
      }
    }
  }
  /**
   * T-004: SyncService 콜백 생성 (VaultRouter의 모든 SyncService에 공유)
   */
  createSyncCallbacks() {
    return {
      onFileIdUpdate: (path, fileId) => {
        this.fileIdTracker.setFileId(path, fileId);
        this.resolutionQueue.remove(path);
        this.fileIdTracker.saveMappings().catch(() => {
        });
      },
      onFileIdRemove: (path) => {
        this.fileIdTracker.removeFileId(path);
        this.fileIdTracker.saveMappings().catch(() => {
        });
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
        if (file instanceof import_obsidian6.TFile) {
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
        if (conflictInfo.type === "reconnect_conflict") {
          new import_obsidian6.Notice(`\uB3D9\uAE30\uD654 \uCDA9\uB3CC: ${conflictInfo.path}`);
        }
      },
      onNotice: (message) => {
        new import_obsidian6.Notice(message);
      },
      hasUnsavedChanges: () => {
        return false;
      },
      readFile: (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian6.TFile) {
          return "";
        }
        return "";
      },
      pathExists: (path) => {
        return this.app.vault.getAbstractFileByPath(path) !== null;
      },
      triggerReconnect: () => {
        this.vaultRouter?.connectAll().catch(
          (e) => console.error("[triggerReconnect] connectAll \uC2E4\uD328:", e)
        );
      },
      onError: (error) => {
        console.error(`[SyncService Error] ${error.category}/${error.code}: ${error.message}`);
        new import_obsidian6.Notice(`\uB3D9\uAE30\uD654 \uC624\uB958 \u2014 ${error.message}`);
      },
      queueResolution: (_fileId, path) => {
        if (path) {
          this.resolutionQueue.add(path);
        }
      },
      collectLocalFiles: async () => {
        return this.collectLocalFiles();
      },
      readFileAsync: async (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian6.TFile) {
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
      // T-013: 일괄 충돌 해결 콜백
      resolveConflicts: async (conflicts) => {
        return new Promise((resolve, reject) => {
          const modal = new SyncResolutionModal(
            this.app,
            conflicts,
            [],
            // 로컬 전용 파일 없음
            // onResolve: 사용자가 [동기화] 버튼 클릭
            (actions) => {
              const resolved = conflicts.map((conflict) => ({
                ...conflict,
                // 사용자가 명시하지 않은 충돌은 안전하게 서버 버전으로 폴백
                selectedVersion: actions.get(conflict.path) === "local" ? "local" : "server"
              }));
              resolve(resolved);
            },
            // onCancel: 사용자가 [취소] 버튼 클릭
            () => {
              reject(new Error("\uC0AC\uC6A9\uC790\uAC00 \uCDA9\uB3CC \uD574\uACB0\uC744 \uCDE8\uC18C\uD568"));
            }
          );
          modal.open();
        });
      },
      // REQ-ATTACH-002, REQ-ATTACH-005: 바이너리 파일 콜백
      readBinaryFileAsync: async (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian6.TFile) {
          return this.app.vault.readBinary(file);
        }
        return new ArrayBuffer(0);
      },
      onBinaryFileCreate: async (path, data) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian6.TFile) {
          await this.app.vault.modifyBinary(file, data);
        } else {
          await this.app.vault.createBinary(path, data);
        }
      },
      onBinaryFileUpdate: async (path, data) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian6.TFile) {
          await this.app.vault.modifyBinary(file, data);
        }
      },
      ensureFolderExists: async (path) => {
        const folderPath = path.replace(/^\/+/, "");
        if (folderPath && !await this.app.vault.adapter.exists(folderPath)) {
          await this.app.vault.adapter.mkdir(folderPath);
        }
      },
      // SPEC-SYNC-003: 로컬 전용 파일 동기화 승인 콜백
      approveLocalUploads: async (files) => {
        return new Promise((resolve) => {
          const modal = new SyncResolutionModal(
            this.app,
            [],
            // 충돌 파일 없음
            files,
            // onResolve: 사용자가 [동기화] 버튼 클릭
            (actions) => {
              const actionMap = /* @__PURE__ */ new Map();
              for (const [path, action] of actions.entries()) {
                if (action === "upload" || action === "skip" || action === "delete") {
                  actionMap.set(path, action);
                }
              }
              resolve(actionMap);
            },
            // onCancel: 사용자가 [취소] 버튼 클릭
            () => {
              resolve(/* @__PURE__ */ new Map());
            }
          );
          modal.open();
        });
      },
      // SPEC-SYNC-003: 파일 삭제 콜백
      trashFile: async (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file) {
          await this.app.vault.trash(file, true);
        }
      },
      // SPEC-SYNC-003: 파일 통계 콜백
      getFileStat: async (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof import_obsidian6.TFile) {
          return {
            size: file.stat.size,
            mtime: file.stat.mtime
          };
        }
        return { size: 0, mtime: Date.now() };
      }
    };
  }
  /**
   * Register Obsidian vault event handlers
   */
  registerEvents() {
    const createRef = this.app.vault.on("create", (file) => {
      if (file instanceof import_obsidian6.TFile && isAllowedExtension(file.path) && !this.isSkipped(file.path)) {
        this.handleFileCreate(file);
      }
    });
    const modifyRef = this.app.vault.on("modify", (file) => {
      if (file instanceof import_obsidian6.TFile && isAllowedExtension(file.path) && !this.isSkipped(file.path)) {
        this.handleFileModify(file);
      }
    });
    const deleteRef = this.app.vault.on("delete", (file) => {
      if (file instanceof import_obsidian6.TFile && isAllowedExtension(file.path) && !this.isSkipped(file.path)) {
        this.handleFileDelete(file);
      }
    });
    const renameRef = this.app.vault.on("rename", (file, oldPath) => {
      if (file instanceof import_obsidian6.TFile && isAllowedExtension(file.path) && !this.isSkipped(file.path)) {
        this.handleFileRename(file, oldPath);
      }
    });
    this.eventRefs = [createRef, modifyRef, deleteRef, renameRef];
    this.eventRefs.forEach((ref) => this.registerEvent(ref));
  }
  /**
   * Handle file create event (REQ-EH-401)
   * REQ-ATTACH-002: Binary file upload support
   * T-006: VaultRouter를 통한 라우팅
   */
  async handleFileCreate(file) {
    if (this.vaultRouter) {
      const pathAtCreate = file.path;
      console.log(`[CREATE] start pathAtCreate=${pathAtCreate} file.path=${file.path}`);
      const vaultId = this.vaultRouter.route(pathAtCreate);
      if (!vaultId) {
        return;
      }
      const syncService = this.vaultRouter.getSyncService(vaultId);
      if (!syncService) return;
      if (syncService.isSyncing) return;
      if (syncService.isSyncCreatedPath(pathAtCreate)) return;
      if (syncService.hasPendingSync(pathAtCreate)) {
        console.log(`[CREATE] skipped - hasPendingSync for ${pathAtCreate}`);
        return;
      }
      try {
        if (isBinaryFile(pathAtCreate)) {
          const data = await this.app.vault.readBinary(file);
          await syncService.uploadBinaryFile(pathAtCreate, data);
        } else {
          const deferredNewPath = this.deferredRenames.get(pathAtCreate);
          const createPath = deferredNewPath || pathAtCreate;
          if (deferredNewPath) {
            this.deferredRenames.delete(pathAtCreate);
          }
          const content = await this.app.vault.read(file);
          console.log(`[CREATE] after read pathAtCreate=${pathAtCreate} file.path=${file.path} createPath=${createPath} deferred=${deferredNewPath}`);
          syncService.sendFileCreate(createPath, content);
        }
      } catch (error) {
        console.error("[handleFileCreate]", {
          handler: "handleFileCreate",
          path: file.path,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }
    if (this.syncService?.isSyncing) return;
    if (this.syncService?.isSyncCreatedPath(file.path)) return;
    try {
      if (isBinaryFile(file.path)) {
        const data = await this.app.vault.readBinary(file);
        await this.syncService?.uploadBinaryFile(file.path, data);
      } else {
        const content = await this.app.vault.read(file);
        this.syncService?.sendFileCreate(file.path, content);
      }
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
   * REQ-ATTACH-002: Binary file upload support
   * T-006: VaultRouter를 통한 라우팅
   */
  async handleFileModify(file) {
    if (this.shareService?.shouldSuppressModify(file.path)) {
      return;
    }
    if (this.vaultRouter) {
      const vaultId = this.vaultRouter.route(file.path);
      if (!vaultId) {
        return;
      }
      const syncService = this.vaultRouter.getSyncService(vaultId);
      if (!syncService) return;
      if (syncService.isSyncing) return;
      if (syncService.isSyncUpdatedPath(file.path)) return;
      try {
        if (isBinaryFile(file.path)) {
          const data = await this.app.vault.readBinary(file);
          await syncService.uploadBinaryFile(file.path, data);
          return;
        }
        const content = await this.app.vault.read(file);
        const fileId = this.fileIdTracker.getFileId(file.path);
        if (!fileId) {
          if (syncService.hasPendingSync(file.path)) {
            console.log(`[MODIFY] skipped - hasPendingSync for ${file.path}`);
            return;
          }
          syncService.sendFileCreate(file.path, content);
          return;
        }
        await syncService.sendFileUpdate(fileId, file.path, content);
      } catch (error) {
        console.error("[handleFileModify]", {
          handler: "handleFileModify",
          path: file.path,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }
    if (this.syncService?.isSyncing) return;
    if (this.syncService?.isSyncUpdatedPath(file.path)) return;
    try {
      if (isBinaryFile(file.path)) {
        const data = await this.app.vault.readBinary(file);
        await this.syncService?.uploadBinaryFile(file.path, data);
        return;
      }
      const content = await this.app.vault.read(file);
      const fileId = this.fileIdTracker.getFileId(file.path);
      if (!fileId) {
        if (this.syncService?.hasPendingSync(file.path)) {
          console.log(`[MODIFY-LEGACY] skipped - hasPendingSync for ${file.path}`);
          return;
        }
        console.log(`[MODIFY-LEGACY] sending file:create for ${file.path}`);
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
   * T-006: VaultRouter를 통한 라우팅
   */
  async handleFileDelete(file) {
    if (this.vaultRouter) {
      const vaultId = this.vaultRouter.route(file.path);
      if (!vaultId) {
        return;
      }
      const syncService = this.vaultRouter.getSyncService(vaultId);
      if (!syncService) return;
      if (syncService.isSyncing) return;
      try {
        const fileId = this.fileIdTracker.getFileId(file.path);
        if (!fileId) {
          console.warn(`[FileIdTracker] fileId not found for path: ${file.path}`);
          return;
        }
        syncService.sendFileDelete(fileId);
        this.fileIdTracker.removeFileId(file.path);
      } catch (error) {
        console.error("[handleFileDelete]", {
          handler: "handleFileDelete",
          path: file.path,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }
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
   * T-006: VaultRouter를 통한 크로스-볼트 이름 변경 처리
   */
  async handleFileRename(file, oldPath) {
    if (this.vaultRouter) {
      const oldVaultId = this.vaultRouter.route(oldPath);
      const newVaultId = this.vaultRouter.route(file.path);
      if (oldVaultId && newVaultId && oldVaultId === newVaultId) {
        const syncService = this.vaultRouter.getSyncService(oldVaultId);
        if (!syncService || syncService.isSyncing) return;
        try {
          const fileId = this.fileIdTracker.getFileId(oldPath);
          console.log(`[RENAME] oldPath=${oldPath} newPath=${file.path} fileId=${fileId ?? "null"}`);
          if (!fileId) {
            if (!syncService.queuePendingRename(oldPath, file.path)) {
              this.deferredRenames.set(oldPath, file.path);
            }
            return;
          }
          syncService.sendFileRename(fileId, oldPath, file.path);
          this.fileIdTracker.removeFileId(oldPath);
          this.fileIdTracker.setFileId(file.path, fileId);
        } catch (error) {
          console.error("[handleFileRename]", {
            handler: "handleFileRename",
            path: file.path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }
      if (oldVaultId && !newVaultId) {
        const syncService = this.vaultRouter.getSyncService(oldVaultId);
        if (!syncService || syncService.isSyncing) return;
        try {
          const fileId = this.fileIdTracker.getFileId(oldPath);
          if (!fileId) {
            console.warn(`[FileIdTracker] fileId not found for path: ${oldPath}`);
            return;
          }
          syncService.sendFileDelete(fileId);
          this.fileIdTracker.removeFileId(oldPath);
        } catch (error) {
          console.error("[handleFileRename]", {
            handler: "handleFileRename",
            path: file.path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }
      if (!oldVaultId && newVaultId) {
        const syncService = this.vaultRouter.getSyncService(newVaultId);
        if (!syncService || syncService.isSyncing) return;
        try {
          const content = await this.app.vault.read(file);
          syncService.sendFileCreate(file.path, content);
        } catch (error) {
          console.error("[handleFileRename]", {
            handler: "handleFileRename",
            path: file.path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }
      if (oldVaultId && newVaultId && oldVaultId !== newVaultId) {
        const oldSyncService = this.vaultRouter.getSyncService(oldVaultId);
        const newSyncService = this.vaultRouter.getSyncService(newVaultId);
        if (!oldSyncService || !newSyncService) return;
        if (oldSyncService.isSyncing || newSyncService.isSyncing) return;
        try {
          const fileId = this.fileIdTracker.getFileId(oldPath);
          if (!fileId) {
            console.warn(`[FileIdTracker] fileId not found for path: ${oldPath}`);
            return;
          }
          oldSyncService.sendFileDelete(fileId);
          this.fileIdTracker.removeFileId(oldPath);
          const content = await this.app.vault.read(file);
          newSyncService.sendFileCreate(file.path, content);
        } catch (error) {
          console.error("[handleFileRename]", {
            handler: "handleFileRename",
            path: file.path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }
      return;
    }
    if (this.syncService?.isSyncing) return;
    try {
      const fileId = this.fileIdTracker.getFileId(oldPath);
      if (!fileId) {
        if (this.syncService && !this.syncService.queuePendingRename(oldPath, file.path)) {
          this.deferredRenames.set(oldPath, file.path);
        }
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
   * REQ-ATTACH-001: 바이너리 파일 포함, 화이트리스트 기반 필터링
   * 해시 계산 및 skippedPaths 필터링 포함
   */
  async collectLocalFiles() {
    const allFiles = this.app.vault.getFiles();
    const eligible = allFiles.filter(
      (f) => isAllowedExtension(f.path) && !this.isSkipped(f.path)
    );
    const settled = await Promise.allSettled(
      eligible.map(async (file) => {
        const currentMtime = file.stat.mtime;
        const cached = await this.storage.getFileMeta(this.settings.vaultId, file.path);
        if (cached && cached.mtime === currentMtime) {
          return { path: file.path, hash: cached.hash };
        }
        let hash;
        if (isBinaryFile(file.path)) {
          const data = await this.app.vault.readBinary(file);
          hash = await hashBinaryContent(data);
        } else {
          const content = await this.app.vault.read(file);
          hash = await hashContent(content);
        }
        await this.storage.setFileMeta(this.settings.vaultId, file.path, {
          fileId: "",
          // collectLocalFiles에서는 fileId를 모름
          hash,
          mtime: currentMtime,
          lastSyncTime: 0
        });
        return { path: file.path, hash };
      })
    );
    return settled.filter((r) => r.status === "fulfilled").map((r) => r.value);
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
   * SPEC-PLUGIN-STATUS-001: 지속적 상태 표시줄 초기화 (REQ-STATUS-001)
   */
  initializePersistentStatusBar() {
    if (!this.vaultRouter) {
      return;
    }
    try {
      this.persistentStatusBarItem = this.addStatusBarItem();
      this.persistentStatusBarItem.setText("vSync: \uC624\uD504\uB77C\uC778");
      const unsubscribe = this.vaultRouter.onStateChange((state) => {
        this.updatePersistentStatusBar(state);
      });
      this.stateChangeUnsubscribe = unsubscribe;
      this.persistentStatusBarItem.onClickEvent(() => {
        this.openVSyncSettings();
      });
      const initialState = this.vaultRouter.getAggregateState();
      this.updatePersistentStatusBar(initialState);
    } catch (error) {
      console.debug("[VSync] \uC9C0\uC18D\uC801 \uC0C1\uD0DC \uD45C\uC2DC\uC904 \uCD08\uAE30\uD654 \uC2E4\uD328 (\uD14C\uC2A4\uD2B8 \uD658\uACBD\uC77C \uC218 \uC788\uC74C):", error);
    }
  }
  /**
   * SPEC-PLUGIN-STATUS-001: 지속적 상태 표시줄 업데이트 (REQ-STATUS-002, REQ-STATUS-003, REQ-STATUS-004)
   */
  updatePersistentStatusBar(state) {
    if (!this.persistentStatusBarItem) {
      return;
    }
    let statusText = "";
    switch (state.state) {
      case "connected":
        if (state.connected === state.total) {
          statusText = "vSync: \uC5F0\uACB0\uB428";
        } else {
          statusText = `vSync: \uC5F0\uACB0\uB428 (${state.connected}/${state.total})`;
        }
        break;
      case "syncing":
        statusText = "vSync: \uB3D9\uAE30\uD654 \uC911...";
        break;
      case "offline":
        statusText = "vSync: \uC624\uD504\uB77C\uC778";
        break;
      case "error":
        statusText = "vSync: \uC624\uB958";
        break;
      case "paused":
        statusText = "vSync: \uC77C\uC2DC\uC911\uC9C0";
        break;
      case "reconnecting":
        statusText = "vSync: \uC7AC\uC5F0\uACB0 \uC911...";
        break;
      default:
        statusText = "vSync: \uC54C \uC218 \uC5C6\uC74C";
    }
    this.persistentStatusBarItem.setText(statusText);
  }
  /**
   * SPEC-PLUGIN-STATUS-001 REQ-STATUS-005: VSync 설정 탭 열기
   */
  openVSyncSettings() {
    try {
      this.app.setting.open();
      this.app.setting?.openTabById("vsync-settings");
    } catch (error) {
      console.error("[VSync] \uC124\uC815 \uD0ED \uC5F4\uAE30 \uC2E4\uD328:", error);
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
   * T-004: VaultRouter 지원
   */
  cleanup() {
    this.fileIdTracker.saveMappings().catch(
      (e) => console.error("[cleanup] saveMappings \uC2E4\uD328:", e)
    );
    try {
      if (this.stateChangeUnsubscribe) {
        this.stateChangeUnsubscribe();
        this.stateChangeUnsubscribe = null;
      }
    } catch (e) {
      console.error("[cleanup] \uC0C1\uD0DC \uBCC0\uACBD \uAD6C\uB3C5 \uD574\uC81C \uC2E4\uD328:", e);
    }
    try {
      if (this.persistentStatusBarItem) {
        this.persistentStatusBarItem.remove();
        this.persistentStatusBarItem = null;
      }
    } catch (e) {
      console.error("[cleanup] \uC0C1\uD0DC \uD45C\uC2DC\uC904 \uC81C\uAC70 \uC2E4\uD328:", e);
    }
    if (this.vaultRouter) {
      this.vaultRouter.disconnectAll();
      this.vaultRouter = null;
    }
    if (this.syncService) {
      this.syncService.flushAndDisconnect(2e3).catch(
        (e) => console.error("[cleanup] flushAndDisconnect \uC2E4\uD328:", e)
      );
      this.syncService.cleanupTimers();
      this.syncService = null;
    }
    this.eventRefs.forEach((ref) => this.app.vault.offref(ref));
    this.eventRefs = [];
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
   * T-004: vaultMappings 변경 감지
   */
  async saveSettings(options) {
    const { settings: _, ...clean } = this.settings;
    await this.saveData({ settings: clean });
    if (options?.skipReconnect) return;
    const currentMappingsJson = JSON.stringify(this.settings.vaultMappings);
    const lastMappingsJson = JSON.stringify(
      this.lastConnectedSettings.vaultId ? [{ folder: "", vaultId: this.lastConnectedSettings.vaultId, apiKey: this.lastConnectedSettings.apiKey, enabled: true }] : []
    );
    const connectionChanged = this.settings.serverUrl !== this.lastConnectedSettings.serverUrl || currentMappingsJson !== lastMappingsJson;
    if (connectionChanged) {
      this.cleanup();
      this.initializeSync().catch(
        (e) => console.error("[saveSettings] initializeSync \uC2E4\uD328:", e)
      );
    }
  }
  /**
   * T-016: 미해결 충돌 보기 명령 핸들러
   * REST API를 통해 미해결 충돌 목록을 가져와서 SyncResolutionModal 표시
   */
  async handleViewUnresolvedConflicts() {
    if (this.conflictListModalOpen) {
      new import_obsidian6.Notice("\uC774\uBBF8 \uCDA9\uB3CC \uD574\uACB0 \uCC3D\uC774 \uC5F4\uB824 \uC788\uC2B5\uB2C8\uB2E4.");
      return;
    }
    try {
      const baseUrl = this.settings.serverUrl.replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/v1/${this.settings.vaultId}/conflicts`,
        {
          headers: { "Authorization": `Bearer ${this.settings.apiKey}` }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.conflicts.length === 0) {
        new import_obsidian6.Notice("\uBBF8\uD574\uACB0 \uCDA9\uB3CC\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      const conflictsWithContent = await Promise.all(
        data.conflicts.map(async (conflict) => {
          try {
            const detailResponse = await fetch(
              `${baseUrl}/v1/${this.settings.vaultId}/conflicts/${conflict.conflictId}`,
              {
                headers: { "Authorization": `Bearer ${this.settings.apiKey}` }
              }
            );
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              return {
                conflictId: conflict.conflictId,
                path: conflict.path,
                localSize: detail.clientContent.length,
                serverSize: detail.serverContent.length,
                serverContent: detail.serverContent,
                localContent: detail.clientContent,
                selectedVersion: "server"
              };
            }
          } catch (error) {
            console.error(`[handleViewUnresolvedConflicts] \uCDA9\uB3CC \uC0C1\uC138 \uAC00\uC838\uC624\uAE30 \uC2E4\uD328: ${conflict.conflictId}`, error);
          }
          return {
            conflictId: conflict.conflictId,
            path: conflict.path,
            localSize: 0,
            serverSize: 0,
            serverContent: "",
            localContent: "",
            selectedVersion: "server"
          };
        })
      );
      this.openConflictListModal(conflictsWithContent);
    } catch (error) {
      console.error("[handleViewUnresolvedConflicts] \uCDA9\uB3CC \uBAA9\uB85D \uAC00\uC838\uC624\uAE30 \uC2E4\uD328:", error);
      new import_obsidian6.Notice("\uCDA9\uB3CC \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328");
    }
  }
  /**
   * T-017: ConflictResolutionModal 열기 및 라이브 싱크 재개
   */
  openConflictListModal(conflicts) {
    this.conflictListModalOpen = true;
    const modal = new SyncResolutionModal(
      this.app,
      conflicts,
      [],
      // 로컬 전용 파일 없음
      // onResolve: 일괄 해결 수행
      async (actions) => {
        try {
          const resolved = conflicts.map((conflict) => ({
            // 사용자가 명시하지 않은 충돌은 안전하게 서버 버전으로 폴백
            ...conflict,
            selectedVersion: actions.get(conflict.path) === "local" ? "local" : "server"
          }));
          for (const conflict of resolved) {
            if (conflict.selectedVersion === "local") {
              const fileId = this.fileIdTracker.getFileId(conflict.path);
              if (fileId) {
                this.syncService?.sendOrQueue("file:update", {
                  fileId,
                  path: conflict.path,
                  content: conflict.localContent,
                  hash: "",
                  resolveConflict: true
                });
              }
            } else {
              const file = this.app.vault.getAbstractFileByPath(conflict.path);
              if (file instanceof import_obsidian6.TFile) {
                await this.app.vault.modify(file, conflict.serverContent);
              }
              const fileId = this.fileIdTracker.getFileId(conflict.path);
              if (fileId) {
                this.syncService?.sendOrQueue("file:update", {
                  fileId,
                  resolveConflict: true,
                  resolveStrategy: "keep_server"
                });
              }
            }
          }
          new import_obsidian6.Notice(`\uCDA9\uB3CC \uD574\uACB0 \uC644\uB8CC: ${resolved.length}\uAC74`);
        } catch (error) {
          console.error("[openConflictResolutionModal] \uCDA9\uB3CC \uD574\uACB0 \uC2E4\uD328:", error);
          new import_obsidian6.Notice("\uCDA9\uB3CC \uD574\uACB0 \uC624\uB958");
        } finally {
          this.conflictListModalOpen = false;
        }
      },
      // onCancel: 취소 처리
      () => {
        this.conflictListModalOpen = false;
        new import_obsidian6.Notice("\uCDA9\uB3CC \uD574\uACB0 \uAC74\uB108\uB700");
      }
    );
    modal.open();
  }
  /**
   * SPEC-SHARE-001: 파일 메뉴에 공유 링크 컨텍스트 메뉴 추가
   * @MX:ANCHOR: [AUTO] 파일 우클릭 메뉴에 공유 기능 통합
   * @MX:REASON: SPEC-SHARE-001 REQ-SHARE-101 to REQ-SHARE-104
   */
  handleFileMenu(menu, file) {
    if (!(file instanceof import_obsidian6.TFile)) return;
    const shareService = this.shareService;
    if (!shareService) return;
    const urlConfigured = shareService.isPublicUrlConfigured();
    const noUrlNotice = () => new import_obsidian6.Notice("\uACF5\uC720 \uB9C1\uD06C URL\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uACF5\uC720 \uB9C1\uD06C URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    const shareUrl = fm?.share_url;
    const shareExpires = fm?.share_expires;
    const isShared = !!shareUrl && shareExpires !== "expired";
    if (!isShared) {
      menu.addItem((item) => {
        item.setTitle("\uACF5\uC720 \uB9C1\uD06C \uC0DD\uC131").onClick(() => urlConfigured ? new ShareModal(this.app, file, shareService).open() : noUrlNotice());
      });
    } else {
      const expiresLabel = shareExpires === "unlimited" ? "\uBB34\uC81C\uD55C" : shareExpires ? new Date(shareExpires).toLocaleDateString("ko-KR") : "\uBB34\uC81C\uD55C";
      menu.addItem((item) => {
        item.setTitle(`\uACF5\uC720 \uC911 (\uB9CC\uB8CC: ${expiresLabel})`).onClick(() => {
          const exp = ["1h", "1d", "7d", "unlimited"].includes(shareExpires) ? shareExpires : void 0;
          new ShareModal(this.app, file, shareService, exp).open();
        });
      });
      menu.addItem((item) => {
        item.setTitle("\uACF5\uC720 \uC911\uC9C0").onClick(() => shareService.stopShare(file));
      });
    }
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvc2V0dGluZ3MtdGFiLnRzIiwgInNyYy9jb25uZWN0aW9uLW1vZGFsLnRzIiwgInNyYy9zeW5jLXJlc29sdXRpb24tbW9kYWwudHMiLCAic3JjL2ZpbGUtdHJlZS50cyIsICJzcmMvY29uZmxpY3QtbW9kYWwudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RpZmZAOS4wLjAvbm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZGlmZkA5LjAuMC9ub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIiwgInNyYy91dGlscy50cyIsICJzcmMvaGFzaC11dGlscy50cyIsICJzcmMvZmlsZS10eXBlcy50cyIsICJzcmMvc2hhcmUtc2VydmljZS50cyIsICJzcmMvc2hhcmUtbW9kYWwudHMiLCAic3JjL2ZpbGUtaWQtdHJhY2tlci50cyIsICJzcmMvcmVzb2x1dGlvbi1xdWV1ZS50cyIsICJzcmMvb2ZmbGluZS1xdWV1ZS50cyIsICJzcmMvcmVzdC1jbGllbnQudHMiLCAic3JjL3N5bmMtc2VydmljZS50cyIsICJzcmMvdmF1bHQtcm91dGVyLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9pZGJAOC4wLjMvbm9kZV9tb2R1bGVzL2lkYi9idWlsZC9pbmRleC5qcyIsICJzcmMvc3RvcmFnZS9pbmRleGVkLWRiLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIFZlY3RvciBPYnNpZGlhbiBQbHVnaW4gLSBNYWluIHBsdWdpbiBjbGFzc1xuICogQE1YOkFOQ0hPUjogW0FVVE9dIFBsdWdpbiBsaWZlY3ljbGUgYW5kIE9ic2lkaWFuIGV2ZW50IGludGVncmF0aW9uXG4gKiBATVg6UkVBU09OOiBSRVEtUEwtMTAxIHRvIFJFUS1QTC0xMDYgLSBQbHVnaW4gbG9hZCwgZXZlbnQgaGFuZGxlcnMsIHN5bmMgb3JjaGVzdHJhdGlvblxuICovXG5cbmltcG9ydCB7IFBsdWdpbiwgVEZpbGUsIEV2ZW50UmVmLCBOb3RpY2UsIE1lbnUsIFRBYnN0cmFjdEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBWU3luY1NldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzLXRhYic7XG5pbXBvcnQgdHlwZSB7IFZTeW5jU2V0dGluZ3MsIENvbmZsaWN0SW5mbywgU2hhcmVFeHBpcmF0aW9uLCBTeW5jQWN0aW9uIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBMb2NhbEZpbGVBY3Rpb24sIHR5cGUgTG9jYWxGaWxlQXBwcm92YWwgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFN5bmNSZXNvbHV0aW9uTW9kYWwgfSBmcm9tICcuL3N5bmMtcmVzb2x1dGlvbi1tb2RhbCc7XG5pbXBvcnQgeyBTeW5jU2VydmljZSwgdHlwZSBTeW5jQ2FsbGJhY2tzIH0gZnJvbSAnLi9zeW5jLXNlcnZpY2UnO1xuaW1wb3J0IHsgaGFzaENvbnRlbnQsIGhhc2hCaW5hcnlDb250ZW50IH0gZnJvbSAnLi9oYXNoLXV0aWxzJztcbmltcG9ydCB7IGlzQWxsb3dlZEV4dGVuc2lvbiwgaXNCaW5hcnlGaWxlIH0gZnJvbSAnLi9maWxlLXR5cGVzJztcbmltcG9ydCB7IFBsdWdpblNoYXJlU2VydmljZSB9IGZyb20gJy4vc2hhcmUtc2VydmljZSc7XG5pbXBvcnQgeyBTaGFyZU1vZGFsIH0gZnJvbSAnLi9zaGFyZS1tb2RhbCc7XG5pbXBvcnQgeyBGaWxlSWRUcmFja2VyIH0gZnJvbSAnLi9maWxlLWlkLXRyYWNrZXInO1xuaW1wb3J0IHsgUmVzb2x1dGlvblF1ZXVlIH0gZnJvbSAnLi9yZXNvbHV0aW9uLXF1ZXVlJztcbmltcG9ydCB7IFZhdWx0Um91dGVyIH0gZnJvbSAnLi92YXVsdC1yb3V0ZXInO1xuaW1wb3J0IHsgbWlncmF0ZVRvTXVsdGlWYXVsdCB9IGZyb20gJy4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgSW5kZXhlZERCU3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZS9pbmRleGVkLWRiJztcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZTeW5jUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IFZTeW5jU2V0dGluZ3MgPSBERUZBVUxUX1NFVFRJTkdTO1xuICBzeW5jU2VydmljZTogU3luY1NlcnZpY2UgfCBudWxsID0gbnVsbDsgLy8gQE1YOlRPRE86IFQtMDA0OiBcdUM4MUNcdUFDNzAgXHVDNjA4XHVDODE1IChWYXVsdFJvdXRlclx1Qjg1QyBcdUIzMDBcdUNDQjQpXG4gIHZhdWx0Um91dGVyOiBWYXVsdFJvdXRlciB8IG51bGwgPSBudWxsOyAvLyBULTAwNDogXHVCMkU0XHVDOTExIFx1QkNGQ1x1RDJCOCBcdUI3N0NcdUM2QjBcdUQxMzBcbiAgc2hhcmVTZXJ2aWNlOiBQbHVnaW5TaGFyZVNlcnZpY2UgfCBudWxsID0gbnVsbDtcbiAgZmlsZUlkVHJhY2tlciE6IEZpbGVJZFRyYWNrZXI7XG4gIHJlc29sdXRpb25RdWV1ZSE6IFJlc29sdXRpb25RdWV1ZTtcbiAgcHJpdmF0ZSBldmVudFJlZnM6IEV2ZW50UmVmW10gPSBbXTtcbiAgcHJpdmF0ZSBsYXN0Q29ubmVjdGVkU2V0dGluZ3MgPSB7IHNlcnZlclVybDogJycsIHZhdWx0SWQ6ICcnLCBhcGlLZXk6ICcnIH07XG4gIC8vIFx1QzBERFx1QzEzMS1cdUM3NzRcdUI5ODRcdUJDQzBcdUFDQkQgXHVBQ0JEXHVDN0MxIFx1Qzg3MFx1QUM3NDogaGFuZGxlRmlsZUNyZWF0ZVx1Qzc1OCBhc3luYyByZWFkIFx1QzgwNFx1QzVEMCByZW5hbWVcdUM3NzQgXHVCQzFDXHVDMEREXHVENTVDIFx1QUNCRFx1QzZCMFxuICBwcml2YXRlIGRlZmVycmVkUmVuYW1lczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcbiAgLy8gVC0wMTQ6IFN5bmNSZXNvbHV0aW9uTW9kYWwgXHVDOTExXHVCQ0Y1IFx1QzVGNFx1QjlCQyBcdUJDMjlcdUM5QzBcbiAgcHJpdmF0ZSBjb25mbGljdExpc3RNb2RhbE9wZW4gPSBmYWxzZTtcbiAgLy8gU1BFQy1QTFVHSU4tU1RBVFVTLTAwMTogXHVDOUMwXHVDMThEXHVDODAxIFx1QzBDMVx1RDBEQyBcdUQ0NUNcdUMyRENcdUM5MDQgXHVDNTQ0XHVDNzc0XHVEMTVDIChcdUFFMzBcdUM4NzQgc3RhdHVzQmFySXRlbVx1Qzc0MCBcdUM3ODRcdUMyREMgXHVCQTU0XHVDMkRDXHVDOUMwXHVDNkE5KVxuICBwcml2YXRlIHBlcnNpc3RlbnRTdGF0dXNCYXJJdGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHN0YXRlQ2hhbmdlVW5zdWJzY3JpYmU6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAvLyBTUEVDLVNZTkMtMDA2OiBJbmRleGVkREIgU3RvcmFnZSBMYXllclxuICBwcml2YXRlIHN0b3JhZ2UhOiBJbmRleGVkREJTdG9yYWdlO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICAvLyBJbml0aWFsaXplIHRyYWNrZXJzIGFmdGVyIHBsdWdpbiBpcyBsb2FkZWQgKGhhcyBhcHAgY29udGV4dClcbiAgICB0aGlzLnJlc29sdXRpb25RdWV1ZSA9IG5ldyBSZXNvbHV0aW9uUXVldWUoKTtcblxuICAgIC8vIFJFUS1QTC0xMDE6IFBsdWdpbiBsb2FkIFx1MjE5MiBzZXR0aW5ncyBpbml0XG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIC8vIFNQRUMtU1lOQy0wMDY6IEluZGV4ZWREQiBcdUNEMDhcdUFFMzBcdUQ2NTRcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgSW5kZXhlZERCU3RvcmFnZSgpO1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5vcGVuREIoKTtcbiAgICB0aGlzLmZpbGVJZFRyYWNrZXIgPSBuZXcgRmlsZUlkVHJhY2tlcih0aGlzLCB0aGlzLnN0b3JhZ2UpO1xuXG4gICAgLy8gXHVBRTMwXHVDODc0IFx1QjlFNFx1RDU1MVx1Qzc0NCBJbmRleGVkREJcdUM1RDBcdUMxMUMgXHVCODVDXHVCNERDXG4gICAgY29uc3QgdmF1bHRJZHMgPSB0aGlzLnNldHRpbmdzLnZhdWx0TWFwcGluZ3NcbiAgICAgID8uZmlsdGVyKChtOiBhbnkpID0+IG0uZW5hYmxlZClcbiAgICAgIC5tYXAoKG06IGFueSkgPT4gbS52YXVsdElkKSA/PyBbXTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy52YXVsdElkICYmICF2YXVsdElkcy5pbmNsdWRlcyh0aGlzLnNldHRpbmdzLnZhdWx0SWQpKSB7XG4gICAgICB2YXVsdElkcy5wdXNoKHRoaXMuc2V0dGluZ3MudmF1bHRJZCk7XG4gICAgfVxuICAgIGlmICh2YXVsdElkcy5sZW5ndGggPiAwKSB7XG4gICAgICBhd2FpdCB0aGlzLmZpbGVJZFRyYWNrZXIubG9hZE1hcHBpbmdzRnJvbUluZGV4ZWREQih2YXVsdElkcyk7XG4gICAgfVxuXG4gICAgLy8gU3luYyBjdXJyZW50VmVyc2lvbiBmcm9tIG1hbmlmZXN0IGFuZCBwZXJzaXN0XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuY3VycmVudFZlcnNpb24gIT09IHRoaXMubWFuaWZlc3QudmVyc2lvbikge1xuICAgICAgdGhpcy5zZXR0aW5ncy5jdXJyZW50VmVyc2lvbiA9IHRoaXMubWFuaWZlc3QudmVyc2lvbjtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgLy8gU1BFQy1TSEFSRS0wMDE6IFx1QUNGNVx1QzcyMCBcdUMxMUNcdUJFNDRcdUMyQTRcdUIyOTQgXHVENTZEXHVDMEMxIFx1Q0QwOFx1QUUzMFx1RDY1NCAoXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzVGMFx1QUNCMCBcdUM1RUNcdUJEODBcdUM2NDAgXHVCQjM0XHVBRDAwKVxuICAgIHRoaXMuc2hhcmVTZXJ2aWNlID0gbmV3IFBsdWdpblNoYXJlU2VydmljZShcbiAgICAgIHRoaXMuYXBwLFxuICAgICAgdGhpcy5zZXR0aW5ncyxcbiAgICAgIChtc2cpID0+IG5ldyBOb3RpY2UobXNnKSxcbiAgICAgIChwYXRoOiBzdHJpbmcpID0+IHRoaXMuZmlsZUlkVHJhY2tlcj8uZ2V0RmlsZUlkKHBhdGgpLFxuICAgICAgKGZpbGU6IFRGaWxlKSA9PiB0aGlzLmhhbmRsZUZpbGVNb2RpZnkoZmlsZSksXG4gICAgKTtcblxuICAgIC8vIFJFUS1QTC0xMDI6IEluaXRpYWxpemUgXHUyMTkyIHdvcmtzcGFjZS5vbkxheW91dFJlYWR5XG4gICAgdGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4ge1xuICAgICAgdGhpcy5pbml0aWFsaXplU3luYygpLmNhdGNoKGUgPT5cbiAgICAgICAgY29uc29sZS5lcnJvcignW29ubG9hZF0gaW5pdGlhbGl6ZVN5bmMgXHVDMkU0XHVEMzI4OicsIGUpLFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIFJlZ2lzdGVyIHNldHRpbmdzIHRhYlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgVlN5bmNTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICAvLyBULTAxNjogXCJWU3luYzogXHVCQkY4XHVENTc0XHVBQ0IwIFx1Q0RBOVx1QjNDQyBcdUJDRjRcdUFFMzBcIiBcdUJBODVcdUI4MzkgXHVCNEYxXHVCODVEXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndmlldy11bnJlc29sdmVkLWNvbmZsaWN0cycsXG4gICAgICBuYW1lOiAnVlN5bmM6IFx1QkJGOFx1RDU3NFx1QUNCMCBcdUNEQTlcdUIzQ0MgXHVCQ0Y0XHVBRTMwJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZGxlVmlld1VucmVzb2x2ZWRDb25mbGljdHMoKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBTUEVDLVNIQVJFLTAwMTogXHVCQTg1XHVCODM5IFx1RDMxNFx1QjgwOFx1RDJCOCBcdUFDRjVcdUM3MjAgXHVCQTg1XHVCODM5XG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2hhcmUtbm90ZScsXG4gICAgICBuYW1lOiAnXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBcdUMwRERcdUMxMzEnLFxuICAgICAgY2hlY2tDYWxsYmFjazogKGNoZWNraW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgICBpZiAoIWZpbGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGNoZWNraW5nKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLnNoYXJlU2VydmljZT8uaXNQdWJsaWNVcmxDb25maWd1cmVkKCkpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKCdcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFVSTFx1Qzc3NCBcdUMxMjRcdUM4MTVcdUI0MThcdUM5QzAgXHVDNTRBXHVDNTU4XHVDMkI1XHVCMkM4XHVCMkU0LiBcdUMxMjRcdUM4MTVcdUM1RDBcdUMxMUMgXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBVUkxcdUM3NDQgXHVDNzg1XHVCODI1XHVENTc0XHVDOEZDXHVDMTM4XHVDNjk0LicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBuZXcgU2hhcmVNb2RhbCh0aGlzLmFwcCwgZmlsZSwgdGhpcy5zaGFyZVNlcnZpY2UhKS5vcGVuKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2hhcmUtdXBkYXRlJyxcbiAgICAgIG5hbWU6ICdcdUFDRjVcdUM3MjAgXHVCOUNDXHVCOENDIFx1QzJEQ1x1QUMwNCBcdUJDQzBcdUFDQkQnLFxuICAgICAgY2hlY2tDYWxsYmFjazogKGNoZWNraW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgICBpZiAoIWZpbGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGNoZWNraW5nKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLnNoYXJlU2VydmljZT8uaXNQdWJsaWNVcmxDb25maWd1cmVkKCkpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKCdcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFVSTFx1Qzc3NCBcdUMxMjRcdUM4MTVcdUI0MThcdUM5QzAgXHVDNTRBXHVDNTU4XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNoYXJlU2VydmljZSEuZ2V0U2hhcmVTdGF0dXMoZmlsZSkudGhlbigoc3RhdHVzKSA9PiB7XG4gICAgICAgICAgaWYgKCFzdGF0dXMuaXNTaGFyZWQpIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1QUNGNVx1QzcyMCBcdUM5MTFcdUM3NzggXHVCOUMxXHVEMDZDXHVBQzAwIFx1QzVDNlx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXhwID0gWycxaCcsICcxZCcsICc3ZCcsICd1bmxpbWl0ZWQnXS5pbmNsdWRlcyhzdGF0dXMuc2hhcmVFeHBpcmVzIGFzIHN0cmluZylcbiAgICAgICAgICAgID8gc3RhdHVzLnNoYXJlRXhwaXJlcyBhcyBTaGFyZUV4cGlyYXRpb25cbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgIG5ldyBTaGFyZU1vZGFsKHRoaXMuYXBwLCBmaWxlLCB0aGlzLnNoYXJlU2VydmljZSEsIGV4cCkub3BlbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdjb3B5LXNoYXJlLWxpbmsnLFxuICAgICAgbmFtZTogJ1x1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkMgXHVCQ0Y1XHVDMEFDJyxcbiAgICAgIGNoZWNrQ2FsbGJhY2s6IChjaGVja2luZykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICAgICAgaWYgKCFmaWxlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChjaGVja2luZykgcmV0dXJuIHRydWU7XG4gICAgICAgIHRoaXMuc2hhcmVTZXJ2aWNlPy5jb3B5U2hhcmVVcmwoZmlsZSk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc3RvcC1zaGFyZScsXG4gICAgICBuYW1lOiAnXHVBQ0Y1XHVDNzIwIFx1QzkxMVx1QjJFOCcsXG4gICAgICBjaGVja0NhbGxiYWNrOiAoY2hlY2tpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICAgIGlmICghZmlsZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoY2hlY2tpbmcpIHJldHVybiB0cnVlO1xuICAgICAgICB0aGlzLnNoYXJlU2VydmljZT8uc3RvcFNoYXJlKGZpbGUpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFNQRUMtU0hBUkUtMDAxOiBcdUQzMENcdUM3N0MgXHVCQTU0XHVCMjc0XHVDNUQwIFx1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkMgXHVDRUU4XHVEMTREXHVDMkE0XHVEMkI4IFx1QkE1NFx1QjI3NCBcdUI0RjFcdUI4NURcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAud29ya3NwYWNlLm9uKCdmaWxlLW1lbnUnLCB0aGlzLmhhbmRsZUZpbGVNZW51LmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIG9udW5sb2FkKCkge1xuICAgIHRoaXMuY2xlYW51cCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgc3luYyBzZXJ2aWNlIHdoZW4gc2V0dGluZ3MgYXJlIGNvbmZpZ3VyZWRcbiAgICogVC0wMDQ6IFx1QjJFNFx1QzkxMSBcdUJDRkNcdUQyQjggXHVDOUMwXHVDNkQwIC0gVmF1bHRSb3V0ZXIgXHVDMEFDXHVDNkE5IFx1QjYxMFx1QjI5NCBcdUI4MDhcdUFDNzBcdUMyREMgXHVCMkU4XHVDNzdDIFN5bmNTZXJ2aWNlIFx1QzBBQ1x1QzZBOVxuICAgKi9cbiAgYXN5bmMgaW5pdGlhbGl6ZVN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gVC0wMDQ6IFx1QjJFNFx1QzkxMSBcdUJDRkNcdUQyQjggXHVCQUE4XHVCNERDIFx1RDY1NVx1Qzc3OFxuICAgIGNvbnN0IGhhc1ZhdWx0TWFwcGluZ3MgPSB0aGlzLnNldHRpbmdzLnZhdWx0TWFwcGluZ3MgJiYgdGhpcy5zZXR0aW5ncy52YXVsdE1hcHBpbmdzLmxlbmd0aCA+IDA7XG4gICAgY29uc3QgaGFzTGVnYWN5U2V0dGluZ3MgPSB0aGlzLnNldHRpbmdzLnZhdWx0SWQgJiYgdGhpcy5zZXR0aW5ncy5hcGlLZXk7XG5cbiAgICBpZiAoIWhhc1ZhdWx0TWFwcGluZ3MgJiYgIWhhc0xlZ2FjeVNldHRpbmdzKSB7XG4gICAgICByZXR1cm47IC8vIFNldHRpbmdzIG5vdCBjb25maWd1cmVkIHlldFxuICAgIH1cblxuICAgIGlmICghdGhpcy5zZXR0aW5ncy5zeW5jRW5hYmxlZCkge1xuICAgICAgcmV0dXJuOyAvLyBcdUMwQUNcdUM2QTlcdUM3OTBcdUFDMDAgXHVCQTg1XHVDMkRDXHVDODAxXHVDNzNDXHVCODVDIFx1QzVGMFx1QUNCMCBcdUQ1NzRcdUM4MUNcdUQ1NUMgXHVDMEMxXHVEMERDXG4gICAgfVxuXG4gICAgLy8gVC0wMDQ6IFx1QjJFNFx1QzkxMSBcdUJDRkNcdUQyQjggXHVCQUE4XHVCNERDIC0gVmF1bHRSb3V0ZXIgXHVDMEREXHVDMTMxXG4gICAgaWYgKGhhc1ZhdWx0TWFwcGluZ3MpIHtcbiAgICAgIHRoaXMudmF1bHRSb3V0ZXIgPSBuZXcgVmF1bHRSb3V0ZXIoXG4gICAgICAgIHRoaXMuc2V0dGluZ3MudmF1bHRNYXBwaW5ncyA/PyBbXSxcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXJ2ZXJVcmwsXG4gICAgICAgIHRoaXMuc3RvcmFnZSwgLy8gU1BFQy1TWU5DLTAwNjogc3RvcmFnZSBcdUM4MDRcdUIyRUNcbiAgICAgICk7XG5cbiAgICAgIC8vIFx1QjlFNFx1RDU1MVx1QjQxQyBcdUQzRjRcdUIzNTQgXHVDNzkwXHVCM0Q5IFx1QzBERFx1QzEzMSAoXHVDNUM2XHVCMjk0IFx1QUNCRFx1QzZCMClcbiAgICAgIGF3YWl0IHRoaXMuZW5zdXJlTWFwcGVkRm9sZGVycyh0aGlzLnNldHRpbmdzLnZhdWx0TWFwcGluZ3MgPz8gW10pO1xuXG4gICAgICAvLyBcdUJBQThcdUI0RTAgU3luY1NlcnZpY2VcdUM1RDAgXHVDRjVDXHVCQzMxIFx1QzEyNFx1QzgxNVxuICAgICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5jcmVhdGVTeW5jQ2FsbGJhY2tzKCk7XG4gICAgICB0aGlzLnZhdWx0Um91dGVyLnNldENhbGxiYWNrcyhjYWxsYmFja3MpO1xuXG4gICAgICAvLyBcdUJBQThcdUI0RTAgXHVCQ0ZDXHVEMkI4IFx1QzVGMFx1QUNCMCBcdUMyRENcdUM3OTFcbiAgICAgIHRoaXMudmF1bHRSb3V0ZXIuY29ubmVjdEFsbCgpLmNhdGNoKGUgPT5cbiAgICAgICAgY29uc29sZS5lcnJvcignW2luaXRpYWxpemVTeW5jXSBjb25uZWN0QWxsIFx1QzJFNFx1RDMyODonLCBlKSxcbiAgICAgICk7XG5cbiAgICAgIC8vIFx1QjlDOFx1QzlDMFx1QjlDOSBcdUM1RjBcdUFDQjAgXHVDMTI0XHVDODE1IFx1QzgwMFx1QzdBNVxuICAgICAgdGhpcy5sYXN0Q29ubmVjdGVkU2V0dGluZ3MgPSB7XG4gICAgICAgIHNlcnZlclVybDogdGhpcy5zZXR0aW5ncy5zZXJ2ZXJVcmwsXG4gICAgICAgIHZhdWx0SWQ6IHRoaXMuc2V0dGluZ3MudmF1bHRJZCB8fCAnJyxcbiAgICAgICAgYXBpS2V5OiB0aGlzLnNldHRpbmdzLmFwaUtleSB8fCAnJyxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMucmVnaXN0ZXJFdmVudHMoKTtcblxuICAgICAgLy8gU1BFQy1TSEFSRS0wMDE6IFx1RDUwQ1x1QjdFQ1x1QURGOFx1Qzc3OCBcdUMyRENcdUM3OTEgXHVDMkRDIFx1QUNGNVx1QzcyMCBcdUIzRDlcdUFFMzBcdUQ2NTRcbiAgICAgIHRoaXMuc2hhcmVTZXJ2aWNlIS5zeW5jU2hhcmVzT25TdGFydHVwKCkuY2F0Y2goZSA9PlxuICAgICAgICBjb25zb2xlLmVycm9yKCdbaW5pdGlhbGl6ZVN5bmNdIHN5bmNTaGFyZXNPblN0YXJ0dXAgXHVDMkU0XHVEMzI4OicsIGUpLFxuICAgICAgKTtcblxuICAgICAgLy8gU1BFQy1QTFVHSU4tU1RBVFVTLTAwMTogXHVDOUMwXHVDMThEXHVDODAxIFx1QzBDMVx1RDBEQyBcdUQ0NUNcdUMyRENcdUM5MDQgXHVDRDA4XHVBRTMwXHVENjU0XG4gICAgICB0aGlzLmluaXRpYWxpemVQZXJzaXN0ZW50U3RhdHVzQmFyKCk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBULTAwNDogXHVCODA4XHVBQzcwXHVDMkRDIFx1QjJFOFx1Qzc3QyBcdUJDRkNcdUQyQjggXHVCQUE4XHVCNERDIC0gXHVCOUM4XHVDNzc0XHVBREY4XHVCODA4XHVDNzc0XHVDMTU4IFx1RDZDNCBWYXVsdFJvdXRlciBcdUMwRERcdUMxMzFcbiAgICBpZiAoaGFzTGVnYWN5U2V0dGluZ3MpIHtcbiAgICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBcdUMxMjRcdUM4MTVcdUM3NDQgXHVCMkU0XHVDOTExIFx1QkNGQ1x1RDJCOCBcdUQ2MTVcdUMyRERcdUM3M0NcdUI4NUMgXHVCOUM4XHVDNzc0XHVBREY4XHVCODA4XHVDNzc0XHVDMTU4XG4gICAgICBjb25zdCBtaWdyYXRlZFNldHRpbmdzID0gbWlncmF0ZVRvTXVsdGlWYXVsdCh0aGlzLnNldHRpbmdzKTtcbiAgICAgIHRoaXMuc2V0dGluZ3MudmF1bHRNYXBwaW5ncyA9IG1pZ3JhdGVkU2V0dGluZ3MudmF1bHRNYXBwaW5ncztcblxuICAgICAgLy8gVmF1bHRSb3V0ZXIgXHVDMEREXHVDMTMxXG4gICAgICB0aGlzLnZhdWx0Um91dGVyID0gbmV3IFZhdWx0Um91dGVyKFxuICAgICAgICB0aGlzLnNldHRpbmdzLnZhdWx0TWFwcGluZ3MgPz8gW10sXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2VydmVyVXJsLFxuICAgICAgICB0aGlzLnN0b3JhZ2UsIC8vIFNQRUMtU1lOQy0wMDY6IHN0b3JhZ2UgXHVDODA0XHVCMkVDXG4gICAgICApO1xuXG4gICAgICAvLyBcdUI5RTRcdUQ1NTFcdUI0MUMgXHVEM0Y0XHVCMzU0IFx1Qzc5MFx1QjNEOSBcdUMwRERcdUMxMzEgKFx1QzVDNlx1QjI5NCBcdUFDQkRcdUM2QjApXG4gICAgICBhd2FpdCB0aGlzLmVuc3VyZU1hcHBlZEZvbGRlcnModGhpcy5zZXR0aW5ncy52YXVsdE1hcHBpbmdzID8/IFtdKTtcblxuICAgICAgLy8gXHVCQUE4XHVCNEUwIFN5bmNTZXJ2aWNlXHVDNUQwIFx1Q0Y1Q1x1QkMzMSBcdUMxMjRcdUM4MTVcbiAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuY3JlYXRlU3luY0NhbGxiYWNrcygpO1xuICAgICAgdGhpcy52YXVsdFJvdXRlci5zZXRDYWxsYmFja3MoY2FsbGJhY2tzKTtcblxuICAgICAgLy8gXHVCQUE4XHVCNEUwIFx1QkNGQ1x1RDJCOCBcdUM1RjBcdUFDQjAgXHVDMkRDXHVDNzkxXG4gICAgICB0aGlzLnZhdWx0Um91dGVyLmNvbm5lY3RBbGwoKS5jYXRjaChlID0+XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tpbml0aWFsaXplU3luY10gY29ubmVjdEFsbCBcdUMyRTRcdUQzMjggKGxlZ2FjeSk6JywgZSksXG4gICAgICApO1xuXG4gICAgICAvLyBcdUI5QzhcdUM5QzBcdUI5QzkgXHVDNUYwXHVBQ0IwIFx1QzEyNFx1QzgxNSBcdUM4MDBcdUM3QTVcbiAgICAgIHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzID0ge1xuICAgICAgICBzZXJ2ZXJVcmw6IHRoaXMuc2V0dGluZ3Muc2VydmVyVXJsLFxuICAgICAgICB2YXVsdElkOiB0aGlzLnNldHRpbmdzLnZhdWx0SWQsXG4gICAgICAgIGFwaUtleTogdGhpcy5zZXR0aW5ncy5hcGlLZXksXG4gICAgICB9O1xuXG4gICAgICB0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XG5cbiAgICAgIC8vIFNQRUMtU0hBUkUtMDAxOiBcdUQ1MENcdUI3RUNcdUFERjhcdUM3NzggXHVDMkRDXHVDNzkxIFx1QzJEQyBcdUFDRjVcdUM3MjAgXHVCM0Q5XHVBRTMwXHVENjU0XG4gICAgICB0aGlzLnNoYXJlU2VydmljZSEuc3luY1NoYXJlc09uU3RhcnR1cCgpLmNhdGNoKGUgPT5cbiAgICAgICAgY29uc29sZS5lcnJvcignW2luaXRpYWxpemVTeW5jXSBzeW5jU2hhcmVzT25TdGFydHVwIFx1QzJFNFx1RDMyODonLCBlKSxcbiAgICAgICk7XG5cbiAgICAgIC8vIFNQRUMtUExVR0lOLVNUQVRVUy0wMDE6IFx1QzlDMFx1QzE4RFx1QzgwMSBcdUMwQzFcdUQwREMgXHVENDVDXHVDMkRDXHVDOTA0IFx1Q0QwOFx1QUUzMFx1RDY1NFxuICAgICAgdGhpcy5pbml0aWFsaXplUGVyc2lzdGVudFN0YXR1c0JhcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUI5RTRcdUQ1NTFcdUI0MUMgXHVEM0Y0XHVCMzU0XHVBQzAwIFx1QzVDNlx1QzczQ1x1QkE3NCBcdUM3OTBcdUIzRDkgXHVDMEREXHVDMTMxXG4gICAqIFx1QzdBQ1x1QzJEQ1x1Qzc5MS9cdUM3QUNcdUM1RjBcdUFDQjAgXHVDMkRDIFx1QjlFNFx1RDU1MVx1QjQxQyBcdUQzRjRcdUIzNTRcdUFDMDAgXHVDNUM2XHVCMjk0IFx1QUNCRFx1QzZCMCBcdUIzMDBcdUM3NTFcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlTWFwcGVkRm9sZGVycyhtYXBwaW5nczogQXJyYXk8eyBmb2xkZXI6IHN0cmluZzsgZW5hYmxlZDogYm9vbGVhbiB9Pik6IFByb21pc2U8dm9pZD4ge1xuICAgIGZvciAoY29uc3QgbWFwcGluZyBvZiBtYXBwaW5ncykge1xuICAgICAgaWYgKCFtYXBwaW5nLmVuYWJsZWQpIGNvbnRpbnVlO1xuICAgICAgaWYgKCFtYXBwaW5nLmZvbGRlciB8fCBtYXBwaW5nLmZvbGRlci50cmltKCkgPT09ICcnKSBjb250aW51ZTtcblxuICAgICAgLy8gVmF1bHRSb3V0ZXIubm9ybWFsaXplRm9sZGVyXHVDNjQwIFx1QjNEOVx1Qzc3Q1x1RDU1QyBcdUM4MTVcdUFERENcdUQ2NTRcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBtYXBwaW5nLmZvbGRlci5yZXBsYWNlKC9eXFwvK3xcXC8rJC9nLCAnJyk7XG4gICAgICBpZiAoIW5vcm1hbGl6ZWQpIGNvbnRpbnVlO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmb2xkZXIgPSB0aGlzLmFwcC52YXVsdC5nZXRGb2xkZXJCeVBhdGgobm9ybWFsaXplZCk7XG4gICAgICAgIGlmICghZm9sZGVyKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlRm9sZGVyKG5vcm1hbGl6ZWQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbZW5zdXJlTWFwcGVkRm9sZGVyc10gXHVEM0Y0XHVCMzU0IFx1QzBERFx1QzEzMTogJHtub3JtYWxpemVkfWApO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFtlbnN1cmVNYXBwZWRGb2xkZXJzXSBcdUQzRjRcdUIzNTQgXHVDMEREXHVDMTMxIFx1QzJFNFx1RDMyODogJHtub3JtYWxpemVkfWAsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBULTAwNDogU3luY1NlcnZpY2UgXHVDRjVDXHVCQzMxIFx1QzBERFx1QzEzMSAoVmF1bHRSb3V0ZXJcdUM3NTggXHVCQUE4XHVCNEUwIFN5bmNTZXJ2aWNlXHVDNUQwIFx1QUNGNVx1QzcyMClcbiAgICovXG4gIHByaXZhdGUgY3JlYXRlU3luY0NhbGxiYWNrcygpOiBTeW5jQ2FsbGJhY2tzIHtcbiAgICByZXR1cm4ge1xuICAgICAgb25GaWxlSWRVcGRhdGU6IChwYXRoLCBmaWxlSWQpID0+IHtcbiAgICAgICAgdGhpcy5maWxlSWRUcmFja2VyLnNldEZpbGVJZChwYXRoLCBmaWxlSWQpO1xuICAgICAgICB0aGlzLnJlc29sdXRpb25RdWV1ZS5yZW1vdmUocGF0aCk7XG4gICAgICAgIC8vIEluZGV4ZWREQlx1QzVEMCBcdUM5ODlcdUMyREMgXHVDODAwXHVDN0E1ICh1bmxvYWQgXHVDMkRDIFx1QzE5MFx1QzJFNCBcdUJDMjlcdUM5QzApXG4gICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zYXZlTWFwcGluZ3MoKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICB9LFxuICAgICAgb25GaWxlSWRSZW1vdmU6IChwYXRoKSA9PiB7XG4gICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5yZW1vdmVGaWxlSWQocGF0aCk7XG4gICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zYXZlTWFwcGluZ3MoKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICB9LFxuICAgICAgZ2V0UGF0aEJ5RmlsZUlkOiAoZmlsZUlkKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0UGF0aChmaWxlSWQpO1xuICAgICAgfSxcbiAgICAgIGdldEZpbGVJZEJ5UGF0aDogKHBhdGgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZUlkVHJhY2tlci5nZXRGaWxlSWQocGF0aCk7XG4gICAgICB9LFxuICAgICAgb25GaWxlQ3JlYXRlOiBhc3luYyAocGF0aCwgY29udGVudCkgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUocGF0aCwgY29udGVudCk7XG4gICAgICB9LFxuICAgICAgb25GaWxlVXBkYXRlOiBhc3luYyAocGF0aCwgY29udGVudCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIGNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25GaWxlRGVsZXRlOiBhc3luYyAocGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmRlbGV0ZShmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRmlsZVJlbmFtZTogYXN5bmMgKG9sZFBhdGgsIG5ld1BhdGgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChvbGRQYXRoKTtcbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3UGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkNvbmZsaWN0OiAoY29uZmxpY3RJbmZvKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybignW0NvbmZsaWN0XScsIGNvbmZsaWN0SW5mbyk7XG4gICAgICAgIC8vIFQtMDE0OiBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Q0RBOVx1QjNDQyBcdUFDMTBcdUM5QzAgXHVDMkRDIE5vdGljZSBcdUQ0NUNcdUMyRENcbiAgICAgICAgaWYgKGNvbmZsaWN0SW5mby50eXBlID09PSAncmVjb25uZWN0X2NvbmZsaWN0Jykge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYFx1QjNEOVx1QUUzMFx1RDY1NCBcdUNEQTlcdUIzQ0M6ICR7Y29uZmxpY3RJbmZvLnBhdGh9YCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbk5vdGljZTogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgbmV3IE5vdGljZShtZXNzYWdlKTtcbiAgICAgIH0sXG4gICAgICBoYXNVbnNhdmVkQ2hhbmdlczogKCkgPT4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHN0dWIgZm9yIG5vd1xuICAgICAgfSxcbiAgICAgIHJlYWRGaWxlOiAocGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgLy8gXHVCM0Q5XHVBRTMwIFx1Qzc3RFx1QUUzMFx1QjI5NCBcdUJEODhcdUFDMDBcdUIyQTVcdUQ1NThcdUJCQzBcdUI4NUMgXHVCRTQ4IFx1QkIzOFx1Qzc5MFx1QzVGNCBcdUJDMThcdUQ2NThcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSxcbiAgICAgIHBhdGhFeGlzdHM6IChwYXRoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCkgIT09IG51bGw7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclJlY29ubmVjdDogKCkgPT4ge1xuICAgICAgICB0aGlzLnZhdWx0Um91dGVyPy5jb25uZWN0QWxsKCkuY2F0Y2goZSA9PlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t0cmlnZ2VyUmVjb25uZWN0XSBjb25uZWN0QWxsIFx1QzJFNFx1RDMyODonLCBlKSxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBvbkVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW1N5bmNTZXJ2aWNlIEVycm9yXSAke2Vycm9yLmNhdGVnb3J5fS8ke2Vycm9yLmNvZGV9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIG5ldyBOb3RpY2UoYFx1QjNEOVx1QUUzMFx1RDY1NCBcdUM2MjRcdUI5NTggXHUyMDE0ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIH0sXG4gICAgICBxdWV1ZVJlc29sdXRpb246IChfZmlsZUlkLCBwYXRoKSA9PiB7XG4gICAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgICAgdGhpcy5yZXNvbHV0aW9uUXVldWUuYWRkKHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY29sbGVjdExvY2FsRmlsZXM6IGFzeW5jICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdExvY2FsRmlsZXMoKTtcbiAgICAgIH0sXG4gICAgICByZWFkRmlsZUFzeW5jOiBhc3luYyAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG4gICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9LFxuICAgICAgc2hvd1N0YXR1c0JhcjogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0dXNCYXIobWVzc2FnZSk7XG4gICAgICB9LFxuICAgICAgY2xlYXJTdGF0dXNCYXI6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbGVhclN0YXR1c0JhcigpO1xuICAgICAgfSxcbiAgICAgIC8vIFQtMDEzOiBcdUM3N0NcdUFEMDQgXHVDREE5XHVCM0NDIFx1RDU3NFx1QUNCMCBcdUNGNUNcdUJDMzFcbiAgICAgIHJlc29sdmVDb25mbGljdHM6IGFzeW5jIChjb25mbGljdHM6IENvbmZsaWN0SW5mb1tdKTogUHJvbWlzZTxDb25mbGljdEluZm9bXT4gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1vZGFsID0gbmV3IFN5bmNSZXNvbHV0aW9uTW9kYWwoXG4gICAgICAgICAgICB0aGlzLmFwcCxcbiAgICAgICAgICAgIGNvbmZsaWN0cyxcbiAgICAgICAgICAgIFtdLCAvLyBcdUI4NUNcdUNFRUMgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdUM1QzZcdUM3NENcbiAgICAgICAgICAgIC8vIG9uUmVzb2x2ZTogXHVDMEFDXHVDNkE5XHVDNzkwXHVBQzAwIFtcdUIzRDlcdUFFMzBcdUQ2NTRdIFx1QkM4NFx1RDJCQyBcdUQwNzRcdUI5QURcbiAgICAgICAgICAgIChhY3Rpb25zOiBNYXA8c3RyaW5nLCBTeW5jQWN0aW9uPikgPT4ge1xuICAgICAgICAgICAgICAvLyBTeW5jQWN0aW9uXHVDNzQ0IENvbmZsaWN0SW5mb1tdXHVCODVDIFx1QkNDMFx1RDY1OFxuICAgICAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IGNvbmZsaWN0cy5tYXAoY29uZmxpY3QgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5jb25mbGljdCxcbiAgICAgICAgICAgICAgICAvLyBcdUMwQUNcdUM2QTlcdUM3OTBcdUFDMDAgXHVCQTg1XHVDMkRDXHVENTU4XHVDOUMwIFx1QzU0QVx1Qzc0MCBcdUNEQTlcdUIzQ0NcdUM3NDAgXHVDNTQ4XHVDODA0XHVENTU4XHVBQzhDIFx1QzExQ1x1QkM4NCBcdUJDODRcdUM4MDRcdUM3M0NcdUI4NUMgXHVEM0Y0XHVCQzMxXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWZXJzaW9uOiAoYWN0aW9ucy5nZXQoY29uZmxpY3QucGF0aCkgPT09ICdsb2NhbCcgPyAnbG9jYWwnIDogJ3NlcnZlcicpIGFzICdsb2NhbCcgfCAnc2VydmVyJyxcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc29sdmVkKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBvbkNhbmNlbDogXHVDMEFDXHVDNkE5XHVDNzkwXHVBQzAwIFtcdUNERThcdUMxOENdIFx1QkM4NFx1RDJCQyBcdUQwNzRcdUI5QURcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignXHVDMEFDXHVDNkE5XHVDNzkwXHVBQzAwIFx1Q0RBOVx1QjNDQyBcdUQ1NzRcdUFDQjBcdUM3NDQgXHVDREU4XHVDMThDXHVENTY4JykpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgLy8gUkVRLUFUVEFDSC0wMDIsIFJFUS1BVFRBQ0gtMDA1OiBcdUJDMTRcdUM3NzRcdUIxMDhcdUI5QUMgXHVEMzBDXHVDNzdDIFx1Q0Y1Q1x1QkMzMVxuICAgICAgcmVhZEJpbmFyeUZpbGVBc3luYzogYXN5bmMgKHBhdGg6IHN0cmluZyk6IFByb21pc2U8QXJyYXlCdWZmZXI+ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKTtcbiAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFwcC52YXVsdC5yZWFkQmluYXJ5KGZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlCdWZmZXIoMCk7XG4gICAgICB9LFxuICAgICAgb25CaW5hcnlGaWxlQ3JlYXRlOiBhc3luYyAocGF0aDogc3RyaW5nLCBkYXRhOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgLy8gXHVDNzc0XHVCQkY4IFx1Qzg3NFx1QzdBQ1x1RDU1OFx1QkE3NCBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjhcbiAgICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnlCaW5hcnkoZmlsZSwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlQmluYXJ5KHBhdGgsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25CaW5hcnlGaWxlVXBkYXRlOiBhc3luYyAocGF0aDogc3RyaW5nLCBkYXRhOiBBcnJheUJ1ZmZlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5QmluYXJ5KGZpbGUsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZW5zdXJlRm9sZGVyRXhpc3RzOiBhc3luYyAocGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIC8vIE9ic2lkaWFuIHZhdWx0IGFkYXB0ZXJcdUI4NUMgXHVEM0Y0XHVCMzU0IFx1QzBERFx1QzEzMVxuICAgICAgICBjb25zdCBmb2xkZXJQYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwvKy8sICcnKTtcbiAgICAgICAgaWYgKGZvbGRlclBhdGggJiYgIWF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGZvbGRlclBhdGgpKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5ta2Rpcihmb2xkZXJQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIFNQRUMtU1lOQy0wMDM6IFx1Qjg1Q1x1Q0VFQyBcdUM4MDRcdUM2QTkgXHVEMzBDXHVDNzdDIFx1QjNEOVx1QUUzMFx1RDY1NCBcdUMyQjlcdUM3NzggXHVDRjVDXHVCQzMxXG4gICAgICBhcHByb3ZlTG9jYWxVcGxvYWRzOiBhc3luYyAoZmlsZXM6IExvY2FsRmlsZUFwcHJvdmFsW10pOiBQcm9taXNlPE1hcDxzdHJpbmcsIExvY2FsRmlsZUFjdGlvbj4+ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgY29uc3QgbW9kYWwgPSBuZXcgU3luY1Jlc29sdXRpb25Nb2RhbChcbiAgICAgICAgICAgIHRoaXMuYXBwLFxuICAgICAgICAgICAgW10sIC8vIFx1Q0RBOVx1QjNDQyBcdUQzMENcdUM3N0MgXHVDNUM2XHVDNzRDXG4gICAgICAgICAgICBmaWxlcyxcbiAgICAgICAgICAgIC8vIG9uUmVzb2x2ZTogXHVDMEFDXHVDNkE5XHVDNzkwXHVBQzAwIFtcdUIzRDlcdUFFMzBcdUQ2NTRdIFx1QkM4NFx1RDJCQyBcdUQwNzRcdUI5QURcbiAgICAgICAgICAgIChhY3Rpb25zOiBNYXA8c3RyaW5nLCBTeW5jQWN0aW9uPikgPT4ge1xuICAgICAgICAgICAgICAvLyBTeW5jQWN0aW9uXHVDNzQ0IExvY2FsRmlsZUFjdGlvblx1QzczQ1x1Qjg1QyBcdUJDQzBcdUQ2NThcbiAgICAgICAgICAgICAgY29uc3QgYWN0aW9uTWFwID0gbmV3IE1hcDxzdHJpbmcsIExvY2FsRmlsZUFjdGlvbj4oKTtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBbcGF0aCwgYWN0aW9uXSBvZiBhY3Rpb25zLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICd1cGxvYWQnIHx8IGFjdGlvbiA9PT0gJ3NraXAnIHx8IGFjdGlvbiA9PT0gJ2RlbGV0ZScpIHtcbiAgICAgICAgICAgICAgICAgIGFjdGlvbk1hcC5zZXQocGF0aCwgYWN0aW9uIGFzIExvY2FsRmlsZUFjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc29sdmUoYWN0aW9uTWFwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBvbkNhbmNlbDogXHVDMEFDXHVDNkE5XHVDNzkwXHVBQzAwIFtcdUNERThcdUMxOENdIFx1QkM4NFx1RDJCQyBcdUQwNzRcdUI5QURcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgTWFwKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIG1vZGFsLm9wZW4oKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgLy8gU1BFQy1TWU5DLTAwMzogXHVEMzBDXHVDNzdDIFx1QzBBRFx1QzgxQyBcdUNGNUNcdUJDMzFcbiAgICAgIHRyYXNoRmlsZTogYXN5bmMgKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LnRyYXNoKGZpbGUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gU1BFQy1TWU5DLTAwMzogXHVEMzBDXHVDNzdDIFx1RDFCNVx1QUNDNCBcdUNGNUNcdUJDMzFcbiAgICAgIGdldEZpbGVTdGF0OiBhc3luYyAocGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IHNpemU6IG51bWJlcjsgbXRpbWU6IG51bWJlciB9PiA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG4gICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2l6ZTogZmlsZS5zdGF0LnNpemUsXG4gICAgICAgICAgICBtdGltZTogZmlsZS5zdGF0Lm10aW1lLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc2l6ZTogMCwgbXRpbWU6IERhdGUubm93KCkgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBPYnNpZGlhbiB2YXVsdCBldmVudCBoYW5kbGVyc1xuICAgKi9cbiAgcHJpdmF0ZSByZWdpc3RlckV2ZW50cygpOiB2b2lkIHtcbiAgICAvLyBSRVEtUEwtMTAzOiBGaWxlIGNyZWF0ZSAoUkVRLUFUVEFDSC0wMDE6IHdoaXRlbGlzdCBmaWx0ZXIpXG4gICAgY29uc3QgY3JlYXRlUmVmID0gdGhpcy5hcHAudmF1bHQub24oJ2NyZWF0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmIGlzQWxsb3dlZEV4dGVuc2lvbihmaWxlLnBhdGgpICYmICF0aGlzLmlzU2tpcHBlZChmaWxlLnBhdGgpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZUNyZWF0ZShmaWxlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJFUS1QTC0xMDQ6IEZpbGUgbW9kaWZ5IChSRVEtQVRUQUNILTAwMTogd2hpdGVsaXN0IGZpbHRlcilcbiAgICBjb25zdCBtb2RpZnlSZWYgPSB0aGlzLmFwcC52YXVsdC5vbignbW9kaWZ5JywgKGZpbGUpID0+IHtcbiAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUgJiYgaXNBbGxvd2VkRXh0ZW5zaW9uKGZpbGUucGF0aCkgJiYgIXRoaXMuaXNTa2lwcGVkKGZpbGUucGF0aCkpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVGaWxlTW9kaWZ5KGZpbGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUkVRLVBMLTEwNTogRmlsZSBkZWxldGUgKFJFUS1BVFRBQ0gtMDAxOiB3aGl0ZWxpc3QgZmlsdGVyKVxuICAgIGNvbnN0IGRlbGV0ZVJlZiA9IHRoaXMuYXBwLnZhdWx0Lm9uKCdkZWxldGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSAmJiBpc0FsbG93ZWRFeHRlbnNpb24oZmlsZS5wYXRoKSAmJiAhdGhpcy5pc1NraXBwZWQoZmlsZS5wYXRoKSkge1xuICAgICAgICB0aGlzLmhhbmRsZUZpbGVEZWxldGUoZmlsZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBSRVEtUEwtMTA2OiBGaWxlIHJlbmFtZSAoUkVRLUFUVEFDSC0wMDE6IHdoaXRlbGlzdCBmaWx0ZXIpXG4gICAgY29uc3QgcmVuYW1lUmVmID0gdGhpcy5hcHAudmF1bHQub24oJ3JlbmFtZScsIChmaWxlLCBvbGRQYXRoKSA9PiB7XG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmIGlzQWxsb3dlZEV4dGVuc2lvbihmaWxlLnBhdGgpICYmICF0aGlzLmlzU2tpcHBlZChmaWxlLnBhdGgpKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZVJlbmFtZShmaWxlLCBvbGRQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZXZlbnRSZWZzID0gW2NyZWF0ZVJlZiwgbW9kaWZ5UmVmLCBkZWxldGVSZWYsIHJlbmFtZVJlZl07XG4gICAgdGhpcy5ldmVudFJlZnMuZm9yRWFjaChyZWYgPT4gdGhpcy5yZWdpc3RlckV2ZW50KHJlZikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmaWxlIGNyZWF0ZSBldmVudCAoUkVRLUVILTQwMSlcbiAgICogUkVRLUFUVEFDSC0wMDI6IEJpbmFyeSBmaWxlIHVwbG9hZCBzdXBwb3J0XG4gICAqIFQtMDA2OiBWYXVsdFJvdXRlclx1Qjk3QyBcdUQxQjVcdUQ1NUMgXHVCNzdDXHVDNkIwXHVEMzA1XG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZUZpbGVDcmVhdGUoZmlsZTogVEZpbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBULTAwNjogVmF1bHRSb3V0ZXIgXHVCNzdDXHVDNkIwXHVEMzA1XG4gICAgaWYgKHRoaXMudmF1bHRSb3V0ZXIpIHtcbiAgICAgIGNvbnN0IHBhdGhBdENyZWF0ZSA9IGZpbGUucGF0aDtcbiAgICAgIGNvbnNvbGUubG9nKGBbQ1JFQVRFXSBzdGFydCBwYXRoQXRDcmVhdGU9JHtwYXRoQXRDcmVhdGV9IGZpbGUucGF0aD0ke2ZpbGUucGF0aH1gKTtcbiAgICAgIGNvbnN0IHZhdWx0SWQgPSB0aGlzLnZhdWx0Um91dGVyLnJvdXRlKHBhdGhBdENyZWF0ZSk7XG4gICAgICBpZiAoIXZhdWx0SWQpIHtcbiAgICAgICAgLy8gXHVCOUU0XHVENTUxXHVCNDE4XHVDOUMwIFx1QzU0QVx1Qzc0MCBcdUQzRjRcdUIzNTRcdUIyOTQgXHVCQjM0XHVDMkRDXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3luY1NlcnZpY2UgPSB0aGlzLnZhdWx0Um91dGVyLmdldFN5bmNTZXJ2aWNlKHZhdWx0SWQpO1xuICAgICAgaWYgKCFzeW5jU2VydmljZSkgcmV0dXJuO1xuXG4gICAgICAvLyBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOTExXHVDNUQwXHVCMjk0IFx1Qjc3Q1x1Qzc3NFx1QkUwQyBcdUMyRjFcdUQwNkMgXHVDNzc0XHVCQ0E0XHVEMkI4IFx1QkIzNFx1QzJEQyAoUkVRLVJULTEwMylcbiAgICAgIGlmIChzeW5jU2VydmljZS5pc1N5bmNpbmcpIHJldHVybjtcblxuICAgICAgLy8gXHVDMTFDXHVCQzg0XHVDNUQwXHVDMTFDIFx1QkMxQlx1QzU0NCBcdUMwRERcdUMxMzFcdUQ1NUMgXHVEMzBDXHVDNzdDXHVDNzc0XHVCQTc0IFx1QzVEMFx1Q0Y1NCBcdUJDMjlcdUM5QzBcbiAgICAgIGlmIChzeW5jU2VydmljZS5pc1N5bmNDcmVhdGVkUGF0aChwYXRoQXRDcmVhdGUpKSByZXR1cm47XG5cbiAgICAgIC8vIFx1Qzc3NFx1QkJGOCBcdUIzMDBcdUFFMzAgXHVDOTExXHVDNzc4IGZpbGU6Y3JlYXRlXHVBQzAwIFx1Qzc4OFx1QzczQ1x1QkE3NCBcdUM5MTFcdUJDRjUgXHVDMEREXHVDMTMxIFx1QkMyOVx1QzlDMFxuICAgICAgLy8gcmVuYW1lIFx1RDZDNCBcdUIzRDlcdUM3N0MgXHVBQ0JEXHVCODVDXHVCODVDIFx1QjJFNFx1QzJEQyBjcmVhdGUgXHVDNzc0XHVCQ0E0XHVEMkI4XHVBQzAwIFx1QkMxQ1x1QzBERFx1RDU1OFx1QjI5NCBcdUFDQkRcdUM3QzEgXHVDODcwXHVBQzc0IFx1QjMwMFx1Qzc1MVxuICAgICAgaWYgKHN5bmNTZXJ2aWNlLmhhc1BlbmRpbmdTeW5jKHBhdGhBdENyZWF0ZSkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFtDUkVBVEVdIHNraXBwZWQgLSBoYXNQZW5kaW5nU3luYyBmb3IgJHtwYXRoQXRDcmVhdGV9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzQmluYXJ5RmlsZShwYXRoQXRDcmVhdGUpKSB7XG4gICAgICAgICAgLy8gUkVRLUFUVEFDSC0wMDI6IFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0MgUkVTVCBcdUM1QzVcdUI4NUNcdUI0RENcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZEJpbmFyeShmaWxlKTtcbiAgICAgICAgICBhd2FpdCBzeW5jU2VydmljZS51cGxvYWRCaW5hcnlGaWxlKHBhdGhBdENyZWF0ZSwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHVEMTREXHVDMkE0XHVEMkI4IFx1RDMwQ1x1Qzc3QzogV2ViU29ja2V0XHVDNzNDXHVCODVDIFx1QzgwNFx1QzFBMVxuICAgICAgICAgIC8vIFx1QzBERFx1QzEzMSBcdUM5MTEgXHVDNzc0XHVCOTg0IFx1QkNDMFx1QUNCRFx1QjQxQyBcdUFDQkRcdUM2QjAgXHVDRDVDXHVDODg1IFx1QUNCRFx1Qjg1Q1x1Qjg1QyBcdUM4MDRcdUMxQTFcbiAgICAgICAgICBjb25zdCBkZWZlcnJlZE5ld1BhdGggPSB0aGlzLmRlZmVycmVkUmVuYW1lcy5nZXQocGF0aEF0Q3JlYXRlKTtcbiAgICAgICAgICBjb25zdCBjcmVhdGVQYXRoID0gZGVmZXJyZWROZXdQYXRoIHx8IHBhdGhBdENyZWF0ZTtcbiAgICAgICAgICBpZiAoZGVmZXJyZWROZXdQYXRoKSB7XG4gICAgICAgICAgICB0aGlzLmRlZmVycmVkUmVuYW1lcy5kZWxldGUocGF0aEF0Q3JlYXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICAgICAgY29uc29sZS5sb2coYFtDUkVBVEVdIGFmdGVyIHJlYWQgcGF0aEF0Q3JlYXRlPSR7cGF0aEF0Q3JlYXRlfSBmaWxlLnBhdGg9JHtmaWxlLnBhdGh9IGNyZWF0ZVBhdGg9JHtjcmVhdGVQYXRofSBkZWZlcnJlZD0ke2RlZmVycmVkTmV3UGF0aH1gKTtcbiAgICAgICAgICBzeW5jU2VydmljZS5zZW5kRmlsZUNyZWF0ZShjcmVhdGVQYXRoLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZUZpbGVDcmVhdGVdJywge1xuICAgICAgICAgIGhhbmRsZXI6ICdoYW5kbGVGaWxlQ3JlYXRlJyxcbiAgICAgICAgICBwYXRoOiBmaWxlLnBhdGgsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHVCODA4XHVBQzcwXHVDMkRDIFx1QjJFOFx1Qzc3QyBcdUJDRkNcdUQyQjggXHVCQUE4XHVCNERDIChcdUQzRjRcdUJDMzEpXG4gICAgaWYgKHRoaXMuc3luY1NlcnZpY2U/LmlzU3luY2luZykgcmV0dXJuO1xuICAgIGlmICh0aGlzLnN5bmNTZXJ2aWNlPy5pc1N5bmNDcmVhdGVkUGF0aChmaWxlLnBhdGgpKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgaWYgKGlzQmluYXJ5RmlsZShmaWxlLnBhdGgpKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkQmluYXJ5KGZpbGUpO1xuICAgICAgICBhd2FpdCB0aGlzLnN5bmNTZXJ2aWNlPy51cGxvYWRCaW5hcnlGaWxlKGZpbGUucGF0aCwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgdGhpcy5zeW5jU2VydmljZT8uc2VuZEZpbGVDcmVhdGUoZmlsZS5wYXRoLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZUZpbGVDcmVhdGVdJywge1xuICAgICAgICBoYW5kbGVyOiAnaGFuZGxlRmlsZUNyZWF0ZScsXG4gICAgICAgIHBhdGg6IGZpbGUucGF0aCxcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZmlsZSBtb2RpZnkgZXZlbnQgKFJFUS1CRi01MDQsIFJFUS1FSC00MDEpXG4gICAqIFJFUS1BVFRBQ0gtMDAyOiBCaW5hcnkgZmlsZSB1cGxvYWQgc3VwcG9ydFxuICAgKiBULTAwNjogVmF1bHRSb3V0ZXJcdUI5N0MgXHVEMUI1XHVENTVDIFx1Qjc3Q1x1QzZCMFx1RDMwNVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVGaWxlTW9kaWZ5KGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gU1BFQy1TSEFSRS0wMDE6IFx1QUNGNVx1QzcyMCBcdUMxMUNcdUJFNDRcdUMyQTRcdUM1RDAgXHVDNzU4XHVENTVDIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMCBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggXHVCQjM0XHVDMkRDXG4gICAgaWYgKHRoaXMuc2hhcmVTZXJ2aWNlPy5zaG91bGRTdXBwcmVzc01vZGlmeShmaWxlLnBhdGgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVC0wMDY6IFZhdWx0Um91dGVyIFx1Qjc3Q1x1QzZCMFx1RDMwNVxuICAgIGlmICh0aGlzLnZhdWx0Um91dGVyKSB7XG4gICAgICBjb25zdCB2YXVsdElkID0gdGhpcy52YXVsdFJvdXRlci5yb3V0ZShmaWxlLnBhdGgpO1xuICAgICAgaWYgKCF2YXVsdElkKSB7XG4gICAgICAgIC8vIFx1QjlFNFx1RDU1MVx1QjQxOFx1QzlDMCBcdUM1NEFcdUM3NDAgXHVEM0Y0XHVCMzU0XHVCMjk0IFx1QkIzNFx1QzJEQ1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN5bmNTZXJ2aWNlID0gdGhpcy52YXVsdFJvdXRlci5nZXRTeW5jU2VydmljZSh2YXVsdElkKTtcbiAgICAgIGlmICghc3luY1NlcnZpY2UpIHJldHVybjtcblxuICAgICAgLy8gXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzkxMVx1QzVEMFx1QjI5NCBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUJCMzRcdUMyRENcbiAgICAgIGlmIChzeW5jU2VydmljZS5pc1N5bmNpbmcpIHJldHVybjtcblxuICAgICAgLy8gXHVDNUQwXHVDRjU0IFx1QkMyOVx1QzlDMDogXHVDMTFDXHVCQzg0XHVDNUQwXHVDMTFDIFx1QkMxQlx1QzU0NCBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjhcdUQ1NUMgXHVEMzBDXHVDNzdDXHVDNzQwIG1vZGlmeSBcdUM3NzRcdUJDQTRcdUQyQjggXHVDMkE0XHVEMEI1XG4gICAgICBpZiAoc3luY1NlcnZpY2UuaXNTeW5jVXBkYXRlZFBhdGgoZmlsZS5wYXRoKSkgcmV0dXJuO1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaXNCaW5hcnlGaWxlKGZpbGUucGF0aCkpIHtcbiAgICAgICAgICAvLyBSRVEtQVRUQUNILTAwMjogXHVCQzE0XHVDNzc0XHVCMTA4XHVCOUFDIFx1RDMwQ1x1Qzc3QyBSRVNUIFx1QzVDNVx1Qjg1Q1x1QjREQ1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkQmluYXJ5KGZpbGUpO1xuICAgICAgICAgIGF3YWl0IHN5bmNTZXJ2aWNlLnVwbG9hZEJpbmFyeUZpbGUoZmlsZS5wYXRoLCBkYXRhKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBcdUQxNERcdUMyQTRcdUQyQjggXHVEMzBDXHVDNzdDIFx1Q0M5OFx1QjlBQ1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgY29uc3QgZmlsZUlkID0gdGhpcy5maWxlSWRUcmFja2VyLmdldEZpbGVJZChmaWxlLnBhdGgpO1xuXG4gICAgICAgIGlmICghZmlsZUlkKSB7XG4gICAgICAgICAgLy8gXHVDNzc0XHVCQkY4IFx1QjMwMFx1QUUzMCBcdUM5MTFcdUM3NzggZmlsZTpjcmVhdGVcdUFDMDAgXHVDNzg4XHVDNzNDXHVCQTc0IFx1QzkxMVx1QkNGNSBcdUMwRERcdUMxMzEgXHVCQzI5XHVDOUMwXG4gICAgICAgICAgaWYgKHN5bmNTZXJ2aWNlLmhhc1BlbmRpbmdTeW5jKGZpbGUucGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTU9ESUZZXSBza2lwcGVkIC0gaGFzUGVuZGluZ1N5bmMgZm9yICR7ZmlsZS5wYXRofWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzeW5jU2VydmljZS5zZW5kRmlsZUNyZWF0ZShmaWxlLnBhdGgsIGNvbnRlbnQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHN5bmNTZXJ2aWNlLnNlbmRGaWxlVXBkYXRlKGZpbGVJZCwgZmlsZS5wYXRoLCBjb250ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1toYW5kbGVGaWxlTW9kaWZ5XScsIHtcbiAgICAgICAgICBoYW5kbGVyOiAnaGFuZGxlRmlsZU1vZGlmeScsXG4gICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBcdUIyRThcdUM3N0MgXHVCQ0ZDXHVEMkI4IFx1QkFBOFx1QjREQyAoXHVEM0Y0XHVCQzMxKVxuICAgIGlmICh0aGlzLnN5bmNTZXJ2aWNlPy5pc1N5bmNpbmcpIHJldHVybjtcbiAgICBpZiAodGhpcy5zeW5jU2VydmljZT8uaXNTeW5jVXBkYXRlZFBhdGgoZmlsZS5wYXRoKSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChpc0JpbmFyeUZpbGUoZmlsZS5wYXRoKSkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZEJpbmFyeShmaWxlKTtcbiAgICAgICAgYXdhaXQgdGhpcy5zeW5jU2VydmljZT8udXBsb2FkQmluYXJ5RmlsZShmaWxlLnBhdGgsIGRhdGEpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgY29uc3QgZmlsZUlkID0gdGhpcy5maWxlSWRUcmFja2VyLmdldEZpbGVJZChmaWxlLnBhdGgpO1xuXG4gICAgICBpZiAoIWZpbGVJZCkge1xuICAgICAgICAvLyBcdUM3NzRcdUJCRjggXHVCMzAwXHVBRTMwIFx1QzkxMVx1Qzc3OCBmaWxlOmNyZWF0ZVx1QUMwMCBcdUM3ODhcdUM3M0NcdUJBNzQgXHVDOTExXHVCQ0Y1IFx1QzBERFx1QzEzMSBcdUJDMjlcdUM5QzBcbiAgICAgICAgaWYgKHRoaXMuc3luY1NlcnZpY2U/Lmhhc1BlbmRpbmdTeW5jKGZpbGUucGF0aCkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW01PRElGWS1MRUdBQ1ldIHNraXBwZWQgLSBoYXNQZW5kaW5nU3luYyBmb3IgJHtmaWxlLnBhdGh9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTU9ESUZZLUxFR0FDWV0gc2VuZGluZyBmaWxlOmNyZWF0ZSBmb3IgJHtmaWxlLnBhdGh9YCk7XG4gICAgICAgIHRoaXMuc3luY1NlcnZpY2U/LnNlbmRGaWxlQ3JlYXRlKGZpbGUucGF0aCwgY29udGVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zeW5jU2VydmljZT8uc2VuZEZpbGVVcGRhdGUoZmlsZUlkLCBmaWxlLnBhdGgsIGNvbnRlbnQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbaGFuZGxlRmlsZU1vZGlmeV0nLCB7XG4gICAgICAgIGhhbmRsZXI6ICdoYW5kbGVGaWxlTW9kaWZ5JyxcbiAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmaWxlIGRlbGV0ZSBldmVudCAoUkVRLUJGLTUwMSwgUkVRLUVILTQwMSlcbiAgICogVC0wMDY6IFZhdWx0Um91dGVyXHVCOTdDIFx1RDFCNVx1RDU1QyBcdUI3N0NcdUM2QjBcdUQzMDVcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsZURlbGV0ZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFQtMDA2OiBWYXVsdFJvdXRlciBcdUI3N0NcdUM2QjBcdUQzMDVcbiAgICBpZiAodGhpcy52YXVsdFJvdXRlcikge1xuICAgICAgY29uc3QgdmF1bHRJZCA9IHRoaXMudmF1bHRSb3V0ZXIucm91dGUoZmlsZS5wYXRoKTtcbiAgICAgIGlmICghdmF1bHRJZCkge1xuICAgICAgICAvLyBcdUI5RTRcdUQ1NTFcdUI0MThcdUM5QzAgXHVDNTRBXHVDNzQwIFx1RDNGNFx1QjM1NFx1QjI5NCBcdUJCMzRcdUMyRENcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzeW5jU2VydmljZSA9IHRoaXMudmF1bHRSb3V0ZXIuZ2V0U3luY1NlcnZpY2UodmF1bHRJZCk7XG4gICAgICBpZiAoIXN5bmNTZXJ2aWNlKSByZXR1cm47XG5cbiAgICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTFcdUM1RDBcdUIyOTQgXHVCNzdDXHVDNzc0XHVCRTBDIFx1QzJGMVx1RDA2QyBcdUM3NzRcdUJDQTRcdUQyQjggXHVCQjM0XHVDMkRDXG4gICAgICBpZiAoc3luY1NlcnZpY2UuaXNTeW5jaW5nKSByZXR1cm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZpbGVJZCA9IHRoaXMuZmlsZUlkVHJhY2tlci5nZXRGaWxlSWQoZmlsZS5wYXRoKTtcblxuICAgICAgICBpZiAoIWZpbGVJZCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgW0ZpbGVJZFRyYWNrZXJdIGZpbGVJZCBub3QgZm91bmQgZm9yIHBhdGg6ICR7ZmlsZS5wYXRofWApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN5bmNTZXJ2aWNlLnNlbmRGaWxlRGVsZXRlKGZpbGVJZCk7XG4gICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5yZW1vdmVGaWxlSWQoZmlsZS5wYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1toYW5kbGVGaWxlRGVsZXRlXScsIHtcbiAgICAgICAgICBoYW5kbGVyOiAnaGFuZGxlRmlsZURlbGV0ZScsXG4gICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBcdUIyRThcdUM3N0MgXHVCQ0ZDXHVEMkI4IFx1QkFBOFx1QjREQyAoXHVEM0Y0XHVCQzMxKVxuICAgIGlmICh0aGlzLnN5bmNTZXJ2aWNlPy5pc1N5bmNpbmcpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlSWQgPSB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKGZpbGUucGF0aCk7XG5cbiAgICAgIGlmICghZmlsZUlkKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgW0ZpbGVJZFRyYWNrZXJdIGZpbGVJZCBub3QgZm91bmQgZm9yIHBhdGg6ICR7ZmlsZS5wYXRofWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3luY1NlcnZpY2U/LnNlbmRGaWxlRGVsZXRlKGZpbGVJZCk7XG4gICAgICB0aGlzLmZpbGVJZFRyYWNrZXIucmVtb3ZlRmlsZUlkKGZpbGUucGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1toYW5kbGVGaWxlRGVsZXRlXScsIHtcbiAgICAgICAgaGFuZGxlcjogJ2hhbmRsZUZpbGVEZWxldGUnLFxuICAgICAgICBwYXRoOiBmaWxlLnBhdGgsXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGZpbGUgcmVuYW1lIGV2ZW50IChSRVEtQkYtNTAyLCBSRVEtRUgtNDAxKVxuICAgKiBULTAwNjogVmF1bHRSb3V0ZXJcdUI5N0MgXHVEMUI1XHVENTVDIFx1RDA2Q1x1Qjg1Q1x1QzJBNC1cdUJDRkNcdUQyQjggXHVDNzc0XHVCOTg0IFx1QkNDMFx1QUNCRCBcdUNDOThcdUI5QUNcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsZVJlbmFtZShmaWxlOiBURmlsZSwgb2xkUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gVC0wMDY6IFZhdWx0Um91dGVyIFx1Qjc3Q1x1QzZCMFx1RDMwNVxuICAgIGlmICh0aGlzLnZhdWx0Um91dGVyKSB7XG4gICAgICBjb25zdCBvbGRWYXVsdElkID0gdGhpcy52YXVsdFJvdXRlci5yb3V0ZShvbGRQYXRoKTtcbiAgICAgIGNvbnN0IG5ld1ZhdWx0SWQgPSB0aGlzLnZhdWx0Um91dGVyLnJvdXRlKGZpbGUucGF0aCk7XG5cbiAgICAgIC8vIFx1QUMxOVx1Qzc0MCBcdUJDRkNcdUQyQjggXHVCMEI0XHVDNUQwXHVDMTFDIFx1Qzc3NFx1Qjk4NCBcdUJDQzBcdUFDQkRcbiAgICAgIGlmIChvbGRWYXVsdElkICYmIG5ld1ZhdWx0SWQgJiYgb2xkVmF1bHRJZCA9PT0gbmV3VmF1bHRJZCkge1xuICAgICAgICBjb25zdCBzeW5jU2VydmljZSA9IHRoaXMudmF1bHRSb3V0ZXIuZ2V0U3luY1NlcnZpY2Uob2xkVmF1bHRJZCk7XG4gICAgICAgIGlmICghc3luY1NlcnZpY2UgfHwgc3luY1NlcnZpY2UuaXNTeW5jaW5nKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBmaWxlSWQgPSB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKG9sZFBhdGgpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbUkVOQU1FXSBvbGRQYXRoPSR7b2xkUGF0aH0gbmV3UGF0aD0ke2ZpbGUucGF0aH0gZmlsZUlkPSR7ZmlsZUlkID8/ICdudWxsJ31gKTtcblxuICAgICAgICAgIGlmICghZmlsZUlkKSB7XG4gICAgICAgICAgICBpZiAoIXN5bmNTZXJ2aWNlLnF1ZXVlUGVuZGluZ1JlbmFtZShvbGRQYXRoLCBmaWxlLnBhdGgpKSB7XG4gICAgICAgICAgICAgIC8vIHNlbmRGaWxlQ3JlYXRlXHVBQzAwIFx1QzU0NFx1QzlDMSBcdUQ2MzhcdUNEOUNcdUI0MThcdUM5QzAgXHVDNTRBXHVDNzQwIFx1QUNCRFx1QzZCMDogXHVDOUMwXHVDNUYwIFx1QjlGNVx1QzVEMCBcdUM4MDBcdUM3QTVcbiAgICAgICAgICAgICAgdGhpcy5kZWZlcnJlZFJlbmFtZXMuc2V0KG9sZFBhdGgsIGZpbGUucGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3luY1NlcnZpY2Uuc2VuZEZpbGVSZW5hbWUoZmlsZUlkLCBvbGRQYXRoLCBmaWxlLnBhdGgpO1xuICAgICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5yZW1vdmVGaWxlSWQob2xkUGF0aCk7XG4gICAgICAgICAgdGhpcy5maWxlSWRUcmFja2VyLnNldEZpbGVJZChmaWxlLnBhdGgsIGZpbGVJZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZUZpbGVSZW5hbWVdJywge1xuICAgICAgICAgICAgaGFuZGxlcjogJ2hhbmRsZUZpbGVSZW5hbWUnLFxuICAgICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1QjlFNFx1RDU1MVx1QjQxQyBcdUQzRjRcdUIzNTRcdUM1RDBcdUMxMUMgXHVCOUU0XHVENTUxXHVCNDE4XHVDOUMwIFx1QzU0QVx1Qzc0MCBcdUQzRjRcdUIzNTRcdUI4NUMgXHVDNzc0XHVCM0Q5IChcdUMwQURcdUM4MUNcdUI5Q0MpXG4gICAgICBpZiAob2xkVmF1bHRJZCAmJiAhbmV3VmF1bHRJZCkge1xuICAgICAgICBjb25zdCBzeW5jU2VydmljZSA9IHRoaXMudmF1bHRSb3V0ZXIuZ2V0U3luY1NlcnZpY2Uob2xkVmF1bHRJZCk7XG4gICAgICAgIGlmICghc3luY1NlcnZpY2UgfHwgc3luY1NlcnZpY2UuaXNTeW5jaW5nKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBmaWxlSWQgPSB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKG9sZFBhdGgpO1xuXG4gICAgICAgICAgaWYgKCFmaWxlSWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW0ZpbGVJZFRyYWNrZXJdIGZpbGVJZCBub3QgZm91bmQgZm9yIHBhdGg6ICR7b2xkUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzeW5jU2VydmljZS5zZW5kRmlsZURlbGV0ZShmaWxlSWQpO1xuICAgICAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5yZW1vdmVGaWxlSWQob2xkUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZUZpbGVSZW5hbWVdJywge1xuICAgICAgICAgICAgaGFuZGxlcjogJ2hhbmRsZUZpbGVSZW5hbWUnLFxuICAgICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1QjlFNFx1RDU1MVx1QjQxOFx1QzlDMCBcdUM1NEFcdUM3NDAgXHVEM0Y0XHVCMzU0XHVDNUQwXHVDMTFDIFx1QjlFNFx1RDU1MVx1QjQxQyBcdUQzRjRcdUIzNTRcdUI4NUMgXHVDNzc0XHVCM0Q5IChcdUMwRERcdUMxMzFcdUI5Q0MpXG4gICAgICBpZiAoIW9sZFZhdWx0SWQgJiYgbmV3VmF1bHRJZCkge1xuICAgICAgICBjb25zdCBzeW5jU2VydmljZSA9IHRoaXMudmF1bHRSb3V0ZXIuZ2V0U3luY1NlcnZpY2UobmV3VmF1bHRJZCk7XG4gICAgICAgIGlmICghc3luY1NlcnZpY2UgfHwgc3luY1NlcnZpY2UuaXNTeW5jaW5nKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgICBzeW5jU2VydmljZS5zZW5kRmlsZUNyZWF0ZShmaWxlLnBhdGgsIGNvbnRlbnQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1toYW5kbGVGaWxlUmVuYW1lXScsIHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICdoYW5kbGVGaWxlUmVuYW1lJyxcbiAgICAgICAgICAgIHBhdGg6IGZpbGUucGF0aCxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdUIyRTRcdUI5NzggXHVCQ0ZDXHVEMkI4IFx1QUMwNCBcdUM3NzRcdUIzRDkgKG9sZCBcdUJDRkNcdUQyQjhcdUM1RDBcdUMxMUMgXHVDMEFEXHVDODFDICsgbmV3IFx1QkNGQ1x1RDJCOFx1QzVEMCBcdUMwRERcdUMxMzEpXG4gICAgICBpZiAob2xkVmF1bHRJZCAmJiBuZXdWYXVsdElkICYmIG9sZFZhdWx0SWQgIT09IG5ld1ZhdWx0SWQpIHtcbiAgICAgICAgY29uc3Qgb2xkU3luY1NlcnZpY2UgPSB0aGlzLnZhdWx0Um91dGVyLmdldFN5bmNTZXJ2aWNlKG9sZFZhdWx0SWQpO1xuICAgICAgICBjb25zdCBuZXdTeW5jU2VydmljZSA9IHRoaXMudmF1bHRSb3V0ZXIuZ2V0U3luY1NlcnZpY2UobmV3VmF1bHRJZCk7XG5cbiAgICAgICAgaWYgKCFvbGRTeW5jU2VydmljZSB8fCAhbmV3U3luY1NlcnZpY2UpIHJldHVybjtcbiAgICAgICAgaWYgKG9sZFN5bmNTZXJ2aWNlLmlzU3luY2luZyB8fCBuZXdTeW5jU2VydmljZS5pc1N5bmNpbmcpIHJldHVybjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGZpbGVJZCA9IHRoaXMuZmlsZUlkVHJhY2tlci5nZXRGaWxlSWQob2xkUGF0aCk7XG5cbiAgICAgICAgICBpZiAoIWZpbGVJZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbRmlsZUlkVHJhY2tlcl0gZmlsZUlkIG5vdCBmb3VuZCBmb3IgcGF0aDogJHtvbGRQYXRofWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG9sZCBcdUJDRkNcdUQyQjhcdUM1RDBcdUMxMUMgXHVDMEFEXHVDODFDXG4gICAgICAgICAgb2xkU3luY1NlcnZpY2Uuc2VuZEZpbGVEZWxldGUoZmlsZUlkKTtcbiAgICAgICAgICB0aGlzLmZpbGVJZFRyYWNrZXIucmVtb3ZlRmlsZUlkKG9sZFBhdGgpO1xuXG4gICAgICAgICAgLy8gbmV3IFx1QkNGQ1x1RDJCOFx1QzVEMCBcdUMwRERcdUMxMzFcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgICBuZXdTeW5jU2VydmljZS5zZW5kRmlsZUNyZWF0ZShmaWxlLnBhdGgsIGNvbnRlbnQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1toYW5kbGVGaWxlUmVuYW1lXScsIHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICdoYW5kbGVGaWxlUmVuYW1lJyxcbiAgICAgICAgICAgIHBhdGg6IGZpbGUucGF0aCxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBcdUI0NTggXHVCMkU0IFx1QjlFNFx1RDU1MVx1QjQxOFx1QzlDMCBcdUM1NEFcdUM3NDAgXHVEM0Y0XHVCMzU0XHVCMjk0IFx1QkIzNFx1QzJEQ1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBcdUIyRThcdUM3N0MgXHVCQ0ZDXHVEMkI4IFx1QkFBOFx1QjREQyAoXHVEM0Y0XHVCQzMxKVxuICAgIGlmICh0aGlzLnN5bmNTZXJ2aWNlPy5pc1N5bmNpbmcpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlSWQgPSB0aGlzLmZpbGVJZFRyYWNrZXIuZ2V0RmlsZUlkKG9sZFBhdGgpO1xuXG4gICAgICBpZiAoIWZpbGVJZCkge1xuICAgICAgICBpZiAodGhpcy5zeW5jU2VydmljZSAmJiAhdGhpcy5zeW5jU2VydmljZS5xdWV1ZVBlbmRpbmdSZW5hbWUob2xkUGF0aCwgZmlsZS5wYXRoKSkge1xuICAgICAgICAgIHRoaXMuZGVmZXJyZWRSZW5hbWVzLnNldChvbGRQYXRoLCBmaWxlLnBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zeW5jU2VydmljZT8uc2VuZEZpbGVSZW5hbWUoZmlsZUlkLCBvbGRQYXRoLCBmaWxlLnBhdGgpO1xuICAgICAgdGhpcy5maWxlSWRUcmFja2VyLnJlbW92ZUZpbGVJZChvbGRQYXRoKTtcbiAgICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zZXRGaWxlSWQoZmlsZS5wYXRoLCBmaWxlSWQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbaGFuZGxlRmlsZVJlbmFtZV0nLCB7XG4gICAgICAgIGhhbmRsZXI6ICdoYW5kbGVGaWxlUmVuYW1lJyxcbiAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1Qjg1Q1x1Q0VFQyBcdUQzMENcdUM3N0MgXHVCQUE5XHVCODVEIFx1QzIxOFx1QzlEMSAoUkVRLUZDLTEwMSlcbiAgICogUkVRLUFUVEFDSC0wMDE6IFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0MgXHVEM0VDXHVENTY4LCBcdUQ2NTRcdUM3NzRcdUQyQjhcdUI5QUNcdUMyQTRcdUQyQjggXHVBRTMwXHVCQzE4IFx1RDU0NFx1RDEzMFx1QjlDMVxuICAgKiBcdUQ1NzRcdUMyREMgXHVBQ0M0XHVDMEIwIFx1QkMwRiBza2lwcGVkUGF0aHMgXHVENTQ0XHVEMTMwXHVCOUMxIFx1RDNFQ1x1RDU2OFxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBjb2xsZWN0TG9jYWxGaWxlcygpOiBQcm9taXNlPEFycmF5PHsgcGF0aDogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfT4+IHtcbiAgICBjb25zdCBhbGxGaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCk7XG5cbiAgICAvLyBSRVEtQVRUQUNILTAwMTogXHVENUM4XHVDNkE5XHVCNDFDIFx1RDY1NVx1QzdBNVx1Qzc5MFx1QjlDQyBcdUQ1NDRcdUQxMzBcdUI5QzEgKC5tZCArIFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQylcbiAgICBjb25zdCBlbGlnaWJsZSA9IGFsbEZpbGVzLmZpbHRlcihcbiAgICAgIGYgPT4gaXNBbGxvd2VkRXh0ZW5zaW9uKGYucGF0aCkgJiYgIXRoaXMuaXNTa2lwcGVkKGYucGF0aCksXG4gICAgKTtcblxuICAgIGNvbnN0IHNldHRsZWQgPSBhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoXG4gICAgICBlbGlnaWJsZS5tYXAoYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudE10aW1lID0gZmlsZS5zdGF0Lm10aW1lO1xuXG4gICAgICAgIC8vIFNQRUMtU1lOQy0wMDY6IG10aW1lIFx1Q0U5MFx1QzJGMVxuICAgICAgICBjb25zdCBjYWNoZWQgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RmlsZU1ldGEodGhpcy5zZXR0aW5ncy52YXVsdElkLCBmaWxlLnBhdGgpO1xuICAgICAgICBpZiAoY2FjaGVkICYmIGNhY2hlZC5tdGltZSA9PT0gY3VycmVudE10aW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcGF0aDogZmlsZS5wYXRoLCBoYXNoOiBjYWNoZWQuaGFzaCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gXHVEMzBDXHVDNzdDIFx1Qzc3RFx1QUUzMCBcdUJDMEYgXHVENTc0XHVDMkRDIFx1QUNDNFx1QzBCMFxuICAgICAgICBsZXQgaGFzaDogc3RyaW5nO1xuICAgICAgICBpZiAoaXNCaW5hcnlGaWxlKGZpbGUucGF0aCkpIHtcbiAgICAgICAgICAvLyBSRVEtQVRUQUNILTAwMTogXHVCQzE0XHVDNzc0XHVCMTA4XHVCOUFDIFx1RDMwQ1x1Qzc3QyBcdUQ1NzRcdUMyREMgXHVBQ0M0XHVDMEIwXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWRCaW5hcnkoZmlsZSk7XG4gICAgICAgICAgaGFzaCA9IGF3YWl0IGhhc2hCaW5hcnlDb250ZW50KGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1RDE0RFx1QzJBNFx1RDJCOCBcdUQzMENcdUM3N0MgXHVENTc0XHVDMkRDIFx1QUNDNFx1QzBCMFxuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICAgIGhhc2ggPSBhd2FpdCBoYXNoQ29udGVudChjb250ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNQRUMtU1lOQy0wMDY6IFx1QUNDNFx1QzBCMFx1QjQxQyBcdUQ1NzRcdUMyRENcdUI5N0MgXHVDRTkwXHVDMkRDXHVDNUQwIFx1QzgwMFx1QzdBNVxuICAgICAgICBhd2FpdCB0aGlzLnN0b3JhZ2Uuc2V0RmlsZU1ldGEodGhpcy5zZXR0aW5ncy52YXVsdElkLCBmaWxlLnBhdGgsIHtcbiAgICAgICAgICBmaWxlSWQ6ICcnLCAvLyBjb2xsZWN0TG9jYWxGaWxlc1x1QzVEMFx1QzExQ1x1QjI5NCBmaWxlSWRcdUI5N0MgXHVCQUE4XHVCOTg0XG4gICAgICAgICAgaGFzaCxcbiAgICAgICAgICBtdGltZTogY3VycmVudE10aW1lLFxuICAgICAgICAgIGxhc3RTeW5jVGltZTogMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcGF0aDogZmlsZS5wYXRoLCBoYXNoIH07XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHNldHRsZWRcbiAgICAgIC5maWx0ZXIoKHIpOiByIGlzIFByb21pc2VGdWxmaWxsZWRSZXN1bHQ8eyBwYXRoOiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9PiA9PiByLnN0YXR1cyA9PT0gJ2Z1bGZpbGxlZCcpXG4gICAgICAubWFwKHIgPT4gci52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdHVzQmFyIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOCAoUkVRLVVJLTAwMSwgUkVRLVVJLTAwMilcbiAgICovXG4gIHByaXZhdGUgc3RhdHVzQmFySXRlbTogYW55ID0gbnVsbDtcblxuICBwcml2YXRlIHVwZGF0ZVN0YXR1c0JhcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc3RhdHVzQmFySXRlbSkge1xuICAgICAgdGhpcy5zdGF0dXNCYXJJdGVtID0gdGhpcy5hZGRTdGF0dXNCYXJJdGVtKCk7XG4gICAgfVxuICAgIHRoaXMuc3RhdHVzQmFySXRlbS5zZXRUZXh0KG1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXR1c0JhciBcdUQwNzRcdUI5QUNcdUM1QjRcbiAgICovXG4gIHByaXZhdGUgY2xlYXJTdGF0dXNCYXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdHVzQmFySXRlbSkge1xuICAgICAgdGhpcy5zdGF0dXNCYXJJdGVtLnNldFRleHQoJycpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTUEVDLVBMVUdJTi1TVEFUVVMtMDAxOiBcdUM5QzBcdUMxOERcdUM4MDEgXHVDMEMxXHVEMERDIFx1RDQ1Q1x1QzJEQ1x1QzkwNCBcdUNEMDhcdUFFMzBcdUQ2NTQgKFJFUS1TVEFUVVMtMDAxKVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplUGVyc2lzdGVudFN0YXR1c0JhcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMudmF1bHRSb3V0ZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gXHVDMEMxXHVEMERDIFx1RDQ1Q1x1QzJEQ1x1QzkwNCBcdUM1NDRcdUM3NzRcdUQxNUMgXHVDMEREXHVDMTMxIChcdUQxNENcdUMyQTRcdUQyQjggXHVENjU4XHVBQ0JEXHVDNUQwXHVDMTFDXHVCMjk0IGFkZFN0YXR1c0Jhckl0ZW1cdUM3NzQgXHVDNUM2XHVDNzQ0IFx1QzIxOCBcdUM3ODhcdUM3NEMpXG4gICAgICB0aGlzLnBlcnNpc3RlbnRTdGF0dXNCYXJJdGVtID0gdGhpcy5hZGRTdGF0dXNCYXJJdGVtKCk7XG4gICAgICB0aGlzLnBlcnNpc3RlbnRTdGF0dXNCYXJJdGVtLnNldFRleHQoJ3ZTeW5jOiBcdUM2MjRcdUQ1MDRcdUI3N0NcdUM3NzgnKTtcblxuICAgICAgLy8gUkVRLVNUQVRVUy0wMDI6IFx1QzBDMVx1RDBEQyBcdUJDQzBcdUFDQkQgXHVCOUFDXHVDMkE0XHVCMTA4IFx1QjRGMVx1Qjg1RFxuICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSB0aGlzLnZhdWx0Um91dGVyLm9uU3RhdGVDaGFuZ2UoKHN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlUGVyc2lzdGVudFN0YXR1c0JhcihzdGF0ZSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gXHVEMDc0XHVCOUIwXHVDNUM1IFx1QzJEQyBcdUFENkNcdUIzQzUgXHVENTc0XHVDODFDXHVCOTdDIFx1QzcwNFx1RDU3NCBcdUQwNzRcdUI3OThcdUMyQTQgXHVENTQ0XHVCNERDXHVDNUQwIFx1QzgwMFx1QzdBNVxuICAgICAgdGhpcy5zdGF0ZUNoYW5nZVVuc3Vic2NyaWJlID0gdW5zdWJzY3JpYmU7XG5cbiAgICAgIC8vIFJFUS1TVEFUVVMtMDA1OiBcdUQwNzRcdUI5QUQgXHVDNzc0XHVCQ0E0XHVEMkI4XHVCODVDIFZTeW5jIFx1QzEyNFx1QzgxNSBcdUQwRUQgXHVDNUY0XHVBRTMwXG4gICAgICB0aGlzLnBlcnNpc3RlbnRTdGF0dXNCYXJJdGVtLm9uQ2xpY2tFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMub3BlblZTeW5jU2V0dGluZ3MoKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdUNEMDhcdUFFMzAgXHVDMEMxXHVEMERDIFx1RDQ1Q1x1QzJEQ1xuICAgICAgY29uc3QgaW5pdGlhbFN0YXRlID0gdGhpcy52YXVsdFJvdXRlci5nZXRBZ2dyZWdhdGVTdGF0ZSgpO1xuICAgICAgdGhpcy51cGRhdGVQZXJzaXN0ZW50U3RhdHVzQmFyKGluaXRpYWxTdGF0ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFx1RDE0Q1x1QzJBNFx1RDJCOCBcdUQ2NThcdUFDQkRcdUM1RDBcdUMxMUMgYWRkU3RhdHVzQmFySXRlbVx1Qzc3NCBcdUM1QzZcdUIyOTQgXHVBQ0JEXHVDNkIwIFx1QkIzNFx1QzJEQ1xuICAgICAgY29uc29sZS5kZWJ1ZygnW1ZTeW5jXSBcdUM5QzBcdUMxOERcdUM4MDEgXHVDMEMxXHVEMERDIFx1RDQ1Q1x1QzJEQ1x1QzkwNCBcdUNEMDhcdUFFMzBcdUQ2NTQgXHVDMkU0XHVEMzI4IChcdUQxNENcdUMyQTRcdUQyQjggXHVENjU4XHVBQ0JEXHVDNzdDIFx1QzIxOCBcdUM3ODhcdUM3NEMpOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU1BFQy1QTFVHSU4tU1RBVFVTLTAwMTogXHVDOUMwXHVDMThEXHVDODAxIFx1QzBDMVx1RDBEQyBcdUQ0NUNcdUMyRENcdUM5MDQgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IChSRVEtU1RBVFVTLTAwMiwgUkVRLVNUQVRVUy0wMDMsIFJFUS1TVEFUVVMtMDA0KVxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVQZXJzaXN0ZW50U3RhdHVzQmFyKHN0YXRlOiB7IHN0YXRlOiBzdHJpbmc7IGNvbm5lY3RlZDogbnVtYmVyOyB0b3RhbDogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucGVyc2lzdGVudFN0YXR1c0Jhckl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc3RhdHVzVGV4dCA9ICcnO1xuXG4gICAgc3dpdGNoIChzdGF0ZS5zdGF0ZSkge1xuICAgICAgY2FzZSAnY29ubmVjdGVkJzpcbiAgICAgICAgaWYgKHN0YXRlLmNvbm5lY3RlZCA9PT0gc3RhdGUudG90YWwpIHtcbiAgICAgICAgICBzdGF0dXNUZXh0ID0gJ3ZTeW5jOiBcdUM1RjBcdUFDQjBcdUI0MjgnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXR1c1RleHQgPSBgdlN5bmM6IFx1QzVGMFx1QUNCMFx1QjQyOCAoJHtzdGF0ZS5jb25uZWN0ZWR9LyR7c3RhdGUudG90YWx9KWA7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzeW5jaW5nJzpcbiAgICAgICAgc3RhdHVzVGV4dCA9ICd2U3luYzogXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzkxMS4uLic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2ZmbGluZSc6XG4gICAgICAgIHN0YXR1c1RleHQgPSAndlN5bmM6IFx1QzYyNFx1RDUwNFx1Qjc3Q1x1Qzc3OCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICBzdGF0dXNUZXh0ID0gJ3ZTeW5jOiBcdUM2MjRcdUI5NTgnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BhdXNlZCc6XG4gICAgICAgIHN0YXR1c1RleHQgPSAndlN5bmM6IFx1Qzc3Q1x1QzJEQ1x1QzkxMVx1QzlDMCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVjb25uZWN0aW5nJzpcbiAgICAgICAgc3RhdHVzVGV4dCA9ICd2U3luYzogXHVDN0FDXHVDNUYwXHVBQ0IwIFx1QzkxMS4uLic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3RhdHVzVGV4dCA9ICd2U3luYzogXHVDNTRDIFx1QzIxOCBcdUM1QzZcdUM3NEMnO1xuICAgIH1cblxuICAgIHRoaXMucGVyc2lzdGVudFN0YXR1c0Jhckl0ZW0uc2V0VGV4dChzdGF0dXNUZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTUEVDLVBMVUdJTi1TVEFUVVMtMDAxIFJFUS1TVEFUVVMtMDA1OiBWU3luYyBcdUMxMjRcdUM4MTUgXHVEMEVEIFx1QzVGNFx1QUUzMFxuICAgKi9cbiAgcHJpdmF0ZSBvcGVuVlN5bmNTZXR0aW5ncygpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgLy8gT2JzaWRpYW4gQVBJXHVCODVDIFx1QzEyNFx1QzgxNSBcdUQwRUQgXHVDNUY0XHVBRTMwIChcdUQwQzBcdUM3ODUgXHVCMkU4XHVDNUI4IFx1QzBBQ1x1QzZBOSAtIE9ic2lkaWFuIEFQSSBcdUQ2NTVcdUM3QTUpXG4gICAgICAodGhpcy5hcHAgYXMgYW55KS5zZXR0aW5nLm9wZW4oKTtcbiAgICAgIC8vIFZTeW5jIFx1RDBFRFx1QzczQ1x1Qjg1QyBcdUM3OTBcdUIzRDkgXHVDNzc0XHVCM0Q5IFx1QzJEQ1x1QjNDNFxuICAgICAgKHRoaXMuYXBwIGFzIGFueSkuc2V0dGluZz8ub3BlblRhYkJ5SWQoJ3ZzeW5jLXNldHRpbmdzJyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWU3luY10gXHVDMTI0XHVDODE1IFx1RDBFRCBcdUM1RjRcdUFFMzAgXHVDMkU0XHVEMzI4OicsIGVycm9yKTtcbiAgICAgIC8vIFx1QzJFNFx1RDMyOFx1RDU3NFx1QjNDNCBcdUMwQUNcdUM2QTlcdUM3OTAgXHVBQ0JEXHVENUQ4XHVDNUQwIFx1QzYwMVx1RDVBNSBcdUM1QzZcdUM3NEMgKFx1QjJFOFx1QzIxQ1x1RDc4OCBcdUM1NDRcdUJCMzQgXHVCM0Q5XHVDNzkxIFx1QzU0OCBcdUQ1NjgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHBhdGggc2hvdWxkIGJlIHNraXBwZWRcbiAgICovXG4gIHByaXZhdGUgaXNTa2lwcGVkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5zZXR0aW5ncy5hdXRvU3luYykge1xuICAgICAgcmV0dXJuIHRydWU7IC8vIFNraXAgYWxsIGlmIGF1dG9TeW5jIGlzIGRpc2FibGVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0dGluZ3Muc2tpcHBlZFBhdGhzLnNvbWUocGF0dGVybiA9PiB7XG4gICAgICBpZiAocGF0dGVybi5zdGFydHNXaXRoKCcqJykpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguZW5kc1dpdGgocGF0dGVybi5zbGljZSgxKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGF0aC5zdGFydHNXaXRoKHBhdHRlcm4pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFudXAgcmVzb3VyY2VzIG9uIHVubG9hZCAoUkVRLVVMLTIwMSwgUkVRLVVMLTIwMilcbiAgICogVC0wMDQ6IFZhdWx0Um91dGVyIFx1QzlDMFx1QzZEMFxuICAgKi9cbiAgY2xlYW51cCgpOiB2b2lkIHtcbiAgICAvLyBSRVEtVUwtMjAxOiBmaWxlSWQgXHVCOUU0XHVENTUxIFx1QzgwMFx1QzdBNSAoZmlyZS1hbmQtZm9yZ2V0KVxuICAgIHRoaXMuZmlsZUlkVHJhY2tlci5zYXZlTWFwcGluZ3MoKS5jYXRjaChlID0+XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2xlYW51cF0gc2F2ZU1hcHBpbmdzIFx1QzJFNFx1RDMyODonLCBlKSxcbiAgICApO1xuXG4gICAgLy8gU1BFQy1QTFVHSU4tU1RBVFVTLTAwMTogXHVDOUMwXHVDMThEXHVDODAxIFx1QzBDMVx1RDBEQyBcdUQ0NUNcdUMyRENcdUM5MDQgXHVDODE1XHVCOUFDXG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlQ2hhbmdlVW5zdWJzY3JpYmUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZUNoYW5nZVVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHRoaXMuc3RhdGVDaGFuZ2VVbnN1YnNjcmliZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcignW2NsZWFudXBdIFx1QzBDMVx1RDBEQyBcdUJDQzBcdUFDQkQgXHVBRDZDXHVCM0M1IFx1RDU3NFx1QzgxQyBcdUMyRTRcdUQzMjg6JywgZSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5wZXJzaXN0ZW50U3RhdHVzQmFySXRlbSkge1xuICAgICAgICB0aGlzLnBlcnNpc3RlbnRTdGF0dXNCYXJJdGVtLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnBlcnNpc3RlbnRTdGF0dXNCYXJJdGVtID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2xlYW51cF0gXHVDMEMxXHVEMERDIFx1RDQ1Q1x1QzJEQ1x1QzkwNCBcdUM4MUNcdUFDNzAgXHVDMkU0XHVEMzI4OicsIGUpO1xuICAgIH1cblxuICAgIC8vIFQtMDA0OiBWYXVsdFJvdXRlciBcdUM4MTVcdUI5QUMgKFx1QkFBOFx1QjRFMCBTeW5jU2VydmljZSBcdUM1RjBcdUFDQjAgXHVENTc0XHVDODFDKVxuICAgIGlmICh0aGlzLnZhdWx0Um91dGVyKSB7XG4gICAgICB0aGlzLnZhdWx0Um91dGVyLmRpc2Nvbm5lY3RBbGwoKTtcbiAgICAgIHRoaXMudmF1bHRSb3V0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBTeW5jU2VydmljZSBcdUM4MTVcdUI5QUMgKFx1Qzc3NFx1QzgwNCBcdUJDODRcdUM4MDQgXHVENjM4XHVENjU4XHVDMTMxKVxuICAgIGlmICh0aGlzLnN5bmNTZXJ2aWNlKSB7XG4gICAgICAvLyBSRVEtVUwtMjAxOiBcdUM2MjRcdUQ1MDRcdUI3N0NcdUM3NzggXHVEMDUwIFx1Qzk4OVx1QzJEQyBcdUQ1MENcdUI3RUNcdUMyREMgXHVDMkRDXHVCM0M0XG4gICAgICB0aGlzLnN5bmNTZXJ2aWNlLmZsdXNoQW5kRGlzY29ubmVjdCgyMDAwKS5jYXRjaChlID0+XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tjbGVhbnVwXSBmbHVzaEFuZERpc2Nvbm5lY3QgXHVDMkU0XHVEMzI4OicsIGUpLFxuICAgICAgKTtcblxuICAgICAgLy8gUkVRLVVMLTIwMTogZGVib3VuY2UgXHVEMEMwXHVDNzc0XHVCQTM4IFx1QzgxNVx1QjlBQ1xuICAgICAgdGhpcy5zeW5jU2VydmljZS5jbGVhbnVwVGltZXJzKCk7XG4gICAgICB0aGlzLnN5bmNTZXJ2aWNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBcdUFFMzBcdUM4NzQgXHVDODE1XHVCOUFDIFx1Qjg1Q1x1QzlDMVxuICAgIHRoaXMuZXZlbnRSZWZzLmZvckVhY2gocmVmID0+IHRoaXMuYXBwLnZhdWx0Lm9mZnJlZihyZWYpKTtcbiAgICB0aGlzLmV2ZW50UmVmcyA9IFtdO1xuICAgIHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzID0geyBzZXJ2ZXJVcmw6ICcnLCB2YXVsdElkOiAnJywgYXBpS2V5OiAnJyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgc2V0dGluZ3MgZnJvbSBzdG9yYWdlXG4gICAqL1xuICBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZGF0YSA9IChhd2FpdCB0aGlzLmxvYWREYXRhKCkpIHx8IHt9O1xuICAgIGNvbnN0IHsgc2V0dGluZ3M6IF9uZXN0ZWQsIC4uLnNhdmVkIH0gPSBkYXRhLnNldHRpbmdzIHx8IGRhdGE7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIHNhdmVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIHNldHRpbmdzIHRvIHN0b3JhZ2UgKFJFUS1MQy00MDEpXG4gICAqIFx1QzVGMFx1QUNCMCBcdUMxMjRcdUM4MTUgXHVCQ0MwXHVBQ0JEIFx1QzJEQyBcdUM3QUNcdUM1RjBcdUFDQjAgXHVEMkI4XHVCOUFDXHVBQzcwXG4gICAqIFQtMDA0OiB2YXVsdE1hcHBpbmdzIFx1QkNDMFx1QUNCRCBcdUFDMTBcdUM5QzBcbiAgICovXG4gIGFzeW5jIHNhdmVTZXR0aW5ncyhvcHRpb25zPzogeyBza2lwUmVjb25uZWN0PzogYm9vbGVhbiB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyBzZXR0aW5nczogXywgLi4uY2xlYW4gfSA9IHRoaXMuc2V0dGluZ3MgYXMgYW55O1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEoeyBzZXR0aW5nczogY2xlYW4gfSk7XG5cbiAgICBpZiAob3B0aW9ucz8uc2tpcFJlY29ubmVjdCkgcmV0dXJuO1xuXG4gICAgLy8gVC0wMDQ6IHZhdWx0TWFwcGluZ3MgXHVCQ0MwXHVBQ0JEIFx1QUMxMFx1QzlDMFxuICAgIGNvbnN0IGN1cnJlbnRNYXBwaW5nc0pzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLnNldHRpbmdzLnZhdWx0TWFwcGluZ3MpO1xuICAgIGNvbnN0IGxhc3RNYXBwaW5nc0pzb24gPSBKU09OLnN0cmluZ2lmeShcbiAgICAgIHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzLnZhdWx0SWRcbiAgICAgICAgPyBbeyBmb2xkZXI6ICcnLCB2YXVsdElkOiB0aGlzLmxhc3RDb25uZWN0ZWRTZXR0aW5ncy52YXVsdElkLCBhcGlLZXk6IHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzLmFwaUtleSwgZW5hYmxlZDogdHJ1ZSB9XVxuICAgICAgICA6IFtdXG4gICAgKTtcblxuICAgIC8vIFJFUS1MQy00MDE6IFx1RDY1Q1x1QzEzMSBcdUM1RjBcdUFDQjAgXHVDMTI0XHVDODE1XHVBQ0ZDIFx1RDYwNFx1QzdBQyBcdUMxMjRcdUM4MTUgXHVCRTQ0XHVBRDUwXG4gICAgY29uc3QgY29ubmVjdGlvbkNoYW5nZWQgPVxuICAgICAgdGhpcy5zZXR0aW5ncy5zZXJ2ZXJVcmwgIT09IHRoaXMubGFzdENvbm5lY3RlZFNldHRpbmdzLnNlcnZlclVybCB8fFxuICAgICAgY3VycmVudE1hcHBpbmdzSnNvbiAhPT0gbGFzdE1hcHBpbmdzSnNvbjtcblxuICAgIGlmIChjb25uZWN0aW9uQ2hhbmdlZCkge1xuICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgICB0aGlzLmluaXRpYWxpemVTeW5jKCkuY2F0Y2goZSA9PlxuICAgICAgICBjb25zb2xlLmVycm9yKCdbc2F2ZVNldHRpbmdzXSBpbml0aWFsaXplU3luYyBcdUMyRTRcdUQzMjg6JywgZSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBULTAxNjogXHVCQkY4XHVENTc0XHVBQ0IwIFx1Q0RBOVx1QjNDQyBcdUJDRjRcdUFFMzAgXHVCQTg1XHVCODM5IFx1RDU3OFx1QjRFNFx1QjdFQ1xuICAgKiBSRVNUIEFQSVx1Qjk3QyBcdUQxQjVcdUQ1NzQgXHVCQkY4XHVENTc0XHVBQ0IwIFx1Q0RBOVx1QjNDQyBcdUJBQTlcdUI4NURcdUM3NDQgXHVBQzAwXHVDODM4XHVDNjQwXHVDMTFDIFN5bmNSZXNvbHV0aW9uTW9kYWwgXHVENDVDXHVDMkRDXG4gICAqL1xuICBhc3luYyBoYW5kbGVWaWV3VW5yZXNvbHZlZENvbmZsaWN0cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jb25mbGljdExpc3RNb2RhbE9wZW4pIHtcbiAgICAgIG5ldyBOb3RpY2UoJ1x1Qzc3NFx1QkJGOCBcdUNEQTlcdUIzQ0MgXHVENTc0XHVBQ0IwIFx1Q0MzRFx1Qzc3NCBcdUM1RjRcdUI4MjQgXHVDNzg4XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBiYXNlVXJsID0gdGhpcy5zZXR0aW5ncy5zZXJ2ZXJVcmwucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgICAgIGAke2Jhc2VVcmx9L3YxLyR7dGhpcy5zZXR0aW5ncy52YXVsdElkfS9jb25mbGljdHNgLFxuICAgICAgICB7XG4gICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLnNldHRpbmdzLmFwaUtleX1gIH0sXG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyB7IGNvbmZsaWN0czogQXJyYXk8eyBjb25mbGljdElkOiBzdHJpbmc7IHBhdGg6IHN0cmluZyB9PiB9O1xuXG4gICAgICBpZiAoZGF0YS5jb25mbGljdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1QkJGOFx1RDU3NFx1QUNCMCBcdUNEQTlcdUIzQ0NcdUM3NzQgXHVDNUM2XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFx1Q0RBOVx1QjNDQyBcdUMwQzFcdUMxMzggXHVDODE1XHVCQ0Y0IFx1QUMwMFx1QzgzOFx1QzYyNFx1QUUzMFxuICAgICAgY29uc3QgY29uZmxpY3RzV2l0aENvbnRlbnQgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgZGF0YS5jb25mbGljdHMubWFwKGFzeW5jIChjb25mbGljdCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkZXRhaWxSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgICAgICAgICAgICBgJHtiYXNlVXJsfS92MS8ke3RoaXMuc2V0dGluZ3MudmF1bHRJZH0vY29uZmxpY3RzLyR7Y29uZmxpY3QuY29uZmxpY3RJZH1gLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLnNldHRpbmdzLmFwaUtleX1gIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoZGV0YWlsUmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgY29uc3QgZGV0YWlsID0gYXdhaXQgZGV0YWlsUmVzcG9uc2UuanNvbigpIGFzIHtcbiAgICAgICAgICAgICAgICBjbGllbnRDb250ZW50OiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgc2VydmVyQ29udGVudDogc3RyaW5nO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29uZmxpY3RJZDogY29uZmxpY3QuY29uZmxpY3RJZCxcbiAgICAgICAgICAgICAgICBwYXRoOiBjb25mbGljdC5wYXRoLFxuICAgICAgICAgICAgICAgIGxvY2FsU2l6ZTogZGV0YWlsLmNsaWVudENvbnRlbnQubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNlcnZlclNpemU6IGRldGFpbC5zZXJ2ZXJDb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZXJ2ZXJDb250ZW50OiBkZXRhaWwuc2VydmVyQ29udGVudCxcbiAgICAgICAgICAgICAgICBsb2NhbENvbnRlbnQ6IGRldGFpbC5jbGllbnRDb250ZW50LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmVyc2lvbjogJ3NlcnZlcicgYXMgY29uc3QsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtoYW5kbGVWaWV3VW5yZXNvbHZlZENvbmZsaWN0c10gXHVDREE5XHVCM0NDIFx1QzBDMVx1QzEzOCBcdUFDMDBcdUM4MzhcdUM2MjRcdUFFMzAgXHVDMkU0XHVEMzI4OiAke2NvbmZsaWN0LmNvbmZsaWN0SWR9YCwgZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFx1QzJFNFx1RDMyOCBcdUMyREMgXHVBRTMwXHVCQ0Y4XHVBQzEyIFx1QkMxOFx1RDY1OFxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb25mbGljdElkOiBjb25mbGljdC5jb25mbGljdElkLFxuICAgICAgICAgICAgcGF0aDogY29uZmxpY3QucGF0aCxcbiAgICAgICAgICAgIGxvY2FsU2l6ZTogMCxcbiAgICAgICAgICAgIHNlcnZlclNpemU6IDAsXG4gICAgICAgICAgICBzZXJ2ZXJDb250ZW50OiAnJyxcbiAgICAgICAgICAgIGxvY2FsQ29udGVudDogJycsXG4gICAgICAgICAgICBzZWxlY3RlZFZlcnNpb246ICdzZXJ2ZXInIGFzIGNvbnN0LFxuICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgICAgLy8gU3luY1Jlc29sdXRpb25Nb2RhbCBcdUM1RjRcdUFFMzBcbiAgICAgIHRoaXMub3BlbkNvbmZsaWN0TGlzdE1vZGFsKGNvbmZsaWN0c1dpdGhDb250ZW50KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW2hhbmRsZVZpZXdVbnJlc29sdmVkQ29uZmxpY3RzXSBcdUNEQTlcdUIzQ0MgXHVCQUE5XHVCODVEIFx1QUMwMFx1QzgzOFx1QzYyNFx1QUUzMCBcdUMyRTRcdUQzMjg6JywgZXJyb3IpO1xuICAgICAgbmV3IE5vdGljZSgnXHVDREE5XHVCM0NDIFx1QkFBOVx1Qjg1RCBcdUM4NzBcdUQ2OEMgXHVDMkU0XHVEMzI4Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFQtMDE3OiBDb25mbGljdFJlc29sdXRpb25Nb2RhbCBcdUM1RjRcdUFFMzAgXHVCQzBGIFx1Qjc3Q1x1Qzc3NFx1QkUwQyBcdUMyRjFcdUQwNkMgXHVDN0FDXHVBQzFDXG4gICAqL1xuICBwcml2YXRlIG9wZW5Db25mbGljdExpc3RNb2RhbChjb25mbGljdHM6IENvbmZsaWN0SW5mb1tdKTogdm9pZCB7XG4gICAgdGhpcy5jb25mbGljdExpc3RNb2RhbE9wZW4gPSB0cnVlO1xuXG4gICAgY29uc3QgbW9kYWwgPSBuZXcgU3luY1Jlc29sdXRpb25Nb2RhbChcbiAgICAgIHRoaXMuYXBwLFxuICAgICAgY29uZmxpY3RzLFxuICAgICAgW10sIC8vIFx1Qjg1Q1x1Q0VFQyBcdUM4MDRcdUM2QTkgXHVEMzBDXHVDNzdDIFx1QzVDNlx1Qzc0Q1xuICAgICAgLy8gb25SZXNvbHZlOiBcdUM3N0NcdUFEMDQgXHVENTc0XHVBQ0IwIFx1QzIxOFx1RDU4OVxuICAgICAgYXN5bmMgKGFjdGlvbnM6IE1hcDxzdHJpbmcsIFN5bmNBY3Rpb24+KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gU3luY0FjdGlvblx1Qzc0NCBDb25mbGljdEluZm9bXVx1Qjg1QyBcdUJDQzBcdUQ2NThcbiAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IGNvbmZsaWN0cy5tYXAoY29uZmxpY3QgPT4gKHtcbiAgICAgICAgICAgIC8vIFx1QzBBQ1x1QzZBOVx1Qzc5MFx1QUMwMCBcdUJBODVcdUMyRENcdUQ1NThcdUM5QzAgXHVDNTRBXHVDNzQwIFx1Q0RBOVx1QjNDQ1x1Qzc0MCBcdUM1NDhcdUM4MDRcdUQ1NThcdUFDOEMgXHVDMTFDXHVCQzg0IFx1QkM4NFx1QzgwNFx1QzczQ1x1Qjg1QyBcdUQzRjRcdUJDMzFcbiAgICAgICAgICAgIC4uLmNvbmZsaWN0LFxuICAgICAgICAgICAgc2VsZWN0ZWRWZXJzaW9uOiBhY3Rpb25zLmdldChjb25mbGljdC5wYXRoKSA9PT0gJ2xvY2FsJyA/ICdsb2NhbCcgOiAnc2VydmVyJyxcbiAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAvLyBcdUQ1NzRcdUFDQjAgXHVBQ0IwXHVBQ0ZDIFx1QzgwMVx1QzZBOVxuICAgICAgICAgIGZvciAoY29uc3QgY29uZmxpY3Qgb2YgcmVzb2x2ZWQpIHtcbiAgICAgICAgICAgIGlmIChjb25mbGljdC5zZWxlY3RlZFZlcnNpb24gPT09ICdsb2NhbCcpIHtcbiAgICAgICAgICAgICAgLy8gXHVCODVDXHVDRUVDIFx1QkM4NFx1QzgwNCBcdUM3MjBcdUM5QzA6IFx1QzExQ1x1QkM4NFx1Qjg1QyBcdUM1QzVcdUI4NUNcdUI0RENcbiAgICAgICAgICAgICAgY29uc3QgZmlsZUlkID0gdGhpcy5maWxlSWRUcmFja2VyLmdldEZpbGVJZChjb25mbGljdC5wYXRoKTtcbiAgICAgICAgICAgICAgaWYgKGZpbGVJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3luY1NlcnZpY2U/LnNlbmRPclF1ZXVlKCdmaWxlOnVwZGF0ZScsIHtcbiAgICAgICAgICAgICAgICAgIGZpbGVJZCxcbiAgICAgICAgICAgICAgICAgIHBhdGg6IGNvbmZsaWN0LnBhdGgsXG4gICAgICAgICAgICAgICAgICBjb250ZW50OiBjb25mbGljdC5sb2NhbENvbnRlbnQsXG4gICAgICAgICAgICAgICAgICBoYXNoOiAnJyxcbiAgICAgICAgICAgICAgICAgIHJlc29sdmVDb25mbGljdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gXHVDMTFDXHVCQzg0IFx1QkM4NFx1QzgwNCBcdUM3MjBcdUM5QzA6IFx1Qjg1Q1x1Q0VFQ1x1QzVEMCBcdUIzNkVcdUM1QjRcdUM0RjBcdUFFMzBcbiAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChjb25mbGljdC5wYXRoKTtcbiAgICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCBjb25mbGljdC5zZXJ2ZXJDb250ZW50KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIFx1QzExQ1x1QkM4NCBcdUNFMjEgY29uZmxpY3QgXHVENTc0XHVBQ0IwXG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVJZCA9IHRoaXMuZmlsZUlkVHJhY2tlci5nZXRGaWxlSWQoY29uZmxpY3QucGF0aCk7XG4gICAgICAgICAgICAgIGlmIChmaWxlSWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN5bmNTZXJ2aWNlPy5zZW5kT3JRdWV1ZSgnZmlsZTp1cGRhdGUnLCB7XG4gICAgICAgICAgICAgICAgICBmaWxlSWQsXG4gICAgICAgICAgICAgICAgICByZXNvbHZlQ29uZmxpY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICByZXNvbHZlU3RyYXRlZ3k6ICdrZWVwX3NlcnZlcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXcgTm90aWNlKGBcdUNEQTlcdUIzQ0MgXHVENTc0XHVBQ0IwIFx1QzY0NFx1QjhDQzogJHtyZXNvbHZlZC5sZW5ndGh9XHVBQzc0YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW29wZW5Db25mbGljdFJlc29sdXRpb25Nb2RhbF0gXHVDREE5XHVCM0NDIFx1RDU3NFx1QUNCMCBcdUMyRTRcdUQzMjg6JywgZXJyb3IpO1xuICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1Q0RBOVx1QjNDQyBcdUQ1NzRcdUFDQjAgXHVDNjI0XHVCOTU4Jyk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy5jb25mbGljdExpc3RNb2RhbE9wZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIG9uQ2FuY2VsOiBcdUNERThcdUMxOEMgXHVDQzk4XHVCOUFDXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuY29uZmxpY3RMaXN0TW9kYWxPcGVuID0gZmFsc2U7XG4gICAgICAgIG5ldyBOb3RpY2UoJ1x1Q0RBOVx1QjNDQyBcdUQ1NzRcdUFDQjAgXHVBQzc0XHVCMTA4XHVCNzAwJyk7XG4gICAgICB9LFxuICAgICk7XG5cbiAgICBtb2RhbC5vcGVuKCk7XG4gIH1cblxuICAvKipcbiAgICogU1BFQy1TSEFSRS0wMDE6IFx1RDMwQ1x1Qzc3QyBcdUJBNTRcdUIyNzRcdUM1RDAgXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBcdUNFRThcdUQxNERcdUMyQTRcdUQyQjggXHVCQTU0XHVCMjc0IFx1Q0Q5NFx1QUMwMFxuICAgKiBATVg6QU5DSE9SOiBbQVVUT10gXHVEMzBDXHVDNzdDIFx1QzZCMFx1RDA3NFx1QjlBRCBcdUJBNTRcdUIyNzRcdUM1RDAgXHVBQ0Y1XHVDNzIwIFx1QUUzMFx1QjJBNSBcdUQxQjVcdUQ1NjlcbiAgICogQE1YOlJFQVNPTjogU1BFQy1TSEFSRS0wMDEgUkVRLVNIQVJFLTEwMSB0byBSRVEtU0hBUkUtMTA0XG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUZpbGVNZW51KG1lbnU6IE1lbnUsIGZpbGU6IFRBYnN0cmFjdEZpbGUpOiB2b2lkIHtcbiAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSByZXR1cm47XG5cbiAgICBjb25zdCBzaGFyZVNlcnZpY2UgPSB0aGlzLnNoYXJlU2VydmljZTtcbiAgICBpZiAoIXNoYXJlU2VydmljZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgdXJsQ29uZmlndXJlZCA9IHNoYXJlU2VydmljZS5pc1B1YmxpY1VybENvbmZpZ3VyZWQoKTtcbiAgICBjb25zdCBub1VybE5vdGljZSA9ICgpID0+IG5ldyBOb3RpY2UoJ1x1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkMgVVJMXHVDNzc0IFx1QzEyNFx1QzgxNVx1QjQxOFx1QzlDMCBcdUM1NEFcdUM1NThcdUMyQjVcdUIyQzhcdUIyRTQuIFx1QzEyNFx1QzgxNVx1QzVEMFx1QzExQyBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFVSTFx1Qzc0NCBcdUM3ODVcdUI4MjVcdUQ1NzRcdUM4RkNcdUMxMzhcdUM2OTQuJyk7XG5cbiAgICAvLyBcdUIzRDlcdUFFMzBcdUM4MDFcdUM3M0NcdUI4NUMgbWV0YWRhdGFDYWNoZVx1QzVEMFx1QzExQyBcdUFDRjVcdUM3MjAgXHVDMEMxXHVEMERDIFx1RDY1NVx1Qzc3OCAoYXN5bmMgXHVDMEFDXHVDNkE5IFx1QkQ4OFx1QUMwMCAtIFx1QkE1NFx1QjI3NCBcdUIzRDlcdUFFMzAgXHVCODBDXHVCMzU0XHVCOUMxKVxuICAgIGNvbnN0IGZtID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk/LmZyb250bWF0dGVyO1xuICAgIGNvbnN0IHNoYXJlVXJsID0gZm0/LnNoYXJlX3VybDtcbiAgICBjb25zdCBzaGFyZUV4cGlyZXMgPSBmbT8uc2hhcmVfZXhwaXJlcztcbiAgICBjb25zdCBpc1NoYXJlZCA9ICEhc2hhcmVVcmwgJiYgc2hhcmVFeHBpcmVzICE9PSAnZXhwaXJlZCc7XG5cbiAgICBpZiAoIWlzU2hhcmVkKSB7XG4gICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbS5zZXRUaXRsZSgnXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBcdUMwRERcdUMxMzEnKVxuICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHVybENvbmZpZ3VyZWRcbiAgICAgICAgICAgID8gbmV3IFNoYXJlTW9kYWwodGhpcy5hcHAsIGZpbGUsIHNoYXJlU2VydmljZSkub3BlbigpXG4gICAgICAgICAgICA6IG5vVXJsTm90aWNlKCkpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV4cGlyZXNMYWJlbCA9IHNoYXJlRXhwaXJlcyA9PT0gJ3VubGltaXRlZCcgPyAnXHVCQjM0XHVDODFDXHVENTVDJyA6XG4gICAgICAgIHNoYXJlRXhwaXJlcyA/IG5ldyBEYXRlKHNoYXJlRXhwaXJlcykudG9Mb2NhbGVEYXRlU3RyaW5nKCdrby1LUicpIDogJ1x1QkIzNFx1QzgxQ1x1RDU1Qyc7XG5cbiAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtLnNldFRpdGxlKGBcdUFDRjVcdUM3MjAgXHVDOTExIChcdUI5Q0NcdUI4Q0M6ICR7ZXhwaXJlc0xhYmVsfSlgKVxuICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4cCA9IFsnMWgnLCAnMWQnLCAnN2QnLCAndW5saW1pdGVkJ10uaW5jbHVkZXMoc2hhcmVFeHBpcmVzIGFzIHN0cmluZylcbiAgICAgICAgICAgICAgPyBzaGFyZUV4cGlyZXMgYXMgU2hhcmVFeHBpcmF0aW9uXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgbmV3IFNoYXJlTW9kYWwodGhpcy5hcHAsIGZpbGUsIHNoYXJlU2VydmljZSwgZXhwKS5vcGVuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtLnNldFRpdGxlKCdcdUFDRjVcdUM3MjAgXHVDOTExXHVDOUMwJylcbiAgICAgICAgICAub25DbGljaygoKSA9PiBzaGFyZVNlcnZpY2Uuc3RvcFNoYXJlKGZpbGUpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG59XG4iLCAiLyoqXG4gKiBQbHVnaW4gc2V0dGluZ3MgZm9yIFZlY3RvciBPYnNpZGlhbiBwbHVnaW5cbiAqIEBNWDpOT1RFOiBbQVVUT10gU2V0dGluZ3MgZGF0YSBzdHJ1Y3R1cmUgKFVJIGlzIGluIHNldHRpbmdzLXRhYi50cylcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFZTeW5jU2V0dGluZ3MgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IHsgdHlwZSBWU3luY1NldHRpbmdzIH07XG5cbi8qKlxuICogRGVmYXVsdCBwbHVnaW4gc2V0dGluZ3NcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFZTeW5jU2V0dGluZ3MgPSB7XG4gIHNlcnZlclVybDogJycsXG4gIHZhdWx0SWQ6ICcnLFxuICBhcGlLZXk6ICcnLFxuICBhdXRvU3luYzogdHJ1ZSxcbiAgc3luY0VuYWJsZWQ6IHRydWUsXG4gIHNraXBwZWRQYXRoczogW10sXG4gIGN1cnJlbnRWZXJzaW9uOiAnJyxcbiAgZG93bmxvYWRVcmw6ICcnLFxuICBwdWJsaWNVcmw6ICcnLCAvLyBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFx1QUUzMFx1QjJBNVx1Qzc0NCBcdUM3MDRcdUQ1NUMgXHVBQ0Y1XHVBQzFDIFVSTCAoU1BFQy1TSEFSRS0wMDEpXG4gIHZhdWx0TWFwcGluZ3M6IFtdLCAvLyBcdUIyRTRcdUM5MTEgXHVCQ0ZDXHVEMkI4IFx1QjlFNFx1RDU1MSBcdUJDMzBcdUM1RjQgKFNQRUMtUExVR0lOLU1VTFRJVkFVTFQtMDAxKVxuICBkZXZpY2VJZDogJycsIC8vIFNQRUMtU1lOQy0wMDU6IFx1QjUxNFx1QkMxNFx1Qzc3NFx1QzJBNCBJRCAoXHVCRTQ0XHVDNUI0IFx1Qzc4OFx1QzczQ1x1QkE3NCBcdUI4NUNcdUI0REMgXHVDMkRDIFx1Qzc5MFx1QjNEOSBcdUMwRERcdUMxMzEpXG59O1xuXG4vKipcbiAqIFx1QjgwOFx1QUM3MFx1QzJEQyBcdUIyRThcdUM3N0MgXHVCQ0ZDXHVEMkI4IFx1QzEyNFx1QzgxNVx1Qzc0NCBcdUIyRTRcdUM5MTEgXHVCQ0ZDXHVEMkI4IFx1QzEyNFx1QzgxNVx1QzczQ1x1Qjg1QyBcdUI5QzhcdUM3NzRcdUFERjhcdUI4MDhcdUM3NzRcdUMxNThcbiAqIFJFUS0wMDU6IFx1QUUzMFx1Qzg3NCBcdUIyRThcdUM3N0MgXHVCQ0ZDXHVEMkI4IFx1QzBBQ1x1QzZBOVx1Qzc5MFx1Qzc1OCBcdUMxMjRcdUM4MTUgXHVENjM4XHVENjU4XHVDMTMxIFx1QzcyMFx1QzlDMFxuICpcbiAqIEBwYXJhbSBzZXR0aW5ncyAtIFx1RDYwNFx1QzdBQyBcdUMxMjRcdUM4MTUgXHVBQzFEXHVDQ0I0XG4gKiBAcmV0dXJucyBcdUI5QzhcdUM3NzRcdUFERjhcdUI4MDhcdUM3NzRcdUMxNThcdUI0MUMgXHVDMTI0XHVDODE1IFx1QUMxRFx1Q0NCNFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBcdUI4MDhcdUFDNzBcdUMyREMgXHVDMTI0XHVDODE1XG4gKiB7IHZhdWx0SWQ6ICdvbGQtdmF1bHQnLCBhcGlLZXk6ICdvbGQta2V5JyB9XG4gKiAvLyBcdTIxOTIgXHVCOUM4XHVDNzc0XHVBREY4XHVCODA4XHVDNzc0XHVDMTU4IFx1QUNCMFx1QUNGQ1xuICogeyB2YXVsdElkOiAnb2xkLXZhdWx0JywgYXBpS2V5OiAnb2xkLWtleScsIHZhdWx0TWFwcGluZ3M6IFt7IGZvbGRlcjogJycsIHZhdWx0SWQ6ICdvbGQtdmF1bHQnLCBhcGlLZXk6ICdvbGQta2V5JywgZW5hYmxlZDogdHJ1ZSB9XSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlVG9NdWx0aVZhdWx0KHNldHRpbmdzOiBWU3luY1NldHRpbmdzKTogVlN5bmNTZXR0aW5ncyB7XG4gIC8vIFx1Qzc3NFx1QkJGOCB2YXVsdE1hcHBpbmdzXHVBQzAwIFx1Qzc4OFx1QzczQ1x1QkE3NCBcdUFERjhcdUIzMDBcdUI4NUMgXHVCQzE4XHVENjU4IChcdUM3NzRcdUM5MTEgXHVCOUM4XHVDNzc0XHVBREY4XHVCODA4XHVDNzc0XHVDMTU4IFx1QkMyOVx1QzlDMClcbiAgaWYgKHNldHRpbmdzLnZhdWx0TWFwcGluZ3MgJiYgc2V0dGluZ3MudmF1bHRNYXBwaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHNldHRpbmdzO1xuICB9XG5cbiAgLy8gdmF1bHRJZFx1QUMwMCBcdUJFNDRcdUM1QjRcdUM3ODhcdUFDNzBcdUIwOTggXHVDNzIwXHVENkE4XHVENTU4XHVDOUMwIFx1QzU0QVx1QzczQ1x1QkE3NCBcdUJFNDggXHVCQzMwXHVDNUY0XHVCODVDIFx1Q0QwOFx1QUUzMFx1RDY1NFx1QjlDQ1xuICBpZiAoIXNldHRpbmdzLnZhdWx0SWQgfHwgc2V0dGluZ3MudmF1bHRJZC50cmltKCkgPT09ICcnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnNldHRpbmdzLFxuICAgICAgdmF1bHRNYXBwaW5nczogW10sXG4gICAgfTtcbiAgfVxuXG4gIC8vIGFwaUtleVx1QjNDNCBcdUQ1NDRcdUMyMTggXHUyMDE0IFx1QjIwNFx1Qjc3RCBcdUMyREMgXHVCOUM4XHVDNzc0XHVBREY4XHVCODA4XHVDNzc0XHVDMTU4XHVENTU4XHVDOUMwIFx1QzU0QVx1QUNFMCBcdUFDQkRcdUFDRTBcbiAgaWYgKCFzZXR0aW5ncy5hcGlLZXkgfHwgc2V0dGluZ3MuYXBpS2V5LnRyaW0oKSA9PT0gJycpIHtcbiAgICBjb25zb2xlLndhcm4oJ1ttaWdyYXRlVG9NdWx0aVZhdWx0XSB2YXVsdElkXHVBQzAwIFx1Qzc4OFx1QzlDMFx1QjlDQyBhcGlLZXlcdUFDMDAgXHVCMjA0XHVCNzdEXHVCNDI4IFx1MjAxNCBcdUI5QzhcdUM3NzRcdUFERjhcdUI4MDhcdUM3NzRcdUMxNTggXHVBQzc0XHVCMTA4XHVCNzAwJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnNldHRpbmdzLFxuICAgICAgdmF1bHRNYXBwaW5nczogW10sXG4gICAgfTtcbiAgfVxuXG4gIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBcdUIyRThcdUM3N0MgXHVCQ0ZDXHVEMkI4IFx1QzEyNFx1QzgxNVx1Qzc0NCB2YXVsdE1hcHBpbmdzXHVCODVDIFx1QkNDMFx1RDY1OFxuICAvLyBcdUJFNDggZm9sZGVyXHVCMjk0IFx1QjhFOFx1RDJCOCBcdUQzRjRcdUIzNTRcdUI5N0MgXHVDNzU4XHVCQkY4IChcdUJBQThcdUI0RTAgXHVEMzBDXHVDNzdDIFx1QjlFNFx1RDU1MSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zZXR0aW5ncyxcbiAgICB2YXVsdE1hcHBpbmdzOiBbXG4gICAgICB7XG4gICAgICAgIGZvbGRlcjogJycsIC8vIFx1QjhFOFx1RDJCOCBcdUQzRjRcdUIzNTQgKFx1QkFBOFx1QjRFMCBcdUQzMENcdUM3N0MpXG4gICAgICAgIHZhdWx0SWQ6IHNldHRpbmdzLnZhdWx0SWQsXG4gICAgICAgIGFwaUtleTogc2V0dGluZ3MuYXBpS2V5LFxuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICBdLFxuICB9O1xufVxuIiwgImltcG9ydCB7IFBsdWdpblNldHRpbmdUYWIsIEFwcCwgU2V0dGluZywgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHR5cGUgVlN5bmNQbHVnaW4gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgeyBDb25uZWN0aW9uTW9kYWwgfSBmcm9tICcuL2Nvbm5lY3Rpb24tbW9kYWwnO1xuaW1wb3J0IHR5cGUgeyBWYXVsdE1hcHBpbmcgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBQbHVnaW4gc2V0dGluZ3MgdGFiXG4gKiBATVg6Tk9URTogW0FVVE9dIFNldHRpbmdzIFVJIHdpdGggbXVsdGktdmF1bHQgbWFwcGluZyBtYW5hZ2VtZW50LCBzeW5jIGNvbnRyb2wsIGF1dG8tc3luYywgYW5kIHBsdWdpbiB1cGRhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFZTeW5jU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IFZTeW5jUGx1Z2luO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFZTeW5jUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICB0aGlzLnJlbmRlclZhdWx0TWFwcGluZ3NTZWN0aW9uKGNvbnRhaW5lckVsKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdUIzRDlcdUFFMzBcdUQ2NTQnKS5zZXRIZWFkaW5nKCk7XG4gICAgdGhpcy5yZW5kZXJTeW5jQ29udHJvbFNlY3Rpb24oY29udGFpbmVyRWwpO1xuICAgIHRoaXMucmVuZGVyQXV0b1N5bmNTZWN0aW9uKGNvbnRhaW5lckVsKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdcdUFDRTBcdUFFMDknKS5zZXRIZWFkaW5nKCk7XG4gICAgdGhpcy5yZW5kZXJQdWJsaWNVcmxTZWN0aW9uKGNvbnRhaW5lckVsKTtcbiAgICB0aGlzLnJlbmRlclNraXBwZWRQYXRoc1NlY3Rpb24oY29udGFpbmVyRWwpO1xuICAgIHRoaXMucmVuZGVyRG93bmxvYWRTZWN0aW9uKGNvbnRhaW5lckVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUIyRTRcdUM5MTEgXHVCQ0ZDXHVEMkI4IFx1QjlFNFx1RDU1MSBcdUFEMDBcdUI5QUMgXHVDMTM5XHVDMTU4IChcdUNEOTRcdUFDMDAvXHVDMTI0XHVDODE1L1x1QzgxQ1x1QUM3MC9cdUM4MDRcdUNDQjRcdUQ1NzRcdUM4MUMpXG4gICAqL1xuICBwcml2YXRlIHJlbmRlclZhdWx0TWFwcGluZ3NTZWN0aW9uKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IG1hcHBpbmdzID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRNYXBwaW5ncyA/PyBbXTtcbiAgICBjb25zdCBoYXNBbnlDb25uZWN0aW9uID0gISF0aGlzLnBsdWdpbi5zeW5jU2VydmljZSB8fCAhIXRoaXMucGx1Z2luLnZhdWx0Um91dGVyO1xuXG4gICAgLy8gXHVENUU0XHVCMzU0ICsgXHVDRDk0XHVBQzAwIFx1QkM4NFx1RDJCQ1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1QkNGQ1x1RDJCOCBcdUI5RTRcdUQ1NTEnKVxuICAgICAgLnNldERlc2MoYFx1QzVGMFx1QUNCMFx1QjQxQyBcdUJDRkNcdUQyQjg6ICR7bWFwcGluZ3MubGVuZ3RofVx1QUMxQ2ApXG4gICAgICAuYWRkQnV0dG9uKGJ0biA9PiBidG5cbiAgICAgICAgLnNldEJ1dHRvblRleHQoJ1x1QkNGQ1x1RDJCOCBcdUNEOTRcdUFDMDAnKVxuICAgICAgICAuc2V0Q2xhc3MoJ21vZC1jdGEnKVxuICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgbmV3IENvbm5lY3Rpb25Nb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sICgpID0+IHRoaXMuZGlzcGxheSgpKS5vcGVuKCk7XG4gICAgICAgIH0pKTtcblxuICAgIGlmIChtYXBwaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgICB0ZXh0OiAnXHVDMTI0XHVDODE1XHVCNDFDIFx1QkNGQ1x1RDJCOCBcdUI5RTRcdUQ1NTFcdUM3NzQgXHVDNUM2XHVDMkI1XHVCMkM4XHVCMkU0LiBcIlx1QkNGQ1x1RDJCOCBcdUNEOTRcdUFDMDBcIlx1Qjk3QyBcdUIyMENcdUI3RUMgXHVDNUYwXHVBQ0IwXHVENTU4XHVDMTM4XHVDNjk0LicsXG4gICAgICAgIGNsczogJ3NldHRpbmctaXRlbS1kZXNjcmlwdGlvbicsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hcHBpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtYXBwaW5nID0gbWFwcGluZ3NbaV07XG4gICAgICBjb25zdCBtYXBwaW5nRWwgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6ICdzZXR0aW5nLWl0ZW0nIH0pO1xuXG4gICAgICBjb25zdCBpbmZvRWwgPSBtYXBwaW5nRWwuY3JlYXRlRGl2KHsgY2xzOiAnc2V0dGluZy1pdGVtLWluZm8nIH0pO1xuICAgICAgaW5mb0VsLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6IG1hcHBpbmcuZm9sZGVyIHx8ICcvIChcdUI4RThcdUQyQjgpJywgY2xzOiAnc2V0dGluZy1pdGVtLW5hbWUnIH0pO1xuICAgICAgaW5mb0VsLmNyZWF0ZUVsKCdkaXYnLCB7XG4gICAgICAgIHRleHQ6IGBWYXVsdDogJHttYXBwaW5nLnZhdWx0SWQuc2xpY2UoMCwgOCl9Li4uJHttYXBwaW5nLmVuYWJsZWQgPyAnJyA6ICcgKFx1QkU0NFx1RDY1Q1x1QzEzMSknfWAsXG4gICAgICAgIGNsczogJ3NldHRpbmctaXRlbS1kZXNjcmlwdGlvbicsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY29udHJvbEVsID0gbWFwcGluZ0VsLmNyZWF0ZURpdih7IGNsczogJ3NldHRpbmctaXRlbS1jb250cm9sJyB9KTtcblxuICAgICAgLy8gXHVDNUYwXHVBQ0IwIFx1QzBDMVx1RDBEQyArIFx1QUMxQ1x1QkNDNCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVEMUEwXHVBRTAwXG4gICAgICBjb25zdCBzdGF0dXMgPSB0aGlzLmdldFZhdWx0U3RhdHVzKG1hcHBpbmcpO1xuICAgICAgY29udHJvbEVsLmNyZWF0ZUVsKCdzcGFuJywge1xuICAgICAgICB0ZXh0OiBzdGF0dXMgPT09ICdjb25uZWN0ZWQnID8gJ1x1QzVGMFx1QUNCMFx1QjQyOCcgOiAnXHVDNUYwXHVBQ0IwIFx1QzU0OCBcdUI0MjgnLFxuICAgICAgICBjbHM6IGB2YXVsdC1zdGF0dXMtJHtzdGF0dXN9YCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoc3RhdHVzID09PSAnY29ubmVjdGVkJyAmJiB0aGlzLnBsdWdpbi52YXVsdFJvdXRlcikge1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5wbHVnaW4udmF1bHRSb3V0ZXIuZ2V0U3luY1NlcnZpY2UobWFwcGluZy52YXVsdElkKTtcbiAgICAgICAgY29uc3QgaXNQYXVzZWQgPSBzZXJ2aWNlPy5zdGF0ZSA9PT0gJ3BhdXNlZCc7XG4gICAgICAgIGNvbnRyb2xFbC5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgICAgIHRleHQ6IGlzUGF1c2VkID8gJ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM3QUNcdUFDMUMnIDogJ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTFcdUM5QzAnLFxuICAgICAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAoc2VydmljZSkge1xuICAgICAgICAgICAgaWYgKGlzUGF1c2VkKSB7XG4gICAgICAgICAgICAgIHNlcnZpY2UucmVzdW1lKCk7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoYCR7bWFwcGluZy5mb2xkZXIgfHwgJ1x1QjhFOFx1RDJCOCd9IFx1QjNEOVx1QUUzMFx1RDY1NCBcdUM3QUNcdUFDMUNgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlcnZpY2UucGF1c2UoKTtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgJHttYXBwaW5nLmZvbGRlciB8fCAnXHVCOEU4XHVEMkI4J30gXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzkxMVx1QzlDMGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gXHVDMTI0XHVDODE1IFx1QkM4NFx1RDJCQyBcdTIwMTQgXHVEM0I4XHVDOUQxIFx1QkFBOFx1QjJFQyBcdUM1RjRcdUFFMzBcbiAgICAgIGNvbnRyb2xFbC5jcmVhdGVFbCgnYnV0dG9uJywge1xuICAgICAgICB0ZXh0OiAnXHVDMTI0XHVDODE1JyxcbiAgICAgIH0pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBuZXcgQ29ubmVjdGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLnBsdWdpbiwgKCkgPT4gdGhpcy5kaXNwbGF5KCksIGkpLm9wZW4oKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBcdUM4MUNcdUFDNzAgXHVCQzg0XHVEMkJDXG4gICAgICBjb250cm9sRWwuY3JlYXRlRWwoJ2J1dHRvbicsIHtcbiAgICAgICAgdGV4dDogJ1x1QzgxQ1x1QUM3MCcsXG4gICAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVtb3ZlZE1hcHBpbmcgPSBtYXBwaW5nc1tpXTtcbiAgICAgICAgY29uc3QgbmV3TWFwcGluZ3MgPSBbLi4uKHRoaXMucGx1Z2luLnNldHRpbmdzLnZhdWx0TWFwcGluZ3MgPz8gW10pXTtcbiAgICAgICAgbmV3TWFwcGluZ3Muc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy52YXVsdE1hcHBpbmdzID0gbmV3TWFwcGluZ3M7XG5cbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLnZhdWx0Um91dGVyICYmIHJlbW92ZWRNYXBwaW5nKSB7XG4gICAgICAgICAgY29uc3Qgc2VydmljZSA9IHRoaXMucGx1Z2luLnZhdWx0Um91dGVyLmdldFN5bmNTZXJ2aWNlKHJlbW92ZWRNYXBwaW5nLnZhdWx0SWQpO1xuICAgICAgICAgIGlmIChzZXJ2aWNlKSB7XG4gICAgICAgICAgICBzZXJ2aWNlLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5ld01hcHBpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uY2xlYW51cCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncyh7IHNraXBSZWNvbm5lY3Q6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gXHVDODA0XHVDQ0I0IFx1QzVGMFx1QUNCMCBcdUQ1NzRcdUM4MUMgKFx1QjlFNFx1RDU1MVx1Qzc3NCBcdUM3ODhcdUM3NDQgXHVCNTRDXHVCOUNDKVxuICAgIGlmIChoYXNBbnlDb25uZWN0aW9uKSB7XG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgLnNldE5hbWUoJ1x1QzgwNFx1Q0NCNCBcdUM1RjBcdUFDQjAgXHVENTc0XHVDODFDJylcbiAgICAgICAgLnNldERlc2MoJ1x1QkFBOFx1QjRFMCBcdUJDRkNcdUQyQjggXHVCOUU0XHVENTUxXHVDNzQ0IFx1QzcyMFx1QzlDMFx1RDU1OFx1QkE3NFx1QzExQyBcdUM1RjBcdUFDQjBcdUI5Q0MgXHVENTc0XHVDODFDJylcbiAgICAgICAgLmFkZEJ1dHRvbihidG4gPT4gYnRuXG4gICAgICAgICAgLnNldEJ1dHRvblRleHQoJ1x1QzVGMFx1QUNCMCBcdUQ1NzRcdUM4MUMnKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNFbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoeyBza2lwUmVjb25uZWN0OiB0cnVlIH0pO1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uY2xlYW51cCgpO1xuICAgICAgICAgICAgbmV3IE5vdGljZSgnXHVCQUE4XHVCNEUwIFx1QzVGMFx1QUNCMFx1Qzc3NCBcdUQ1NzRcdUM4MUNcdUI0MThcdUM1QzhcdUMyQjVcdUIyQzhcdUIyRTQuJyk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICB9KSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRWYXVsdFN0YXR1cyhtYXBwaW5nOiBWYXVsdE1hcHBpbmcpOiAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHtcbiAgICBpZiAoIXRoaXMucGx1Z2luLnZhdWx0Um91dGVyKSByZXR1cm4gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgY29uc3Qgc2VydmljZSA9IHRoaXMucGx1Z2luLnZhdWx0Um91dGVyLmdldFN5bmNTZXJ2aWNlKG1hcHBpbmcudmF1bHRJZCk7XG4gICAgcmV0dXJuIHNlcnZpY2UgPyAnY29ubmVjdGVkJyA6ICdkaXNjb25uZWN0ZWQnO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTeW5jQ29udHJvbFNlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgaGFzTWFwcGluZ3MgPSAodGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRNYXBwaW5ncyA/PyBbXSkubGVuZ3RoID4gMDtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM4MUNcdUM1QjQnKVxuICAgICAgLnNldERlc2MoJ1x1QkFBOFx1QjRFMCBcdUJDRkNcdUQyQjhcdUM3NTggXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzJEQ1x1Qzc5MS9cdUM5MTFcdUM5QzAnKVxuICAgICAgLmFkZEJ1dHRvbihidXR0b24gPT4ge1xuICAgICAgICBpZiAodGhpcy5wbHVnaW4udmF1bHRSb3V0ZXIgfHwgdGhpcy5wbHVnaW4uc3luY1NlcnZpY2UpIHtcbiAgICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzkxMVx1QzlDMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1dHRvbi5zZXRCdXR0b25UZXh0KCdcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMkRDXHVDNzkxJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnV0dG9uLnNldERpc2FibGVkKCFoYXNNYXBwaW5ncyk7XG5cbiAgICAgICAgYnV0dG9uLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi52YXVsdFJvdXRlciB8fCB0aGlzLnBsdWdpbi5zeW5jU2VydmljZSkge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncyh7IHNraXBSZWNvbm5lY3Q6IHRydWUgfSk7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5jbGVhbnVwKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnN5bmNFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyQXV0b1N5bmNTZWN0aW9uKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1x1Qzc5MFx1QjNEOSBcdUIzRDlcdUFFMzBcdUQ2NTQnKVxuICAgICAgLnNldERlc2MoJ1x1RDMwQ1x1Qzc3QyBcdUJDQzBcdUFDQkQgXHVDMkRDIFx1Qzc5MFx1QjNEOSBcdUIzRDlcdUFFMzBcdUQ2NTQnKVxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvU3luYylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9TeW5jID0gdmFsdWU7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyUHVibGljVXJsU2VjdGlvbihjb250YWluZXJFbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFVSTCcpXG4gICAgICAuc2V0RGVzYygnXHVDNkY5IFx1QUNGNVx1QzcyMCBcdUFFMzBcdUIyQTVcdUM1RDAgXHVDMEFDXHVDNkE5XHVENTYwIFx1QUNGNVx1QUMxQyBVUkwgKFx1QzYwODogaHR0cHM6Ly92ZWN0b3IuZXhhbXBsZS5jb20pJylcbiAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2h0dHBzOi8vdmVjdG9yLmV4YW1wbGUuY29tJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnB1YmxpY1VybCB8fCAnJylcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnB1YmxpY1VybCA9IHZhbHVlLnJlcGxhY2UoL1xcLyskLywgJycpO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclNraXBwZWRQYXRoc1NlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHVDODFDXHVDNjc4IFx1QUNCRFx1Qjg1QycpXG4gICAgICAuc2V0RGVzYygnXHVCM0Q5XHVBRTMwXHVENjU0XHVDNUQwXHVDMTFDIFx1QzgxQ1x1QzY3OFx1RDU2MCBcdUFDQkRcdUI4NUMgKFx1RDU1QyBcdUM5MDRcdUM1RDAgXHVENTU4XHVCMDk4KScpXG4gICAgICAuYWRkVGV4dEFyZWEodGV4dCA9PiB0ZXh0XG4gICAgICAgIC5zZXRQbGFjZWhvbGRlcignLm9ic2lkaWFuXFxuLnRyYXNoJylcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNraXBwZWRQYXRocy5qb2luKCdcXG4nKSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNraXBwZWRQYXRocyA9IHZhbHVlXG4gICAgICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAubWFwKGxpbmUgPT4gbGluZS50cmltKCkpXG4gICAgICAgICAgICAuZmlsdGVyKGxpbmUgPT4gbGluZS5sZW5ndGggPiAwKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJEb3dubG9hZFNlY3Rpb24oY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgZG93bmxvYWRVcmxJbnB1dCA9IHsgdmFsdWU6IHRoaXMucGx1Z2luLnNldHRpbmdzLmRvd25sb2FkVXJsIHx8ICcnIH07XG4gICAgbGV0IGRvd25sb2FkQnV0dG9uOiBhbnkgPSBudWxsO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnXHVENTBDXHVCN0VDXHVBREY4XHVDNzc4IFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOCcpXG4gICAgICAuc2V0RGVzYygndicgKyAodGhpcy5wbHVnaW4uc2V0dGluZ3MuY3VycmVudFZlcnNpb24gfHwgdGhpcy5wbHVnaW4ubWFuaWZlc3QudmVyc2lvbikpXG4gICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcbiAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdodHRwczovL2V4YW1wbGUuY29tL21haW4uanMnKVxuICAgICAgICAuc2V0VmFsdWUoZG93bmxvYWRVcmxJbnB1dC52YWx1ZSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGRvd25sb2FkVXJsSW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kb3dubG9hZFVybCA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIGRvd25sb2FkQnV0dG9uPy5zZXREaXNhYmxlZCghdmFsdWUpO1xuICAgICAgICB9KSlcbiAgICAgIC5hZGRCdXR0b24oYnV0dG9uID0+IHtcbiAgICAgICAgZG93bmxvYWRCdXR0b24gPSBidXR0b247XG4gICAgICAgIGJ1dHRvblxuICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMnKVxuICAgICAgICAgIC5zZXREaXNhYmxlZCghZG93bmxvYWRVcmxJbnB1dC52YWx1ZSlcbiAgICAgICAgICAuc2V0Q2xhc3MoJ21vZC1jdGEnKVxuICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghZG93bmxvYWRVcmxJbnB1dC52YWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dCgnXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzkxMS4uLicpO1xuICAgICAgICAgICAgYnV0dG9uLnNldERpc2FibGVkKHRydWUpO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBiYXNlVXJsID0gZG93bmxvYWRVcmxJbnB1dC52YWx1ZS5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbiAgICAgICAgICAgICAgY29uc3QgdHMgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IFtcbiAgICAgICAgICAgICAgICB7IHVybDogYCR7YmFzZVVybH0vcHVibGljL3YxL3BsdWdpbi9tYWluLmpzP190PSR7dHN9YCwgbmFtZTogJ21haW4uanMnIH0sXG4gICAgICAgICAgICAgICAgeyB1cmw6IGAke2Jhc2VVcmx9L3B1YmxpYy92MS9wbHVnaW4vbWFuaWZlc3QuanNvbj9fdD0ke3RzfWAsIG5hbWU6ICdtYW5pZmVzdC5qc29uJyB9LFxuICAgICAgICAgICAgICAgIHsgdXJsOiBgJHtiYXNlVXJsfS9wdWJsaWMvdjEvcGx1Z2luL3N0eWxlcy5jc3M/X3Q9JHt0c31gLCBuYW1lOiAnc3R5bGVzLmNzcycgfSxcbiAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChmaWxlLnVybCwgeyBjYWNoZTogJ25vLXN0b3JlJyB9IGFzIFJlcXVlc3RJbml0KTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlcy5vayAmJiBmaWxlLm5hbWUgPT09ICdzdHlsZXMuY3NzJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgJHtmaWxlLm5hbWV9IFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUMyRTRcdUQzMjggKCR7cmVzLnN0YXR1c30pYCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmFkYXB0ZXIud3JpdGUoXG4gICAgICAgICAgICAgICAgICBgLm9ic2lkaWFuL3BsdWdpbnMvdnN5bmMvJHtmaWxlLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoJ1x1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOCBcdUM2NDRcdUI4Q0MuIE9ic2lkaWFuXHVDNzQ0IFx1QzdBQ1x1QzJEQ1x1Qzc5MVx1RDU3NFx1QzhGQ1x1QzEzOFx1QzY5NC4nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgbmV3IE5vdGljZShgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IFx1QzJFNFx1RDMyODogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ1x1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQycpO1xuICAgICAgICAgICAgICBidXR0b24uc2V0RGlzYWJsZWQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBNb2RhbCwgQXBwLCBTZXR0aW5nLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSBWU3luY1BsdWdpbiBmcm9tICcuL2luZGV4JztcbmltcG9ydCB0eXBlIHsgVmF1bHRNYXBwaW5nIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogQ29ubmVjdGlvbiBzZXR0aW5ncyBtb2RhbFxuICogQE1YOk5PVEU6IFtBVVRPXSBPYnNpZGlhbiBNb2RhbCBmb3Igc2VydmVyIFVSTCwgdmF1bHQgSUQsIEFQSSBrZXksIGZvbGRlciBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHBsdWdpbjogVlN5bmNQbHVnaW47XG5cdHByaXZhdGUgb25DbG9zZUNhbGxiYWNrPzogKCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBlZGl0aW5nTWFwcGluZ0luZGV4PzogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFZTeW5jUGx1Z2luLCBvbkNsb3NlPzogKCkgPT4gdm9pZCwgbWFwcGluZ0luZGV4PzogbnVtYmVyKSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcblx0XHR0aGlzLm9uQ2xvc2VDYWxsYmFjayA9IG9uQ2xvc2U7XG5cdFx0dGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4ID0gbWFwcGluZ0luZGV4O1xuXHR9XG5cblx0b25PcGVuKCk6IHZvaWQge1xuXHRcdGNvbnN0IHsgY29udGVudEVsLCB0aXRsZUVsLCBjb250YWluZXJFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHR0aXRsZUVsLnNldFRleHQodGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4ICE9PSB1bmRlZmluZWQgPyAnXHVCQ0ZDXHVEMkI4IFx1QzEyNFx1QzgxNSBcdUQzQjhcdUM5RDEnIDogJ1x1QkNGQ1x1RDJCOCBcdUNEOTRcdUFDMDAnKTtcblxuXHRcdC8vIFJFUS1NVS0wMTQ6IFBsYXRmb3JtLmlzTW9iaWxlIFx1QzBBQ1x1QzZBOSAoXHVBRTMwXHVDODc0IG1vYmlsZS1zY3JvbGwtY29udGFpbmVyIFx1QzcyMFx1QzlDMClcblx0XHRjb25zdCBzY3JvbGxDb250YWluZXIgPSBjb250YWluZXJFbC5xdWVyeVNlbGVjdG9yKCcubW9kYWwnKSBhcyBIVE1MRWxlbWVudCA/PyBjb250YWluZXJFbDtcblx0XHRzY3JvbGxDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnbW9iaWxlLXNjcm9sbC1jb250YWluZXInKTtcblxuXG5cdFx0Y29uc3Qgc2Nyb2xsVG9JbnB1dCA9IChpbnB1dDogSFRNTEVsZW1lbnQpID0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRjb25zdCByZWN0ID0gaW5wdXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdGNvbnN0IGNvbnRhaW5lclJlY3QgPSBzY3JvbGxDb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdGNvbnN0IG9mZnNldCA9IHJlY3QudG9wIC0gY29udGFpbmVyUmVjdC50b3AgKyBzY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wIC0gY29udGFpbmVyUmVjdC5oZWlnaHQgLyAzO1xuXHRcdFx0XHRzY3JvbGxDb250YWluZXIuc2Nyb2xsVG8oeyB0b3A6IG9mZnNldCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xuXHRcdFx0fSwgMzAwKTtcblx0XHR9O1xuXG5cdFx0Ly8gXHVBRTMwXHVDODc0IFx1QjlFNFx1RDU1MSBcdUQzQjhcdUM5RDEgXHVDMkRDIFx1QUUzMFx1QkNGOFx1QUMxMiBcdUI4NUNcdUI0REMgKFNQRUMtUExVR0lOLU1VTFRJVkFVTFQtMDAxIFJFUS0wMjkpXG5cdFx0Y29uc3QgZXhpc3RpbmdNYXBwaW5nID0gdGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4ICE9PSB1bmRlZmluZWRcblx0XHRcdD8gKHRoaXMucGx1Z2luLnNldHRpbmdzLnZhdWx0TWFwcGluZ3MgPz8gW10pW3RoaXMuZWRpdGluZ01hcHBpbmdJbmRleF1cblx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0Y29uc3Qgc2VydmVyVXJsID0geyB2YWx1ZTogdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2VydmVyVXJsIHx8ICcnIH07XG5cdFx0Y29uc3QgdmF1bHRJZCA9IHsgdmFsdWU6IGV4aXN0aW5nTWFwcGluZz8udmF1bHRJZCB8fCB0aGlzLnBsdWdpbi5zZXR0aW5ncy52YXVsdElkIHx8ICcnIH07XG5cdFx0Y29uc3QgYXBpS2V5ID0geyB2YWx1ZTogZXhpc3RpbmdNYXBwaW5nPy5hcGlLZXkgfHwgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpS2V5IHx8ICcnIH07XG5cdFx0Y29uc3QgZm9sZGVyID0geyB2YWx1ZTogKGV4aXN0aW5nTWFwcGluZz8uZm9sZGVyIHx8ICcnKS5yZXBsYWNlKC8gXFwodlN5bmNcXCkkLywgJycpIH07XG5cblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnXHVDMTFDXHVCQzg0IFVSTCcpXG5cdFx0XHQuc2V0RGVzYygnVmVjdG9yIFx1QzExQ1x1QkM4NCBVUkwgKFx1QzYwODogaHR0cDovL2xvY2FsaG9zdDozMDAwKScpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdodHRwOi8vbG9jYWxob3N0OjMwMDAnKVxuXHRcdFx0XHQuc2V0VmFsdWUoc2VydmVyVXJsLnZhbHVlKVxuXHRcdFx0XHQub25DaGFuZ2UodmFsdWUgPT4geyBzZXJ2ZXJVcmwudmFsdWUgPSB2YWx1ZTsgfSlcblx0XHRcdFx0LnRoZW4oZWwgPT4gZWwuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHNjcm9sbFRvSW5wdXQoZWwuaW5wdXRFbCkpKSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnXHVCQ0ZDXHVEMkI4IElEJylcblx0XHRcdC5zZXREZXNjKCdWZWN0b3IgXHVDMTFDXHVCQzg0XHVDNUQwXHVDMTFDIFx1QkMxQ1x1QUUwOVx1QkMxQlx1Qzc0MCBWYXVsdCBJRCcpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdcdUJDRkNcdUQyQjggSURcdUI5N0MgXHVDNzg1XHVCODI1XHVENTU4XHVDMTM4XHVDNjk0Jylcblx0XHRcdFx0LnNldFZhbHVlKHZhdWx0SWQudmFsdWUpXG5cdFx0XHRcdC5vbkNoYW5nZSh2YWx1ZSA9PiB7IHZhdWx0SWQudmFsdWUgPSB2YWx1ZTsgfSlcblx0XHRcdFx0LnRoZW4oZWwgPT4gZWwuaW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHNjcm9sbFRvSW5wdXQoZWwuaW5wdXRFbCkpKSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnQVBJIFx1RDBBNCcpXG5cdFx0XHQuc2V0RGVzYygnXHVDNzc4XHVDOTlEXHVDNkE5IEFQSSBLZXknKVxuXHRcdFx0LmFkZFRleHQodGV4dCA9PiB7XG5cdFx0XHRcdHRleHRcblx0XHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ0FQSSBcdUQwQTRcdUI5N0MgXHVDNzg1XHVCODI1XHVENTU4XHVDMTM4XHVDNjk0Jylcblx0XHRcdFx0XHQuc2V0VmFsdWUoYXBpS2V5LnZhbHVlKVxuXHRcdFx0XHRcdC5vbkNoYW5nZSh2YWx1ZSA9PiB7IGFwaUtleS52YWx1ZSA9IHZhbHVlOyB9KTtcblx0XHRcdFx0dGV4dC5pbnB1dEVsLnR5cGUgPSAncGFzc3dvcmQnO1xuXHRcdFx0XHR0ZXh0LmlucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiBzY3JvbGxUb0lucHV0KHRleHQuaW5wdXRFbCkpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFNQRUMtUExVR0lOLU1VTFRJVkFVTFQtMDAxIFJFUS0wMjk6IFx1RDNGNFx1QjM1NCBcdUQ1NDRcdUI0RENcblx0XHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5zZXROYW1lKCdcdUQzRjRcdUIzNTQnKVxuXHRcdFx0LnNldERlc2ModGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4ICE9PSB1bmRlZmluZWRcblx0XHRcdFx0PyAnXHVEM0Y0XHVCMzU0XHVCQTg1XHVDNzQwIFx1QkNDMFx1QUNCRFx1RDU2MCBcdUMyMTggXHVDNUM2XHVDMkI1XHVCMkM4XHVCMkU0LiBcdUJDQzBcdUFDQkRcdUQ1NThcdUI4MjRcdUJBNzQgXHVCOUU0XHVENTUxXHVDNzQ0IFx1QzgxQ1x1QUM3MCBcdUQ2QzQgXHVCMkU0XHVDMkRDIFx1Q0Q5NFx1QUMwMFx1RDU1OFx1QzEzOFx1QzY5NC4nXG5cdFx0XHRcdDogJ1x1QjNEOVx1QUUzMFx1RDY1NFx1RDU2MCBcdUQzRjRcdUIzNTQgXHVDNzc0XHVCOTg0IChcdUIyRThcdUM3N0MgXHVEM0Y0XHVCMzU0LCBcdUM2MDg6IFByb2plY3RzKScpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdcdUM2MDg6IFByb2plY3RzJylcblx0XHRcdFx0LnNldFZhbHVlKGZvbGRlci52YWx1ZSlcblx0XHRcdFx0Lm9uQ2hhbmdlKHZhbHVlID0+IHsgZm9sZGVyLnZhbHVlID0gdmFsdWU7IH0pXG5cdFx0XHRcdC50aGVuKGVsID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGVsLmlucHV0RWwuZGlzYWJsZWQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbC5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gc2Nyb2xsVG9JbnB1dChlbC5pbnB1dEVsKSk7XG5cdFx0XHRcdH0pKTtcblxuXHRcdC8vIFx1RDBBNFx1QkNGNFx1QjREQyBcdUM3MDQgXHVBQ0Y1XHVBQzA0IFx1RDY1NVx1QkNGNFxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdtb2JpbGUta2V5Ym9hcmQtc3BhY2VyJyB9KTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnXHVDNzg0XHVDMkRDXHVDODAwXHVDN0E1Jylcblx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0cmltbWVkID0gZm9sZGVyLnZhbHVlLnRyaW0oKTtcblx0XHRcdFx0XHRcdGlmICghdHJpbW1lZCkge1xuXHRcdFx0XHRcdFx0XHRuZXcgTm90aWNlKCdcdUQzRjRcdUIzNTRcdUI5N0MgXHVDNzg1XHVCODI1XHVENTc0XHVDOEZDXHVDMTM4XHVDNjk0Jyk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmICghL15bXFxwe0x9XFxwe059IFxcLV9dKyQvdS50ZXN0KHRyaW1tZWQpKSB7XG5cdFx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoJ1x1RDU1Q1x1QUUwMCwgXHVDNjAxXHVCQjM4LCBcdUMyMkJcdUM3OTAsIFx1QUNGNVx1QkMzMSwgLSwgX1x1QjlDQyBcdUFDMDBcdUIyQTVcdUQ1NjlcdUIyQzhcdUIyRTQuJyk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRoaXMuc2F2ZVZhdWx0TWFwcGluZyhzZXJ2ZXJVcmwudmFsdWUsIHZhdWx0SWQudmFsdWUsIGFwaUtleS52YWx1ZSwgdHJpbW1lZCk7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoeyBza2lwUmVjb25uZWN0OiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZSgnXHVDMTI0XHVDODE1XHVDNzc0IFx1QzgwMFx1QzdBNVx1QjQxOFx1QzVDOFx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKGBcdUM4MDBcdUM3QTUgXHVDMkU0XHVEMzI4OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSlcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnXHVDNUYwXHVBQ0IwJylcblx0XHRcdFx0LnNldENsYXNzKCdtb2QtY3RhJylcblx0XHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUM1RjBcdUFDQjAgXHVDOTExLi4uJyk7XG5cdFx0XHRcdFx0YnRuLnNldERpc2FibGVkKHRydWUpO1xuXG5cdFx0XHRcdFx0Y29uc3QgdmFsaWRhdGlvbiA9IHRoaXMudmFsaWRhdGVTZXJ2ZXJVcmwoc2VydmVyVXJsLnZhbHVlKTtcblx0XHRcdFx0XHRpZiAoIXZhbGlkYXRpb24udmFsaWQpIHtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoYFx1QzVGMFx1QUNCMCBcdUMyRTRcdUQzMjg6ICR7dmFsaWRhdGlvbi5lcnJvcn1gKTtcblx0XHRcdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUM1RjBcdUFDQjAnKTtcblx0XHRcdFx0XHRcdGJ0bi5zZXREaXNhYmxlZChmYWxzZSk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgdHJpbW1lZCA9IGZvbGRlci52YWx1ZS50cmltKCk7XG5cdFx0XHRcdFx0aWYgKCF0cmltbWVkKSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKCdcdUQzRjRcdUIzNTRcdUI5N0MgXHVDNzg1XHVCODI1XHVENTc0XHVDOEZDXHVDMTM4XHVDNjk0Jyk7XG5cdFx0XHRcdFx0XHRidG4uc2V0QnV0dG9uVGV4dCgnXHVDNUYwXHVBQ0IwJyk7XG5cdFx0XHRcdFx0XHRidG4uc2V0RGlzYWJsZWQoZmFsc2UpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghL15bXFxwe0x9XFxwe059IFxcLV9dKyQvdS50ZXN0KHRyaW1tZWQpKSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKCdcdUQ1NUNcdUFFMDAsIFx1QzYwMVx1QkIzOCwgXHVDMjJCXHVDNzkwLCBcdUFDRjVcdUJDMzEsIC0sIF9cdUI5Q0MgXHVBQzAwXHVCMkE1XHVENTY5XHVCMkM4XHVCMkU0LicpO1xuXHRcdFx0XHRcdFx0YnRuLnNldEJ1dHRvblRleHQoJ1x1QzVGMFx1QUNCMCcpO1xuXHRcdFx0XHRcdFx0YnRuLnNldERpc2FibGVkKGZhbHNlKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBzdWNjZXNzID0gYXdhaXQgdGhpcy5jaGVja0F1dGgoc2VydmVyVXJsLnZhbHVlLCB2YXVsdElkLnZhbHVlLCBhcGlLZXkudmFsdWUpO1xuXHRcdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnNhdmVWYXVsdE1hcHBpbmcoc2VydmVyVXJsLnZhbHVlLCB2YXVsdElkLnZhbHVlLCBhcGlLZXkudmFsdWUsIHRyaW1tZWQpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoZS5tZXNzYWdlKTtcblx0XHRcdFx0XHRcdFx0YnRuLnNldEJ1dHRvblRleHQoJ1x1QzVGMFx1QUNCMCcpO1xuXHRcdFx0XHRcdFx0XHRidG4uc2V0RGlzYWJsZWQoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zeW5jRW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoJ1x1QzVGMFx1QUNCMCBcdUMxMzFcdUFDRjUnKTtcblx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YnRuLnNldEJ1dHRvblRleHQoJ1x1QzVGMFx1QUNCMCcpO1xuXHRcdFx0XHRcdFx0YnRuLnNldERpc2FibGVkKGZhbHNlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKVxuXHR9XG5cblx0LyoqXG5cdCAqIFx1RDNGNFx1QjM1NCBcdUFDMTJcdUM3NDQgXHVEM0VDXHVENTY4XHVENTU4XHVDNUVDIFZhdWx0TWFwcGluZyBcdUM4MDBcdUM3QTVcblx0ICogLSBcdUQzRjRcdUIzNTRcdUJBODVcdUM1RDAgXCIodlN5bmMpXCIgXHVDODExXHVCQkY4XHVDMEFDIFx1Qzc5MFx1QjNEOSBcdUNEOTRcdUFDMDBcblx0ICogLSBcdUI5RTRcdUQ1NTEgXHVCMEI0IFx1QzkxMVx1QkNGNSBcdUFDQkRcdUI4NUMgXHVCQzBGIFx1QkNGQ1x1RDJCOCBcdUIwQjQgXHVBRTMwXHVDODc0IFx1RDNGNFx1QjM1NFx1QkE4NSBcdUFDODBcdUM5OURcblx0ICovXG5cdHByaXZhdGUgc2F2ZVZhdWx0TWFwcGluZyhzZXJ2ZXJVcmw6IHN0cmluZywgdmF1bHRJZDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZywgZm9sZGVyOiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zZXJ2ZXJVcmwgPSBzZXJ2ZXJVcmw7XG5cdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRJZCA9IHZhdWx0SWQ7XG5cdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuYXBpS2V5ID0gYXBpS2V5O1xuXG5cdFx0Ly8gXHVEM0Y0XHVCMzU0XHVCQTg1XHVDNUQwICh2U3luYykgXHVDODExXHVCQkY4XHVDMEFDIFx1Q0Q5NFx1QUMwMCAoXHVDNzc0XHVCQkY4IFx1Qzc4OFx1QzczQ1x1QkE3NCBcdUM4MUNcdUM2NzgpXG5cdFx0Y29uc3Qgbm9ybWFsaXplZCA9IGZvbGRlci5yZXBsYWNlKC9eXFwvK3xcXC8rJC9nLCAnJyk7XG5cdFx0Y29uc3Qgc3VmZml4ZWQgPSBub3JtYWxpemVkLmVuZHNXaXRoKCcgKHZTeW5jKScpID8gbm9ybWFsaXplZCA6IGAke25vcm1hbGl6ZWR9ICh2U3luYylgO1xuXG5cdFx0Ly8gXHVCOUU0XHVENTUxIFx1QjBCNCBcdUM5MTFcdUJDRjUgXHVBQ0JEXHVCODVDIFx1QUM4MFx1Qzk5RFxuXHRcdGNvbnN0IGV4aXN0aW5nTWFwcGluZ3MgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy52YXVsdE1hcHBpbmdzID8/IFtdO1xuXHRcdGNvbnN0IGR1cGxpY2F0ZUluZGV4ID0gZXhpc3RpbmdNYXBwaW5ncy5maW5kSW5kZXgoKG0sIGlkeCkgPT5cblx0XHRcdG0uZm9sZGVyID09PSBzdWZmaXhlZCAmJiBpZHggIT09IHRoaXMuZWRpdGluZ01hcHBpbmdJbmRleFxuXHRcdCk7XG5cdFx0aWYgKGR1cGxpY2F0ZUluZGV4ICE9PSAtMSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGAnJHtzdWZmaXhlZH0nIFx1RDNGNFx1QjM1NFx1QjI5NCBcdUM3NzRcdUJCRjggXHVCOUU0XHVENTUxXHVCNDE4XHVDNUI0IFx1Qzc4OFx1QzJCNVx1QjJDOFx1QjJFNC5gKTtcblx0XHR9XG5cblx0XHQvLyBcdUJDRkNcdUQyQjggXHVCMEI0IFx1QUUzMFx1Qzg3NCBcdUQzRjRcdUIzNTRcdUJBODUgXHVBQ0JEXHVBQ0UwIChcdUM2RDBcdUJDRjhcdUJBODVcdUM3M0NcdUI4NUMgXHVDQ0I0XHVEMDZDKVxuXHRcdGNvbnN0IGV4aXN0aW5nRm9sZGVyID0gdGhpcy5hcHAudmF1bHQuZ2V0Rm9sZGVyQnlQYXRoKHN1ZmZpeGVkKTtcblx0XHRpZiAoZXhpc3RpbmdGb2xkZXIpIHtcblx0XHRcdG5ldyBOb3RpY2UoYCcke3N1ZmZpeGVkfScgXHVEM0Y0XHVCMzU0XHVBQzAwIFx1Qzc3NFx1QkJGOCBcdUM4NzRcdUM3QUNcdUQ1NThcdUM1RUMgXHVENTc0XHVCMkY5IFx1RDNGNFx1QjM1NFx1Qjk3QyBcdUMwQUNcdUM2QTlcdUQ1NjlcdUIyQzhcdUIyRTQuYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWFwcGluZzogVmF1bHRNYXBwaW5nID0ge1xuXHRcdFx0Zm9sZGVyOiBzdWZmaXhlZCxcblx0XHRcdHZhdWx0SWQsXG5cdFx0XHRhcGlLZXksXG5cdFx0XHRlbmFibGVkOiB0cnVlLFxuXHRcdH07XG5cblx0XHRpZiAodGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIFx1QUUzMFx1Qzg3NCBcdUI5RTRcdUQ1NTEgXHVEM0I4XHVDOUQxXG5cdFx0XHRjb25zdCBtYXBwaW5ncyA9IFsuLi4odGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRNYXBwaW5ncyA/PyBbXSldO1xuXHRcdFx0bWFwcGluZ3NbdGhpcy5lZGl0aW5nTWFwcGluZ0luZGV4XSA9IG1hcHBpbmc7XG5cdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy52YXVsdE1hcHBpbmdzID0gbWFwcGluZ3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFx1QzBDOCBcdUI5RTRcdUQ1NTEgXHVDRDk0XHVBQzAwXG5cdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy52YXVsdE1hcHBpbmdzID0gW1xuXHRcdFx0XHQuLi4odGhpcy5wbHVnaW4uc2V0dGluZ3MudmF1bHRNYXBwaW5ncyA/PyBbXSksXG5cdFx0XHRcdG1hcHBpbmcsXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdG9uQ2xvc2UoKTogdm9pZCB7XG5cdFx0dGhpcy5jb250ZW50RWwuZW1wdHkoKTtcblx0XHR0aGlzLm9uQ2xvc2VDYWxsYmFjaz8uKCk7XG5cdH1cblxuXHQvKipcblx0ICogQE1YOldBUk46IFtBVVRPXSBTU1JGIFx1QkMyOVx1QzlDMCBVUkwgXHVBQzgwXHVDOTlEXG5cdCAqIEBNWDpSRUFTT046IFx1QzBBQ1x1QzZBOVx1Qzc5MCBcdUM3ODVcdUI4MjUgVVJMIFx1QUM4MFx1Qzk5RFx1QzczQ1x1Qjg1QyBcdUMwQUNcdUMxMjQgSVAgXHVCQzBGIFx1QkU0NEhUVFBTIFx1Q0MyOFx1QjJFOFxuXHQgKi9cblx0cHJpdmF0ZSB2YWxpZGF0ZVNlcnZlclVybCh1cmw6IHN0cmluZyk6IHsgdmFsaWQ6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG5cdFx0XHRpZiAocGFyc2VkLnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiBwYXJzZWQucHJvdG9jb2wgIT09ICdodHRwOicpIHtcblx0XHRcdFx0cmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0hUVFAgXHVCNjEwXHVCMjk0IEhUVFBTIFx1RDUwNFx1Qjg1Q1x1RDFBMFx1Q0Y1Q1x1QjlDQyBcdUM5QzBcdUM2RDBcdUQ1NjlcdUIyQzhcdUIyRTQnIH07XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBob3N0bmFtZSA9IHBhcnNlZC5ob3N0bmFtZTtcblx0XHRcdGNvbnN0IGlzTG9jYWxob3N0ID0gaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnIHx8IGhvc3RuYW1lID09PSAnMTI3LjAuMC4xJyB8fCBob3N0bmFtZSA9PT0gJzo6MSc7XG5cdFx0XHRpZiAocGFyc2VkLnByb3RvY29sID09PSAnaHR0cDonICYmICFpc0xvY2FsaG9zdCkge1xuXHRcdFx0XHRyZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiAnSFRUUFNcdUFDMDAgXHVENTQ0XHVDNjk0XHVENTY5XHVCMkM4XHVCMkU0IChsb2NhbGhvc3RcdUIyOTQgSFRUUCBcdUQ1QzhcdUM2QTkpJyB9O1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgcHJpdmF0ZUlwUGF0dGVybiA9IC9eKDEwXFwufDE3MlxcLigxWzYtOV18MlswLTldfDNbMDFdKVxcLnwxOTJcXC4xNjhcXC58MTY5XFwuMjU0XFwuKS87XG5cdFx0XHRpZiAocHJpdmF0ZUlwUGF0dGVybi50ZXN0KGhvc3RuYW1lKSAmJiAhaXNMb2NhbGhvc3QpIHtcblx0XHRcdFx0bmV3IE5vdGljZSgnXHVDMEFDXHVDMTI0IElQIFx1QzhGQ1x1QzE4Q1x1QzVEMCBcdUM1RjBcdUFDQjBcdUQ1NjlcdUIyQzhcdUIyRTQuIFx1QjNEOVx1Qzc3QyBcdUIxMjRcdUQyQjhcdUM2Q0NcdUQwNkNcdUM1RDAgXHVDNzg4XHVCMjk0IFx1QzExQ1x1QkM4NFx1Qzc3OFx1QzlDMCBcdUQ2NTVcdUM3NzhcdUQ1NThcdUMxMzhcdUM2OTQuJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1x1QzcyMFx1RDZBOFx1RDU1OFx1QzlDMCBcdUM1NEFcdUM3NDAgVVJMIFx1RDYxNVx1QzJERFx1Qzc4NVx1QjJDOFx1QjJFNCcgfTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGNoZWNrQXV0aChzZXJ2ZXJVcmw6IHN0cmluZywgdmF1bHRJZDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmICghc2VydmVyVXJsKSB7XG5cdFx0XHRuZXcgTm90aWNlKCdcdUMxMUNcdUJDODQgVVJMXHVDNzQ0IFx1Qzc4NVx1QjgyNVx1RDU3NFx1QzhGQ1x1QzEzOFx1QzY5NCcpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoIXZhdWx0SWQgfHwgIWFwaUtleSkge1xuXHRcdFx0bmV3IE5vdGljZSgnXHVCQ0ZDXHVEMkI4IElEXHVDNjQwIEFQSSBcdUQwQTRcdUI5N0MgXHVDNzg1XHVCODI1XHVENTc0XHVDOEZDXHVDMTM4XHVDNjk0Jyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7c2VydmVyVXJsfS92MS92YXVsdC92ZXJpZnlgLCB7XG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0XHRcdFx0fSxcblx0XHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoeyB2YXVsdElkLCBhcGlLZXkgfSksXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0XHRjb25zdCBlcnJvckRhdGE6IGFueSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBlcnJvcjogJ1Vua25vd24gZXJyb3InIH0pKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGVycm9yRGF0YS5lcnJvciB8fCBgSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZGF0YTogYW55ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXHRcdFx0cmV0dXJuIGRhdGEudmFsaWQgPT09IHRydWU7XG5cdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcignW0F1dGggQ2hlY2sgRXJyb3JdJywgZXJyb3IpO1xuXHRcdFx0bmV3IE5vdGljZShgXHVDNzc4XHVDOTlEIFx1QzJFNFx1RDMyODogJHtlcnJvci5tZXNzYWdlfWApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxufVxuIiwgImltcG9ydCB7IEFwcCwgTW9kYWwsIE5vdGljZSwgU2V0dGluZywgUGxhdGZvcm0gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IENvbmZsaWN0SW5mbywgTG9jYWxGaWxlQXBwcm92YWwsIFN5bmNBY3Rpb24gfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7XG5cdGNvbXByZXNzVHJlZSxcblx0cHJvcGFnYXRlU2VsZWN0aW9uLFxuXHRyZW5kZXJGaWxlVHJlZSxcblx0Y29sbGVjdEV4cGFuZGVkUGF0aHMsXG5cdHN0b3JlRXhwYW5kZWRQYXRocyxcblx0Z2V0U3RvcmVkRXhwYW5kZWRQYXRocyxcblx0dHlwZSBGaWxlVHJlZU5vZGUsXG5cdHR5cGUgVHJlZUNhbGxiYWNrcyxcblx0dHlwZSBUcmVlUmVuZGVyQ29uZmlnLFxuXHR0eXBlIEFjdGlvbk9wdGlvbixcbn0gZnJvbSAnLi9maWxlLXRyZWUnO1xuaW1wb3J0IHsgQ29uZmxpY3REaWZmTW9kYWwgfSBmcm9tICcuL2NvbmZsaWN0LW1vZGFsJztcbmltcG9ydCB7IGZvcm1hdERhdGUsIGZvcm1hdFNpemUgfSBmcm9tICcuL3V0aWxzJztcblxudHlwZSBGaWx0ZXJUeXBlID0gJ2FsbCcgfCAnY29uZmxpY3QnIHwgJ2xvY2FsLW9ubHknO1xuXG4vKiogXHVCM0M0XHVCQTU0XHVDNzc4IFx1RDM5OFx1Qzc3NFx1Qjg1Q1x1QjREQzogXHVDREE5XHVCM0NDIFx1QjYxMFx1QjI5NCBcdUI4NUNcdUNFRUMgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdUM4MTVcdUJDRjQgKi9cbmludGVyZmFjZSBTeW5jRmlsZURhdGEge1xuXHRraW5kOiAnY29uZmxpY3QnIHwgJ2xvY2FsLW9ubHknO1xuXHRjb25mbGljdD86IENvbmZsaWN0SW5mbztcblx0bG9jYWxGaWxlPzogTG9jYWxGaWxlQXBwcm92YWw7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBcdUQyQjhcdUI5QUMgXHVCRTRDXHVCMzU0IChmaWxlLXRyZWUudHNcdUM1RDBcdUMxMUMgXHVDNzc0XHVBRDAwKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuZnVuY3Rpb24gYnVpbGRTeW5jRmlsZVRyZWUoXG5cdGNvbmZsaWN0czogQ29uZmxpY3RJbmZvW10sXG5cdGxvY2FsRmlsZXM6IExvY2FsRmlsZUFwcHJvdmFsW10sXG4pOiBGaWxlVHJlZU5vZGU8U3luY0ZpbGVEYXRhPltdIHtcblx0Y29uc3QgdHJlZTogRmlsZVRyZWVOb2RlPFN5bmNGaWxlRGF0YT5bXSA9IFtdO1xuXHRjb25zdCBmb2xkZXJNYXAgPSBuZXcgTWFwPHN0cmluZywgRmlsZVRyZWVOb2RlPFN5bmNGaWxlRGF0YT4+KCk7XG5cdGNvbnN0IHN0b3JlZFBhdGhzID0gZ2V0U3RvcmVkRXhwYW5kZWRQYXRocygpO1xuXG5cdC8vIFx1Q0RBOVx1QjNDQyBcdUQzMENcdUM3N0MgXHVDQzk4XHVCOUFDXG5cdGZvciAoY29uc3QgY29uZmxpY3Qgb2YgY29uZmxpY3RzKSB7XG5cdFx0Y29uc3QgcGF0aFBhcnRzID0gY29uZmxpY3QucGF0aC5zcGxpdCgnLycpLmZpbHRlcigocCkgPT4gcC5sZW5ndGggPiAwKTtcblx0XHRsZXQgY3VycmVudExldmVsID0gdHJlZTtcblx0XHRsZXQgY3VycmVudFBhdGggPSAnJztcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aFBhcnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjdXJyZW50UGF0aCArPSAoY3VycmVudFBhdGggPyAnLycgOiAnJykgKyBwYXRoUGFydHNbaV07XG5cdFx0XHRpZiAoIWZvbGRlck1hcC5oYXMoY3VycmVudFBhdGgpKSB7XG5cdFx0XHRcdGNvbnN0IHdhc0V4cGFuZGVkID0gc3RvcmVkUGF0aHMuc2l6ZSA+IDAgPyBzdG9yZWRQYXRocy5oYXMoY3VycmVudFBhdGgpIDogdHJ1ZTtcblx0XHRcdFx0Y29uc3QgZm9sZGVyTm9kZTogRmlsZVRyZWVOb2RlPFN5bmNGaWxlRGF0YT4gPSB7XG5cdFx0XHRcdFx0bmFtZTogcGF0aFBhcnRzW2ldLFxuXHRcdFx0XHRcdHBhdGg6IGN1cnJlbnRQYXRoLFxuXHRcdFx0XHRcdHR5cGU6ICdmb2xkZXInLFxuXHRcdFx0XHRcdGNoaWxkcmVuOiBbXSxcblx0XHRcdFx0XHRkZXB0aDogaSxcblx0XHRcdFx0XHRleHBhbmRlZDogd2FzRXhwYW5kZWQsXG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdGluZGV0ZXJtaW5hdGU6IGZhbHNlLFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmb2xkZXJNYXAuc2V0KGN1cnJlbnRQYXRoLCBmb2xkZXJOb2RlKTtcblx0XHRcdFx0Y3VycmVudExldmVsLnB1c2goZm9sZGVyTm9kZSk7XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50TGV2ZWwgPSBmb2xkZXJNYXAuZ2V0KGN1cnJlbnRQYXRoKSEuY2hpbGRyZW47XG5cdFx0fVxuXG5cdFx0Y3VycmVudExldmVsLnB1c2goe1xuXHRcdFx0bmFtZTogcGF0aFBhcnRzW3BhdGhQYXJ0cy5sZW5ndGggLSAxXSB8fCBjb25mbGljdC5wYXRoLFxuXHRcdFx0cGF0aDogY29uZmxpY3QucGF0aCxcblx0XHRcdHR5cGU6ICdmaWxlJyxcblx0XHRcdGNoaWxkcmVuOiBbXSxcblx0XHRcdGRlcHRoOiBwYXRoUGFydHMubGVuZ3RoLFxuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlLFxuXHRcdFx0c2VsZWN0ZWQ6IGZhbHNlLFxuXHRcdFx0aW5kZXRlcm1pbmF0ZTogZmFsc2UsXG5cdFx0XHRkYXRhOiB7IGtpbmQ6ICdjb25mbGljdCcsIGNvbmZsaWN0IH0sXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBcdUI4NUNcdUNFRUMgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdUNDOThcdUI5QUNcblx0Zm9yIChjb25zdCBmaWxlIG9mIGxvY2FsRmlsZXMpIHtcblx0XHRjb25zdCBwYXRoUGFydHMgPSBmaWxlLmZvbGRlci5zcGxpdCgnLycpLmZpbHRlcigocCkgPT4gcC5sZW5ndGggPiAwKTtcblx0XHRsZXQgY3VycmVudExldmVsID0gdHJlZTtcblx0XHRsZXQgY3VycmVudFBhdGggPSAnJztcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aFBhcnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjdXJyZW50UGF0aCArPSAoY3VycmVudFBhdGggPyAnLycgOiAnJykgKyBwYXRoUGFydHNbaV07XG5cdFx0XHRpZiAoIWZvbGRlck1hcC5oYXMoY3VycmVudFBhdGgpKSB7XG5cdFx0XHRcdGNvbnN0IHdhc0V4cGFuZGVkID0gc3RvcmVkUGF0aHMuc2l6ZSA+IDAgPyBzdG9yZWRQYXRocy5oYXMoY3VycmVudFBhdGgpIDogdHJ1ZTtcblx0XHRcdFx0Y29uc3QgZm9sZGVyTm9kZTogRmlsZVRyZWVOb2RlPFN5bmNGaWxlRGF0YT4gPSB7XG5cdFx0XHRcdFx0bmFtZTogcGF0aFBhcnRzW2ldLFxuXHRcdFx0XHRcdHBhdGg6IGN1cnJlbnRQYXRoLFxuXHRcdFx0XHRcdHR5cGU6ICdmb2xkZXInLFxuXHRcdFx0XHRcdGNoaWxkcmVuOiBbXSxcblx0XHRcdFx0XHRkZXB0aDogaSxcblx0XHRcdFx0XHRleHBhbmRlZDogd2FzRXhwYW5kZWQsXG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdGluZGV0ZXJtaW5hdGU6IGZhbHNlLFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmb2xkZXJNYXAuc2V0KGN1cnJlbnRQYXRoLCBmb2xkZXJOb2RlKTtcblx0XHRcdFx0Y3VycmVudExldmVsLnB1c2goZm9sZGVyTm9kZSk7XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50TGV2ZWwgPSBmb2xkZXJNYXAuZ2V0KGN1cnJlbnRQYXRoKSEuY2hpbGRyZW47XG5cdFx0fVxuXG5cdFx0Y3VycmVudExldmVsLnB1c2goe1xuXHRcdFx0bmFtZTogZmlsZS5iYXNlbmFtZSxcblx0XHRcdHBhdGg6IGZpbGUucGF0aCxcblx0XHRcdHR5cGU6ICdmaWxlJyxcblx0XHRcdGNoaWxkcmVuOiBbXSxcblx0XHRcdGRlcHRoOiBwYXRoUGFydHMubGVuZ3RoLFxuXHRcdFx0ZXhwYW5kZWQ6IGZhbHNlLFxuXHRcdFx0c2VsZWN0ZWQ6IGZhbHNlLFxuXHRcdFx0aW5kZXRlcm1pbmF0ZTogZmFsc2UsXG5cdFx0XHRkYXRhOiB7IGtpbmQ6ICdsb2NhbC1vbmx5JywgbG9jYWxGaWxlOiBmaWxlIH0sXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gY2xlYW5UcmVlKHRyZWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhblRyZWUobm9kZXM6IEZpbGVUcmVlTm9kZTxTeW5jRmlsZURhdGE+W10pOiBGaWxlVHJlZU5vZGU8U3luY0ZpbGVEYXRhPltdIHtcblx0Y29uc3QgZmlsdGVyZWQgPSBub2Rlc1xuXHRcdC5maWx0ZXIoKG5vZGUpID0+IG5vZGUudHlwZSA9PT0gJ2ZpbGUnIHx8IGhhc0ZpbGVEZXNjZW5kYW50KG5vZGUpKVxuXHRcdC5tYXAoKG5vZGUpID0+IHtcblx0XHRcdGlmIChub2RlLnR5cGUgPT09ICdmb2xkZXInKSB7XG5cdFx0XHRcdG5vZGUuY2hpbGRyZW4gPSBjbGVhblRyZWUobm9kZS5jaGlsZHJlbik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbm9kZTtcblx0XHR9KTtcblxuXHRyZXR1cm4gZmlsdGVyZWQuc29ydCgoYSwgYikgPT4ge1xuXHRcdGNvbnN0IGFLaW5kID0gYS5kYXRhPy5raW5kO1xuXHRcdGNvbnN0IGJLaW5kID0gYi5kYXRhPy5raW5kO1xuXHRcdGlmIChhS2luZCA9PT0gJ2NvbmZsaWN0JyAmJiBiS2luZCAhPT0gJ2NvbmZsaWN0JykgcmV0dXJuIC0xO1xuXHRcdGlmIChhS2luZCAhPT0gJ2NvbmZsaWN0JyAmJiBiS2luZCA9PT0gJ2NvbmZsaWN0JykgcmV0dXJuIDE7XG5cdFx0aWYgKGEudHlwZSAhPT0gYi50eXBlKSByZXR1cm4gYS50eXBlID09PSAnZm9sZGVyJyA/IC0xIDogMTtcblx0XHRyZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhc0ZpbGVEZXNjZW5kYW50KG5vZGU6IEZpbGVUcmVlTm9kZTxTeW5jRmlsZURhdGE+KTogYm9vbGVhbiB7XG5cdGlmIChub2RlLnR5cGUgPT09ICdmaWxlJykgcmV0dXJuIHRydWU7XG5cdHJldHVybiBub2RlLmNoaWxkcmVuLnNvbWUoaGFzRmlsZURlc2NlbmRhbnQpO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgXHVCODBDXHVCMzU0XHVCOUMxIFx1QzEyNFx1QzgxNSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuY29uc3QgQ09ORkxJQ1RfQUNUSU9OUzogQWN0aW9uT3B0aW9uW10gPSBbXG5cdHsgdmFsdWU6ICdzZXJ2ZXInLCBsYWJlbDogJ1x1QzExQ1x1QkM4NCBcdUJDODRcdUM4MDQnIH0sXG5cdHsgdmFsdWU6ICdsb2NhbCcsIGxhYmVsOiAnXHVCODVDXHVDRUVDIFx1QkM4NFx1QzgwNCcgfSxcbl07XG5cbmNvbnN0IExPQ0FMX0FDVElPTlM6IEFjdGlvbk9wdGlvbltdID0gW1xuXHR7IHZhbHVlOiAndXBsb2FkJywgbGFiZWw6ICdcdUM1QzVcdUI4NUNcdUI0REMnIH0sXG5cdHsgdmFsdWU6ICdza2lwJywgbGFiZWw6ICdcdUFDNzRcdUIxMDhcdUI2RjBcdUFFMzAnIH0sXG5cdHsgdmFsdWU6ICdkZWxldGUnLCBsYWJlbDogJ1x1QzBBRFx1QzgxQycgfSxcbl07XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlbmRlckNvbmZpZyhcblx0YWN0aW9uczogTWFwPHN0cmluZywgU3luY0FjdGlvbj4sXG5cdG9uQ29uZmxpY3RDbGljazogKHBhdGg6IHN0cmluZykgPT4gdm9pZCxcbik6IFRyZWVSZW5kZXJDb25maWc8U3luY0ZpbGVEYXRhPiB7XG5cdHJldHVybiB7XG5cdFx0Z2V0TWV0YShub2RlKSB7XG5cdFx0XHRjb25zdCBkYXRhID0gbm9kZS5kYXRhO1xuXHRcdFx0aWYgKCFkYXRhKSByZXR1cm4gJyc7XG5cdFx0XHRpZiAoZGF0YS5raW5kID09PSAnY29uZmxpY3QnICYmIGRhdGEuY29uZmxpY3QpIHtcblx0XHRcdFx0Y29uc3QgYyA9IGRhdGEuY29uZmxpY3Q7XG5cdFx0XHRcdGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRjb25zdCBmb2xkZXIgPSBjLnBhdGguc3Vic3RyaW5nKDAsIGMucGF0aC5sYXN0SW5kZXhPZignLycpKSB8fCAnLyc7XG5cdFx0XHRcdGlmIChmb2xkZXIgIT09ICcvJykgcGFydHMucHVzaChmb2xkZXIpO1xuXHRcdFx0XHRwYXJ0cy5wdXNoKGBcdUI4NUNcdUNFRUM6ICR7Zm9ybWF0U2l6ZShjLmxvY2FsU2l6ZSl9YCk7XG5cdFx0XHRcdHBhcnRzLnB1c2goYFx1QzExQ1x1QkM4NDogJHtmb3JtYXRTaXplKGMuc2VydmVyU2l6ZSl9YCk7XG5cdFx0XHRcdGlmIChjLnNlcnZlclVwZGF0ZWRBdCkgcGFydHMucHVzaChgXHVDMTFDXHVCQzg0IFx1QzIxOFx1QzgxNTogJHtmb3JtYXREYXRlKGMuc2VydmVyVXBkYXRlZEF0KX1gKTtcblx0XHRcdFx0cmV0dXJuIHBhcnRzLmpvaW4oJyBcdTAwQjcgJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZGF0YS5sb2NhbEZpbGUpIHtcblx0XHRcdFx0Y29uc3QgZiA9IGRhdGEubG9jYWxGaWxlO1xuXHRcdFx0XHRjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblx0XHRcdFx0aWYgKGYuZm9sZGVyICE9PSAnLycpIHBhcnRzLnB1c2goZi5mb2xkZXIpO1xuXHRcdFx0XHRwYXJ0cy5wdXNoKGZvcm1hdFNpemUoZi5zaXplKSk7XG5cdFx0XHRcdHBhcnRzLnB1c2goZm9ybWF0RGF0ZShmLm10aW1lKSk7XG5cdFx0XHRcdHJldHVybiBwYXJ0cy5qb2luKCcgXHUwMEI3ICcpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH0sXG5cblx0XHRnZXRJY29uKG5vZGUpIHtcblx0XHRcdGlmIChub2RlLmRhdGE/LmtpbmQgPT09ICdjb25mbGljdCcpIHJldHVybiAnXHUyNkEwXHVGRTBGJztcblx0XHRcdGlmIChub2RlLmRhdGE/LmxvY2FsRmlsZSkgcmV0dXJuICdcdUQ4M0RcdURDRTQnO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSxcblxuXHRcdGdldEJhZGdlKG5vZGUpIHtcblx0XHRcdGNvbnN0IGlzQmluYXJ5ID0gbm9kZS5kYXRhPy5jb25mbGljdD8uaXNCaW5hcnkgPz8gbm9kZS5kYXRhPy5sb2NhbEZpbGU/LmlzQmluYXJ5O1xuXHRcdFx0aWYgKCFpc0JpbmFyeSkgcmV0dXJuIG51bGw7XG5cdFx0XHRjb25zdCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblx0XHRcdGJhZGdlLmNsYXNzTmFtZSA9ICdmaWxlLWJpbmFyeS1iYWRnZSc7XG5cdFx0XHRiYWRnZS50ZXh0Q29udGVudCA9ICdcdUM3NzRcdUM5QzQgXHVEMzBDXHVDNzdDJztcblx0XHRcdHJldHVybiBiYWRnZTtcblx0XHR9LFxuXG5cdFx0Z2V0SXRlbUNsYXNzKG5vZGUpIHtcblx0XHRcdHJldHVybiBub2RlLmRhdGE/LmtpbmQgPT09ICdjb25mbGljdCcgPyAndnRyZWUtY29uZmxpY3QtaXRlbScgOiBudWxsO1xuXHRcdH0sXG5cblx0XHRnZXRBY3Rpb25zKG5vZGUpIHtcblx0XHRcdGlmIChub2RlLmRhdGE/LmtpbmQgPT09ICdjb25mbGljdCcpIHJldHVybiBDT05GTElDVF9BQ1RJT05TO1xuXHRcdFx0aWYgKG5vZGUuZGF0YT8ubG9jYWxGaWxlKSByZXR1cm4gTE9DQUxfQUNUSU9OUztcblx0XHRcdHJldHVybiBbXTtcblx0XHR9LFxuXG5cdFx0Z2V0U2VsZWN0ZWRBY3Rpb24obm9kZSkge1xuXHRcdFx0cmV0dXJuIGFjdGlvbnMuZ2V0KG5vZGUucGF0aCkgPz8gJ3NlcnZlcic7XG5cdFx0fSxcblxuXHRcdG9uQ2xpY2sobm9kZSkge1xuXHRcdFx0aWYgKG5vZGUuZGF0YT8ua2luZCA9PT0gJ2NvbmZsaWN0Jykge1xuXHRcdFx0XHRvbkNvbmZsaWN0Q2xpY2sobm9kZS5wYXRoKTtcblx0XHRcdH1cblx0XHR9LFxuXHR9O1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgXHVCQUE4XHVCMkVDIFx1RDA3NFx1Qjc5OFx1QzJBNCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBcdUQxQjVcdUQ1NjkgXHVCM0Q5XHVBRTMwXHVENjU0IFx1RDU3NFx1QUNCMCBcdUJBQThcdUIyRUMgKFNQRUMtTU9EQUwtQVJDSC0wMDEpXG4gKiBDb25mbGljdExpc3RNb2RhbFx1QUNGQyBTeW5jQXBwcm92YWxNb2RhbFx1Qzc0NCBcdUQ1NThcdUIwOThcdUM3NTggXHVCQUE4XHVCMkVDXHVCODVDIFx1RDFCNVx1RDU2OVxuICogQE1YOk5PVEU6IFtBVVRPXSBmYW5faW49VEJEIChpbmRleC50cykgXHUyMDE0IFx1RDFCNVx1RDU2OSBcdUQzMENcdUM3N0MgXHVEMkI4XHVCOUFDIFx1QUUzMFx1QkMxOCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVENTc0XHVBQ0IwIFVJXG4gKi9cbmV4cG9ydCBjbGFzcyBTeW5jUmVzb2x1dGlvbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIGRpc21pc3NlZCA9IGZhbHNlO1xuXHRwcml2YXRlIGZpbGVUcmVlOiBGaWxlVHJlZU5vZGU8U3luY0ZpbGVEYXRhPltdO1xuXHRwcml2YXRlIGFjdGlvbnM6IE1hcDxzdHJpbmcsIFN5bmNBY3Rpb24+O1xuXHRwcml2YXRlIGNvbmZsaWN0czogQ29uZmxpY3RJbmZvW107XG5cdHByaXZhdGUgbG9jYWxGaWxlczogTG9jYWxGaWxlQXBwcm92YWxbXTtcblx0cHJpdmF0ZSBjdXJyZW50RmlsdGVyOiBGaWx0ZXJUeXBlID0gJ2FsbCc7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0Y29uZmxpY3RzOiBDb25mbGljdEluZm9bXSxcblx0XHRsb2NhbEZpbGVzOiBMb2NhbEZpbGVBcHByb3ZhbFtdLFxuXHRcdHByaXZhdGUgb25SZXNvbHZlOiAoYWN0aW9uczogTWFwPHN0cmluZywgU3luY0FjdGlvbj4pID0+IHZvaWQsXG5cdFx0cHJpdmF0ZSBvbkNhbmNlbDogKCkgPT4gdm9pZCxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHR0aGlzLmNvbmZsaWN0cyA9IGNvbmZsaWN0cztcblx0XHR0aGlzLmxvY2FsRmlsZXMgPSBsb2NhbEZpbGVzO1xuXHRcdHRoaXMuZmlsZVRyZWUgPSBidWlsZFN5bmNGaWxlVHJlZShjb25mbGljdHMsIGxvY2FsRmlsZXMpO1xuXG5cdFx0dGhpcy5hY3Rpb25zID0gbmV3IE1hcCgpO1xuXHRcdGZvciAoY29uc3QgYyBvZiBjb25mbGljdHMpIHtcblx0XHRcdHRoaXMuYWN0aW9ucy5zZXQoYy5wYXRoLCBjLnNlbGVjdGVkVmVyc2lvbiA9PT0gJ2xvY2FsJyA/ICdsb2NhbCcgOiAnc2VydmVyJyk7XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgZiBvZiBsb2NhbEZpbGVzKSB7XG5cdFx0XHR0aGlzLmFjdGlvbnMuc2V0KGYucGF0aCwgJ3VwbG9hZCcpO1xuXHRcdH1cblx0fVxuXG5cdG9uT3BlbigpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoJ3N5bmMtcmVzb2x1dGlvbi1tb2RhbCcpO1xuXG5cdFx0dGhpcy5yZW5kZXJUaXRsZSgpO1xuXHRcdHRoaXMucmVuZGVyRGVzY3JpcHRpb24oKTtcblxuXHRcdGlmICh0aGlzLmNvbmZsaWN0cy5sZW5ndGggPiAwICYmIHRoaXMubG9jYWxGaWxlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLnJlbmRlckZpbHRlckJhcihjb250ZW50RWwpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxpc3RFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdzeW5jLXJlc29sdXRpb24tZmlsZS1saXN0IHZ0cmVlLWNvbnRhaW5lcicgfSk7XG5cdFx0Y29uc3QgY29tcHJlc3NlZFRyZWUgPSBjb21wcmVzc1RyZWUodGhpcy5maWxlVHJlZSk7XG5cdFx0dGhpcy5yZW5kZXJUcmVlKGNvbXByZXNzZWRUcmVlLCBsaXN0RWwpO1xuXG5cdFx0aWYgKCFQbGF0Zm9ybS5pc01vYmlsZSkge1xuXHRcdFx0dGhpcy5yZW5kZXJFeHBhbmRCdXR0b25zKGNvbnRlbnRFbCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5yZW5kZXJGb290ZXIoY29udGVudEVsKTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVGl0bGUoKTogdm9pZCB7XG5cdFx0Y29uc3QgY2MgPSB0aGlzLmNvbmZsaWN0cy5sZW5ndGg7XG5cdFx0Y29uc3QgbGMgPSB0aGlzLmxvY2FsRmlsZXMubGVuZ3RoO1xuXHRcdGxldCB0aXRsZTogc3RyaW5nO1xuXHRcdGlmIChjYyA+IDAgJiYgbGMgPiAwKSB7XG5cdFx0XHR0aXRsZSA9IGBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMkI5XHVDNzc4IFx1MDBCNyBcdUNEQTlcdUIzQ0MgJHtjY30gXHUwMEI3IFx1Qjg1Q1x1Q0VFQyBcdUM4MDRcdUM2QTkgJHtsY31gO1xuXHRcdH0gZWxzZSBpZiAoY2MgPiAwKSB7XG5cdFx0XHR0aXRsZSA9IGBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDREE5XHVCM0NDICgke2NjfVx1QUMxQylgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aXRsZSA9IGBcdUI4NUNcdUNFRUMgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMkI5XHVDNzc4ICgke2xjfVx1QUMxQylgO1xuXHRcdH1cblx0XHR0aGlzLnRpdGxlRWwuc2V0VGV4dCh0aXRsZSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRlc2NyaXB0aW9uKCk6IHZvaWQge1xuXHRcdGNvbnN0IHRvdGFsID0gdGhpcy5jb25mbGljdHMubGVuZ3RoICsgdGhpcy5sb2NhbEZpbGVzLmxlbmd0aDtcblx0XHR0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHtcblx0XHRcdHRleHQ6IGAke3RvdGFsfVx1QUMxQyBcdUQzMENcdUM3N0NcdUM3NTggXHVDQzk4XHVCOUFDXHVBQzAwIFx1RDU0NFx1QzY5NFx1RDU2OVx1QjJDOFx1QjJFNC5gLFxuXHRcdFx0Y2xzOiAnc3luYy1yZXNvbHV0aW9uLWRlc2MnLFxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJGaWx0ZXJCYXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdGNvbnN0IGZpbHRlckJhciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdzeW5jLWZpbHRlci1iYXInIH0pO1xuXG5cdFx0Y29uc3QgZmlsdGVyczogeyBrZXk6IEZpbHRlclR5cGU7IGxhYmVsOiBzdHJpbmcgfVtdID0gW1xuXHRcdFx0eyBrZXk6ICdhbGwnLCBsYWJlbDogJ1x1QzgwNFx1Q0NCNCcgfSxcblx0XHRcdHsga2V5OiAnY29uZmxpY3QnLCBsYWJlbDogJ1x1Q0RBOVx1QjNDQ1x1QjlDQycgfSxcblx0XHRcdHsga2V5OiAnbG9jYWwtb25seScsIGxhYmVsOiAnXHVCODVDXHVDRUVDIFx1QzgwNFx1QzZBOScgfSxcblx0XHRdO1xuXG5cdFx0Zm9yIChjb25zdCBmaWx0ZXIgb2YgZmlsdGVycykge1xuXHRcdFx0Y29uc3QgYnRuID0gZmlsdGVyQmFyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG5cdFx0XHRcdHRleHQ6IGZpbHRlci5sYWJlbCxcblx0XHRcdFx0Y2xzOiBgc3luYy1maWx0ZXItYnRuICR7ZmlsdGVyLmtleSA9PT0gdGhpcy5jdXJyZW50RmlsdGVyID8gJ2lzLWFjdGl2ZScgOiAnJ31gLFxuXHRcdFx0fSk7XG5cdFx0XHRidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuY3VycmVudEZpbHRlciA9IGZpbHRlci5rZXk7XG5cdFx0XHRcdHRoaXMuYXBwbHlGaWx0ZXIoKTtcblx0XHRcdFx0ZmlsdGVyQmFyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zeW5jLWZpbHRlci1idG4nKS5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSk7XG5cdFx0XHRcdGJ0bi5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXBwbHlGaWx0ZXIoKTogdm9pZCB7XG5cdFx0Y29uc3QgY29udGFpbmVyID0gdGhpcy5jb250ZW50RWwucXVlcnlTZWxlY3RvcignLnZ0cmVlLWNvbnRhaW5lcicpIGFzIEhUTUxFbGVtZW50O1xuXHRcdGlmICghY29udGFpbmVyKSByZXR1cm47XG5cblx0XHRjb25zdCBpdGVtcyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcudnRyZWUtZmlsZS1pdGVtJyk7XG5cdFx0aXRlbXMuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdGNvbnN0IGVsID0gaXRlbSBhcyBIVE1MRWxlbWVudDtcblx0XHRcdGNvbnN0IGlzQ29uZmxpY3QgPSBlbC5jbGFzc0xpc3QuY29udGFpbnMoJ3Z0cmVlLWNvbmZsaWN0LWl0ZW0nKTtcblxuXHRcdFx0c3dpdGNoICh0aGlzLmN1cnJlbnRGaWx0ZXIpIHtcblx0XHRcdFx0Y2FzZSAnYWxsJzpcblx0XHRcdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKCd2dHJlZS1oaWRkZW4nKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnY29uZmxpY3QnOlxuXHRcdFx0XHRcdGVsLmNsYXNzTGlzdC50b2dnbGUoJ3Z0cmVlLWhpZGRlbicsICFpc0NvbmZsaWN0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnbG9jYWwtb25seSc6XG5cdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnRvZ2dsZSgndnRyZWUtaGlkZGVuJywgaXNDb25mbGljdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLnZ0cmVlLWZvbGRlci1oZWFkZXInKS5mb3JFYWNoKGhlYWRlciA9PiB7XG5cdFx0XHQoaGVhZGVyIGFzIEhUTUxFbGVtZW50KS5jbGFzc0xpc3QucmVtb3ZlKCd2dHJlZS1oaWRkZW4nKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRXhwYW5kQnV0dG9ucyhjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XG5cdFx0Y29uc3QgYnV0dG9uUm93ID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ3Z0cmVlLWJ1dHRvbi1yb3cnIH0pO1xuXG5cdFx0Y29uc3QgZXhwYW5kQWxsQnRuID0gYnV0dG9uUm93LmNyZWF0ZUVsKCdidXR0b24nLCB7XG5cdFx0XHR0ZXh0OiAnXHVCQUE4XHVCNDUwIFx1RDNCQ1x1Q0U2OCcsXG5cdFx0XHRjbHM6ICd2dHJlZS1leHBhbmQtYnRuJyxcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNvbGxhcHNlQWxsQnRuID0gYnV0dG9uUm93LmNyZWF0ZUVsKCdidXR0b24nLCB7XG5cdFx0XHR0ZXh0OiAnXHVCQUE4XHVCNDUwIFx1QzgxMVx1Qzc0QycsXG5cdFx0XHRjbHM6ICd2dHJlZS1jb2xsYXBzZS1idG4nLFxuXHRcdH0pO1xuXG5cdFx0ZXhwYW5kQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5zZXRBbGxFeHBhbmRlZCh0cnVlKSk7XG5cdFx0Y29sbGFwc2VBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnNldEFsbEV4cGFuZGVkKGZhbHNlKSk7XG5cdH1cblxuXHRwcml2YXRlIHNldEFsbEV4cGFuZGVkKGV4cGFuZGVkOiBib29sZWFuKTogdm9pZCB7XG5cdFx0ZnVuY3Rpb24gdXBkYXRlTm9kZShub2RlOiBGaWxlVHJlZU5vZGU8U3luY0ZpbGVEYXRhPik6IHZvaWQge1xuXHRcdFx0aWYgKG5vZGUudHlwZSA9PT0gJ2ZvbGRlcicpIHtcblx0XHRcdFx0bm9kZS5leHBhbmRlZCA9IGV4cGFuZGVkO1xuXHRcdFx0XHRub2RlLmNoaWxkcmVuLmZvckVhY2godXBkYXRlTm9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuZmlsZVRyZWUuZm9yRWFjaCh1cGRhdGVOb2RlKTtcblxuXHRcdGNvbnN0IGV4cGFuZGVkUGF0aHMgPSBjb2xsZWN0RXhwYW5kZWRQYXRocyh0aGlzLmZpbGVUcmVlKTtcblx0XHRzdG9yZUV4cGFuZGVkUGF0aHMobmV3IFNldChleHBhbmRlZFBhdGhzKSk7XG5cdFx0dGhpcy5yZWZyZXNoVHJlZSgpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUcmVlKHRyZWU6IEZpbGVUcmVlTm9kZTxTeW5jRmlsZURhdGE+W10sIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcblx0XHRjb25zdCBjYWxsYmFja3M6IFRyZWVDYWxsYmFja3MgPSB7XG5cdFx0XHRvbkFjdGlvbkNoYW5nZTogKHBhdGg6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0dGhpcy5hY3Rpb25zLnNldChwYXRoLCBhY3Rpb24gYXMgU3luY0FjdGlvbik7XG5cblx0XHRcdFx0Y29uc3QgZmlsZSA9IHRoaXMubG9jYWxGaWxlcy5maW5kKGYgPT4gZi5wYXRoID09PSBwYXRoKTtcblx0XHRcdFx0aWYgKGFjdGlvbiA9PT0gJ2RlbGV0ZScgJiYgZmlsZT8uaXNCaW5hcnkpIHtcblx0XHRcdFx0XHRuZXcgTm90aWNlKCdcdUJDMTRcdUM3NzRcdUIxMDhcdUI5QUMgXHVEMzBDXHVDNzdDXHVDNzQ0IFx1QzBBRFx1QzgxQ1x1RDU1OFx1QkE3NCBcdUJDRjVcdUFENkNcdUQ1NjAgXHVDMjE4IFx1QzVDNlx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG9uVG9nZ2xlRXhwYW5kOiAocGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHRoaXMudG9nZ2xlTm9kZUV4cGFuZChwYXRoKTtcblx0XHRcdFx0dGhpcy5yZWZyZXNoVHJlZSgpO1xuXHRcdFx0fSxcblx0XHRcdG9uVG9nZ2xlU2VsZWN0OiAocGF0aDogc3RyaW5nLCBzZWxlY3RlZDogYm9vbGVhbikgPT4ge1xuXHRcdFx0XHR0aGlzLnRvZ2dsZU5vZGVTZWxlY3QocGF0aCwgc2VsZWN0ZWQpO1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hUcmVlKCk7XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRjb25zdCBjb25maWcgPSBjcmVhdGVSZW5kZXJDb25maWcodGhpcy5hY3Rpb25zLCAocGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0XHRjb25zdCBjb25mbGljdCA9IHRoaXMuY29uZmxpY3RzLmZpbmQoYyA9PiBjLnBhdGggPT09IHBhdGgpO1xuXHRcdFx0aWYgKCFjb25mbGljdCB8fCBjb25mbGljdC5pc0JpbmFyeSkgcmV0dXJuO1xuXG5cdFx0XHRjb25zdCBkaWZmTW9kYWwgPSBuZXcgQ29uZmxpY3REaWZmTW9kYWwoXG5cdFx0XHRcdHRoaXMuYXBwLFxuXHRcdFx0XHRjb25mbGljdCxcblx0XHRcdFx0KHZlcnNpb246ICdsb2NhbCcgfCAnc2VydmVyJykgPT4ge1xuXHRcdFx0XHRcdHRoaXMuYWN0aW9ucy5zZXQocGF0aCwgdmVyc2lvbik7XG5cdFx0XHRcdFx0dGhpcy5yZWZyZXNoVHJlZSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0KTtcblx0XHRcdGRpZmZNb2RhbC5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRyZW5kZXJGaWxlVHJlZShjb250YWluZXIsIHRyZWUsIGNhbGxiYWNrcywgY29uZmlnKTtcblx0fVxuXG5cdHByaXZhdGUgdG9nZ2xlTm9kZUV4cGFuZChwYXRoOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRmdW5jdGlvbiB1cGRhdGVOb2RlKG5vZGU6IEZpbGVUcmVlTm9kZTxTeW5jRmlsZURhdGE+KTogYm9vbGVhbiB7XG5cdFx0XHRpZiAobm9kZS5wYXRoID09PSBwYXRoICYmIG5vZGUudHlwZSA9PT0gJ2ZvbGRlcicpIHtcblx0XHRcdFx0bm9kZS5leHBhbmRlZCA9ICFub2RlLmV4cGFuZGVkO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChub2RlLnR5cGUgPT09ICdmb2xkZXInKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRcdGlmICh1cGRhdGVOb2RlKGNoaWxkKSkgcmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0dGhpcy5maWxlVHJlZS5mb3JFYWNoKG5vZGUgPT4gdXBkYXRlTm9kZShub2RlKSk7XG5cblx0XHRjb25zdCBleHBhbmRlZFBhdGhzID0gY29sbGVjdEV4cGFuZGVkUGF0aHModGhpcy5maWxlVHJlZSk7XG5cdFx0c3RvcmVFeHBhbmRlZFBhdGhzKG5ldyBTZXQoZXhwYW5kZWRQYXRocykpO1xuXHR9XG5cblx0cHJpdmF0ZSB0b2dnbGVOb2RlU2VsZWN0KHBhdGg6IHN0cmluZywgc2VsZWN0ZWQ6IGJvb2xlYW4pOiB2b2lkIHtcblx0XHRmdW5jdGlvbiB1cGRhdGVOb2RlKG5vZGU6IEZpbGVUcmVlTm9kZTxTeW5jRmlsZURhdGE+KTogRmlsZVRyZWVOb2RlPFN5bmNGaWxlRGF0YT4ge1xuXHRcdFx0aWYgKG5vZGUucGF0aCA9PT0gcGF0aCkge1xuXHRcdFx0XHRpZiAobm9kZS50eXBlID09PSAnZmlsZScpIHtcblx0XHRcdFx0XHRyZXR1cm4geyAuLi5ub2RlLCBzZWxlY3RlZCB9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBwcm9wYWdhdGVTZWxlY3Rpb24obm9kZSwgc2VsZWN0ZWQpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG5vZGUudHlwZSA9PT0gJ2ZvbGRlcicpIHtcblx0XHRcdFx0Y29uc3QgdXBkYXRlZENoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAodXBkYXRlTm9kZSk7XG5cdFx0XHRcdGNvbnN0IGFsbFNlbGVjdGVkID0gdXBkYXRlZENoaWxkcmVuLmV2ZXJ5KGMgPT4gYy5zZWxlY3RlZCk7XG5cdFx0XHRcdGNvbnN0IHNvbWVTZWxlY3RlZCA9IHVwZGF0ZWRDaGlsZHJlbi5zb21lKGMgPT4gYy5zZWxlY3RlZCB8fCBjLmluZGV0ZXJtaW5hdGUpO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdFx0Y2hpbGRyZW46IHVwZGF0ZWRDaGlsZHJlbixcblx0XHRcdFx0XHRzZWxlY3RlZDogYWxsU2VsZWN0ZWQsXG5cdFx0XHRcdFx0aW5kZXRlcm1pbmF0ZTogIWFsbFNlbGVjdGVkICYmIHNvbWVTZWxlY3RlZCxcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBub2RlO1xuXHRcdH1cblx0XHR0aGlzLmZpbGVUcmVlID0gdGhpcy5maWxlVHJlZS5tYXAobm9kZSA9PiB1cGRhdGVOb2RlKG5vZGUpKTtcblxuXHRcdGNvbnN0IHN5bmNBY3Rpb25zID0gKG5vZGU6IEZpbGVUcmVlTm9kZTxTeW5jRmlsZURhdGE+KTogdm9pZCA9PiB7XG5cdFx0XHRpZiAobm9kZS50eXBlID09PSAnZmlsZScpIHtcblx0XHRcdFx0aWYgKG5vZGUuZGF0YT8ua2luZCA9PT0gJ2NvbmZsaWN0JykgcmV0dXJuO1xuXHRcdFx0XHRpZiAobm9kZS5kYXRhPy5sb2NhbEZpbGUpIHtcblx0XHRcdFx0XHR0aGlzLmFjdGlvbnMuc2V0KG5vZGUucGF0aCwgbm9kZS5zZWxlY3RlZCA/ICd1cGxvYWQnIDogJ3NraXAnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG5vZGUudHlwZSA9PT0gJ2ZvbGRlcicpIHtcblx0XHRcdFx0bm9kZS5jaGlsZHJlbi5mb3JFYWNoKHN5bmNBY3Rpb25zKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZmlsZVRyZWUuZm9yRWFjaChzeW5jQWN0aW9ucyk7XG5cdH1cblxuXHRwcml2YXRlIHJlZnJlc2hUcmVlKCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGVudEVsLnF1ZXJ5U2VsZWN0b3IoJy52dHJlZS1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudDtcblx0XHRpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuXG5cdFx0Y29udGFpbmVyLmVtcHR5KCk7XG5cdFx0Y29uc3QgY29tcHJlc3NlZFRyZWUgPSBjb21wcmVzc1RyZWUodGhpcy5maWxlVHJlZSk7XG5cdFx0dGhpcy5yZW5kZXJUcmVlKGNvbXByZXNzZWRUcmVlLCBjb250YWluZXIpO1xuXG5cdFx0aWYgKHRoaXMuY3VycmVudEZpbHRlciAhPT0gJ2FsbCcpIHtcblx0XHRcdHRoaXMuYXBwbHlGaWx0ZXIoKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckZvb3Rlcihjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyKVxuXHRcdFx0LmFkZEJ1dHRvbihidG4gPT4gYnRuXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdcdUNERThcdUMxOEMnKVxuXHRcdFx0XHQub25DbGljaygoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5kaXNtaXNzZWQgPSB0cnVlO1xuXHRcdFx0XHRcdHRoaXMub25DYW5jZWwoKTtcblx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdH0pKVxuXHRcdFx0LmFkZEJ1dHRvbihidG4gPT4gYnRuXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdcdUIzRDlcdUFFMzBcdUQ2NTQnKVxuXHRcdFx0XHQuc2V0Q3RhKClcblx0XHRcdFx0Lm9uQ2xpY2soKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuZGlzbWlzc2VkID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLm9uUmVzb2x2ZSh0aGlzLmFjdGlvbnMpO1xuXHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0fSkpO1xuXHR9XG5cblx0b25DbG9zZSgpOiB2b2lkIHtcblx0XHR0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGlmICghdGhpcy5kaXNtaXNzZWQpIHtcblx0XHRcdHRoaXMub25DYW5jZWwoKTtcblx0XHR9XG5cdH1cbn1cbiIsICIvKipcbiAqIFx1RDMwQ1x1Qzc3QyBcdUQyQjhcdUI5QUMgXHVDRUY0XHVEM0VDXHVCMTBDXHVEMkI4IChSRVEtTVUtMDIwfjAyNClcbiAqIEBNWDpOT1RFOiBbQVVUT10gZmFuX2luPTEgKHN5bmMtcmVzb2x1dGlvbi1tb2RhbC50cykgXHUyMDE0IFx1QzgxQ1x1QjEyNFx1QjlBRCBcdUQzMENcdUM3N0MgXHVEMkI4XHVCOUFDLiBcdUIzQzRcdUJBNTRcdUM3NzggXHVEMEMwXHVDNzg1IFx1QkJGOFx1RDNFQ1x1RDU2OC5cbiAqL1xuXG4vLyBSRVEtTVUtMDIxOiBcdUQ2NTVcdUM3QTUvXHVDRDk1XHVDMThDIFx1QzBDMVx1RDBEQyBcdUM5QzBcdUMxOERcdUMxMzFcdUM3NDQgXHVDNzA0XHVENTVDIHNlc3Npb25TdG9yYWdlIFx1RDBBNFxuY29uc3QgVFJFRV9FWFBBTkRfS0VZID0gJ3ZzeW5jLXRyZWUtZXhwYW5kZWQnO1xuXG4vKipcbiAqIFJFUS1NVS0wMjE6IHNlc3Npb25TdG9yYWdlXHVDNUQwXHVDMTFDIFx1RDY1NVx1QzdBNVx1QjQxQyBcdUFDQkRcdUI4NUMgXHVCQUE5XHVCODVEXHVDNzQ0IFx1Qzc3RFx1QzVCNFx1QzYzNFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RvcmVkRXhwYW5kZWRQYXRocygpOiBTZXQ8c3RyaW5nPiB7XG5cdHRyeSB7XG5cdFx0Y29uc3Qgc3RvcmVkID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShUUkVFX0VYUEFORF9LRVkpO1xuXHRcdHJldHVybiBzdG9yZWQgPyBuZXcgU2V0KEpTT04ucGFyc2Uoc3RvcmVkKSkgOiBuZXcgU2V0KCk7XG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiBuZXcgU2V0KCk7XG5cdH1cbn1cblxuLyoqXG4gKiBSRVEtTVUtMDIxOiBcdUQ2NTVcdUM3QTVcdUI0MUMgXHVBQ0JEXHVCODVDIFx1QkFBOVx1Qjg1RFx1Qzc0NCBzZXNzaW9uU3RvcmFnZVx1QzVEMCBcdUM4MDBcdUM3QTVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3JlRXhwYW5kZWRQYXRocyhwYXRoczogU2V0PHN0cmluZz4pOiB2b2lkIHtcblx0dHJ5IHtcblx0XHRzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFRSRUVfRVhQQU5EX0tFWSwgSlNPTi5zdHJpbmdpZnkoWy4uLnBhdGhzXSkpO1xuXHR9IGNhdGNoIHtcblx0XHQvLyBzZXNzaW9uU3RvcmFnZSBcdUMwQUNcdUM2QTkgXHVCRDg4XHVBQzAwXHVCMkE1IFx1MjAxNCBzaWxlbnRseSBza2lwXG5cdH1cbn1cblxuLyoqXG4gKiBSRVEtTVUtMDIxOiBcdUQyQjhcdUI5QUNcdUM1RDBcdUMxMUMgXHVENjU1XHVDN0E1XHVCNDFDIFx1RDNGNFx1QjM1NCBcdUFDQkRcdUI4NUNcdUI5N0MgXHVDMjE4XHVDOUQxXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0RXhwYW5kZWRQYXRoczxUPihub2RlczogRmlsZVRyZWVOb2RlPFQ+W10pOiBzdHJpbmdbXSB7XG5cdGNvbnN0IHBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRmdW5jdGlvbiBjb2xsZWN0KG5vZGVzOiBGaWxlVHJlZU5vZGU8VD5bXSk6IHZvaWQge1xuXHRcdGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuXHRcdFx0aWYgKG5vZGUudHlwZSA9PT0gJ2ZvbGRlcicpIHtcblx0XHRcdFx0aWYgKG5vZGUuZXhwYW5kZWQpIHBhdGhzLnB1c2gobm9kZS5wYXRoKTtcblx0XHRcdFx0Y29sbGVjdChub2RlLmNoaWxkcmVuKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Y29sbGVjdChub2Rlcyk7XG5cdHJldHVybiBwYXRocztcbn1cblxuLyoqXG4gKiBcdUQzMENcdUM3N0MgXHVEMkI4XHVCOUFDIFx1QjE3OFx1QjREQyBcdUQwQzBcdUM3ODUgKFx1QzgxQ1x1QjEyNFx1QjlBRClcbiAqIFJFUS1NVS0wMjA6IFx1RDNGNFx1QjM1NCBcdUFERjhcdUI4RjlcdUQ1NTFcdUM3NDQgXHVDNzA0XHVENTVDIFx1RDJCOFx1QjlBQyBcdUFENkNcdUM4NzBcbiAqIEBNWDpOT1RFOiBbQVVUT10gXHVDODFDXHVCMTI0XHVCOUFEIDxUPlx1Qjg1QyBcdUIzQzRcdUJBNTRcdUM3NzggXHVBQ0IwXHVENTY5IFx1QzgxQ1x1QUM3MC4gZGF0YSBcdUQ1NDRcdUI0RENcdUI4NUMgXHVCM0M0XHVCQTU0XHVDNzc4IFx1RDM5OFx1Qzc3NFx1Qjg1Q1x1QjREQyBcdUM4MDRcdUIyRUMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVRyZWVOb2RlPFQgPSB1bmtub3duPiB7XG5cdG5hbWU6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHR0eXBlOiAnZmlsZScgfCAnZm9sZGVyJztcblx0Y2hpbGRyZW46IEZpbGVUcmVlTm9kZTxUPltdO1xuXHRkZXB0aDogbnVtYmVyO1xuXHRleHBhbmRlZDogYm9vbGVhbjtcblx0c2VsZWN0ZWQ6IGJvb2xlYW47XG5cdGluZGV0ZXJtaW5hdGU6IGJvb2xlYW47XG5cdGRhdGE/OiBUO1xufVxuXG4vKipcbiAqIFx1QzU2MVx1QzE1OCBcdUI0RENcdUI4NkRcdUIyRTRcdUM2QjQgXHVDNjM1XHVDMTU4XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uT3B0aW9uIHtcblx0dmFsdWU6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBcdUIzQzRcdUJBNTRcdUM3NzhcdUJDQzQgXHVCODBDXHVCMzU0XHVCOUMxIFx1QzEyNFx1QzgxNSAoQ0xBVURFLm1kIFNlY3Rpb24gNS4xIFRyZWVDb25maWcpXG4gKiBATVg6Tk9URTogW0FVVE9dIFx1QjgwQ1x1QjM1NFx1QjlDMSBcdUFEMDBcdUMyRUNcdUMwQUNcdUI5N0MgXHVENjM4XHVDRDlDXHVDNzkwXHVDNUQwIFx1QzcwNFx1Qzc4NC4gZmlsZS10cmVlLnRzXHVCMjk0IFx1QjNDNFx1QkE1NFx1Qzc3OCBcdUIzQzVcdUI5QkQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZVJlbmRlckNvbmZpZzxUID0gdW5rbm93bj4ge1xuXHRnZXRNZXRhKG5vZGU6IEZpbGVUcmVlTm9kZTxUPik6IHN0cmluZztcblx0Z2V0SWNvbihub2RlOiBGaWxlVHJlZU5vZGU8VD4pOiBzdHJpbmcgfCBudWxsO1xuXHRnZXRCYWRnZShub2RlOiBGaWxlVHJlZU5vZGU8VD4pOiBIVE1MRWxlbWVudCB8IG51bGw7XG5cdGdldEl0ZW1DbGFzcyhub2RlOiBGaWxlVHJlZU5vZGU8VD4pOiBzdHJpbmcgfCBudWxsO1xuXHRnZXRBY3Rpb25zKG5vZGU6IEZpbGVUcmVlTm9kZTxUPik6IEFjdGlvbk9wdGlvbltdO1xuXHRnZXRTZWxlY3RlZEFjdGlvbihub2RlOiBGaWxlVHJlZU5vZGU8VD4pOiBzdHJpbmc7XG5cdG9uQ2xpY2s/KG5vZGU6IEZpbGVUcmVlTm9kZTxUPik6IHZvaWQ7XG59XG5cbi8qKlxuICogXHVEMkI4XHVCOUFDIFx1Q0Y1Q1x1QkMzMSBcdUQ1NjhcdUMyMTggXHVEMEMwXHVDNzg1IChcdUIzQzRcdUJBNTRcdUM3NzggXHVCQjM0XHVBRDAwKVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVDYWxsYmFja3Mge1xuXHRvbkFjdGlvbkNoYW5nZTogKHBhdGg6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpID0+IHZvaWQ7XG5cdG9uVG9nZ2xlRXhwYW5kOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkO1xuXHRvblRvZ2dsZVNlbGVjdDogKHBhdGg6IHN0cmluZywgc2VsZWN0ZWQ6IGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbi8qKlxuICogUkVRLU1VLTAyMzogXHVBQ0JEXHVCODVDIFx1QzU1NVx1Q0Q5NSBcdUQ1NjhcdUMyMThcbiAqIFx1QjJFOFx1Qzc3QyBcdUM3OTBcdUMyREQgXHVEM0Y0XHVCMzU0XHVCOTdDIFx1QkNEMVx1RDU2OVx1RDU1OFx1QzVFQyBcdUFDQkRcdUI4NUNcdUI5N0MgXHVCMkU4XHVDRDk1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc1RyZWU8VD4odHJlZTogRmlsZVRyZWVOb2RlPFQ+W10pOiBGaWxlVHJlZU5vZGU8VD5bXSB7XG5cdGZ1bmN0aW9uIGNvbXByZXNzTm9kZShub2RlOiBGaWxlVHJlZU5vZGU8VD4pOiBGaWxlVHJlZU5vZGU8VD4ge1xuXHRcdGlmIChub2RlLnR5cGUgPT09ICdmaWxlJykgcmV0dXJuIG5vZGU7XG5cblx0XHRjb25zdCBjb21wcmVzc2VkQ2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLm1hcChjb21wcmVzc05vZGUpO1xuXG5cdFx0aWYgKFxuXHRcdFx0Y29tcHJlc3NlZENoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0Y29tcHJlc3NlZENoaWxkcmVuWzBdLnR5cGUgPT09ICdmb2xkZXInXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBjaGlsZCA9IGNvbXByZXNzZWRDaGlsZHJlblswXTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdG5hbWU6IG5vZGUubmFtZSArICcvJyArIGNoaWxkLm5hbWUsXG5cdFx0XHRcdHBhdGg6IG5vZGUucGF0aCArICcvJyArIGNoaWxkLm5hbWUsXG5cdFx0XHRcdGNoaWxkcmVuOiBjaGlsZC5jaGlsZHJlbixcblx0XHRcdFx0ZXhwYW5kZWQ6IG5vZGUuZXhwYW5kZWQgJiYgY2hpbGQuZXhwYW5kZWQsXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0Y2hpbGRyZW46IGNvbXByZXNzZWRDaGlsZHJlbixcblx0XHR9O1xuXHR9XG5cblx0cmV0dXJuIHRyZWUubWFwKGNvbXByZXNzTm9kZSk7XG59XG5cbi8qKlxuICogUkVRLU1VLTAyMjogXHVDMTIwXHVEMEREIFx1QzBDMVx1RDBEQyBcdUM4MDRcdUQzMEMgXHVENTY4XHVDMjE4XG4gKiBcdUJEODBcdUJBQThcdUM3NTggXHVDMTIwXHVEMEREIFx1QzBDMVx1RDBEQ1x1Qjk3QyBcdUM3OTBcdUMyRERcdUM1RDBcdUFDOEMgXHVDODA0XHVEMzBDXHVENTU4XHVBQzcwXHVCMDk4IFx1Qzc5MFx1QzJERFx1Qzc1OCBcdUMwQzFcdUQwRENcdUI4NUMgXHVCRDgwXHVCQUE4IFx1QzBDMVx1RDBEQ1x1Qjk3QyBcdUFDMzFcdUMyRTBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BhZ2F0ZVNlbGVjdGlvbjxUPihcblx0bm9kZTogRmlsZVRyZWVOb2RlPFQ+LFxuXHRzZWxlY3RlZD86IGJvb2xlYW4sXG4pOiBGaWxlVHJlZU5vZGU8VD4ge1xuXHRpZiAobm9kZS50eXBlID09PSAnZmlsZScpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdHNlbGVjdGVkOiBzZWxlY3RlZCA/PyBub2RlLnNlbGVjdGVkLFxuXHRcdFx0aW5kZXRlcm1pbmF0ZTogZmFsc2UsXG5cdFx0fTtcblx0fVxuXG5cdGNvbnN0IG5ld0NoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PlxuXHRcdHByb3BhZ2F0ZVNlbGVjdGlvbihjaGlsZCwgc2VsZWN0ZWQpLFxuXHQpO1xuXG5cdGNvbnN0IGFsbFNlbGVjdGVkID0gbmV3Q2hpbGRyZW4uZXZlcnkoKGMpID0+IGMuc2VsZWN0ZWQpO1xuXHRjb25zdCBzb21lU2VsZWN0ZWQgPSBuZXdDaGlsZHJlbi5zb21lKChjKSA9PiBjLnNlbGVjdGVkIHx8IGMuaW5kZXRlcm1pbmF0ZSk7XG5cdHJldHVybiB7XG5cdFx0Li4ubm9kZSxcblx0XHRjaGlsZHJlbjogbmV3Q2hpbGRyZW4sXG5cdFx0c2VsZWN0ZWQ6IHNlbGVjdGVkID8/IGFsbFNlbGVjdGVkLFxuXHRcdGluZGV0ZXJtaW5hdGU6IHNlbGVjdGVkID09PSB1bmRlZmluZWQgPyAhYWxsU2VsZWN0ZWQgJiYgc29tZVNlbGVjdGVkIDogZmFsc2UsXG5cdH07XG59XG5cbi8qKlxuICogUkVRLU1VLTAyMH4wMjQ6IFx1RDMwQ1x1Qzc3QyBcdUQyQjhcdUI5QUMgXHVCODBDXHVCMzU0XHVCOUMxIFx1RDU2OFx1QzIxOFxuICogQE1YOlRPRE86IFtBVVRPXSBcdUQzMENcdUM3N0MgXHVDNTQ0XHVDNzc0XHVDRjU4OiBcdUM3MjBcdUIyQzhcdUNGNTRcdUI0REMgXHVDNzc0XHVCQUE4XHVDOUMwIFx1MjE5MiBPYnNpZGlhbiBzZXRJY29uKCkgQVBJXHVCODVDIFx1QUQ1MFx1Q0NCNCBcdUQ1NDRcdUM2OTRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckZpbGVUcmVlPFQgPSB1bmtub3duPihcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0dHJlZTogRmlsZVRyZWVOb2RlPFQ+W10sXG5cdGNhbGxiYWNrczogVHJlZUNhbGxiYWNrcyxcblx0Y29uZmlnOiBUcmVlUmVuZGVyQ29uZmlnPFQ+LFxuKTogdm9pZCB7XG5cdGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG5cdGZ1bmN0aW9uIHJlbmRlck5vZGUobm9kZTogRmlsZVRyZWVOb2RlPFQ+LCBwYXJlbnRFbDogRG9jdW1lbnRGcmFnbWVudCk6IHZvaWQge1xuXHRcdGlmIChub2RlLnR5cGUgPT09ICdmb2xkZXInKSB7XG5cdFx0XHRyZW5kZXJGb2xkZXIobm9kZSwgcGFyZW50RWwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW5kZXJGaWxlKG5vZGUsIHBhcmVudEVsKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZW5kZXJGb2xkZXIoXG5cdFx0bm9kZTogRmlsZVRyZWVOb2RlPFQ+LFxuXHRcdHBhcmVudEVsOiBEb2N1bWVudEZyYWdtZW50LFxuXHQpOiB2b2lkIHtcblx0XHRjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRoZWFkZXIuY2xhc3NOYW1lID0gJ3Z0cmVlLWZvbGRlci1oZWFkZXInO1xuXHRcdGhlYWRlci5zdHlsZS5zZXRQcm9wZXJ0eSgnLS12dHJlZS1kZXB0aCcsIFN0cmluZyhub2RlLmRlcHRoICogMTQpKTtcblxuXHRcdC8vIFx1RDY1NVx1QzdBNS9cdUNEOTVcdUMxOEMgXHVEMUEwXHVBRTAwIFx1QzU0NFx1Qzc3NFx1Q0Y1OCAoUkVRLU1VLTAyMSlcblx0XHRjb25zdCB0b2dnbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cdFx0dG9nZ2xlLmNsYXNzTmFtZSA9ICd2dHJlZS10b2dnbGUnO1xuXHRcdHRvZ2dsZS50ZXh0Q29udGVudCA9IG5vZGUuZXhwYW5kZWQgPyAnXHUyNUJDJyA6ICdcdTI1QjYnO1xuXHRcdHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0Y2FsbGJhY2tzLm9uVG9nZ2xlRXhwYW5kKG5vZGUucGF0aCk7XG5cdFx0fSk7XG5cdFx0aGVhZGVyLmFwcGVuZENoaWxkKHRvZ2dsZSk7XG5cblx0XHQvLyBcdUQzRjRcdUIzNTQgXHVDQ0I0XHVEMDZDXHVCQzE1XHVDMkE0IChSRVEtTVUtMDIyKVxuXHRcdGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcblx0XHRjaGVja2JveC50eXBlID0gJ2NoZWNrYm94Jztcblx0XHRjaGVja2JveC5jbGFzc05hbWUgPSAndnRyZWUtY2hlY2tib3gnO1xuXHRcdGNoZWNrYm94LmNoZWNrZWQgPSBub2RlLnNlbGVjdGVkO1xuXHRcdGNoZWNrYm94LmluZGV0ZXJtaW5hdGUgPSBub2RlLmluZGV0ZXJtaW5hdGU7XG5cdFx0Y2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGNhbGxiYWNrcy5vblRvZ2dsZVNlbGVjdChub2RlLnBhdGgsICFub2RlLnNlbGVjdGVkKTtcblx0XHR9KTtcblx0XHRoZWFkZXIuYXBwZW5kQ2hpbGQoY2hlY2tib3gpO1xuXG5cdFx0Y29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblx0XHRuYW1lLnRleHRDb250ZW50ID0gbm9kZS5uYW1lO1xuXHRcdG5hbWUuY2xhc3NOYW1lID0gJ3Z0cmVlLWZvbGRlci1uYW1lJztcblx0XHRoZWFkZXIuYXBwZW5kQ2hpbGQobmFtZSk7XG5cblx0XHRwYXJlbnRFbC5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG5cdFx0aWYgKG5vZGUuZXhwYW5kZWQgJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiByZW5kZXJOb2RlKGNoaWxkLCBwYXJlbnRFbCkpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlbmRlckZpbGUobm9kZTogRmlsZVRyZWVOb2RlPFQ+LCBwYXJlbnRFbDogRG9jdW1lbnRGcmFnbWVudCk6IHZvaWQge1xuXHRcdGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRpdGVtLmNsYXNzTmFtZSA9ICd2dHJlZS1maWxlLWl0ZW0nO1xuXHRcdGl0ZW0uc3R5bGUuc2V0UHJvcGVydHkoJy0tdnRyZWUtZGVwdGgnLCBTdHJpbmcobm9kZS5kZXB0aCAqIDE0KSk7XG5cblx0XHQvLyBcdUNEOTRcdUFDMDAgQ1NTIFx1RDA3NFx1Qjc5OFx1QzJBNFxuXHRcdGNvbnN0IGl0ZW1DbGFzcyA9IGNvbmZpZy5nZXRJdGVtQ2xhc3Mobm9kZSk7XG5cdFx0aWYgKGl0ZW1DbGFzcykge1xuXHRcdFx0aXRlbS5jbGFzc0xpc3QuYWRkKGl0ZW1DbGFzcyk7XG5cdFx0fVxuXG5cdFx0Ly8gXHVEMzBDXHVDNzdDIFx1QzgxNVx1QkNGNCBcdUM2MDFcdUM1RURcblx0XHRjb25zdCBpbmZvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0aW5mby5jbGFzc05hbWUgPSAndnRyZWUtZmlsZS1pbmZvJztcblxuXHRcdC8vIFx1QzU0NFx1Qzc3NFx1Q0Y1OFxuXHRcdGNvbnN0IGljb25Db250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cdFx0aWNvbkNvbnRhaW5lci5jbGFzc05hbWUgPSAndnRyZWUtZmlsZS1pY29uJztcblx0XHRjb25zdCBpY29uID0gY29uZmlnLmdldEljb24obm9kZSk7XG5cdFx0aWYgKGljb24pIHtcblx0XHRcdGljb25Db250YWluZXIudGV4dENvbnRlbnQgPSBpY29uO1xuXHRcdH1cblx0XHRpbmZvLmFwcGVuZENoaWxkKGljb25Db250YWluZXIpO1xuXG5cdFx0Ly8gXHVEMzBDXHVDNzdDXHVCQTg1XG5cdFx0Y29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdG5hbWUuY2xhc3NOYW1lID0gJ3Z0cmVlLWZpbGUtbmFtZSc7XG5cdFx0bmFtZS50ZXh0Q29udGVudCA9IG5vZGUubmFtZTtcblx0XHRpbmZvLmFwcGVuZENoaWxkKG5hbWUpO1xuXG5cdFx0Ly8gXHVCQTU0XHVEMEMwXHVCMzcwXHVDNzc0XHVEMTMwXG5cdFx0Y29uc3QgbWV0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdG1ldGEuY2xhc3NOYW1lID0gJ3Z0cmVlLWZpbGUtbWV0YSc7XG5cdFx0bWV0YS50ZXh0Q29udGVudCA9IGNvbmZpZy5nZXRNZXRhKG5vZGUpO1xuXHRcdGluZm8uYXBwZW5kQ2hpbGQobWV0YSk7XG5cblx0XHQvLyBcdUJDMzBcdUM5QzBcblx0XHRjb25zdCBiYWRnZSA9IGNvbmZpZy5nZXRCYWRnZShub2RlKTtcblx0XHRpZiAoYmFkZ2UpIHtcblx0XHRcdGluZm8uYXBwZW5kQ2hpbGQoYmFkZ2UpO1xuXHRcdH1cblxuXHRcdGl0ZW0uYXBwZW5kQ2hpbGQoaW5mbyk7XG5cblx0XHQvLyBcdUM1NjFcdUMxNTggXHVCNERDXHVCODZEXHVCMkU0XHVDNkI0XG5cdFx0Y29uc3QgYWN0aW9ucyA9IGNvbmZpZy5nZXRBY3Rpb25zKG5vZGUpO1xuXHRcdGlmIChhY3Rpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpO1xuXHRcdFx0c2VsZWN0LmNsYXNzTmFtZSA9ICd2dHJlZS1hY3Rpb24tc2VsZWN0JztcblxuXHRcdFx0Zm9yIChjb25zdCBvcHQgb2YgYWN0aW9ucykge1xuXHRcdFx0XHRjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblx0XHRcdFx0b3B0aW9uLnZhbHVlID0gb3B0LnZhbHVlO1xuXHRcdFx0XHRvcHRpb24udGV4dENvbnRlbnQgPSBvcHQubGFiZWw7XG5cdFx0XHRcdHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxlY3QudmFsdWUgPSBjb25maWcuZ2V0U2VsZWN0ZWRBY3Rpb24obm9kZSk7XG5cblx0XHRcdHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuXHRcdFx0XHRjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MU2VsZWN0RWxlbWVudDtcblx0XHRcdFx0Y2FsbGJhY2tzLm9uQWN0aW9uQ2hhbmdlKG5vZGUucGF0aCwgdGFyZ2V0LnZhbHVlKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpdGVtLmFwcGVuZENoaWxkKHNlbGVjdCk7XG5cdFx0fVxuXG5cdFx0Ly8gXHVEMDc0XHVCOUFEIFx1RDU3OFx1QjRFNFx1QjdFQ1xuXHRcdGlmIChjb25maWcub25DbGljaykge1xuXHRcdFx0aXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHRpZiAodGFyZ2V0LmNsb3Nlc3QoJy52dHJlZS1hY3Rpb24tc2VsZWN0JykpIHJldHVybjtcblx0XHRcdFx0Y29uZmlnLm9uQ2xpY2shKG5vZGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cGFyZW50RWwuYXBwZW5kQ2hpbGQoaXRlbSk7XG5cdH1cblxuXHR0cmVlLmZvckVhY2goKG5vZGUpID0+IHJlbmRlck5vZGUobm9kZSwgZnJhZ21lbnQpKTtcblx0Y29udGFpbmVyLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBTZXR0aW5nLCBQbGF0Zm9ybSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGRpZmZMaW5lcyB9IGZyb20gJ2RpZmYnO1xuaW1wb3J0IHR5cGUgeyBDb25mbGljdEluZm8gfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGZvcm1hdERhdGUgfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBcdUNEQTlcdUIzQ0MgXHVCRTQ0XHVBRDUwIFx1QkFBOFx1QjJFQ1xuICogXHVCODVDXHVDRUVDXHVBQ0ZDIFx1QzExQ1x1QkM4NCBcdUJDODRcdUM4MDRcdUM3NTggXHVDQzI4XHVDNzc0XHVCOTdDIHNpZGUtYnktc2lkZVx1Qjg1QyBcdUJDRjRcdUM1RUNcdUM5MENcbiAqIEBNWDpOT1RFOiBbQVVUT10gZmFuX2luPVRCRCAoU3luY1Jlc29sdXRpb25Nb2RhbCkgXHUyMDE0IERPTSBBUEkgXHVBRTMwXHVCQzE4IGRpZmYgXHVCODBDXHVCMzU0XHVCOUMxXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25mbGljdERpZmZNb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSBsZWZ0UGFuZWwhOiBIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSByaWdodFBhbmVsITogSFRNTEVsZW1lbnQ7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0cHJpdmF0ZSBjb25mbGljdDogQ29uZmxpY3RJbmZvLFxuXHRcdHByaXZhdGUgb25TZWxlY3Q6ICh2ZXJzaW9uOiAnbG9jYWwnIHwgJ3NlcnZlcicpID0+IHZvaWQsXG5cdCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdH1cblxuXHRvbk9wZW4oKTogdm9pZCB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKCdjb25mbGljdC1kaWZmLW1vZGFsJyk7XG5cblx0XHR0aGlzLnRpdGxlRWwuc2V0VGV4dCgnXHVDREE5XHVCM0NDIFx1QkU0NFx1QUQ1MCcpO1xuXG5cdFx0Y29uc3QgcGF0aEVsID0gY29udGVudEVsLmNyZWF0ZUVsKCdwJywge1xuXHRcdFx0dGV4dDogdGhpcy5jb25mbGljdC5wYXRoLFxuXHRcdFx0Y2xzOiAnY29uZmxpY3QtZGlmZi1wYXRoJyxcblx0XHR9KTtcblxuXHRcdGlmICh0aGlzLmNvbmZsaWN0LnNlcnZlclVwZGF0ZWRBdCkge1xuXHRcdFx0cGF0aEVsLmNyZWF0ZVNwYW4oe1xuXHRcdFx0XHRjbHM6ICdjb25mbGljdC1kaWZmLXNlcnZlci1kYXRlJyxcblx0XHRcdFx0dGV4dDogYCAoXHVDMTFDXHVCQzg0OiAke2Zvcm1hdERhdGUodGhpcy5jb25mbGljdC5zZXJ2ZXJVcGRhdGVkQXQpfSlgLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuY29uZmxpY3QuaXNCaW5hcnkpIHtcblx0XHRcdGNvbnRlbnRFbC5jcmVhdGVFbCgncCcsIHtcblx0XHRcdFx0dGV4dDogJ1x1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0NcdUM3NDAgXHVEMTREXHVDMkE0XHVEMkI4IFx1QkU0NFx1QUQ1MFx1Qjk3QyBcdUM5QzBcdUM2RDBcdUQ1NThcdUM5QzAgXHVDNTRBXHVDMkI1XHVCMkM4XHVCMkU0LicsXG5cdFx0XHRcdGNsczogJ2NvbmZsaWN0LWRpZmYtYmluYXJ5LW5vdGljZScsXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuYWRkVmVyc2lvbkJ1dHRvbnMoY29udGVudEVsKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBSRVEtTVUtMDExOiBcdUJBQThcdUJDMTRcdUM3N0NcdUM1RDBcdUMxMUMgXHVEMEVEIFx1QkRGMCwgXHVCMzcwXHVDMkE0XHVEMDZDXHVEMUIxXHVDNUQwXHVDMTFDIFx1QzBBQ1x1Qzc3NFx1QjREQ1x1QkMxNFx1Qzc3NFx1QzBBQ1x1Qzc3NFx1QjREQyBcdUJERjBcblx0XHRpZiAoUGxhdGZvcm0uaXNNb2JpbGUpIHtcblx0XHRcdHRoaXMucmVuZGVyVGFiVmlldyhjb250ZW50RWwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlbmRlckRpZmZQYW5lbHMoY29udGVudEVsKTtcblx0XHRcdHRoaXMucmVuZGVyRGlmZigpO1xuXHRcdFx0dGhpcy5zZXR1cFN5bmNTY3JvbGwoKTtcblx0XHR9XG5cdFx0dGhpcy5hZGRWZXJzaW9uQnV0dG9ucyhjb250ZW50RWwpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEaWZmUGFuZWxzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcblx0XHRjb25zdCBkaWZmQ29udGFpbmVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2NvbmZsaWN0LWRpZmYtY29udGFpbmVyJyB9KTtcblxuXHRcdGNvbnN0IGxlZnRDb250YWluZXIgPSBkaWZmQ29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2NvbmZsaWN0LWRpZmYtcGFuZWwtY29udGFpbmVyJyB9KTtcblx0XHRsZWZ0Q29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG5cdFx0XHRjbHM6ICdjb25mbGljdC1kaWZmLXBhbmVsLWhlYWRlcicsXG5cdFx0XHR0ZXh0OiAnXHVCODVDXHVDRUVDIFx1QkM4NFx1QzgwNCcsXG5cdFx0fSk7XG5cdFx0dGhpcy5sZWZ0UGFuZWwgPSBsZWZ0Q29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ2NvbmZsaWN0LWRpZmYtcGFuZWwgY29uZmxpY3QtZGlmZi1sb2NhbCcgfSk7XG5cblx0XHRjb25zdCByaWdodENvbnRhaW5lciA9IGRpZmZDb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnY29uZmxpY3QtZGlmZi1wYW5lbC1jb250YWluZXInIH0pO1xuXHRcdHJpZ2h0Q29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7XG5cdFx0XHRjbHM6ICdjb25mbGljdC1kaWZmLXBhbmVsLWhlYWRlcicsXG5cdFx0XHR0ZXh0OiAnXHVDMTFDXHVCQzg0IFx1QkM4NFx1QzgwNCcsXG5cdFx0fSk7XG5cdFx0dGhpcy5yaWdodFBhbmVsID0gcmlnaHRDb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnY29uZmxpY3QtZGlmZi1wYW5lbCBjb25mbGljdC1kaWZmLXNlcnZlcicgfSk7XG5cdH1cblxuXHQvKipcblx0ICogUkVRLU1VLTAxMTogXHVCQUE4XHVCQzE0XHVDNzdDIFx1RDBFRCBcdUJERjAgXHVCODBDXHVCMzU0XHVCOUMxXG5cdCAqIGNyZWF0ZUVsZW1lbnRcdUI5Q0MgXHVDMEFDXHVDNkE5IChpbm5lckhUTUwgXHVDNUM2XHVDNzRDIC0gXHVCQ0Y0XHVDNTQ4IFx1QzY5NFx1QUQ2Q1x1QzBBQ1x1RDU2RClcblx0ICovXG5cdHByaXZhdGUgcmVuZGVyVGFiVmlldyhjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XG5cdFx0Y29uc3QgdGFiQ29udGFpbmVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogJ3Ztb2RhbC10YWJzJyB9KTtcblxuXHRcdC8vIFx1Qjg1Q1x1Q0VFQyBcdUJDODRcdUM4MDQgXHVEMEVEIFx1QkM4NFx1RDJCQ1xuXHRcdGNvbnN0IGxvY2FsVGFiID0gdGFiQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7XG5cdFx0XHRjbHM6ICd2bW9kYWwtdGFiIHZtb2RhbC10YWItYWN0aXZlJyxcblx0XHRcdHRleHQ6ICdcdUI4NUNcdUNFRUMgXHVCQzg0XHVDODA0Jyxcblx0XHR9KTtcblxuXHRcdC8vIFx1QzExQ1x1QkM4NCBcdUJDODRcdUM4MDQgXHVEMEVEIFx1QkM4NFx1RDJCQ1xuXHRcdGNvbnN0IHNlcnZlclRhYiA9IHRhYkNvbnRhaW5lci5jcmVhdGVFbCgnYnV0dG9uJywge1xuXHRcdFx0Y2xzOiAndm1vZGFsLXRhYicsXG5cdFx0XHR0ZXh0OiAnXHVDMTFDXHVCQzg0IFx1QkM4NFx1QzgwNCcsXG5cdFx0fSk7XG5cblx0XHQvLyBcdUQwRUQgXHVDRUU4XHVEMTUwXHVEMkI4IFx1QzYwMVx1QzVFRFxuXHRcdGNvbnN0IGNvbnRlbnRDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAndm1vZGFsLXRhYi1jb250ZW50JyB9KTtcblxuXHRcdC8vIFx1Qjg1Q1x1Q0VFQyBcdUQzMjhcdUIxMTBcblx0XHR0aGlzLmxlZnRQYW5lbCA9IGNvbnRlbnRDb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiAnY29uZmxpY3QtZGlmZi1wYW5lbCBjb25mbGljdC1kaWZmLWxvY2FsJyB9KTtcblxuXHRcdC8vIFx1QzExQ1x1QkM4NCBcdUQzMjhcdUIxMTAgKFx1Q0QwOFx1QUUzMFx1QzVEMFx1QjI5NCBcdUMyMjhcdUFFNDApXG5cdFx0dGhpcy5yaWdodFBhbmVsID0gY29udGVudENvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6ICdjb25mbGljdC1kaWZmLXBhbmVsIGNvbmZsaWN0LWRpZmYtc2VydmVyIHZtb2RhbC1oaWRkZW4nIH0pO1xuXG5cdFx0Ly8gXHVEMEVEIFx1QzgwNFx1RDY1OCBcdUI4NUNcdUM5QzFcblx0XHRsb2NhbFRhYi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0XHRcdGxvY2FsVGFiLmNsYXNzTGlzdC5hZGQoJ3Ztb2RhbC10YWItYWN0aXZlJyk7XG5cdFx0XHRzZXJ2ZXJUYWIuY2xhc3NMaXN0LnJlbW92ZSgndm1vZGFsLXRhYi1hY3RpdmUnKTtcblx0XHRcdHRoaXMubGVmdFBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3Ztb2RhbC1oaWRkZW4nKTtcblx0XHRcdHRoaXMucmlnaHRQYW5lbC5jbGFzc0xpc3QuYWRkKCd2bW9kYWwtaGlkZGVuJyk7XG5cdFx0fSk7XG5cblx0XHRzZXJ2ZXJUYWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHRzZXJ2ZXJUYWIuY2xhc3NMaXN0LmFkZCgndm1vZGFsLXRhYi1hY3RpdmUnKTtcblx0XHRcdGxvY2FsVGFiLmNsYXNzTGlzdC5yZW1vdmUoJ3Ztb2RhbC10YWItYWN0aXZlJyk7XG5cdFx0XHR0aGlzLnJpZ2h0UGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgndm1vZGFsLWhpZGRlbicpO1xuXHRcdFx0dGhpcy5sZWZ0UGFuZWwuY2xhc3NMaXN0LmFkZCgndm1vZGFsLWhpZGRlbicpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gZGlmZiBcdUI4MENcdUIzNTRcdUI5QzFcblx0XHR0aGlzLnJlbmRlckRpZmYoKTtcblx0fVxuXG5cdHByaXZhdGUgYWRkVmVyc2lvbkJ1dHRvbnMoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lcilcblx0XHRcdC5hZGRCdXR0b24oKGJ0bikgPT5cblx0XHRcdFx0YnRuLnNldEJ1dHRvblRleHQoJ1x1Qjg1Q1x1Q0VFQyBcdUJDODRcdUM4MDQgXHVDNzIwXHVDOUMwJykub25DbGljaygoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vblNlbGVjdCgnbG9jYWwnKTtcblx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdFx0LmFkZEJ1dHRvbigoYnRuKSA9PlxuXHRcdFx0XHRidG4uc2V0QnV0dG9uVGV4dCgnXHVDMTFDXHVCQzg0IFx1QkM4NFx1QzgwNFx1QzczQ1x1Qjg1QyBcdUFENTBcdUNDQjQnKS5zZXRDdGEoKS5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9uU2VsZWN0KCdzZXJ2ZXInKTtcblx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGlmZigpOiB2b2lkIHtcblx0XHRjb25zdCBsb2NhbExpbmVzID0gdGhpcy5jb25mbGljdC5sb2NhbENvbnRlbnQuc3BsaXQoJ1xcbicpO1xuXHRcdGNvbnN0IHNlcnZlckxpbmVzID0gdGhpcy5jb25mbGljdC5zZXJ2ZXJDb250ZW50LnNwbGl0KCdcXG4nKTtcblxuXHRcdGNvbnN0IG1heExpbmVzID0gMTAwMDA7XG5cdFx0Y29uc3QgcHJldmlld0xpbmVzID0gMTAwMDtcblxuXHRcdGlmIChsb2NhbExpbmVzLmxlbmd0aCA+IG1heExpbmVzIHx8IHNlcnZlckxpbmVzLmxlbmd0aCA+IG1heExpbmVzKSB7XG5cdFx0XHR0aGlzLmxlZnRQYW5lbC5jcmVhdGVFbCgnZGl2Jywge1xuXHRcdFx0XHRjbHM6ICdjb25mbGljdC1kaWZmLXdhcm5pbmcnLFxuXHRcdFx0XHR0ZXh0OiBgXHVCMzAwXHVDNkE5XHVCN0M5IFx1RDMwQ1x1Qzc3Qy4gXHVDQzk4XHVDNzRDICR7cHJldmlld0xpbmVzfVx1QzkwNFx1QjlDQyBcdUQ0NUNcdUMyREMgKFx1Q0QxRCAke2xvY2FsTGluZXMubGVuZ3RofVx1QzkwNCkuYCxcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5yaWdodFBhbmVsLmNyZWF0ZUVsKCdkaXYnLCB7XG5cdFx0XHRcdGNsczogJ2NvbmZsaWN0LWRpZmYtd2FybmluZycsXG5cdFx0XHRcdHRleHQ6IGBcdUIzMDBcdUM2QTlcdUI3QzkgXHVEMzBDXHVDNzdDLiBcdUNDOThcdUM3NEMgJHtwcmV2aWV3TGluZXN9XHVDOTA0XHVCOUNDIFx1RDQ1Q1x1QzJEQyAoXHVDRDFEICR7c2VydmVyTGluZXMubGVuZ3RofVx1QzkwNCkuYCxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxvY2FsQ29udGVudCA9IGxvY2FsTGluZXMubGVuZ3RoID4gbWF4TGluZXNcblx0XHRcdD8gbG9jYWxMaW5lcy5zbGljZSgwLCBwcmV2aWV3TGluZXMpLmpvaW4oJ1xcbicpXG5cdFx0XHQ6IHRoaXMuY29uZmxpY3QubG9jYWxDb250ZW50O1xuXHRcdGNvbnN0IHNlcnZlckNvbnRlbnQgPSBzZXJ2ZXJMaW5lcy5sZW5ndGggPiBtYXhMaW5lc1xuXHRcdFx0PyBzZXJ2ZXJMaW5lcy5zbGljZSgwLCBwcmV2aWV3TGluZXMpLmpvaW4oJ1xcbicpXG5cdFx0XHQ6IHRoaXMuY29uZmxpY3Quc2VydmVyQ29udGVudDtcblxuXHRcdGNvbnN0IGRpZmYgPSBkaWZmTGluZXMobG9jYWxDb250ZW50LCBzZXJ2ZXJDb250ZW50KTtcblxuXHRcdGRpZmYuZm9yRWFjaCgocGFydCkgPT4ge1xuXHRcdFx0aWYgKHBhcnQucmVtb3ZlZCkge1xuXHRcdFx0XHR0aGlzLmxlZnRQYW5lbC5jcmVhdGVEaXYoe1xuXHRcdFx0XHRcdGNsczogJ2NvbmZsaWN0LWRpZmYtcmVtb3ZlZCcsXG5cdFx0XHRcdFx0dGV4dDogcGFydC52YWx1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYgKHBhcnQuYWRkZWQpIHtcblx0XHRcdFx0dGhpcy5yaWdodFBhbmVsLmNyZWF0ZURpdih7XG5cdFx0XHRcdFx0Y2xzOiAnY29uZmxpY3QtZGlmZi1hZGRlZCcsXG5cdFx0XHRcdFx0dGV4dDogcGFydC52YWx1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmxlZnRQYW5lbC5jcmVhdGVEaXYoe1xuXHRcdFx0XHRcdGNsczogJ2NvbmZsaWN0LWRpZmYtdW5jaGFuZ2VkJyxcblx0XHRcdFx0XHR0ZXh0OiBwYXJ0LnZhbHVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dGhpcy5yaWdodFBhbmVsLmNyZWF0ZURpdih7XG5cdFx0XHRcdFx0Y2xzOiAnY29uZmxpY3QtZGlmZi11bmNoYW5nZWQnLFxuXHRcdFx0XHRcdHRleHQ6IHBhcnQudmFsdWUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXR1cFN5bmNTY3JvbGwoKTogdm9pZCB7XG5cdFx0bGV0IHN5bmNpbmcgPSBmYWxzZTtcblx0XHRjb25zdCBzeW5jID0gKHNvdXJjZTogSFRNTEVsZW1lbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpID0+IHtcblx0XHRcdGlmIChzeW5jaW5nKSByZXR1cm47XG5cdFx0XHRzeW5jaW5nID0gdHJ1ZTtcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRcdHRhcmdldC5zY3JvbGxUb3AgPSBzb3VyY2Uuc2Nyb2xsVG9wO1xuXHRcdFx0XHRzeW5jaW5nID0gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0dGhpcy5sZWZ0UGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKCkgPT4gc3luYyh0aGlzLmxlZnRQYW5lbCwgdGhpcy5yaWdodFBhbmVsKSk7XG5cdFx0dGhpcy5yaWdodFBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHN5bmModGhpcy5yaWdodFBhbmVsLCB0aGlzLmxlZnRQYW5lbCkpO1xuXHR9XG5cblx0b25DbG9zZSgpOiB2b2lkIHtcblx0XHR0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuXHR9XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZiB7XG4gICAgZGlmZihvbGRTdHIsIG5ld1N0ciwgXG4gICAgLy8gVHlwZSBiZWxvdyBpcyBub3QgYWNjdXJhdGUvY29tcGxldGUgLSBzZWUgYWJvdmUgZm9yIGZ1bGwgcG9zc2liaWxpdGllcyAtIGJ1dCBpdCBjb21waWxlc1xuICAgIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBsZXQgY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCdjYWxsYmFjaycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgICAgICBjb25zdCBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvbGRUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUob2xkU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIGNvbnN0IG5ld1Rva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBkb25lID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGVkaXRMZW5ndGggPSAxO1xuICAgICAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RWRpdExlbmd0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXhFZGl0TGVuZ3RoID0gTWF0aC5taW4obWF4RWRpdExlbmd0aCwgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gKF9hID0gb3B0aW9ucy50aW1lb3V0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgYWJvcnRBZnRlclRpbWVzdGFtcCA9IERhdGUubm93KCkgKyBtYXhFeGVjdXRpb25UaW1lO1xuICAgICAgICBjb25zdCBiZXN0UGF0aCA9IFt7IG9sZFBvczogLTEsIGxhc3RDb21wb25lbnQ6IHVuZGVmaW5lZCB9XTtcbiAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgbGV0IG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIDAsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoYmVzdFBhdGhbMF0ub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiZXN0UGF0aFswXS5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2Ugd2UgaGl0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0IGdyYXBoIG9uIHNvbWUgZGlhZ29uYWwgaywgd2UgY2FuXG4gICAgICAgIC8vIGRlZmluaXRlbHkgcmVhY2ggdGhlIGVuZCBvZiB0aGUgZWRpdCBncmFwaCBpbiBubyBtb3JlIHRoYW4gayBlZGl0cywgc29cbiAgICAgICAgLy8gdGhlcmUncyBubyBwb2ludCBpbiBjb25zaWRlcmluZyBhbnkgbW92ZXMgdG8gZGlhZ29uYWwgaysxIGFueSBtb3JlIChmcm9tXG4gICAgICAgIC8vIHdoaWNoIHdlJ3JlIGd1YXJhbnRlZWQgdG8gbmVlZCBhdCBsZWFzdCBrKzEgbW9yZSBlZGl0cykuXG4gICAgICAgIC8vIFNpbWlsYXJseSwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIGVkaXQgZ3JhcGgsIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gcG9pbnQgY29uc2lkZXJpbmcgbW92ZXMgdG8gbG93ZXIgZGlhZ29uYWxzLlxuICAgICAgICAvLyBXZSByZWNvcmQgdGhpcyBmYWN0IGJ5IHNldHRpbmcgbWluRGlhZ29uYWxUb0NvbnNpZGVyIGFuZFxuICAgICAgICAvLyBtYXhEaWFnb25hbFRvQ29uc2lkZXIgdG8gc29tZSBmaW5pdGUgdmFsdWUgb25jZSB3ZSd2ZSBoaXQgdGhlIGVkZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGguXG4gICAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGlzIG5vdCBmYWl0aGZ1bCB0byB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIHByZXNlbnRlZCBpblxuICAgICAgICAvLyBNeWVycydzIHBhcGVyLCB3aGljaCBpbnN0ZWFkIHBvaW50bGVzc2x5IGV4dGVuZHMgRC1wYXRocyBvZmYgdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaCAtIHNlZSBwYWdlIDcgb2YgTXllcnMncyBwYXBlciB3aGljaCBub3RlcyB0aGlzIHBvaW50XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgYW5kIGlsbHVzdHJhdGVzIGl0IHdpdGggYSBkaWFncmFtLiBUaGlzIGhhcyBtYWpvciBwZXJmb3JtYW5jZVxuICAgICAgICAvLyBpbXBsaWNhdGlvbnMgZm9yIHNvbWUgY29tbW9uIHNjZW5hcmlvcy4gRm9yIGluc3RhbmNlLCB0byBjb21wdXRlIGEgZGlmZlxuICAgICAgICAvLyB3aGVyZSB0aGUgbmV3IHRleHQgc2ltcGx5IGFwcGVuZHMgZCBjaGFyYWN0ZXJzIG9uIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHRleHQgb2YgbGVuZ3RoIG4sIHRoZSB0cnVlIE15ZXJzIGFsZ29yaXRobSB3aWxsIHRha2UgTyhuK2ReMilcbiAgICAgICAgLy8gdGltZSB3aGlsZSB0aGlzIG9wdGltaXphdGlvbiBuZWVkcyBvbmx5IE8obitkKSB0aW1lLlxuICAgICAgICBsZXQgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gLUluZmluaXR5LCBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBJbmZpbml0eTtcbiAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICBjb25zdCBleGVjRWRpdExlbmd0aCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgLWVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggPD0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBlZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoICs9IDIpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdLCBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gb25lIGVsc2UgaXMgZ29pbmcgdG8gYXR0ZW1wdCB0byB1c2UgdGhpcyB2YWx1ZSwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjYW5BZGQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGF0IG5ld1BvcyB3aWxsIGJlIGFmdGVyIHdlIGRvIGFuIGluc2VydGlvbjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkUGF0aE5ld1BvcyA9IGFkZFBhdGgub2xkUG9zIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICAgICAgICBjYW5BZGQgPSBhZGRQYXRoICYmIDAgPD0gYWRkUGF0aE5ld1BvcyAmJiBhZGRQYXRoTmV3UG9zIDwgbmV3TGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIHJlbW92ZVBhdGgub2xkUG9zICsgMSA8IG9sZExlbjtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgb2xkIHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICAgIGlmICghY2FuUmVtb3ZlIHx8IChjYW5BZGQgJiYgcmVtb3ZlUGF0aC5vbGRQb3MgPCBhZGRQYXRoLm9sZFBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChhZGRQYXRoLCB0cnVlLCBmYWxzZSwgMCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKHJlbW92ZVBhdGgsIGZhbHNlLCB0cnVlLCAxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpIHx8IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlZGl0TGVuZ3RoKys7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlXG4gICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgLy8gaXMgcHJvZHVjZWQsIG9yIHVudGlsIHRoZSBlZGl0IGxlbmd0aCBleGNlZWRzIG9wdGlvbnMubWF4RWRpdExlbmd0aCAoaWYgZ2l2ZW4pLFxuICAgICAgICAvLyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoIHx8IERhdGUubm93KCkgPiBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGggJiYgRGF0ZS5ub3coKSA8PSBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFRvUGF0aChwYXRoLCBhZGRlZCwgcmVtb3ZlZCwgb2xkUG9zSW5jLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoLmxhc3RDb21wb25lbnQ7XG4gICAgICAgIGlmIChsYXN0ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0LnByZXZpb3VzQ29tcG9uZW50IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IG9sZFBvcyA9IGJhc2VQYXRoLm9sZFBvcywgbmV3UG9zID0gb2xkUG9zIC0gZGlhZ29uYWxQYXRoLCBjb21tb25Db3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChuZXdQb3MgKyAxIDwgbmV3TGVuICYmIG9sZFBvcyArIDEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMob2xkVG9rZW5zW29sZFBvcyArIDFdLCBuZXdUb2tlbnNbbmV3UG9zICsgMV0sIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBuZXdQb3MrKztcbiAgICAgICAgICAgIG9sZFBvcysrO1xuICAgICAgICAgICAgY29tbW9uQ291bnQrKztcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IDEsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbkNvdW50ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogY29tbW9uQ291bnQsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgYmFzZVBhdGgub2xkUG9zID0gb2xkUG9zO1xuICAgICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGFyYXRvcihsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHRcbiAgICAgICAgICAgICAgICB8fCAoISFvcHRpb25zLmlnbm9yZUNhc2UgJiYgbGVmdC50b0xvd2VyQ2FzZSgpID09PSByaWdodC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjYXN0SW5wdXQodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xuICAgIH1cbiAgICBqb2luKGNoYXJzKSB7XG4gICAgICAgIC8vIEFzc3VtZXMgVmFsdWVUIGlzIHN0cmluZywgd2hpY2ggaXMgdGhlIGNhc2UgZm9yIG1vc3Qgc3ViY2xhc3Nlcy5cbiAgICAgICAgLy8gV2hlbiBpdCdzIGZhbHNlLCBlLmcuIGluIGRpZmZBcnJheXMsIHRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gKGUuZy4gd2l0aCBhIG5vLW9wKVxuICAgICAgICAvLyBZZXMsIHRoZSBjYXN0cyBhcmUgdmVyYm9zZSBhbmQgdWdseSwgYmVjYXVzZSB0aGlzIHBhdHRlcm4gLSBvZiBoYXZpbmcgdGhlIGJhc2UgY2xhc3MgU09SVCBPRlxuICAgICAgICAvLyBhc3N1bWUgdG9rZW5zIGFuZCB2YWx1ZXMgYXJlIHN0cmluZ3MsIGJ1dCBub3QgY29tcGxldGVseSAtIGlzIHdlaXJkIGFuZCBqYW5reS5cbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH1cbiAgICBwb3N0UHJvY2VzcyhjaGFuZ2VPYmplY3RzLCBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gY2hhbmdlT2JqZWN0cztcbiAgICB9XG4gICAgZ2V0IHVzZUxvbmdlc3RUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBidWlsZFZhbHVlcyhsYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2Vucykge1xuICAgICAgICAvLyBGaXJzdCB3ZSBjb252ZXJ0IG91ciBsaW5rZWQgbGlzdCBvZiBjb21wb25lbnRzIGluIHJldmVyc2Ugb3JkZXIgdG8gYW5cbiAgICAgICAgLy8gYXJyYXkgaW4gdGhlIHJpZ2h0IG9yZGVyOlxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgICAgIGxldCBuZXh0Q29tcG9uZW50O1xuICAgICAgICB3aGlsZSAobGFzdENvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGxhc3RDb21wb25lbnQpO1xuICAgICAgICAgICAgbmV4dENvbXBvbmVudCA9IGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBkZWxldGUgbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBuZXh0Q29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudHMucmV2ZXJzZSgpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNvbXBvbmVudFBvcyA9IDAsIG5ld1BvcyA9IDAsIG9sZFBvcyA9IDA7XG4gICAgICAgIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdGhpcy51c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFRva2Vuc1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG9sZFRva2Vucy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxufVxuIiwgImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZS5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZU9wdGlvbnMgfSBmcm9tICcuLi91dGlsL3BhcmFtcy5qcyc7XG5jbGFzcyBMaW5lRGlmZiBleHRlbmRzIERpZmYge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRva2VuaXplID0gdG9rZW5pemU7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpZ25vcmluZyB3aGl0ZXNwYWNlLCB3ZSBuZWVkIHRvIG5vcm1hbGlzZSBsaW5lcyBieSBzdHJpcHBpbmdcbiAgICAgICAgLy8gd2hpdGVzcGFjZSBiZWZvcmUgY2hlY2tpbmcgZXF1YWxpdHkuIChUaGlzIGhhcyBhbiBhbm5veWluZyBpbnRlcmFjdGlvblxuICAgICAgICAvLyB3aXRoIG5ld2xpbmVJc1Rva2VuIHRoYXQgcmVxdWlyZXMgc3BlY2lhbCBoYW5kbGluZzogaWYgbmV3bGluZXMgZ2V0IHRoZWlyXG4gICAgICAgIC8vIG93biB0b2tlbiwgdGhlbiB3ZSBET04nVCB3YW50IHRvIHRyaW0gdGhlICpuZXdsaW5lKiB0b2tlbnMgZG93biB0byBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzLCBzaW5jZSB0aGlzIHdvdWxkIGNhdXNlIHVzIHRvIHRyZWF0IHdoaXRlc3BhY2Utb25seSBsaW5lIGNvbnRlbnRcbiAgICAgICAgLy8gYXMgZXF1YWwgdG8gYSBzZXBhcmF0b3IgYmV0d2VlbiBsaW5lcywgd2hpY2ggd291bGQgYmUgd2VpcmQgYW5kXG4gICAgICAgIC8vIGluY29uc2lzdGVudCB3aXRoIHRoZSBkb2N1bWVudGVkIGJlaGF2aW9yIG9mIHRoZSBvcHRpb25zLilcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFsZWZ0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhcmlnaHQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5pZ25vcmVOZXdsaW5lQXRFb2YgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIGlmIChsZWZ0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyaWdodC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbGluZURpZmYgPSBuZXcgTGluZURpZmYoKTtcbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlRyaW1tZWRMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgeyBpZ25vcmVXaGl0ZXNwYWNlOiB0cnVlIH0pO1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbi8vIEV4cG9ydGVkIHN0YW5kYWxvbmUgc28gaXQgY2FuIGJlIHVzZWQgZnJvbSBqc29uRGlmZiB0b28uXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zdHJpcFRyYWlsaW5nQ3IpIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9uZSBcXHIgYmVmb3JlIFxcbiB0byBtYXRjaCBHTlUgZGlmZidzIC0tc3RyaXAtdHJhaWxpbmctY3IgYmVoYXZpb3JcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgIH1cbiAgICBjb25zdCByZXRMaW5lcyA9IFtdLCBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuICAgIC8vIElnbm9yZSB0aGUgZmluYWwgZW1wdHkgdG9rZW4gdGhhdCBvY2N1cnMgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBuZXcgbGluZVxuICAgIGlmICghbGluZXNBbmROZXdsaW5lc1tsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gICAgfVxuICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuICAgICAgICBpZiAoaSAlIDIgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRMaW5lcztcbn1cbiIsICIvKipcbiAqIFNoYXJlZCB1dGlsaXR5IGZ1bmN0aW9uc1xuICogQE1YOk5PVEU6IFtBVVRPXSBcdUM5MTFcdUJDRjUgXHVDODFDXHVBQzcwXHVCOTdDIFx1QzcwNFx1RDU1QyBcdUFDRjVcdUQxQjUgXHVDNzIwXHVEMkY4XHVCOUFDXHVEMkYwIChcdUIwQTBcdUM5REMgXHVEM0VDXHVCOUY3LCBcdUQwNzRcdUI5QkRcdUJDRjRcdUI0REMpXG4gKi9cblxuLyoqXG4gKiBcdUIwQTBcdUM5RENcdUI5N0MgJ1lZWVktTU0tREQgSEg6bW0nIFx1RDYxNVx1QzJERFx1QzczQ1x1Qjg1QyBcdUQzRUNcdUI5RjdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERhdGUobXNPcklzbzogbnVtYmVyIHwgc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZCA9IHR5cGVvZiBtc09ySXNvID09PSAnc3RyaW5nJyA/IG5ldyBEYXRlKG1zT3JJc28pIDogbmV3IERhdGUobXNPcklzbyk7XG4gIGlmIChpc05hTihkLmdldFRpbWUoKSkpIHJldHVybiB0eXBlb2YgbXNPcklzbyA9PT0gJ3N0cmluZycgPyBtc09ySXNvIDogJyc7XG4gIGNvbnN0IHkgPSBkLmdldEZ1bGxZZWFyKCk7XG4gIGNvbnN0IG1vID0gKGQuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgY29uc3QgZGF5ID0gZC5nZXREYXRlKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBoID0gZC5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgY29uc3QgbWkgPSBkLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4gIHJldHVybiBgJHt5fS0ke21vfS0ke2RheX0gJHtofToke21pfWA7XG59XG5cbi8qKlxuICogXHVEMzBDXHVDNzdDIFx1RDA2Q1x1QUUzMFx1Qjk3QyBcdUM3N0RcdUFFMzAgXHVDMjZDXHVDNkI0IFx1RDYxNVx1QzJERFx1QzczQ1x1Qjg1QyBcdUQzRUNcdUI5RjdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFNpemUoYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIGlmIChieXRlcyA8IDEwMjQpIHJldHVybiBgJHtieXRlc31CYDtcbiAgaWYgKGJ5dGVzIDwgMTAyNCAqIDEwMjQpIHJldHVybiBgJHsoYnl0ZXMgLyAxMDI0KS50b0ZpeGVkKDEpfUtCYDtcbiAgcmV0dXJuIGAkeyhieXRlcyAvICgxMDI0ICogMTAyNCkpLnRvRml4ZWQoMSl9TUJgO1xufVxuXG4vKipcbiAqIFx1RDA3NFx1QjlCRFx1QkNGNFx1QjREQ1x1QzVEMCBcdUQxNERcdUMyQTRcdUQyQjggXHVCQ0Y1XHVDMEFDIChmYWxsYmFjayBcdUQzRUNcdUQ1NjgpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb3B5VG9DbGlwYm9hcmQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gIH0gY2F0Y2gge1xuICAgIGNvbnN0IHRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICB0ZXh0YXJlYS52YWx1ZSA9IHRleHQ7XG4gICAgdGV4dGFyZWEuY2xhc3NMaXN0LmFkZCgnY2xpcGJvYXJkLWZhbGxiYWNrLXRleHRhcmVhJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0YXJlYSk7XG4gICAgdGV4dGFyZWEuc2VsZWN0KCk7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRleHRhcmVhKTtcbiAgfVxufVxuIiwgIi8qKlxuICogU0hBLTI1NiBoYXNoaW5nIHV0aWxpdGllcyBmb3IgY29udGVudCBpbnRlZ3JpdHlcbiAqIEBNWDpOT1RFOiBbQVVUT10gVXNlcyBXZWIgQ3J5cHRvIEFQSSAoYXZhaWxhYmxlIGluIE9ic2lkaWFuL0VsZWN0cm9uIGVudmlyb25tZW50KVxuICovXG5cbi8vIFRleHRFbmNvZGVyIGlzIGdsb2JhbGx5IGF2YWlsYWJsZSBpbiBPYnNpZGlhbi9FbGVjdHJvblxuXG4vKipcbiAqIENvbXB1dGUgU0hBLTI1NiBoYXNoIG9mIGNvbnRlbnQgc3RyaW5nXG4gKiBAcGFyYW0gY29udGVudCAtIFRoZSBjb250ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEhleC1lbmNvZGVkIFNIQS0yNTYgaGFzaCAoNjQgaGV4IGNoYXJhY3RlcnMpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoQ29udGVudChjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVyLmVuY29kZShjb250ZW50KTtcbiAgY29uc3QgaGFzaCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KCdTSEEtMjU2JywgZGF0YSk7XG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGhhc2gpKVxuICAgIC5tYXAoYiA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKVxuICAgIC5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlIFNIQS0yNTYgaGFzaCBvZiBiaW5hcnkgY29udGVudCAoQXJyYXlCdWZmZXIpXG4gKiBSRVEtQVRUQUNILTAwMjogQmluYXJ5IGZpbGUgaGFzaCBmb3IgY29udGVudCBpbnRlZ3JpdHlcbiAqXG4gKiBAcGFyYW0gZGF0YSAtIFRoZSBiaW5hcnkgZGF0YSB0byBoYXNoXG4gKiBAcmV0dXJucyBIZXgtZW5jb2RlZCBTSEEtMjU2IGhhc2ggKDY0IGhleCBjaGFyYWN0ZXJzKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaEJpbmFyeUNvbnRlbnQoZGF0YTogQXJyYXlCdWZmZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBoYXNoID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0yNTYnLCBkYXRhKTtcbiAgcmV0dXJuIEFycmF5LmZyb20obmV3IFVpbnQ4QXJyYXkoaGFzaCkpXG4gICAgLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpXG4gICAgLmpvaW4oJycpO1xufVxuIiwgIi8qKlxuICogRmlsZSB0eXBlIGRldGVjdGlvbiB1dGlsaXRpZXNcbiAqXG4gKiBSRVEtQVRUQUNILTAwMTogQmluYXJ5IGZpbGUgZGV0ZWN0aW9uIGFuZCBmaWx0ZXJpbmdcbiAqIFdoaXRlbGlzdC1iYXNlZCBmaWxlIHR5cGUgZGV0ZWN0aW9uIG1hdGNoaW5nIHNlcnZlciBBTExPV0VEX0VYVEVOU0lPTlNcbiAqL1xuXG4vKipcbiAqIFN1cHBvcnRlZCBmaWxlIGV4dGVuc2lvbnMgd2hpdGVsaXN0XG4gKlxuICogUkVRLUFUVEFDSC0wMDE6IFN5c3RlbSBpZGVudGlmaWVzIGJpbmFyeSBmaWxlcyBiYXNlZCBvbiBBTExPV0VEX0VYVEVOU0lPTlNcbiAqIE11c3QgbWF0Y2ggc2VydmVyLXNpZGUgQUxMT1dFRF9FWFRFTlNJT05TIGluIG1pbWUtdHlwZXMuc2VydmljZS50c1xuICovXG5leHBvcnQgY29uc3QgQUxMT1dFRF9FWFRFTlNJT05TOiByZWFkb25seSBzdHJpbmdbXSA9IFtcbiAgJy5tZCcsICcucG5nJywgJy5qcGcnLCAnLmpwZWcnLCAnLmdpZicsICcuc3ZnJywgJy53ZWJwJyxcbiAgJy5wZGYnLCAnLm1wMycsICcubXA0JywgJy53YXYnLCAnLm9nZycsXG5dIGFzIGNvbnN0O1xuXG4vKipcbiAqIEV4dHJhY3QgZmlsZSBleHRlbnNpb24gZnJvbSBwYXRoIChsb3dlcmNhc2UsIHdpdGggZG90KVxuICpcbiAqIEBwYXJhbSBmaWxlUGF0aCAtIEZpbGUgcGF0aCBvciBleHRlbnNpb24gc3RyaW5nXG4gKiBAcmV0dXJucyBFeHRlbnNpb24gd2l0aCBkb3QgKGUuZy4sICcucG5nJykgb3IgZW1wdHkgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RXh0ZW5zaW9uKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgIHJldHVybiBmaWxlUGF0aC50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgY29uc3QgbGFzdERvdEluZGV4ID0gZmlsZVBhdGgubGFzdEluZGV4T2YoJy4nKTtcblxuICBpZiAobGFzdERvdEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHJldHVybiBmaWxlUGF0aC5zbGljZShsYXN0RG90SW5kZXgpLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgZmlsZSBleHRlbnNpb24gaXMgaW4gdGhlIGFsbG93ZWQgd2hpdGVsaXN0XG4gKlxuICogUkVRLUFUVEFDSC0wMDE6IEZpbGVzIG5vdCBpbiB3aGl0ZWxpc3QgYXJlIGV4Y2x1ZGVkIGZyb20gc3luYyBlbnRpcmVseVxuICpcbiAqIEBwYXJhbSBmaWxlUGF0aCAtIEZpbGUgcGF0aFxuICogQHJldHVybnMgdHJ1ZSBpZiBleHRlbnNpb24gaXMgaW4gQUxMT1dFRF9FWFRFTlNJT05TXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FsbG93ZWRFeHRlbnNpb24oZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBleHQgPSBleHRyYWN0RXh0ZW5zaW9uKGZpbGVQYXRoKTtcbiAgaWYgKCFleHQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChBTExPV0VEX0VYVEVOU0lPTlMgYXMgcmVhZG9ubHkgc3RyaW5nW10pLmluY2x1ZGVzKGV4dCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgZmlsZSBpcyBiaW5hcnkgYmFzZWQgb24gZXh0ZW5zaW9uIHdoaXRlbGlzdFxuICpcbiAqIFJFUS1BVFRBQ0gtMDAxOiBBbGwgZmlsZXMgZXhjZXB0IC5tZCBhcmUgdHJlYXRlZCBhcyBiaW5hcnlcbiAqIFJldHVybnMgZmFsc2UgZm9yIG5vbi13aGl0ZWxpc3RlZCBleHRlbnNpb25zICh0aGV5IHNob3VsZCBiZSBleGNsdWRlZCBlbnRpcmVseSlcbiAqXG4gKiBAcGFyYW0gZmlsZVBhdGggLSBGaWxlIHBhdGhcbiAqIEByZXR1cm5zIHRydWUgaWYgZmlsZSBpcyBiaW5hcnkgKGFsbG93ZWQgZXh0ZW5zaW9uIGJ1dCBub3QgLm1kKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5hcnlGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZXh0ID0gZXh0cmFjdEV4dGVuc2lvbihmaWxlUGF0aCk7XG4gIGlmICghZXh0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gTm90IGluIHdoaXRlbGlzdCA9IG5vdCBvdXIgY29uY2VyblxuICBpZiAoIShBTExPV0VEX0VYVEVOU0lPTlMgYXMgcmVhZG9ubHkgc3RyaW5nW10pLmluY2x1ZGVzKGV4dCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyAubWQgaXMgdGV4dCwgZXZlcnl0aGluZyBlbHNlIGluIHdoaXRlbGlzdCBpcyBiaW5hcnlcbiAgcmV0dXJuIGV4dCAhPT0gJy5tZCc7XG59XG4iLCAiLyoqXG4gKiBTaGFyZSBsaW5rIHNlcnZpY2UgZm9yIFZlY3RvciBPYnNpZGlhbiBwbHVnaW5cbiAqIEBNWDpBTkNIT1I6IFtBVVRPXSBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFx1QzBERFx1QzEzMSwgXHVDOTExXHVDOUMwLCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVBRDAwXHVCOUFDXG4gKiBATVg6UkVBU09OOiBTUEVDLVNIQVJFLTAwMSAtIFJFU1QgQVBJIFx1QUUzMFx1QkMxOCBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFx1QUUzMFx1QjJBNVxuICovXG5cbmltcG9ydCB0eXBlIHsgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFZTeW5jU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB0eXBlIHsgU2hhcmVEYXRhLCBTaGFyZUV4cGlyYXRpb24sIFNoYXJlU3RhdHVzIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBjb3B5VG9DbGlwYm9hcmQgfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBQbHVnaW5TaGFyZVNlcnZpY2UgLSBSRVNUIEFQSSBcdUFFMzBcdUJDMTggXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBcdUFEMDBcdUI5QUNcbiAqIEBNWDpBTkNIT1I6IFtBVVRPXSBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIENSVUQgXHVCQzBGIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMCBcdUIzRDlcdUFFMzBcdUQ2NTRcbiAqIEBNWDpSRUFTT046IFNQRUMtU0hBUkUtMDAxIFJFUS1TSEFSRS0xMDEgdG8gUkVRLVNIQVJFLTEwNFxuICovXG5leHBvcnQgY2xhc3MgUGx1Z2luU2hhcmVTZXJ2aWNlIHtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFwcDogYW55LFxuICAgIHByaXZhdGUgc2V0dGluZ3M6IFZTeW5jU2V0dGluZ3MsXG4gICAgcHJpdmF0ZSBzaG93Tm90aWNlOiAobXNnOiBzdHJpbmcpID0+IHZvaWQsXG4gICAgcHJpdmF0ZSBnZXRGaWxlSWRCeVBhdGg6IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBfc3luY0ZpbGVVcGRhdGU6IChmaWxlOiBURmlsZSkgPT4gdm9pZCxcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFx1QzBERFx1QzEzMSAoUkVRLVNIQVJFLTEwMSlcbiAgICogQE1YOk5PVEU6IFtBVVRPXSBmaWxlSWQgXHVDODcwXHVENjhDIFx1MjE5MiBSRVNUIFx1QzBERFx1QzEzMSBcdTIxOTIgXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOCBcdTIxOTIgXHVEMDc0XHVCOUJEXHVCQ0Y0XHVCNERDIFx1QkNGNVx1QzBBQ1xuICAgKi9cbiAgYXN5bmMgY3JlYXRlU2hhcmUoZmlsZTogVEZpbGUsIGV4cGlyZXM6IFNoYXJlRXhwaXJhdGlvbiwgc2lsZW50ID0gZmFsc2UpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAvLyAxLiBwdWJsaWNVcmwgXHVDMTI0XHVDODE1IFx1RDY1NVx1Qzc3OFxuICAgIGlmICghdGhpcy5zZXR0aW5ncy5wdWJsaWNVcmwpIHtcbiAgICAgIGlmICghc2lsZW50KSB0aGlzLnNob3dOb3RpY2UoJ1x1QUNGNVx1QzcyMCBcdUFFMzBcdUIyQTVcdUM3NDQgXHVDMEFDXHVDNkE5XHVENTU4XHVCODI0XHVCQTc0IFx1QzEyNFx1QzgxNVx1QzVEMFx1QzExQyBwdWJsaWNVcmxcdUM3NDQgXHVDMTI0XHVDODE1XHVENTc0XHVDOEZDXHVDMTM4XHVDNjk0Jyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gMi4gZmlsZUlkIFx1Qzg3MFx1RDY4QyAoXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwIFx1QjYxMFx1QjI5NCBGaWxlSWRUcmFja2VyKVxuICAgICAgY29uc3QgZmlsZUlkID0gYXdhaXQgdGhpcy5nZXRGaWxlSWQoZmlsZSk7XG4gICAgICBpZiAoIWZpbGVJZCkge1xuICAgICAgICBpZiAoIXNpbGVudCkgdGhpcy5zaG93Tm90aWNlKCdcdUQzMENcdUM3N0NcdUM3NzQgXHVDMTFDXHVCQzg0XHVDNUQwIFx1QjNEOVx1QUUzMFx1RDY1NFx1QjQxOFx1QzlDMCBcdUM1NEFcdUM1NThcdUMyQjVcdUIyQzhcdUIyRTQuIFx1QkEzQ1x1QzgwMCBcdUIzRDlcdUFFMzBcdUQ2NTRcdUQ1NzRcdUM4RkNcdUMxMzhcdUM2OTQuJyk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyAzLiBSRVNUIEFQSSBcdUQ2MzhcdUNEOUM6IFBPU1QgL3YxLzp2YXVsdF9pZC9zaGFyZXNcbiAgICAgIGNvbnN0IGJhc2VVcmwgPSB0aGlzLnNldHRpbmdzLnNlcnZlclVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS92MS8ke3RoaXMuc2V0dGluZ3MudmF1bHRJZH0vc2hhcmVzYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3RoaXMuc2V0dGluZ3MuYXBpS2V5fWAsXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGZpbGVJZCxcbiAgICAgICAgICBleHBpcmVzSW46IGV4cGlyZXMsXG4gICAgICAgICAgcHVibGljVXJsOiB0aGlzLnNldHRpbmdzLnB1YmxpY1VybCxcbiAgICAgICAgfSksXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCkuY2F0Y2goKCkgPT4gJycpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBbY3JlYXRlU2hhcmVdIEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9OmAsIGVycm9yVGV4dCk7XG4gICAgICAgIGlmICghc2lsZW50KSB0aGlzLnNob3dOb3RpY2UoYFx1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkMgXHVDMEREXHVDMTMxIFx1QzJFNFx1RDMyODogSFRUUCAke3Jlc3BvbnNlLnN0YXR1c30gLSAke2Vycm9yVGV4dH1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNoYXJlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyBTaGFyZURhdGE7XG5cbiAgICAgIC8vIDQuIFx1QUUzMFx1Qzg3NCBcdUFDRjVcdUM3MjAgXHVDN0FDXHVENjVDXHVDNkE5IFx1QzVFQ1x1QkQ4MCBcdUQ2NTVcdUM3NzhcbiAgICAgIGNvbnN0IGV4aXN0aW5nU3RhdHVzID0gYXdhaXQgdGhpcy5nZXRTaGFyZVN0YXR1cyhmaWxlKTtcbiAgICAgIGNvbnN0IGlzUmV1c2UgPSBleGlzdGluZ1N0YXR1cy5zaGFyZUlkID09PSBzaGFyZURhdGEuaWQ7XG5cbiAgICAgIC8vIDUuIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMCBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggKFx1QzdBQ1x1QzJEQ1x1QjNDNCBcdUI4NUNcdUM5QzEgXHVEM0VDXHVENTY4KVxuICAgICAgYXdhaXQgdGhpcy51cGRhdGVGcm9udG1hdHRlcldpdGhSZXRyeShmaWxlLCB7XG4gICAgICAgIHNoYXJlX2lkOiBzaGFyZURhdGEuaWQsXG4gICAgICAgIHNoYXJlX3VybDogc2hhcmVEYXRhLnNoYXJlVXJsLFxuICAgICAgICBzaGFyZV9leHBpcmVzOiBzaGFyZURhdGEuc2hhcmVFeHBpcmVzIHx8ICd1bmxpbWl0ZWQnLFxuICAgICAgfSwgMyk7XG5cbiAgICAgIC8vIDYuIFx1RDA3NFx1QjlCRFx1QkNGNFx1QjREQ1x1QzVEMCBVUkwgXHVCQ0Y1XHVDMEFDXG4gICAgICBhd2FpdCBjb3B5VG9DbGlwYm9hcmQoc2hhcmVEYXRhLnNoYXJlVXJsKTtcbiAgICAgIGlmICghc2lsZW50KSB7XG4gICAgICAgIHRoaXMuc2hvd05vdGljZShpc1JldXNlXG4gICAgICAgICAgPyAnXHVCOUNDXHVCOENDIFx1QzJEQ1x1QUMwNFx1Qzc3NCBcdUFDMzFcdUMyRTBcdUI0MThcdUM1QjQgXHVEMDc0XHVCOUJEXHVCQ0Y0XHVCNERDXHVDNUQwIFx1QkNGNVx1QzBBQ1x1QjQxOFx1QzVDOFx1QzJCNVx1QjJDOFx1QjJFNC4nXG4gICAgICAgICAgOiAnXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2Q1x1QUMwMCBcdUMwRERcdUMxMzFcdUI0MThcdUM1QjQgXHVEMDc0XHVCOUJEXHVCQ0Y0XHVCNERDXHVDNUQwIFx1QkNGNVx1QzBBQ1x1QjQxOFx1QzVDOFx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzaGFyZURhdGEuc2hhcmVVcmw7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcignW2NyZWF0ZVNoYXJlXSBcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFx1QzBERFx1QzEzMSBcdUMyRTRcdUQzMjg6JywgZXJyb3IpO1xuICAgICAgaWYgKCFzaWxlbnQpIHRoaXMuc2hvd05vdGljZShgXHVBQ0Y1XHVDNzIwIFx1QzYyNFx1Qjk1ODogJHtlcnJvcj8ubWVzc2FnZSB8fCBlcnJvcn1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUFDRjVcdUM3MjAgXHVDOTExXHVDOUMwIChSRVEtU0hBUkUtMTAyKVxuICAgKiBATVg6Tk9URTogW0FVVE9dIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMFx1QzVEMFx1QzExQyBzaGFyZUlkIFx1Qzg3MFx1RDY4QyBcdTIxOTIgUkVTVCBcdUMwQURcdUM4MUMgXHUyMTkyIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMCBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjhcbiAgICovXG4gIGFzeW5jIHN0b3BTaGFyZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICAvLyAxLiBzaGFyZUlkIFx1Qzg3MFx1RDY4QyAoXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwKVxuICAgICAgY29uc3Qgc2hhcmVJZCA9IGF3YWl0IHRoaXMuZ2V0U2hhcmVJZEZyb21Gcm9udG1hdHRlcihmaWxlKTtcbiAgICAgIGlmICghc2hhcmVJZCkge1xuICAgICAgICB0aGlzLnNob3dOb3RpY2UoJ1x1QUNGNVx1QzcyMCBcdUM5MTFcdUM3NzggXHVCOUMxXHVEMDZDXHVBQzAwIFx1QzVDNlx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyAyLiBSRVNUIEFQSSBcdUQ2MzhcdUNEOUM6IERFTEVURSAvdjEvOnZhdWx0X2lkL3NoYXJlcy86c2hhcmVfaWRcbiAgICAgIGNvbnN0IGJhc2VVcmwgPSB0aGlzLnNldHRpbmdzLnNlcnZlclVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS92MS8ke3RoaXMuc2V0dGluZ3MudmF1bHRJZH0vc2hhcmVzLyR7c2hhcmVJZH1gLCB7XG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLnNldHRpbmdzLmFwaUtleX1gLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpLmNhdGNoKCgpID0+ICcnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3N0b3BTaGFyZV0gSFRUUCAke3Jlc3BvbnNlLnN0YXR1c306YCwgZXJyb3JUZXh0KTtcbiAgICAgICAgdGhpcy5zaG93Tm90aWNlKGBcdUFDRjVcdUM3MjAgXHVDOTExXHVDOUMwIFx1QzJFNFx1RDMyODogSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyAzLiBcdUQ1MDRcdUI4NjBcdUQyQjhcdUI5RTRcdUQxMzBcdUM1RDBcdUMxMUMgXHVBQ0Y1XHVDNzIwIFx1RDU0NFx1QjREQyBcdUM4MUNcdUFDNzBcbiAgICAgIGF3YWl0IHRoaXMucmVtb3ZlU2hhcmVGcm9udG1hdHRlcihmaWxlKTtcblxuICAgICAgdGhpcy5zaG93Tm90aWNlKCdcdUFDRjVcdUM3MjBcdUFDMDAgXHVDOTExXHVDOUMwXHVCNDE4XHVDNUM4XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbc3RvcFNoYXJlXSBcdUFDRjVcdUM3MjAgXHVDOTExXHVDOUMwIFx1QzJFNFx1RDMyODonLCBlcnJvcik7XG4gICAgICB0aGlzLnNob3dOb3RpY2UoJ1x1QUNGNVx1QzcyMCBcdUM5MTFcdUM5QzAgXHVDOTExIFx1QzYyNFx1Qjk1OFx1QUMwMCBcdUJDMUNcdUMwRERcdUQ1ODhcdUMyQjVcdUIyQzhcdUIyRTQuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QUNGNVx1QzcyMCBVUkwgXHVCMkU0XHVDMkRDIFx1QkNGNVx1QzBBQ1xuICAgKiBATVg6Tk9URTogW0FVVE9dIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMFx1QzVEMFx1QzExQyBzaGFyZV91cmwgXHVDODcwXHVENjhDXHVENTU4XHVDNUVDIFx1RDA3NFx1QjlCRFx1QkNGNFx1QjREQyBcdUJDRjVcdUMwQUNcbiAgICovXG4gIGFzeW5jIGNvcHlTaGFyZVVybChmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzaGFyZVVybCA9IGF3YWl0IHRoaXMuZ2V0U2hhcmVVcmxGcm9tRnJvbnRtYXR0ZXIoZmlsZSk7XG4gICAgICBpZiAoIXNoYXJlVXJsKSB7XG4gICAgICAgIHRoaXMuc2hvd05vdGljZSgnXHVBQ0Y1XHVDNzIwIFx1QzkxMVx1Qzc3OCBcdUI5QzFcdUQwNkNcdUFDMDAgXHVDNUM2XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGNvcHlUb0NsaXBib2FyZChzaGFyZVVybCk7XG4gICAgICB0aGlzLnNob3dOb3RpY2UoJ1x1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkNcdUFDMDAgXHVEMDc0XHVCOUJEXHVCQ0Y0XHVCNERDXHVDNUQwIFx1QkNGNVx1QzBBQ1x1QjQxOFx1QzVDOFx1QzJCNVx1QjJDOFx1QjJFNC4nKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW2NvcHlTaGFyZVVybF0gVVJMIFx1QkNGNVx1QzBBQyBcdUMyRTRcdUQzMjg6JywgZXJyb3IpO1xuICAgICAgdGhpcy5zaG93Tm90aWNlKCdVUkwgXHVCQ0Y1XHVDMEFDIFx1QzkxMSBcdUM2MjRcdUI5NThcdUFDMDAgXHVCQzFDXHVDMEREXHVENTg4XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUFDRjVcdUM3MjAgXHVDMEMxXHVEMERDIFx1Qzg3MFx1RDY4QyAoUkVRLVNIQVJFLTEwMylcbiAgICogQE1YOk5PVEU6IFtBVVRPXSBcdUQ1MDRcdUI4NjBcdUQyQjhcdUI5RTRcdUQxMzBcdUM1RDBcdUMxMUMgXHVBQ0Y1XHVDNzIwIFx1QzgxNVx1QkNGNCBcdUM3N0RcdUFFMzBcbiAgICovXG4gIGFzeW5jIGdldFNoYXJlU3RhdHVzKGZpbGU6IFRGaWxlKTogUHJvbWlzZTxTaGFyZVN0YXR1cz4ge1xuICAgIC8vIFx1Q0U5MFx1QzJEQ1x1QzVEMFx1QzExQyBcdUQ1NUNcdUJDODhcdUM1RDAgXHVDODcwXHVENjhDXG4gICAgY29uc3QgY2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICBjb25zdCBmbSA9IGNhY2hlPy5mcm9udG1hdHRlcjtcbiAgICBpZiAoZm0/LnNoYXJlX3VybCB8fCBmbT8uc2hhcmVfZXhwaXJlcyB8fCBmbT8uc2hhcmVfaWQpIHtcbiAgICAgIGNvbnN0IHNoYXJlVXJsID0gZm0/LnNoYXJlX3VybCB8fCBudWxsO1xuICAgICAgY29uc3Qgc2hhcmVFeHBpcmVzID0gZm0/LnNoYXJlX2V4cGlyZXMgfHwgbnVsbDtcbiAgICAgIGNvbnN0IHNoYXJlSWQgPSBmbT8uc2hhcmVfaWQgfHwgbnVsbDtcbiAgICAgIHJldHVybiB7IGlzU2hhcmVkOiAhIXNoYXJlVXJsICYmIHNoYXJlRXhwaXJlcyAhPT0gJ2V4cGlyZWQnLCBzaGFyZVVybCwgc2hhcmVFeHBpcmVzLCBzaGFyZUlkIH07XG4gICAgfVxuXG4gICAgLy8gXHVDRTkwXHVDMkRDIFx1QkJGOFx1QzJBNCBcdUMyREMgXHVEMzBDXHVDNzdDIDFcdUQ2OEMgXHVDNzdEXHVBRTMwXHVCODVDIFx1QkFBOFx1QjRFMCBcdUQ1NDRcdUI0REMgXHVDRDk0XHVDRDlDXG4gICAgY29uc3QgZmllbGRzID0gYXdhaXQgdGhpcy5yZWFkRnJvbnRtYXR0ZXJGaWVsZHMoZmlsZSwgJ3NoYXJlX3VybCcsICdzaGFyZV9leHBpcmVzJywgJ3NoYXJlX2lkJyk7XG4gICAgY29uc3Qgc2hhcmVVcmwgPSBmaWVsZHMuZ2V0KCdzaGFyZV91cmwnKSB8fCBudWxsO1xuICAgIGNvbnN0IHNoYXJlRXhwaXJlcyA9IGZpZWxkcy5nZXQoJ3NoYXJlX2V4cGlyZXMnKSB8fCBudWxsO1xuICAgIGNvbnN0IHNoYXJlSWQgPSBmaWVsZHMuZ2V0KCdzaGFyZV9pZCcpIHx8IG51bGw7XG4gICAgcmV0dXJuIHsgaXNTaGFyZWQ6ICEhc2hhcmVVcmwgJiYgc2hhcmVFeHBpcmVzICE9PSAnZXhwaXJlZCcsIHNoYXJlVXJsLCBzaGFyZUV4cGlyZXMsIHNoYXJlSWQgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBwdWJsaWNVcmwgXHVDMTI0XHVDODE1IFx1RDY1NVx1Qzc3OFxuICAgKi9cbiAgaXNQdWJsaWNVcmxDb25maWd1cmVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuc2V0dGluZ3MucHVibGljVXJsO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1RDUwQ1x1QjdFQ1x1QURGOFx1Qzc3OCBcdUMyRENcdUM3OTEgXHVDMkRDIFx1QUNGNVx1QzcyMCBcdUIzRDlcdUFFMzBcdUQ2NTQgKFJFUS1TSEFSRS0xMDQpXG4gICAqIEBNWDpOT1RFOiBbQVVUT10gXHVDMTFDXHVCQzg0IFx1QUNGNVx1QzcyMCBcdUJBQTlcdUI4NURcdUFDRkMgXHVCODVDXHVDRUVDIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMCBcdUIzRDlcdUFFMzBcdUQ2NTRcbiAgICovXG4gIGFzeW5jIHN5bmNTaGFyZXNPblN0YXJ0dXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLnB1YmxpY1VybCkge1xuICAgICAgcmV0dXJuOyAvLyBwdWJsaWNVcmxcdUM3NzQgXHVDNUM2XHVDNzNDXHVCQTc0IFx1QUM3NFx1QjEwOFx1QjcwMFxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyAxLiBcdUMxMUNcdUJDODRcdUM1RDBcdUMxMUMgXHVCQUE4XHVCNEUwIFx1QUNGNVx1QzcyMCBcdUJBQTlcdUI4NUQgXHVDODcwXHVENjhDXG4gICAgICBjb25zdCBiYXNlVXJsID0gdGhpcy5zZXR0aW5ncy5zZXJ2ZXJVcmwucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YmFzZVVybH0vdjEvJHt0aGlzLnNldHRpbmdzLnZhdWx0SWR9L3NoYXJlc2AsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3RoaXMuc2V0dGluZ3MuYXBpS2V5fWAsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLndhcm4oYFtzeW5jU2hhcmVzT25TdGFydHVwXSBcdUFDRjVcdUM3MjAgXHVCQUE5XHVCODVEIFx1Qzg3MFx1RDY4QyBcdUMyRTRcdUQzMjg6IEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIHRoaXMuc2hvd05vdGljZShgXHVBQ0Y1XHVDNzIwIFx1QkFBOVx1Qjg1RCBcdUM4NzBcdUQ2OEMgXHVDMkU0XHVEMzI4OiBcdUMxMUNcdUJDODQgXHVDNjI0XHVCOTU4IChIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfSlgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzaGFyZXMgPSBhd2FpdCByZXNwb25zZS5qc29uKCkgYXMgU2hhcmVEYXRhW107XG4gICAgICAvLyBzaGFyZS5pZChcdUFDRjVcdUM3MjAgVVVJRClcdUI5N0MgXHVEMEE0XHVCODVDIFx1QjlFNFx1RDU1MSBcdTIwMTQgZmlsZUlkXHVCMjk0IFx1QzdBQ1x1QzJEQ1x1Qzc5MSBcdUMyREMgXHVDODcwXHVENjhDIFx1QkQ4OFx1QUMwMFxuICAgICAgY29uc3Qgc2VydmVyU2hhcmVCeUlkID0gbmV3IE1hcDxzdHJpbmcsIFNoYXJlRGF0YT4oKTtcbiAgICAgIGZvciAoY29uc3Qgc2hhcmUgb2Ygc2hhcmVzKSB7XG4gICAgICAgIHNlcnZlclNoYXJlQnlJZC5zZXQoc2hhcmUuaWQsIHNoYXJlKTtcbiAgICAgIH1cblxuICAgICAgLy8gMi4gXHVCODVDXHVDRUVDIFx1RDMwQ1x1Qzc3QyBcdUMyQTRcdUNFOTQgXHVCQzBGIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMCBcdUQ2NTVcdUM3NzhcbiAgICAgIGNvbnN0IGFsbEZpbGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0RmlsZXMoKTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBhbGxGaWxlcykge1xuICAgICAgICBjb25zdCBsb2NhbFN0YXR1cyA9IGF3YWl0IHRoaXMuZ2V0U2hhcmVTdGF0dXMoZmlsZSk7XG4gICAgICAgIGlmICghbG9jYWxTdGF0dXMuc2hhcmVJZCAmJiAhbG9jYWxTdGF0dXMuc2hhcmVVcmwpIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIHNoYXJlX2lkXHVCODVDIFx1QzExQ1x1QkM4NCBcdUFDRjVcdUM3MjAgXHVCOUU0XHVDRTZEIChmaWxlSWQgXHVDN0FDXHVDMkRDXHVDNzkxIFx1QzJEQyBcdUMyRTBcdUI4QjAgXHVCRDg4XHVBQzAwKVxuICAgICAgICBjb25zdCBzZXJ2ZXJTaGFyZSA9IGxvY2FsU3RhdHVzLnNoYXJlSWRcbiAgICAgICAgICA/IHNlcnZlclNoYXJlQnlJZC5nZXQobG9jYWxTdGF0dXMuc2hhcmVJZClcbiAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgaWYgKHNlcnZlclNoYXJlICYmIHNlcnZlclNoYXJlLmlzQWN0aXZlICYmICFsb2NhbFN0YXR1cy5zaGFyZVVybCkge1xuICAgICAgICAgIC8vIFx1QzExQ1x1QkM4NFx1QzVEMCBcdUQ2NUNcdUMxMzEgXHVBQ0Y1XHVDNzIwXHVBQzAwIFx1Qzc4OFx1QzlDMFx1QjlDQyBcdUI4NUNcdUNFRUMgXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwXHVDNUQwIFx1QzVDNlx1Qzc0QyBcdTIxOTIgXHVCQ0Y1XHVDNkQwXG4gICAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVGcm9udG1hdHRlcldpdGhSZXRyeShmaWxlLCB7XG4gICAgICAgICAgICBzaGFyZV9pZDogc2VydmVyU2hhcmUuaWQsXG4gICAgICAgICAgICBzaGFyZV91cmw6IHNlcnZlclNoYXJlLnNoYXJlVXJsLFxuICAgICAgICAgICAgc2hhcmVfZXhwaXJlczogc2VydmVyU2hhcmUuc2hhcmVFeHBpcmVzIHx8ICd1bmxpbWl0ZWQnLFxuICAgICAgICAgIH0sIDEpO1xuICAgICAgICB9IGVsc2UgaWYgKCghc2VydmVyU2hhcmUgfHwgIXNlcnZlclNoYXJlLmlzQWN0aXZlKSAmJiBsb2NhbFN0YXR1cy5zaGFyZVVybCAmJiBsb2NhbFN0YXR1cy5zaGFyZUV4cGlyZXMgIT09ICdleHBpcmVkJykge1xuICAgICAgICAgIC8vIFx1QzExQ1x1QkM4NFx1QzVEMCBcdUM1QzZcdUFDNzBcdUIwOTggXHVCRTQ0XHVENjVDXHVDMTMxLCBcdUI4NUNcdUNFRUNcdUM1RDBcdUIyOTQgXHVENjVDXHVDMTMxIFx1MjE5MiBcdUI5Q0NcdUI4Q0MgXHVDQzk4XHVCOUFDXG4gICAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVGcm9udG1hdHRlcldpdGhSZXRyeShmaWxlLCB7XG4gICAgICAgICAgICBzaGFyZV9leHBpcmVzOiAnZXhwaXJlZCcsXG4gICAgICAgICAgfSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW3N5bmNTaGFyZXNPblN0YXJ0dXBdIFx1QUNGNVx1QzcyMCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMkU0XHVEMzI4OicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBzaG91bGRTdXBwcmVzc01vZGlmeShfZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQ1MDRcdUI4NjBcdUQyQjhcdUI5RTRcdUQxMzAgXHVENTQ0XHVCNERDIFx1Qzg3MFx1RDY4QyAoXHVDRTkwXHVDMkRDIFx1QzZCMFx1QzEyMCwgXHVEMzBDXHVDNzdDIFx1QzlDMVx1QzgxMSBcdUM3N0RcdUFFMzAgXHVEM0Y0XHVCQzMxKVxuICAgKiBATVg6Tk9URTogW0FVVE9dIG1ldGFkYXRhQ2FjaGUgXHVDRTkwXHVDMkRDIFx1QkJGOFx1QkMxOFx1QzYwMSBcdUMyREMgdmF1bHQucmVhZFx1Qjg1QyBcdUQzRjRcdUJDMzFcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgcmVhZEZyb250bWF0dGVyRmllbGQoZmlsZTogVEZpbGUsIC4uLmtleXM6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgLy8gMS4gXHVDRTkwXHVDMkRDXHVDNUQwXHVDMTFDIFx1Qzg3MFx1RDY4QyAoXHVCRTYwXHVCOTg0KVxuICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgY29uc3QgdmFsID0gY2FjaGU/LmZyb250bWF0dGVyPy5ba2V5XTtcbiAgICAgIGlmICh2YWwpIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgLy8gMi4gXHVEMzBDXHVDNzdDIFx1QzlDMVx1QzgxMSBcdUM3N0RcdUFFMzAgXHVEM0Y0XHVCQzMxIChcdUNFOTBcdUMyRENcdUFDMDAgXHVDNjI0XHVCNzk4XHVCNDFDIFx1QUNCRFx1QzZCMClcbiAgICBjb25zdCBmaWVsZHMgPSBhd2FpdCB0aGlzLnJlYWRGcm9udG1hdHRlckZpZWxkcyhmaWxlLCAuLi5rZXlzKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICBjb25zdCB2YWwgPSBmaWVsZHMuZ2V0KGtleSk7XG4gICAgICBpZiAodmFsKSByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVhZEZyb250bWF0dGVyRmllbGRzKGZpbGU6IFRGaWxlLCAuLi5rZXlzOiBzdHJpbmdbXSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgY29uc3QgeWFtbE1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxccj9cXG4oW1xcc1xcU10qPylcXHI/XFxuLS0tLyk7XG4gICAgICBpZiAoIXlhbWxNYXRjaCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGZvciAoY29uc3QgbGluZSBvZiB5YW1sTWF0Y2hbMV0uc3BsaXQoL1xccj9cXG4vKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdC5oYXMoa2V5KSkgY29udGludWU7XG4gICAgICAgICAgY29uc3QgZXNjYXBlZCA9IGtleS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xuICAgICAgICAgIGNvbnN0IGt2ID0gbGluZS5tYXRjaChuZXcgUmVnRXhwKGBeJHtlc2NhcGVkfTpcXFxccyooLispJGApKTtcbiAgICAgICAgICBpZiAoa3YpIHJlc3VsdC5zZXQoa2V5LCBrdlsxXS50cmltKCkucmVwbGFjZSgvXlsnXCJdfFsnXCJdJC9nLCAnJykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCB7fVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogZmlsZUlkIFx1Qzg3MFx1RDY4QyAoXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwIFx1QjYxMFx1QjI5NCBGaWxlSWRUcmFja2VyKVxuICAgKiBATVg6Tk9URTogW0FVVE9dIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMFx1Qzc1OCBzaGFyZV9pZCBcdUI2MTBcdUIyOTQgaWQgXHVENTQ0XHVCNERDIFx1QzBBQ1x1QzZBOVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRGaWxlSWQoZmlsZTogVEZpbGUpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAvLyAxLiBGaWxlSWRUcmFja2VyXHVDNUQwXHVDMTFDIFx1Qzg3MFx1RDY4QyAoXHVDMTFDXHVCQzg0IFx1QjNEOVx1QUUzMFx1RDY1NCBJRClcbiAgICBjb25zdCB0cmFja2VkSWQgPSB0aGlzLmdldEZpbGVJZEJ5UGF0aChmaWxlLnBhdGgpO1xuICAgIGlmICh0cmFja2VkSWQpIHJldHVybiB0cmFja2VkSWQ7XG4gICAgLy8gMi4gXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwIFx1RDNGNFx1QkMzMVxuICAgIHJldHVybiB0aGlzLnJlYWRGcm9udG1hdHRlckZpZWxkKGZpbGUsICdpZCcsICdzaGFyZV9pZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1RDUwNFx1Qjg2MFx1RDJCOFx1QjlFNFx1RDEzMFx1QzVEMFx1QzExQyBzaGFyZUlkIFx1Qzg3MFx1RDY4Q1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRTaGFyZUlkRnJvbUZyb250bWF0dGVyKGZpbGU6IFRGaWxlKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMucmVhZEZyb250bWF0dGVyRmllbGQoZmlsZSwgJ3NoYXJlX2lkJyk7XG4gIH1cblxuICAvKipcbiAgICogXHVENTA0XHVCODYwXHVEMkI4XHVCOUU0XHVEMTMwXHVDNUQwXHVDMTFDIHNoYXJlVXJsIFx1Qzg3MFx1RDY4Q1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRTaGFyZVVybEZyb21Gcm9udG1hdHRlcihmaWxlOiBURmlsZSk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRGcm9udG1hdHRlckZpZWxkKGZpbGUsICdzaGFyZV91cmwnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQ1MDRcdUI4NjBcdUQyQjhcdUI5RTRcdUQxMzAgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IChcdUM3QUNcdUMyRENcdUIzQzQgXHVCODVDXHVDOUMxIFx1RDNFQ1x1RDU2OClcbiAgICogQE1YOk5PVEU6IFtBVVRPXSBcdUFDRjVcdUM3MjAgXHVDMThEXHVDMTMxXHVCM0M0IFx1QzExQ1x1QkM4NFx1QzVEMCBcdUIzRDlcdUFFMzBcdUQ2NTRcdUI0MThcdUM1QjRcdUM1N0MgXHVENTU4XHVCQkMwXHVCODVDIG1vZGlmeSBcdUM3NzRcdUJDQTRcdUQyQjhcdUI5N0MgXHVDNUI1XHVDODFDXHVENTU4XHVDOUMwIFx1QzU0QVx1Qzc0Q1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB1cGRhdGVGcm9udG1hdHRlcldpdGhSZXRyeShcbiAgICBmaWxlOiBURmlsZSxcbiAgICBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICAgIHJldHJpZXMgPSAzLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8IHJldHJpZXM7IGF0dGVtcHQrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmcm9udG1hdHRlcjogYW55KSA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihmcm9udG1hdHRlciwgZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBwcm9jZXNzRnJvbnRNYXR0ZXIgdHJpZ2dlcnMgbW9kaWZ5IGV2ZW50IFx1MjE5MiBoYW5kbGVGaWxlTW9kaWZ5IGhhbmRsZXMgc3luY1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gcmV0cmllcyAtIDEpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwICogKGF0dGVtcHQgKyAxKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQ1MDRcdUI4NjBcdUQyQjhcdUI5RTRcdUQxMzBcdUM1RDBcdUMxMUMgXHVBQ0Y1XHVDNzIwIFx1QUQwMFx1QjgyOCBcdUQ1NDRcdUI0REMgXHVDODFDXHVBQzcwXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHJlbW92ZVNoYXJlRnJvbnRtYXR0ZXIoZmlsZTogVEZpbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGZyb250bWF0dGVyOiBhbnkpID0+IHtcbiAgICAgIGRlbGV0ZSBmcm9udG1hdHRlci5zaGFyZV9pZDtcbiAgICAgIGRlbGV0ZSBmcm9udG1hdHRlci5zaGFyZV91cmw7XG4gICAgICBkZWxldGUgZnJvbnRtYXR0ZXIuc2hhcmVfZXhwaXJlcztcbiAgICB9KTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgTW9kYWwsIE5vdGljZSwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB0eXBlIHsgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFNoYXJlRXhwaXJhdGlvbiB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5TaGFyZVNlcnZpY2UgfSBmcm9tICcuL3NoYXJlLXNlcnZpY2UnO1xuaW1wb3J0IHsgY29weVRvQ2xpcGJvYXJkIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IEVYUElSWV9PUFRJT05TOiB7IHZhbHVlOiBTaGFyZUV4cGlyYXRpb247IGxhYmVsOiBzdHJpbmcgfVtdID0gW1xuXHR7IHZhbHVlOiAnMWgnLCBsYWJlbDogJzFIJyB9LFxuXHR7IHZhbHVlOiAnMWQnLCBsYWJlbDogJzFEJyB9LFxuXHR7IHZhbHVlOiAnN2QnLCBsYWJlbDogJzdEJyB9LFxuXHR7IHZhbHVlOiAndW5saW1pdGVkJywgbGFiZWw6ICdObyBMaW1pdCcgfSxcbl07XG5cbi8qKlxuICogXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBcdUMwRERcdUMxMzEgXHVCQUE4XHVCMkVDXG4gKiBQaGFzZSAxOiBcdUI5Q0NcdUI4Q0MgXHVDMkRDXHVBQzA0IFx1QzEyMFx1RDBERCBcdTIxOTIgXHVDMEREXHVDMTMxXG4gKiBQaGFzZSAyOiBcdUI5QzFcdUQwNkMgXHVENDVDXHVDMkRDICsgXHVCQ0Y1XHVDMEFDXG4gKi9cbmV4cG9ydCBjbGFzcyBTaGFyZU1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIHNlbGVjdGVkOiBTaGFyZUV4cGlyYXRpb24gPSAndW5saW1pdGVkJztcblx0cHJpdmF0ZSByZWFkb25seSBpc1VwZGF0ZTogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRhcHA6IEFwcCxcblx0XHRwcml2YXRlIGZpbGU6IFRGaWxlLFxuXHRcdHByaXZhdGUgc2hhcmVTZXJ2aWNlOiBQbHVnaW5TaGFyZVNlcnZpY2UsXG5cdFx0Y3VycmVudEV4cGlyYXRpb24/OiBTaGFyZUV4cGlyYXRpb24sXG5cdCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5pc1VwZGF0ZSA9ICEhY3VycmVudEV4cGlyYXRpb247XG5cdFx0aWYgKGN1cnJlbnRFeHBpcmF0aW9uKSB7XG5cdFx0XHR0aGlzLnNlbGVjdGVkID0gY3VycmVudEV4cGlyYXRpb247XG5cdFx0fVxuXHR9XG5cblx0b25PcGVuKCk6IHZvaWQge1xuXHRcdHRoaXMucmVuZGVyU2VsZWN0UGhhc2UoKTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU2VsZWN0UGhhc2UoKTogdm9pZCB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKCdzaGFyZS1tb2RhbCcpO1xuXG5cdFx0dGhpcy50aXRsZUVsLnNldFRleHQodGhpcy5pc1VwZGF0ZSA/ICdcdUFDRjVcdUM3MjAgXHVCOUNDXHVCOENDIFx1QzJEQ1x1QUMwNCBcdUJDQzBcdUFDQkQnIDogJ1x1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkMgXHVDMEREXHVDMTMxJyk7XG5cblx0XHQvLyBcdUJCMzhcdUMxMUMgXHVDODE1XHVCQ0Y0XG5cdFx0bmV3IFNldHRpbmcoY29udGVudEVsKVxuXHRcdFx0LnNldE5hbWUoJ1x1QkIzOFx1QzExQ1x1QkE4NScpXG5cdFx0XHQuc2V0RGVzYyh0aGlzLmZpbGUuYmFzZW5hbWUpXG5cdFx0XHQuc2V0Q2xhc3MoJ3NoYXJlLWRvYy1pbmZvJyk7XG5cblx0XHQvLyBcdUI5Q0NcdUI4Q0MgXHVDMkRDXHVBQzA0IFx1QzU0OFx1QjBCNFxuXHRcdGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6ICdzaGFyZS1kZXNjJywgdGV4dDogJ1x1QUNGNVx1QzcyMCBcdUI5QzFcdUQwNkMgXHVCOUNDXHVCOENDIFx1QzJEQ1x1QUMwNFx1Qzc0NCBcdUMxMjBcdUQwRERcdUQ1NThcdUMxMzhcdUM2OTQnIH0pO1xuXG5cdFx0Ly8gNFx1QzVGNCBcdUJDODRcdUQyQkNcblx0XHRjb25zdCByb3cgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiAnc2hhcmUtZXhwaXJ5LXJvdycgfSk7XG5cdFx0Zm9yIChjb25zdCBvcHQgb2YgRVhQSVJZX09QVElPTlMpIHtcblx0XHRcdGNvbnN0IGJ0biA9IHJvdy5jcmVhdGVFbCgnYnV0dG9uJywge1xuXHRcdFx0XHRjbHM6ICdzaGFyZS1leHBpcnktYnRuJyArICh0aGlzLnNlbGVjdGVkID09PSBvcHQudmFsdWUgPyAnIGlzLWFjdGl2ZScgOiAnJyksXG5cdFx0XHRcdHRleHQ6IG9wdC5sYWJlbCxcblx0XHRcdH0pO1xuXHRcdFx0YnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkID0gb3B0LnZhbHVlO1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hBY3RpdmVCdXR0b24ocm93KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIFx1RDU1OFx1QjJFOCBcdUJDODRcdUQyQkMgKFx1QUUzMFx1Qzg3NCBcdUJBQThcdUIyRUMgXHVEMzI4XHVEMTM0IFx1QzkwMFx1QzIxOClcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuYWRkQnV0dG9uKChidG4pID0+XG5cdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUIyRUJcdUFFMzAnKS5vbkNsaWNrKCgpID0+IHRoaXMuY2xvc2UoKSksXG5cdFx0XHQpXG5cdFx0XHQuYWRkQnV0dG9uKChidG4pID0+XG5cdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUMwRERcdUMxMzEnKS5zZXRDdGEoKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRidG4uc2V0QnV0dG9uVGV4dCgnXHVDMEREXHVDMTMxIFx1QzkxMS4uLicpO1xuXHRcdFx0XHRcdGJ0bi5zZXREaXNhYmxlZCh0cnVlKTtcblx0XHRcdFx0XHRjb25zdCB1cmwgPSBhd2FpdCB0aGlzLnNoYXJlU2VydmljZS5jcmVhdGVTaGFyZSh0aGlzLmZpbGUsIHRoaXMuc2VsZWN0ZWQsIHRydWUpO1xuXHRcdFx0XHRcdGlmICh1cmwpIHtcblx0XHRcdFx0XHRcdHRoaXMucmVuZGVyUmVzdWx0UGhhc2UodXJsKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZSgnXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QyBcdUMwRERcdUMxMzFcdUM1RDAgXHVDMkU0XHVEMzI4XHVENTg4XHVDMkI1XHVCMkM4XHVCMkU0LicpO1xuXHRcdFx0XHRcdFx0YnRuLnNldEJ1dHRvblRleHQoJ1x1QzBERFx1QzEzMScpO1xuXHRcdFx0XHRcdFx0YnRuLnNldERpc2FibGVkKGZhbHNlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLFxuXHRcdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUmVzdWx0UGhhc2UodXJsOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblxuXHRcdHRoaXMudGl0bGVFbC5zZXRUZXh0KCdcdUFDRjVcdUM3MjAgXHVCOUMxXHVEMDZDIFx1QzBERFx1QzEzMSBcdUM2NDRcdUI4Q0MnKTtcblxuXHRcdC8vIFx1QkIzOFx1QzExQyBcdUM4MTVcdUJDRjRcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnXHVCQjM4XHVDMTFDXHVCQTg1Jylcblx0XHRcdC5zZXREZXNjKHRoaXMuZmlsZS5iYXNlbmFtZSlcblx0XHRcdC5zZXRDbGFzcygnc2hhcmUtZG9jLWluZm8nKTtcblxuXHRcdC8vIFx1QjlDMVx1RDA2QyBcdUQ0NUNcdUMyRENcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnXHVBQ0Y1XHVDNzIwIFx1QjlDMVx1RDA2QycpXG5cdFx0XHQuYWRkVGV4dCgodGV4dCkgPT4ge1xuXHRcdFx0XHR0ZXh0LnNldFZhbHVlKHVybCkuc2V0RGlzYWJsZWQodHJ1ZSk7XG5cdFx0XHRcdHRleHQuaW5wdXRFbC5jbGFzc0xpc3QuYWRkKCdzaGFyZS1saW5rLWlucHV0Jyk7XG5cdFx0XHR9KTtcblxuXHRcdC8vIFx1QjJFQlx1QUUzMCArIFx1QjlDMVx1RDA2QyBcdUJDRjVcdUMwQUNcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuYWRkQnV0dG9uKChidG4pID0+XG5cdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUIyRUJcdUFFMzAnKS5vbkNsaWNrKCgpID0+IHRoaXMuY2xvc2UoKSksXG5cdFx0XHQpXG5cdFx0XHQuYWRkQnV0dG9uKChidG4pID0+XG5cdFx0XHRcdGJ0bi5zZXRCdXR0b25UZXh0KCdcdUI5QzFcdUQwNkMgXHVCQ0Y1XHVDMEFDJykuc2V0Q3RhKCkub25DbGljayhhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRhd2FpdCBjb3B5VG9DbGlwYm9hcmQodXJsKTtcblx0XHRcdFx0XHRidG4uc2V0QnV0dG9uVGV4dCgnXHVCQ0Y1XHVDMEFDXHVCNDI4Jyk7XG5cdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiBidG4uc2V0QnV0dG9uVGV4dCgnXHVCOUMxXHVEMDZDIFx1QkNGNVx1QzBBQycpLCAxNTAwKTtcblx0XHRcdFx0fSksXG5cdFx0XHQpO1xuXG5cdH1cblxuXHRwcml2YXRlIHJlZnJlc2hBY3RpdmVCdXR0b24ocm93OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdGNvbnN0IGJ1dHRvbnMgPSByb3cucXVlcnlTZWxlY3RvckFsbCgnLnNoYXJlLWV4cGlyeS1idG4nKTtcblx0XHRjb25zdCB2YWx1ZXMgPSBFWFBJUllfT1BUSU9OUy5tYXAobyA9PiBvLnZhbHVlKTtcblx0XHRidXR0b25zLmZvckVhY2goKGJ0biwgaSkgPT4ge1xuXHRcdFx0YnRuLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScsIHRoaXMuc2VsZWN0ZWQgPT09IHZhbHVlc1tpXSk7XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNsb3NlKCk6IHZvaWQge1xuXHRcdHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG5cdH1cbn1cbiIsICIvKipcbiAqIEZpbGVJZFRyYWNrZXIgLSBwYXRoIFx1MjE5NCBmaWxlSWQgXHVCOUU0XHVENTUxIFx1QUQwMFx1QjlBQ1xuICogQE1YOkFOQ0hPUjogW0FVVE9dIEZpbGVJZCBcdUI5RTRcdUQ1NTEgQ1JVRCBcdUJDMEYgXHVDOUMwXHVDMThEXHVDMTMxXG4gKiBATVg6UkVBU09OOiBSRVEtRk0tMjAxIHRvIFJFUS1GTS0yMDQgLSBcdUM1OTFcdUJDMjlcdUQ1QTUgZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUM3MjBcdUM5QzBcbiAqIFQtMDA1OiBcdUIyRTRcdUM5MTEgXHVCQ0ZDXHVEMkI4IFx1QzlDMFx1QzZEMCAtIFx1QkNGQ1x1RDJCOFx1QkNDNCBmaWxlSWQgXHVDMkE0XHVDRjU0XHVENTA0XG4gKi9cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgdHlwZSB7IFZTeW5jU2V0dGluZ3MgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHsgSW5kZXhlZERCU3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZS9pbmRleGVkLWRiJztcblxuZXhwb3J0IGNsYXNzIEZpbGVJZFRyYWNrZXIge1xuICAvLyBULTAwNTogXHVDOTExXHVDQ0E5IFx1QUQ2Q1x1Qzg3MFx1Qjg1QyBcdUJDQzBcdUFDQkQgLSBNYXA8dmF1bHRJZCwgTWFwPHBhdGgsIGZpbGVJZD4+XG4gIHByaXZhdGUgdmF1bHRUcmFja2VyczogTWFwPHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgZmlsZUlkVG9QYXRoOiBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBzdHJpbmc+PiA9IG5ldyBNYXAoKTsgLy8gTWFwPGZpbGVJZCwgTWFwPHZhdWx0SWQsIHBhdGg+PlxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcGx1Z2luOiBQbHVnaW4gJiB7IHNldHRpbmdzOiBWU3luY1NldHRpbmdzIH0sXG4gICAgcHJpdmF0ZSBzdG9yYWdlOiBJbmRleGVkREJTdG9yYWdlXG4gICkge31cblxuICAvKipcbiAgICogVC0wMDU6IFx1QkNGQ1x1RDJCOFx1QkNDNCBmaWxlSWQgXHVDMTI0XHVDODE1XG4gICAqL1xuICBzZXRGaWxlSWQodmF1bHRJZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGZpbGVJZDogc3RyaW5nKTogdm9pZDtcbiAgLyoqXG4gICAqIFQtMDA1OiBcdUI4MDhcdUFDNzBcdUMyREMgXHVENjM4XHVENjU4XHVDMTMxIC0gXHVBRTMwXHVCQ0Y4IFx1QkNGQ1x1RDJCOCBcdUMwQUNcdUM2QTlcbiAgICovXG4gIHNldEZpbGVJZChwYXRoOiBzdHJpbmcsIGZpbGVJZDogc3RyaW5nKTogdm9pZDtcbiAgc2V0RmlsZUlkKGFyZzE6IHN0cmluZywgYXJnMjogc3RyaW5nLCBhcmczPzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGFyZzMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gXHVDMEM4XHVCODVDXHVDNkI0IEFQSTogc2V0RmlsZUlkKHZhdWx0SWQsIHBhdGgsIGZpbGVJZClcbiAgICAgIGNvbnN0IFt2YXVsdElkLCBwYXRoLCBmaWxlSWRdID0gW2FyZzEsIGFyZzIsIGFyZzNdO1xuICAgICAgaWYgKCFmaWxlSWQpIHJldHVybjtcblxuICAgICAgaWYgKCF0aGlzLnZhdWx0VHJhY2tlcnMuaGFzKHZhdWx0SWQpKSB7XG4gICAgICAgIHRoaXMudmF1bHRUcmFja2Vycy5zZXQodmF1bHRJZCwgbmV3IE1hcCgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmF1bHRUcmFja2Vycy5nZXQodmF1bHRJZCkhLnNldChwYXRoLCBmaWxlSWQpO1xuXG4gICAgICBpZiAoIXRoaXMuZmlsZUlkVG9QYXRoLmhhcyhmaWxlSWQpKSB7XG4gICAgICAgIHRoaXMuZmlsZUlkVG9QYXRoLnNldChmaWxlSWQsIG5ldyBNYXAoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmZpbGVJZFRvUGF0aC5nZXQoZmlsZUlkKSEuc2V0KHZhdWx0SWQsIHBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdUI4MDhcdUFDNzBcdUMyREMgQVBJOiBzZXRGaWxlSWQocGF0aCwgZmlsZUlkKSAtIFx1QUUzMFx1QkNGOCBcdUJDRkNcdUQyQjggXHVDMEFDXHVDNkE5XG4gICAgICBjb25zdCBbcGF0aCwgZmlsZUlkXSA9IFthcmcxLCBhcmcyXTtcbiAgICAgIGlmICghZmlsZUlkKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGRlZmF1bHRWYXVsdElkID0gJ2RlZmF1bHQnO1xuICAgICAgaWYgKCF0aGlzLnZhdWx0VHJhY2tlcnMuaGFzKGRlZmF1bHRWYXVsdElkKSkge1xuICAgICAgICB0aGlzLnZhdWx0VHJhY2tlcnMuc2V0KGRlZmF1bHRWYXVsdElkLCBuZXcgTWFwKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy52YXVsdFRyYWNrZXJzLmdldChkZWZhdWx0VmF1bHRJZCkhLnNldChwYXRoLCBmaWxlSWQpO1xuXG4gICAgICBpZiAoIXRoaXMuZmlsZUlkVG9QYXRoLmhhcyhmaWxlSWQpKSB7XG4gICAgICAgIHRoaXMuZmlsZUlkVG9QYXRoLnNldChmaWxlSWQsIG5ldyBNYXAoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmZpbGVJZFRvUGF0aC5nZXQoZmlsZUlkKSEuc2V0KGRlZmF1bHRWYXVsdElkLCBwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVC0wMDU6IFx1QkNGQ1x1RDJCOFx1QkNDNCBmaWxlSWQgXHVDODcwXHVENjhDXG4gICAqL1xuICBnZXRGaWxlSWQodmF1bHRJZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBULTAwNTogXHVCODA4XHVBQzcwXHVDMkRDIFx1RDYzOFx1RDY1OFx1QzEzMSAtIFx1QUUzMFx1QkNGOCBcdUJDRkNcdUQyQjggXHVDODcwXHVENjhDXG4gICAqL1xuICBnZXRGaWxlSWQocGF0aDogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBnZXRGaWxlSWQoYXJnMTogc3RyaW5nLCBhcmcyPzogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoYXJnMiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBcdUMwQzhcdUI4NUNcdUM2QjQgQVBJOiBnZXRGaWxlSWQodmF1bHRJZCwgcGF0aClcbiAgICAgIGNvbnN0IFt2YXVsdElkLCBwYXRoXSA9IFthcmcxLCBhcmcyXTtcbiAgICAgIHJldHVybiB0aGlzLnZhdWx0VHJhY2tlcnMuZ2V0KHZhdWx0SWQpPy5nZXQocGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBBUEk6IGdldEZpbGVJZChwYXRoKSAtIFx1QUUzMFx1QkNGOCBcdUJDRkNcdUQyQjggXHVDODcwXHVENjhDXG4gICAgICBjb25zdCBwYXRoID0gYXJnMTtcbiAgICAgIHJldHVybiB0aGlzLnZhdWx0VHJhY2tlcnMuZ2V0KCdkZWZhdWx0Jyk/LmdldChwYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVC0wMDU6IFx1QkNGQ1x1RDJCOFx1QkNDNCBwYXRoIFx1Qzg3MFx1RDY4Q1xuICAgKi9cbiAgZ2V0UGF0aCh2YXVsdElkOiBzdHJpbmcsIGZpbGVJZDogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAvKipcbiAgICogVC0wMDU6IFx1QjgwOFx1QUM3MFx1QzJEQyBcdUQ2MzhcdUQ2NThcdUMxMzEgLSBcdUFFMzBcdUJDRjggXHVCQ0ZDXHVEMkI4IFx1Qzg3MFx1RDY4Q1xuICAgKi9cbiAgZ2V0UGF0aChmaWxlSWQ6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgZ2V0UGF0aChhcmcxOiBzdHJpbmcsIGFyZzI/OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGlmIChhcmcyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFx1QzBDOFx1Qjg1Q1x1QzZCNCBBUEk6IGdldFBhdGgodmF1bHRJZCwgZmlsZUlkKVxuICAgICAgY29uc3QgW3ZhdWx0SWQsIGZpbGVJZF0gPSBbYXJnMSwgYXJnMl07XG4gICAgICByZXR1cm4gdGhpcy5maWxlSWRUb1BhdGguZ2V0KGZpbGVJZCk/LmdldCh2YXVsdElkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXHVCODA4XHVBQzcwXHVDMkRDIEFQSTogZ2V0UGF0aChmaWxlSWQpIC0gXHVBRTMwXHVCQ0Y4IFx1QkNGQ1x1RDJCOCBcdUM4NzBcdUQ2OENcbiAgICAgIGNvbnN0IGZpbGVJZCA9IGFyZzE7XG4gICAgICByZXR1cm4gdGhpcy5maWxlSWRUb1BhdGguZ2V0KGZpbGVJZCk/LmdldCgnZGVmYXVsdCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBULTAwNTogXHVCQ0ZDXHVEMkI4XHVCQ0M0IGZpbGVJZCBcdUM4MUNcdUFDNzBcbiAgICovXG4gIHJlbW92ZUZpbGVJZCh2YXVsdElkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHZvaWQ7XG4gIC8qKlxuICAgKiBULTAwNTogXHVCODA4XHVBQzcwXHVDMkRDIFx1RDYzOFx1RDY1OFx1QzEzMSAtIFx1QUUzMFx1QkNGOCBcdUJDRkNcdUQyQjggXHVDODFDXHVBQzcwXG4gICAqL1xuICByZW1vdmVGaWxlSWQocGF0aDogc3RyaW5nKTogdm9pZDtcbiAgcmVtb3ZlRmlsZUlkKGFyZzE6IHN0cmluZywgYXJnMj86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChhcmcyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFx1QzBDOFx1Qjg1Q1x1QzZCNCBBUEk6IHJlbW92ZUZpbGVJZCh2YXVsdElkLCBwYXRoKVxuICAgICAgY29uc3QgW3ZhdWx0SWQsIHBhdGhdID0gW2FyZzEsIGFyZzJdO1xuICAgICAgY29uc3QgZmlsZUlkID0gdGhpcy52YXVsdFRyYWNrZXJzLmdldCh2YXVsdElkKT8uZ2V0KHBhdGgpO1xuICAgICAgaWYgKGZpbGVJZCkge1xuICAgICAgICB0aGlzLnZhdWx0VHJhY2tlcnMuZ2V0KHZhdWx0SWQpPy5kZWxldGUocGF0aCk7XG4gICAgICAgIHRoaXMuZmlsZUlkVG9QYXRoLmdldChmaWxlSWQpPy5kZWxldGUodmF1bHRJZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1QjgwOFx1QUM3MFx1QzJEQyBBUEk6IHJlbW92ZUZpbGVJZChwYXRoKSAtIFx1QUUzMFx1QkNGOCBcdUJDRkNcdUQyQjggXHVDODFDXHVBQzcwXG4gICAgICBjb25zdCBwYXRoID0gYXJnMTtcbiAgICAgIGNvbnN0IGZpbGVJZCA9IHRoaXMudmF1bHRUcmFja2Vycy5nZXQoJ2RlZmF1bHQnKT8uZ2V0KHBhdGgpO1xuICAgICAgaWYgKGZpbGVJZCkge1xuICAgICAgICB0aGlzLnZhdWx0VHJhY2tlcnMuZ2V0KCdkZWZhdWx0Jyk/LmRlbGV0ZShwYXRoKTtcbiAgICAgICAgdGhpcy5maWxlSWRUb1BhdGguZ2V0KGZpbGVJZCk/LmRlbGV0ZSgnZGVmYXVsdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUI5RTRcdUQ1NTEgXHVDODAwXHVDN0E1IChSRVEtRk0tMjAyKVxuICAgKiBJbmRleGVkREJcdUM1RDAgXHVCOUU0XHVENTUxIFx1QzgwMFx1QzdBNVxuICAgKi9cbiAgYXN5bmMgc2F2ZU1hcHBpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGZvciAoY29uc3QgW3ZhdWx0SWQsIHBhdGhNYXBdIG9mIHRoaXMudmF1bHRUcmFja2Vycy5lbnRyaWVzKCkpIHtcbiAgICAgIGZvciAoY29uc3QgW3BhdGgsIGZpbGVJZF0gb2YgcGF0aE1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0RmlsZU1ldGEodmF1bHRJZCwgcGF0aCk7XG4gICAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zZXRGaWxlTWV0YSh2YXVsdElkLCBwYXRoLCB7XG4gICAgICAgICAgZmlsZUlkLFxuICAgICAgICAgIGhhc2g6IGV4aXN0aW5nPy5oYXNoID8/ICcnLFxuICAgICAgICAgIG10aW1lOiBleGlzdGluZz8ubXRpbWUgPz8gMCxcbiAgICAgICAgICBsYXN0U3luY1RpbWU6IGV4aXN0aW5nPy5sYXN0U3luY1RpbWUgPz8gMCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGV4ZWREQlx1QzVEMFx1QzExQyB2YXVsdFx1QkNDNCBcdUI5RTRcdUQ1NTEgXHVCODVDXHVCNERDXG4gICAqL1xuICBhc3luYyBsb2FkTWFwcGluZ3NGcm9tSW5kZXhlZERCKHZhdWx0SWRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMudmF1bHRUcmFja2Vycy5jbGVhcigpO1xuICAgIHRoaXMuZmlsZUlkVG9QYXRoLmNsZWFyKCk7XG5cbiAgICBmb3IgKGNvbnN0IHZhdWx0SWQgb2YgdmF1bHRJZHMpIHtcbiAgICAgIGNvbnN0IG1hcHBpbmdzID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldEFsbEZpbGVNYXBwaW5nc0J5VmF1bHQodmF1bHRJZCk7XG4gICAgICBmb3IgKGNvbnN0IHsgcGF0aCwgZmlsZUlkIH0gb2YgbWFwcGluZ3MpIHtcbiAgICAgICAgdGhpcy5zZXRGaWxlSWQodmF1bHRJZCwgcGF0aCwgZmlsZUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHVDMkE0XHVEMTRDXHVDNzdDIFx1QjlFNFx1RDU1MSBcdUM4MUNcdUFDNzAgKFJFUS1GTS0yMDQpXG4gICAqIFQtMDA1OiBcdUJDRkNcdUQyQjhcdUJDQzQgXHVBQzgwXHVDOTlEIFx1QzlDMFx1QzZEMFxuICAgKi9cbiAgYXN5bmMgdmFsaWRhdGVNYXBwaW5ncyh2YXVsdElkPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdmF1bHRzVG9WYWxpZGF0ZSA9IHZhdWx0SWRcbiAgICAgID8gW3ZhdWx0SWRdXG4gICAgICA6IEFycmF5LmZyb20odGhpcy52YXVsdFRyYWNrZXJzLmtleXMoKSk7XG5cbiAgICBmb3IgKGNvbnN0IHZJZCBvZiB2YXVsdHNUb1ZhbGlkYXRlKSB7XG4gICAgICBjb25zdCBzdGFsZVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgY29uc3QgcGF0aE1hcCA9IHRoaXMudmF1bHRUcmFja2Vycy5nZXQodklkKTtcblxuICAgICAgaWYgKCFwYXRoTWFwKSBjb250aW51ZTtcblxuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhNYXAua2V5cygpKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoKTtcbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICBzdGFsZVBhdGhzLnB1c2gocGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHN0YWxlUGF0aHMpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVGaWxlSWQodklkLCBwYXRoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YWxlUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVNYXBwaW5ncygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogUmVzb2x1dGlvblF1ZXVlIC0gZmlsZUlkIFx1QjIwNFx1Qjc3RCBcdUQ1NzRcdUFDQjAgXHVEMDUwXG4gKiBATVg6Tk9URTogW0FVVE9dIExSVSBldmljdGlvblx1QzczQ1x1Qjg1QyBcdUIyMDRcdUI3N0QgZmlsZUlkIFx1Q0Q5NFx1QzgwMVxuICogQE1YOlJFQVNPTjogUkVRLUJGLTUwMyAtIGZpbGVJZCBcdUIyMDRcdUI3N0QgXHVDMkRDIFx1QUNCRFx1QUNFMCBcdUI4NUNcdUFERjggXHVCQzBGIHBhdGggcmVzb2x1dGlvbiBcdUQwNTBcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFN5bmNTZXJ2aWNlIH0gZnJvbSAnLi9zeW5jLXNlcnZpY2UnO1xuXG5leHBvcnQgY2xhc3MgUmVzb2x1dGlvblF1ZXVlIHtcbiAgcHJpdmF0ZSBxdWV1ZTogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWF4U2l6ZSA9IDEwMDtcblxuICBhZGQocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucXVldWUuc2l6ZSA+PSB0aGlzLm1heFNpemUpIHtcbiAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5xdWV1ZS52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gICAgICBpZiAoZmlyc3QpIHRoaXMucXVldWUuZGVsZXRlKGZpcnN0KTtcbiAgICB9XG4gICAgdGhpcy5xdWV1ZS5hZGQocGF0aCk7XG4gIH1cblxuICByZW1vdmUocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5xdWV1ZS5kZWxldGUocGF0aCk7XG4gIH1cblxuICBoYXMocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucXVldWUuaGFzKHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1RDA1MCBcdUNDOThcdUI5QUMgKFJFUS1SUS0zMDEsIFJFUS1SUS0zMDIpXG4gICAqL1xuICBhc3luYyBwcm9jZXNzUXVldWUoc3luY1NlcnZpY2U6IFN5bmNTZXJ2aWNlLCBnZXRGaWxlSWQ6IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGhzVG9Qcm9jZXNzID0gQXJyYXkuZnJvbSh0aGlzLnF1ZXVlKTtcbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHNUb1Byb2Nlc3MpIHtcbiAgICAgIGNvbnN0IGZpbGVJZCA9IGdldEZpbGVJZChwYXRoKTtcbiAgICAgIGlmIChmaWxlSWQpIHtcbiAgICAgICAgYXdhaXQgc3luY1NlcnZpY2Uuc2VuZEZpbGVVcGRhdGUoZmlsZUlkLCBwYXRoLCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzeW5jU2VydmljZS5zZW5kRmlsZUNyZWF0ZShwYXRoLCAnJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlbW92ZShwYXRoKTtcbiAgICB9XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnF1ZXVlLmNsZWFyKCk7XG4gIH1cblxuICBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucXVldWUuc2l6ZTtcbiAgfVxufVxuIiwgIi8qKlxuICogT2ZmbGluZSBxdWV1ZSBmb3Igc3RvcmluZyBzeW5jIGV2ZW50cyB3aGVuIGNvbm5lY3Rpb24gaXMgdW5hdmFpbGFibGVcbiAqIEBNWDpOT1RFOiBbQVVUT10gRklGTyBxdWV1ZSB3aXRoIDctZGF5IFRUTCBhbmQgbWF4IDEwMDAgaXRlbXNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFF1ZXVlSXRlbSwgV1NNZXNzYWdlVHlwZSB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgeyBJbmRleGVkREJTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlL2luZGV4ZWQtZGInO1xuXG5jb25zdCBNQVhfUVVFVUVfU0laRSA9IDEwMDA7XG5cbi8qKlxuICogT2ZmbGluZSBxdWV1ZSBmb3Igc3RvcmluZyBzeW5jIGV2ZW50cyB3aGVuIG9mZmxpbmVcbiAqIEF1dG9tYXRpY2FsbHkgcmVtb3ZlcyBleHBpcmVkIGl0ZW1zICg3LWRheSBUVEwpIGFuZCBlbmZvcmNlcyBtYXggc2l6ZVxuICovXG5leHBvcnQgY2xhc3MgT2ZmbGluZVF1ZXVlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzdG9yYWdlOiBJbmRleGVkREJTdG9yYWdlKSB7fVxuXG4gIC8qKlxuICAgKiBBZGQgaXRlbSB0byBxdWV1ZVxuICAgKiBSZW1vdmVzIG9sZGVzdCBpdGVtIGlmIHF1ZXVlIGlzIGZ1bGxcbiAgICogUmVwbGFjZXMgZHVwbGljYXRlIGl0ZW1zIHdpdGggc2FtZSB0eXBlIGFuZCBmaWxlIGlkZW50aWZpZXJcbiAgICovXG4gIGFzeW5jIGFkZCh0eXBlOiBXU01lc3NhZ2VUeXBlLCBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZXhpc3RpbmdJdGVtcyA9IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRTeW5jUXVldWVJdGVtcygpO1xuICAgIGNvbnN0IGR1cGxpY2F0ZSA9IGV4aXN0aW5nSXRlbXMuZmluZCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKGl0ZW0udHlwZSAhPT0gdHlwZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmlsZTpjcmVhdGUnOlxuICAgICAgICBjYXNlICdmaWxlOnVwZGF0ZSc6XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ucGF5bG9hZC5wYXRoID09PSBwYXlsb2FkLnBhdGg7XG4gICAgICAgIGNhc2UgJ2ZpbGU6ZGVsZXRlJzpcbiAgICAgICAgY2FzZSAnZmlsZTpyZW5hbWUnOlxuICAgICAgICAgIHJldHVybiBpdGVtLnBheWxvYWQuZmlsZUlkID09PSBwYXlsb2FkLmZpbGVJZDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZHVwbGljYXRlICYmIGR1cGxpY2F0ZS5pZCkge1xuICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZVN5bmNRdWV1ZUl0ZW0oZHVwbGljYXRlLmlkKTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50U2l6ZSA9IGF3YWl0IHRoaXMuc3RvcmFnZS5jb3VudFN5bmNRdWV1ZUl0ZW1zKCk7XG5cbiAgICBpZiAoY3VycmVudFNpemUgPj0gTUFYX1FVRVVFX1NJWkUgJiYgIWR1cGxpY2F0ZSkge1xuICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlLmRlbGV0ZU9sZGVzdFN5bmNRdWV1ZUl0ZW0oKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnN0b3JhZ2UuYWRkU3luY1F1ZXVlSXRlbSh7XG4gICAgICB0eXBlLFxuICAgICAgcGF5bG9hZCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGl0ZW1zLCBmaWx0ZXJpbmcgb3V0IGV4cGlyZWQgaXRlbXNcbiAgICovXG4gIGFzeW5jIGdldEFsbCgpOiBQcm9taXNlPFF1ZXVlSXRlbVtdPiB7XG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0U3luY1F1ZXVlSXRlbXMoKTtcbiAgICByZXR1cm4gaXRlbXMubWFwKChpdGVtKSA9PiAoe1xuICAgICAgLi4uaXRlbSxcbiAgICAgIGlkOiBpdGVtLmlkID8gaXRlbS5pZC50b1N0cmluZygpIDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgIHR5cGU6IGl0ZW0udHlwZSBhcyBXU01lc3NhZ2VUeXBlLFxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBhbGwgaXRlbXMgZnJvbSBxdWV1ZVxuICAgKi9cbiAgYXN5bmMgY2xlYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5zdG9yYWdlLmNsZWFyU3luY1F1ZXVlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgcXVldWUgc2l6ZVxuICAgKi9cbiAgYXN5bmMgc2l6ZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0b3JhZ2UuY291bnRTeW5jUXVldWVJdGVtcygpO1xuICB9XG59XG4iLCAiLyoqXG4gKiBSRVNUIEFQSSBjbGllbnQgZm9yIFZlY3RvciBzZXJ2ZXJcbiAqIEBNWDpOT1RFOiBbQVVUT10gc3luYy1zZXJ2aWNlXHVDNUQwXHVDMTFDIFJFU1QgXHVENjM4XHVDRDlDXHVDNzQ0IFx1QkQ4NFx1QjlBQ1x1RDU1QyBIVFRQIFx1RDA3NFx1Qjc3Q1x1Qzc3NFx1QzVCOFx1RDJCOFxuICovXG5cbmNvbnN0IEJJTkFSWV9NSU1FX01BUDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgJy5wbmcnOiAnaW1hZ2UvcG5nJyxcbiAgJy5qcGcnOiAnaW1hZ2UvanBlZycsXG4gICcuanBlZyc6ICdpbWFnZS9qcGVnJyxcbiAgJy5naWYnOiAnaW1hZ2UvZ2lmJyxcbiAgJy5zdmcnOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICcud2VicCc6ICdpbWFnZS93ZWJwJyxcbiAgJy5wZGYnOiAnYXBwbGljYXRpb24vcGRmJyxcbiAgJy5tcDMnOiAnYXVkaW8vbXBlZycsXG4gICcubXA0JzogJ3ZpZGVvL21wNCcsXG4gICcud2F2JzogJ2F1ZGlvL3dhdicsXG4gICcub2dnJzogJ2F1ZGlvL29nZycsXG59O1xuXG5leHBvcnQgY2xhc3MgUmVzdENsaWVudCB7XG4gIHJlYWRvbmx5IGJhc2VVcmw6IHN0cmluZztcbiAgcmVhZG9ubHkgdmF1bHRJZDogc3RyaW5nO1xuICByZWFkb25seSBhdXRoSGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihzZXJ2ZXJVcmw6IHN0cmluZywgdmF1bHRJZDogc3RyaW5nLCBhcGlLZXk6IHN0cmluZykge1xuICAgIHRoaXMuYmFzZVVybCA9IHNlcnZlclVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgIHRoaXMudmF1bHRJZCA9IHZhdWx0SWQ7XG4gICAgdGhpcy5hdXRoSGVhZGVycyA9IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YXBpS2V5fWAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZW5jb2RlUGF0aChmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZmlsZVBhdGguc3RhcnRzV2l0aCgnLycpID8gZmlsZVBhdGguc2xpY2UoMSkgOiBmaWxlUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUJDMTRcdUM3NzRcdUIxMDhcdUI5QUMgXHVEMzBDXHVDNzdDIFx1QzVDNVx1Qjg1Q1x1QjREQyAoUkVRLUFUVEFDSC0wMDIpXG4gICAqIEByZXR1cm5zIFx1QzExQ1x1QkM4NCBcdUM3NTFcdUIyRjUgSlNPTiBcdUI2MTBcdUIyOTQgbnVsbFxuICAgKi9cbiAgYXN5bmMgdXBsb2FkQmluYXJ5KGZpbGVQYXRoOiBzdHJpbmcsIGRhdGE6IEFycmF5QnVmZmVyKTogUHJvbWlzZTx7IGlkPzogc3RyaW5nIH0gfCBudWxsPiB7XG4gICAgY29uc3QgZW5jb2RlZFBhdGggPSB0aGlzLmVuY29kZVBhdGgoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGV4dCA9ICcuJyArIGZpbGVQYXRoLnNwbGl0KCcuJykucG9wKCk/LnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgY29udGVudFR5cGUgPSBCSU5BUllfTUlNRV9NQVBbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgICBgJHt0aGlzLmJhc2VVcmx9L3YxLyR7dGhpcy52YXVsdElkfS9hdHRhY2htZW50cy8ke2VuY29kZWRQYXRofWAsXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIGhlYWRlcnM6IHsgLi4udGhpcy5hdXRoSGVhZGVycywgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGRhdGEsXG4gICAgICB9LFxuICAgICk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCkuY2F0Y2goKCkgPT4gJycpO1xuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAwICYmIGVycm9yVGV4dC5pbmNsdWRlcygnYWxyZWFkeSBleGlzdHMnKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihgQmluYXJ5IHVwbG9hZCBmYWlsZWQ6IEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9IC0gJHtlcnJvclRleHR9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKSBhcyBQcm9taXNlPHsgaWQ/OiBzdHJpbmcgfT47XG4gIH1cblxuICAvKipcbiAgICogXHVCQzE0XHVDNzc0XHVCMTA4XHVCOUFDIFx1RDMwQ1x1Qzc3QyBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMgKFJFUS1BVFRBQ0gtMDA1KVxuICAgKi9cbiAgYXN5bmMgZG93bmxvYWRCaW5hcnkoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICBjb25zdCBlbmNvZGVkUGF0aCA9IHRoaXMuZW5jb2RlUGF0aChmaWxlUGF0aCk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgICAgYCR7dGhpcy5iYXNlVXJsfS92MS8ke3RoaXMudmF1bHRJZH0vYXR0YWNobWVudHMvJHtlbmNvZGVkUGF0aH1gLFxuICAgICAgeyBoZWFkZXJzOiB0aGlzLmF1dGhIZWFkZXJzIH0sXG4gICAgKTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQmluYXJ5IGRvd25sb2FkIGZhaWxlZDogSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQxNERcdUMyQTRcdUQyQjggXHVEMzBDXHVDNzdDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyAoUkVRLUZTLTEwMilcbiAgICovXG4gIGFzeW5jIGRvd25sb2FkRmlsZShmaWxlSWQ6IHN0cmluZyk6IFByb21pc2U8eyBjb250ZW50Pzogc3RyaW5nIH0+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgICAgYCR7dGhpcy5iYXNlVXJsfS92MS8ke3RoaXMudmF1bHRJZH0vZmlsZXMvJHtmaWxlSWR9P2luY2x1ZGVfY29udGVudD10cnVlYCxcbiAgICAgIHsgaGVhZGVyczogdGhpcy5hdXRoSGVhZGVycyB9LFxuICAgICk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpbGUgZG93bmxvYWQgZmFpbGVkOiBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZS5qc29uKCkgYXMgUHJvbWlzZTx7IGNvbnRlbnQ/OiBzdHJpbmcgfT47XG4gIH1cblxuICAvKipcbiAgICogXHVDREE5XHVCM0NDIFx1QkFBOVx1Qjg1RCBcdUM4NzBcdUQ2OENcbiAgICovXG4gIGFzeW5jIGZldGNoQ29uZmxpY3RzKCk6IFByb21pc2U8QXJyYXk8eyBjb25mbGljdElkOiBzdHJpbmc7IHBhdGg6IHN0cmluZyB9Pj4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgICBgJHt0aGlzLmJhc2VVcmx9L3YxLyR7dGhpcy52YXVsdElkfS9jb25mbGljdHNgLFxuICAgICAgeyBoZWFkZXJzOiB0aGlzLmF1dGhIZWFkZXJzIH0sXG4gICAgKTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmV0Y2ggY29uZmxpY3RzIGZhaWxlZDogSFRUUCAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpIGFzIHsgY29uZmxpY3RzOiBBcnJheTx7IGNvbmZsaWN0SWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nIH0+IH07XG4gICAgcmV0dXJuIGRhdGEuY29uZmxpY3RzO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1Q0RBOVx1QjNDQyBcdUMwQzFcdUMxMzggXHVDODcwXHVENjhDXG4gICAqL1xuICBhc3luYyBmZXRjaENvbmZsaWN0RGV0YWlsKGNvbmZsaWN0SWQ6IHN0cmluZyk6IFByb21pc2U8eyBjbGllbnRDb250ZW50OiBzdHJpbmc7IHNlcnZlckNvbnRlbnQ6IHN0cmluZyB9PiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcbiAgICAgIGAke3RoaXMuYmFzZVVybH0vdjEvJHt0aGlzLnZhdWx0SWR9L2NvbmZsaWN0cy8ke2NvbmZsaWN0SWR9YCxcbiAgICAgIHsgaGVhZGVyczogdGhpcy5hdXRoSGVhZGVycyB9LFxuICAgICk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZldGNoIGNvbmZsaWN0IGRldGFpbCBmYWlsZWQ6IEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKSBhcyBQcm9taXNlPHsgY2xpZW50Q29udGVudDogc3RyaW5nOyBzZXJ2ZXJDb250ZW50OiBzdHJpbmcgfT47XG4gIH1cblxuICAvKipcbiAgICogXHVBQ0Y1XHVDNzIwIFx1QzBERFx1QzEzMVxuICAgKi9cbiAgYXN5bmMgY3JlYXRlU2hhcmUoYm9keTogeyBmaWxlSWQ6IHN0cmluZzsgZXhwaXJlc0luOiBzdHJpbmc7IHB1YmxpY1VybDogc3RyaW5nIH0pOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGZldGNoKFxuICAgICAgYCR7dGhpcy5iYXNlVXJsfS92MS8ke3RoaXMudmF1bHRJZH0vc2hhcmVzYCxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHsgLi4udGhpcy5hdXRoSGVhZGVycywgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUFDRjVcdUM3MjAgXHVDMEFEXHVDODFDXG4gICAqL1xuICBhc3luYyBkZWxldGVTaGFyZShzaGFyZUlkOiBzdHJpbmcpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGZldGNoKFxuICAgICAgYCR7dGhpcy5iYXNlVXJsfS92MS8ke3RoaXMudmF1bHRJZH0vc2hhcmVzLyR7c2hhcmVJZH1gLFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBoZWFkZXJzOiB0aGlzLmF1dGhIZWFkZXJzLFxuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QUNGNVx1QzcyMCBcdUJBQTlcdUI4NUQgXHVDODcwXHVENjhDXG4gICAqL1xuICBhc3luYyBmZXRjaFNoYXJlcygpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGZldGNoKFxuICAgICAgYCR7dGhpcy5iYXNlVXJsfS92MS8ke3RoaXMudmF1bHRJZH0vc2hhcmVzYCxcbiAgICAgIHsgaGVhZGVyczogdGhpcy5hdXRoSGVhZGVycyB9LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogXHVDNzc4XHVDOTlEIFx1RDY1NVx1Qzc3OFxuICAgKi9cbiAgYXN5bmMgdmVyaWZ5QXV0aCh2YXVsdElkOiBzdHJpbmcsIGFwaUtleTogc3RyaW5nKTogUHJvbWlzZTx7IHZhbGlkOiBib29sZWFuIH0+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgICAgYCR7dGhpcy5iYXNlVXJsfS92MS92YXVsdC92ZXJpZnlgLFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgdmF1bHRJZCwgYXBpS2V5IH0pLFxuICAgICAgfSxcbiAgICApO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgZXJyb3JEYXRhOiBhbnkgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHsgZXJyb3I6ICdVbmtub3duIGVycm9yJyB9KSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JEYXRhLmVycm9yIHx8IGBIVFRQICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZS5qc29uKCkgYXMgUHJvbWlzZTx7IHZhbGlkOiBib29sZWFuIH0+O1xuICB9XG59XG4iLCAiLyoqXG4gKiBXZWJTb2NrZXQgc3luYyBzZXJ2aWNlIGZvciBWZWN0b3IgT2JzaWRpYW4gcGx1Z2luXG4gKiBATVg6QU5DSE9SOiBbQVVUT10gQ29yZSBzeW5jIGxvZ2ljIC0gaGFuZGxlcyBXZWJTb2NrZXQgY29tbXVuaWNhdGlvbiwgb2ZmbGluZSBxdWV1ZSwgc3RhdGUgbWFuYWdlbWVudFxuICogQE1YOlJFQVNPTjogUkVRLVBMLTEwMSB0byBSRVEtUEwtMTA5IC0gQ29yZSBzeW5jIHNlcnZpY2Ugd2l0aCBvZmZsaW5lIHF1ZXVlLCBzdGF0ZSBtYW5hZ2VtZW50LCBwYXVzZS9yZXN1bWVcbiAqL1xuXG5pbXBvcnQgeyBPZmZsaW5lUXVldWUgfSBmcm9tICcuL29mZmxpbmUtcXVldWUnO1xuaW1wb3J0IHsgUmVzdENsaWVudCB9IGZyb20gJy4vcmVzdC1jbGllbnQnO1xuaW1wb3J0IHR5cGUgeyBTeW5jU3RhdGUsIFdTTWVzc2FnZVR5cGUsIFNlcnZlck1lc3NhZ2UsIENvbmZsaWN0SW5mbyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgeyBTeW5jUmVjb25uZWN0UmVzcG9uc2VNZXNzYWdlIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBMb2NhbEZpbGVBY3Rpb24sIHR5cGUgTG9jYWxGaWxlQXBwcm92YWwgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGlzQmluYXJ5RmlsZSB9IGZyb20gJy4vZmlsZS10eXBlcyc7XG5pbXBvcnQgeyBoYXNoQ29udGVudCB9IGZyb20gJy4vaGFzaC11dGlscyc7XG5pbXBvcnQgdHlwZSB7IEluZGV4ZWREQlN0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UvaW5kZXhlZC1kYic7XG5cblxuLyoqXG4gKiBcdUQzMENcdUM3N0MgSUQgXHVCOUU0XHVENTUxIFx1Q0Y1Q1x1QkMzMVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hcHBpbmdDYWxsYmFja3Mge1xuICBvbkZpbGVJZFVwZGF0ZTogKHBhdGg6IHN0cmluZywgZmlsZUlkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uRmlsZUlkUmVtb3ZlOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkO1xuICBnZXRQYXRoQnlGaWxlSWQ6IChmaWxlSWQ6IHN0cmluZykgPT4gc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBnZXRGaWxlSWRCeVBhdGg6IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgcXVldWVSZXNvbHV0aW9uPzogKGZpbGVJZDogc3RyaW5nLCBwYXRoPzogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIFx1RDMwQ1x1Qzc3QyBDUlVEIFx1Q0Y1Q1x1QkMzMVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVDYWxsYmFja3Mge1xuICBvbkZpbGVDcmVhdGU6IChwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgb25GaWxlVXBkYXRlOiAocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG4gIG9uRmlsZURlbGV0ZTogKHBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgb25GaWxlUmVuYW1lOiAob2xkUGF0aDogc3RyaW5nLCBuZXdQYXRoOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG4gIHJlYWRGaWxlQXN5bmM/OiAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz47XG4gIHJlYWRGaWxlPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nO1xuICBwYXRoRXhpc3RzPzogKHBhdGg6IHN0cmluZykgPT4gYm9vbGVhbjtcbiAgaGFzVW5zYXZlZENoYW5nZXM/OiAocGF0aDogc3RyaW5nKSA9PiBib29sZWFuO1xuICBlbnN1cmVGb2xkZXJFeGlzdHM/OiAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xufVxuXG4vKipcbiAqIFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0MgXHVDRjVDXHVCQzMxIChSRVEtQVRUQUNILTAwMiwgUkVRLUFUVEFDSC0wMDUpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmluYXJ5Q2FsbGJhY2tzIHtcbiAgcmVhZEJpbmFyeUZpbGVBc3luYz86IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICBvbkJpbmFyeUZpbGVDcmVhdGU/OiAocGF0aDogc3RyaW5nLCBkYXRhOiBBcnJheUJ1ZmZlcikgPT4gUHJvbWlzZTx2b2lkPjtcbiAgb25CaW5hcnlGaWxlVXBkYXRlPzogKHBhdGg6IHN0cmluZywgZGF0YTogQXJyYXlCdWZmZXIpID0+IFByb21pc2U8dm9pZD47XG59XG5cbi8qKlxuICogXHVCM0Q5XHVBRTMwXHVENjU0IFVJL1x1QzU0Q1x1QjlCQyBcdUNGNUNcdUJDMzFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTeW5jVUlDYWxsYmFja3Mge1xuICBvbkNvbmZsaWN0OiAoY29uZmxpY3RJbmZvOiBhbnkpID0+IHZvaWQ7XG4gIG9uTm90aWNlOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkVycm9yPzogKGVycm9yOiB7IGNhdGVnb3J5OiBzdHJpbmc7IGNvZGU6IHN0cmluZzsgbWVzc2FnZTogc3RyaW5nIH0pID0+IHZvaWQ7XG4gIHNob3dTdGF0dXNCYXI/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuICBjbGVhclN0YXR1c0Jhcj86ICgpID0+IHZvaWQ7XG4gIHRyaWdnZXJSZWNvbm5lY3Q/OiAoKSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUNGNUNcdUJDMzFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWNvbm5lY3RDYWxsYmFja3Mge1xuICBvblJlY29ubmVjdFJlc3BvbnNlPzogKHNlcnZlckZpbGVzOiBBcnJheTx7IGZpbGVJZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGN1cnJlbnRIYXNoOiBzdHJpbmcgfT4pID0+IHZvaWQ7XG4gIGNvbGxlY3RMb2NhbEZpbGVzPzogKCkgPT4gUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgaGFzaDogc3RyaW5nIH0+PjtcbiAgcmVzb2x2ZUNvbmZsaWN0cz86IChjb25mbGljdHM6IENvbmZsaWN0SW5mb1tdKSA9PiBQcm9taXNlPENvbmZsaWN0SW5mb1tdPjtcbiAgYXBwcm92ZUxvY2FsVXBsb2Fkcz86IChmaWxlczogTG9jYWxGaWxlQXBwcm92YWxbXSkgPT4gUHJvbWlzZTxNYXA8c3RyaW5nLCBMb2NhbEZpbGVBY3Rpb24+PjtcbiAgdHJhc2hGaWxlPzogKHBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbiAgZ2V0RmlsZVN0YXQ/OiAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHsgc2l6ZTogbnVtYmVyOyBtdGltZTogbnVtYmVyIH0+O1xufVxuXG4vKipcbiAqIFN5bmNDYWxsYmFja3MgLSBcdUJBQThcdUI0RTAgXHVDRjVDXHVCQzMxIFx1Qzc3OFx1RDEzMFx1RDM5OFx1Qzc3NFx1QzJBNFx1Qzc1OCBcdUQ1NjlcdUMxMzFcbiAqIEBNWDpOT1RFOiBbQVVUT10gT2JzaWRpYW4gQVBJIFx1Qzc1OFx1Qzg3NFx1QzEzMSBcdUM4MUNcdUFDNzBcdUI5N0MgXHVDNzA0XHVENTVDIFx1Q0Y1Q1x1QkMzMSBcdUQzMjhcdUQxMzRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTeW5jQ2FsbGJhY2tzIGV4dGVuZHMgTWFwcGluZ0NhbGxiYWNrcywgRmlsZUNhbGxiYWNrcywgQmluYXJ5Q2FsbGJhY2tzLCBTeW5jVUlDYWxsYmFja3MsIFJlY29ubmVjdENhbGxiYWNrcyB7fVxuXG4vKipcbiAqIFdlYlNvY2tldCBzeW5jIHNlcnZpY2VcbiAqIE1hbmFnZXMgV2ViU29ja2V0IGNvbm5lY3Rpb24sIG9mZmxpbmUgcXVldWUsIGFuZCBzeW5jIHN0YXRlXG4gKiBATVg6QU5DSE9SOiBbQVVUT10gQ29yZSBzeW5jIGxvZ2ljIC0gaGFuZGxlcyBXZWJTb2NrZXQgY29tbXVuaWNhdGlvbiwgb2ZmbGluZSBxdWV1ZSwgc3RhdGUgbWFuYWdlbWVudFxuICogQE1YOlJFQVNPTjogUkVRLVBMLTEwMSB0byBSRVEtUEwtMTA5IC0gQ29yZSBzeW5jIHNlcnZpY2Ugd2l0aCBvZmZsaW5lIHF1ZXVlLCBzdGF0ZSBtYW5hZ2VtZW50LCBwYXVzZS9yZXN1bWVcbiAqL1xuZXhwb3J0IGNsYXNzIFN5bmNTZXJ2aWNlIHtcbiAgcHJpdmF0ZSB3czogV2ViU29ja2V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcXVldWU6IE9mZmxpbmVRdWV1ZTtcbiAgcHJpdmF0ZSBfc3RhdGU6IFN5bmNTdGF0ZSA9ICdvZmZsaW5lJztcbiAgcHJpdmF0ZSBzdGF0ZUxpc3RlbmVyczogKChzdGF0ZTogU3luY1N0YXRlKSA9PiB2b2lkKVtdID0gW107XG4gIHByaXZhdGUgbWVzc2FnZUxpc3RlbmVyczogKChtZXNzYWdlOiBhbnkpID0+IHZvaWQpW10gPSBbXTtcblxuICAvLyBcdUMxMUNcdUJDODRcdUM1RDBcdUMxMUMgXHVCQzFCXHVDNTQ0IFx1Qjg1Q1x1Q0VFQ1x1QzVEMCBcdUMwRERcdUMxMzEgXHVDOTExXHVDNzc4IFx1QUNCRFx1Qjg1QyAoXHVDNUQwXHVDRjU0IFx1QkMyOVx1QzlDMClcbiAgcHJpdmF0ZSBzeW5jQ3JlYXRlZFBhdGhzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcblxuICAvLyBcdUMxMUNcdUJDODRcdUM1RDBcdUMxMUMgXHVCQzFCXHVDNTQ0IFx1Qjg1Q1x1Q0VFQ1x1QzVEMCBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggXHVDOTExXHVDNzc4IFx1QUNCRFx1Qjg1QyAoXHVDNUQwXHVDRjU0IFx1QkMyOVx1QzlDMClcbiAgcHJpdmF0ZSBzeW5jVXBkYXRlZFBhdGhzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcblxuICAvLyBSZWNvbm5lY3Rpb24gd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gIHByaXZhdGUgcmVjb25uZWN0VGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVjb25uZWN0QXR0ZW1wdCA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWF4UmVjb25uZWN0QXR0ZW1wdHMgPSAxMDtcbiAgcHJpdmF0ZSByZWFkb25seSByZWNvbm5lY3RJbml0aWFsRGVsYXkgPSAxMDAwOyAvLyAxIHNlY29uZFxuICBwcml2YXRlIHJlYWRvbmx5IHJlY29ubmVjdE1heERlbGF5ID0gMzAwMDA7IC8vIDMwIHNlY29uZHNcbiAgcHJpdmF0ZSByZWFkb25seSByZWNvbm5lY3RNdWx0aXBsaWVyID0gMjtcbiAgcHJpdmF0ZSBleHBsaWNpdGx5RGlzY29ubmVjdGVkID0gZmFsc2U7XG5cbiAgLy8gUGhhc2UgMzogU2VydmVyIG1lc3NhZ2UgaGFuZGxpbmdcbiAgcHJpdmF0ZSBjYWxsYmFja3M6IFN5bmNDYWxsYmFja3MgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBwZW5kaW5nTWVzc2FnZXM6IE1hcDxzdHJpbmcsIHsgdHlwZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IHRpbWVzdGFtcDogbnVtYmVyIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHBlbmRpbmdSZW5hbWVzOiBNYXA8c3RyaW5nLCB7IG9sZFNlcnZlclBhdGg6IHN0cmluZzsgbmV3U2VydmVyUGF0aDogc3RyaW5nOyBvbGRMb2NhbFBhdGg6IHN0cmluZzsgbmV3TG9jYWxQYXRoOiBzdHJpbmc7IHRpbWVzdGFtcDogbnVtYmVyIH0+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHJlY2VudGx5QWNrbm93bGVkZ2VkOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHJlYWRvbmx5IEFDS19FWFBJUllfTVMgPSAxMDAwMDsgLy8gMTAgc2Vjb25kc1xuICBwcml2YXRlIHJlYWRvbmx5IFBFTkRJTkdfUkVOQU1FX0VYUElSWV9NUyA9IDMwMDAwMDsgLy8gNSBtaW51dGVzIC0gSXNzdWUgMVxuXG4gIC8qKlxuICAgKiBcdUJEODBcdUJBQTggXHVEM0Y0XHVCMzU0XHVBQzAwIFx1Qzg3NFx1QzdBQ1x1RDU1OFx1QjI5NFx1QzlDMCBcdUQ2NTVcdUM3NzhcdUQ1NThcdUFDRTAgXHVDNUM2XHVDNzNDXHVCQTc0IFx1QzBERFx1QzEzMVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVQYXJlbnRGb2xkZXIocGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcz8uZW5zdXJlRm9sZGVyRXhpc3RzKSByZXR1cm47XG4gICAgY29uc3QgbGFzdFNsYXNoID0gcGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgIGlmIChsYXN0U2xhc2ggPiAwKSB7XG4gICAgICBhd2FpdCB0aGlzLmNhbGxiYWNrcy5lbnN1cmVGb2xkZXJFeGlzdHMocGF0aC5zdWJzdHJpbmcoMCwgbGFzdFNsYXNoKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QUNCRFx1Qjg1QyBcdUMyMUNcdUQ2OEMgXHVBQ0Y1XHVBQ0E5IFx1QkMyOVx1QzlDMCAoUGF0aCBUcmF2ZXJzYWwgUHJldmVudGlvbilcbiAgICogVVJMIFx1Qzc3OFx1Q0Y1NFx1QjUyOVx1QjQxQyBcdUM2QjBcdUQ2OEMgXHVDMkRDXHVCM0M0XHVDNjQwIC4uIFx1QzEzOFx1QURGOFx1QkEzQ1x1RDJCOFx1Qjk3QyBcdUJBQThcdUI0NTAgXHVDQzI4XHVCMkU4XG4gICAqL1xuICBwcml2YXRlIGlzVmFsaWRWYXVsdFBhdGgocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFwYXRoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgZGVjb2RlZCA9IHBhdGg7XG4gICAgdHJ5IHtcbiAgICAgIGRlY29kZWQgPSBkZWNvZGVVUklDb21wb25lbnQocGF0aCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gXHVBQ0JEXHVCODVDIFx1QzIxQ1x1RDY4QyBcdUFDRjVcdUFDQTkgXHVCQzI5XHVDOUMwOiAuLiBcdUJDMEYgLiBcdUMxMzhcdUFERjhcdUJBM0NcdUQyQjgsIFx1QzgwOFx1QjMwMCBcdUFDQkRcdUI4NUMsIFx1QkMzMVx1QzJBQ1x1Qjc5OFx1QzJEQyBcdUNDMjhcdUIyRThcbiAgICBjb25zdCBzZWdtZW50cyA9IGRlY29kZWQuc3BsaXQoJy8nKTtcbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICAgIGlmIChzZWdtZW50ID09PSAnLi4nIHx8IHNlZ21lbnQgPT09ICcuJykgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoZGVjb2RlZC5pbmNsdWRlcygnXFxcXCcpKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFBoYXNlIDU6IERlYm91bmNlIHRpbWVyc1xuICBwcml2YXRlIGRlYm91bmNlVGltZXJzOiBNYXA8c3RyaW5nLCBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0Pj4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgREVCT1VOQ0VfTVMgPSAyMDAwOyAvLyBSRVEtRlYtMTEwOiAyXHVDRDA4IFx1QjUxNFx1QkMxNFx1QzZCNFx1QzJBNFxuXG4gIC8vIFJFUS1GVi0xMjA6IFx1RDA3NFx1Qjc3Q1x1Qzc3NFx1QzVCOFx1RDJCOCBcdUQ1NzRcdUMyREMgXHVDRTkwXHVDMkRDXG4gIHByaXZhdGUgbGFzdFNlbnRIYXNoOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gIC8vIFJFU1QgQVBJIFx1RDA3NFx1Qjc3Q1x1Qzc3NFx1QzVCOFx1RDJCOFxuICByZWFkb25seSByZXN0Q2xpZW50OiBSZXN0Q2xpZW50O1xuXG4gIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUMwQzFcdUQwREMgKFJlY29ubmVjdGlvbiBTeW5jIFN0YXRlKVxuICBwcml2YXRlIGlzUmVjb25uZWN0aW5nID0gZmFsc2U7XG4gIHByaXZhdGUgbGl2ZVN5bmNRdWV1ZTogU2VydmVyTWVzc2FnZVtdID0gW107XG5cbiAgLy8gU1BFQy1TWU5DLTAwNTogXHVCNTE0XHVCQzE0XHVDNzc0XHVDMkE0IFx1QUNFMFx1QzcyMCBJRCAoXHVDN0FDXHVDNUYwXHVBQ0IwIFx1QzJEQ1x1QjA5OFx1QjlBQ1x1QzYyNCBcdUJEODRcdUI5NThcdUM2QTkpXG4gIGRldmljZUlkOiBzdHJpbmcgPSAnJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzZXJ2ZXJVcmw6IHN0cmluZyxcbiAgICBwcml2YXRlIHZhdWx0SWQ6IHN0cmluZyxcbiAgICBwcml2YXRlIGFwaUtleTogc3RyaW5nLFxuICAgIHByaXZhdGUgZm9sZGVyUHJlZml4OiBzdHJpbmcgPSAnJyxcbiAgICBwcml2YXRlIHN0b3JhZ2U6IEluZGV4ZWREQlN0b3JhZ2UsXG4gICkge1xuICAgIHRoaXMucXVldWUgPSBuZXcgT2ZmbGluZVF1ZXVlKHN0b3JhZ2UpO1xuICAgIHRoaXMucmVzdENsaWVudCA9IG5ldyBSZXN0Q2xpZW50KHNlcnZlclVybCwgdmF1bHRJZCwgYXBpS2V5KTtcbiAgICB0aGlzLmZvbGRlclByZWZpeCA9IHRoaXMuZm9sZGVyUHJlZml4LnJlcGxhY2UoL15cXC8rfFxcLyskL2csICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUMxMUNcdUJDODQgXHVBQ0JEXHVCODVDIFx1MjE5MiBcdUI4NUNcdUNFRUMgXHVBQ0JEXHVCODVDIChcdUQzRjRcdUIzNTQgXHVDODExXHVCNDUwXHVDMEFDIFx1Q0Q5NFx1QUMwMClcbiAgICogXHVDNzc0XHVDODA0IFx1RDYxNVx1QzJERChcdUM4MTFcdUI0NTBcdUMwQUMgXHVDNzc0XHVCQkY4IFx1RDNFQ1x1RDU2OCkgXHVBQ0JEXHVCODVDXHVCMjk0IFx1QURGOFx1QjMwMFx1Qjg1QyBcdUJDMThcdUQ2NThcbiAgICovXG4gIHByaXZhdGUgdG9Mb2NhbFBhdGgoc2VydmVyUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuZm9sZGVyUHJlZml4KSByZXR1cm4gc2VydmVyUGF0aDtcbiAgICAvLyBcdUM3NzRcdUM4MDRcdUM1RDAgXHVDODExXHVCNDUwXHVDMEFDXHVBQzAwIFx1RDNFQ1x1RDU2OFx1QjQxQyBcdUFDQkRcdUI4NUNcdUJBNzQgXHVDOTExXHVCQ0Y1IFx1Q0Q5NFx1QUMwMCBcdUJDMjlcdUM5QzBcbiAgICBpZiAoc2VydmVyUGF0aC5zdGFydHNXaXRoKHRoaXMuZm9sZGVyUHJlZml4ICsgJy8nKSB8fCBzZXJ2ZXJQYXRoID09PSB0aGlzLmZvbGRlclByZWZpeCkge1xuICAgICAgcmV0dXJuIHNlcnZlclBhdGg7XG4gICAgfVxuICAgIHJldHVybiBgJHt0aGlzLmZvbGRlclByZWZpeH0vJHtzZXJ2ZXJQYXRofWA7XG4gIH1cblxuICAvKipcbiAgICogXHVCODVDXHVDRUVDIFx1QUNCRFx1Qjg1QyBcdTIxOTIgXHVDMTFDXHVCQzg0IFx1QUNCRFx1Qjg1QyAoXHVEM0Y0XHVCMzU0IFx1QzgxMVx1QjQ1MFx1QzBBQyBcdUM4MUNcdUFDNzApXG4gICAqL1xuICBwcml2YXRlIHRvU2VydmVyUGF0aChsb2NhbFBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLmZvbGRlclByZWZpeCkgcmV0dXJuIGxvY2FsUGF0aDtcbiAgICBpZiAobG9jYWxQYXRoLnN0YXJ0c1dpdGgodGhpcy5mb2xkZXJQcmVmaXggKyAnLycpKSB7XG4gICAgICByZXR1cm4gbG9jYWxQYXRoLnNsaWNlKHRoaXMuZm9sZGVyUHJlZml4Lmxlbmd0aCArIDEpO1xuICAgIH1cbiAgICBpZiAobG9jYWxQYXRoID09PSB0aGlzLmZvbGRlclByZWZpeCkgcmV0dXJuICcnO1xuICAgIHJldHVybiBsb2NhbFBhdGg7XG4gIH1cblxuICAvKipcbiAgICogXHVDRjVDXHVCQzMxIFx1QzEyNFx1QzgxNSAoUGhhc2UgMylcbiAgICovXG4gIHNldENhbGxiYWNrcyhjYWxsYmFja3M6IFN5bmNDYWxsYmFja3MpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcbiAgfVxuXG4gIGdldCBzdGF0ZSgpOiBTeW5jU3RhdGUge1xuICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUMxMUNcdUJDODRcdUM1RDBcdUMxMUMgXHVCQzFCXHVDNTQ0IFx1QzBERFx1QzEzMVx1RDU1QyBcdUQzMENcdUM3N0NcdUM3NzhcdUM5QzAgXHVENjU1XHVDNzc4IChcdUM1RDBcdUNGNTQgXHVCQzI5XHVDOUMwLCBcdUM3N0NcdUQ2OENcdUMxMzEpXG4gICAqL1xuICBpc1N5bmNDcmVhdGVkUGF0aChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zeW5jQ3JlYXRlZFBhdGhzLmRlbGV0ZShwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUMxMUNcdUJDODRcdUM1RDBcdUMxMUMgXHVCQzFCXHVDNTQ0IFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOFx1RDU1QyBcdUQzMENcdUM3N0NcdUM3NzhcdUM5QzAgXHVENjU1XHVDNzc4IChcdUM1RDBcdUNGNTQgXHVCQzI5XHVDOUMwLCBcdUM3N0NcdUQ2OENcdUMxMzEpXG4gICAqL1xuICBpc1N5bmNVcGRhdGVkUGF0aChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zeW5jVXBkYXRlZFBhdGhzLmRlbGV0ZShwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCByZWNvbm5lY3Rpb24gYXR0ZW1wdCBjb3VudFxuICAgKi9cbiAgZ2V0UmVjb25uZWN0QXR0ZW1wdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJlY29ubmVjdEF0dGVtcHQ7XG4gIH1cblxuICAvKipcbiAgICogXHVDOUMwXHVDODE1XHVCNDFDIFx1QUNCRFx1Qjg1Q1x1QzVEMCBcdUIzMDBcdUFFMzAgXHVDOTExXHVDNzc4IFx1QjNEOVx1QUUzMFx1RDY1NCBcdUM3OTFcdUM1QzVcdUM3NzQgXHVDNzg4XHVCMjk0XHVDOUMwIFx1RDY1NVx1Qzc3OFxuICAgKiBmaWxlOmNyZWF0ZSwgZmlsZTpyZW5hbWUsIHBlbmRpbmdSZW5hbWVzIFx1QkFBOFx1QjQ1MCBcdUQ2NTVcdUM3NzhcdUQ1NThcdUM1RUNcbiAgICogaGFuZGxlRmlsZU1vZGlmeVx1Qzc1OCBcdUM5MTFcdUJDRjUgZmlsZTpjcmVhdGVcdUI5N0MgXHVCQzI5XHVDOUMwXG4gICAqL1xuICBwdWJsaWMgaGFzUGVuZGluZ1N5bmMocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gcGVuZGluZ01lc3NhZ2VzXHVDNUQwIFx1RDU3NFx1QjJGOSBcdUFDQkRcdUI4NUNcdUM3NTggXHVDNzkxXHVDNUM1XHVDNzc0IFx1Qzc4OFx1QjI5NFx1QzlDMCBcdUQ2NTVcdUM3NzhcbiAgICBpZiAodGhpcy5wZW5kaW5nTWVzc2FnZXMuaGFzKHBhdGgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBwZW5kaW5nUmVuYW1lc1x1QzVEMFx1QzExQyBcdUM3NzQgXHVBQ0JEXHVCODVDXHVBQzAwIFx1Q0Q1Q1x1Qzg4NSBcdUJBQTlcdUM4MDFcdUM5QzBcdUM3NzhcdUM5QzAgXHVENjU1XHVDNzc4XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0aGlzLnBlbmRpbmdSZW5hbWVzLnZhbHVlcygpKSB7XG4gICAgICBpZiAodmFsdWUubmV3TG9jYWxQYXRoID09PSBwYXRoKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGxpc3RlbmVyIGZvciBzdGF0ZSBjaGFuZ2VzXG4gICAqIFJldHVybnMgdW5zdWJzY3JpYmUgZnVuY3Rpb25cbiAgICovXG4gIG9uU3RhdGVDaGFuZ2UobGlzdGVuZXI6IChzdGF0ZTogU3luY1N0YXRlKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgdGhpcy5zdGF0ZUxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0ZUxpc3RlbmVycyA9IHRoaXMuc3RhdGVMaXN0ZW5lcnMuZmlsdGVyKGwgPT4gbCAhPT0gbGlzdGVuZXIpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgbGlzdGVuZXIgZm9yIHNlcnZlciBtZXNzYWdlc1xuICAgKiBSZXR1cm5zIHVuc3Vic2NyaWJlIGZ1bmN0aW9uXG4gICAqL1xuICBvbk1lc3NhZ2UoaGFuZGxlcjogKG1lc3NhZ2U6IGFueSkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZUxpc3RlbmVycy5wdXNoKGhhbmRsZXIpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLm1lc3NhZ2VMaXN0ZW5lcnMgPSB0aGlzLm1lc3NhZ2VMaXN0ZW5lcnMuZmlsdGVyKGggPT4gaCAhPT0gaGFuZGxlcik7XG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0U3RhdGUoc3RhdGU6IFN5bmNTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5zdGF0ZUxpc3RlbmVycy5mb3JFYWNoKGwgPT4gbChzdGF0ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSByZWNvbm5lY3Rpb24gZGVsYXkgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAqL1xuICBwcml2YXRlIGdldFJlY29ubmVjdERlbGF5KCk6IG51bWJlciB7XG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLnJlY29ubmVjdEluaXRpYWxEZWxheSAqIE1hdGgucG93KHRoaXMucmVjb25uZWN0TXVsdGlwbGllciwgdGhpcy5yZWNvbm5lY3RBdHRlbXB0KTtcbiAgICByZXR1cm4gTWF0aC5taW4oZGVsYXksIHRoaXMucmVjb25uZWN0TWF4RGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlIHJlY29ubmVjdGlvbiB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICovXG4gIHByaXZhdGUgc2NoZWR1bGVSZWNvbm5lY3QoKTogdm9pZCB7XG4gICAgLy8gQ2hlY2sgYmVmb3JlIHNjaGVkdWxpbmcgaWYgd2UndmUgYWxyZWFkeSByZWFjaGVkIG1heCBhdHRlbXB0c1xuICAgIGlmICh0aGlzLnJlY29ubmVjdEF0dGVtcHQgPj0gdGhpcy5tYXhSZWNvbm5lY3RBdHRlbXB0cykge1xuICAgICAgLy8gTWF4IGF0dGVtcHRzIHJlYWNoZWQsIHRyYW5zaXRpb24gdG8gZXJyb3Igc3RhdGVcbiAgICAgIHRoaXMuc2V0U3RhdGUoJ2Vycm9yJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0Kys7XG4gICAgdGhpcy5zZXRTdGF0ZSgncmVjb25uZWN0aW5nJyk7XG5cbiAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0UmVjb25uZWN0RGVsYXkoKTtcbiAgICB0aGlzLnJlY29ubmVjdFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmNvbm5lY3QoKTtcbiAgICB9LCBkZWxheSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgcmVjb25uZWN0aW9uIHRpbWVyXG4gICAqL1xuICBwcml2YXRlIGNsZWFyUmVjb25uZWN0VGltZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucmVjb25uZWN0VGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlY29ubmVjdFRpbWVyKTtcbiAgICAgIHRoaXMucmVjb25uZWN0VGltZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIFdlYlNvY2tldCBzZXJ2ZXJcbiAgICovXG4gIGNvbm5lY3QoKTogdm9pZCB7XG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5yZXN0Q2xpZW50LmJhc2VVcmx9L3YxL3dzLyR7dGhpcy52YXVsdElkfT9rZXk9JHt0aGlzLmFwaUtleX1gO1xuICAgIHRoaXMud3MgPSBuZXcgV2ViU29ja2V0KHVybCk7XG5cbiAgICB0aGlzLndzLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIC8vIFJlc2V0IHJlY29ubmVjdGlvbiBzdGF0ZSBvbiBzdWNjZXNzZnVsIGNvbm5lY3Rpb25cbiAgICAgIHRoaXMucmVjb25uZWN0QXR0ZW1wdCA9IDA7XG4gICAgICB0aGlzLmNsZWFyUmVjb25uZWN0VGltZXIoKTtcbiAgICAgIHRoaXMuZXhwbGljaXRseURpc2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKCdjb25uZWN0ZWQnKTtcblxuICAgICAgLy8gUkVRLVJULTEwMSwgUkVRLVJULTEwMjogXHVDNUYwXHVBQ0IwIFx1QzJEQyBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVEMkI4XHVCOUFDXHVBQzcwXG4gICAgICB0aGlzLnN0YXJ0UmVjb25uZWN0U3luYygpO1xuICAgIH07XG5cbiAgICB0aGlzLndzLm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAvLyBJc3N1ZSAyOiBcdUM1RjBcdUFDQjAgXHVCMDRBXHVBRTQwIFx1QzJEQyBwZW5kaW5nUmVuYW1lcyBcdUM4MTVcdUI5QUMgKFx1QzdBQ1x1QzVGMFx1QUNCMCBcdUMyREMgXHVDNzk4XHVCQUJCXHVCNDFDIGZpbGVJZCBcdUMwQUNcdUM2QTkgXHVCQzI5XHVDOUMwKVxuICAgICAgdGhpcy5wZW5kaW5nUmVuYW1lcy5jbGVhcigpO1xuXG4gICAgICAvLyBPbmx5IHJlY29ubmVjdCBpZiBub3QgZXhwbGljaXRseSBkaXNjb25uZWN0ZWRcbiAgICAgIGlmICghdGhpcy5leHBsaWNpdGx5RGlzY29ubmVjdGVkKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVSZWNvbm5lY3QoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoJ29mZmxpbmUnKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy53cy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSgnZXJyb3InKTtcbiAgICB9O1xuXG4gICAgdGhpcy53cy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IGV2ZW50LmRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UocmF3KSBhcyBTZXJ2ZXJNZXNzYWdlO1xuXG4gICAgICAgIC8vIFBoYXNlIDM6IFx1QzExQ1x1QkM4NCBcdUJBNTRcdUMyRENcdUM5QzAgXHVCNTE0XHVDMkE0XHVEMzI4XHVDRTU4XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hTZXJ2ZXJNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIERpc3BhdGNoIHRvIGFsbCByZWdpc3RlcmVkIG1lc3NhZ2UgbGlzdGVuZXJzXG4gICAgICAgIHRoaXMubWVzc2FnZUxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGlzdGVuZXIobWVzc2FnZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIG1lc3NhZ2UgbGlzdGVuZXI6JywgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGFyc2UgV2ViU29ja2V0IG1lc3NhZ2U6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdCBmcm9tIFdlYlNvY2tldCBzZXJ2ZXJcbiAgICogSXNzdWUgMjogXHVDNUYwXHVBQ0IwIFx1RDU3NFx1QzgxQyBcdUMyREMgcGVuZGluZ1JlbmFtZXMgXHVDODE1XHVCOUFDXG4gICAqL1xuICBkaXNjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuZXhwbGljaXRseURpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgdGhpcy5jbGVhclJlY29ubmVjdFRpbWVyKCk7XG4gICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0ID0gMDtcblxuICAgIC8vIElzc3VlIDI6IFx1QzVGMFx1QUNCMCBcdUQ1NzRcdUM4MUMgXHVDMkRDIFx1QjMwMFx1QUUzMCBcdUM5MTFcdUM3NzggXHVDNzc0XHVCOTg0IFx1QkNDMFx1QUNCRCBcdUM4MTVcdUI5QUMgKFx1QzdBMFx1QzdBQ1x1QzgwMSBcdUM2MjRcdUI5NTggXHVCQzI5XHVDOUMwKVxuICAgIHRoaXMucGVuZGluZ1JlbmFtZXMuY2xlYXIoKTtcblxuICAgIGlmICh0aGlzLndzKSB7XG4gICAgICAvLyBDT05ORUNUSU5HKDApIFx1QzBDMVx1RDBEQ1x1QzVEMFx1QzExQyBjbG9zZSgpIFx1QzJEQyBcIldlYlNvY2tldCBpcyBjbG9zZWQgYmVmb3JlIGNvbm5lY3Rpb24gZXN0YWJsaXNoZWRcIiBcdUJDMjlcdUM5QzBcbiAgICAgIGlmICh0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgIHRoaXMud3MuY2xvc2UoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy53cy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgICB0aGlzLndzLm9ub3BlbiA9IG51bGw7XG4gICAgICAgIHRoaXMud3Mub25jbG9zZSA9IG51bGw7XG4gICAgICAgIHRoaXMud3Mub25lcnJvciA9IG51bGw7XG4gICAgICAgIHRoaXMud3Mub25tZXNzYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy53cy5jbG9zZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy53cyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoJ29mZmxpbmUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZSBzeW5jaW5nIChSRVEtUEwtMzAxKVxuICAgKi9cbiAgcGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSgncGF1c2VkJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdW1lIHN5bmNpbmdcbiAgICovXG4gIHJlc3VtZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKCdjb25uZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSgnb2ZmbGluZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGZpbGUgY3JlYXRlIGV2ZW50XG4gICAqL1xuICBzZW5kRmlsZUNyZWF0ZShwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHNlcnZlclBhdGggPSB0aGlzLnRvU2VydmVyUGF0aChwYXRoKTtcbiAgICBpZiAoIXNlcnZlclBhdGgpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW1N5bmNTZXJ2aWNlXSBzZW5kRmlsZUNyZWF0ZTogXHVCRTQ4IFx1QzExQ1x1QkM4NCBcdUFDQkRcdUI4NUMgXHVCQjM0XHVDMkRDIChsb2NhbDogJHtwYXRofSlgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gUGhhc2UgNDogcGVuZGluZ01lc3NhZ2VzXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzLnNldChwYXRoLCB7IHR5cGU6ICdmaWxlOmNyZWF0ZScsIHBhdGg6IHNlcnZlclBhdGgsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9KTtcbiAgICB0aGlzLnNlbmRPclF1ZXVlKCdmaWxlOmNyZWF0ZScsIHsgcGF0aDogc2VydmVyUGF0aCwgY29udGVudCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDNjk0XHVDQ0FEIFx1QzgwNFx1QzFBMSAoUkVRLVJULTEwMSwgUkVRLVJULTEwMilcbiAgICogU1BFQy1TWU5DLTAwNTogZGV2aWNlSWRcdUM2NDAgbXRpbWUgXHVEM0VDXHVENTY4IChcdUM3ODhcdUIyOTQgXHVBQ0JEXHVDNkIwKVxuICAgKi9cbiAgc2VuZFN5bmNSZWNvbm5lY3QobG9jYWxGaWxlczogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IGhhc2g6IHN0cmluZzsgbXRpbWU/OiBudW1iZXIgfT4pOiB2b2lkIHtcbiAgICAvLyBcdUQzRjRcdUIzNTQgXHVCOUU0XHVENTUxXHVDNzc0IFx1Qzc4OFx1QzczQ1x1QkE3NCBcdUQ1NzRcdUIyRjkgXHVEM0Y0XHVCMzU0IFx1RDU1OFx1QzcwNCBcdUQzMENcdUM3N0NcdUI5Q0MgXHVDODA0XHVDMUExXG4gICAgY29uc3QgcmVsZXZhbnQgPSB0aGlzLmZvbGRlclByZWZpeFxuICAgICAgPyBsb2NhbEZpbGVzLmZpbHRlcihmID0+IGYucGF0aC5zdGFydHNXaXRoKHRoaXMuZm9sZGVyUHJlZml4ICsgJy8nKSlcbiAgICAgIDogbG9jYWxGaWxlcztcbiAgICBjb25zdCBzZXJ2ZXJGaWxlcyA9IHRoaXMuZm9sZGVyUHJlZml4XG4gICAgICA/IHJlbGV2YW50Lm1hcChmID0+ICh7IHBhdGg6IHRoaXMudG9TZXJ2ZXJQYXRoKGYucGF0aCksIGhhc2g6IGYuaGFzaCwgbXRpbWU6IGYubXRpbWUgfSkpXG4gICAgICA6IHJlbGV2YW50O1xuXG4gICAgLy8gU1BFQy1TWU5DLTAwNTogZGV2aWNlSWRcdUFDMDAgXHVDNzg4XHVDNzNDXHVCQTc0IHBheWxvYWRcdUM1RDAgXHVEM0VDXHVENTY4XG4gICAgY29uc3QgcGF5bG9hZDogeyBsb2NhbEZpbGVzOiB0eXBlb2Ygc2VydmVyRmlsZXM7IGRldmljZUlkPzogc3RyaW5nIH0gPSB7XG4gICAgICBsb2NhbEZpbGVzOiBzZXJ2ZXJGaWxlcyxcbiAgICB9O1xuICAgIGlmICh0aGlzLmRldmljZUlkKSB7XG4gICAgICBwYXlsb2FkLmRldmljZUlkID0gdGhpcy5kZXZpY2VJZDtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRPclF1ZXVlKCdzeW5jOnJlY29ubmVjdCcsIHsgcGF5bG9hZCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDNjQ0XHVCOENDIFx1QzU0Q1x1QjlCQyBcdUM4MDRcdUMxQTEgKFJFUS1GUy0yMDIpXG4gICAqL1xuICBzZW5kU3luY1JlY29ubmVjdENvbXBsZXRlKHVwbG9hZGVkOiBudW1iZXIsIGRvd25sb2FkZWQ6IG51bWJlciwgY29uZmxpY3RzOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmRPclF1ZXVlKCdzeW5jOnJlY29ubmVjdC1jb21wbGV0ZScsIHsgcGF5bG9hZDogeyB1cGxvYWRlZCwgZG93bmxvYWRlZCwgY29uZmxpY3RzIH0gfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBmaWxlIHVwZGF0ZSBldmVudCB3aXRoIGNvbnRlbnQgaGFzaFxuICAgKiBQaGFzZSA1OiBEZWJvdW5jZSBcdUM4MDFcdUM2QTkgKFJFUS1MQy00MDIpXG4gICAqIFJFUS1GVi0xMjA6IFx1RDU3NFx1QzJEQyBcdUJFNDRcdUFENTBcdUI4NUMgXHVDOTExXHVCQ0Y1IFx1QzgwNFx1QzFBMSBcdUMyQTRcdUQwQjVcbiAgICovXG4gIGFzeW5jIHNlbmRGaWxlVXBkYXRlKGZpbGVJZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlcnZlclBhdGggPSB0aGlzLnRvU2VydmVyUGF0aChwYXRoKTtcbiAgICBpZiAoIXNlcnZlclBhdGgpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW1N5bmNTZXJ2aWNlXSBzZW5kRmlsZVVwZGF0ZTogXHVCRTQ4IFx1QzExQ1x1QkM4NCBcdUFDQkRcdUI4NUMgXHVCQjM0XHVDMkRDIChsb2NhbDogJHtwYXRofSlgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSRVEtRlYtMTIwOiBcdUQ1NzRcdUMyREMgXHVCRTQ0XHVBRDUwXHVCODVDIFx1QzkxMVx1QkNGNSBcdUM4MDRcdUMxQTEgXHVDMkE0XHVEMEI1XG4gICAgY29uc3QgY29udGVudEhhc2ggPSBhd2FpdCBoYXNoQ29udGVudChjb250ZW50KTtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMubGFzdFNlbnRIYXNoLmdldChwYXRoKTtcbiAgICBpZiAobGFzdEhhc2ggPT09IGNvbnRlbnRIYXNoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubGFzdFNlbnRIYXNoLnNldChwYXRoLCBjb250ZW50SGFzaCk7XG5cbiAgICAvLyBQaGFzZSA1OiBcdUFFMzBcdUM4NzQgXHVEMEMwXHVDNzc0XHVCQTM4IFx1Q0RFOFx1QzE4Q1xuICAgIGNvbnN0IGV4aXN0aW5nVGltZXIgPSB0aGlzLmRlYm91bmNlVGltZXJzLmdldChwYXRoKTtcbiAgICBpZiAoZXhpc3RpbmdUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KGV4aXN0aW5nVGltZXIpO1xuICAgIH1cblxuICAgIC8vIFBoYXNlIDU6IFx1QzBDOCBcdUQwQzBcdUM3NzRcdUJBMzggXHVDMTI0XHVDODE1IChERUJPVU5DRV9NUyA9IDIwMDApXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgIC8vIFBoYXNlIDQ6IHBlbmRpbmdNZXNzYWdlc1x1QzVEMCBcdUNEOTRcdUFDMDBcbiAgICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzLnNldChwYXRoLCB7IHR5cGU6ICdmaWxlOnVwZGF0ZScsIHBhdGg6IHNlcnZlclBhdGgsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9KTtcblxuICAgICAgLy8gU1BFQy1TWU5DLTAwNTogZGV2aWNlSWRcdUM2NDAgY2xpZW50TXRpbWUgXHVEM0VDXHVENTY4XG4gICAgICBjb25zdCB1cGRhdGVQYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0geyBmaWxlSWQsIHBhdGg6IHNlcnZlclBhdGgsIGNvbnRlbnQgfTtcbiAgICAgIGlmICh0aGlzLmRldmljZUlkKSB7XG4gICAgICAgIHVwZGF0ZVBheWxvYWQuZGV2aWNlSWQgPSB0aGlzLmRldmljZUlkO1xuICAgICAgfVxuICAgICAgLy8gY2xpZW50TXRpbWU6IGdldEZpbGVTdGF0IFx1Q0Y1Q1x1QkMzMVx1QzczQ1x1Qjg1QyBcdUQzMENcdUM3N0MgXHVDMjE4XHVDODE1IFx1QzJEQ1x1QUMwMSBcdUM4NzBcdUQ2OENcbiAgICAgIGlmICh0aGlzLmNhbGxiYWNrcz8uZ2V0RmlsZVN0YXQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gYXdhaXQgdGhpcy5jYWxsYmFja3MuZ2V0RmlsZVN0YXQocGF0aCk7XG4gICAgICAgICAgdXBkYXRlUGF5bG9hZC5jbGllbnRNdGltZSA9IHN0YXQubXRpbWU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIC8vIFx1Qzg3MFx1RDY4QyBcdUMyRTRcdUQzMjggXHVDMkRDIFx1QzBERFx1QjdCNVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VuZE9yUXVldWUoJ2ZpbGU6dXBkYXRlJywgdXBkYXRlUGF5bG9hZCk7XG5cbiAgICAgIC8vIFx1RDBDMFx1Qzc3NFx1QkEzOCBcdUM4MUNcdUFDNzBcbiAgICAgIHRoaXMuZGVib3VuY2VUaW1lcnMuZGVsZXRlKHBhdGgpO1xuICAgIH0sIHRoaXMuREVCT1VOQ0VfTVMpO1xuXG4gICAgdGhpcy5kZWJvdW5jZVRpbWVycy5zZXQocGF0aCwgdGltZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZmlsZSBkZWxldGUgZXZlbnRcbiAgICovXG4gIHNlbmRGaWxlRGVsZXRlKGZpbGVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gUGhhc2UgNDogcGVuZGluZ01lc3NhZ2VzXHVDNUQwIFx1Q0Q5NFx1QUMwMCAoZmlsZUlkXHVCOTdDIGtleVx1Qjg1QyBcdUMwQUNcdUM2QTkpXG4gICAgdGhpcy5wZW5kaW5nTWVzc2FnZXMuc2V0KGZpbGVJZCwgeyB0eXBlOiAnZmlsZTpkZWxldGUnLCBwYXRoOiBmaWxlSWQsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9KTtcbiAgICB0aGlzLnNlbmRPclF1ZXVlKCdmaWxlOmRlbGV0ZScsIHsgZmlsZUlkIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZmlsZSByZW5hbWUgZXZlbnRcbiAgICovXG4gIHNlbmRGaWxlUmVuYW1lKGZpbGVJZDogc3RyaW5nLCBvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHNlcnZlck9sZCA9IHRoaXMudG9TZXJ2ZXJQYXRoKG9sZFBhdGgpO1xuICAgIGNvbnN0IHNlcnZlck5ldyA9IHRoaXMudG9TZXJ2ZXJQYXRoKG5ld1BhdGgpO1xuICAgIC8vIFBoYXNlIDQ6IHBlbmRpbmdNZXNzYWdlc1x1QzVEMCBcdUNEOTRcdUFDMDBcbiAgICB0aGlzLnBlbmRpbmdNZXNzYWdlcy5zZXQobmV3UGF0aCwgeyB0eXBlOiAnZmlsZTpyZW5hbWUnLCBwYXRoOiBzZXJ2ZXJOZXcsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9KTtcbiAgICB0aGlzLnNlbmRPclF1ZXVlKCdmaWxlOnJlbmFtZScsIHsgZmlsZUlkLCBvbGRQYXRoOiBzZXJ2ZXJPbGQsIG5ld1BhdGg6IHNlcnZlck5ldyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUMwRERcdUMxMzEtXHVDNzc0XHVCOTg0XHVCQ0MwXHVBQ0JEIFx1QUNCRFx1QzdDMSBcdUM4NzBcdUFDNzQgXHVDQzk4XHVCOUFDOiBmaWxlSWRcdUFDMDAgXHVDNTQ0XHVDOUMxIFx1QzVDNlx1Qzc0NCBcdUI1NEMgXHVCMzAwXHVBRTMwIFx1QzkxMVx1Qzc3OCBcdUM3NzRcdUI5ODQgXHVCQ0MwXHVBQ0JEXHVDNzQ0IFx1RDA1MFx1Qzc4OVxuICAgKlxuICAgKiBcdUQ1NzVcdUMyRUM6IHBlbmRpbmdNZXNzYWdlcyBcdUQwQTRcdUI5N0MgXHVDNzc0XHVCM0Q5XHVENTU4XHVDOUMwIFx1QzU0QVx1QUNFMCBcdUFERjhcdUIzMDBcdUI4NUMgXHVDNzIwXHVDOUMwIChhY2tcdUFDMDAgXHVDNkQwXHVCNzk4IFx1QUNCRFx1Qjg1Q1x1Qjg1QyBcdUIzQ0NcdUM1NDRcdUM2MjRcdUFFMzAgXHVCNTRDXHVCQjM4KVxuICAgKiBcdUIzMDBcdUMyRTAgcGVuZGluZ1JlbmFtZXNcdUM1RDAgXHVDNkQwXHVCNzk4IFx1QUNCRFx1Qjg1Q1x1Qjk3QyBcdUQwQTRcdUI4NUMgXHVDODAwXHVDN0E1XHVENTU4XHVDNUVDIGFjayBcdUMyMThcdUMyRTAgXHVDMkRDIFx1QjlFNFx1Q0U2RFxuICAgKi9cbiAgcHVibGljIHF1ZXVlUGVuZGluZ1JlbmFtZShvbGRMb2NhbFBhdGg6IHN0cmluZywgbmV3TG9jYWxQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLmNsZWFudXBQZW5kaW5nUmVuYW1lcygpO1xuXG4gICAgLy8gXHVDOUMxXHVDODExIFx1QjlFNFx1Q0U2RDogb2xkTG9jYWxQYXRoXHVDNUQwIFx1QjMwMFx1QUUzMCBcdUM5MTFcdUM3NzggZmlsZTpjcmVhdGVcdUFDMDAgXHVDNzg4XHVCMjk0XHVDOUMwIFx1RDY1NVx1Qzc3OFxuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdNZXNzYWdlcy5nZXQob2xkTG9jYWxQYXRoKTtcbiAgICBpZiAocGVuZGluZyAmJiBwZW5kaW5nLnR5cGUgPT09ICdmaWxlOmNyZWF0ZScpIHtcbiAgICAgIC8vIHBlbmRpbmdNZXNzYWdlc1x1QjI5NCBcdUFERjhcdUIzMDBcdUI4NUMgXHVCNDUwXHVBQ0UwIChhY2tcdUFDMDAgb2xkTG9jYWxQYXRoXHVCODVDIFx1QjlFNFx1Q0U2RFx1RDU3NFx1QzU3QyBcdUQ1NjgpXG4gICAgICAvLyBwZW5kaW5nUmVuYW1lc1x1QzVEMCBvbGRMb2NhbFBhdGhcdUI5N0MgXHVEMEE0XHVCODVDIFx1QzgwMFx1QzdBNVxuICAgICAgdGhpcy5wZW5kaW5nUmVuYW1lcy5zZXQob2xkTG9jYWxQYXRoLCB7XG4gICAgICAgIG9sZFNlcnZlclBhdGg6IHBlbmRpbmcucGF0aCxcbiAgICAgICAgbmV3U2VydmVyUGF0aDogdGhpcy50b1NlcnZlclBhdGgobmV3TG9jYWxQYXRoKSxcbiAgICAgICAgb2xkTG9jYWxQYXRoLFxuICAgICAgICBuZXdMb2NhbFBhdGgsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBcdUNDQjRcdUM3NzggXHVCOUU0XHVDRTZEOiBvbGRMb2NhbFBhdGhcdUFDMDAgXHVDNzc0XHVDODA0IHBlbmRpbmdSZW5hbWVcdUM3NTggbmV3TG9jYWxQYXRoXHVDNzc4IFx1QUNCRFx1QzZCMCAoQVx1MjE5MkJcdTIxOTJDKVxuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHRoaXMucGVuZGluZ1JlbmFtZXMuZW50cmllcygpKSB7XG4gICAgICBpZiAodmFsdWUubmV3TG9jYWxQYXRoID09PSBvbGRMb2NhbFBhdGgpIHtcbiAgICAgICAgLy8gXHVBRTMwXHVDODc0IFx1RDU2RFx1QkFBOVx1Qzc1OCBuZXdMb2NhbFBhdGhcdUI5Q0MgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IChBXHUyMTkyQiBcdUI5N0MgQVx1MjE5MkNcdUI4NUMpXG4gICAgICAgIHRoaXMucGVuZGluZ1JlbmFtZXMuc2V0KGtleSwge1xuICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgIG5ld1NlcnZlclBhdGg6IHRoaXMudG9TZXJ2ZXJQYXRoKG5ld0xvY2FsUGF0aCksXG4gICAgICAgICAgbmV3TG9jYWxQYXRoLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIElzc3VlIDE6IFx1QjlDQ1x1QjhDQ1x1QjQxQyBwZW5kaW5nUmVuYW1lcyBcdUM4MTVcdUI5QUMgKDVcdUJEODQgXHVBQ0JEXHVBQ0ZDKVxuICAgKi9cbiAgcHJpdmF0ZSBjbGVhbnVwUGVuZGluZ1JlbmFtZXMoKTogdm9pZCB7XG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBlbmRpbmdSZW5hbWVzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKG5vdyAtIHZhbHVlLnRpbWVzdGFtcCA+IHRoaXMuUEVORElOR19SRU5BTUVfRVhQSVJZX01TKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ1JlbmFtZXMuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgbWVzc2FnZSBvciBxdWV1ZSB3aGVuIG9mZmxpbmVcbiAgICovXG4gIHB1YmxpYyBzZW5kT3JRdWV1ZSh0eXBlOiBXU01lc3NhZ2VUeXBlLCBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0YXRlID09PSAncGF1c2VkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeSh7IHR5cGUsIC4uLnBheWxvYWQgfSk7XG5cbiAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICB0aGlzLndzLnNlbmQobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucXVldWUuYWRkKHR5cGUsIHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbHVzaCBvZmZsaW5lIHF1ZXVlIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZCAoUkVRLVBMLTEwOSlcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgZmx1c2hRdWV1ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IHRoaXMucXVldWUuZ2V0QWxsKCk7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBpdGVtLnR5cGUsIC4uLml0ZW0ucGF5bG9hZCB9KTtcbiAgICAgIHRoaXMud3M/LnNlbmQobWVzc2FnZSk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMucXVldWUuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQaGFzZSAzOiBcdUMxMUNcdUJDODQgXHVCQTU0XHVDMkRDXHVDOUMwIFx1QjUxNFx1QzJBNFx1RDMyOFx1Q0U1OFxuICAgKiBATVg6QU5DSE9SOiBbQVVUT10gXHVDMTFDXHVCQzg0IFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUQwQzBcdUM3ODVcdUJDQzQgXHVENTc4XHVCNEU0XHVCN0VDIFx1Qjc3Q1x1QzZCMFx1RDMwNVxuICAgKiBATVg6UkVBU09OOiBSRVEtU1MtMTAxIHRvIFJFUS1TUy0xMDggLSBcdUMxMUNcdUJDODQgXHVCQTU0XHVDMkRDXHVDOUMwIFx1Q0M5OFx1QjlBQyBcdUI4NUNcdUM5QzFcbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hTZXJ2ZXJNZXNzYWdlKG1lc3NhZ2U6IFNlcnZlck1lc3NhZ2UpOiB2b2lkIHtcbiAgICAvLyBQaGFzZSA0OiBcdUNENUNcdUFERkMgXHVDMkI5XHVDNzc4XHVCNDFDIFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUM4MTVcdUI5QUMgKDEwXHVDRDA4IFx1QUNCRFx1QUNGQylcbiAgICB0aGlzLmNsZWFudXBSZWNlbnRseUFja25vd2xlZGdlZCgpO1xuXG4gICAgLy8gUkVRLVJULTIwMTogXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzkxMSBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUQwNTBcdUM3ODlcbiAgICBpZiAodGhpcy5pc1JlY29ubmVjdGluZyAmJiBtZXNzYWdlLnR5cGUgIT09ICdzeW5jOnJlY29ubmVjdC1yZXNwb25zZScgJiYgbWVzc2FnZS50eXBlICE9PSAnc3luYzphY2snKSB7XG4gICAgICB0aGlzLmxpdmVTeW5jUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnc3luYzphY2snOlxuICAgICAgICB0aGlzLmhhbmRsZVN5bmNBY2sobWVzc2FnZSBhcyB7IHR5cGU6ICdzeW5jOmFjayc7IGZpbGVJZDogc3RyaW5nIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpbGU6Y3JlYXRlZCc6XG4gICAgICAgIHRoaXMuaGFuZGxlRmlsZUNyZWF0ZWQobWVzc2FnZSBhcyB7IHR5cGU6ICdmaWxlOmNyZWF0ZWQnOyBmaWxlOiB7IGlkOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgaGFzaDogc3RyaW5nIH0gfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZmlsZTp1cGRhdGVkJzpcbiAgICAgICAgdGhpcy5oYW5kbGVGaWxlVXBkYXRlZChtZXNzYWdlIGFzIHsgdHlwZTogJ2ZpbGU6dXBkYXRlZCc7IGZpbGU6IHsgaWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBjb250ZW50Pzogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfSB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmaWxlOmRlbGV0ZWQnOlxuICAgICAgICB0aGlzLmhhbmRsZUZpbGVEZWxldGVkKG1lc3NhZ2UgYXMgeyB0eXBlOiAnZmlsZTpkZWxldGVkJzsgZmlsZUlkOiBzdHJpbmcgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZmlsZTpyZW5hbWVkJzpcbiAgICAgICAgdGhpcy5oYW5kbGVGaWxlUmVuYW1lZChtZXNzYWdlIGFzIHsgdHlwZTogJ2ZpbGU6cmVuYW1lZCc7IGZpbGU6IHsgaWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfSB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb25mbGljdDpkZXRlY3RlZCc6XG4gICAgICAgIHRoaXMuaGFuZGxlQ29uZmxpY3REZXRlY3RlZChtZXNzYWdlIGFzIHsgdHlwZTogJ2NvbmZsaWN0OmRldGVjdGVkJzsgY29uZmxpY3RJZDogc3RyaW5nOyBmaWxlSWQ6IHN0cmluZzsgY2xpZW50SGFzaD86IHN0cmluZyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzeW5jOmVycm9yJzpcbiAgICAgICAgdGhpcy5oYW5kbGVTeW5jRXJyb3IobWVzc2FnZSBhcyB7IHR5cGU6ICdzeW5jOmVycm9yJzsgY29kZT86IHN0cmluZzsgbWVzc2FnZT86IHN0cmluZyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzeW5jOnJlY29ubmVjdC1yZXNwb25zZSc6XG4gICAgICAgIHRoaXMuaGFuZGxlUmVjb25uZWN0UmVzcG9uc2UobWVzc2FnZSBhcyBTeW5jUmVjb25uZWN0UmVzcG9uc2VNZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFQzLjI6IGhhbmRsZVN5bmNBY2sgKFJFUS1TUy0xMDEpXG4gICAqIElzc3VlIDE6IFx1QjlDQ1x1QjhDQ1x1QjQxQyBwZW5kaW5nUmVuYW1lcyBcdUM4MTVcdUI5QUNcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlU3luY0FjayhtZXNzYWdlOiB7IHR5cGU6ICdzeW5jOmFjayc7IGZpbGVJZDogc3RyaW5nOyBwYXRoPzogc3RyaW5nIH0pOiB2b2lkIHtcbiAgICAvLyBJc3N1ZSAxOiBcdUI5Q0NcdUI4Q0NcdUI0MUMgXHVENTZEXHVCQUE5IFx1QzgxNVx1QjlBQ1xuICAgIHRoaXMuY2xlYW51cFBlbmRpbmdSZW5hbWVzKCk7XG5cbiAgICBjb25zdCB7IGZpbGVJZCwgcGF0aCB9ID0gbWVzc2FnZTtcblxuICAgIC8vIFx1Q0Q1Q1x1QURGQyBcdUMyQjlcdUM3NzhcdUI0MUMgXHVCQzg0XHVEMzdDXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgIHRoaXMucmVjZW50bHlBY2tub3dsZWRnZWQuc2V0KGZpbGVJZCwgRGF0ZS5ub3coKSk7XG5cbiAgICAvLyBmaWxlOmNyZWF0ZSBhY2s6IFx1QzExQ1x1QkM4NCBcdUFDQkRcdUI4NUNcdUI5N0MgXHVCODVDXHVDRUVDIFx1QUNCRFx1Qjg1Q1x1Qjg1QyBcdUJDQzBcdUQ2NTggXHVENkM0IFx1QjlFNFx1Q0U2RFxuICAgIC8vIGFja1x1Qzc1OCBwYXRoXHVCMjk0IFx1QzExQ1x1QkM4NCBcdUFDQkRcdUI4NUNcdUM3NzRcdUFDRTAgcGVuZGluZ01lc3NhZ2VzIFx1RDBBNFx1QjI5NCBcdUI4NUNcdUNFRUMgXHVBQ0JEXHVCODVDXHVDNzc0XHVCQkMwXHVCODVDIFx1QkNDMFx1RDY1OCBcdUQ1NDRcdUM2OTRcbiAgICBpZiAocGF0aCkge1xuICAgICAgY29uc3QgbG9jYWxQYXRoID0gdGhpcy50b0xvY2FsUGF0aChwYXRoKTtcbiAgICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdNZXNzYWdlcy5nZXQobG9jYWxQYXRoKTtcbiAgICAgIGNvbnNvbGUubG9nKGBbQUNLXSBwYXRoPSR7cGF0aH0gbG9jYWxQYXRoPSR7bG9jYWxQYXRofSBmb3VuZD0keyEhcGVuZGluZ31gKTtcbiAgICAgIGlmIChwZW5kaW5nKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzLmRlbGV0ZShsb2NhbFBhdGgpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrcz8ub25GaWxlSWRVcGRhdGUobG9jYWxQYXRoLCBmaWxlSWQpO1xuICAgICAgICAvLyBmaWxlSWQgXHVDMjE4XHVDMkUwIFx1RDZDNCBcdUIzMDBcdUFFMzAgXHVDOTExXHVDNzc4IFx1Qzc3NFx1Qjk4NCBcdUJDQzBcdUFDQkQgXHVDQzk4XHVCOUFDXG4gICAgICAgIGNvbnN0IHBlbmRpbmdSZW5hbWUgPSB0aGlzLnBlbmRpbmdSZW5hbWVzLmdldChsb2NhbFBhdGgpO1xuICAgICAgICBpZiAocGVuZGluZ1JlbmFtZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbQUNLXSBwcm9jZXNzaW5nIHBlbmRpbmdSZW5hbWU6ICR7bG9jYWxQYXRofSBcdTIxOTIgJHtwZW5kaW5nUmVuYW1lLm5ld0xvY2FsUGF0aH1gKTtcbiAgICAgICAgICB0aGlzLnBlbmRpbmdSZW5hbWVzLmRlbGV0ZShsb2NhbFBhdGgpO1xuICAgICAgICAgIHRoaXMuc2VuZEZpbGVSZW5hbWUoZmlsZUlkLCBwZW5kaW5nUmVuYW1lLm9sZExvY2FsUGF0aCwgcGVuZGluZ1JlbmFtZS5uZXdMb2NhbFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdUFFMzBcdUM4NzQgXHVCODVDXHVDOUMxOiBmaWxlSWQgXHVBRTMwXHVCQzE4IFx1QjlFNFx1Q0U2RCAoZmlsZTp1cGRhdGUsIGZpbGU6ZGVsZXRlLCBmaWxlOnJlbmFtZSlcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBlbmRpbmdNZXNzYWdlcy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChrZXkgPT09IGZpbGVJZCB8fCB2YWx1ZS5wYXRoID09PSBmaWxlSWQpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nTWVzc2FnZXMuZGVsZXRlKGtleSk7XG5cbiAgICAgICAgLy8gZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggXHVDRjVDXHVCQzMxIC0gXHVCODVDXHVDRUVDIFx1QUNCRFx1Qjg1Q1x1Qjg1QyBcdUJDQzBcdUQ2NThcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzICYmIHZhbHVlLnBhdGgpIHtcbiAgICAgICAgICBjb25zdCBsb2NhbFBhdGggPSB0aGlzLnRvTG9jYWxQYXRoKHZhbHVlLnBhdGgpO1xuICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkVXBkYXRlKGxvY2FsUGF0aCwgZmlsZUlkKTtcbiAgICAgICAgICAvLyBmaWxlSWQgXHVDMjE4XHVDMkUwIFx1RDZDNCBcdUIzMDBcdUFFMzAgXHVDOTExXHVDNzc4IFx1Qzc3NFx1Qjk4NCBcdUJDQzBcdUFDQkQgXHVDQzk4XHVCOUFDXG4gICAgICAgICAgY29uc3QgcGVuZGluZ1JlbmFtZSA9IHRoaXMucGVuZGluZ1JlbmFtZXMuZ2V0KGxvY2FsUGF0aCk7XG4gICAgICAgICAgaWYgKHBlbmRpbmdSZW5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1JlbmFtZXMuZGVsZXRlKGxvY2FsUGF0aCk7XG4gICAgICAgICAgICB0aGlzLnNlbmRGaWxlUmVuYW1lKGZpbGVJZCwgcGVuZGluZ1JlbmFtZS5vbGRMb2NhbFBhdGgsIHBlbmRpbmdSZW5hbWUubmV3TG9jYWxQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFQzLjM6IGhhbmRsZUZpbGVDcmVhdGVkIChSRVEtU1MtMTAyKVxuICAgKiBSRVEtQVRUQUNILTAwNTogQmluYXJ5IGZpbGUgZG93bmxvYWQgc3VwcG9ydFxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBoYW5kbGVGaWxlQ3JlYXRlZChtZXNzYWdlOiB7IHR5cGU6ICdmaWxlOmNyZWF0ZWQnOyBmaWxlOiB7IGlkOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY29udGVudD86IHN0cmluZzsgaGFzaDogc3RyaW5nIH0gfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHsgZmlsZSB9ID0gbWVzc2FnZTtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzKSByZXR1cm47XG5cbiAgICAvLyBQaGFzZSA0OiBcdUM3OTBcdUFDMDAgb3JpZ2luIFx1Q0NCNFx1RDA2Q1xuICAgIGlmICh0aGlzLmlzU2VsZk9yaWdpbmF0ZWQoZmlsZS5pZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUFDQkRcdUI4NUMgXHVDODE1XHVBRERDXHVENjU0OiBcdUMxMUNcdUJDODQgXHVBQ0JEXHVCODVDXHVDNzU4IFx1QzU1RSAvIFx1QzgxQ1x1QUM3MCAoT2JzaWRpYW5cdUM3NDAgXHVDMEMxXHVCMzAwIFx1QUNCRFx1Qjg1QyBcdUMwQUNcdUM2QTkpXG4gICAgY29uc3Qgc2VydmVyUGF0aCA9IGZpbGUucGF0aC5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gdGhpcy50b0xvY2FsUGF0aChzZXJ2ZXJQYXRoKTtcblxuICAgIC8vIFx1QUNCRFx1Qjg1QyBcdUMyMUNcdUQ2OEMgXHVCQzI5XHVDOUMwIChcdUJDRjRcdUM1NDggXHVDREU4XHVDNTdEXHVDODEwIFx1QzIxOFx1QzgxNSlcbiAgICBpZiAoIXRoaXMuaXNWYWxpZFZhdWx0UGF0aChub3JtYWxpemVkUGF0aCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW2hhbmRsZUZpbGVDcmVhdGVkXSBcdUM3MjBcdUQ2QThcdUQ1NThcdUM5QzAgXHVDNTRBXHVDNzQwIFx1QUNCRFx1Qjg1QzogJHtub3JtYWxpemVkUGF0aH1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUQzMENcdUM3N0NcdUM3NzQgXHVDNzc0XHVCQkY4IFx1Qzg3NFx1QzdBQ1x1RDU1OFx1QjI5NFx1QzlDMCBcdUQ2NTVcdUM3NzhcbiAgICBpZiAodGhpcy5jYWxsYmFja3MucGF0aEV4aXN0cyAmJiB0aGlzLmNhbGxiYWNrcy5wYXRoRXhpc3RzKG5vcm1hbGl6ZWRQYXRoKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25GaWxlSWRVcGRhdGUobm9ybWFsaXplZFBhdGgsIGZpbGUuaWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJFUS1BVFRBQ0gtMDA1OiBcdUJDMTRcdUM3NzRcdUIxMDhcdUI5QUMgXHVEMzBDXHVDNzdDIFx1Q0M5OFx1QjlBQ1xuICAgIGlmIChpc0JpbmFyeUZpbGUobm9ybWFsaXplZFBhdGgpKSB7XG4gICAgICB0aGlzLmhhbmRsZUJpbmFyeUZpbGVDcmVhdGVkKHsgLi4uZmlsZSwgcGF0aDogbm9ybWFsaXplZFBhdGggfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1QzVEMFx1Q0Y1NCBcdUJDMjlcdUM5QzA6IFx1Qjg1Q1x1Q0VFQyBcdUMwRERcdUMxMzEgXHVDMkRDIFx1RDMwQ1x1Qzc3QyBcdUM2Q0NcdUNDOTggXHVCQjM0XHVDMkRDXG4gICAgICB0aGlzLnN5bmNDcmVhdGVkUGF0aHMuYWRkKG5vcm1hbGl6ZWRQYXRoKTtcblxuICAgICAgYXdhaXQgdGhpcy5lbnN1cmVQYXJlbnRGb2xkZXIobm9ybWFsaXplZFBhdGgpO1xuXG4gICAgICBpZiAoZmlsZS5jb250ZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3Mub25GaWxlQ3JlYXRlKG5vcm1hbGl6ZWRQYXRoLCBmaWxlLmNvbnRlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29udGVudCBcdUM1QzZcdUM3M0NcdUJBNzQgUkVTVFx1Qjg1QyBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMgKE1DUC9cdUIyRTRcdUI5NzggXHVEMDc0XHVCNzdDXHVDNzc0XHVDNUI4XHVEMkI4XHVDNUQwXHVDMTFDIFx1QzBERFx1QzEzMVx1RDU1QyBcdUQzMENcdUM3N0MpXG4gICAgICAgIGF3YWl0IHRoaXMuZG93bmxvYWRTZXJ2ZXJGaWxlKGZpbGUuaWQsIG5vcm1hbGl6ZWRQYXRoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWxsYmFja3Mub25GaWxlSWRVcGRhdGUobm9ybWFsaXplZFBhdGgsIGZpbGUuaWQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBcdUMyRTRcdUQzMjggXHVDMkRDIFx1QzVEMFx1Q0Y1NCBcdUJDMjlcdUM5QzAgXHVBQ0JEXHVCODVDXHVCM0M0IFx1QzgxNVx1QjlBQyAoXHVCQTU0XHVCQUE4XHVCOUFDIFx1QjIwNFx1QzIxOCBcdUJDMjlcdUM5QzApXG4gICAgICB0aGlzLnN5bmNDcmVhdGVkUGF0aHMuZGVsZXRlKG5vcm1hbGl6ZWRQYXRoKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtoYW5kbGVGaWxlQ3JlYXRlZF0gXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtub3JtYWxpemVkUGF0aH1gLCBlcnJvcik7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vbkVycm9yPy4oe1xuICAgICAgICBjYXRlZ29yeTogJ3N5bmMnLFxuICAgICAgICBjb2RlOiAnRE9XTkxPQURfRkFJTEVEJyxcbiAgICAgICAgbWVzc2FnZTogYFx1RDMwQ1x1Qzc3QyBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMgXHVDMkU0XHVEMzI4OiAke25vcm1hbGl6ZWRQYXRofWAsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUkVRLUFUVEFDSC0wMDU6IFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0MgXHVDMEREXHVDMTMxIFx1Q0M5OFx1QjlBQ1xuICAgKiBSRVNUIEdFVFx1QzczQ1x1Qjg1QyBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMgXHVENkM0IFx1Q0Y1Q1x1QkMzMVx1QzczQ1x1Qjg1QyBcdUI4NUNcdUNFRUMgXHVDODAwXHVDN0E1XG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZUJpbmFyeUZpbGVDcmVhdGVkKGZpbGU6IHsgaWQ6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmVuc3VyZVBhcmVudEZvbGRlcihmaWxlLnBhdGgpO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kb3dubG9hZEJpbmFyeUZpbGUoZmlsZS5wYXRoKTtcblxuICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLm9uQmluYXJ5RmlsZUNyZWF0ZSkge1xuICAgICAgICBhd2FpdCB0aGlzLmNhbGxiYWNrcy5vbkJpbmFyeUZpbGVDcmVhdGUoZmlsZS5wYXRoLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgLy8gZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUNEOTRcdUFDMDBcbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkVXBkYXRlKGZpbGUucGF0aCwgZmlsZS5pZCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtoYW5kbGVCaW5hcnlGaWxlQ3JlYXRlZF0gXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtmaWxlLnBhdGh9YCwgZXJyb3IpO1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25FcnJvcj8uKHtcbiAgICAgICAgY2F0ZWdvcnk6ICdzeW5jJyxcbiAgICAgICAgY29kZTogJ0JJTkFSWV9ET1dOTE9BRF9GQUlMRUQnLFxuICAgICAgICBtZXNzYWdlOiBgQmluYXJ5IGRvd25sb2FkIGZhaWxlZCBmb3IgJHtmaWxlLnBhdGh9YCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUMy40OiBoYW5kbGVGaWxlVXBkYXRlZCAoUkVRLVNTLTEwMylcbiAgICogUkVRLUFUVEFDSC0wMDU6IEJpbmFyeSBmaWxlIGRvd25sb2FkIHN1cHBvcnRcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsZVVwZGF0ZWQobWVzc2FnZTogeyB0eXBlOiAnZmlsZTp1cGRhdGVkJzsgZmlsZTogeyBpZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGNvbnRlbnQ/OiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9IH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IGZpbGUgfSA9IG1lc3NhZ2U7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcykgcmV0dXJuO1xuXG4gICAgLy8gUGhhc2UgNDogXHVDNzkwXHVBQzAwIG9yaWdpbiBcdUNDQjRcdUQwNkNcbiAgICBpZiAodGhpcy5pc1NlbGZPcmlnaW5hdGVkKGZpbGUuaWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZmlsZUlkXHVCODVDIFx1QUNCRFx1Qjg1QyBcdUM4NzBcdUQ2OENcbiAgICBjb25zdCBsb2NhbFBhdGggPSB0aGlzLmNhbGxiYWNrcy5nZXRQYXRoQnlGaWxlSWQoZmlsZS5pZCk7XG5cbiAgICBpZiAoIWxvY2FsUGF0aCkge1xuICAgICAgLy8gUkVRLVNTLTEwODogZmlsZUlkIFx1QjIwNFx1Qjc3RCBcdUMyREMgcmVzb2x1dGlvbiBcdUQwNTBcdUM1RDAgXHVDRDk0XHVBQzAwXG4gICAgICBpZiAodGhpcy5jYWxsYmFja3MucXVldWVSZXNvbHV0aW9uKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnF1ZXVlUmVzb2x1dGlvbihmaWxlLmlkLCBmaWxlLnBhdGgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1QUNCRFx1Qjg1QyBcdUMyMUNcdUQ2OEMgXHVCQzI5XHVDOUMwIChcdUJDRjRcdUM1NDggXHVDREU4XHVDNTdEXHVDODEwIFx1QzIxOFx1QzgxNSlcbiAgICBpZiAoIXRoaXMuaXNWYWxpZFZhdWx0UGF0aChsb2NhbFBhdGgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtoYW5kbGVGaWxlVXBkYXRlZF0gXHVDNzIwXHVENkE4XHVENTU4XHVDOUMwIFx1QzU0QVx1Qzc0MCBcdUFDQkRcdUI4NUM6ICR7bG9jYWxQYXRofWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFx1QkJGOFx1QzgwMFx1QzdBNSBcdUJDQzBcdUFDQkQgXHVDQ0I0XHVEMDZDXG4gICAgaWYgKHRoaXMuY2FsbGJhY2tzLmhhc1Vuc2F2ZWRDaGFuZ2VzICYmIHRoaXMuY2FsbGJhY2tzLmhhc1Vuc2F2ZWRDaGFuZ2VzKGxvY2FsUGF0aCkpIHtcbiAgICAgIC8vIFx1Q0RBOVx1QjNDQyBcdUMwRERcdUMxMzFcbiAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5vbkNvbmZsaWN0KSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uQ29uZmxpY3Qoe1xuICAgICAgICAgIHR5cGU6ICd1bnNhdmVkX2NoYW5nZXMnLFxuICAgICAgICAgIGZpbGVJZDogZmlsZS5pZCxcbiAgICAgICAgICBwYXRoOiBsb2NhbFBhdGgsXG4gICAgICAgICAgc2VydmVyQ29udGVudDogZmlsZS5jb250ZW50LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSRVEtQVRUQUNILTAwNTogXHVCQzE0XHVDNzc0XHVCMTA4XHVCOUFDIFx1RDMwQ1x1Qzc3QyBcdUNDOThcdUI5QUNcbiAgICBpZiAoaXNCaW5hcnlGaWxlKGxvY2FsUGF0aCkpIHtcbiAgICAgIHRoaXMuaGFuZGxlQmluYXJ5RmlsZVVwZGF0ZWQoZmlsZS5pZCwgbG9jYWxQYXRoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUQxNERcdUMyQTRcdUQyQjggXHVEMzBDXHVDNzdDIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOFxuICAgIHRyeSB7XG4gICAgICAvLyBcdUM1RDBcdUNGNTQgXHVCQzI5XHVDOUMwOiBcdUI4NUNcdUNFRUMgXHVDNEYwXHVBRTMwIFx1QzgwNCBcdUFDQkRcdUI4NUMgXHVCNEYxXHVCODVEXG4gICAgICB0aGlzLnN5bmNVcGRhdGVkUGF0aHMuYWRkKGxvY2FsUGF0aCk7XG5cbiAgICAgIGlmIChmaWxlLmNvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhd2FpdCB0aGlzLmNhbGxiYWNrcy5vbkZpbGVVcGRhdGUobG9jYWxQYXRoLCBmaWxlLmNvbnRlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29udGVudCBcdUM1QzZcdUM3M0NcdUJBNzQgUkVTVFx1Qjg1QyBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0RENcbiAgICAgICAgYXdhaXQgdGhpcy5kb3dubG9hZFNlcnZlckZpbGUoZmlsZS5pZCwgbG9jYWxQYXRoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgW2hhbmRsZUZpbGVVcGRhdGVkXSBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0REMgXHVDMkU0XHVEMzI4OiAke2xvY2FsUGF0aH1gLCBlcnJvcik7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5vbkVycm9yPy4oe1xuICAgICAgICBjYXRlZ29yeTogJ3N5bmMnLFxuICAgICAgICBjb2RlOiAnRE9XTkxPQURfRkFJTEVEJyxcbiAgICAgICAgbWVzc2FnZTogYFx1RDMwQ1x1Qzc3QyBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtsb2NhbFBhdGh9YCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSRVEtQVRUQUNILTAwNTogXHVCQzE0XHVDNzc0XHVCMTA4XHVCOUFDIFx1RDMwQ1x1Qzc3QyBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjggXHVDQzk4XHVCOUFDXG4gICAqIFJFU1QgR0VUXHVDNzNDXHVCODVDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUQ2QzQgXHVDRjVDXHVCQzMxXHVDNzNDXHVCODVDIFx1Qjg1Q1x1Q0VFQyBcdUM1QzVcdUIzNzBcdUM3NzRcdUQyQjhcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaGFuZGxlQmluYXJ5RmlsZVVwZGF0ZWQoZmlsZUlkOiBzdHJpbmcsIGxvY2FsUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcykgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFx1QzVEMFx1Q0Y1NCBcdUJDMjlcdUM5QzA6IFx1Qjg1Q1x1Q0VFQyBcdUM0RjBcdUFFMzAgXHVDODA0IFx1QUNCRFx1Qjg1QyBcdUI0RjFcdUI4NURcbiAgICAgIHRoaXMuc3luY1VwZGF0ZWRQYXRocy5hZGQobG9jYWxQYXRoKTtcblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZG93bmxvYWRCaW5hcnlGaWxlKGxvY2FsUGF0aCk7XG5cbiAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5vbkJpbmFyeUZpbGVVcGRhdGUpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3Mub25CaW5hcnlGaWxlVXBkYXRlKGxvY2FsUGF0aCwgZGF0YSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtoYW5kbGVCaW5hcnlGaWxlVXBkYXRlZF0gXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtsb2NhbFBhdGh9YCwgZXJyb3IpO1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25FcnJvcj8uKHtcbiAgICAgICAgY2F0ZWdvcnk6ICdzeW5jJyxcbiAgICAgICAgY29kZTogJ0JJTkFSWV9ET1dOTE9BRF9GQUlMRUQnLFxuICAgICAgICBtZXNzYWdlOiBgQmluYXJ5IGRvd25sb2FkIGZhaWxlZCBmb3IgJHtsb2NhbFBhdGh9YCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUMy41OiBoYW5kbGVGaWxlRGVsZXRlZCAoUkVRLVNTLTEwNClcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlRmlsZURlbGV0ZWQobWVzc2FnZTogeyB0eXBlOiAnZmlsZTpkZWxldGVkJzsgZmlsZUlkOiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgZmlsZUlkIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIFBoYXNlIDQ6IFx1Qzc5MFx1QUMwMCBvcmlnaW4gXHVDQ0I0XHVEMDZDXG4gICAgaWYgKHRoaXMuaXNTZWxmT3JpZ2luYXRlZChmaWxlSWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZmlsZUlkXHVCODVDIFx1QUNCRFx1Qjg1QyBcdUM4NzBcdUQ2OENcbiAgICBjb25zdCBsb2NhbFBhdGggPSB0aGlzLmNhbGxiYWNrcy5nZXRQYXRoQnlGaWxlSWQoZmlsZUlkKTtcblxuICAgIGlmICghbG9jYWxQYXRoKSB7XG4gICAgICAvLyBSRVEtU1MtMTA4OiBmaWxlSWQgXHVCMjA0XHVCNzdEIFx1QzJEQyByZXNvbHV0aW9uIFx1RDA1MFx1QzVEMCBcdUNEOTRcdUFDMDBcbiAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5xdWV1ZVJlc29sdXRpb24pIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MucXVldWVSZXNvbHV0aW9uKGZpbGVJZCwgdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUQzMENcdUM3N0MgXHVDMEFEXHVDODFDXG4gICAgdGhpcy5jYWxsYmFja3Mub25GaWxlRGVsZXRlKGxvY2FsUGF0aCk7XG5cbiAgICAvLyBcdUI5RTRcdUQ1NTEgXHVDODFDXHVBQzcwXG4gICAgdGhpcy5jYWxsYmFja3Mub25GaWxlSWRSZW1vdmUobG9jYWxQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUMy42OiBoYW5kbGVGaWxlUmVuYW1lZCAoUkVRLVNTLTEwNSlcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlRmlsZVJlbmFtZWQobWVzc2FnZTogeyB0eXBlOiAnZmlsZTpyZW5hbWVkJzsgZmlsZTogeyBpZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9IH0pOiB2b2lkIHtcbiAgICBjb25zdCB7IGZpbGUgfSA9IG1lc3NhZ2U7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcykgcmV0dXJuO1xuXG4gICAgLy8gUGhhc2UgNDogXHVDNzkwXHVBQzAwIG9yaWdpbiBcdUNDQjRcdUQwNkNcbiAgICBpZiAodGhpcy5pc1NlbGZPcmlnaW5hdGVkKGZpbGUuaWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHVDMTFDXHVCQzg0IFx1QUNCRFx1Qjg1Q1x1Qjk3QyBcdUI4NUNcdUNFRUMgXHVBQ0JEXHVCODVDXHVCODVDIFx1QkNDMFx1RDY1OFxuICAgIGNvbnN0IG5ld0xvY2FsUGF0aCA9IHRoaXMudG9Mb2NhbFBhdGgoZmlsZS5wYXRoKTtcblxuICAgIC8vIGZpbGVJZFx1Qjg1QyBcdUFFMzBcdUM4NzQgXHVBQ0JEXHVCODVDIFx1Qzg3MFx1RDY4Q1xuICAgIGNvbnN0IG9sZFBhdGggPSB0aGlzLmNhbGxiYWNrcy5nZXRQYXRoQnlGaWxlSWQoZmlsZS5pZCk7XG5cbiAgICBpZiAoIW9sZFBhdGgpIHtcbiAgICAgIC8vIFJFUS1TUy0xMDg6IGZpbGVJZCBcdUIyMDRcdUI3N0QgXHVDMkRDIHJlc29sdXRpb24gXHVEMDUwXHVDNUQwIFx1Q0Q5NFx1QUMwMFxuICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLnF1ZXVlUmVzb2x1dGlvbikge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcy5xdWV1ZVJlc29sdXRpb24oZmlsZS5pZCwgbmV3TG9jYWxQYXRoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUQzMENcdUM3N0MgXHVDNzc0XHVCOTg0IFx1QkNDMFx1QUNCRFxuICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZVJlbmFtZShvbGRQYXRoLCBuZXdMb2NhbFBhdGgpO1xuXG4gICAgLy8gXHVCOUU0XHVENTUxIFx1QzVDNVx1QjM3MFx1Qzc3NFx1RDJCOFxuICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkVXBkYXRlKG5ld0xvY2FsUGF0aCwgZmlsZS5pZCk7XG4gIH1cblxuICAvKipcbiAgICogVDMuNzogaGFuZGxlQ29uZmxpY3REZXRlY3RlZCAoUkVRLVNTLTEwNilcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlQ29uZmxpY3REZXRlY3RlZChtZXNzYWdlOiB7IHR5cGU6ICdjb25mbGljdDpkZXRlY3RlZCc7IGNvbmZsaWN0SWQ6IHN0cmluZzsgZmlsZUlkOiBzdHJpbmc7IGNsaWVudEhhc2g/OiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29uZmxpY3RJZCwgZmlsZUlkLCBjbGllbnRIYXNoIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIGZpbGVJZFx1Qjg1QyBcdUFDQkRcdUI4NUMgXHVDODcwXHVENjhDXG4gICAgY29uc3QgbG9jYWxQYXRoID0gdGhpcy5jYWxsYmFja3MuZ2V0UGF0aEJ5RmlsZUlkKGZpbGVJZCk7XG5cbiAgICBpZiAoIWxvY2FsUGF0aCkge1xuICAgICAgY29uc29sZS53YXJuKGBbU3luY1NlcnZpY2VdIENvbmZsaWN0IGRldGVjdGVkIGJ1dCBmaWxlSWQgbm90IGZvdW5kOiAke2ZpbGVJZH1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdUI4NUNcdUNFRUMgXHVCMEI0XHVDNkE5IFx1Qzc3RFx1QUUzMFxuICAgIGNvbnN0IGxvY2FsQ29udGVudCA9IHRoaXMuY2FsbGJhY2tzLnJlYWRGaWxlID8gdGhpcy5jYWxsYmFja3MucmVhZEZpbGUobG9jYWxQYXRoKSA6ICcnO1xuXG4gICAgLy8gXHVDREE5XHVCM0NDIFx1QzgxNVx1QkNGNCBcdUM4MDBcdUM3QTUgXHVCQzBGIFx1QzBBQ1x1QzZBOVx1Qzc5MCBcdUM1NENcdUI5QkNcbiAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Db25mbGljdCkge1xuICAgICAgdGhpcy5jYWxsYmFja3Mub25Db25mbGljdCh7XG4gICAgICAgIGNvbmZsaWN0SWQsXG4gICAgICAgIGZpbGVJZCxcbiAgICAgICAgcGF0aDogbG9jYWxQYXRoLFxuICAgICAgICBsb2NhbENvbnRlbnQsXG4gICAgICAgIGNsaWVudEhhc2gsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Ob3RpY2UpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uTm90aWNlKGBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDREE5XHVCM0NDOiAke2xvY2FsUGF0aH1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVDMuODogaGFuZGxlU3luY0Vycm9yIChSRVEtU1MtMTA3KVxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVTeW5jRXJyb3IobWVzc2FnZTogeyB0eXBlOiAnc3luYzplcnJvcic7IGNvZGU/OiBzdHJpbmc7IG1lc3NhZ2U/OiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29kZSwgbWVzc2FnZTogZXJyb3JNZXNzYWdlIH0gPSBtZXNzYWdlO1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIC8vIFwiRmlsZSBhbHJlYWR5IGV4aXN0c1wiIFx1MjAxNCBcdUM3NzRcdUJCRjggXHVCM0Q5XHVBRTMwXHVENjU0XHVCNDFDIFx1QzBDMVx1RDBEQywgXHVDNUQwXHVCN0VDIFx1QkIzNFx1QzJEQ1xuICAgIGlmIChlcnJvck1lc3NhZ2U/LmluY2x1ZGVzKCdhbHJlYWR5IGV4aXN0cycpKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW1N5bmNTZXJ2aWNlXSBcdUQzMENcdUM3N0MgXHVDNzc0XHVCQkY4IFx1Qzg3NFx1QzdBQyAoXHVCQjM0XHVDMkRDKTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHVDNUQwXHVCN0VDIFx1Q0U3NFx1RDE0Q1x1QUNFMFx1QjlBQyBcdUJEODRcdUI5NThcbiAgICBsZXQgY2F0ZWdvcnkgPSAnc2VydmVyJztcbiAgICBpZiAoY29kZSkge1xuICAgICAgaWYgKGNvZGUuc3RhcnRzV2l0aCgnQVVUSF8nKSkge1xuICAgICAgICBjYXRlZ29yeSA9ICdhdXRoJztcbiAgICAgIH0gZWxzZSBpZiAoY29kZS5zdGFydHNXaXRoKCdORVRXT1JLXycpKSB7XG4gICAgICAgIGNhdGVnb3J5ID0gJ25ldHdvcmsnO1xuICAgICAgfSBlbHNlIGlmIChjb2RlLnN0YXJ0c1dpdGgoJ1ZBTElEQVRJT05fJykpIHtcbiAgICAgICAgY2F0ZWdvcnkgPSAndmFsaWRhdGlvbic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHVBRDZDXHVDODcwXHVENjU0XHVCNDFDIFx1QzVEMFx1QjdFQyBcdUI4NUNcdUFERjhcbiAgICBjb25zb2xlLmVycm9yKGBbU3luY1NlcnZpY2VdIEVycm9yIFske2NhdGVnb3J5fV06ICR7Y29kZSB8fCAnVU5LTk9XTid9IFx1MjAxNCAke2Vycm9yTWVzc2FnZSB8fCAnTm8gbWVzc2FnZSd9YCk7XG5cbiAgICAvLyBcdUM1RDBcdUI3RUMgXHVDRjVDXHVCQzMxXG4gICAgaWYgKHRoaXMuY2FsbGJhY2tzLm9uRXJyb3IpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLm9uRXJyb3Ioe1xuICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgY29kZTogY29kZSB8fCAnVU5LTk9XTicsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBdXRoIFx1QzVEMFx1QjdFQzogXHVDN0FDXHVDNUYwXHVBQ0IwIFx1RDJCOFx1QjlBQ1x1QUM3MFxuICAgIGlmIChjYXRlZ29yeSA9PT0gJ2F1dGgnICYmIHRoaXMuY2FsbGJhY2tzLnRyaWdnZXJSZWNvbm5lY3QpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnRyaWdnZXJSZWNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0aW9uIFx1QzVEMFx1QjdFQzogXHVCM0Q5XHVBRTMwXHVENjU0IFx1Qzc3Q1x1QzJEQ1x1QzgxNVx1QzlDMFxuICAgIGlmIChjYXRlZ29yeSA9PT0gJ3ZhbGlkYXRpb24nKSB7XG4gICAgICB0aGlzLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFQzLjk6IGhhbmRsZVJlY29ubmVjdFJlc3BvbnNlIChSRVEtRkMtMTAyKVxuICAgKiBcdUMxMUNcdUJDODQgXHVEMzBDXHVDNzdDIFx1QkFBOVx1Qjg1RCBcdUM3NTFcdUIyRjUgXHVDQzk4XHVCOUFDXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZVJlY29ubmVjdFJlc3BvbnNlKG1lc3NhZ2U6IFN5bmNSZWNvbm5lY3RSZXNwb25zZU1lc3NhZ2UpOiB2b2lkIHtcbiAgICAvLyBcdUM3OTBcdUMyRTBcdUM3NTggXHVDMTFDXHVCQzg0IFx1RDMwQ1x1Qzc3Q1x1QjlDQyBcdUM5QzFcdUM4MTEgXHVDQzk4XHVCOUFDIChcdUNGNUNcdUJDMzEgXHVCRTBDXHVCODVDXHVCNERDXHVDRTkwXHVDMkE0XHVEMkI4IFx1QkMyOVx1QzlDMClcbiAgICB0aGlzLnBlcmZvcm1SZWNvbm5lY3RTeW5jKG1lc3NhZ2UucGF5bG9hZC5zZXJ2ZXJGaWxlcyk7XG4gIH1cblxuICAvKipcbiAgICogUGhhc2UgNDogXHVDNzkwXHVBQzAwIG9yaWdpbiBcdUQzMTBcdUJDQzQgKFJFUS1JUy0zMDEpXG4gICAqIEBNWDpBTkNIT1I6IFtBVVRPXSBcdUM3OTBcdUFDMDAgXHVCQ0MwXHVBQ0JEIFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUQ1NDRcdUQxMzBcdUI5QzFcbiAgICogQE1YOlJFQVNPTjogUkVRLUlTLTMwMSAtIEVjaG8gbG9vcCBcdUJDMjlcdUM5QzBcdUI5N0MgXHVDNzA0XHVENTVDIFx1Qzc5MFx1QUMwMCBvcmlnaW4gXHVBQzEwXHVDOUMwXG4gICAqL1xuICBwcml2YXRlIGlzU2VsZk9yaWdpbmF0ZWQoZmlsZUlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBwZW5kaW5nTWVzc2FnZXMgXHVDQ0I0XHVEMDZDXG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0aGlzLnBlbmRpbmdNZXNzYWdlcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKHZhbHVlLnBhdGggPT09IGZpbGVJZCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZWNlbnRseUFja25vd2xlZGdlZCBcdUNDQjRcdUQwNkNcbiAgICByZXR1cm4gdGhpcy5yZWNlbnRseUFja25vd2xlZGdlZC5oYXMoZmlsZUlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQaGFzZSA0OiBcdUNENUNcdUFERkMgXHVDMkI5XHVDNzc4XHVCNDFDIFx1QkE1NFx1QzJEQ1x1QzlDMCBcdUM4MTVcdUI5QUMgKDEwXHVDRDA4IFx1QUNCRFx1QUNGQylcbiAgICovXG4gIHByaXZhdGUgY2xlYW51cFJlY2VudGx5QWNrbm93bGVkZ2VkKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgZm9yIChjb25zdCBbZmlsZUlkLCB0aW1lc3RhbXBdIG9mIHRoaXMucmVjZW50bHlBY2tub3dsZWRnZWQuZW50cmllcygpKSB7XG4gICAgICBpZiAobm93IC0gdGltZXN0YW1wID4gdGhpcy5BQ0tfRVhQSVJZX01TKSB7XG4gICAgICAgIHRoaXMucmVjZW50bHlBY2tub3dsZWRnZWQuZGVsZXRlKGZpbGVJZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0MgXHVDNUM1XHVCODVDXHVCNERDIChSRVEtQVRUQUNILTAwMilcbiAgICovXG4gIGFzeW5jIHVwbG9hZEJpbmFyeUZpbGUoZmlsZVBhdGg6IHN0cmluZywgZGF0YTogQXJyYXlCdWZmZXIpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2VydmVyUGF0aCA9IHRoaXMudG9TZXJ2ZXJQYXRoKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucmVzdENsaWVudC51cGxvYWRCaW5hcnkoc2VydmVyUGF0aCwgZGF0YSk7XG4gICAgICBpZiAoIXJlc3VsdCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGNvbnN0IGZpbGVJZCA9IHJlc3VsdC5pZCA/PyBudWxsO1xuICAgICAgaWYgKGZpbGVJZCkge1xuICAgICAgICB0aGlzLnJlY2VudGx5QWNrbm93bGVkZ2VkLnNldChmaWxlSWQsIERhdGUubm93KCkpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrcz8ub25GaWxlSWRVcGRhdGUoZmlsZVBhdGgsIGZpbGVJZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsZUlkO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbdXBsb2FkQmluYXJ5RmlsZV0gXHVDNUM1XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtmaWxlUGF0aH1gLCBlcnJvcik7XG4gICAgICB0aGlzLmNhbGxiYWNrcz8ub25FcnJvcj8uKHtcbiAgICAgICAgY2F0ZWdvcnk6ICdzZXJ2ZXInLFxuICAgICAgICBjb2RlOiAnQklOQVJZX1VQTE9BRF9GQUlMRUQnLFxuICAgICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdCaW5hcnkgdXBsb2FkIGZhaWxlZCcsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUJDMTRcdUM3NzRcdUIxMDhcdUI5QUMgXHVEMzBDXHVDNzdDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyAoUkVRLUFUVEFDSC0wMDUpXG4gICAqL1xuICBhc3luYyBkb3dubG9hZEJpbmFyeUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICByZXR1cm4gdGhpcy5yZXN0Q2xpZW50LmRvd25sb2FkQmluYXJ5KGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM2MjRcdUQ1MDRcdUI3N0NcdUM3NzggXHVEMDUwIFx1RDUwQ1x1QjdFQ1x1QzJEQyBcdUJDMEYgXHVDNUYwXHVBQ0IwIFx1RDU3NFx1QzgxQyAoUkVRLUNXLTEwMywgUkVRLVVMLTIwMilcbiAgICogQHBhcmFtIHRpbWVvdXQgLSBcdUQ1MENcdUI3RUNcdUMyREMgXHVCMzAwXHVBRTMwIFx1Q0Q1Q1x1QjMwMCBcdUMyRENcdUFDMDQgKG1zKVxuICAgKi9cbiAgYXN5bmMgZmx1c2hBbmREaXNjb25uZWN0KHRpbWVvdXQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1QzVGMFx1QUNCMFx1QjQxQyBcdUMwQzFcdUQwRENcdUM1RDBcdUMxMUMgXHVEMDUwIFx1RDUwQ1x1QjdFQ1x1QzJEQyBcdUMyRENcdUIzQzRcbiAgICBpZiAodGhpcy53cyAmJiB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICBhd2FpdCB0aGlzLmZsdXNoUXVldWUoKTtcbiAgICB9XG5cbiAgICAvLyBcdUQwQzBcdUM3ODRcdUM1NDRcdUM2QzMgXHVBQ0JEXHVBQ0ZDIFx1QzJEQyBcdUIwQThcdUM3NDAgXHVCQTU0XHVDMkRDXHVDOUMwIFx1Qjg1Q1x1QURGOFxuICAgIGNvbnN0IHJlbWFpbmluZ01lc3NhZ2VzID0gYXdhaXQgdGhpcy5xdWV1ZS5zaXplKCk7XG4gICAgaWYgKHJlbWFpbmluZ01lc3NhZ2VzID4gMCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgW1N5bmNTZXJ2aWNlXSBmbHVzaEFuZERpc2Nvbm5lY3Q6ICR7cmVtYWluaW5nTWVzc2FnZXN9IG1lc3NhZ2VzIHVuc2VudCBhZnRlciAke3RpbWVvdXR9bXMgdGltZW91dGAsXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlYm91bmNlIFx1RDBDMFx1Qzc3NFx1QkEzOCBcdUM4MTVcdUI5QUMgKFJFUS1DVy0xMDMpXG4gICAqIFJFUS1GVi0xMjA6IFx1RDU3NFx1QzJEQyBcdUNFOTBcdUMyREMgXHVDODE1XHVCOUFDXG4gICAqL1xuICBjbGVhbnVwVGltZXJzKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgdGltZXIgb2YgdGhpcy5kZWJvdW5jZVRpbWVycy52YWx1ZXMoKSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5kZWJvdW5jZVRpbWVycy5jbGVhcigpO1xuICAgIHRoaXMubGFzdFNlbnRIYXNoLmNsZWFyKCk7IC8vIFJFUS1GVi0xMjA6IFx1RDU3NFx1QzJEQyBcdUNFOTBcdUMyREMgXHVDODE1XHVCOUFDXG4gIH1cblxuICAvKipcbiAgICogXHVDN0FDXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzJEQ1x1Qzc5MSAoUkVRLVJULTEwMSwgUkVRLVJULTEwMiwgUkVRLVJULTEwMylcbiAgICogXHVDNUYwXHVBQ0IwL1x1QzdBQ1x1QzVGMFx1QUNCMCBcdUMyREMgXHVDNzkwXHVCM0Q5IFx1RDYzOFx1Q0Q5Q1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBzdGFydFJlY29ubmVjdFN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNSZWNvbm5lY3RpbmcpIHJldHVybjtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzPy5jb2xsZWN0TG9jYWxGaWxlcykge1xuICAgICAgLy8gXHVDRjVDXHVCQzMxXHVDNzc0IFx1QzVDNlx1QzczQ1x1QkE3NCBcdUFFMzBcdUM4NzQgZmx1c2hRdWV1ZVx1QjlDQyBcdUMyMThcdUQ1ODlcbiAgICAgIGF3YWl0IHRoaXMuZmx1c2hRdWV1ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNSZWNvbm5lY3RpbmcgPSB0cnVlO1xuICAgIHRoaXMuc2V0U3RhdGUoJ3N5bmNpbmcnKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBcdUM5QzRcdUQ1ODlcdUI5NjAgXHVENDVDXHVDMkRDIChSRVEtVUktMTAxKVxuICAgICAgdGhpcy5jYWxsYmFja3Muc2hvd1N0YXR1c0Jhcj8uKCdcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOTAwXHVCRTQ0IFx1QzkxMS4uLicpO1xuXG4gICAgICAvLyAxLiBcdUI4NUNcdUNFRUMgXHVEMzBDXHVDNzdDIFx1QkFBOVx1Qjg1RCBcdUMyMThcdUM5RDEgKFJFUS1GQy0xMDEpXG4gICAgICBjb25zdCBsb2NhbEZpbGVzID0gYXdhaXQgdGhpcy5jYWxsYmFja3MuY29sbGVjdExvY2FsRmlsZXMoKTtcblxuICAgICAgLy8gMi4gXHVDMTFDXHVCQzg0XHVDNUQwIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM2OTRcdUNDQUQgKFJFUS1GQy0xMDIpXG4gICAgICB0aGlzLnNlbmRTeW5jUmVjb25uZWN0KGxvY2FsRmlsZXMpO1xuXG4gICAgICAvLyBmbHVzaFF1ZXVlXHVCMjk0IFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUM2NDRcdUI4Q0MgXHVENkM0IFx1QzIxOFx1RDU4OVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbUmVjb25uZWN0U3luY10gXHVDMkRDXHVDNzkxIFx1QzJFNFx1RDMyODonLCBlcnJvcik7XG4gICAgICB0aGlzLmlzUmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnNldFN0YXRlKCdjb25uZWN0ZWQnKTtcbiAgICAgIGF3YWl0IHRoaXMuZmx1c2hRdWV1ZSgpO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrcy5vbkVycm9yPy4oe1xuICAgICAgICBjYXRlZ29yeTogJ3N5bmMnLFxuICAgICAgICBjb2RlOiAnUkVDT05ORUNUX1NZTkNfRkFJTEVEJyxcbiAgICAgICAgbWVzc2FnZTogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnUmVjb25uZWN0IHN5bmMgZmFpbGVkJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDNzUxXHVCMkY1IFx1Q0M5OFx1QjlBQyBcdUQ2QzQgXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzIxOFx1RDU4OSAoUkVRLUZDLTEwMylcbiAgICogXHVDMTFDXHVCQzg0IFx1RDMwQ1x1Qzc3QyBcdUJBQTlcdUI4NURcdUM3NDQgXHVCQzFCXHVDNTQ0IFx1Qjg1Q1x1Q0VFQ1x1QUNGQyBcdUJFNDRcdUFENTBcdUQ1NThcdUM1RUMgXHVDNUM1XHVCODVDXHVCNERDL1x1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQy9cdUNEQTlcdUIzQ0MgXHVENTc0XHVBQ0IwXG4gICAqIFQtMDEyOiBcdUM3N0NcdUFEMDQgXHVDREE5XHVCM0NDIFx1RDU3NFx1QUNCMCBcdUM5QzBcdUM2RDBcbiAgICovXG4gIGFzeW5jIHBlcmZvcm1SZWNvbm5lY3RTeW5jKFxuICAgIHNlcnZlckZpbGVzOiBBcnJheTx7IGZpbGVJZDogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGN1cnJlbnRIYXNoOiBzdHJpbmc7IHVwZGF0ZWRBdD86IHN0cmluZzsgYWN0aW9uPzogJ2Rvd25sb2FkJyB8ICd1cGxvYWQnIHwgJ2NvbmZsaWN0JyB9PixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmNhbGxiYWNrcykgcmV0dXJuO1xuXG4gICAgLy8gXHVEM0Y0XHVCMzU0IFx1QjlFNFx1RDU1MVx1Qzc3NCBcdUM3ODhcdUM3M0NcdUJBNzQgXHVENTc0XHVCMkY5IFx1RDNGNFx1QjM1NCBcdUQ1NThcdUM3MDQgXHVEMzBDXHVDNzdDXHVCOUNDIFx1QkU0NFx1QUQ1MFxuICAgIGNvbnN0IGFsbExvY2FsRmlsZXMgPSBhd2FpdCB0aGlzLmNhbGxiYWNrcy5jb2xsZWN0TG9jYWxGaWxlcz8uKCkgPz8gW107XG4gICAgY29uc3QgbG9jYWxGaWxlcyA9IHRoaXMuZm9sZGVyUHJlZml4XG4gICAgICA/IGFsbExvY2FsRmlsZXMuZmlsdGVyKGYgPT4gZi5wYXRoLnN0YXJ0c1dpdGgodGhpcy5mb2xkZXJQcmVmaXggKyAnLycpKVxuICAgICAgOiBhbGxMb2NhbEZpbGVzO1xuICAgIGNvbnN0IGxvY2FsTWFwID0gbmV3IE1hcChsb2NhbEZpbGVzLm1hcChmID0+IFtmLnBhdGgsIGYuaGFzaF0pKTtcbiAgICBjb25zdCBzZXJ2ZXJNYXAgPSBuZXcgTWFwKHNlcnZlckZpbGVzLm1hcChmID0+IFt0aGlzLnRvTG9jYWxQYXRoKGYucGF0aC5yZXBsYWNlKC9eXFwvLywgJycpKSwgZl0pKTtcblxuICAgIGxldCB1cGxvYWRlZCA9IDA7XG4gICAgbGV0IGRvd25sb2FkZWQgPSAwO1xuICAgIGxldCBjb25mbGljdHMgPSAwO1xuICAgIGxldCB1c2VyU2tpcHBlZENvbmZsaWN0cyA9IGZhbHNlO1xuICAgIGNvbnN0IHRvdGFsRmlsZXMgPSBsb2NhbEZpbGVzLmxlbmd0aCArIHNlcnZlckZpbGVzLmZpbHRlcihzZiA9PiAhbG9jYWxNYXAuaGFzKHNmLnBhdGgpKS5sZW5ndGg7XG4gICAgbGV0IHByb2Nlc3NlZCA9IDA7XG5cbiAgICAvLyBULTAxMjogXHVDREE5XHVCM0NDIFx1QzIxOFx1QzlEMSBcdUJDMzBcdUM1RjQgKFx1Qzc3Q1x1QUQwNCBcdUNDOThcdUI5QUNcdUI5N0MgXHVDNzA0XHVENTc0IFx1QkEzQ1x1QzgwMCBcdUJBQThcdUI0RTAgXHVDREE5XHVCM0NDXHVDNzQ0IFx1QzIxOFx1QzlEMSlcbiAgICBjb25zdCBjb25mbGljdEFycmF5OiBDb25mbGljdEluZm9bXSA9IFtdO1xuXG4gICAgLy8gXHVCODVDXHVDRUVDIFx1QzgwNFx1QzZBOSBcdUQzMENcdUM3N0MgXHVDMjE4XHVDOUQxIChTUEVDLVNZTkMtMDAzKVxuICAgIGNvbnN0IGxvY2FsT25seUZpbGVzOiBMb2NhbEZpbGVBcHByb3ZhbFtdID0gW107XG4gICAgZm9yIChjb25zdCBsb2NhbEZpbGUgb2YgbG9jYWxGaWxlcykge1xuICAgICAgaWYgKCFzZXJ2ZXJNYXAuaGFzKGxvY2FsRmlsZS5wYXRoKSkge1xuICAgICAgICAvLyBUU0RvYyBcdUQxQjVcdUFDQzRcdUM1RDBcdUMxMUMgXHVEMzBDXHVDNzdDIFx1QzgxNVx1QkNGNCBcdUMyMThcdUM5RDFcbiAgICAgICAgY29uc3QgYmFzZW5hbWUgPSBsb2NhbEZpbGUucGF0aC5zcGxpdCgnLycpLnBvcCgpIHx8IGxvY2FsRmlsZS5wYXRoO1xuICAgICAgICBjb25zdCBmb2xkZXIgPSBsb2NhbEZpbGUucGF0aC5zdWJzdHJpbmcoMCwgbG9jYWxGaWxlLnBhdGgubGFzdEluZGV4T2YoJy8nKSkgfHwgJy8nO1xuICAgICAgICBjb25zdCBzdGF0ID0gdGhpcy5jYWxsYmFja3MuZ2V0RmlsZVN0YXRcbiAgICAgICAgICA/IGF3YWl0IHRoaXMuY2FsbGJhY2tzLmdldEZpbGVTdGF0KGxvY2FsRmlsZS5wYXRoKVxuICAgICAgICAgIDogeyBzaXplOiAwLCBtdGltZTogRGF0ZS5ub3coKSB9O1xuXG4gICAgICAgIGxvY2FsT25seUZpbGVzLnB1c2goe1xuICAgICAgICAgIHBhdGg6IGxvY2FsRmlsZS5wYXRoLFxuICAgICAgICAgIGJhc2VuYW1lLFxuICAgICAgICAgIGZvbGRlcixcbiAgICAgICAgICBzaXplOiBzdGF0LnNpemUsXG4gICAgICAgICAgbXRpbWU6IHN0YXQubXRpbWUsXG4gICAgICAgICAgaXNCaW5hcnk6IGlzQmluYXJ5RmlsZShsb2NhbEZpbGUucGF0aCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1Qjg1Q1x1Q0VFQyBcdUM4MDRcdUM2QTkgXHVEMzBDXHVDNzdDIFx1QzJCOVx1Qzc3OCBcdUNDOThcdUI5QUMgKFNQRUMtU1lOQy0wMDMpXG4gICAgaWYgKGxvY2FsT25seUZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5hcHByb3ZlTG9jYWxVcGxvYWRzKSB7XG4gICAgICAgIC8vIFx1QzJCOVx1Qzc3OCBcdUJBQThcdUIyRUMgXHVENDVDXHVDMkRDXG4gICAgICAgIGNvbnN0IGFjdGlvbk1hcCA9IGF3YWl0IHRoaXMuY2FsbGJhY2tzLmFwcHJvdmVMb2NhbFVwbG9hZHMobG9jYWxPbmx5RmlsZXMpO1xuXG4gICAgICAgIC8vIFx1QzBBQ1x1QzZBOVx1Qzc5MFx1QUMwMCBcdUNERThcdUMxOENcdUQ1NUMgXHVBQ0JEXHVDNkIwIChcdUJFNDggTWFwKVxuICAgICAgICBpZiAoYWN0aW9uTWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW1JlY29ubmVjdFN5bmNdIFx1QzBBQ1x1QzZBOVx1Qzc5MFx1QUMwMCBcdUI4NUNcdUNFRUMgXHVDODA0XHVDNkE5IFx1RDMwQ1x1Qzc3QyBcdUNDOThcdUI5QUNcdUI5N0MgXHVDREU4XHVDMThDXHVENTY4Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHVDNTYxXHVDMTU4XHVDNUQwIFx1QjUzMFx1Qjc3QyBcdUNDOThcdUI5QUNcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbG9jYWxPbmx5RmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbk1hcC5nZXQoZmlsZS5wYXRoKTtcbiAgICAgICAgICAgIGlmICghYWN0aW9uIHx8IGFjdGlvbiA9PT0gTG9jYWxGaWxlQWN0aW9uLlNraXApIHtcbiAgICAgICAgICAgICAgLy8gXHVBQzc0XHVCMTA4XHVCNkYwXHVBRTMwOiBcdUM1NDRcdUJCMzRcdUFDODNcdUIzQzQgXHVENTU4XHVDOUMwIFx1QzU0QVx1Qzc0Q1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gTG9jYWxGaWxlQWN0aW9uLkRlbGV0ZSkge1xuICAgICAgICAgICAgICAgIC8vIFx1QzBBRFx1QzgxQzogdmF1bHQudHJhc2ggXHVDMEFDXHVDNkE5XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLnRyYXNoRmlsZSkge1xuICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3MudHJhc2hGaWxlKGZpbGUucGF0aCk7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1JlY29ubmVjdFN5bmNdIFx1Qjg1Q1x1Q0VFQyBcdUM4MDRcdUM2QTkgXHVEMzBDXHVDNzdDIFx1QzBBRFx1QzgxQzogJHtmaWxlLnBhdGh9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gTG9jYWxGaWxlQWN0aW9uLlVwbG9hZCkge1xuICAgICAgICAgICAgICAgIC8vIFx1QzVDNVx1Qjg1Q1x1QjREQzogXHVBRTMwXHVDODc0IFx1Qjg1Q1x1QzlDMSBcdUMyMThcdUQ1ODlcbiAgICAgICAgICAgICAgICBpZiAoZmlsZS5pc0JpbmFyeSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuY2FsbGJhY2tzLnJlYWRCaW5hcnlGaWxlQXN5bmNcbiAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCB0aGlzLmNhbGxiYWNrcy5yZWFkQmluYXJ5RmlsZUFzeW5jKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgQXJyYXlCdWZmZXIoMCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YS5ieXRlTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnVwbG9hZEJpbmFyeUZpbGUoZmlsZS5wYXRoLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkZWQrKztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuY2FsbGJhY2tzLnJlYWRGaWxlQXN5bmNcbiAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCB0aGlzLmNhbGxiYWNrcy5yZWFkRmlsZUFzeW5jKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZEZpbGVDcmVhdGUoZmlsZS5wYXRoLCBjb250ZW50KTtcbiAgICAgICAgICAgICAgICAgIHVwbG9hZGVkKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gXHVCODVDXHVDRUVDIFx1QzgwNFx1QzZBOSBcdUQzMENcdUM3N0MgXHVDQzk4XHVCOUFDIFx1QzJFNFx1RDMyODogJHtmaWxlLnBhdGh9YCwgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gXHVDRjVDXHVCQzMxXHVDNzc0IFx1QzVDNlx1QjI5NCBcdUFDQkRcdUM2QjA6IFx1QUUzMFx1Qzg3NCBcdUM3OTBcdUIzRDkgXHVDNUM1XHVCODVDXHVCNERDIFx1QjNEOVx1Qzc5MSAoXHVENTU4XHVDNzA0IFx1RDYzOFx1RDY1OFx1QzEzMSlcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGxvY2FsT25seUZpbGVzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmaWxlLmlzQmluYXJ5KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmNhbGxiYWNrcy5yZWFkQmluYXJ5RmlsZUFzeW5jXG4gICAgICAgICAgICAgICAgPyBhd2FpdCB0aGlzLmNhbGxiYWNrcy5yZWFkQmluYXJ5RmlsZUFzeW5jKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICA6IG5ldyBBcnJheUJ1ZmZlcigwKTtcbiAgICAgICAgICAgICAgaWYgKGRhdGEuYnl0ZUxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnVwbG9hZEJpbmFyeUZpbGUoZmlsZS5wYXRoLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB1cGxvYWRlZCsrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jYWxsYmFja3MucmVhZEZpbGVBc3luY1xuICAgICAgICAgICAgICAgID8gYXdhaXQgdGhpcy5jYWxsYmFja3MucmVhZEZpbGVBc3luYyhmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgICAgdGhpcy5zZW5kRmlsZUNyZWF0ZShmaWxlLnBhdGgsIGNvbnRlbnQpO1xuICAgICAgICAgICAgICB1cGxvYWRlZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gXHVDNUM1XHVCODVDXHVCNERDIFx1QzJFNFx1RDMyODogJHtmaWxlLnBhdGh9YCwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFx1QzU5MVx1Q0FCRFx1QzVEMCBcdUM4NzRcdUM3QUNcdUQ1NThcdUIyOTQgXHVEMzBDXHVDNzdDIFx1Q0M5OFx1QjlBQyAoUkVRLUZDLTIwMSlcbiAgICBmb3IgKGNvbnN0IGxvY2FsRmlsZSBvZiBsb2NhbEZpbGVzKSB7XG4gICAgICBpZiAoc2VydmVyTWFwLmhhcyhsb2NhbEZpbGUucGF0aCkpIHtcbiAgICAgICAgY29uc3Qgc2VydmVyRmlsZSA9IHNlcnZlck1hcC5nZXQobG9jYWxGaWxlLnBhdGgpITtcbiAgICAgICAgLy8gXHVDREE5XHVCM0NDIFx1RDMwQ1x1Qzc3Q1x1QjNDNCBmaWxlSWQgXHVCOUU0XHVENTUxIFx1RDY1NVx1QjlCRFxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5vbkZpbGVJZFVwZGF0ZShsb2NhbEZpbGUucGF0aCwgc2VydmVyRmlsZS5maWxlSWQpO1xuICAgICAgICBpZiAobG9jYWxGaWxlLmhhc2ggIT09IHNlcnZlckZpbGUuY3VycmVudEhhc2gpIHtcbiAgICAgICAgICAvLyBTUEVDLVNZTkMtMDA1OiBhY3Rpb24gXHVENTQ0XHVCNERDXHVCODVDIFx1Qzc5MFx1QjNEOSBcdUNDOThcdUI5QUMgXHVDNUVDXHVCRDgwIFx1QUNCMFx1QzgxNVxuICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IChzZXJ2ZXJGaWxlIGFzIGFueSkuYWN0aW9uIGFzICdkb3dubG9hZCcgfCAndXBsb2FkJyB8ICdjb25mbGljdCcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICBpZiAoYWN0aW9uID09PSAnZG93bmxvYWQnKSB7XG4gICAgICAgICAgICAvLyBcdUM3OTBcdUIzRDkgXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDOiBcdUJBQThcdUIyRUMgXHVDNUM2XHVDNzc0IFx1QzExQ1x1QkM4NCBcdUJDODRcdUM4MDQgXHVDODAxXHVDNkE5XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5yZXN0Q2xpZW50LmRvd25sb2FkRmlsZShzZXJ2ZXJGaWxlLmZpbGVJZCk7XG4gICAgICAgICAgICAgIGNvbnN0IHNlcnZlckNvbnRlbnQgPSBkYXRhLmNvbnRlbnQgPz8gJyc7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNhbGxiYWNrcy5vbkZpbGVVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNhbGxiYWNrcy5vbkZpbGVVcGRhdGUobG9jYWxGaWxlLnBhdGgsIHNlcnZlckNvbnRlbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGRvd25sb2FkZWQrKztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gYXV0b19kb3dubG9hZCBcdUMyRTRcdUQzMjg6ICR7bG9jYWxGaWxlLnBhdGh9YCwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwbG9hZCcpIHtcbiAgICAgICAgICAgIC8vIFx1Qzc5MFx1QjNEOSBcdUM1QzVcdUI4NUNcdUI0REM6IFx1QkFBOFx1QjJFQyBcdUM1QzZcdUM3NzQgXHVCODVDXHVDRUVDIFx1QkM4NFx1QzgwNCBcdUMxMUNcdUJDODRcdUM1RDAgXHVDODA0XHVDMUExXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jYWxsYmFja3MucmVhZEZpbGVBc3luY1xuICAgICAgICAgICAgICAgID8gYXdhaXQgdGhpcy5jYWxsYmFja3MucmVhZEZpbGVBc3luYyhsb2NhbEZpbGUucGF0aClcbiAgICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgICB0aGlzLnNlbmRPclF1ZXVlKCdmaWxlOnVwZGF0ZScsIHsgZmlsZUlkOiBzZXJ2ZXJGaWxlLmZpbGVJZCwgcGF0aDogc2VydmVyRmlsZS5wYXRoLCBjb250ZW50IH0pO1xuICAgICAgICAgICAgICB1cGxvYWRlZCsrO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtSZWNvbm5lY3RTeW5jXSBhdXRvX3VwbG9hZCBcdUMyRTRcdUQzMjg6ICR7bG9jYWxGaWxlLnBhdGh9YCwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYWN0aW9uOiAnY29uZmxpY3QnIFx1QjYxMFx1QjI5NCBcdUM1QzZcdUM3NEMgXHUyMTkyIFx1QUUzMFx1Qzg3NCBcdUJBQThcdUIyRUMgXHVCM0Q5XHVDNzkxIChcdUQ1NThcdUM3MDQgXHVENjM4XHVENjU4KVxuICAgICAgICAgICAgLy8gVC0wMTI6IFx1Q0RBOVx1QjNDQ1x1Qzc0NCBcdUJDMzBcdUM1RjRcdUM1RDAgXHVDRDk0XHVBQzAwIChcdUM5ODlcdUMyREMgXHVENTc0XHVBQ0IwXHVENTU4XHVDOUMwIFx1QzU0QVx1Qzc0QylcbiAgICAgICAgICAgIGNvbmZsaWN0QXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgIGNvbmZsaWN0SWQ6IHNlcnZlckZpbGUuZmlsZUlkLFxuICAgICAgICAgICAgICBwYXRoOiBsb2NhbEZpbGUucGF0aCxcbiAgICAgICAgICAgICAgbG9jYWxTaXplOiBsb2NhbEZpbGUucGF0aC5sZW5ndGgsXG4gICAgICAgICAgICAgIHNlcnZlclNpemU6IHNlcnZlckZpbGUuY3VycmVudEhhc2gubGVuZ3RoLFxuICAgICAgICAgICAgICBzZXJ2ZXJDb250ZW50OiAnJyxcbiAgICAgICAgICAgICAgbG9jYWxDb250ZW50OiAnJyxcbiAgICAgICAgICAgICAgc2VsZWN0ZWRWZXJzaW9uOiAnc2VydmVyJyxcbiAgICAgICAgICAgICAgc2VydmVyVXBkYXRlZEF0OiBzZXJ2ZXJGaWxlLnVwZGF0ZWRBdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHJvY2Vzc2VkKys7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zaG93U3RhdHVzQmFyPy4oYFx1QjNEOVx1QUUzMFx1RDY1NCBcdUM5MTEuLi4gKCR7cHJvY2Vzc2VkfS8ke3RvdGFsRmlsZXN9KWApO1xuICAgIH1cblxuICAgIC8vIFQtMDEyOiBcdUNEQTlcdUIzQ0NcdUM3NzQgXHVDNzg4XHVCMjk0IFx1QUNCRFx1QzZCMCBcdUM3N0NcdUFEMDQgXHVENTc0XHVBQ0IwIFx1QkFBOFx1QjJFQyBcdUQ0NUNcdUMyRENcbiAgICBpZiAoY29uZmxpY3RBcnJheS5sZW5ndGggPiAwICYmIHRoaXMuY2FsbGJhY2tzLnJlc29sdmVDb25mbGljdHMpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNob3dTdGF0dXNCYXI/LihgXHVDREE5XHVCM0NDIFx1QkQ4NFx1QzExRCBcdUM5MTEuLi5gKTtcblxuICAgICAgLy8gXHVCQ0QxXHVCODJDXHVCODVDIFx1QzExQ1x1QkM4NCBcdUIwQjRcdUM2QTkgXHVBQzAwXHVDODM4XHVDNjI0XHVBRTMwXG4gICAgICBjb25zdCBjb25mbGljdHNXaXRoQ29udGVudCA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBjb25mbGljdEFycmF5Lm1hcChhc3luYyAoY29uZmxpY3QpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gXHVCODVDXHVDRUVDIFx1QjBCNFx1QzZBOSBcdUM3N0RcdUFFMzBcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQ29udGVudCA9IHRoaXMuY2FsbGJhY2tzPy5yZWFkRmlsZUFzeW5jICE9IG51bGxcbiAgICAgICAgICAgICAgPyBhd2FpdCB0aGlzLmNhbGxiYWNrcyEucmVhZEZpbGVBc3luYyhjb25mbGljdC5wYXRoKVxuICAgICAgICAgICAgICA6ICcnO1xuXG4gICAgICAgICAgICAvLyBcdUMxMUNcdUJDODQgXHVCMEI0XHVDNkE5IFx1QUMwMFx1QzgzOFx1QzYyNFx1QUUzMCAoUkVTVCBBUEkpXG4gICAgICAgICAgICBsZXQgc2VydmVyQ29udGVudCA9ICcnO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMucmVzdENsaWVudC5kb3dubG9hZEZpbGUoY29uZmxpY3QuY29uZmxpY3RJZCk7XG4gICAgICAgICAgICAgIHNlcnZlckNvbnRlbnQgPSBkYXRhLmNvbnRlbnQgPz8gJyc7XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgLy8gXHVDMTFDXHVCQzg0IFx1QjBCNFx1QzZBOSBcdUM4NzBcdUQ2OEMgXHVDMkU0XHVEMzI4IFx1QzJEQyBcdUJFNDggXHVCQjM4XHVDNzkwXHVDNUY0IFx1QzBBQ1x1QzZBOVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAuLi5jb25mbGljdCxcbiAgICAgICAgICAgICAgbG9jYWxDb250ZW50LFxuICAgICAgICAgICAgICBzZXJ2ZXJDb250ZW50LFxuICAgICAgICAgICAgICBsb2NhbFNpemU6IGxvY2FsQ29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgIHNlcnZlclNpemU6IHNlcnZlckNvbnRlbnQubGVuZ3RoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW1JlY29ubmVjdFN5bmNdIFx1Q0RBOVx1QjNDQyBcdUIwQjRcdUM2QTkgXHVBQzAwXHVDODM4XHVDNjI0XHVBRTMwIFx1QzJFNFx1RDMyODogJHtjb25mbGljdC5wYXRofWAsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBjb25mbGljdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgICAgLy8gXHVDNzdDXHVBRDA0IFx1RDU3NFx1QUNCMCBcdUJBQThcdUIyRUMgXHVENDVDXHVDMkRDXG4gICAgICBsZXQgcmVzb2x2ZWRDb25mbGljdHM6IENvbmZsaWN0SW5mb1tdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZWRDb25mbGljdHMgPSBhd2FpdCB0aGlzLmNhbGxiYWNrcy5yZXNvbHZlQ29uZmxpY3RzKGNvbmZsaWN0c1dpdGhDb250ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIFx1QzBBQ1x1QzZBOVx1Qzc5MFx1QUMwMCBcdUNERThcdUMxOENcdUQ1NUMgXHVBQ0JEXHVDNkIwIFx1Q0RBOVx1QjNDQyBcdUQ1NzRcdUFDQjBcdUM3NDQgXHVBQzc0XHVCMTA4XHVCNkYwXHVBQ0UwIFx1QzExQ1x1QkM4NCBcdUM4MDRcdUM2QTkgXHVEMzBDXHVDNzdDXHVCOUNDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUM5QzRcdUQ1ODlcbiAgICAgICAgY29uc29sZS5sb2coJ1tSZWNvbm5lY3RTeW5jXSBcdUMwQUNcdUM2QTlcdUM3OTBcdUFDMDAgXHVDREE5XHVCM0NDIFx1RDU3NFx1QUNCMFx1Qzc0NCBcdUFDNzRcdUIxMDhcdUI3MDAnKTtcbiAgICAgICAgdXNlclNraXBwZWRDb25mbGljdHMgPSB0cnVlO1xuICAgICAgICBjb25mbGljdHMgPSBjb25mbGljdEFycmF5Lmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZWRDb25mbGljdHMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gXHVENTc0XHVBQ0IwIFx1QUNCMFx1QUNGQyBcdUM4MDFcdUM2QTlcbiAgICAgIGZvciAoY29uc3QgY29uZmxpY3Qgb2YgcmVzb2x2ZWRDb25mbGljdHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoY29uZmxpY3Quc2VsZWN0ZWRWZXJzaW9uID09PSAnbG9jYWwnKSB7XG4gICAgICAgICAgICAvLyBcdUI4NUNcdUNFRUMgXHVCQzg0XHVDODA0IFx1QzcyMFx1QzlDMDogXHVDMTFDXHVCQzg0XHVCODVDIFx1QzVDNVx1Qjg1Q1x1QjREQ1xuICAgICAgICAgICAgdGhpcy5zZW5kT3JRdWV1ZSgnZmlsZTp1cGRhdGUnLCB7XG4gICAgICAgICAgICAgIGZpbGVJZDogY29uZmxpY3QuY29uZmxpY3RJZCxcbiAgICAgICAgICAgICAgcGF0aDogY29uZmxpY3QucGF0aCxcbiAgICAgICAgICAgICAgY29udGVudDogY29uZmxpY3QubG9jYWxDb250ZW50LFxuICAgICAgICAgICAgICBoYXNoOiAnJyxcbiAgICAgICAgICAgICAgcmVzb2x2ZUNvbmZsaWN0OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB1cGxvYWRlZCsrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBcdUMxMUNcdUJDODQgXHVCQzg0XHVDODA0IFx1QzcyMFx1QzlDMDogXHVCODVDXHVDRUVDXHVDNUQwIFx1QjM2RVx1QzVCNFx1QzRGMFx1QUUzMFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3Mub25GaWxlVXBkYXRlPy4oY29uZmxpY3QucGF0aCwgY29uZmxpY3Quc2VydmVyQ29udGVudCk7XG4gICAgICAgICAgICAvLyBcdUMxMUNcdUJDODQgXHVDRTIxIFx1QkJGOFx1RDU3NFx1QUNCMCBjb25mbGljdFx1QjNDNCBrZWVwX3NlcnZlclx1Qjg1QyBcdUQ1NzRcdUFDQjBcbiAgICAgICAgICAgIHRoaXMuc2VuZE9yUXVldWUoJ2ZpbGU6dXBkYXRlJywge1xuICAgICAgICAgICAgICBmaWxlSWQ6IGNvbmZsaWN0LmNvbmZsaWN0SWQsXG4gICAgICAgICAgICAgIHJlc29sdmVDb25mbGljdDogdHJ1ZSxcbiAgICAgICAgICAgICAgcmVzb2x2ZVN0cmF0ZWd5OiAna2VlcF9zZXJ2ZXInLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkb3dubG9hZGVkKys7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtSZWNvbm5lY3RTeW5jXSBcdUNEQTlcdUIzQ0MgXHVENTc0XHVBQ0IwIFx1QzgwMVx1QzZBOSBcdUMyRTRcdUQzMjg6ICR7Y29uZmxpY3QucGF0aH1gLCBlcnJvcik7XG4gICAgICAgICAgY29uZmxpY3RzKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNvbmZsaWN0QXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgLy8gcmVzb2x2ZUNvbmZsaWN0cyBcdUNGNUNcdUJDMzFcdUM3NzQgXHVDNUM2XHVCMjk0IFx1QUNCRFx1QzZCMCBcdUFFMzBcdUM4NzQgXHVCQzI5XHVDMkREXHVDNzNDXHVCODVDIFx1Q0M5OFx1QjlBQ1xuICAgICAgY29uZmxpY3RzID0gY29uZmxpY3RBcnJheS5sZW5ndGg7XG4gICAgICBpZiAodGhpcy5jYWxsYmFja3Mub25Db25mbGljdCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbmZsaWN0IG9mIGNvbmZsaWN0QXJyYXkpIHtcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vbkNvbmZsaWN0KHsgdHlwZTogJ3JlY29ubmVjdF9jb25mbGljdCcsIC4uLmNvbmZsaWN0IH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gXHVDMTFDXHVCQzg0IFx1QzgwNFx1QzZBOSBcdUQzMENcdUM3N0MgXHUyMTkyIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyAoUkVRLUZTLTEwMilcbiAgICBmb3IgKGNvbnN0IHNlcnZlckZpbGUgb2Ygc2VydmVyRmlsZXMpIHtcbiAgICAgIGNvbnN0IHNlcnZlckZpbGVQYXRoID0gc2VydmVyRmlsZS5wYXRoLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHRoaXMudG9Mb2NhbFBhdGgoc2VydmVyRmlsZVBhdGgpO1xuICAgICAgaWYgKCFsb2NhbE1hcC5oYXMobm9ybWFsaXplZFBhdGgpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gZmlsZUlkIFx1QjlFNFx1RDU1MSBcdUM4MDBcdUM3QTUgXHVENkM0IFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQ1xuICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uRmlsZUlkVXBkYXRlKG5vcm1hbGl6ZWRQYXRoLCBzZXJ2ZXJGaWxlLmZpbGVJZCk7XG5cbiAgICAgICAgICBpZiAoaXNCaW5hcnlGaWxlKG5vcm1hbGl6ZWRQYXRoKSkge1xuICAgICAgICAgICAgLy8gUkVRLUFUVEFDSC0wMDU6IFx1QkMxNFx1Qzc3NFx1QjEwOFx1QjlBQyBcdUQzMENcdUM3N0MgUkVTVCBcdUIyRTRcdUM2QjRcdUI4NUNcdUI0RENcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmRvd25sb2FkQmluYXJ5RmlsZShub3JtYWxpemVkUGF0aCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZVBhcmVudEZvbGRlcihub3JtYWxpemVkUGF0aCk7XG4gICAgICAgICAgICBpZiAodGhpcy5jYWxsYmFja3Mub25CaW5hcnlGaWxlQ3JlYXRlKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMuY2FsbGJhY2tzLm9uQmluYXJ5RmlsZUNyZWF0ZShub3JtYWxpemVkUGF0aCwgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFx1RDE0RFx1QzJBNFx1RDJCOCBcdUQzMENcdUM3N0MgXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmRvd25sb2FkU2VydmVyRmlsZShzZXJ2ZXJGaWxlLmZpbGVJZCwgbm9ybWFsaXplZFBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb3dubG9hZGVkKys7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW1JlY29ubmVjdFN5bmNdIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUMyRTRcdUQzMjg6ICR7c2VydmVyRmlsZS5wYXRofWAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzZWQrKztcbiAgICAgICAgdGhpcy5jYWxsYmFja3Muc2hvd1N0YXR1c0Jhcj8uKGBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOTExLi4uICgke3Byb2Nlc3NlZH0vJHt0b3RhbEZpbGVzfSlgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDNjQ0XHVCOENDIChSRVEtRlMtMjAyKVxuICAgIHRoaXMuc2VuZFN5bmNSZWNvbm5lY3RDb21wbGV0ZSh1cGxvYWRlZCwgZG93bmxvYWRlZCwgY29uZmxpY3RzKTtcblxuICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUQ2QzQgXHVDNjI0XHVENTA0XHVCNzdDXHVDNzc4IFx1RDA1MCBcdUJCMzRcdUQ2QThcdUQ2NTQgKHN0YWxlIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUM3QUNcdUMwREQgXHVCQzI5XHVDOUMwKVxuICAgIHRoaXMucXVldWUuY2xlYXIoKTtcblxuICAgIC8vIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUMwQzFcdUQwREMgXHVENTc0XHVDODFDIChmbHVzaExpdmVTeW5jUXVldWUgXHVDODA0XHVDNUQwIFx1RDU3NFx1QzgxQ1x1RDU3NFx1QzU3QyBcdUJCMzRcdUQ1NUMgcHVzaCBcdUJDMjlcdUM5QzApXG4gICAgdGhpcy5pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xuXG4gICAgLy8gXHVCNzdDXHVDNzc0XHVCRTBDIFx1QzJGMVx1RDA2QyBcdUM3NzRcdUJDQTRcdUQyQjggXHVEMDUwIFx1Q0M5OFx1QjlBQyAoUkVRLVJULTIwMilcbiAgICB0aGlzLmZsdXNoTGl2ZVN5bmNRdWV1ZSgpO1xuXG4gICAgLy8gVUkgXHVDNUM1XHVCMzcwXHVDNzc0XHVEMkI4IChSRVEtVUktMTA1KVxuICAgIGNvbnN0IHNraXBNc2cgPSB1c2VyU2tpcHBlZENvbmZsaWN0cyA/IGAgKCR7Y29uZmxpY3RzfVx1QUMxQyBcdUNEQTlcdUIzQ0MgXHVBQzc0XHVCMTA4XHVCNzAwKWAgOiBjb25mbGljdHMgPiAwID8gYCwgJHtjb25mbGljdHN9XHVBQzFDIFx1Q0RBOVx1QjNDQ2AgOiAnJztcbiAgICB0aGlzLmNhbGxiYWNrcy5vbk5vdGljZT8uKGBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDNjQ0XHVCOENDOiAke3VwbG9hZGVkfVx1QUMxQyBcdUM1QzVcdUI4NUNcdUI0REMsICR7ZG93bmxvYWRlZH1cdUFDMUMgXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDJHtza2lwTXNnfWApO1xuICAgIHRoaXMuY2FsbGJhY2tzLmNsZWFyU3RhdHVzQmFyPy4oKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoJ2Nvbm5lY3RlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QzExQ1x1QkM4NCBcdUQzMENcdUM3N0MgXHVCMkU0XHVDNkI0XHVCODVDXHVCNERDIChSRVEtRlMtMTAyKVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBkb3dubG9hZFNlcnZlckZpbGUoZmlsZUlkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jYWxsYmFja3MpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5yZXN0Q2xpZW50LmRvd25sb2FkRmlsZShmaWxlSWQpO1xuICAgICAgY29uc3QgY29udGVudCA9IGRhdGEuY29udGVudCA/PyAnJztcblxuICAgICAgaWYgKHRoaXMuY2FsbGJhY2tzLnBhdGhFeGlzdHM/LihwYXRoKSkge1xuICAgICAgICBhd2FpdCB0aGlzLmNhbGxiYWNrcy5vbkZpbGVVcGRhdGUocGF0aCwgY29udGVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZVBhcmVudEZvbGRlcihwYXRoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5jYWxsYmFja3Mub25GaWxlQ3JlYXRlKHBhdGgsIGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbUmVjb25uZWN0U3luY10gXHVEMzBDXHVDNzdDIFx1QjJFNFx1QzZCNFx1Qjg1Q1x1QjREQyBcdUMyRTRcdUQzMjg6ICR7ZmlsZUlkfWAsIGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUI3N0NcdUM3NzRcdUJFMEMgXHVDMkYxXHVEMDZDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUQwNTAgXHVENTBDXHVCN0VDXHVDMkRDIChSRVEtUlQtMjAyKVxuICAgKi9cbiAgcHJpdmF0ZSBmbHVzaExpdmVTeW5jUXVldWUoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBldmVudCBvZiB0aGlzLmxpdmVTeW5jUXVldWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hTZXJ2ZXJNZXNzYWdlKGV2ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tSZWNvbm5lY3RTeW5jXSBcdUQwNTAgXHVDNzc0XHVCQ0E0XHVEMkI4IFx1Q0M5OFx1QjlBQyBcdUMyRTRcdUQzMjg6JywgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxpdmVTeW5jUXVldWUgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOUM0XHVENTg5IFx1QzkxMVx1Qzc3OFx1QzlDMCBcdUQ2NTVcdUM3NzhcbiAgICovXG4gIGdldCBpc1N5bmNpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZWNvbm5lY3Rpbmc7XG4gIH1cbn1cbiIsICIvKipcbiAqIFZhdWx0Um91dGVyIC0gXHVCMkU0XHVDOTExIFx1QkNGQ1x1RDJCOCBcdUI3N0NcdUM2QjBcdUQzMDUgKFNQRUMtUExVR0lOLU1VTFRJVkFVTFQtMDAxIE1WUC0wMDIpXG4gKiBATVg6QU5DSE9SOiBbQVVUT10gXHVEM0Y0XHVCMzU0IFx1QUNCRFx1Qjg1Q1x1Qjk3QyBcdUFFMzBcdUJDMThcdUM3M0NcdUI4NUMgXHVDNjJDXHVCQzE0XHVCOTc4IFN5bmNTZXJ2aWNlXHVCODVDIFx1Qjc3Q1x1QzZCMFx1RDMwNVxuICogQE1YOlJFQVNPTjogUkVRLTAwNiB0byBSRVEtMDExIC0gXHVBQ0JEXHVCODVDIFx1QUUzMFx1QkMxOCBcdUJDRkNcdUQyQjggXHVCNzdDXHVDNkIwXHVEMzA1IFx1QkMwRiBcdUIzQzVcdUI5QkRcdUM4MDEgU3luY1NlcnZpY2UgXHVBRDAwXHVCOUFDXG4gKi9cblxuaW1wb3J0IHsgU3luY1NlcnZpY2UsIHR5cGUgU3luY0NhbGxiYWNrcyB9IGZyb20gJy4vc3luYy1zZXJ2aWNlJztcbmltcG9ydCB0eXBlIHsgVmF1bHRNYXBwaW5nLCBBZ2dyZWdhdGVTeW5jU3RhdGUsIFN5bmNTdGF0ZSB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgeyBJbmRleGVkREJTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlL2luZGV4ZWQtZGInO1xuXG4vKipcbiAqIFx1QzgxNVx1QUREQ1x1RDY1NFx1QjQxQyBcdUQzRjRcdUIzNTQgXHVCOUU0XHVENTUxXG4gKi9cbmludGVyZmFjZSBOb3JtYWxpemVkTWFwcGluZyB7XG4gIGZvbGRlcjogc3RyaW5nOyAvLyBcdUM4MTVcdUFERENcdUQ2NTRcdUI0MUMgXHVEM0Y0XHVCMzU0IFx1QUNCRFx1Qjg1QyAoXHVDMTIwXHVENTg5L1x1RDZDNFx1RDU4OSBcdUMyQUNcdUI3OThcdUMyREMgXHVDODFDXHVBQzcwKVxuICB2YXVsdElkOiBzdHJpbmc7XG4gIGFwaUtleTogc3RyaW5nO1xuICBlbmFibGVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFZhdWx0Um91dGVyIC0gXHVEM0Y0XHVCMzU0IFx1QUNCRFx1Qjg1Q1x1Qjk3QyBcdUFFMzBcdUJDMThcdUM3M0NcdUI4NUMgXHVEMzBDXHVDNzdDIFx1Qzc3NFx1QkNBNFx1RDJCOFx1Qjk3QyBcdUM2MkNcdUJDMTRcdUI5NzggXHVCQ0ZDXHVEMkI4XHVCODVDIFx1Qjc3Q1x1QzZCMFx1RDMwNVxuICpcbiAqIFJFUS0wMDY6IFx1QUNCRFx1Qjg1QyBcdUM4MTFcdUI0NTBcdUMwQUNcdUI5N0MgXHVBRTMwXHVCQzE4XHVDNzNDXHVCODVDIFx1QzYyQ1x1QkMxNFx1Qjk3OCBcdUJDRkNcdUQyQjhcdUI4NUMgXHVEMzBDXHVDNzdDIFx1Qzc3NFx1QkNBNFx1RDJCOCBcdUI3N0NcdUM2QjBcdUQzMDVcbiAqIFJFUS0wMDc6IFx1QjlFNFx1RDU1MVx1QjQxOFx1QzlDMCBcdUM1NEFcdUM3NDAgXHVEM0Y0XHVCMzU0XHVDNzU4IFx1RDMwQ1x1Qzc3Q1x1Qzc0MCBcdUJCMzRcdUMyREMgKFx1QjNEOVx1QUUzMFx1RDY1NCBcdUM1NDggXHVENTY4KVxuICogUkVRLTAwODogXHVBQ0I5XHVDRTU4XHVCMjk0IFx1QzgxMVx1QjQ1MFx1QzBBQ1x1Qzc1OCBcdUFDQkRcdUM2QjAgXHVBQzAwXHVDN0E1IFx1QUUzNCBcdUM4MTFcdUI0NTBcdUMwQUMgXHVCOUU0XHVDRTZEIFx1QzZCMFx1QzEyMFxuICogUkVRLTAwOTogXHVBQzAxIFx1QkNGQ1x1RDJCOFx1QjlDOFx1QjJFNCBcdUIzQzVcdUI5QkRcdUM4MDFcdUM3NzggU3luY1NlcnZpY2UgXHVDNzc4XHVDMkE0XHVEMTM0XHVDMkE0XG4gKiBSRVEtMDEwOiBcdUFDMDEgU3luY1NlcnZpY2VcdUIyOTQgXHVDNzkwXHVDQ0I0IFdlYlNvY2tldCBcdUM1RjBcdUFDQjAgXHVCQ0Y0XHVDNzIwXG4gKiBSRVEtMDExOiBcdUJDRkNcdUQyQjggXHVDNUYwXHVBQ0IwIFx1QzBDMVx1RDBEQ1x1Qjk3QyBcdUIzQzVcdUI5QkRcdUM4MDFcdUM3M0NcdUI4NUMgXHVDQzk4XHVCOUFDXG4gKi9cbmV4cG9ydCBjbGFzcyBWYXVsdFJvdXRlciB7XG4gIHByaXZhdGUgbWFwcGluZ3M6IE5vcm1hbGl6ZWRNYXBwaW5nW107XG4gIHByaXZhdGUgc3luY1NlcnZpY2VzOiBNYXA8c3RyaW5nLCBTeW5jU2VydmljZT4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgc2VydmVyVXJsOiBzdHJpbmc7XG4gIHByaXZhdGUgc3RvcmFnZTogSW5kZXhlZERCU3RvcmFnZTtcblxuICAvKipcbiAgICogVmF1bHRSb3V0ZXIgXHVDMEREXHVDMTMxXHVDNzkwXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtYXBwaW5nczogVmF1bHRNYXBwaW5nW10sIHNlcnZlclVybDogc3RyaW5nLCBzdG9yYWdlOiBJbmRleGVkREJTdG9yYWdlKSB7XG4gICAgdGhpcy5zZXJ2ZXJVcmwgPSBzZXJ2ZXJVcmw7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcbiAgICB0aGlzLm1hcHBpbmdzID0gbWFwcGluZ3NcbiAgICAgIC5maWx0ZXIoKG0pID0+IG0uZW5hYmxlZCkgLy8gXHVENjVDXHVDMTMxXHVENjU0XHVCNDFDIFx1QjlFNFx1RDU1MVx1QjlDQyBcdUMwQUNcdUM2QTlcbiAgICAgIC5tYXAoKG0pID0+ICh7XG4gICAgICAgIGZvbGRlcjogdGhpcy5ub3JtYWxpemVGb2xkZXIobS5mb2xkZXIpLFxuICAgICAgICB2YXVsdElkOiBtLnZhdWx0SWQsXG4gICAgICAgIGFwaUtleTogbS5hcGlLZXksXG4gICAgICAgIGVuYWJsZWQ6IG0uZW5hYmxlZCxcbiAgICAgIH0pKTtcblxuICAgIC8vIFx1RDY1Q1x1QzEzMVx1RDY1NFx1QjQxQyBcdUI5RTRcdUQ1NTFcdUM1RDAgXHVCMzAwXHVENTc0IFN5bmNTZXJ2aWNlIFx1QzBERFx1QzEzMSAoUkVRLTAwOSlcbiAgICBmb3IgKGNvbnN0IG1hcHBpbmcgb2YgdGhpcy5tYXBwaW5ncykge1xuICAgICAgaWYgKCF0aGlzLnN5bmNTZXJ2aWNlcy5oYXMobWFwcGluZy52YXVsdElkKSkge1xuICAgICAgICBjb25zdCBzeW5jU2VydmljZSA9IG5ldyBTeW5jU2VydmljZShcbiAgICAgICAgICB0aGlzLnNlcnZlclVybCxcbiAgICAgICAgICBtYXBwaW5nLnZhdWx0SWQsXG4gICAgICAgICAgbWFwcGluZy5hcGlLZXksXG4gICAgICAgICAgbWFwcGluZy5mb2xkZXIsXG4gICAgICAgICAgdGhpcy5zdG9yYWdlLCAvLyBTUEVDLVNZTkMtMDA2OiBzdG9yYWdlIFx1QzgwNFx1QjJFQ1xuICAgICAgICApO1xuICAgICAgICB0aGlzLnN5bmNTZXJ2aWNlcy5zZXQobWFwcGluZy52YXVsdElkLCBzeW5jU2VydmljZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1RDNGNFx1QjM1NCBcdUFDQkRcdUI4NUMgXHVDODE1XHVBRERDXHVENjU0IChcdUMxMjBcdUQ1ODkvXHVENkM0XHVENTg5IFx1QzJBQ1x1Qjc5OFx1QzJEQyBcdUM4MUNcdUFDNzApXG4gICAqXG4gICAqIEBwYXJhbSBmb2xkZXIgLSBcdUM2RDBcdUJDRjggXHVEM0Y0XHVCMzU0IFx1QUNCRFx1Qjg1Q1xuICAgKiBAcmV0dXJucyBcdUM4MTVcdUFERENcdUQ2NTRcdUI0MUMgXHVEM0Y0XHVCMzU0IFx1QUNCRFx1Qjg1Q1xuICAgKi9cbiAgcHJpdmF0ZSBub3JtYWxpemVGb2xkZXIoZm9sZGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBmb2xkZXIucmVwbGFjZSgvXlxcLyt8XFwvKyQvZywgJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1RDMwQ1x1Qzc3QyBcdUFDQkRcdUI4NUMgXHVDODE1XHVBRERDXHVENjU0IChcdUMxMjBcdUQ1ODkgXHVDMkFDXHVCNzk4XHVDMkRDIFx1QzgxQ1x1QUM3MClcbiAgICpcbiAgICogQHBhcmFtIHBhdGggLSBcdUM2RDBcdUJDRjggXHVEMzBDXHVDNzdDIFx1QUNCRFx1Qjg1Q1xuICAgKiBAcmV0dXJucyBcdUM4MTVcdUFERENcdUQ2NTRcdUI0MUMgXHVEMzBDXHVDNzdDIFx1QUNCRFx1Qjg1Q1xuICAgKi9cbiAgcHJpdmF0ZSBub3JtYWxpemVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXlxcLysvLCAnJyk7XG4gIH1cblxuICAvKipcbiAgICogUkVRLTAwNiwgUkVRLTAwODogXHVEMzBDXHVDNzdDIFx1QUNCRFx1Qjg1Q1x1Qjk3QyBcdUFFMzBcdUJDMThcdUM3M0NcdUI4NUMgXHVDNjJDXHVCQzE0XHVCOTc4IFx1QkNGQ1x1RDJCOCBJRCBcdUI3N0NcdUM2QjBcdUQzMDVcbiAgICpcbiAgICogQHBhcmFtIHBhdGggLSBcdUQzMENcdUM3N0MgXHVBQ0JEXHVCODVDXG4gICAqIEByZXR1cm5zIFx1QjlFNFx1RDU1MVx1QjQxQyBcdUJDRkNcdUQyQjggSUQgXHVCNjEwXHVCMjk0IG51bGwgKFx1QjlFNFx1RDU1MSBcdUM1QzZcdUM3NEMpXG4gICAqL1xuICAvKipcbiAgICogQE1YOkFOQ0hPUjogW0FVVE9dIFx1QUNCRFx1Qjg1QyBcdUFFMzBcdUJDMTggXHVCQ0ZDXHVEMkI4IFx1Qjc3Q1x1QzZCMFx1RDMwNSAtIFx1QkFBOFx1QjRFMCBcdUQzMENcdUM3N0MgXHVDNzc0XHVCQ0E0XHVEMkI4XHVDNzU4IFx1QzlDNFx1Qzc4NVx1QzgxMCAoZmFuX2luID49IDMpXG4gICAqIEBNWDpSRUFTT046IFJFUS0wMDYsIFJFUS0wMDggLSBcdUQ1NzVcdUMyRUMgXHVCNzdDXHVDNkIwXHVEMzA1IFx1Qjg1Q1x1QzlDMVx1QzczQ1x1Qjg1QyBcdUIyRTRcdUMyMTggXHVENTc4XHVCNEU0XHVCN0VDXHVDNUQwXHVDMTFDIFx1RDYzOFx1Q0Q5Q1xuICAgKi9cbiAgcm91dGUocGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSB0aGlzLm5vcm1hbGl6ZVBhdGgocGF0aCk7XG5cbiAgICAvLyBcdUJFNDggXHVBQ0JEXHVCODVDIFx1Q0M5OFx1QjlBQ1xuICAgIGlmICghbm9ybWFsaXplZFBhdGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFx1QUMwMFx1QzdBNSBcdUFFMzQgXHVDODExXHVCNDUwXHVDMEFDIFx1QjlFNFx1Q0U2RCAoUkVRLTAwOClcbiAgICBsZXQgYmVzdE1hdGNoOiBOb3JtYWxpemVkTWFwcGluZyB8IG51bGwgPSBudWxsO1xuICAgIGxldCBiZXN0TWF0Y2hMZW5ndGggPSAtMTtcblxuICAgIGZvciAoY29uc3QgbWFwcGluZyBvZiB0aGlzLm1hcHBpbmdzKSB7XG4gICAgICAvLyBcdUJFNDggXHVEM0Y0XHVCMzU0XHVCMjk0IFx1QjhFOFx1RDJCOFx1Qjk3QyBcdUM3NThcdUJCRjggKFx1QkFBOFx1QjRFMCBcdUFDQkRcdUI4NUMgXHVCOUU0XHVDRTZEKVxuICAgICAgaWYgKG1hcHBpbmcuZm9sZGVyID09PSAnJykge1xuICAgICAgICBjb25zdCBjdXJyZW50TGVuZ3RoID0gMDtcbiAgICAgICAgaWYgKGN1cnJlbnRMZW5ndGggPiBiZXN0TWF0Y2hMZW5ndGgpIHtcbiAgICAgICAgICBiZXN0TWF0Y2ggPSBtYXBwaW5nO1xuICAgICAgICAgIGJlc3RNYXRjaExlbmd0aCA9IGN1cnJlbnRMZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1RDNGNFx1QjM1NCBcdUM4MTFcdUI0NTBcdUMwQUMgXHVENjU1XHVDNzc4XG4gICAgICBpZiAobm9ybWFsaXplZFBhdGguc3RhcnRzV2l0aChtYXBwaW5nLmZvbGRlciArICcvJykgfHwgbm9ybWFsaXplZFBhdGggPT09IG1hcHBpbmcuZm9sZGVyKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMZW5ndGggPSBtYXBwaW5nLmZvbGRlci5sZW5ndGg7XG4gICAgICAgIGlmIChjdXJyZW50TGVuZ3RoID4gYmVzdE1hdGNoTGVuZ3RoKSB7XG4gICAgICAgICAgYmVzdE1hdGNoID0gbWFwcGluZztcbiAgICAgICAgICBiZXN0TWF0Y2hMZW5ndGggPSBjdXJyZW50TGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlc3RNYXRjaD8udmF1bHRJZCA/PyBudWxsOyAvLyBSRVEtMDA3OiBcdUI5RTRcdUQ1NTEgXHVDNUM2XHVDNzNDXHVCQTc0IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBSRVEtMDA5OiBcdUJBQThcdUI0RTAgU3luY1NlcnZpY2UgXHVDNzc4XHVDMkE0XHVEMTM0XHVDMkE0IFx1QkMxOFx1RDY1OFxuICAgKlxuICAgKiBAcmV0dXJucyB2YXVsdElkIFx1MjE5MiBTeW5jU2VydmljZSBcdUI5RjVcbiAgICovXG4gIGdldFN5bmNTZXJ2aWNlcygpOiBNYXA8c3RyaW5nLCBTeW5jU2VydmljZT4ge1xuICAgIHJldHVybiB0aGlzLnN5bmNTZXJ2aWNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUQyQjlcdUM4MTUgXHVCQ0ZDXHVEMkI4XHVDNzU4IFN5bmNTZXJ2aWNlIFx1QkMxOFx1RDY1OFxuICAgKlxuICAgKiBAcGFyYW0gdmF1bHRJZCAtIFx1QkNGQ1x1RDJCOCBJRFxuICAgKiBAcmV0dXJucyBTeW5jU2VydmljZSBcdUM3NzhcdUMyQTRcdUQxMzRcdUMyQTQgXHVCNjEwXHVCMjk0IHVuZGVmaW5lZFxuICAgKi9cbiAgZ2V0U3luY1NlcnZpY2UodmF1bHRJZDogc3RyaW5nKTogU3luY1NlcnZpY2UgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnN5bmNTZXJ2aWNlcy5nZXQodmF1bHRJZCk7XG4gIH1cblxuICAvKipcbiAgICogXHVCQUE4XHVCNEUwIFN5bmNTZXJ2aWNlXHVDNUQwIFx1Q0Y1Q1x1QkMzMSBcdUMxMjRcdUM4MTVcbiAgICpcbiAgICogQHBhcmFtIGNhbGxiYWNrcyAtIFN5bmNTZXJ2aWNlIFx1Q0Y1Q1x1QkMzMVxuICAgKi9cbiAgc2V0Q2FsbGJhY2tzKGNhbGxiYWNrczogU3luY0NhbGxiYWNrcyk6IHZvaWQge1xuICAgIGZvciAoY29uc3Qgc3luY1NlcnZpY2Ugb2YgdGhpcy5zeW5jU2VydmljZXMudmFsdWVzKCkpIHtcbiAgICAgIHN5bmNTZXJ2aWNlLnNldENhbGxiYWNrcyhjYWxsYmFja3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUJBQThcdUI0RTAgU3luY1NlcnZpY2UgXHVDNUYwXHVBQ0IwIFx1QzJEQ1x1Qzc5MSAoUkVRLTAxMClcbiAgICovXG4gIGFzeW5jIGNvbm5lY3RBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChcbiAgICAgIEFycmF5LmZyb20odGhpcy5zeW5jU2VydmljZXMuZW50cmllcygpKS5tYXAoYXN5bmMgKFt2YXVsdElkLCBzZXJ2aWNlXSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHNlcnZpY2UuY29ubmVjdCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW1ZhdWx0Um91dGVyXSBcdUJDRkNcdUQyQjggXHVDNUYwXHVBQ0IwIFx1QzJFNFx1RDMyOCAoJHt2YXVsdElkfSk6YCwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gICAgY29uc3QgZmFpbGVkID0gcmVzdWx0cy5maWx0ZXIoKHIpID0+IHIuc3RhdHVzID09PSAncmVqZWN0ZWQnKTtcbiAgICBpZiAoZmFpbGVkLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnNvbGUud2FybihgW1ZhdWx0Um91dGVyXSAke2ZhaWxlZC5sZW5ndGh9LyR7cmVzdWx0cy5sZW5ndGh9IFx1QkNGQ1x1RDJCOCBcdUM1RjBcdUFDQjAgXHVDMkU0XHVEMzI4YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFx1QkFBOFx1QjRFMCBTeW5jU2VydmljZSBcdUM1RjBcdUFDQjAgXHVENTc0XHVDODFDXG4gICAqL1xuICBkaXNjb25uZWN0QWxsKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3Qgc3luY1NlcnZpY2Ugb2YgdGhpcy5zeW5jU2VydmljZXMudmFsdWVzKCkpIHtcbiAgICAgIHN5bmNTZXJ2aWNlLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQE1YOk5PVEU6IFtBVVRPXSBcdUIyRTRcdUM5MTEgXHVCQ0ZDXHVEMkI4IFx1RDFCNVx1RDU2OSBcdUMwQzFcdUQwREMgXHVDOUQxXHVBQ0M0IChTUEVDLVBMVUdJTi1TVEFUVVMtMDAxKVxuICAgKiBSRVEtU1RBVFVTLTAwMzogXHVCQUE4XHVCNEUwIFN5bmNTZXJ2aWNlIFx1QzBDMVx1RDBEQ1x1Qjk3QyBcdUM5RDFcdUFDQzRcdUQ1NThcdUM1RUMgXHVEMUI1XHVENTY5IFx1QzBDMVx1RDBEQyBcdUJDMThcdUQ2NThcbiAgICpcbiAgICogXHVDMEMxXHVEMERDIFx1QzlEMVx1QUNDNCBcdUI4NUNcdUM5QzE6XG4gICAqIC0gXHVCQUE4XHVCNEUwIFx1QkNGQ1x1RDJCOFx1QUMwMCBcdUM1RjBcdUFDQjBcdUI0MjggXHUyMTkyICdjb25uZWN0ZWQnXG4gICAqIC0gXHVDNzdDXHVCRDgwIFx1QkNGQ1x1RDJCOFx1QjlDQyBcdUM1RjBcdUFDQjBcdUI0MjggXHUyMTkyICdjb25uZWN0ZWQnIChjb25uZWN0ZWQvdG90YWwgXHVENjE1XHVDMkREXHVDNzNDXHVCODVDIFx1RDQ1Q1x1QzJEQylcbiAgICogLSBcdUQ1NThcdUIwOThcdUI3N0NcdUIzQzQgXHVDNUQwXHVCN0VDIFx1QzBDMVx1RDBEQyBcdTIxOTIgJ2Vycm9yJ1xuICAgKiAtIFx1RDU1OFx1QjA5OFx1Qjc3Q1x1QjNDNCBcdUM3QUNcdUM1RjBcdUFDQjAgXHVDOTExIFx1MjE5MiAncmVjb25uZWN0aW5nJ1xuICAgKiAtIFx1RDU1OFx1QjA5OFx1Qjc3Q1x1QjNDNCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDOTExIFx1MjE5MiAnc3luY2luZydcbiAgICogLSBcdUQ1NThcdUIwOThcdUI3N0NcdUIzQzQgXHVDNzdDXHVDMkRDXHVDODE1XHVDOUMwIFx1MjE5MiAncGF1c2VkJ1xuICAgKiAtIFx1QkFBOFx1QjQ1MCBcdUM2MjRcdUQ1MDRcdUI3N0NcdUM3NzggXHUyMTkyICdvZmZsaW5lJ1xuICAgKlxuICAgKiBAcmV0dXJucyBcdUM5RDFcdUFDQzRcdUI0MUMgXHVCM0Q5XHVBRTMwXHVENjU0IFx1QzBDMVx1RDBEQ1xuICAgKi9cbiAgZ2V0QWdncmVnYXRlU3RhdGUoKTogQWdncmVnYXRlU3luY1N0YXRlIHtcbiAgICBjb25zdCB2YXVsdElkcyA9IHRoaXMuZ2V0VmF1bHRJZHMoKTtcbiAgICBjb25zdCB0b3RhbCA9IHZhdWx0SWRzLmxlbmd0aDtcblxuICAgIGlmICh0b3RhbCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgc3RhdGU6ICdvZmZsaW5lJywgY29ubmVjdGVkOiAwLCB0b3RhbDogMCB9O1xuICAgIH1cblxuICAgIGxldCBjb25uZWN0ZWRDb3VudCA9IDA7XG4gICAgY29uc3Qgc3RhdGVDb3VudHM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7XG4gICAgICBlcnJvcjogMCxcbiAgICAgIG9mZmxpbmU6IDAsXG4gICAgICByZWNvbm5lY3Rpbmc6IDAsXG4gICAgICBzeW5jaW5nOiAwLFxuICAgICAgcGF1c2VkOiAwLFxuICAgICAgY29ubmVjdGVkOiAwLFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IHZhdWx0SWQgb2YgdmF1bHRJZHMpIHtcbiAgICAgIGNvbnN0IHN5bmNTZXJ2aWNlID0gdGhpcy5zeW5jU2VydmljZXMuZ2V0KHZhdWx0SWQpO1xuICAgICAgaWYgKCFzeW5jU2VydmljZSkgY29udGludWU7XG5cbiAgICAgIGNvbnN0IHN0YXRlID0gc3luY1NlcnZpY2Uuc3RhdGU7XG4gICAgICBzdGF0ZUNvdW50c1tzdGF0ZV0rKztcbiAgICAgIGlmIChzdGF0ZSA9PT0gJ2Nvbm5lY3RlZCcpIHtcbiAgICAgICAgY29ubmVjdGVkQ291bnQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBcdUMwQzFcdUQwREMgXHVDNkIwXHVDMTIwXHVDMjFDXHVDNzA0IFx1QUNCMFx1QzgxNTogZXJyb3IgPiByZWNvbm5lY3RpbmcgPiBzeW5jaW5nID4gcGF1c2VkID4gb2ZmbGluZSA+IGNvbm5lY3RlZFxuICAgIC8vIFx1QzVGMFx1QUNCMFx1QjQxQyBcdUJDRkNcdUQyQjhcdUFDMDAgXHVENTU4XHVCMDk4XHVCNzdDXHVCM0M0IFx1Qzc4OFx1QzczQ1x1QkE3NCAnY29ubmVjdGVkJyBcdUMwQzFcdUQwRENcdUI4NUMgXHVENDVDXHVDMkRDIChjb25uZWN0ZWQvdG90YWwgXHVENjE1XHVDMkREKVxuICAgIGxldCBhZ2dyZWdhdGVTdGF0ZTogU3luY1N0YXRlID0gJ29mZmxpbmUnO1xuXG4gICAgaWYgKHN0YXRlQ291bnRzLmVycm9yID4gMCkge1xuICAgICAgYWdncmVnYXRlU3RhdGUgPSAnZXJyb3InO1xuICAgIH0gZWxzZSBpZiAoc3RhdGVDb3VudHMucmVjb25uZWN0aW5nID4gMCkge1xuICAgICAgYWdncmVnYXRlU3RhdGUgPSAncmVjb25uZWN0aW5nJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlQ291bnRzLnN5bmNpbmcgPiAwKSB7XG4gICAgICBhZ2dyZWdhdGVTdGF0ZSA9ICdzeW5jaW5nJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlQ291bnRzLnBhdXNlZCA+IDApIHtcbiAgICAgIGFnZ3JlZ2F0ZVN0YXRlID0gJ3BhdXNlZCc7XG4gICAgfSBlbHNlIGlmIChjb25uZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgIC8vIFx1RDU1OFx1QjA5OFx1Qjc3Q1x1QjNDNCBcdUM1RjBcdUFDQjBcdUI0MThcdUM1QjQgXHVDNzg4XHVDNzNDXHVCQTc0IGNvbm5lY3RlZCBcdUMwQzFcdUQwRENcbiAgICAgIGFnZ3JlZ2F0ZVN0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1QkFBOFx1QjQ1MCBcdUM2MjRcdUQ1MDRcdUI3N0NcdUM3NzhcbiAgICAgIGFnZ3JlZ2F0ZVN0YXRlID0gJ29mZmxpbmUnO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0ZTogYWdncmVnYXRlU3RhdGUsXG4gICAgICBjb25uZWN0ZWQ6IGNvbm5lY3RlZENvdW50LFxuICAgICAgdG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSRVEtU1RBVFVTLTAwMjogXHVCQUE4XHVCNEUwIFN5bmNTZXJ2aWNlXHVDNzU4IFx1QzBDMVx1RDBEQyBcdUJDQzBcdUFDQkQgXHVCOUFDXHVDMkE0XHVCMTA4IFx1QjRGMVx1Qjg1RFxuICAgKlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBcdUMwQzFcdUQwREMgXHVCQ0MwXHVBQ0JEIFx1Q0Y1Q1x1QkMzMVxuICAgKiBAcmV0dXJucyBcdUFENkNcdUIzQzUgXHVENTc0XHVDODFDIFx1RDU2OFx1QzIxOFxuICAgKi9cbiAgb25TdGF0ZUNoYW5nZShjYWxsYmFjazogKHN0YXRlOiBBZ2dyZWdhdGVTeW5jU3RhdGUpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgICBjb25zdCB1bnN1YnNjcmliZXJzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBzeW5jU2VydmljZSBvZiB0aGlzLnN5bmNTZXJ2aWNlcy52YWx1ZXMoKSkge1xuICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSBzeW5jU2VydmljZS5vblN0YXRlQ2hhbmdlKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sodGhpcy5nZXRBZ2dyZWdhdGVTdGF0ZSgpKTtcbiAgICAgIH0pO1xuICAgICAgdW5zdWJzY3JpYmVycy5wdXNoKHVuc3Vic2NyaWJlKTtcbiAgICB9XG5cbiAgICAvLyBcdUJBQThcdUI0RTAgXHVBRDZDXHVCM0M1XHVDNzQ0IFx1RDU3NFx1QzgxQ1x1RDU1OFx1QjI5NCBcdUQ1NjhcdUMyMTggXHVCQzE4XHVENjU4XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgdW5zdWJzY3JpYmUgb2YgdW5zdWJzY3JpYmVycykge1xuICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogXHVENjVDXHVDMTMxXHVENjU0XHVCNDFDIFx1QjlFNFx1RDU1MSBcdUMyMTggXHVCQzE4XHVENjU4XG4gICAqL1xuICBnZXRBY3RpdmVNYXBwaW5nQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5tYXBwaW5ncy5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogXHVCQUE4XHVCNEUwIFx1QjlFNFx1RDU1MVx1QjQxQyBcdUJDRkNcdUQyQjggSUQgXHVCQzE4XHVENjU4XG4gICAqL1xuICBnZXRWYXVsdElkcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5zeW5jU2VydmljZXMua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSRVEtMDA4OiBcdUQyQjlcdUM4MTUgXHVCQ0ZDXHVEMkI4XHVDNUQwIFx1QzE4RFx1RDU1QyBcdUQzMENcdUM3N0NcdUI5Q0MgXHVENTQ0XHVEMTMwXHVCOUMxXG4gICAqXG4gICAqIEBwYXJhbSB2YXVsdElkIC0gXHVCQ0ZDXHVEMkI4IElEXG4gICAqIEBwYXJhbSBhbGxGaWxlcyAtIFx1QkFBOFx1QjRFMCBcdUI4NUNcdUNFRUMgXHVEMzBDXHVDNzdDIFx1QkFBOVx1Qjg1RFxuICAgKiBAcmV0dXJucyBcdUQ1NzRcdUIyRjkgXHVCQ0ZDXHVEMkI4XHVDNUQwIFx1QzE4RFx1RDU1QyBcdUQzMENcdUM3N0MgXHVCQUE5XHVCODVEXG4gICAqL1xuICBjb2xsZWN0RmlsZXNGb3JWYXVsdChcbiAgICB2YXVsdElkOiBzdHJpbmcsXG4gICAgYWxsRmlsZXM6IEFycmF5PHsgcGF0aDogc3RyaW5nOyBoYXNoOiBzdHJpbmcgfT5cbiAgKTogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9PiB7XG4gICAgLy8gXHVENTc0XHVCMkY5IFx1QkNGQ1x1RDJCOFx1Qzc1OCBcdUI5RTRcdUQ1NTEgXHVDQzNFXHVBRTMwXG4gICAgY29uc3QgbWFwcGluZyA9IHRoaXMubWFwcGluZ3MuZmluZCgobSkgPT4gbS52YXVsdElkID09PSB2YXVsdElkKTtcbiAgICBpZiAoIW1hcHBpbmcpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBcdUQzRjRcdUIzNTQgXHVDODExXHVCNDUwXHVDMEFDXHVCODVDIFx1RDU0NFx1RDEzMFx1QjlDMVxuICAgIHJldHVybiBhbGxGaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gdGhpcy5ub3JtYWxpemVQYXRoKGZpbGUucGF0aCk7XG5cbiAgICAgIC8vIFx1QkU0OCBcdUQzRjRcdUIzNTRcdUIyOTQgXHVCOEU4XHVEMkI4XHVCOTdDIFx1Qzc1OFx1QkJGOCAoXHVCQUE4XHVCNEUwIFx1RDMwQ1x1Qzc3QyBcdUI5RTRcdUNFNkQpXG4gICAgICBpZiAobWFwcGluZy5mb2xkZXIgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBcdUQzRjRcdUIzNTQgXHVDODExXHVCNDUwXHVDMEFDIFx1RDY1NVx1Qzc3OFxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRQYXRoLnN0YXJ0c1dpdGgobWFwcGluZy5mb2xkZXIgKyAnLycpIHx8IG5vcm1hbGl6ZWRQYXRoID09PSBtYXBwaW5nLmZvbGRlcjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSRVEtMDA4OiBcdUQyQjlcdUM4MTUgXHVCQ0ZDXHVEMkI4XHVDNUQwIFx1QjMwMFx1RDU1QyBcdUM3QUNcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMjE4XHVENTg5XG4gICAqXG4gICAqIEBwYXJhbSB2YXVsdElkIC0gXHVCQ0ZDXHVEMkI4IElEXG4gICAqIEBwYXJhbSBsb2NhbEZpbGVzIC0gXHVCODVDXHVDRUVDIFx1RDMwQ1x1Qzc3QyBcdUJBQTlcdUI4NURcbiAgICovXG4gIHJlY29uY2lsZVZhdWx0KHZhdWx0SWQ6IHN0cmluZywgbG9jYWxGaWxlczogQXJyYXk8eyBwYXRoOiBzdHJpbmc7IGhhc2g6IHN0cmluZyB9Pik6IHZvaWQge1xuICAgIGNvbnN0IHN5bmNTZXJ2aWNlID0gdGhpcy5zeW5jU2VydmljZXMuZ2V0KHZhdWx0SWQpO1xuICAgIGlmICghc3luY1NlcnZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBATVg6VE9ETzogVC0wMDc6IFN5bmNTZXJ2aWNlLnJlY29uY2lsZSgpIFx1QkE1NFx1QzExQ1x1QjREQ1x1QUMwMCBcdUM1NDRcdUM5QzEgXHVBRDZDXHVENjA0XHVCNDE4XHVDOUMwIFx1QzU0QVx1Qzc0Q1xuICAgIC8vIFx1RDYwNFx1QzdBQ1x1QjI5NCBzdHViXHVDNzNDXHVCODVDIFx1Q0M5OFx1QjlBQ1x1RDU1OFx1QkE3MCwgXHVDRDk0XHVENkM0IFN5bmNTZXJ2aWNlXHVDNUQwIHJlY29uY2lsZSBcdUJBNTRcdUMxMUNcdUI0REMgXHVDRDk0XHVBQzAwIFx1RDU0NFx1QzY5NFxuICAgIGlmICh0eXBlb2YgKHN5bmNTZXJ2aWNlIGFzIGFueSkucmVjb25jaWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAoc3luY1NlcnZpY2UgYXMgYW55KS5yZWNvbmNpbGUobG9jYWxGaWxlcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJFUS0wMDg6IFx1QkFBOFx1QjRFMCBcdUJDRkNcdUQyQjhcdUM1RDAgXHVCMzAwXHVENTVDIFx1QzdBQ1x1QjNEOVx1QUUzMFx1RDY1NCBcdUJDRDFcdUI4MkMgXHVDMjE4XHVENTg5XG4gICAqXG4gICAqIEBwYXJhbSBhbGxGaWxlcyAtIFx1QkFBOFx1QjRFMCBcdUI4NUNcdUNFRUMgXHVEMzBDXHVDNzdDIFx1QkFBOVx1Qjg1RFxuICAgKi9cbiAgcmVjb25jaWxlQWxsKGFsbEZpbGVzOiBBcnJheTx7IHBhdGg6IHN0cmluZzsgaGFzaDogc3RyaW5nIH0+KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBtYXBwaW5nIG9mIHRoaXMubWFwcGluZ3MpIHtcbiAgICAgIGNvbnN0IHZhdWx0RmlsZXMgPSB0aGlzLmNvbGxlY3RGaWxlc0ZvclZhdWx0KG1hcHBpbmcudmF1bHRJZCwgYWxsRmlsZXMpO1xuICAgICAgdGhpcy5yZWNvbmNpbGVWYXVsdChtYXBwaW5nLnZhdWx0SWQsIHZhdWx0RmlsZXMpO1xuICAgIH1cbiAgfVxufVxuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICIvKipcbiAqIEluZGV4ZWREQiBTdG9yYWdlIExheWVyXG4gKiBTUEVDLVNZTkMtMDA2OiBcdUM2MDFcdUFENkMgXHVCQTU0XHVEMEMwXHVCMzcwXHVDNzc0XHVEMTMwIFx1QzgwMFx1QzdBNVx1QzE4QyAoZmlsZS1tZXRhLCBzeW5jLXF1ZXVlLCBzeW5jLXN0YXRlKVxuICogQE1YOkFOQ0hPUjogW0FVVE9dIFJFUS1JREItMDAxIHRvIFJFUS1JREItMDE1IC0gSW5kZXhlZERCIFx1Qjc5OFx1RDM3QyBcdUFENkNcdUQ2MDRcbiAqIEBNWDpSRUFTT046IFx1QkFBOFx1QjRFMCBJbmRleGVkREIgXHVDNUYwXHVDMEIwXHVDNzQwIFx1Qzc3NCBcdUQwNzRcdUI3OThcdUMyQTRcdUI5N0MgXHVEMUI1XHVENTc0IFx1QzIxOFx1RDU4OVx1QjQyOFxuICovXG5cbmltcG9ydCB7IG9wZW5EQiwgdHlwZSBJREJQRGF0YWJhc2UgfSBmcm9tICdpZGInO1xuXG5jb25zdCBEQl9OQU1FID0gJ3ZzeW5jLXN0b3JhZ2UnO1xuY29uc3QgREJfVkVSU0lPTiA9IDE7XG5cbi8vIFx1QzJBNFx1RDFBMFx1QzVCNCBcdUM3NzRcdUI5ODQgXHVDODE1XHVDNzU4XG5jb25zdCBTVE9SRV9GSUxFX01FVEEgPSAnZmlsZS1tZXRhJztcbmNvbnN0IFNUT1JFX1NZTkNfUVVFVUUgPSAnc3luYy1xdWV1ZSc7XG5jb25zdCBTVE9SRV9TWU5DX1NUQVRFID0gJ3N5bmMtc3RhdGUnO1xuXG4vLyBcdUM3NzhcdUIzNzFcdUMyQTQgXHVDNzc0XHVCOTg0IFx1QzgxNVx1Qzc1OFxuY29uc3QgSU5ERVhfVkFVTFRfSUQgPSAndmF1bHRJZCc7XG5jb25zdCBJTkRFWF9NVElNRSA9ICdtdGltZSc7XG5jb25zdCBJTkRFWF9USU1FU1RBTVAgPSAndGltZXN0YW1wJztcblxuLy8gVFRMIFx1QzBDMVx1QzIxOFxuY29uc3QgVFRMX01TID0gNyAqIDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIDcgZGF5c1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVNZXRhUmVjb3JkIHtcbiAgZmlsZUlkOiBzdHJpbmc7XG4gIGhhc2g6IHN0cmluZztcbiAgbXRpbWU6IG51bWJlcjtcbiAgbGFzdFN5bmNUaW1lOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3luY1F1ZXVlUmVjb3JkIHtcbiAgaWQ/OiBudW1iZXI7XG4gIHR5cGU6IHN0cmluZztcbiAgcGF5bG9hZDogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3luY1N0YXRlUmVjb3JkIHtcbiAgbG9jYWxNdGltZTogbnVtYmVyO1xuICBsb2NhbFNpemU6IG51bWJlcjtcbiAgcmVtb3RlTXRpbWU6IG51bWJlcjtcbiAgcmVtb3RlU2l6ZTogbnVtYmVyO1xuICBsYXN0U3luY0FjdGlvbjogJ3VwbG9hZGVkJyB8ICdkb3dubG9hZGVkJyB8ICdkZWxldGVkJyB8ICdza2lwcGVkJztcbn1cblxuaW50ZXJmYWNlIEJhdGNoU2V0RmlsZU1ldGFJdGVtIHtcbiAgdmF1bHRJZDogc3RyaW5nO1xuICBwYXRoOiBzdHJpbmc7XG4gIHJlY29yZDogRmlsZU1ldGFSZWNvcmQ7XG59XG5cbi8qKlxuICogSW5kZXhlZERCIFN0b3JhZ2UgTGF5ZXJcbiAqXG4gKiAzXHVBQzFDXHVDNzU4IFx1QUMxRFx1Q0NCNCBcdUM4MDBcdUM3QTVcdUMxOENcdUI5N0MgXHVDODFDXHVBQ0Y1XHVENTY5XHVCMkM4XHVCMkU0OlxuICogLSBmaWxlLW1ldGE6IFx1RDMwQ1x1Qzc3QyBcdUJBNTRcdUQwQzBcdUIzNzBcdUM3NzRcdUQxMzAgKGhhc2gsIG10aW1lLCBsYXN0U3luY1RpbWUpXG4gKiAtIHN5bmMtcXVldWU6IFx1QzYyNFx1RDUwNFx1Qjc3Q1x1Qzc3OCBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVEMDUwIChUVEwgN1x1Qzc3QylcbiAqIC0gc3luYy1zdGF0ZTogXHVEMzBDXHVDNzdDIFx1QjNEOVx1QUUzMFx1RDY1NCBcdUMwQzFcdUQwREMgKGxvY2FsL3JlbW90ZSBtdGltZSwgc2l6ZSlcbiAqXG4gKiBcdUJBQThcdUI0RTAgXHVCMzcwXHVDNzc0XHVEMTMwXHVCMjk0IHZhdWx0SWRcdUI4NUMgXHVDMkE0XHVDRjU0XHVENTA0XHVCNDI5XHVCMkM4XHVCMkU0IChSRVEtSURCLTAwMikuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmRleGVkREJTdG9yYWdlIHtcbiAgcHJpdmF0ZSBkYjogSURCUERhdGFiYXNlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFx1QjM3MFx1Qzc3NFx1RDEzMFx1QkNBMFx1Qzc3NFx1QzJBNCBcdUM1RjRcdUFFMzBcbiAgICogUkVRLUlEQi0wMDE6IFx1QjM3MFx1Qzc3NFx1RDEzMFx1QkNBMFx1Qzc3NFx1QzJBNCBcdUNEMDhcdUFFMzBcdUQ2NTRcbiAgICovXG4gIGFzeW5jIG9wZW5EQigpOiBQcm9taXNlPElEQlBEYXRhYmFzZT4ge1xuICAgIGlmICh0aGlzLmRiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICB0aGlzLmRiID0gYXdhaXQgb3BlbkRCKERCX05BTUUsIERCX1ZFUlNJT04sIHtcbiAgICAgIHVwZ3JhZGUoZGIpIHtcbiAgICAgICAgLy8gZmlsZS1tZXRhIFx1QzJBNFx1RDFBMFx1QzVCNCBcdUMwRERcdUMxMzFcbiAgICAgICAgaWYgKCFkYi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKFNUT1JFX0ZJTEVfTUVUQSkpIHtcbiAgICAgICAgICBjb25zdCBmaWxlTWV0YVN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoU1RPUkVfRklMRV9NRVRBKTtcbiAgICAgICAgICBmaWxlTWV0YVN0b3JlLmNyZWF0ZUluZGV4KElOREVYX1ZBVUxUX0lELCBJTkRFWF9WQVVMVF9JRCwgeyB1bmlxdWU6IGZhbHNlIH0pO1xuICAgICAgICAgIGZpbGVNZXRhU3RvcmUuY3JlYXRlSW5kZXgoSU5ERVhfTVRJTUUsIElOREVYX01USU1FLCB7IHVuaXF1ZTogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzeW5jLXF1ZXVlIFx1QzJBNFx1RDFBMFx1QzVCNCBcdUMwRERcdUMxMzEgKGF1dG8taW5jcmVtZW50IGtleSlcbiAgICAgICAgaWYgKCFkYi5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKFNUT1JFX1NZTkNfUVVFVUUpKSB7XG4gICAgICAgICAgY29uc3Qgc3luY1F1ZXVlU3RvcmUgPSBkYi5jcmVhdGVPYmplY3RTdG9yZShTVE9SRV9TWU5DX1FVRVVFLCB7XG4gICAgICAgICAgICBrZXlQYXRoOiAnaWQnLFxuICAgICAgICAgICAgYXV0b0luY3JlbWVudDogdHJ1ZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzeW5jUXVldWVTdG9yZS5jcmVhdGVJbmRleChJTkRFWF9USU1FU1RBTVAsIElOREVYX1RJTUVTVEFNUCwgeyB1bmlxdWU6IGZhbHNlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3luYy1zdGF0ZSBcdUMyQTRcdUQxQTBcdUM1QjQgXHVDMEREXHVDMTMxXG4gICAgICAgIGlmICghZGIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhTVE9SRV9TWU5DX1NUQVRFKSkge1xuICAgICAgICAgIGNvbnN0IHN5bmNTdGF0ZVN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoU1RPUkVfU1lOQ19TVEFURSk7XG4gICAgICAgICAgc3luY1N0YXRlU3RvcmUuY3JlYXRlSW5kZXgoSU5ERVhfVkFVTFRfSUQsIElOREVYX1ZBVUxUX0lELCB7IHVuaXF1ZTogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5kYjtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUIzNzBcdUM3NzRcdUQxMzBcdUJDQTBcdUM3NzRcdUMyQTQgXHVCMkVCXHVBRTMwXG4gICAqL1xuICBjbG9zZURCKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRiKSB7XG4gICAgICB0aGlzLmRiLmNsb3NlKCk7XG4gICAgICB0aGlzLmRiID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXHVEMzBDXHVDNzdDIFx1QkE1NFx1RDBDMFx1QjM3MFx1Qzc3NFx1RDEzMCBcdUM4MDBcdUM3QTVcbiAgICogUkVRLUlEQi0wMDM6IFx1QkFBOFx1QjRFMCBcdUM1RjBcdUMwQjBcdUM3NDAgXHVCRTQ0XHVCM0Q5XHVBRTMwXG4gICAqL1xuICBhc3luYyBzZXRGaWxlTWV0YSh2YXVsdElkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcmVjb3JkOiBGaWxlTWV0YVJlY29yZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3Qgb3BlbmVkLiBDYWxsIG9wZW5EQigpIGZpcnN0LicpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGAke3ZhdWx0SWR9OiR7cGF0aH1gO1xuICAgIGF3YWl0IHRoaXMuZGIucHV0KFNUT1JFX0ZJTEVfTUVUQSwgeyAuLi5yZWNvcmQsIGtleSB9LCBrZXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1RDMwQ1x1Qzc3QyBcdUJBNTRcdUQwQzBcdUIzNzBcdUM3NzRcdUQxMzAgXHVDODcwXHVENjhDXG4gICAqL1xuICBhc3luYyBnZXRGaWxlTWV0YSh2YXVsdElkOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFByb21pc2U8RmlsZU1ldGFSZWNvcmQgfCB1bmRlZmluZWQ+IHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2Ugbm90IG9wZW5lZC4gQ2FsbCBvcGVuREIoKSBmaXJzdC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBgJHt2YXVsdElkfToke3BhdGh9YDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmRiLmdldChTVE9SRV9GSUxFX01FVEEsIGtleSk7XG5cbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBrZXkgXHVENTQ0XHVCNERDIFx1QzgxQ1x1QUM3MCBcdUQ2QzQgXHVCQzE4XHVENjU4XG4gICAgY29uc3QgeyBrZXk6IF8sIC4uLnJlY29yZCB9ID0gcmVzdWx0O1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICogXHVEMzBDXHVDNzdDIFx1QkE1NFx1RDBDMFx1QjM3MFx1Qzc3NFx1RDEzMCBcdUMwQURcdUM4MUNcbiAgICovXG4gIGFzeW5jIGRlbGV0ZUZpbGVNZXRhKHZhdWx0SWQ6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBvcGVuZWQuIENhbGwgb3BlbkRCKCkgZmlyc3QuJyk7XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gYCR7dmF1bHRJZH06JHtwYXRofWA7XG4gICAgYXdhaXQgdGhpcy5kYi5kZWxldGUoU1RPUkVfRklMRV9NRVRBLCBrZXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QkNGQ1x1RDJCOFx1Qzc1OCBcdUJBQThcdUI0RTAgXHVEMzBDXHVDNzdDIFx1QkE1NFx1RDBDMFx1QjM3MFx1Qzc3NFx1RDEzMCBcdUM4NzBcdUQ2OENcbiAgICovXG4gIGFzeW5jIGdldEFsbEZpbGVNZXRhQnlWYXVsdCh2YXVsdElkOiBzdHJpbmcpOiBQcm9taXNlPEZpbGVNZXRhUmVjb3JkW10+IHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2Ugbm90IG9wZW5lZC4gQ2FsbCBvcGVuREIoKSBmaXJzdC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5kYi5nZXRBbGwoU1RPUkVfRklMRV9NRVRBKTtcbiAgICBjb25zdCB2YXVsdFJlY29yZHMgPSByZXN1bHRzXG4gICAgICAuZmlsdGVyKChyZWNvcmQ6IGFueSkgPT4gcmVjb3JkLmtleSAmJiByZWNvcmQua2V5LnN0YXJ0c1dpdGgoYCR7dmF1bHRJZH06YCkpXG4gICAgICAubWFwKChyZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCB7IGtleTogXywgLi4ubWV0YSB9ID0gcmVjb3JkO1xuICAgICAgICByZXR1cm4gbWV0YTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhdWx0UmVjb3JkcztcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUJDRkNcdUQyQjhcdUM3NTggXHVCQUE4XHVCNEUwIFx1RDMwQ1x1Qzc3QyBcdUI5RTRcdUQ1NTEgXHVDODcwXHVENjhDIChwYXRoIFx1RDNFQ1x1RDU2OClcbiAgICogRmlsZUlkVHJhY2tlclx1QzVEMFx1QzExQyBcdUMwQUNcdUM2QTlcdUQ1NThcdUFFMzAgXHVDNzA0XHVENTVDIFx1RDVFQ1x1RDM3QyBcdUJBNTRcdUMxMUNcdUI0RENcbiAgICovXG4gIGFzeW5jIGdldEFsbEZpbGVNYXBwaW5nc0J5VmF1bHQodmF1bHRJZDogc3RyaW5nKTogUHJvbWlzZTxBcnJheTx7IHBhdGg6IHN0cmluZzsgZmlsZUlkOiBzdHJpbmcgfT4+IHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2Ugbm90IG9wZW5lZC4gQ2FsbCBvcGVuREIoKSBmaXJzdC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5kYi5nZXRBbGwoU1RPUkVfRklMRV9NRVRBKTtcbiAgICBjb25zdCB2YXVsdFJlY29yZHMgPSByZXN1bHRzXG4gICAgICAuZmlsdGVyKChyZWNvcmQ6IGFueSkgPT4gcmVjb3JkLmtleSAmJiByZWNvcmQua2V5LnN0YXJ0c1dpdGgoYCR7dmF1bHRJZH06YCkpXG4gICAgICAubWFwKChyZWNvcmQ6IGFueSkgPT4ge1xuICAgICAgICAvLyBrZXlcdUM1RDBcdUMxMUMgcGF0aCBcdUNEOTRcdUNEOUM6IFwidmF1bHRJZDpwYXRoXCIgLT4gXCJwYXRoXCJcbiAgICAgICAgY29uc3QgcGF0aCA9IHJlY29yZC5rZXkuc3Vic3RyaW5nKGAke3ZhdWx0SWR9OmAubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHsgcGF0aCwgZmlsZUlkOiByZWNvcmQuZmlsZUlkIH07XG4gICAgICB9KTtcblxuICAgIHJldHVybiB2YXVsdFJlY29yZHM7XG4gIH1cblxuICAvKipcbiAgICogXHVDNUVDXHVCN0VDIFx1RDMwQ1x1Qzc3QyBcdUJBNTRcdUQwQzBcdUIzNzBcdUM3NzRcdUQxMzAgXHVDNzdDXHVBRDA0IFx1QzgwMFx1QzdBNSAoUkVRLUlEQi0wMTUpXG4gICAqIFx1RDJCOFx1Qjc5Q1x1QzdBRFx1QzE1OFx1QzczQ1x1Qjg1QyBcdUM2RDBcdUM3OTBcdUMxMzEgXHVCQ0Y0XHVDN0E1XG4gICAqL1xuICBhc3luYyBiYXRjaFNldEZpbGVNZXRhKGl0ZW1zOiBCYXRjaFNldEZpbGVNZXRhSXRlbVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBvcGVuZWQuIENhbGwgb3BlbkRCKCkgZmlyc3QuJyk7XG4gICAgfVxuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHR4ID0gdGhpcy5kYi50cmFuc2FjdGlvbihTVE9SRV9GSUxFX01FVEEsICdyZWFkd3JpdGUnKTtcbiAgICBjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlKFNUT1JFX0ZJTEVfTUVUQSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGl0ZW1zLm1hcCgoeyB2YXVsdElkLCBwYXRoLCByZWNvcmQgfSkgPT4ge1xuICAgICAgICBjb25zdCBrZXkgPSBgJHt2YXVsdElkfToke3BhdGh9YDtcbiAgICAgICAgcmV0dXJuIHN0b3JlLnB1dCh7IC4uLnJlY29yZCwga2V5IH0sIGtleSk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBhd2FpdCB0eC5kb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QjNEOVx1QUUzMFx1RDY1NCBcdUQwNTAgXHVDNTQ0XHVDNzc0XHVEMTVDIFx1Q0Q5NFx1QUMwMFxuICAgKiBcdUM3OTBcdUIzRDkgXHVDOTlEXHVBQzAwIElEIFx1QkMxOFx1RDY1OFxuICAgKi9cbiAgYXN5bmMgYWRkU3luY1F1ZXVlSXRlbShpdGVtOiBPbWl0PFN5bmNRdWV1ZVJlY29yZCwgJ2lkJz4pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3Qgb3BlbmVkLiBDYWxsIG9wZW5EQigpIGZpcnN0LicpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IHRoaXMuZGIuYWRkKFNUT1JFX1NZTkNfUVVFVUUsIHtcbiAgICAgIC4uLml0ZW0sXG4gICAgICB0aW1lc3RhbXA6IGl0ZW0udGltZXN0YW1wLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGtleSBhcyBudW1iZXI7XG4gIH1cblxuICAvKipcbiAgICogXHVCM0Q5XHVBRTMwXHVENjU0IFx1RDA1MCBcdUM1NDRcdUM3NzRcdUQxNUMgXHVDODcwXHVENjhDIChUVEwgXHVENTQ0XHVEMTMwXHVCOUMxIFx1RDNFQ1x1RDU2OClcbiAgICogUkVRLUlEQi0wMTA6IFx1QjlDQ1x1QjhDQyBcdUM1NDRcdUM3NzRcdUQxNUMgXHVDNzkwXHVCM0Q5IFx1QzgxQ1x1QUM3MCAoN1x1Qzc3QyBUVEwpXG4gICAqL1xuICBhc3luYyBnZXRTeW5jUXVldWVJdGVtcygpOiBQcm9taXNlPFN5bmNRdWV1ZVJlY29yZFtdPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBvcGVuZWQuIENhbGwgb3BlbkRCKCkgZmlyc3QuJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBhbGxJdGVtcyA9IGF3YWl0IHRoaXMuZGIuZ2V0QWxsKFNUT1JFX1NZTkNfUVVFVUUpO1xuXG4gICAgLy8gVFRMIFx1RDU0NFx1RDEzMFx1QjlDMVxuICAgIGNvbnN0IHZhbGlkSXRlbXMgPSBhbGxJdGVtcy5maWx0ZXIoKGl0ZW0pID0+IG5vdyAtIGl0ZW0udGltZXN0YW1wIDwgVFRMX01TKTtcblxuICAgIC8vIFx1QjlDQ1x1QjhDQ1x1QjQxQyBcdUM1NDRcdUM3NzRcdUQxNUMgXHVDMEFEXHVDODFDIChcdUJDMzFcdUFERjhcdUI3N0NcdUM2QjRcdUI0RENcdUM1RDBcdUMxMUMgXHVCRTQ0XHVCM0Q5XHVBRTMwXHVDODAxXHVDNzNDXHVCODVDKVxuICAgIGlmICh2YWxpZEl0ZW1zLmxlbmd0aCA8IGFsbEl0ZW1zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdHggPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFNUT1JFX1NZTkNfUVVFVUUsICdyZWFkd3JpdGUnKTtcbiAgICAgIGNvbnN0IHN0b3JlID0gdHgub2JqZWN0U3RvcmUoU1RPUkVfU1lOQ19RVUVVRSk7XG5cbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBhbGxJdGVtcykge1xuICAgICAgICBpZiAobm93IC0gaXRlbS50aW1lc3RhbXAgPj0gVFRMX01TKSB7XG4gICAgICAgICAgYXdhaXQgc3RvcmUuZGVsZXRlKGl0ZW0uaWQhKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhd2FpdCB0eC5kb25lO1xuICAgIH1cblxuICAgIC8vIFx1RDBDMFx1Qzc4NFx1QzJBNFx1RDBFQ1x1RDUwNCBcdUMyMUMgXHVDODE1XHVCODJDIChcdUM2MjRcdUI5ODRcdUNDMjhcdUMyMUMpXG4gICAgcmV0dXJuIHZhbGlkSXRlbXMuc29ydCgoYSwgYikgPT4gYS50aW1lc3RhbXAgLSBiLnRpbWVzdGFtcCk7XG4gIH1cblxuICAvKipcbiAgICogXHVBQzAwXHVDN0E1IFx1QzYyNFx1Qjc5OFx1QjQxQyBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVEMDUwIFx1QzU0NFx1Qzc3NFx1RDE1QyBcdUMwQURcdUM4MUNcbiAgICovXG4gIGFzeW5jIGRlbGV0ZU9sZGVzdFN5bmNRdWV1ZUl0ZW0oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBvcGVuZWQuIENhbGwgb3BlbkRCKCkgZmlyc3QuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCB0aGlzLmRiLmdldEFsbChTVE9SRV9TWU5DX1FVRVVFKTtcbiAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHVEMEMwXHVDNzg0XHVDMkE0XHVEMEVDXHVENTA0XHVBQzAwIFx1QUMwMFx1QzdBNSBcdUM2MjRcdUI3OThcdUI0MUMgXHVDNTQ0XHVDNzc0XHVEMTVDIFx1Q0MzRVx1QUUzMFxuICAgIGNvbnN0IG9sZGVzdCA9IGl0ZW1zLnJlZHVjZSgocHJldiwgY3VycmVudCkgPT5cbiAgICAgIHByZXYudGltZXN0YW1wIDwgY3VycmVudC50aW1lc3RhbXAgPyBwcmV2IDogY3VycmVudFxuICAgICk7XG5cbiAgICBpZiAob2xkZXN0LmlkKSB7XG4gICAgICBhd2FpdCB0aGlzLmRiLmRlbGV0ZShTVE9SRV9TWU5DX1FVRVVFLCBvbGRlc3QuaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVEMDUwIFx1QkU0NFx1QzZCMFx1QUUzMFxuICAgKi9cbiAgYXN5bmMgY2xlYXJTeW5jUXVldWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBvcGVuZWQuIENhbGwgb3BlbkRCKCkgZmlyc3QuJyk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5kYi5jbGVhcihTVE9SRV9TWU5DX1FVRVVFKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVEMDUwIFx1QzU0NFx1Qzc3NFx1RDE1QyBcdUFDMUNcdUMyMTggXHVDODcwXHVENjhDXG4gICAqL1xuICBhc3luYyBjb3VudFN5bmNRdWV1ZUl0ZW1zKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmRiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGFiYXNlIG5vdCBvcGVuZWQuIENhbGwgb3BlbkRCKCkgZmlyc3QuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZGIuY291bnQoU1RPUkVfU1lOQ19RVUVVRSk7XG4gIH1cblxuICAvKipcbiAgICogXHVCM0Q5XHVBRTMwXHVENjU0IFx1RDA1MCBcdUM1NDRcdUM3NzRcdUQxNUMgXHVDMEFEXHVDODFDIChJRFx1Qjg1QylcbiAgICovXG4gIGFzeW5jIGRlbGV0ZVN5bmNRdWV1ZUl0ZW0oaWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3Qgb3BlbmVkLiBDYWxsIG9wZW5EQigpIGZpcnN0LicpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuZGIuZGVsZXRlKFNUT1JFX1NZTkNfUVVFVUUsIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMEMxXHVEMERDIFx1QzgwMFx1QzdBNVxuICAgKi9cbiAgYXN5bmMgc2V0U3luY1N0YXRlKHZhdWx0SWQ6IHN0cmluZywgcGF0aDogc3RyaW5nLCByZWNvcmQ6IFN5bmNTdGF0ZVJlY29yZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5kYikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBub3Qgb3BlbmVkLiBDYWxsIG9wZW5EQigpIGZpcnN0LicpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGAke3ZhdWx0SWR9OiR7cGF0aH1gO1xuICAgIGF3YWl0IHRoaXMuZGIucHV0KFNUT1JFX1NZTkNfU1RBVEUsIHsgLi4ucmVjb3JkLCBrZXkgfSwga2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdUIzRDlcdUFFMzBcdUQ2NTQgXHVDMEMxXHVEMERDIFx1Qzg3MFx1RDY4Q1xuICAgKi9cbiAgYXN5bmMgZ2V0U3luY1N0YXRlKHZhdWx0SWQ6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUHJvbWlzZTxTeW5jU3RhdGVSZWNvcmQgfCB1bmRlZmluZWQ+IHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2Ugbm90IG9wZW5lZC4gQ2FsbCBvcGVuREIoKSBmaXJzdC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBgJHt2YXVsdElkfToke3BhdGh9YDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmRiLmdldChTVE9SRV9TWU5DX1NUQVRFLCBrZXkpO1xuXG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgeyBrZXk6IF8sIC4uLnN0YXRlIH0gPSByZXN1bHQ7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFx1QjNEOVx1QUUzMFx1RDY1NCBcdUMwQzFcdUQwREMgXHVDMEFEXHVDODFDXG4gICAqL1xuICBhc3luYyBkZWxldGVTeW5jU3RhdGUodmF1bHRJZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2Ugbm90IG9wZW5lZC4gQ2FsbCBvcGVuREIoKSBmaXJzdC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBgJHt2YXVsdElkfToke3BhdGh9YDtcbiAgICBhd2FpdCB0aGlzLmRiLmRlbGV0ZShTVE9SRV9TWU5DX1NUQVRFLCBrZXkpO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFNQSxJQUFBQSxtQkFBcUU7OztBQ005RCxJQUFNLG1CQUFrQztBQUFBLEVBQzdDLFdBQVc7QUFBQSxFQUNYLFNBQVM7QUFBQSxFQUNULFFBQVE7QUFBQSxFQUNSLFVBQVU7QUFBQSxFQUNWLGFBQWE7QUFBQSxFQUNiLGNBQWMsQ0FBQztBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsYUFBYTtBQUFBLEVBQ2IsV0FBVztBQUFBO0FBQUEsRUFDWCxlQUFlLENBQUM7QUFBQTtBQUFBLEVBQ2hCLFVBQVU7QUFBQTtBQUNaO0FBZU8sU0FBUyxvQkFBb0IsVUFBd0M7QUFFMUUsTUFBSSxTQUFTLGlCQUFpQixTQUFTLGNBQWMsU0FBUyxHQUFHO0FBQy9ELFdBQU87QUFBQSxFQUNUO0FBR0EsTUFBSSxDQUFDLFNBQVMsV0FBVyxTQUFTLFFBQVEsS0FBSyxNQUFNLElBQUk7QUFDdkQsV0FBTztBQUFBLE1BQ0wsR0FBRztBQUFBLE1BQ0gsZUFBZSxDQUFDO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBR0EsTUFBSSxDQUFDLFNBQVMsVUFBVSxTQUFTLE9BQU8sS0FBSyxNQUFNLElBQUk7QUFDckQsWUFBUSxLQUFLLHVKQUE2RDtBQUMxRSxXQUFPO0FBQUEsTUFDTCxHQUFHO0FBQUEsTUFDSCxlQUFlLENBQUM7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFJQSxTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDYjtBQUFBLFFBQ0UsUUFBUTtBQUFBO0FBQUEsUUFDUixTQUFTLFNBQVM7QUFBQSxRQUNsQixRQUFRLFNBQVM7QUFB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QUFDLFlBQVksaUJBQWlCO0FBRWhELFFBQUksQ0FBQyxVQUFVO0FBQ2IsV0FBSyxRQUFRLENBQUMsU0FBUztBQUNyQixhQUFLLFNBQVMsd0NBQVUsRUFDckIsUUFBUSxNQUFNLGdCQUNYLElBQUksV0FBVyxLQUFLLEtBQUssTUFBTSxZQUFZLEVBQUUsS0FBSyxJQUNsRCxZQUFZLENBQUM7QUFBQSxNQUNyQixDQUFDO0FBQUEsSUFDSCxPQUFPO0FBQ0wsWUFBTSxlQUFlLGlCQUFpQixjQUFjLHVCQUNsRCxlQUFlLElBQUksS0FBSyxZQUFZLEVBQUUsbUJBQW1CLE9BQU8sSUFBSTtBQUV0RSxXQUFLLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGFBQUssU0FBUyxzQ0FBYSxZQUFZLEdBQUcsRUFDdkMsUUFBUSxNQUFNO0FBQ2IsZ0JBQU0sTUFBTSxDQUFDLE1BQU0sTUFBTSxNQUFNLFdBQVcsRUFBRSxTQUFTLFlBQXNCLElBQ3ZFLGVBQ0E7QUFDSixjQUFJLFdBQVcsS0FBSyxLQUFLLE1BQU0sY0FBYyxHQUFHLEVBQUUsS0FBSztBQUFBLFFBQ3pELENBQUM7QUFBQSxNQUNMLENBQUM7QUFDRCxXQUFLLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGFBQUssU0FBUywyQkFBTyxFQUNsQixRQUFRLE1BQU0sYUFBYSxVQUFVLElBQUksQ0FBQztBQUFBLE1BQy9DLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUVGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJub2RlcyIsICJpbXBvcnRfb2JzaWRpYW4iLCAidmFsdWUiLCAic2hhcmVVcmwiLCAic2hhcmVFeHBpcmVzIiwgInNoYXJlSWQiLCAiaW1wb3J0X29ic2lkaWFuIiwgInRhcmdldCJdCn0K
