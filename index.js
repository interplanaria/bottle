let win;
var settings
const { ipcMain, app, session, protocol, BrowserWindow } = require('electron')
const dirname = app.getAppPath()
const userPath = app.getPath("userData")
const {PassThrough} = require('stream')
const path = require('path')
const fs = require('fs')
const URL = require('url')
const request = require('request')
const mime = require('mime-types')
var load = function(type, req, callback) {
  if (type === 'b') {
    let key = req.url.substr(4);
    let url = eval('`'+settings.b+'`');
    callback({url: url, method: req.method})
  } else if (type === 'c') {
    var key = req.url.substr(4);
    let url = eval('`'+settings.c+'`');
    callback({url: url, method: req.method})
  }
}
var refreshSettings = function() {
  // Settings 
  let p = path.join(userPath, '.', 'settings.json');
  fs.readFile(p, (err, data) => {
    if(data){
      try {
        settings = JSON.parse(data) 
/*
        let defaults = [
          "chrome:.*",
          "chrome-devtools:.*",
          "data:.*",
          "b:\/\/.*",
          "c:\/\/.*",
          "file:\/\/.*",
        ]

        let whitelist = settings.whitelist.split(",")
        whitelist.forEach(function(host) {
          defaults.push(".*" + host.trim() + ".*")
        })
        const trusted = new RegExp("(" + defaults.join("|") + ")")
        session.defaultSession.webRequest.onBeforeRequest(function(details, callback) {
          let test = trusted.test(details.url)
          callback({cancel: !test})
        });
        */
      } catch (e) {
        console.log("Error", e)
      }
    } else {
      let stubPath = path.join(dirname, '.', 'settings.json');
      fs.readFile(stubPath, (err, data) => {
        if(data){
          try {
            settings = JSON.parse(data) 
          } catch (e) {
            console.log("Error", e)
          }
        }
      })
    }
  })
}
var createWindow = function () {
  win = new BrowserWindow({
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      plugins: true,
      webSecurity: false
    }
  });
  win.maximize()

  win.loadURL(`file:///${dirname}/index.html`);

  refreshSettings()
  
  protocol.registerStreamProtocol('b', function(req, callback) {
    let key = req.url.substr(4);
    let new_url = eval('`'+settings.b+'`');
    let st = request(new_url)
    st.on('response', response => {
      const pass = new PassThrough()
      st.pipe(pass)
      callback({
        data: pass,
        statusCode: response.statusCode,
        headers: response.headers
      })  
    })
  }, function (error) {
    if (error)
      console.error('Failed to register protocol')
  })
  protocol.registerStreamProtocol('c', function(req, callback) {
    let key = req.url.substr(4);
    let new_url = eval('`'+settings.c+'`');
    let st = request(new_url)
    st.on('response', response => {
    	const pass = new PassThrough()
      st.pipe(pass)
      callback({
        data: pass,
        statusCode: response.statusCode,
        headers: response.headers
      })  
    })
  }, function (error) {
    if (error)
      console.error('Failed to register protocol')
  })
  protocol.interceptStreamProtocol('file', (req, callback) => {
    const url = req.url.trim().substr(8)
    if (/^b:\/\//i.test(url)) {
      let key = url.substr(4);
      let new_url = eval('`'+settings.b+'`');
      let st = request(new_url)
      st.on('response', response => {
        const pass = new PassThrough()
        st.pipe(pass)
        callback({
          data: pass,
          statusCode: response.statusCode,
          headers: response.headers
        })  
      })
    } else if (/^c:\/\//i.test(url)) {
      var key = url.substr(4);
      let new_url = eval('`'+settings.c+'`');
      let st = request(new_url)
      st.on('response', response => {
        const pass = new PassThrough()
        st.pipe(pass)
        callback({
          data: pass,
          statusCode: response.statusCode,
          headers: response.headers
        })  
      })
    } else {
      // regular file
      let parsed
      if (process.platform === 'win32') {
        parsed = URL.parse(url);
      } else {
        parsed = URL.parse(req.url)
      }
      let decoded = decodeURI(parsed.pathname)
      let exists = fs.existsSync(decoded)
      let result = {
        data: fs.createReadStream(decoded)
      }
      let type = mime.lookup(decoded)
      if (type) {
        result.headers = { "Content-type": type }
      }
      callback(result)
    }
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  })
  win.maximize()
  win.on('closed', () => {
    win = null
  })
}
protocol.registerStandardSchemes(["b", "c", "file"])
ipcMain.on('refresh-settings', (event, arg) => {
  refreshSettings()
})
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.setAsDefaultProtocolClient("b")
app.setAsDefaultProtocolClient("c")
app.on('open-url', function (event, data) {
  event.preventDefault();
  win.webContents.send("open-url", data)
});
app.on('ready', function() {
  if (!win) {
    createWindow()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
