const Route = require('./route');
const Util = require('./util');
const Bookmarklet = require('./bookmarklet');
const handleNav = function() {
  let current_url = Route.get();
  let src = document.querySelector("#nav-source");
  let bookmark = document.querySelector("#nav-bookmark");
  if (/^view-source:.*/.test(current_url)) {
    if (src) src.classList.add("hidden");
    if (bookmark) bookmark.classList.add("hidden");
  } else if (/^bottle:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html/.test(current_url)) {
    if (src) src.classList.add("hidden");
    if (bookmark) bookmark.classList.add("hidden");
  } else if (/^file:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html/.test(current_url)) {
    if (src) src.classList.add("hidden");
    if (bookmark) bookmark.classList.add("hidden");
  } else if (/^chrome.*/.test(current_url)) {
    if (src) src.classList.add("hidden");
  } else {
    if (src) src.classList.remove("hidden");
    if (bookmark) bookmark.classList.remove("hidden");
  }
}

// Create Nav
const enav = new (require('electron-navigation'))({
  newTabCallback: function(url, options) {
    let newOptions = options;
    let newUrl = url;
    newOptions.icon = "file:///" + dirname + "/cap.png";
    if (/(^c:\/\/|^b:\/\/|^bit:\/\/).+/.test(url)) {
      newOptions.title = url;
    } else if (/file:\/\/\/(C|B|bit):\/\/.*/i.test(url)) {
      newUrl = url.replace(/file:\/\/\//, "").toLowerCase();
      newOptions.title = newUrl;
    } else if (/^bottle:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html/.test(url)) {
//      document.querySelector("#nav-ctrls-url").value = "";
//      document.querySelector("#nav-ctrls-url").focus();
      newOptions.title = "Bottle";
      newOptions.webviewAttributes.nodeIntegration = true
    } else if (/^file:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html/.test(url)) {
      document.querySelector("#nav-ctrls-url").value = "";
      document.querySelector("#nav-ctrls-url").focus();
      newOptions.title = "Bottle";
    } else {
      newOptions.title = "Bottle";
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
    if (/^file:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html/.test(current_url)) {
      document.querySelector("#nav-body-shortcuts").classList.add("disabled");
    } else if (/^bottle:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html/.test(current_url)) {
      document.querySelector("#nav-body-shortcuts").classList.add("disabled");
    } else {
      document.querySelector("#nav-body-shortcuts").classList.remove("disabled");
    }
    if (/^view-source:.*/.test(current_url)) {
      let original_url = current_url.slice(12);
      fetch(original_url).then(function(res) {
        return res.text();
      }).then(function(res) {
        el.loadURL("data:text/plain;base64," + Util.utoa(res));
      });
    } else if (/about:blank/.test(current_url)) {
      document.querySelector("#nav-ctrls-url").focus();
      document.querySelector("#nav-source").classList.add("hidden");
    } else if (/bottle:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html$/.test(current_url)) {
//      document.querySelector("#nav-ctrls-url").value = "";
//      document.querySelector("#nav-ctrls-url").focus();
    } else if (/file:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html$/.test(current_url)) {
      document.querySelector("#nav-ctrls-url").value = "";
      document.querySelector("#nav-ctrls-url").focus();
    }
    //handleNav()
  },
  newTabParams: ["", {
    defaultFavicons: true,
    icon: "file:///" + dirname + "/cap.png"
  }],
});


/***********************************************************************
*
*  Override Nav Methods
*
***********************************************************************/
// 1. _purifyUrl Override
enav._purifyUrl = function(str) {
  let url = str.trim();
  if (/^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/.test(url)) {
    url = "bitcoin:" + url;
  } else if (/^bit?:\/\/.*/i.test(url)) {
  } else if (/^c?:\/\/.*/i.test(url)) {
//  } else if (/bottle:\/\/(C|B|bit):\/\/.*/i.test(url)) {
//    url = url.replace(/bottle:\/\//i, "");
  } else if (/bottle:.*/i.test(url)) {
  } else if (/^b?:\/\/.*/i.test(url)) {
  } else if (/file:\/\/\/(C|B|bit):\/\/.*/i.test(url)) {
    url = url.replace(/file:\/\/\//i, "");
  } else if (/file:.*/i.test(url)) {
  } else if (/^\/.*/i.test(url)) {
    url = "file:///" + dirname + url;
  } else if (/^https?:\/\/.*/i.test(url)) {
    url = (url.match(/^https?:\/\/.*/i)) ? url : 'http://' + url;
  } else if (/^view-source:.*/.test(url)) {
  } else if (/^chrome-devtools:.*/.test(url)) {
  } else {
    url = "about:blank";
  }
  return url;
}
// 2. _updateUrl Override
var oldUpdateUrl = enav._updateUrl;
enav._updateUrl = function(url) {
  let current_url = Route.get();
  if (/file:\/\/\/(b|c|bit):\/\//i.test(url)) {
    let newUrl = url.replace(/file:\/\/\//i, "");
    current_url = Route.set(newUrl);
    oldUpdateUrl(newUrl);
  } else if (/file:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html$/.test(current_url)) {
    document.querySelector("#nav-ctrls-url").value = "";
    document.querySelector("#nav-ctrls-url").focus();
//  } else if (/bottle:\/\/(b|c|bit):\/\//i.test(url)) {
//    let newUrl = url.replace(/bottle:\/\//i, "");
//    //current_url = Route.set(newUrl);
//    current_url = Route.set(url);
//    oldUpdateUrl(url);
//  } else if (/bottle:\/\/.*(com|drive|bitcom|settings|bookmark|write)\.html$/.test(current_url)) {
//    document.querySelector("#nav-ctrls-url").value = "";
//    document.querySelector("#nav-ctrls-url").focus();
  } else if (url) {
    // todo: generalize
    if (url != "https://www.moneybutton.com/iframe/v2?format=postmessage") {
      current_url = Route.set(url);
      //handleNav()
      oldUpdateUrl(current_url);
    }
  }
  if (Bookmarklet) {
    Bookmarklet.get().then(function(items) {
      Bookmarklet.render(items);
    })
  }
  handleNav();
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
  id: "nav-bookmark", hidden: true, title: "bookmark", icon: "file:///" + dirname + "/star.png", onclick: function(e) {
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
  id: "nav-source", hidden: true, title: "view source", icon: "file:///" + dirname + "/code.png", onclick: function(e) {
    let current_url = Route.get();
    let new_url = "view-source:" + current_url;
    let source = Nav.newTab(new_url, {
      icon: "file:///" + dirname + "/code.png",
      readonlyUrl: true,
      webviewAttributes: {
        plugins: "",
        preload: dirname + "/preload.js"
      },
    })
    source.setAttribute('plugins', '');
  }
})
/*
button({
  id: "nav-settings", title: "settings", icon: "file:///" + dirname + "/wrench.png", onclick: function(e) {
    let new_url = "file:///" + dirname + "/settings.html";
    let source = Nav.newTab(new_url, {
      node: true,
      icon: "file:///" + dirname + "/wrench.png",
      readonlyUrl: true,
      webviewAttributes: {
        plugins: "",
        preload: dirname + "/preload.js"
      },
    })
    source.setAttribute('plugins', '');
  }
})
*/
button({
  id: "nav-settings", title: "settings", icon: "file:///" + dirname + "/wrench.png", onclick: function(e) {
    let new_url = "file:///" + dirname + "/bitcom.html";
    let source = Nav.newTab(new_url, {
      node: true,
      icon: "file:///" + dirname + "/wrench.png",
      readonlyUrl: true,
      webviewAttributes: {
        plugins: "",
        preload: dirname + "/preload.js"
      },
    })
    source.setAttribute('plugins', '');
  }
})

Bookmarklet.get().then(function(items) {
  Bookmarklet.render(items);
});

module.exports = enav;
