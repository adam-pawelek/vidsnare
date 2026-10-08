// Opens the built app UI with example data (see preload.cjs) for website screenshots.
// Driven by scripts/screenshots/take.mjs; never part of the shipped app.
const { app, BrowserWindow } = require('electron')
const { join } = require('node:path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    show: true,
    webPreferences: { preload: join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: false }
  })
  win.loadFile(join(__dirname, '..', '..', 'out', 'renderer', 'index.html'))
})
