/* MagicMirror² Node Helper for MMM-OPMStatus */
const NodeHelper = require("node_helper");
const https = require("https");

function dotNetToIso(dateStr) {
  // converts "/Date(1758009771020)/" to "YYYY-MM-DD HH:MM:SSZ"
  if (!dateStr) return null;
  const ms = parseInt(String(dateStr).replace(/\D/g, ""), 10);
  if (isNaN(ms)) return null;
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").replace(".000Z", "Z");
}

module.exports = NodeHelper.create({
  start: function () {
    // no-op
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "OPM_GET_STATUS") {
      this.fetchStatus(payload && payload.url ? payload.url : "https://www.opm.gov/json/operatingstatus.json");
    }
  },

  fetchStatus: function (url) {
    const options = new URL(url);
    options.headers = {
      "User-Agent": "Mozilla/5.0 (MagicMirror MMM-OPMStatus)",
      "Accept": "application/json",
      "Referer": "https://www.opm.gov/developer"
    };
    options.method = "GET";
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          this.sendSocketNotification("OPM_STATUS_ERROR", { message: `HTTP ${res.statusCode}` });
          return;
        }
        try {
          const obj = JSON.parse(data);
          const out = {
            status: obj.StatusType || obj.Icon || obj.status || "Unknown",
            message: obj.ShortStatusMessage || obj.message || "",
            appliesTo: obj.AppliesTo || null,
            postedAt: dotNetToIso(obj.DateStatusPosted || null)
          };
          this.sendSocketNotification("OPM_STATUS_RESULT", out);
        } catch (e) {
          this.sendSocketNotification("OPM_STATUS_ERROR", { message: `Parse error: ${e.message}` });
        }
      });
    });
    req.on("error", (err) => {
      this.sendSocketNotification("OPM_STATUS_ERROR", { message: err.message });
    });
    req.end();
  }
});