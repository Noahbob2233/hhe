var banned = [
  'hentai.cafe',
  'nhentai',
  'exhentai',
  'tsumino',
  'e-hentai.org'
];

module.exports = {
  getAll: function() {
    return banned;
  },
  find: function(value) {
    var result = banned.indexOf(value)

    if (result === -1) {
      return false;
    } else {
      return result;
    }
  }
}