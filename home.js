module.exports = {
  init: function() {
    var home = Nav.newTab("bottle://home", {
      id: "homePage",
      icon: "bottle://assets/cap.png",
      close: false,
      node: true,
      readonlyUrl: true,
    });
  }
}
