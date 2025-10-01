# MMM-OPMStatus (qrPosition build)

MagicMirror² module that displays the **U.S. OPM Operating Status** (Washington, DC area). By default it **only shows when status is _not_ "Open"**. Includes a QR code option that you can place **below**, **left**, or **right** of the text.

## Config

```js
{
  module: "MMM-OPMStatus",
  position: "top_bar",
  config: {
    updateInterval: 10 * 60 * 1000, // 10 minutes
    showWhenOpen: false,
    fadeOpenAfterMs: 0,
    headerText: "Federal Operating Status",
    maxWidth: "420px",

    // QR options
    showQR: true,
    qrSize: 140,
    qrDataUrl: "https://www.opm.gov/policy-data-oversight/snow-dismissal-procedures/current-status/",
    qrPosition: "right" // "below" | "right" | "left"
  }
}
```
