import path from 'path';
import { app, dialog, ipcMain, session, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from "axios";

const bIsProd = process.env.NODE_ENV === 'production';

let windowIsReady: boolean = false;
let mainWindow: Electron.CrossProcessExports.BrowserWindow = null;
const protocolScheme: string = "bitmap";

if (bIsProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

const getMainWindowWhenReady = async () => {
      if (!windowIsReady) {
        await new Promise((resolve) => ipcMain.once('window-is-ready', resolve));
      }
      return mainWindow;
}

;(async () => {
  const shouldContinue = checkLauncherUrl(getMainWindowWhenReady);
  if (!shouldContinue) return;

  await app.whenReady();

  ipcMain.once('window-is-ready', () => {
    windowIsReady = true
  });

  mainWindow = createWindow('main', {
    title: 'Bitmap',
    width: 1440,
    height: 900,
    minWidth: 1366,
    minHeight: 768,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    trafficLightPosition: {
      x: 17,
      y: 16
    },
    titleBarOverlay: {
      height: 48,
      color: '#00000000',
      symbolColor: '#FFFFFFFF'
    },
    frame: false, // platformName === 'darwin',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      devTools: true, // devTools: bIsDev,
    },
  })

  // CORS 우회 설정
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = 'https://api.prodbybitmap.com';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*'],
        'Access-Control-Allow-Methods': ['*']
      }
    });
  });


  if (bIsProd) {
    await mainWindow.loadURL('app://./')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

function checkLauncherUrl(getMainWindow) {
  if (process.platform === 'darwin') {
    app.on('open-url', async (_event, url) => {
      const mainWindow = await getMainWindow()
      mainWindow.webContents.send('launcher-url', url)
      mainWindow.isMinimized() && mainWindow.restore()
    })
  }

  if (process.platform === 'win32') {
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
      return false
    }

    // app.setAsDefaultProtocolClient('your-custom-protocol-scheme')
    app.setAsDefaultProtocolClient(protocolScheme);

    app.on('second-instance', async (_event, args) => {
      const mainWindow = await getMainWindow()

      const url = args.find((arg) =>
          // arg.startsWith(`${'your-custom-protocol-scheme'}://`)
          arg.startsWith(`${protocolScheme}://`)
      )
      url && mainWindow.webContents.send('launcher-url', url)

      mainWindow.isMinimized() && mainWindow.restore()
      mainWindow.focus()
    })

    const url = process.argv.find((arg) =>
        arg.startsWith(`${protocolScheme}://`)
    )
    url &&
    getMainWindow().then((mainWindow) =>
        mainWindow.webContents.send('launcher-url', url)
    )
  }

  return true
}

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

// 파일 경로 지정
ipcMain.handle('show-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result.filePaths[0]; // 사용자가 선택한 파일 경로
});

ipcMain.handle('fetch-data', async (_, url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('open-external', async (_, url: string) => {
  try {
    await shell.openExternal(url);
    return true;
  }
  catch (error) {
    console.error('Failed to open external URL:', error);
    return false;
  }
});