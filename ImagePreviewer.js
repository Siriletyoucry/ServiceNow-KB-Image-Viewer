// ImagePreviewer.js
//I18N
window.I18N.setLang(window.Config.get('lang') || 'auto');

const SVG_ICONS = {
  close: `<path d="M298 73L179 192L298 311L268 341L149 222L30 341L0 311L119 192L0 73L30 43L149 162L268 43Z"/>`,
  zoomIn: `<path d="M122 225Q150 225 173.50 211Q197 197 211 173.50Q225 150 225 122Q225 94 211 70Q197 46 173.50 32.50Q150 19 122 19Q94 19 70 32.50Q46 46 32.50 70Q19 94 19 122Q19 150 32.50 173.50Q46 197 70 211Q94 225 122 225ZM244 122Q244 155 227.50 183Q211 211 183 227.50Q155 244 122 244Q89 244 61 227.50Q33 211 16.50 183Q0 155 0 122Q0 89 16.50 61Q33 33 61 16.50Q89 0 122 0Q155 0 183 16.50Q211 33 227.50 61Q244 89 244 122ZM194 220Q195 221 196 222L268 295Q273 300 281 300Q289 300 294.50 294.50Q300 289 300 281Q300 273 295 268L220 194Q209 209 194 220ZM122 56Q126 56 128.50 59Q131 62 131 66L131 112L178 112Q182 112 185 115Q188 118 188 122Q188 126 185 128.50Q182 131 178 131L131 131L131 178Q131 182 128.50 185Q126 188 122 188Q118 188 115 185Q112 182 112 178L112 131L66 131Q62 131 59 128.50Q56 126 56 122Q56 118 59 115Q62 112 66 112L113 112L113 66Q112 62 115 59Q118 56 122 56Z"/>`,
  zoomOut: `<path d="M122 225Q150 225 173.50 211Q197 197 211 173.50Q225 150 225 122Q225 94 211 70Q197 46 173.50 32.50Q150 19 122 19Q94 19 70 32.50Q46 46 32.50 70Q19 94 19 122Q19 150 32.50 173.50Q46 197 70 211Q94 225 122 225ZM244 122Q244 155 227.50 183Q211 211 183 227.50Q155 244 122 244Q89 244 61 227.50Q33 211 16.50 183Q0 155 0 122Q0 89 16.50 61Q33 33 61 16.50Q89 0 122 0Q155 0 183 16.50Q211 33 227.50 61Q244 89 244 122ZM194,220L268,295L281,300L294,294L300,281L295,268L220,194L209,209L194,220ZM56,122L178,112L185,115L188,118L188,122L185,128.5L178,131L66,131L59,128.5L56,126L56,122Z"/>`,
  reset: `<path d="M583 313L583-7L633-7L633 228L907-46L942-11L668 263L903 263L903 313ZM117 814L391 540L391 775L441 775L441 455L121 455L121 505L356 505L82 779ZM132 4L434 4L434-46L82-46L82 306L132 306ZM892 764L590 764L590 814L942 814L942 462L892 462Z"/>`,
  download: `<path d="M9 188Q13 188 16 190.50Q19 193 19 197L19 244Q19 252 24.50 257.50Q30 263 38 263L263 263Q270 263 275.50 257.50Q281 252 281 244L281 197Q281 193 284 190.50Q287 188 291 188Q295 188 297.50 190.50Q300 193 300 197L300 244Q300 259 289 270Q278 281 262 281L38 281Q22 281 11 270Q0 259 0 244L0 197Q0 193 2.50 190.50Q5 188 9 188ZM87 168L143 224Q146 227 150 227Q154 227 157 224L213 168Q216 165 216 161Q216 157 213 154.50Q210 152 206 152Q202 152 200 155L159 195L159 30Q159 26 156.50 23.50Q154 21 150 21Q146 21 143.50 23.50Q141 26 141 30L141 195L100 155Q98 152 94 152Q90 152 87 154.50Q84 157 84 161Q84 165 87 168Z"/>`,
  rotate: `<path d="M150 69.12L150 88.12Q119 88.12 94 107.12Q69 126.12 60 156.12Q51 186.12 62 215.12Q73 244.12 99.50 261.12Q126 278.12 157 275.62Q188 273.12 211.50 252.62Q235 232.12 241.50 201.62Q248 171.12 235 143.12Q234 139.12 235.50 135.62Q237 132.12 240 130.62Q243 129.12 247 130.62Q251 132.12 252 135.12Q268 169.12 260 205.62Q252 242.12 224 266.62Q196 291.12 158.50 294.12Q121 297.12 89.50 276.62Q58 256.12 45 221.12Q32 186.12 42.50 150.12Q53 114.12 83 92.12Q113 70.12 150 69.12ZM150 116.12L150 42.12Q150 39.12 152.50 38.12Q155 37.12 158 38.12L202 75.12Q204 77.12 204 79.12Q204 81.12 202 82.12L158 119.12Q155 121.12 152.50 120.12Q150 119.12 150 116.12Z"/>`,
  prev: `<polyline points="15 18 9 12 15 6" fill="none" stroke="#fff" stroke-width="2"/>`,
  next: `<polyline points="9 6 15 12 9 18" fill="none" stroke="#fff" stroke-width="2"/>`
};

