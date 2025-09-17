# MMM-OPMStatus

A simple MagicMirror² module that displays the **U.S. OPM Operating Status** (Washington, DC area). By default it **only shows when status is _not_ "Open"**.

It fetches `https://www.opm.gov/json/operatingstatus.json` via the module's `node_helper` with headers (User-Agent, Accept, Referer) to avoid CDN blocks.

## Install

```bash
cd ~/MagicMirror/modules
git clone <your-repo-or-copy> MMM-OPMStatus
# or copy the provided folder here
```

Files:
- `MMM-OPMStatus.js`
- `node_helper.js`
- `MMM-OPMStatus.css`

## Config

Add to `config.js`:

```js
{
  module: "MMM-OPMStatus",
  position: "top_bar", // or wherever you like
  config: {
    updateInterval: 10 * 60 * 1000, // 10 minutes
    showWhenOpen: false,             // hide when "Open"
    fadeOpenAfterMs: 0,              // if showWhenOpen=true, auto-hide after N ms
    headerText: "Federal Operating Status",
    maxWidth: "420px"
  }
}
```

## Behavior

- If OPM status is **"Open"** and `showWhenOpen: false`, the module hides itself.
- If OPM status is anything else (e.g., "Open with Delayed Arrival", "Closed", etc.), it shows the badge and current message.
- Displays meta like "AppliesTo" date and "posted at" time when available.

## Notes

- The module uses Node's `https` to set headers and bypass Akamai blocks often triggered by `curl`/default UAs.
- No external NPM dependencies required.
- You can change the `url` in config if OPM changes their endpoint.

## Troubleshooting

- If you see `HTTP 403` or `Access Denied`, check your server's outbound IP reputation/firewall. The helper already sends a browser-like User-Agent and Referer.
- To debug, start MagicMirror with `npm start dev` and watch the console for `OPM_STATUS_ERROR` messages.
