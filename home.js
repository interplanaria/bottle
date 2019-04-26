module.exports = {
  init: function() {
    var home = Nav.newTab("bottle://drive", {
    // var home = Nav.newTab("file://" + dirname + "/drive.html", {
      id: "homePage",
      icon: "file:///" + dirname + "/cap.png",
      close: false,
      node: true,
      readonlyUrl: true,
    });
  }
}