class ImagePreviewer {
  constructor(img, options = {}) {
    this.img = img;
    this.scale = 1;
    this.rotate = 0;
    this.imgX = 0;
    this.imgY = 0;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;
    this.shouldExit = false;
    this.spaceMode = false;

    // 直接从 options 获取配置
    this.minScale = options.minScale;
    this.maxScale = options.maxScale;
    this.exitRatio = options.exitRatio;
    this.zoomStep = options.zoomStep;
    this.theme = options.theme;
    this.enabledSites = options.enabledSites;

    this.onClose = options.onClose || null;
    
    // 分组相关
    this.group = options.group || [{ src: img.currentSrc || img.src, alt: img.alt || '' }];
    this.groupIndex = options.groupIndex || 0;
    
    this.createOverlay();
    this.addEvents();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.setAttribute("role", "dialog");
    this.overlay.setAttribute("aria-modal", "true");
    this.overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100vw;height:100vh;
      background:rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;cursor:default;`;

    // 应用主题
    let t = this.theme;
    if (t === 'auto') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    this.overlay.classList.add('theme-' + t);

    this.fullImgWrapper = document.createElement("div");
    this.fullImgWrapper.style.cssText = `
      display:flex;align-items:center;justify-content:center;max-width:90vw;max-height:90vh;`;

    this.fullImg = document.createElement("img");
    const imgInfo = this.group[this.groupIndex];
    this.fullImg.src = imgInfo.src;
    this.fullImg.alt = imgInfo.alt || window.I18N.t("preview");
    this.fullImg.style.cssText = `
      object-fit:contain;user-select:none;
      transition:transform 0.2s,opacity 0.2s;cursor:grab;`;
    this.fullImgWrapper.appendChild(this.fullImg);
    
    this.bottomBar = document.createElement("div");
    this.bottomBar.style.cssText = `
      position:absolute;top:0.2rem;left:0;width:100%;background:rgba(0,0,0,0.5);
      display:flex;justify-content:center;padding:10px 0;gap:20px;box-sizing:border-box;`;

    // 创建按钮
    this.closeButton = this.createButton("close", window.I18N.t("close"), { viewBox: "0 0 300 350" });
    this.zoomInButton = this.createButton("zoomIn", window.I18N.t("zoomIn"));
    this.zoomOutButton = this.createButton("zoomOut", window.I18N.t("zoomOut"));
    this.resetButton = this.createButton("reset", window.I18N.t("reset"), { viewBox: "0 0 1000 750" });
    this.rotateButton = this.createButton("rotate", window.I18N.t("rotate"));
    this.downloadButton = this.createButton("download", window.I18N.t("download"));
    
    this.prevButton = this.createButton("prev", window.I18N.t("prev"), { viewBox: "0 0 24 24" });
    this.nextButton = this.createButton("next", window.I18N.t("next"), { viewBox: "0 0 24 24" });
    
    this.prevButton.style.cssText += "position:absolute;left:10px;top:50%;";
    this.nextButton.style.cssText += "position:absolute;right:10px;top:50%;";

    this.bottomBar.appendChild(this.closeButton);
    this.bottomBar.appendChild(this.zoomOutButton);
    this.bottomBar.appendChild(this.zoomInButton);
    this.bottomBar.appendChild(this.resetButton);
    this.bottomBar.appendChild(this.rotateButton);
    this.bottomBar.appendChild(this.downloadButton);
    
    this.overlay.appendChild(this.bottomBar);
    this.overlay.appendChild(this.fullImgWrapper);
    this.overlay.appendChild(this.prevButton);
    this.overlay.appendChild(this.nextButton);
    
    document.body.appendChild(this.overlay);
    this.closeButton.focus();
  }

  createButton(type, title, options = {}) {
    const button = document.createElement("button");
    button.title = title;
    button.setAttribute("aria-label", title);
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.style.cssText = `
      padding: 8px 15px;border:none;border-radius:5px;
      background:#333;color:#fff;cursor:pointer;font-size:14px;z-index:10001;display:inline-flex;align-items:center;`;
      
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", options.viewBox || "0 0 300 300");
    svg.innerHTML = SVG_ICONS[type];
    svg.style.cssText = "fill:#fff;stroke:#fff;stroke-width:0;margin:0 5px;";
    
    button.appendChild(svg);
    return button;
  }

