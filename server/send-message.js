var string = require('string');
var banned = require("../models/banned");

module.exports = function (socket) {
  /**
   * Handles sending a message to the user's partner.
   * @param  String message The message to send.
   */
  socket.on('send message', function(message) {
    var words = banned.getAll();

    var partner = socket.partner;
    var msg = string(message).stripTags().s;
    var valid = true;
    
    for (var word of words) {
      var check = msg.toLowerCase();
      if (check.includes(word)) {
        valid = false;
      }
    }
    
    if (!partner) {
      return false;
    }
    
    if (valid === true) {
      socket.broadcast.to(partner.socketId).emit('receive message', { message: msg });
    } else {
      return false;
    }
  });
}