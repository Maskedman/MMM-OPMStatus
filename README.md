# MMM-OPMStatus (with optional QR)

A simple MagicMirror² module that displays the **U.S. OPM Operating Status** (Washington, DC area). By default it **only shows when status is _not_ "Open"**. When it is not open, you can show a **QR code** to the official OPM page so people can scan it.

It fetches `https://www.opm.gov/json/operatingstatus.json` via the module's `node_helper` with headers (User-Agent, Accept, Referer) to avoid CDN blocks.

## Install
```
cd /path/to/magicmirror/modules/
```

```
git clone https://github.com/Maskedman/MMM-OPMStatus.git
```

```bash
npm install
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
  position: "top_bar", // or wherever
  config: {
    updateInterval: 10 * 60 * 1000, // 10 minutes
    showWhenOpen: false,             // hide when "Open"
    fadeOpenAfterMs: 0,              // if showWhenOpen=true, auto-hide after N ms
    headerText: "Federal Operating Status",
    maxWidth: "420px",

    // Kiosk-friendly options:
    showLink: false,                 // leaves out clickable link
    showQR: true,                    // show QR only when NOT open
    qrSize: 140,                     // pixels
    qrDataUrl: "https://www.opm.gov/policy-data-oversight/snow-dismissal-procedures/current-status/"
  }
}
```

## Behavior

- If OPM status is **"Open"** and `showWhenOpen: false`, the module hides itself.
- If OPM status is anything else, it shows the badge, message, and (optionally) a QR code that points to the OPM detail page.
- Displays meta like "AppliesTo" and "posted at" when available.

## Notes

- The QR code uses `https://quickchart.io/qr` to render; no additional libraries are required.
- The module uses Node's `https` to set headers and bypass Akamai blocks that sometimes hit default UAs.
- No external NPM dependencies required.

## Troubleshooting

- If you see `HTTP 403` or `Access Denied`, check your server's outbound IP/reputation or try again later.
- To debug, start MagicMirror with `npm start dev` and watch for `OPM_STATUS_ERROR` in the console.
