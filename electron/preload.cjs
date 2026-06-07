const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("asa", {
  appName: "ASA App",

  loadData: () => ipcRenderer.invoke("asa:load-data"),

  saveData: (data) => ipcRenderer.invoke("asa:save-data", data),

  getDataPath: () => ipcRenderer.invoke("asa:get-data-path"),

  getMeetingNotesFolder: () => ipcRenderer.invoke("asa:get-meeting-notes-folder"),

  createMeetingNote: (payload) =>
    ipcRenderer.invoke("asa:create-meeting-note", payload),

  readMeetingNote: (fileName) =>
    ipcRenderer.invoke("asa:read-meeting-note", fileName),

  openMeetingNote: (fileName) =>
    ipcRenderer.invoke("asa:open-meeting-note", fileName),
});