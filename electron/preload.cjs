const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("asa", {
  appName: "ASA App",
});