  showImageByIndex(idx) {
    if (idx < 0 || idx >= this.group.length) return;
    this.groupIndex = idx;
    const imgInfo = this.group[this.groupIndex];
    this.fullImg.src = imgInfo.src;
    this.fullImg.alt = imgInfo.alt || window.I18N.t("preview");
    this.resetZoom();
  }

  prevImage = () => {
    if (this.group.length <= 1) return;
    let idx = this.groupIndex - 1;
    if (idx < 0) idx = this.group.length - 1;
    this.showImageByIndex(idx);
  };

  nextImage = () => {
    if (this.group.length <= 1) return;
    let idx = (this.groupIndex + 1) % this.group.length;
    this.showImageByIndex(idx);
  };

  setTransform(
    noAnim = false,
    x = this.imgX,
    y = this.imgY,
    op = 1,
    sc = this.scale,
    rot = this.rotate
  ) {
    this.fullImg.style.transition = noAnim
      ? "none"
      : "transform 0.2s, opacity 0.2s";
    this.fullImg.style.transform = `translate(${x}px,${y}px) scale(${sc}) rotate(${rot}deg)`;
    this.fullImg.style.opacity = op;
  }

  zoomIn = () => {
    this.scale = Math.min(this.maxScale, this.scale + this.zoomStep);
    this.setTransform();
  };

  zoomOut = () => {
    this.scale = Math.max(this.minScale, this.scale - this.zoomStep);
    this.setTransform();
  };

  resetZoom = () => {
    this.scale = 1;
    this.imgX = 0;
    this.imgY = 0;
    this.rotate = 0;
    this.setTransform();
  };

  rotateClockwise = () => {
    this.rotate = (this.rotate + 90) % 360;
    this.setTransform();
  };

  closePreviewByButton = () => {
    this.close();
  };

