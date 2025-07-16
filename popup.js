// popup.js

// --- 新增：可重用的注入函数 ---
async function injectScriptToCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    const tabId = tabs[0].id;
    try {
      // 在目标标签页中执行 content.js
      // executeScript 会重新加载并运行整个脚本
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
    } catch (e) {
      console.error("Failed to inject script:", e);
      // 可能是由于页面限制（如 chrome:// 页面）导致的错误
    }
  }
}

// 将所有逻辑包裹在一个异步函数中，以便使用 await
async function initializePopup() {
  
  // 异步获取配置
  const config = await window.Config.get();

  // 初始化语言
  window.I18N.setLang(config.lang);

  function renderTexts() {
    document.getElementById('title').innerText = window.I18N.t('preview');
    document.getElementById('helpTitle').innerText = window.I18N.t('help');
    document.getElementById('helpText').innerText = window.I18N.t('help');
    document.getElementById('langLabel').innerText = window.I18N.t('language') || 'Language:';
    document.getElementById('themeLabel').innerText = window.I18N.t('theme') || 'Theme:';
    document.getElementById('sitesLabel').innerText = window.I18N.t('sites') || 'Sites:';
    document.getElementById('enableLabel').innerText = window.I18N.t('enable') || 'Enable Features:';
    document.getElementById('manualInjectButton').innerText = window.I18N.t('manualInject') || 'Manual Inject';
    document.getElementById('saveSitesButton').innerText = window.I18N.t('saveSites') || 'Save Sites';
    document.getElementById('version').innerText = 'v2.1.0 | made with ❤️ by Xingrui Zhou';
  }

  function applyTheme(theme) {
    let t = theme;
    if (t === 'auto') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add('theme-' + t);
  }

  // 1. 渲染文本
  renderTexts();
  window.I18N.onChange(renderTexts);

  // --- 新增逻辑：初始化总开关的状态 ---
  const globalEnableSwitch = document.getElementById('globalEnableSwitch');
  globalEnableSwitch.checked = config.isGloballyEnabled;
  // ------------------------------------

  // 2. 使用已获取的配置初始化UI
  document.getElementById('langSelect').value = config.lang;
  document.getElementById('themeSelect').value = config.theme;
  document.getElementById('sitesInput').value = (config.enabledSites || []).join(',');
  applyTheme(config.theme);


   // --- 修改：为总开关增加“关闭时清理”的逻辑 ---
  globalEnableSwitch.addEventListener('change', async function() {
    const currentConfig = await window.Config.get();
    currentConfig.isGloballyEnabled = this.checked;
    await window.Config.set(currentConfig);

    // 获取当前标签页
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    const tabId = tabs[0].id;

    if (this.checked) {
      // 如果是“开启”操作，则执行注入
      try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        });
      } catch (e) { console.error("Injection failed:", e); }
    } else {
      // 如果是“关闭”操作，则执行清理
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: () => {
            // 检查函数是否存在，防止在不支持的页面报错
            if(typeof window.cleanupImagePreviewer === 'function') {
                window.cleanupImagePreviewer();
                console.log("Cleanup done");
            }
          }
        });
      } catch (e) { console.error("Cleanup failed:", e); }
    }
  });

  // 3. 设置事件监听器
  // --- 新增：为手动注入按钮添加事件监听 ---
  document.getElementById('manualInjectButton').addEventListener('click', injectScriptToCurrentTab);
  // ------------------------------------
  document.getElementById('langSelect').addEventListener('change', async function() {
    const currentConfig = await window.Config.get();
    currentConfig.lang = this.value;
    await window.Config.set(currentConfig);
    window.I18N.setLang(this.value);
  });

  document.getElementById('themeSelect').addEventListener('change', async function() {
    const currentConfig = await window.Config.get();
    currentConfig.theme = this.value;
    await window.Config.set(currentConfig);
    applyTheme(this.value);
  });

  document.getElementById('saveSitesButton').addEventListener('click', async function() {
    const currentConfig = await window.Config.get();
    const sitesInput = document.getElementById('sitesInput');
    currentConfig.enabledSites = sitesInput.value.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    await window.Config.set(currentConfig);
    
    // 提供保存反馈
    const button = this;
    button.textContent = 'Saved!';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = 'Save';
      button.disabled = false;
    }, 1500);
  });
}

// 当DOM加载完成后，执行初始化函数
document.addEventListener('DOMContentLoaded', initializePopup);