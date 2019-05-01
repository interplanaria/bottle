const { remote } = require('electron');
const URIScheme = require('./urischeme');
navigator.bitcoin = {
  headers: function() {
    return Object.assign({}, remote.getGlobal("headers")());
  }
}
URIScheme.init();
