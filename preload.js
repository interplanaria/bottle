const URIScheme = require('./urischeme');
navigator.bitcoin = {
  config: require('./settings.json')
}
URIScheme.init();
