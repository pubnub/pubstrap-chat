(function ($) {

  $.fn.pubstrapchat = function(options) {

    var id_from_session = function(callback) {

      $.ajax({
        url: "http://api.randomuser.me/",
        cache: false
      })
      .done(function(data) {
        callback(data.results[0].seed);
      });

    };

    var data_from_id = function(id, callback) {

      $.ajax({
        url: "http://api.randomuser.me/",
        data: {
          seed: id
        }
      })
      .done(function(data) {
        callback(data.results[0]);
      });

    };

    var id_from_data = function(data) {
      return data.seed;
    };

    var username_from_data = function(data) {
      return data.user.username;
    };

    var Chat = function($target, options) {

      var defaults = {
        publish_key: 'demo',
        subscribe_key: 'demo',
        channel: 'channel',
        submit_text: 'Send',
        height: '200px',
        id_from_session: id_from_session,
        data_from_id: data_from_id,
        id_from_data: id_from_data,
        username_from_data: username_from_data
      }

      if (typeof options == 'object') {
        options = $.extend(defaults, options);
      } else {
        options = defaults;
      }

      var console_error = function(message) {
        if(typeof console !== "undefined" && typeof console.error !== "undefined") {
          console.error('PubStrapChat: ' + message);
        }
      };

      var $tpl = $('\
        <div class="panel panel-default"> \
          <ul class="list-group chat"></ul> \
        </div> \
        <form> \
          <div class="input-group"> \
            <input type="text" class="form-control"/><span class="input-group-btn"> \
            <button type="submit" class="btn btn-default">' + options.submit_text +'</button></span> \
          </div> \
        </form>');

      var me = null;
      var users = {};

      var $chat = $tpl.find('.chat').eq(0);
      var $users = $tpl.find('.users').eq(0);

      $chat.css({
        'height': options.height,
        'overflow-y': 'scroll'
      });

      var Message = function(type, data, message) {

        var self = this;

        self.$tpl = '';

        if(type == "join") {
          self.$tpl = $('<li class="list-group-item message auto list-group-item-success"><span class="text">' + username_from_data(data) + ' has come online.</span></li>');
        }

        if(type == "leave") {
          self.$tpl = $('<li class="list-group-item message auto list-group-item-danger"><span class="text">' + username_from_data(data) + ' has gone offline.</span></li>');
        }

        if(type == "message") {

          self.$tpl = $('<li class="list-group-item message"><strong class="username">' + username_from_data(data) + ':</strong><span class="text">' + message + '</span></li>');

          self.$tpl.find('.username').eq(0).css({
            'margin-right': '5px'
          });

        }

        $chat.append(self.$tpl).animate({"scrollTop": $chat[0].scrollHeight});

      };

      var User = function(id) {

        var self = this;

        self.data = null;

        self.init = function() {

          data_from_id(id, function(data) {

            self.data = data;
            users[id] = self;

            self.join();

          });

        };

        self.join = function() {

          new Message('join', self.data);

        };

        self.leave = function() {

          new Message('leave', self.data);
          delete users[id];

        };

        self.chat = function(data) {

          var $message = $();
          new Message('message', self.data, data.message);

        };

        self.init();

        return self;

      };

      var init = function(me) {

        // create a user object for myself
        users[id_from_data(me)] = new User(id_from_data(me));

        // start pubnub, set my id to uuid
        var pubnub = PUBNUB.init({
          publish_key: options.publish_key,
          subscribe_key: options.subscribe_key,
          uuid: id_from_data(me)
        });

        // subscribe to lobby
        pubnub.subscribe({
          channel: options.channel,
          presence: function(data){

            // get notified when people join
            if(data.action == "join") {

              if(!users.hasOwnProperty(data.uuid)) {
                new User(data.uuid);
              }

            }

            // and when they leave
            if(data.action == "leave") {

              if(users.hasOwnProperty(data.uuid)) {
                users[data.uuid].leave();
              }

            }

          },
          message: function(data) {

            if(data.type == 'message') {
              users[data.uuid].chat(data);
            }

          }
        });

        $target.empty().append($tpl);

        $target.find('form').eq(0).submit(function() {

          var $text = $('input[type="text"]');

          if($text.val()) {

            pubnub.publish({
              channel: options.channel,
              message: {
                type: 'message',
                message: $text.val(),
                uuid: me.seed
              }
            });

            $text.val('');

          }

          return false;

        });

      };

      id_from_session(init);

    };

    var a_chatroom = new Chat(this, options);
    return this;

  };

}(jQuery));
