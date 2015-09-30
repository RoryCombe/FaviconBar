safari.extension.settings.addEventListener("change", settingsChanged, false);

function onLoad(){
	var links = safari.extension.settings.links.split(";");
	var centerBar = safari.extension.settings.centerBar;

	var row = document.getElementById("linksTable");
	if(centerBar){
		row.classList.add("centerBar");
	}
	else{
		row.classList.remove("centerBar");
	}
	
	renderLinks(links);
}

function renderLinks(links){
	var row = document.getElementById("linksTableRow");
	row.innerHTML = "";
	links.map(function(l){
		if(l && l.length > 0){
			row.innerHTML += renderLinkHtml(l.trim());
		}
	});
}

function renderLinkHtml(link){
	return "<td class=\"iconLink\" onmouseover=\"onLinkMouseover(this, event)\" onmouseleave=\"onLinkMouseleave(this, event)\">" +
		"<a href=\"" + link + "\">" +
			"<img src=\"" + link + "/favicon.ico\" onerror=\"this.src='http://www.google.com/s2/favicons?domain_url=" + link + "';\" width=\"18\" height=\"17\" alt=\"\" title=\"\" url_piece=\"/\" >" +
		"</a>" +
	"</td>";
}

function settingsChanged(){
	onLoad();
}

function swapElems(){
	childNode[4].parentNode.insertBefore(childNode[4], childNode[3]);
}

function linkIsNotDupe(link){
	// check for duplicates here
	return safari.extension.settings.links.indexOf(link) === -1;
}

function addNewLink(link){
	if(link && linkIsNotDupe(link)){
		safari.extension.settings.links += ";" + link;
	}
}

function onLinkMouseover(elem, event){
	console.log("In");
}

function onLinkMouseleave(elem, event){
	console.log("Out");
}

function onBarDragenter(elem, event) {
	event.preventDefault();
	return true;
}

function onBarDragover(elem, event) {
	if (!event.dataTransfer) {
		return false;
	}
	event.dataTransfer.dropEffect = "copy";
	event.preventDefault();
	return true;
}

function onBarDrop(elem, event) {
	if(!event.dataTransfer){
		return false;
	}
	var link = event.dataTransfer.getData("Text");
	addNewLink(link);
	return true;
}