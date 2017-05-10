var avatars = [
  "char_00",
  "char_01",
  "char_02",
  "char_03",
  "char_04",
  "char_05",
  "char_06",
  "char_07",
  "char_08"
];


module.exports = {
  getAll: function() {
    return avatars;
  },
  find: function(value) {
    var result = avatars.indexOf(value)

    if (result === -1) {
      return false;
    } else {
      return result;
    }
  }
}