// i18n.js

const I18N_DICT = {
  en: {
    preview: "Preview image",
    close: "Close",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    reset: "Reset",
    download: "Download",
    rotate: "Rotate",
    prev: "Previous",
    next: "Next",
    loading: "Loading...",
    error: "Failed to load image",
    help: "Click image to preview. Use mouse wheel to zoom, drag to move, ESC to close, ←/→ to switch.",
    language: "Language:",
    theme: "Theme:",
    sites: "Enabled Sites:",
    enable: "Enable Features:",
    manualInject: "Manual Inject",
    saveSites: "Save Sites"
  },
  zh: {
    preview: "图片预览",
    close: "关闭",
    zoomIn: "放大",
    zoomOut: "缩小",
    reset: "重置",
    download: "下载",
    rotate: "旋转",
    prev: "上一张",
    next: "下一张",
    loading: "加载中...",
    error: "图片加载失败",
    help: "点击图片可预览。鼠标滚轮缩放，拖拽移动，ESC关闭，←/→切换。",
    language: "语言:",
    theme: "主题:",
    sites: "适用于网站:",
    enable: "启用功能:",
    manualInject: "手动注入",
    saveSites: "保存网站"
  }
};

const I18N = {
  _lang: 'en',
  _listeners: [],
  setLang(lang) {
    if (!lang || lang === 'auto') {
      lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    }
    this._lang = I18N_DICT[lang] ? lang : 'en';
    this._listeners.forEach(fn => fn(this._lang));
  },
  t(key) {
    return I18N_DICT[this._lang][key] || key;
  },
  getLang() {
    return this._lang;
  },
  onChange(fn) {
    this._listeners.push(fn);
  }
};
window.I18N = I18N;