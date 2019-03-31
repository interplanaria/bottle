const {webFrame} = require('electron');
module.exports = {
  init: function() {
    webFrame.registerURLSchemeAsPrivileged("b");
    webFrame.registerURLSchemeAsPrivileged("c");
    webFrame.registerURLSchemeAsPrivileged("file");
    webFrame.registerURLSchemeAsBypassingCSP("b");
    webFrame.registerURLSchemeAsBypassingCSP("c");
    webFrame.registerURLSchemeAsBypassingCSP("file");
  }
}
