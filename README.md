# Myra

Browser-native wine, beer, and spirits recommendation app.

## Run locally

Serve this folder with any static server and open `index.html`.

The app loads its inventories from:
- `data/inventory.json` (wine)
- `data/beerinventory2.json` (beer)
- `data/hardbarinventory.json` (spirits)
- `data/myra-wordmap.json` (NLU word map)
- `data/myra-images.json` (optional image map)

## Notes

- Voice recognition and TTS are browser-native (Web Speech API + `speechSynthesis`).
- `diagnostics.html` runs basic inventory/data checks.

