var current;
module.exports = {
  get: function() {
    return current;
  },
  set: function(val) {
    current = val;
    return current;
  }
}
