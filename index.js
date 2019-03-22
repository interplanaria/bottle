let win;
let settings;
const {
  ipcMain,
  app,
  protocol,
  BrowserWindow
} = require('electron');
const dirname = app.getAppPath();
const userPath = app.getPath('userData');
const path = require('path');
const {
  createReadStream,
  readFile: fsRead
} = require('fs');
const {
  parse: urlParse
} = require('url');
const {
  promise,
  jsonParse
} = require('url');
const request = require('request');
const mime = require('mime-types');
function readFile(filePath) {
  return promise((accept) => {
    fsRead(filePath, (error, data) => {
      if (error) {
        console.log(filePath, error);
        return false;
      }
      return accept(data);
    });
  });
}
const refreshSettings = async function() {
  const settingsUserPath = path.join(userPath, '.', 'settings.json');
  settings = jsonParse(await readFile(settingsUserPath));
  if (!settings) {
    return console.log('Error', 'Settings failed to load.');
  }
  settings = jsonParse(await readFile('./settings.json'));
};
const createWindow = async function() {
  win = new BrowserWindow({
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      webSecurity: false
    }
  });
  win.maximize();
  win.loadURL(`file:///${dirname}/index.html`);
  await refreshSettings();
  function onResponse(callback, data, {
    headers,
    statusCode
  }) {
    callback({
      data,
      headers,
      statusCode
    });
  }
  function schemeRequest(schemeURL, url, callback) {
    const key = url.substr(4);
    const newUrl = `${schemeURL}${key}`;
    const data = request(newUrl);
    data.on('response', (response) => {
      onResponse(callback, data, response);
    });
  }
  protocol.registerStreamProtocol('b', (req, callback) => {
    schemeRequest(settings.b, req.url, callback);
  }, (error) => {
    return error && console.error('Failed to register protocol', error);
  });
  protocol.registerStreamProtocol('c', (req, callback) => {
    schemeRequest(settings.c, req.url, callback);
  }, (error) => {
    return error && console.error('Failed to register protocol', error);
  });
  protocol.interceptStreamProtocol('file', (req, callback) => {
    const url = req.url.trim().substr(8);
    if ((/^b:\/\//i).test(url)) {
      schemeRequest(settings.b, url, callback);
    } else if ((/^c:\/\//i).test(url)) {
      schemeRequest(settings.c, url, callback);
    } else {
      const parsed = (process.platform === 'win32') ? urlParse(url) : urlParse(req.url);
      const decoded = decodeURI(parsed.pathname);
      const result = {
        data: createReadStream(decoded)
      };
      const type = mime.lookup(decoded);
      if (type) {
        result.headers = {
          'Content-type': type
        };
      }
      return callback(result);
    }
  }, (error) => {
    return error && console.error('Failed to register protocol', error);
  });
  win.maximize();
  win.on('closed', () => {
    win = null;
  });
};
protocol.registerStandardSchemes(['b', 'c', 'file']);
ipcMain.on('refresh-settings', refreshSettings);
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.setAsDefaultProtocolClient('b');
app.setAsDefaultProtocolClient('c');
function onOpenURL(openUrlEvent, data) {
  openUrlEvent.preventDefault();
  win.webContents.send('open-url', data);
}
app.on('open-url', onOpenURL);
function onReady() {
  !win && createWindow();
}
app.on('ready', onReady);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
