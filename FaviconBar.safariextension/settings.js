
var safariLinks = "https://apple.com/; https://parse.com; https://trello.com/; https://bitbucket.org; https://github.com/; https://sidefield.com; https://news.ycombinator.com; https://www.reddit.com/r/all; https://www.youtube.com/; https://pinboard.in/u:umfana; http://xkcd.com/; https://twitter.com; https://facebook.com; https://dropbox.com; http://getbootstrap.com/; https://mail.google.com; https://buffer.com/; http://facebook.github.io/react/; http://facebook.github.io/react-native/; http://www.munichirishrovers.de/; https://www.bitfountain.io/; http://www.pivotaltracker.com/; https://talky.io/; https://www.evernote.com/; https://c9.io/; https://delicious.com/umfana; http://ionicframework.com/docs/components/; https://www.quora.com/; https://web.whatsapp.com/; https://www.coinbase.com/; https://www.fastmail.com/mail/Inbox/?u=1c944178; http://umfana.github.io/FaviconBar/";

var FaviconLink = React.createClass({
	render: function() {
		var url = this.props.url;
		return (<p className="text-muted">
			<img
				className="img-thumbnail favicon" 
				src={url + "/favicon.ico"}
				onerror={"this.src='http://www.google.com/s2/favicons?domain_url=" + url + "';"}
				alt=""
				title=""
				url_piece="/"/>
			{url}
			<a href="#" className="editLink">Edit</a>
		</p>);
	}
});

var FaviconSettings = React.createClass({
	render: function() {
		var links = safariLinks.split(";"); // safari.extension.settings.links.split(";");
		var linksHtml = links.map(function(l){
			return (<FaviconLink url={l.trim()} />)
		});

		return (<div>{linksHtml}</div>);
	}
});

var FaviconSettingsFactory = React.createFactory(FaviconSettings);

React.render(FaviconSettingsFactory(), document.getElementById("settingsContainer"));