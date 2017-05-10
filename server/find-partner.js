var gender  = require("../models/gender");
var kinks   = require("../models/kinks");
var avatars = require("../models/avatars");

module.exports = function (socket, users) {
  /**
   * Handles connecting two users together for a yiffing session.
   * @param  Object preferences The yiffing preferences of the user.
   */
  socket.on('find partner', function (preferences) {
    var user = {
      socketId: socket.id,
      info: preferences
    };
    var partner;
    var partnerSocket;
    var pendingUsers = users.getPendingUsers();

    // If user submitted any blank values, do not search for anything.
    if (checkEmpty(preferences.user) || checkEmpty(preferences.partner) || checkEmpty(preferences.kinks)) {
      socket.emit('invalid preferences');
      return false;
    }

    // Make sure user didn't try to submit any values not allowed.
    if (checkInvalid({kinks: preferences.kinks})) {
      socket.emit('invalid preferences');
      return false;
    }

    // User is looking for a new partner, therefore delete any existing paired partner.
    if (socket.partner) {
      // Send message to the partner that the user has disconnected.
      socket.broadcast.to(socket.partner.socketId).emit('partner disconnected');

      // Disconnect user from partner.
      users.removePartner(socket.partner.socketId);

      // Disconnect partner from user.
      delete socket.partner;
    }

    // Look for a partner to yiff with in the list of pending users
    for (var i = 0; i < pendingUsers.length; i++) {
      var tmpUser = pendingUsers[i];

      // Make sure our current partner is not our new partner and is not ourselves.
      if (socket.partner != tmpUser && socket.id != tmpUser.socketId) {

        if (matchedDesires(preferences.kinks, tmpUser.info.kinks) && matchedPreferences(preferences, tmpUser.info)) {
          // Get the socket client for this partner
          partnerSocket = users.findClient(tmpUser.socketId);

          // Remove the partner we found from the list of users looking for a partner
          pendingUsers.splice(i, 1);

          // If the partner we found exists / hasn't disconnected
          if (partnerSocket) {
            partner = tmpUser;

            socket.emit('partner connected', {
              gender: partner.info.user.gender,
              kinks: partner.info.kinks.join(", "),
              avatar: partner.info.avatar,
              country: partner.info.country,
            });

            break;
          }
        }
      }
    }

    // User found a partner
    if (partner) {
      // Match user and partner as yiffing partners
      socket.partner = partner;
      partnerSocket.partner = user;

      // Remove user and partner from pending users
      socket.inlist = false;
      partnerSocket.inlist = false;

      // Inform partner of match
      socket.broadcast.to(partner.socketId).emit('partner connected', {
        gender: user.info.user.gender,
        kinks: user.info.kinks.join(", "),
        avatar: user.info.avatar,
        country: user.info.country,
      });
    } else {
      // Add user to pending users list
      if (!socket.inlist) {
        socket.inlist = true;
        pendingUsers.push(user);
      }

      // Inform the user that the system is still waiting for a match.
      socket.emit('no match');
    }
  });
}

/**
 * Checks for any empty fields.
 * 
 * @param  Object preferences The preference object.
 * @return Boolean
 */
function checkEmpty(preferences) {
  for (var key in preferences) {
    if (preferences[key].length < 1) {
      return true;
    }
  }
  return false;
}

/**
 * Checks for invalid pairing options.
 * 
 * @param  Object preferences The preference object.
 * @return Boolean
 */
function checkInvalid(preferences) {
  for (var key in preferences) {
    if (preferences[key] instanceof Array) {
      for (var i = 0; i < preferences[key].length; i++) {
        if (preferences[key][i] != 'any' && eval(key).find(preferences[key][i]) === false) {
          return true;
        }
      }
    } else {
      if (preferences[key] != 'any' && eval(key).find(preferences[key]) === false) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Figure out if two users match each other's requirements.
 * 
 * @param  Object user    User's preferences
 * @param  Object partner Possible partner's preferences
 * @return Boolean
 */
function matchedPreferences(user, partner) {
  var matchCount = 0;
  
  var originalUserGender = user.user['gender'];
  var originalPartnerGender = partner.user['gender'];

  if (partner.user['gender'] != 'Male' && partner.user['gender'] != 'Female') {
    partner.user['gender'] = 'other';
  }
  
  if (user.user['gender'] != 'Male' && user.user['gender'] != 'Female') {
    user.user['gender'] = 'other';
  }

  if ((user.partner['gender'].indexOf(partner.user['gender']) !== -1 || user.partner['gender'].indexOf('any') !== -1) &&
    (partner.partner['gender'].indexOf(user.user['gender']) !== -1 || partner.partner['gender'].indexOf('any') !== -1)) {
    ++matchCount;
  }
  
  partner.user['gender'] = originalPartnerGender;
  user.user['gender'] = originalUserGender;

  if (matchCount >= 1) {
    return true;
  } else {
    return false;
  }
}

/**
 * Match users kinks to see if they are into the same thing.
 * 
 * @param  Array userKinks    User's kinks
 * @param  Array partnerKinks Possible partner's kinks
 * @return Boolean
 */
function matchedDesires(userKinks, partnerKinks) {
  if (userKinks.indexOf('any') !== -1 || partnerKinks.indexOf('any') !== -1) {
    return true;
  }

  if (similiarKinks(userKinks, partnerKinks, 1)) {
    return true;
  }

  return false;
}

/**
 * Checks if the user and partner share a number of similar kinks.
 * @param  Object userKinks     The user's kink preferences.
 * @param  Object partnerKinks  The partner's kink preferences.
 * @param  Integer similarities The number of similar kinks to have to give a valid result.
 * @return Boolean
 */
function similiarKinks(userKinks, partnerKinks, similarities) {
  var similar = 0;

  for (var i = 0; i < userKinks.length; i++) {
    if (partnerKinks.indexOf(userKinks[i]) !== -1) {
      similar++;
    }

    if (similar >= similarities) {
      return true;
    }
  }
  return false;
}