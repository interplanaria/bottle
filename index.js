let win;
const { ipcMain, app, session, protocol, BrowserWindow } = require('electron');
const dirname = app.getAppPath();
const userPath = app.getPath("userData");
const {PassThrough} = require('stream');
const path = require('path');
const fs = require('fs');
const URL = require('url');
const request = require('request');
const mime = require('mime-types');
const Route = require('route-parser');
const Handlebars = require('handlebars');
const CONSTANTS = require('./constants');
const router_path = path.join(userPath, '.', 'router.json');

var res_headers;
var routes = {};
var routeMap = {};
var routeState = {};
var routeMem = {};
global.headers = function() {
  return res_headers;
}
global.router = {
  get: function(address) {
    return routeState[address];
  },
  add: function(r) {
    routes = {};
    /**
    *
    * [1] From the following object:
    *
    * r := {
    *   "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut": {
    *     "/:tx": {
    *       "1KBZ3jGAzqRH2VjVkjrgBxjrpiQCQXFzwP": "https://data.bitdb.network/1KuUr2pSJDao97XM8Jsq8zwLS6W1WtFfLg/b/{{tx}}"
    *     }
    *   },
    *   "19iG3WTYSsbyos3uJ733yK4zEioi1FesNU": {
    *     "/:owner/:key": {}
    *   },
    *   "1KCm9cgDdT7r88WRQmm6gynFNmTrskdygn": {
    *     "/:hash": {
    *       "1KBZ3jGAzqRH2VjVkjrgBxjrpiQCQXFzwP": "https://data.bitdb.network/1KuUr2pSJDao97XM8Jsq8zwLS6W1WtFfLg/c/{{hash}}"
    *     }
    *   },
    *   "1BurpBxnLyL87Q8XwU9X6J1wCd3VUa7rMU": {
    *     "/LBM/:page": {
    *       "1HU76g9nAH8ndvYHi3jw1ZW5saxRxym22e": "https://londonbitcoinmeetup.com/"
    *     }
    *   }
    * }
    */
    Object.keys(r).forEach(function(k) {
      /**
      * 
      * [2] Update routeMap
      *
      * assign r into routeMap
      *
      */
      let app = r[k];
      /**
      * 
      * app := {
      *   "/:tx": {
      *     "1KBZ3jGAzqRH2VjVkjrgBxjrpiQCQXFzwP": "https://data.bitdb.network/1KuUr2pSJDao97XM8Jsq8zwLS6W1WtFfLg/b/{{tx}}"
      *   }
      * }
      *
      */
      Object.keys(app).forEach(function(path) {
        let service = app[path];
        for(let service_address in service) {
          let o = service[service_address];
          if (!routeState[k]) {
            routeState[k] = {};
          }
          if (routeState[k][path]) {
            delete routeState[k][path];
            delete routeMap[k][service_address];
          } else {
            routeState[k][path] = {}
            routeState[k][path][service_address] = o;
            let matcher = {
              i: new Route(k + path),
              o: Handlebars.compile(o)
            }
            routeMap[k] = {}
            routeMap[k][service_address] = matcher;
          }
        }
      })
      console.log("routeState = ", routeState);
      console.log("routeMap = ", routeMap);
    })
    /*
    *
    * [3] Generate routes from routeMap
    * 
    * routes := {
    *  "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut": [
    *   { i: new Route("19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut/:tx"), o: Handlebars.compile("https://data.bitdb.network/1KuUr2pSJDao97XM8Jsq8zwLS6W1WtFfLg/b/{{tx}}") },
    *   { i: new Route("19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut/:tx"), o: Handlebars.compile("https://bitpaste.app/{{tx}}") },
    *  ],
    *  "1KCm9cgDdT7r88WRQmm6gynFNmTrskdygn": [
    *   { i: new Route("1KCm9cgDdT7r88WRQmm6gynFNmTrskdygn/:hash"), o: Handlebars.compile("https://data.bitdb.network/1KuUr2pSJDao97XM8Jsq8zwLS6W1WtFfLg/c/{{hash}}") },
    *   ..
    *   { i: new Route("1BurpBxnLyL87Q8XwU9X6J1wCd3VUa7rMU/LBM/:page"), o: Handlebars.compile("https://londonbitcoinmeetup.com/") },
    *   ...
    * ]
    *
    */
    for(let key in routeMap) {
      if (!routes[key]) {
        routes[key] = [];
      }
      let endpoints = routeMap[key];
      for(let j in endpoints) {
        routes[key].push({
          endpoint: j,
          matcher: endpoints[j]
        })
      }
    }
    /*
    * [4] Later it can be matched sequentially
    *
    * let resolved;
    * for(let i=0; i<routes.length; i++) {
    *   let match = routes[i].i.match(uri)
    *   if (match) {
    *     // parse with handlebars
    *     resolved = routes[i].o(match)
    *     break;
    *   }
    * })
    *
    */
    console.log("ROUTE Map = ", routeMap)
    console.log("ROUTER = ", routes)
    fs.writeFile(router_path, JSON.stringify(routeState, null, 2), function(err, data) {
      console.log("Saved routeState", routeState);
    });
  }
}
var extract = function(uri) {
  let m = /^(b|c|bottle):\/\/([^?#]+)/i.exec(uri)
  console.log("m = ", m);
  if (m && m.length === 3) {
    let matched = m[2];
    if (matched[matched.length-1] === '/') {
      return matched.slice(0, -1); 
    } else {
      return matched;
    }
  } else {
    return null;
  }
}
var extractBit = function(uri) {
  console.log("Trying to extract", uri);
  let m = /^bit:[\/]+([^\/]+)\/([^?#]+)/i.exec(uri)
  if (m && m.length >= 3) {
    let a = m[1];
    let p = m[2];
    if (p[p.length-1] === '/') {
      p = p.slice(0, -1);
    }
    return {
      address: a,
      path: p
    }
  } else {
    return null;
  }
}
const resolver = function(extracted, callback, raw) {
  let addr = extracted.address;
  let u = addr + "/" + extracted.path;
  // Resolve URI
  let resolved;
  if (routes[addr]) {
    let e = routes[addr]
    for(let i=0; i<e.length; i++) {
      let match = e[i].matcher.i.match(u)
      if (match) {
        // parse with handlebars
        resolved = e[i].matcher.o(match)
        break;
      }
    }
    console.log("Incoming = ", u)
    console.log("resolved = ", resolved);

    if (resolved) {
      let st = request(resolved);
      st.on('response', function(response) {
        if (raw) {
          response.headers["Content-Type"] = "text/plain"

        }
        res_headers = response.headers;
        const pass = new PassThrough();
        st.pipe(pass);
        callback({
          data: pass,
          statusCode: response.statusCode,
          headers: response.headers
        });
      })
    } else {
      console.log("Not resolved")
      win.webContents.send("resolve-error", addr);
      callback({ statusCode: 404 })
    }
  } else {
    console.log("Not resolved")
    win.webContents.send("resolve-error", addr);
    callback({ statusCode: 404 })
  }
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
  win.maximize();

  win.loadURL(`file:///${dirname}/index.html`);
  fs.readFile(router_path, function(err, data) {
    console.log("read router_path", router_path);
    if (data) {
      console.log("found")
      routeState = JSON.parse(data);
      console.log("routeState = ", routeState);
      for(let k in routeState) {
        for (let path in routeState[k]) {
          let service = routeState[k][path];
          for (let service_address in service) {
            let o = service[service_address];
            let matcher = {
              i: new Route(k + path),
              o: Handlebars.compile(o)
            }
            routeMap[k] = {}
            routeMap[k][service_address] = matcher;
          }
        }
      }
      for(let key in routeMap) {
        if (!routes[key]) {
          routes[key] = [];
        }
        let endpoints = routeMap[key];
        for(let j in endpoints) {
          routes[key].push({
            endpoint: j,
            matcher: endpoints[j]
          })
        }
      }
      console.log("routeMap = ", routeMap);
    }
  });

  protocol.registerStreamProtocol('bit', function(req, callback) {
    let extracted = extractBit(req.url)
    if (extracted) {
      console.log("Extracted = ", extracted);
      resolver(extracted, callback);
    } else {
      console.log("Failed extraction")
      callback({ statusCode: 404 })
    }
  }, function (error) {
    if (error) {
      console.error('Failed to register protocol');
    }
  })

  protocol.registerStreamProtocol('b', function(req, callback) {
    let path = extract(req.url)
    resolver({ address: CONSTANTS.B, path: path }, callback)
  }, function (error) {
    if (error) {
      console.error('Failed to register protocol');
    }
  })
  protocol.registerStreamProtocol('c', function(req, callback) {
    let path = extract(req.url)
    resolver({ address: CONSTANTS.C, path: path }, callback)
  }, function (error) {
    if (error) {
      console.error('Failed to register protocol');
    }
  })
  protocol.registerStreamProtocol('source', function(req, callback) {
    const url = req.url.trim().substr(12);
    console.log("url =", url)
  })
  protocol.registerStreamProtocol('bottle', function(req, callback) {
    let url = extract(req.url);
    // file extension doesn't exist
    if (!/\.[A-Za-z0-9]+$/i.test(url)) {
      url = url + ".html";
    }
    console.log("bottle", url);
    if (url) {
      console.log("###### url = ", url)
      let stubPath = path.join(dirname, '.', url);
      console.log("###### resolved = ", stubPath)
      let exists = fs.existsSync(stubPath);
      if (exists) {
        let result = { data: fs.createReadStream(stubPath) }
        let type = mime.lookup(url);
        if (type) {
          result.headers = { "Content-type": type };
        }
        callback(result);
        return;
      }
    }
    callback({ statusCode: 404 })
  })
  protocol.interceptStreamProtocol('file', function(req, callback) {
    const url = req.url.trim().substr(8);
    if (/^b:\/\//i.test(url)) {
      let path = extract(url)
      if (path) {
        resolver({ address: CONSTANTS.B, path: path }, callback)  
      } else {
        callback({ statusCode: 404 })
      }
    } else if (/^c:\/\//i.test(url)) {
      let path = extract(url)
      if (path) {
        resolver({ address: CONSTANTS.C, path: path }, callback)  
      } else {
        callback({ statusCode: 404 })
      }
    } else {
      // regular file
      let parsed;
      if (process.platform === 'win32') {
        parsed = URL.parse(url);
      } else {
        parsed = URL.parse(req.url);
      }
      let decoded = decodeURI(parsed.pathname);
      let exists = fs.existsSync(decoded);
      let result = { data: fs.createReadStream(decoded) }
      let type = mime.lookup(decoded);
      if (type) {
        result.headers = { "Content-type": type };
      }
      callback(result);
    }
  }, function(error) {
    if (error) console.error('Failed to register protocol');
  });
  win.maximize();
  win.on('closed', function() {
    win = null;
  });
}
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.setAsDefaultProtocolClient("bottle");
app.setAsDefaultProtocolClient("bit");
app.setAsDefaultProtocolClient("b");
app.setAsDefaultProtocolClient("c");
app.on('open-url', function (event, data) {
  console.log("#### open-url =", data, event);
  event.preventDefault();
  win.webContents.send("open-tab", data);
});
app.on('ready', function() {
  if (!win) {
    createWindow();
  }
});
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
