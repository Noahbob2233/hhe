var socket = io.connect();
var partner = false;
var typingTimer;
var spinner;

function showSpinner()
{
  var opts = {
    lines: 13 // The number of lines to draw
  , length: 28 // The length of each line
  , width: 14 // The line thickness
  , radius: 42 // The radius of the inner circle
  , scale: 1 // Scales overall size of the spinner
  , corners: 1 // Corner roundness (0..1)
  , color: '#FFF' // #rgb or #rrggbb or array of colors
  , opacity: 0.25 // Opacity of the lines
  , rotate: 0 // The rotation offset
  , direction: 1 // 1: clockwise, -1: counterclockwise
  , speed: 1 // Rounds per second
  , trail: 60 // Afterglow percentage
  , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
  , zIndex: 2e9 // The z-index (defaults to 2000000000)
  , className: 'spinner' // The CSS class to assign to the spinner
  , top: '50%' // Top position relative to parent
  , left: '50%' // Left position relative to parent
  , shadow: true // Whether to render a shadow
  , hwaccel: false // Whether to use hardware acceleration
  , position: 'absolute' // Element positioning
  }
  var target = document.getElementById('body');
  spinner = new Spinner(opts).spin(target);
  $("body").css("overflow", "hidden");
  $(".overlay").show();
}

function hideSpinner()
{
  spinner.stop();
	$("body").css("overflow", "auto");
  $(".overlay").hide();
}

