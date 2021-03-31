'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const log = require('electron-log');
const path = require('path');
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.autoDownload = false
    autoUpdater.checkForUpdates()
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('update-available', () => {
  log.info('update_available');
  win.webContents.send('updater', 'update_available');
});
autoUpdater.on('update-not-available', () => {
  log.info('update_not_available');
  win.webContents.send('updater', 'update_not_available');
});
autoUpdater.on('checking-for-update', () => {
  log.info('checking-for-update');
  win.webContents.send('updater', 'checking-for-update')
})
autoUpdater.on('error', () => {
  log.info('error');
  win.webContents.send('updater', 'error')
})
autoUpdater.on('download-progress', () => {
  log.info('download-progress');
  win.webContents.send('updater', 'download-progress')
})
autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
  log.info('update-downloaded');
  win.webContents.send('updater', 'update-downloaded')
})

win.webContents.on('upgrade', () => {
  autoUpdater.downloadUpdate()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
