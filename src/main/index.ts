import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../../assets/prairie-land-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  // In dev, electron-vite serves renderer on a local port;
  // in production it loads from the built index.html.
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Remove default application menu (File/Edit/View...) for a cleaner internal tool UI.
  Menu.setApplicationMenu(null)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