$(function() {
  loadSavedPreferences();
  
  if (document.documentElement.clientWidth <= 750) {
    $("#avatar-you").insertAfter("#avatar-partner");
  }
  
  $('.my-flipster').flipster({
    style: 'carousel',
    spacing: -0.5,
    buttons: true,
    start: 0
  });
  
  $('.selectpicker').selectpicker();

  var messageBox = document.getElementById("messageBox");

  $(window).on('beforeunload', function(e) {
    return 'Are you sure you want to leave FAKKU Dating?';
  });
  
  $('#userGender').on('change', function(e) {
    e.preventDefault();
    
    if ($('#userGender').val() == 'Other') {
      $('#userGenderParent').html('<div class="other-label input-sm">Other:</div><input type="text" name="userGender" id="userGender" class="form-control input-sm" maxlength="32">');
      $('#userGender').focus();
    }
  });
  
  $('#avatarselect').on('click', function(e) {
    e.preventDefault();
    
    $('#avatarselect').modal({
      show: true
    })
  });
  
  $('#newPartner').on('click', function(e) {
      e.preventDefault();
  
        if (partner) {
          if (!confirm('Are you sure you want to find a new partner?')) return false;
    
            newMessage('You have disconnected from your partner!');
        }
  
      var gender        = $('#userGender').val();
      var userKinks     = $('#userKinks').val();
      var matchGender   = $('#partnerGender').val();
      var avatar        = $('#userAvatar').val();

      if (gender === '') {
        alert('Please select your gender.');
        return false;
      }

      if (!matchGender) {
        alert("Please select the gender you're seeking.");
        return false;
      }

      if (!userKinks) {
        alert("Please select the tags you're interested in.");
        return false;
      }

      if (!avatar) {
        $('#settings').hide();
        $('#avatar').show();
        return false;
      }
      
      showSpinner();

      // Tell the server to find the user a partner
      socket.emit('find partner', {
        'user': {
          'gender': gender
        },
        'partner': {
          'gender': matchGender
        },
        'kinks': userKinks,
        'avatar': avatar,
        'country': country
      });
  });
  
  $('#findLove').on('click', function(e) {
    var index  = $('.flipster__item--current').index();
    var avatar = $('#userAvatar').val(index);
    
    var gender        = $('#userGender').val();
    var userKinks     = $('#userKinks').val();
    var matchGender   = $('#partnerGender').val();
    var avatar        = $('#userAvatar').val();

    if (gender === '') {
      alert('Please select your gender.');
      return false;
    }

    if (!matchGender) {
      alert("Please select the gender you're seeking.");
      return false;
    }

    if (!userKinks) {
      alert("Please select the tags you're interested in.");
      return false;
    }
    
    $("#userAvatarImg").html('<img src="/assets/img/characters/avatar-0'+$('#userAvatar').val()+'.jpg">');
    
    showSpinner();
    
    // Tell the server to find the user a partner
    socket.emit('find partner', {
      'user': {
        'gender': gender
      },
      'partner': {
        'gender': matchGender
      },
      'kinks': userKinks,
      'avatar': avatar,
      'country': country
    });
  });

  /**
   * Handles the submission of the user's preferences
   * and informs the server to find a partner.
   */
  $('#userSettings').submit(function(e) {
    e.preventDefault();

    if (partner) {
      if (!confirm('Are you sure you want to find a new partner?')) return false;

      newMessage('You have disconnected from your partner!');
    }

    var gender        = $('#userGender').val();
    var userKinks     = $('#userKinks').val();
    var matchGender   = $('#partnerGender').val();
    var avatar        = $('#userAvatar').val();

    if (gender === '') {
      alert('Please select your gender.');
      return false;
    }

    if (!matchGender) {
      alert("Please select the gender you're seeking.");
      return false;
    }

    if (!userKinks) {
      alert("Please select the tags you're interested in.");
      return false;
    }
    
    if (!avatar) {
      $('#settings').hide();
      $('#avatar').show();
      return false;
    }

    // Tell the server to find the user a partner
    socket.emit('find partner', {
      'user': {
        'gender': gender
      },
      'partner': {
        'gender': matchGender
      },
      'kinks': userKinks,
      'avatar': avatar,
      'country': country
    });
  });

  /**
   * Handles if user is typing in the message box to send 'partner is typing' status.
   */
  messageBox.addEventListener("input", function(e) {
    if (partner == true) {
      clearTimeout(typingTimer);

      typingTimer = setTimeout(stoppedTyping, 2000);

      socket.emit('typing', true);
    }
  });

  function stoppedTyping() {
    socket.emit('typing', false);
  }

  /**
   * Handles the submission of a message using the chatbox
   * and informs the server to send a message to the partner.
   */
  $('#messageBox').submit(function(e) {
    e.preventDefault();

    var message = $('#message').val();

    if (message === '') {
      alert('Please enter a message.');
      return false;
    }

    if (message.length > 2000) {
      alert('Are you trying to send a novel? Calm down and shorten your message.');
      return false;
    }

    if (partner === false) {
      $('#message').val('');

      alert('You are not connected to a partner yet.');
      return false;
    }

    socket.emit('send message', message);

    newMessage(message, 'user');

    $('#message').val('');

    stoppedTyping();
  });

  $('#savePref').on('click', function(e) {
    var gender       = $('#userGender').val();
    var userKinks    = $('#userKinks').val();
    var matchGender  = $('#partnerGender').val();

    localStorage['gender'] = gender;
    localStorage['partnerGender'] = matchGender;
    localStorage['kinks'] = userKinks;

    alert('Preferences have been saved.');
  });

  /**
   * Displays partner is typing status.
   * @param Boolean data True/False if the partner is typing or has stopped.
   */
  socket.on('partner typing', function(data) {
    if (data.status) {
      $('#typing').show();
      autoScroll();
    } else {
      $('#typing').hide();
    }
  });

  /**
   * Updates the users online count.
   * @param  Integer count The amount of users online.
   */
  socket.on('update user count', function(count) {
    $('#userCount').text(count);
  });

  /**
   * Informs the users of invalid values being submitted.
   */
  socket.on('invalid preferences', function() {
    alert('You have attempted to submit invalid preferences. Please check your preferences again.');
    return false;
  });

  /**
   * Informs the user that they've been connected with a partner.
   * @param  Object data The partner's preferences.
   */
  socket.on('partner connected', function(data) {
    hideSpinner();
    $("#avatar").hide();
    $("#chat").show();
    
    var partnerKinks = data.kinks.split(', ');
    
    $("#userKinkTags").html('');
    $("#partnerKinks").html('');
    
    if ($('#userKinks').val() == 'any') {
      $("#userKinkTags").append('<li>Anything</li>');
    } else {
      for (var kink of $('#userKinks').val()) {
        if (kink == 'any') {
          $("#userKinkTags").append('<li>Anything</li>');
        } else {
          if (kink == 'cuddling' || kink == 'holding-hands' || kink == 'warm-smiles') {
            $("#userKinkTags").append('<li><a href="https://www.fakku.net/tags/vanilla" target="_blank">'+kinks[''+kink+'']+'</a></li>');
          } else {
            $("#userKinkTags").append('<li><a href="https://www.fakku.net/tags/'+kink+'" target="_blank">'+kinks[''+kink+'']+'</a></li>');
          }
        }
      }
    }
    
    if (partnerKinks == 'any') {
      $("#partnerKinks").append('<li>Anything</li>');
    } else {
      for (var kink of partnerKinks) {
        if (kink == 'any') {
          $("#partnerKinks").append('<li>Anything</li>');
        } else {
          if (kink == 'cuddling' || kink == 'holding-hands' || kink == 'warm-smiles') {
            $("#partnerKinks").append('<li><a href="https://www.fakku.net/tags/vanilla" target="_blank">'+kinks[''+kink+'']+'</a></li>');
          } else {
            $("#partnerKinks").append('<li><a href="https://www.fakku.net/tags/'+kink+'" target="_blank">'+kinks[''+kink+'']+'</a></li>');
          }
        }
      }
    }
    
    
    $("#userAvatarImg").html('<img src="/assets/img/characters/avatar-0'+$('#userAvatar').val()+'.jpg">');
    $("#partnerAvatarImg").html('<img src="/assets/img/characters/avatar-0'+data.avatar+'.jpg">');

    newMessage('You have been connected with a partner!');
    newMessage('Your partner is a '+data.gender+' interested in: '+data.kinks+'.');
    partner = true;
    
    alertUser("Partner Connected!");
  });

  /**
   * Informs the user that their partner has disconnected.
   */
  socket.on('partner disconnected', function() {
    newMessage('Your partner has disconnected!');
    partner = false;
    
    $('#typing').hide();    // If the partener gets disconnected while typing, the typing status should be hidden
    
    var gender      = $('#userGender').val();
    var userKinks   = $('#userKinks').val();
    var matchGender = $('#partnerGender').val();
    var avatar      = $('#userAvatar').val();
    
    showSpinner();
    
    socket.emit('find partner', {
      'user': {
        'gender': gender
      },
      'partner': {
        'gender': matchGender
      },
      'kinks': userKinks,
      'avatar': avatar,
      'country': country
    });
  });

  /**
   * Informs the user that no partner has been found that matches their preferences.
   */
  socket.on('no match', function() {
    $("#avatar").hide();
    $("#chat").show();

    newMessage('Please wait while we match you with someone...');
  });

  /**
   * Handles the recieving of a message for the user.
   * @param  String data The message contents.
   * @param  String type The type of message.
   */
  socket.on('receive message', function(data) {
    newMessage(data.message, 'partner');
    alertUser("New Message!");
  });
});

