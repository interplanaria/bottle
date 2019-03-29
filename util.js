const utoa = function (str) { return window.btoa(unescape(encodeURIComponent(str))) }
const atou = function (str) { return decodeURIComponent(escape(window.atob(str))) }
const fromKeyCode = function(n) {
  if (47 <= n && n <= 90) return unescape('%' + (n).toString(16))
  if (96 <= n && n <= 105) return 'NUM ' + (n - 96)
  if (112 <= n && n <= 135) return 'F' + (n - 111)
  if (n == 3) return 'Cancel' //DOM_VK_CANCEL
  if (n == 6) return 'Help'   //DOM_VK_HELP
  if (n == 8) return 'Backspace'
  if (n == 9) return 'Tab'
  if (n == 12) return 'NUM 5'  //DOM_VK_CLEAR
  if (n == 13) return 'Enter'
  if (n == 16) return 'Shift'
  if (n == 17) return 'Ctrl'
  if (n == 18) return 'Alt'
  if (n == 19) return 'Pause|Break'
  if (n == 20) return 'CapsLock'
  if (n == 27) return 'Esc'
  if (n == 32) return 'Space'
  if (n == 33) return 'PageUp'
  if (n == 34) return 'PageDown'
  if (n == 35) return 'End'
  if (n == 36) return 'Home'
  if (n == 37) return 'Left Arrow'
  if (n == 38) return 'Up Arrow'
  if (n == 39) return 'Right Arrow'
  if (n == 40) return 'Down Arrow'
  if (n == 42) return '*' //Opera
  if (n == 43) return '+' //Opera
  if (n == 44) return 'PrntScrn'
  if (n == 45) return 'Insert'
  if (n == 46) return 'Delete'
  if (n == 91) return 'WIN Start'
  if (n == 92) return 'WIN Start Right'
  if (n == 93) return 'WIN Menu'
  if (n == 106) return '*'
  if (n == 107) return '+'
  if (n == 108) return 'Separator' //DOM_VK_SEPARATOR
  if (n == 109) return '-'
  if (n == 110) return '.'
  if (n == 111) return '/'
  if (n == 144) return 'NumLock'
  if (n == 145) return 'ScrollLock'
  // Firefox 15+ (bug 787504)
  // https://bugzilla.mozilla.org/show_bug.cgi?id=787504
  // https://github.com/openlayers/openlayers/issues/605
  if (-1 != navigator.userAgent.indexOf('Firefox')) {
    if (n == 173 && KeyEvent && n == KeyEvent.DOM_VK_HYPHEN_MINUS) return '- _'
    if (n == 181 && KeyEvent && n == KeyEvent.DOM_VK_VOLUME_MUTE) return 'Mute On|Off'
    if (n == 182 && KeyEvent && n == KeyEvent.DOM_VK_VOLUME_DOWN) return 'Volume Down'
    if (n == 183 && KeyEvent && n == KeyEvent.DOM_VK_VOLUME_UP) return 'Volume Up'
  }
  //Media buttons (Inspiron laptops) 
  if (n == 173) return 'Mute On|Off'
  if (n == 174) return 'Volume Down'
  if (n == 175) return 'Volume Up'
  if (n == 176) return 'Media >>'
  if (n == 177) return 'Media <<'
  if (n == 178) return 'Media Stop'
  if (n == 179) return 'Media Play|Pause'
  if (n == 182) return 'WIN My Computer'
  if (n == 183) return 'WIN Calculator'
  if (n == 186) return '; :'
  if (n == 187) return '= +'
  if (n == 188) return ', <'
  if (n == 189) return '- _'
  if (n == 190) return '. >'
  if (n == 191) return '/ ?'
  if (n == 192) return '\` ~'
  if (n == 219) return '[ {'
  if (n == 220) return '\\ |'
  if (n == 221) return '] }'
  if (n == 222) return '\' "'
  if (n == 224) return 'META|Command'
  if (n == 229) return 'WIN IME'
  if (n == 255) return 'Device-specific' //Dell Home button (Inspiron laptops)
  return null
}
module.exports = {
  utoa: utoa,
  atou: atou,
  fromKeyCode: fromKeyCode
}
