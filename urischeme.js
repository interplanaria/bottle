const {webFrame} = require('electron');
module.exports = {
  init: function() {
    webFrame.registerURLSchemeAsPrivileged("bottle");
    webFrame.registerURLSchemeAsPrivileged("bit");
    webFrame.registerURLSchemeAsPrivileged("b");
    webFrame.registerURLSchemeAsPrivileged("c");
    webFrame.registerURLSchemeAsPrivileged("file");
    webFrame.registerURLSchemeAsBypassingCSP("bottle");
    webFrame.registerURLSchemeAsBypassingCSP("bit");
    webFrame.registerURLSchemeAsBypassingCSP("b");
    webFrame.registerURLSchemeAsBypassingCSP("c");
    webFrame.registerURLSchemeAsBypassingCSP("file");
  }
}
