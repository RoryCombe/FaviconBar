
var safariLinks = "https://apple.com/; https://parse.com; https://trello.com/; https://bitbucket.org; https://github.com/; https://sidefield.com; https://news.ycombinator.com; https://www.reddit.com/r/all; https://www.youtube.com/; https://pinboard.in/u:umfana; http://xkcd.com/; https://twitter.com; https://facebook.com; https://dropbox.com; http://getbootstrap.com/; https://mail.google.com; https://buffer.com/; http://facebook.github.io/react/; http://facebook.github.io/react-native/; http://www.munichirishrovers.de/; https://www.bitfountain.io/; http://www.pivotaltracker.com/; https://talky.io/; https://www.evernote.com/; https://c9.io/; https://delicious.com/umfana; http://ionicframework.com/docs/components/; https://www.quora.com/; https://web.whatsapp.com/; https://www.coinbase.com/; https://www.fastmail.com/mail/Inbox/?u=1c944178; http://umfana.github.io/FaviconBar/";




$(function(){

$.getJSON( "https://icons.better-idea.org/allicons.json?url=http://lifehacker.com", function( result ) {

  
  retval = result.url;
    
  var favicon = result.icons.filter(function (fv) {
	  	return fv.width > 64 &&
	  	fv.width < 129;
//	  	fv.format == "ico";
  });

  if (favicon.length == 0) {

  var favicon = result.icons.filter(function (fv) {
	  	return fv.width > 16 &&
	  	fv.width < 65;
//	  	fv.format == "ico";
  });  

  }
  
if (favicon.length == 0) {

  var favicon = result.icons.filter(function (fv) {
	  	return fv.width > 128;
//	  	fv.format == "png";
  });  

  }
  
  
  if (favicon.length == 0) {

  var favicon = result.icons.filter(function (fv) {
	  	return fv.width <= 16;
//	  	fv.format == "ico";
  });  

  }
  
  $.each(favicon, function(i, kid) {

  retval += "<p class='text-muted'>  <img class='img-thumbnail favicon'  src='" + kid.url + "'  alt=''  title=''></p>";
  	
  });

$('#settingsContainer').html(retval);
 
});

});

