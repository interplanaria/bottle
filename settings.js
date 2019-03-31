module.exports = {
  init: function() {
    var settings_path = path.join(userPath, '.', 'settings.json');
    fs.readFile(settings_path, function(err, data) {
      let needToSet = false;
      if(data){
        try {
          let content = JSON.parse(data) ;
          if (!content.b || content.b.length === 0) {
            needToSet = true;
          }
          if (!content.c || content.c.length === 0) {
            needToSet = true;
          }
        } catch (e) {
          needToSet = true;
        }
      } else {
        needToSet = true;
      }
      if (needToSet) {
        let url = "file:///" + dirname + "/settings.html";
        let source = Nav.newTab(url, {
          node: true,
          readonlyUrl: true,
          webviewAttributes: {
            plugins: "",
            preload: dirname + "/preload.js"
          },
        })
        source.setAttribute('plugins', '');
      }
    })
  }
}
