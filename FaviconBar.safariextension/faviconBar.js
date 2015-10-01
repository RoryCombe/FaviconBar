var FaviconBar = {};

FaviconBar.renderLinks = function(links){
	var row = document.getElementById("linksTableRow");
	row.innerHTML = "";
	links.map(function(l){
		if(l && l.length > 0){
			row.innerHTML += FaviconBar.renderLinkHtml(l.trim());
		}
	});
}

FaviconBar.applyCentering = function(centerBar){
	var row = document.getElementById("linksTable");
	if(centerBar){
		row.classList.add("centerBar");
	}
	else{
		row.classList.remove("centerBar");
	}
}

FaviconBar.renderLinkHtml = function(link){
	return "<td class=\"iconLink\">" +
		"<a href=\"" + link + "\">" +
			"<img src=\"" + link + "/favicon.ico\" onerror=\"this.src='http://www.google.com/s2/favicons?domain_url=" + link + "';\" width=\"18\" height=\"17\" alt=\"\" title=\"\" url_piece=\"/\" >" +
		"</a>" +
	"</td>";
}

FaviconBar.onLoad = function(){
	// alert("onLoad fired");
	var links = safari.extension.settings.links.split(";");
	var centerBar = safari.extension.settings.centerBar;
	FaviconBar.applyCentering(centerBar);
	FaviconBar.renderLinks(links);
}

FaviconBar.settingsChanged = function(event){
	console.log("Settings changed. Details: " + JSON.stringify(event));
	if(event.key == "links") {
		FaviconBar.onLoad();
	}
	else if(event.key == "centerBar") {
		FaviconBar.applyCentering(event.newValue);
	}
	else if(event.key == "settingsCheckbox") {
		// safari.extension.settings.settingsCheckbox = false;
		console.log("Go to settings page");
		safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + "settings.html";
	}
}

FaviconBar.linkIsNotDupe = function(link){
	// check for duplicates here
	return safari.extension.settings.links.indexOf(link) === -1;
}

FaviconBar.addNewLink = function(link){
	if(link && FaviconBar.linkIsNotDupe(link)){
		safari.extension.settings.links += ";" + link;
	}
}

FaviconBar.onBarDragenter = function(elem, event) {
	event.preventDefault();
	return true;
}

FaviconBar.onBarDragover = function(elem, event) {
	if (!event.dataTransfer) {
		return false;
	}
	event.dataTransfer.dropEffect = "copy";
	event.preventDefault();
	return true;
}

FaviconBar.onBarDrop = function(elem, event) {
	if(!event.dataTransfer){
		return false;
	}
	var link = event.dataTransfer.getData("Text");
	FaviconBar.addNewLink(link);
	return true;
}

safari.extension.settings.addEventListener("change", FaviconBar.settingsChanged, false);