// config.js
const DEFAULT_CONFIG = {
  isGloballyEnabled: true,
  minScale: 0.2,
  maxScale: 10,
  zoomStep: 0.2,
  exitRatio: 0.3,
  groupSelector: '.sn-container, .container, body',
  theme: 'auto',
  lang: 'auto',
  enableKeyboard: true,
  enableDownload: true,
  enableRotate: true,
  enableGroup: true,
  enableLoading: true,
  enabledSites: [
    "service-now.com",
    "servicenow.com"
  ]
};

const CONFIG_KEY = 'sn_image_previewer_config';

const Config = {
  // 获取存储中的所有配置，并与默认配置合并
  get: async function() {
    try {
      const result = await chrome.storage.local.get(CONFIG_KEY);
      // 如果存储中没有数据，result[CONFIG_KEY] 会是 undefined
      const storedConfig = result[CONFIG_KEY] || {};
      return { ...DEFAULT_CONFIG, ...storedConfig };
    } catch (e) {
      console.error("Error reading config:", e);
      return { ...DEFAULT_CONFIG }; // 出错时返回默认配置
    }
  },

  // 将新的配置对象完整地保存到存储中
  set: async function(newConfig) {
     try {
        await chrome.storage.local.set({ [CONFIG_KEY]: newConfig });
     } catch(e) {
        console.error("Error setting config:", e);
     }
  }
};

window.Config = Config;