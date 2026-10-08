import { contextBridge, ipcRenderer } from 'electron'
import { createApi } from './api'

contextBridge.exposeInMainWorld('vidsnare', createApi(ipcRenderer))
