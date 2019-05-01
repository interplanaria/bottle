const Route = require('./route');
const Util = require('./util');
const Bookmarklet = require('./bookmarklet');
const CONSTANTS = require('./constants');
const handleNav = function() {
  let current_url = Route.get();
  let src = document.querySelector("#nav-source");
  let bookmark = document.querySelector("#nav-bookmark");
  let bar = document.querySelector("#nav-body-shortcuts");
  if (/^bottle:\/\/.*/.test(current_url)) {
    if (src) src.classList.add("hidden");
    if (bar) bar.classList.add("disabled");
    if (bookmark) bookmark.classList.add("hidden");
  } else {
    if (src) src.classList.remove("hidden");
    if (bar) bar.classList.remove("disabled");
    if (bookmark) bookmark.classList.remove("hidden");
  }
}

// Create Nav
const enav = new (require('electron-navigation'))({
  newTabCallback: function(url, options) {
    let newOptions = options;
    let newUrl = url;
    newOptions.icon = "bottle://assets/cap.png";
    if (/^bottle:\/\/.*/.test(url)) {
      newOptions.webviewAttributes.nodeIntegration = true;
      newOptions.title = newUrl;
      newOptions.webviewAttributes.readonlyUrl = true;
      newOptions.readonlyUrl = true;
    }
    Route.set(url);
    newOptions.webviewAttributes.plugins = "";
    newOptions.webviewAttributes.defaultEncoding = "utf-8";
    newOptions.webviewAttributes.preload = dirname + "/preload.js";
    newOptions.webviewAttributes.disablewebsecurity = "";
    newOptions.webviewAttributes.contextIsolation = "";
    let ret = { url: newUrl, options: newOptions };
    return ret;
  },
  changeTabCallback: function(el) {
    let current_url = Route.set(el.getAttribute('src'));
    handleNav()
  },
  newTabParams: ["about:blank", {
    defaultFavicons: true,
    icon: "bottle://assets/cap.png"
  }],
});


var addEvents = enav._addEvents;

enav._addEvents = function (sessionID, options) {
  let wv = addEvents(sessionID, options);
  wv.addEventListener("did-fail-load", function(res) {
    console.log("#### Err = ", res)
    if (res.errorCode != -3) {
      let m = /bit:\/\/([^\/]+)\/.*/i.exec(res.validatedURL)
      if (m && m.length > 0) {
        let style = "var style = document.body.style; style.padding='100px'; style.textAlign='center'; style.margin=0; style.background='rgba(0,0,0,0.9)'; style.color='white'; style.fontFamily='Menlo,monaco,monospace'; style.fontSize='11px';"
        let s = style + " document.body.innerHTML='<div>" +
          "<div>The protocol is not yet connected. Please connect with an endpoint</div>" +
          "<a style=\"margin: 20px; background: burlywood; padding: 10px; border-radius: 2px; text-decoration: none; display: inline-block; padding: 10px; color: rgba(0,0,0,0.8); border: 1px solid rgba(0,0,0,0.3); \" target=\"_blank\" href=\"bottle://bitcom?redirect=" + res.validatedURL + "&address=" + m[1] + "\">Connect to " + m[1] + "</a>" +
          "</div>';";
        wv.executeJavaScript(s);
      }
    }
  })
  return wv;
}

var updateUrl = enav._updateUrl;
enav._updateUrl = function(url) {
  let current_url = Route.get();
  document.querySelector("#nav-footer .sub").innerHTML = "";
  if (url === current_url) {
    updateUrl(url);
    let m = /bit:\/\/([^\/]+)\/.*/i.exec(url);
    if (m && m.length > 0) {
      const router = remote.getGlobal("router")
      let connection = router.get(m[1]);
      if (connection && Object.keys(connection).length > 0) {
        let _path = Object.keys(connection)[0];
        let _endpoint = connection[_path];
        if (_endpoint) {
          let _addr = Object.keys(_endpoint)[0];
          let _api = Object.values(_endpoint)[0];
          let html = "<div><i class='fas fa-plug'></i> " + _path + " <i class='fas fa-angle-double-right'></i> " + _api + "</div><a href='bottle://bitcom?redirect=" + url + "&address=" + m[1] + "' target='_blank' class='btn'>Switch Endpoint</a>";
          document.querySelector("#nav-footer .main").innerHTML = html;
        } else {
          let html = "<div><i class='fas fa-plug'></i> " + _path + "</div><a href='bottle://bitcom?redirect=" + url + "&address=" + m[1] + "' target='_blank' class='btn'>Switch Endpoint</a>";
          document.querySelector("#nav-footer .main").innerHTML = html;
        }
      } else {
        let html = "<div><i class='fas fa-plug'></i> " + _path + "</div><a href='bottle://bitcom?redirect=" + url + "&address=" + m[1] + "' target='_blank' class='btn'>Switch Endpoint</a>";
        document.querySelector("#nav-footer .main").innerHTML = html;
      }
    } else {
      document.querySelector("#nav-footer .main").innerHTML = "";
    }
  }
}

/***********************************************************************
*
*  Override Nav Methods
*
***********************************************************************/
var pu = enav._purifyUrl;
enav._purifyUrl = function(str) {
  let p = str.trim();
  let r = /^(bit|b|c):\/\/([^\/]+)/i.exec(p);
  if (r && r.length > 0) {
    if (r[1].toLowerCase() === 'b') {
      return "bit://" + CONSTANTS.B + "/" + r[2];
    } else if (r[1].toLowerCase() === 'c') {
      return "bit://" + CONSTANTS.C + "/" + r[2];
    } else {
      return p;
    }
  } else if (p === 'about:blank') {
    return p;
  } else {
    return pu(str);
  }
}

/***********************************************************************
*
*  Create Extended Navbar Buttons
*
***********************************************************************/
var button = function(o) {
  let d =  document.createElement("div");
  d.innerHTML = '<i id="' + o.id + '" class="nav-tab-item nav-icons' + (o.hidden ? ' hidden"' : '"') + ' title="' + o.title + '"><img src="' + o.icon + '"></i>';
  document.querySelector("#nav-body-ctrls").appendChild(d);
  d.addEventListener("click", o.onclick);
}
button({
  id: "nav-bookmark", hidden: true, title: "bookmark", icon: "bottle://assets/star.png", onclick: function(e) {
    let current_url = Route.get();
    let match = /chrome:\/\/[^/]+\/index\.html\?src=(.+)$/g.exec(current_url);
    if (match && match.length > 1) {
      current_url = Route.set(match[1]);
    }
    if (Bookmarklet.items.map(function(item) { return item.url }).includes(current_url)) {
      Bookmarklet.del(current_url);
    } else {
      Bookmarklet.set(current_url);
    }
  }
});
button({
  id: "nav-source", hidden: true, title: "view source", icon: "bottle://assets/code.png", onclick: function(e) {
    let current_url = Route.get();
    let new_url = "bottle://inspect?uri=" + current_url;
    let source = Nav.newTab(new_url, {
      icon: "bottle://assets/code.png",
      readonlyUrl: true,
    })
  }
})

Bookmarklet.get().then(function(items) {
  Bookmarklet.render(items);
});


module.exports = enav;
