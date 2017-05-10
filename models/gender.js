var genders = [
  "Female",
  "Male",
  "Other"
];

module.exports = {
  getAll: function() {
    return genders;
  },
  find: function(value) {
    var result = genders.indexOf(value)

    if (result === -1) {
      return false;
    } else {
      return result;
    }
  }
}