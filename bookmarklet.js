var Bookmarklet = {
  path: path.join(userPath, '.', 'bookmark.json'),
  get: function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(Bookmarklet.path, function(err, data) {
        if(data){
          try {
            var items = JSON.parse(data);
            Bookmarklet.items = items;
            resolve(items);
          } catch (e) {
            console.log("Error", e);
            reject();
          }
        } else {
          resolve([]);
        }
      })
    })
  },
  set: function(url) {
    url = url.replace(/^file:\/\/\//i, "");
    document.querySelector("#nav-body-shortcuts").style.backgroundColor = "whitesmoke";
    prompt({
      title: 'Bookmarklet',
      label: 'Save as:',
      value: '',
      resizable: true,
      customStylesheet: dirname + "/prompt.css"
    }).then(function(r) {
      if(r === null) {
        console.log('user cancelled');
      } else {
        Bookmarklet.get().then(function(items) {
          items.push({ name: r, url: url })
          fs.writeFile(Bookmarklet.path, JSON.stringify(items, null, 2), function(err, data) {
            Bookmarklet.items = items;
            Bookmarklet.render(items);
          })
        })
      }
    }).catch(console.error);
  },
  del: function(url) {
    Bookmarklet.get().then(function(items) {
      let index = items.map(function(item) {
        return item.url;
      }).indexOf(url);
      if (index > -1) {
        items.splice(index, 1);
      }
      Bookmarklet.items = items;
      fs.writeFile(Bookmarklet.path, JSON.stringify(items, null, 2), function(err, data) {
        Bookmarklet.render(items);
      })
    })
  },
  render: function(items) {
    let marklets = items.map(function(item) {
      return "<a draggable='true' class='shortcut' data-url='" + item.url + "'>" + item.name + "</a>";
    }).join("");
    document.querySelector("#nav-body-shortcuts").innerHTML = marklets;
    Bookmarklet.update();
  },
  update: function() {
    let current_url = Route.get();
    let icon = (Bookmarklet.items.map(function(item) { return item.url }).includes(current_url) ? "bottle://assets/yellowstar.png" : "bottle://assets/star.png");
    document.querySelector("#nav-bookmark img").setAttribute("src", icon);
  },
  items: []
}
module.exports = Bookmarklet;
