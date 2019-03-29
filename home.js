module.exports = {
  init: function() {
    var home = Nav.newTab("file://" + dirname + "/drive.html", {
      id: "homePage",
      icon: "file:///" + dirname + "/cap.png",
      close: false,
      node: true,
      readonlyUrl: true,
      webviewAttributes: {
        plugins: "",
        readonlyUrl: true,
        preload: dirname + "/preload.js"
      },
    });
    home.setAttribute('plugins', '');
  }
}
