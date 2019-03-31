const { remote } = require('electron');
const URIScheme = require('./urischeme');
navigator.bitcoin = {
  config: require('./settings.json'),
  headers: function() {
    return Object.assign({}, remote.getGlobal("headers")());
  }
}
URIScheme.init();
