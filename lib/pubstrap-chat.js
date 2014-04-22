(function ($) {

  $.fn.pubstrapchat = function(options) {

    var pubnub = null;

    var data_from_session = function(callback) {

      var animals = ['pigeon', 'sea gull', 'bat', 'owl', 'sparrows', 'robin', 'bluebird', 'cardinal', 'hawk', 'fish', 'shrimp', 'frog', 'whale', 'shark', 'eel', 'seal', 'lobster', 'octopus', 'mole', 'shrew', 'rabbit', 'chipmunk', 'armadillo', 'dog', 'cat', 'lynx', 'mouse', 'lion', 'moose', 'horse', 'deer', 'raccoon', 'zebra', 'goat', 'cow', 'pig', 'tiger', 'wolf', 'pony', 'antelope', 'buffalo', 'camel', 'donkey', 'elk', 'fox', 'monkey', 'gazelle', 'impala', 'jaguar', 'leopard', 'lemur', 'yak', 'elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'grizzly bear']

      var colors = ['silver', 'gray', 'black', 'red', 'maroon', 'olive', 'lime', 'green', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];

      var animal = animals[Math.floor(Math.random() * animals.length)];
      var color = colors[Math.floor(Math.random() * colors.length)];

      var user = {
        username: color + ' ' + animal,
        id: PUBNUB.uuid()
      };

      return callback(user);

    };

    var id_from_data = function(data) {
      return data.id;
    };

    var username_from_data = function(data) {
      return data.username;
    };

    var Chat = function($target, options) {

      var defaults = {
        publish_key: 'demo',
        subscribe_key: 'demo',
        channel: 'pubstrapchat',
        submit_text: 'Send',
        height: '200px',
        data_from_session: data_from_session,
        id_from_data: id_from_data,
        username_from_data: username_from_data
      };

      if(typeof options == 'object') {
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
          self.$tpl = $('<li class="list-group-item message auto list-group-item-success"><span class="text">' + options.username_from_data(data) + ' has come online.</span></li>');
        }

        if(type == "leave") {
          self.$tpl = $('<li class="list-group-item message auto list-group-item-danger"><span class="text">' + options.username_from_data(data) + ' has gone offline.</span></li>');
        }

        if(type == "message") {

          self.$tpl = $('<li class="list-group-item message"><strong class="username">' + options.username_from_data(data) + ':</strong><span class="text"></span></li>');

          self.$tpl.find('.username').eq(0).css({
            'margin-right': '5px'
          });

          self.$tpl.find('.text').text(message).html(); // escape html

        }

        $chat.append(self.$tpl).animate({"scrollTop": $chat[0].scrollHeight});

      };

      var User = function(id) {

        var self = this;

        self.data = null;

        self.id = id;

        self.init = function() {

          pubnub.state({
            channel: options.channel,
            uuid: self.id,
            callback: function(data){

              self.data = data;
              users[id] = self;

              self.join();
            },
            error: console_error
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

        // start pubnub, set my id to uuid
        pubnub = PUBNUB.init({
          publish_key: options.publish_key,
          subscribe_key: options.subscribe_key,
          uuid: options.id_from_data(me)
        });

        pubnub.state({
          channel: options.channel,
          state: me,
          callback: function(data){

            // create a user object for myself
            users[options.id_from_data(me)] = new User(options.id_from_data(me));

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

              },
              error: console_error
            });

          },
          error: console_error
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
                uuid: options.id_from_data(me)
              },
              error: console_error
            });

            $text.val('');

          }

          return false;

        });

      };

      options.data_from_session(init);

    };

    var a_chatroom = new Chat(this, options);
    return this;

  };

}(jQuery));
