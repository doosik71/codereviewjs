const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { fork } = require('child_process'); // For forking the Next.js server

let mainWindow;
let nextProcess; // To hold the Next.js server process

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const nextAppUrl = 'http://localhost:3010'; // Default for dev

  if (isDev) {
    mainWindow.loadURL(nextAppUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, start the Next.js standalone server
    const nextServerPath = path.join(app.getAppPath(), '.next', 'standalone', 'server.js');
    nextProcess = fork(nextServerPath, [], {
      env: { ...process.env, PORT: '3010' }, // Ensure it runs on a specific port
      silent: true, // Don't print server logs to Electron console directly
    });

    nextProcess.stdout.on('data', (data) => {
      console.log(`Next.js Server: ${data}`);
      // Wait for the server to be ready before loading the URL
      if (data.toString().includes('ready - started server on')) { // Adjust this based on actual Next.js log
        mainWindow.loadURL(nextAppUrl);
      }
    });

    nextProcess.stderr.on('data', (data) => {
      console.error(`Next.js Server Error: ${data}`);
    });

    // Handle process exit
    nextProcess.on('exit', (code) => {
      console.log(`Next.js server exited with code ${code}`);
    });
  }

  mainWindow.on('closed', () => {
    if (nextProcess) {
      nextProcess.kill(); // Terminate the Next.js server process
    }
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});