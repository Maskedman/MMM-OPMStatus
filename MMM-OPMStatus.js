/* MagicMirror² Module: MMM-OPMStatus
 * Shows OPM Operating Status for the Washington, DC area. By default, hides when status is "Open".
 * Adds optional QR code (only when NOT "Open") for quick access to details.
 * License: MIT
 */
Module.register("MMM-OPMStatus", {
  defaults: {
    url: "https://www.opm.gov/json/operatingstatus.json",
    updateInterval: 10 * 60 * 1000, // 10 minutes
    animationSpeed: 400,
    showWhenOpen: false, // hide module when status is "Open"
    fadeOpenAfterMs: 0,  // if >0 and showWhenOpen=true, keep visible for this many ms then hide
    headerText: "Federal Operating Status",
    maxWidth: "420px",
    retryDelay: 60 * 1000,
    showLink: false,          // kiosk-safe: off by default
    showQR: true,             // show QR only when NOT open
    qrSize: 140,              // px
    qrDataUrl: "https://www.opm.gov/policy-data-oversight/snow-dismissal-procedures/current-status/"
  },

  start: function () {
    this.loaded = false;
    this.status = null; // { status, message, appliesTo, postedAt }
    this.hiddenBecauseOpen = false;
    this.getStatus();
    this.scheduleUpdate();
  },

  getStyles: function () {
    return ["MMM-OPMStatus.css"];
  },

  getHeader: function () {
    return this.config.headerText || "Federal Operating Status";
  },

  scheduleUpdate: function () {
    const self = this;
    setInterval(function () {
      self.getStatus();
    }, this.config.updateInterval);
  },

  getStatus: function () {
    this.sendSocketNotification("OPM_GET_STATUS", {
      url: this.config.url
    });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "OPM_STATUS_RESULT") {
      this.loaded = true;
      this.status = payload;
      const isOpen = (payload.status || "").toLowerCase() === "open";
      // control visibility
      if (!this.config.showWhenOpen && isOpen) {
        if (!this.hiddenBecauseOpen) {
          this.hiddenBecauseOpen = true;
          this.hide(this.config.animationSpeed);
        }
      } else {
        if (this.hiddenBecauseOpen) {
          this.hiddenBecauseOpen = false;
          this.show(this.config.animationSpeed);
        }
        // if we do show when open but only briefly
        if (this.config.showWhenOpen && isOpen && this.config.fadeOpenAfterMs > 0) {
          const ms = this.config.fadeOpenAfterMs;
          const self = this;
          setTimeout(function () {
            self.hide(self.config.animationSpeed);
            self.hiddenBecauseOpen = true;
          }, ms);
        }
      }
      this.updateDom(this.config.animationSpeed);
    } else if (notification === "OPM_STATUS_ERROR") {
      this.loaded = true;
      this.status = { status: "ERROR", message: payload && payload.message ? payload.message : "Failed to fetch OPM status." };
      this.show(this.config.animationSpeed);
      this.updateDom(this.config.animationSpeed);
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "opm-wrapper";
    wrapper.style.maxWidth = this.config.maxWidth;

    if (!this.loaded) {
      wrapper.innerHTML = "<div class='small dimmed'>Loading OPM status…</div>";
      return wrapper;
    }

    if (!this.status) {
      wrapper.innerHTML = "<div class='small dimmed'>No status.</div>";
      return wrapper;
    }

    const isOpen = (this.status.status || "").toLowerCase() === "open";
    if (isOpen && !this.config.showWhenOpen) {
      // hidden module state (text here is mainly for config debugging)
      const msg = document.createElement("div");
      msg.className = "xsmall dimmed";
      msg.innerText = "Status is Open (hidden).";
      wrapper.appendChild(msg);
      return wrapper;
    }

    const badge = document.createElement("div");
    badge.className = "opm-badge " + (isOpen ? "open" : "not-open");
    badge.innerText = this.status.status || "Unknown";
    wrapper.appendChild(badge);

    const msg = document.createElement("div");
    msg.className = "opm-message";
    msg.innerText = this.status.message || "";
    wrapper.appendChild(msg);

    if (this.status.appliesTo || this.status.postedAt) {
      const meta = document.createElement("div");
      meta.className = "opm-meta xsmall dimmed";
      const parts = [];
      if (this.status.appliesTo) parts.push(this.status.appliesTo);
      if (this.status.postedAt) parts.push("posted " + this.status.postedAt);
      meta.innerText = parts.join(" • ");
      wrapper.appendChild(meta);
    }

    // QR code only when NOT open
    if (!isOpen && this.config.showQR) {
      const qrWrap = document.createElement("div");
      qrWrap.className = "opm-qr-wrap";
      const img = document.createElement("img");
      const size = parseInt(this.config.qrSize, 10) || 140;
      const qrBase = "https://quickchart.io/qr";
      const data = encodeURIComponent(this.config.qrDataUrl);
      img.src = `${qrBase}?size=${size}x${size}&margin=2&ecLevel=M&text=${data}`;
      img.alt = "Scan for OPM details";
      img.width = size;
      img.height = size;
      qrWrap.appendChild(img);

      const qrNote = document.createElement("div");
      qrNote.className = "xsmall dimmed";
      qrNote.innerText = "Scan for details";
      qrWrap.appendChild(qrNote);

      wrapper.appendChild(qrWrap);
    }

    // Optional link (off by default)
    if (this.config.showLink) {
      const link = document.createElement("div");
      link.className = "opm-link xsmall dimmed";
      link.innerHTML = "<span>Details on OPM: </span><span>opm.gov/current-status</span>";
      wrapper.appendChild(link);
    }

    return wrapper;
  }
});