// content.js

// 检查所有核心函数和类是否已加载，如果没有，则进行定义。
// 这可以防止手动注入时发生“重复声明”的错误。
if (typeof window.ImagePreviewerCoreLoaded === 'undefined') {
  window.ImagePreviewerCoreLoaded = true;

  // 全局变量，用于追踪活动的注入器实例和其观察者
  window.activeImagePreviewer = {
    instance: null,
    observers: []
  };

  // 全局清理函数
  window.cleanupImagePreviewer = function() {
    if (window.activeImagePreviewer.instance) {
      // 停止所有活动的观察者
      window.activeImagePreviewer.observers.forEach(obs => obs.disconnect());
      window.activeImagePreviewer.observers = [];
      
      // 移除之前添加的标记元素
      const marker = document.querySelector('.service-now-image-injector-instance');
      if (marker) marker.remove();

      // 将所有图片的鼠标样式恢复原样
      document.querySelectorAll('img[style*="cursor: zoom-in"]').forEach(img => {
        img.style.cursor = '';
        // 移除标记，以便可以重新注入
        delete img.__serviceNowPreviewAttached;
      });
      
      window.activeImagePreviewer.instance = null;
    }
  };

  // 辅助函数：获取图片有效 src
  window.getImageSrc = function(img) {
    return img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
  };

  // 辅助函数：应用主题
  window.applyThemeToDocument = function(doc, theme) {
    let t = theme;
    if (t === 'auto') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    doc.body.classList.remove('theme-dark', 'theme-light');
    doc.body.classList.add('theme-' + t);
  };

  // 将主类定义挂载到 window，确保它只被定义一次
  window.ServiceNowImageInjector = class {
    constructor(config) {
      this.config = config;
      this.injectedFrames = new Set();
      this.init();
    }

    init() {
      const marker = document.createElement('div');
      marker.className = 'service-now-image-injector-instance';
      document.body.appendChild(marker);
      this.injectToServiceNow();
      this.observePageChanges();
      this.startPeriodicCheck();
    }

    getGsftMainDocument() {
      try {
        const macro = document.querySelector("macroponent-f51912f4c700201072b211d4d8c26010");
        if (macro?.shadowRoot) {
          const iframe = macro.shadowRoot.querySelector("#gsft_main");
          if (iframe?.contentDocument) {
            return iframe.contentDocument;
          }
        }
      } catch (e) {
        // Cross-origin or other errors
      }
      return null;
    }

    onIframeReady(doc, callback) {
      if (!doc) return;
      if (doc.readyState === "complete" || doc.readyState === "interactive") {
        callback();
      } else {
        doc.addEventListener("DOMContentLoaded", callback, { once: true });
      }
    }

    injectImagePreviewer(doc) {
      if (!doc || doc.__serviceNowImagePreviewerInjected) return;
      const id = doc.location.href;
      if (this.injectedFrames.has(id)) return;
      
      // 在注入前将旧的标记清除，以应对页面导航
      delete doc.__serviceNowImagePreviewerInjected;

      doc.__serviceNowImagePreviewerInjected = true;
      this.injectedFrames.add(id);
      window.applyThemeToDocument(doc, this.config.theme);
      this.attachImagePreview(doc, doc.body.querySelectorAll('img'));
      this.observeImageChanges(doc);
    }

    attachImagePreview(doc, imgList) {
      if (!doc || !imgList) return;
      imgList.forEach(img => {
        if (img.__serviceNowPreviewAttached || (img.parentElement && img.parentElement.closest('a, button'))) return;
        
        const inject = () => {
          if (img.__serviceNowPreviewAttached) return;
          img.__serviceNowPreviewAttached = true;
          img.style.cursor = 'zoom-in';
          
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const container = img.closest(this.config.groupSelector) || doc.body;
            const groupImgs = Array.from(container.querySelectorAll('img')).filter(i => i.complete && i.naturalWidth > 0).map(i => ({ src: window.getImageSrc(i), alt: i.alt || '' }));
            const thisSrc = window.getImageSrc(img);
            const currentIdx = groupImgs.findIndex(i => i.src === thisSrc);
            const options = { ...this.config, group: groupImgs, groupIndex: Math.max(0, currentIdx) };
            new ImagePreviewer(img, options);
          });
        };

        if (img.complete && img.naturalWidth > 0) {
          inject();
        } else {
          img.addEventListener('load', inject, { once: true });
          img.addEventListener('error', () => { img.__serviceNowPreviewAttached = true; });
        }
      });
    }

    observeImageChanges(doc) {
      if (!doc || !doc.body) return;
      const obs = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
              if (images.length > 0) {
                  this.attachImagePreview(doc, images);
              }
            }
          });
        });
      });
      obs.observe(doc.body, { childList: true, subtree: true });
      window.activeImagePreviewer.observers.push(obs);
    }
    
    observePageChanges() {
      const obs = new MutationObserver(() => this.injectToServiceNow());
      obs.observe(document.body, { childList: true, subtree: true });
      window.activeImagePreviewer.observers.push(obs);
    }
    
    startPeriodicCheck() {
      const intervalId = setInterval(() => this.injectToServiceNow(), 5000);
      // 将 intervalId 也存入 observers，以便清理
      window.activeImagePreviewer.observers.push({ disconnect: () => clearInterval(intervalId) });
    }
    
    injectToServiceNow() {
      const doc = this.getGsftMainDocument();
      if (doc) {
        this.onIframeReady(doc, () => this.injectImagePreviewer(doc));
      }
    }
  };
}


// 主要执行逻辑函数
async function main() {
  // 在执行任何操作前，先调用清理函数，确保环境干净
  if(typeof window.cleanupImagePreviewer === 'function') {
      window.cleanupImagePreviewer();
  }

  const config = await window.Config.get();
  
  if (!config.isGloballyEnabled) {
    return;
  }

  window.I18N.setLang(config.lang);
  const hostname = window.location.hostname;

  let isEnabled = false;
  if (Array.isArray(config.enabledSites) && config.enabledSites.length > 0) {
    isEnabled = config.enabledSites.some(site => {
      return typeof site === 'string' && site.trim() !== '' && hostname.endsWith(site.trim());
    });
  }
  
  if (!isEnabled) {
    return;
  }

  // 创建新实例并保存到全局变量中
  window.activeImagePreviewer.instance = new window.ServiceNowImageInjector(config);
}

// 每次注入时都执行 main 函数
main();