/**
 * Plays a sound and adds an alert message to browser tab.
 * 
 * @param  string message The text for the alert message.
 * @return void
 */
function alertUser(message) {
  $.titleAlert(message, {
    requireBlur:true,
    stopOnFocus:true,
    duration:10000,
    interval:500
  });

  var notification = new Audio('/assets/notification.mp3');
  notification.play();
}

/**
 * Auto scroll chat window to bottom.
 */
function autoScroll() {
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
}

/**
 * Handles the creation of a new message in the chat window.
 * @param  String message The message to be displayed.
 * @param  String type    The type of message to display.
 */
function newMessage(message, type, country = null) {
  var msg = linkify(strip_tags(message));
  
  if (country) {
    msg = msg.replace('[country]', '<img src="/assets/img/blank.png" class="flag flag-'+country+'">');
  }

  if(type === 'user') {
    $('#messages li:last').before($('<li class="message message-user">').html(msg));
  }
  else if (type === 'partner') {
    $('#messages li:last').before($('<li class="message message-partner">').html(msg));
  }
  else {
    $('#messages li:last').before($('<li class="message message-system">').html(msg));
  }

  autoScroll();
}

/**
 * Converts URLs to links.
 * @param  String text The text to parse.
 * @return String      The converted text.
 */
function linkify(text) {
  if (text) {
    text = text.replace(
      /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
      function(url){
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
            full_url = 'http://' + full_url;
        }
        return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
      }
    );
  }
  return text;
}

/**
 * Strips tags from string.
 * @param  String text The raw string.
 * @return String      The cleaned string.
 */
function strip_tags(text) {
  return text.replace(/(<([^>]+)>)/ig, "");
}

/**
 * Select default options from localStorage saved options.
 */
function loadSavedPreferences() {
  if (localStorage['gender']) {
    $('#userGender').val(localStorage['gender']);
  }
  
  if (localStorage['avatar']) {
    $('#userAvatar').val(localStorage['avatar']);
  }

  if (localStorage['partnerGender']) {
    $('#partnerGender').val(localStorage['partnerGender'].split(','));
  }

  if (localStorage['kinks']) {
    $('#userKinks').val(localStorage['kinks'].split(','));
  }
}
