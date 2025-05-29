import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
};

const deeplink = {
  setWindowIsReady: (isReady: boolean) => {
    ipcRenderer.send('window-is-ready', isReady)
  },
  onLauncherUrl: (callback) => {
    ipcRenderer.on('launcher-url', (_event, url: string) => {
      callback(url)
    })
  },
};

const electronTools = {
  // Show Directory or File selector
  showDialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('show-dialog', options),

  // Bypass CORS
  fetchData: (url: string) => ipcRenderer.invoke('fetch-data', url),

  // Open external link in browser
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // Get current OS
  getPlatform: () => ipcRenderer.invoke('get-platform'),
};

contextBridge.exposeInMainWorld('ipc', handler);
contextBridge.exposeInMainWorld('deeplink', deeplink);
contextBridge.exposeInMainWorld('electronTools', electronTools);

export type IpcHandler = typeof handler
