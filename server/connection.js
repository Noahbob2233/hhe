var users = require("../models/users");

module.exports = function (io) {
    /**
     * Handles the connection of a user.
     */
    io.sockets.on('connection', function(socket) {
        users.addClient(socket);
        users.incrementOnline();

        console.log('User Connected! Total Users Online: %d', users.getOnline());

        // Events
        require('./find-partner')(socket, users);
        require('./typing')(socket);
        require('./send-message')(socket);
        require('./disconnect')(socket, users);
    });
};