var FaviconBar = {};

FaviconBar.onLoad = function(){
	var links = safari.extension.settings.links.split(";");
	var centerBar = safari.extension.settings.centerBar;

	var row = document.getElementById("linksTable");
	if(centerBar){
		row.classList.add("centerBar");
	}
	else{
		row.classList.remove("centerBar");
	}
	
	FaviconBar.renderLinks(links);
}

FaviconBar.renderLinks = function(links){
	var row = document.getElementById("linksTableRow");
	row.innerHTML = "";
	links.map(function(l){
		if(l && l.length > 0){
			row.innerHTML += FaviconBar.renderLinkHtml(l.trim());
		}
	});
}

FaviconBar.renderLinkHtml = function(link){
	return "<td class=\"iconLink\" onmouseover=\"onLinkMouseover(this, event)\" onmouseleave=\"onLinkMouseleave(this, event)\">" +
		"<a href=\"" + link + "\">" +
			"<img src=\"" + link + "/favicon.ico\" onerror=\"this.src='http://www.google.com/s2/favicons?domain_url=" + link + "';\" width=\"18\" height=\"17\" alt=\"\" title=\"\" url_piece=\"/\" >" +
		"</a>" +
	"</td>";
}

FaviconBar.settingsChanged = function(){
	FaviconBar.onLoad();
}

FaviconBar.swapElems = function(){
	childNode[4].parentNode.insertBefore(childNode[4], childNode[3]);
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

FaviconBar.onLinkMouseover = function(elem, event){
	console.log("In");
}

FaviconBar.onLinkMouseleave = function(elem, event){
	console.log("Out");
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