  downloadImage = () => {
    const link = document.createElement("a");
    link.href = this.fullImg.src;
    const filename =
      this.fullImg.src.split("/").pop().split("?")[0] || "downloaded-image";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? this.zoomStep : -this.zoomStep;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));
    this.setTransform();
  };

  onKeyDown = (e) => {
    if (e.key === " ") {
      this.spaceMode = true;
      this.fullImg.style.cursor = "grab";
      e.preventDefault();
    }
    if (e.key === "Escape") this.close();
    if (e.key === "+" || e.key === "=" || e.key === "ArrowUp") this.zoomIn();
    if (e.key === "-" || e.key === "_" || e.key === "ArrowDown") this.zoomOut();
    if (e.key === "r" || e.key === "R") this.rotateClockwise();
    if (e.key === "ArrowLeft") this.prevImage();
    if (e.key === "ArrowRight") this.nextImage();
  };

  onKeyUp = (e) => {
    if (e.key === " ") {
      this.spaceMode = false;
      this.fullImg.style.cursor = "grab";
      e.preventDefault();
    }
  };

  onMouseDown = (e) => {
    if (this.shouldExit) return;
    this.dragging = true;
    this.startX = e.clientX - this.imgX;
    this.startY = e.clientY - this.imgY;
    this.fullImg.style.cursor = "grabbing";
    this.setTransform(true);
    e.preventDefault();
  };

  onMouseMove = (e) => {
    if (!this.dragging) return;
    this.imgX = e.clientX - this.startX;
    this.imgY = e.clientY - this.startY;

    if (this.scale === 1 && this.imgY > 0) {
      const threshold = this.fullImg.clientHeight * this.exitRatio;
      const ratio = Math.max(0, Math.min(1, this.imgY / threshold));
      const opacity = 1 - ratio * 0.6;
      const scale = this.scale * (1 - ratio * 0.2);
      this.setTransform(true, this.imgX, this.imgY, opacity, scale, this.rotate);
    } else {
      this.setTransform(true, this.imgX, this.imgY, 1, this.scale, this.rotate);
    }
    e.preventDefault();
  };

  onMouseUp = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.fullImg.style.cursor = "grab";

    const threshold = this.fullImg.clientHeight * this.exitRatio;
    if (!this.spaceMode && this.scale === 1 && this.imgY > threshold) {
      this.shouldExit = true;
      this.fullImg.style.transition = "transform 0.3s, opacity 0.3s";
      this.overlay.style.transition = "opacity 0.3s";
      this.fullImg.style.opacity = 0;
      this.fullImg.style.transform = `translate(${this.imgX}px, ${this.imgY + 200}px) scale(${this.scale * 0.8}) rotate(${this.rotate}deg)`;
      this.overlay.style.opacity = 0;
      setTimeout(() => this.close(), 300);
    } else {
      this.setTransform();
    }
  };
  
  onMouseLeave = () => {
    if (this.dragging) {
      this.onMouseUp();
    }
  };

  onClickOverlay = (e) => {
    if (e.target === this.overlay) this.close();
  };

  addEvents() {
    this.overlay.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("keyup", this.onKeyUp, true);
    this.fullImg.addEventListener("mousedown", this.onMouseDown);
    this.overlay.addEventListener("mousemove", this.onMouseMove);
    this.overlay.addEventListener("mouseup", this.onMouseUp);
    this.overlay.addEventListener("mouseleave", this.onMouseLeave);
    this.overlay.addEventListener("click", this.onClickOverlay);

    this.zoomInButton.addEventListener("click", this.zoomIn);
    this.zoomOutButton.addEventListener("click", this.zoomOut);
    this.resetButton.addEventListener("click", this.resetZoom);
    this.closeButton.addEventListener("click", this.closePreviewByButton);
    this.downloadButton.addEventListener("click", this.downloadImage);
    this.rotateButton.addEventListener("click", this.rotateClockwise);
    this.prevButton.addEventListener("click", this.prevImage);
    this.nextButton.addEventListener("click", this.nextImage);
  }

  removeEvents() {
    window.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("keyup", this.onKeyUp, true);
    // 其他事件监听器在 overlay 被移除时会自动清理，无需手动移除
  }

  close() {
    this.removeEvents();
    if (this.overlay && this.overlay.parentNode) {
      document.body.removeChild(this.overlay);
    }
    if (typeof this.onClose === "function") this.onClose();
  }
}

window.ImagePreviewer = ImagePreviewer;