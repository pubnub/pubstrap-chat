![](http://i.imgur.com/0t1m2nt.png)

## About

PubStrapChat is a jQuery plugin that lets you add chat to a website easily. It plugs right into Bootstrap so it looks great out of the box, is fully responsive, yadda yadda.

```js
$('#target').pubstrapchat();
```

## Requirements:

This plugin requires PubNub. If you use a custom key, you need to enable the **presence** feature on your account.

```html
<script src="http://cdn.pubnub.com/pubnub.min.js"></script>
```

Since it's a jQuery plugin, it also requires jQuery.

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
```

It's designed to look great with Bootstrap, but does not require the Bootstrap stylesheet.

![](http://i.imgur.com/bbcyWMF.png)

## Barebones Example

```html
<script src="http://cdn.pubnub.com/pubnub.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script src="../lib/pubstrap-chat.js"></script>
<link href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
<div id="target">
</div>
<script type="text/javascript">
$(function() {
  $('#target').pubstrapchat();
});
</script>
```

## Options

You can configure PubStrapChat with a number of options. 

```js
var options = {};
$('#target').pubstrapchat(options);
```

Parameter | Default | Description
--- | --- | ---
publish_key | 'demo' | Your PubNub publish key. 
subscribe_key | 'demo' | Your PubNub subscribe key.
channel | 'pubstrapchat' | A channel name for this chatroom. Acts as a PubNub channel.
submit_text | 'Send' | What the chat button should say.
height | '200px' | How tall the chatroom iframe should be (not including chat input)

### Options example

```js
var options = {
  publish_key: 'demo',
  subscribe_key: 'demo',
  channel: 'pubstrapchat',
  submit_text: 'Send',
  height: '200px'
};

$('#target').pubstrapchat(options);
```

## Custom User System

By default, users will get a random username like 'Purple Penguin' (color + animal). Despite how awesome these usernames may be, you probably want to configure your own user system.

You can configure PubStrapChat to use a custom user system like your own login system, facebook, twitter, etc. This way you get accurate usernames and ids for your system.

Parameter | Example | Description
--- | --- | ---
data_from_session | ```callback(user_data)``` | A function that identifies the current user. Passes a callback as the only parameter. The callback must be called with the user's session data: ```callback(data)```. More examples below.
id_from_data | ```return user_data.id;``` | A function to extract a user's id from the data returned by data_from_session
username_from_data | ```return user_data.username``` | A function to extract a user's username from the data returned by data_from_session

### Custom user system examples

Here's an example that uses http://randomuser.me to generate user profiles. View the full example at ```/examples/randomuserme.html```.

The http://api.randomuser.me AJAX request returns a JSON object like the following:

```js
{
  "results":[
    {
      "user":{
        "gender":"male",
        "email":"alfredo.jacobs25@example.com",
        "username":"bigmeercat617",
        ...
      },
      "seed":"ea85b02619b6bb4"
    }
  ]
}
```

We pass that into the callback for ```data_from_session``` and our user is populated.

```js
$('#target').pubstrapchat({
  channel: 'pubstrapchat-randomuserme',
  data_from_session: function(callback) {
    $.ajax({
      url: "http://api.randomuser.me/",
      cache: false
    })
    .done(function(data) {
  
      // we pass the first result to the callback
      callback(data.results[0]);
  
    });
  },
  id_from_data: function(data) {
    // extract the "seed" (id) from the data returned by data_from_session
    return data.seed;
  },
  username_from_data: function(data) {
    // do the same for username
    return data.user.username;
  }
});
```

Here's another one that uses the Facebook api. View the full example at ```/examples/facebook.html```.

```js
$('#target').pubstrapchat({
  channel: 'pubstrapchat-facebook',
  data_from_session: function(callback) {

    FB.api('/me', function(data) {
      callback(data)
    });

  },
  id_from_data: function(data) {
    return data.id;
  },
  username_from_data: function(data) {
    return data.name;
  }
});
```

# Running the examples locally

Clone and run:

```
python -m SimpleHTTPServer
```

Load http://localhost:8000/examples/bare.html and http://localhost:8000/examples/facebook.html

