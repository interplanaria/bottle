var ondragstart = function(ev) {
  let url = ev.target.dataset.url;
  Bookmarklet.del(url);
}
var ondrop = function(ev) {
  ev.preventDefault()
  ev.stopPropagation()
  if (ev.target.id === 'nav-body-shortcuts' || ev.target.closest("#nav-body-shortcuts")) {
    let url = ev.dataTransfer.getData("text/plain");
    Bookmarklet.set(url);
  }
}
var onkeydown = function(e) {
  var ctrlPressed = 0;
  var altPressed = 0;
  var shiftPressed = 0;
  var metaPressed = 0;
  var evt = (e == null ? event : e);
  shiftPressed = evt.shiftKey;
  altPressed = evt.altKey;
  ctrlPressed = evt.ctrlKey;
  metaPressed = evt.metaKey;

  // DevTools for each tab => Ctrl+Shift+E
  if (shiftPressed && ctrlPressed && Util.fromKeyCode(evt.keyCode) == 'E'){
    Nav.openDevTools();
    e.preventDefault();        
    return false;
  }
  if (shiftPressed && metaPressed && Util.fromKeyCode(evt.keyCode) == 'C'){
    Nav.openDevTools();
    e.preventDefault();        
    return false;
  }
  // New tab => Ctrl+T
  if (ctrlPressed && Util.fromKeyCode(evt.keyCode) == 'T' || metaPressed && Util.fromKeyCode(evt.keyCode) == 'T') {
    document.querySelector("#nav-ctrls-url").blur();
    let tab = Nav.newTab("about:blank", {
      icon: "bottle://assets/cap.png",
      webviewAttributes: {
        plugins: "", preload: dirname + "/preload.js"
      },
    })
    tab.setAttribute('plugins', '');
    e.preventDefault();
    setTimeout(function() {
      document.querySelector("#nav-ctrls-url").focus();
    }, 100)
    return false;
  }
  if (ctrlPressed && Util.fromKeyCode(evt.keyCode) == 'R' || metaPressed && Util.fromKeyCode(evt.keyCode) == 'R') {
    Nav.reload();
    e.preventDefault();
    return false;
  }
  // Close tab => Ctrl+W
  if (ctrlPressed && Util.fromKeyCode(evt.keyCode) == 'W' || metaPressed && Util.fromKeyCode(evt.keyCode) == 'W') {
    Nav.closeTab();
    e.preventDefault();        
    return false;
  }
  // Print tab => Ctrl+P
  if (ctrlPressed && Util.fromKeyCode(evt.keyCode) == 'P' || metaPressed && Util.fromKeyCode(evt.keyCode) == 'P') {
    Nav.printTab();
    e.preventDefault();        
    return false;        
  }
  // Prev tab => Ctrl+Shift+Tab
  if (ctrlPressed && shiftPressed && Util.fromKeyCode(evt.keyCode) == 'Tab' || metaPressed && shiftPressed && Util.fromKeyCode(evt.keyCode) == 'Tab') {
    Nav.prevTab();
    e.preventDefault();        
    return false;        
  }
  // Next tab => Ctrl+Tab
  if (ctrlPressed && Util.fromKeyCode(evt.keyCode) == 'Tab' || metaPressed && Util.fromKeyCode(evt.keyCode) == 'Tab') {
    Nav.nextTab();
    e.preventDefault();        
    return false;        
  }
  return true;
}
module.exports = {
  init: function() {
    document.addEventListener("DOMContentLoaded", function(e) {
      ipcRenderer.on('route-updated', (event, url) => {
        console.log("ROUTE UPDATED", url);
        document.querySelectorAll("webview[src='" + url + "']").forEach(function(el) {
          el.reload();
        })
      });
      ipcRenderer.on('open-tab', (event, url) => {
        if (!/^bottle:.+/.test(url)) {
          let tab = Nav.newTab(url, { icon: "bottle://assets/cap.png" })
        }
      });
      ipcRenderer.on('resolve-error', (event, address) => {
        let url = document.querySelector("#nav-ctrls-url").value;
        console.log("url = ", url);
        if (/^bit:.+/.test(url)) {
          let html = "<div><i class='fas fa-exclamation-circle'></i> Connection required</div><div class='flexible'></div><a href='bottle://bitcom?redirect=" + url +"&address=" + address + "' target='_blank' class='btn'>Connect to " + address + "</a>";;
          document.querySelector("#nav-footer .sub").innerHTML = html;
        }
      });
      document.querySelector("#nav-body-shortcuts").addEventListener("dragleave", function(ev) {
        ev.preventDefault();
        document.querySelector("#nav-body-shortcuts").style.backgroundColor = "whitesmoke";
      }, false);
      document.querySelector("#nav-body-shortcuts").addEventListener("dragover", function(ev) {
        ev.preventDefault();
        document.querySelector("#nav-body-shortcuts").style.backgroundColor = "silver";
      }, false);
      document.querySelector("#nav-body-shortcuts").addEventListener("click", function(e) {
        if (e.target.className === 'shortcut') {
          let url = e.target.dataset.url;
          if (/^(https?:|b:|c:|bit:|bottle:).*/i.test(url)) {
            document.querySelector("webview.nav-views-view.active").executeJavaScript("location.href='" + url + "'")
          } else if (/^javascript:/.test(url)) {
            let js = url.replace(/javascript:/, "");
            document.querySelector("webview.nav-views-view.active").executeJavaScript(js);
          } else {
            document.querySelector("webview.nav-views-view.active").executeJavaScript(url);
          }
        }
      })
      document.addEventListener("dragstart", ondragstart);
      document.addEventListener("drop", ondrop);
      document.addEventListener("keydown", onkeydown);
    });
  }
}
