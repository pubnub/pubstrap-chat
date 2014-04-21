Bootstrap Chat Plugin
----------

![http://imgur.com/t28hhtl]()

## About

PubStrapChat is a jQuery plugin that lets you add chat to a website easily. 

```
$('#target').pubstrapchat();
```

## Requirements:

This plugin requires PubNub.

```
<script src="http://cdn.pubnub.com/pubnub.min.js"></script>
```

Since it's a jQuery plugin, it also requires jQuery.

```
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
```

It's designed to look great with Bootstrap, but does not require the Bootstrap stylesheet.

## Barebones Example

```
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






Clone and run:
```
python -m SimpleHTTPServer
```

Load http://localhost:8000/examples/bare.html and http://localhost:8000/examples/facebook.html

