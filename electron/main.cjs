const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs/promises");

app.setName("ASA App");

let mainWindow;
let dataFilePath;
let meetingNotesDirPath;

const defaultData = {
  tasks: [],
  events: [],
  meetingNotes: [],
};

async function ensureDataFile() {
  const dataDir = path.join(app.getPath("userData"), "data");
  dataFilePath = path.join(dataDir, "asa-data.json");

  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

async function ensureMeetingNotesFolder() {
  meetingNotesDirPath = path.join(app.getPath("userData"), "meeting-notes");
  await fs.mkdir(meetingNotesDirPath, { recursive: true });
}

async function readAppData() {
  await ensureDataFile();

  try {
    const rawData = await fs.readFile(dataFilePath, "utf-8");
    const parsedData = JSON.parse(rawData);

    return {
      ...defaultData,
      ...parsedData,
    };
  } catch {
    return defaultData;
  }
}

async function writeAppData(data) {
  await ensureDataFile();

  const safeData = {
    ...defaultData,
    ...data,
  };

  await fs.writeFile(dataFilePath, JSON.stringify(safeData, null, 2), "utf-8");

  return {
    ok: true,
  };
}

function cleanFileName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function createMeetingNoteFile(payload) {
  await ensureMeetingNotesFolder();

  const now = new Date();
  const id = Date.now();

  const title = String(payload?.title || "Untitled Meeting Note").trim();
  const content = String(payload?.content || "").trim();

  if (!content) {
    return {
      ok: false,
      error: "Meeting note content cannot be empty.",
    };
  }

  const dateStamp = now.toISOString().slice(0, 10);
  const safeTitle = cleanFileName(title) || "untitled-meeting-note";
  const fileName = `${dateStamp}_${safeTitle}_${id}.txt`;
  const filePath = path.join(meetingNotesDirPath, fileName);

  const fileContent = [
    "ASA App Meeting Note",
    "",
    `Title: ${title}`,
    `Created: ${now.toLocaleString()}`,
    "",
    "------------------------------------------------------------",
    "",
    content,
    "",
  ].join("\n");

  await fs.writeFile(filePath, fileContent, "utf-8");

  return {
    ok: true,
    note: {
      id,
      title,
      fileName,
      filePath,
      createdAt: now.toLocaleString(),
    },
  };
}

async function readMeetingNoteFile(fileName) {
  await ensureMeetingNotesFolder();

  const safeFileName = path.basename(fileName);
  const filePath = path.join(meetingNotesDirPath, safeFileName);

  try {
    const content = await fs.readFile(filePath, "utf-8");

    return {
      ok: true,
      content,
      filePath,
    };
  } catch {
    return {
      ok: false,
      error: "Could not read meeting note file.",
    };
  }
}

async function openMeetingNoteFile(fileName) {
  await ensureMeetingNotesFolder();

  const safeFileName = path.basename(fileName);
  const filePath = path.join(meetingNotesDirPath, safeFileName);

  const result = await shell.openPath(filePath);

  return {
    ok: result === "",
    error: result || "",
    filePath,
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 650,
    title: "ASA App",
    backgroundColor: "#f3f3f3",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("asa:load-data", async () => {
  return readAppData();
});

ipcMain.handle("asa:save-data", async (_event, data) => {
  return writeAppData(data);
});

ipcMain.handle("asa:get-data-path", async () => {
  await ensureDataFile();
  return dataFilePath;
});

ipcMain.handle("asa:get-meeting-notes-folder", async () => {
  await ensureMeetingNotesFolder();
  return meetingNotesDirPath;
});

ipcMain.handle("asa:create-meeting-note", async (_event, payload) => {
  return createMeetingNoteFile(payload);
});

ipcMain.handle("asa:read-meeting-note", async (_event, fileName) => {
  return readMeetingNoteFile(fileName);
});

ipcMain.handle("asa:open-meeting-note", async (_event, fileName) => {
  return openMeetingNoteFile(fileName);
});

app.whenReady().then(async () => {
  await ensureDataFile();
  await ensureMeetingNotesFolder();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});