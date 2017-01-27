var barData = false;

$(document).ready(function() {
	barData = renderLinks();
	renderBars();
});

renderBars = function() {
	for (var i=0;i<safari.extension.bars.length;++i) {
		initBar($("#linksTable",safari.extension.bars[i].contentWindow.document));
		if (i==0) {
			saveLinks($("#linksTable",safari.extension.bars[0].contentWindow.document));
		}
	}
}

initBar = function(bar) {
	$(bar).html(barData).removeClass("small normal large center").addClass(safari.extension.settings.iconSize+" "+safari.extension.settings.centerBar);
}

restyleBars = function() {
	for (var i=0;i<safari.extension.bars.length;++i) {
		$("#linksTable",safari.extension.bars[i].contentWindow.document).removeClass("small normal large center").addClass(safari.extension.settings.iconSize+" "+safari.extension.settings.centerBar);
	}
}

renderLinks = function(){
	var links = localStorage.getItem('links');
	if (links) {
		console.log("Links loaded from Local Storage");
		links = JSON.parse(links);	
	} else {
		console.log("Links loaded from Safari settings");
	    links = safari.extension.settings.links.split(";").map(function(l){
	    	if (l && l.length > 0){
	    		return {
	    			"title": getNameFromLink(l.trim()),
	    			"link": l.trim(),
	    			"icon": getFavicon(l.trim()),
	    			"label": false,
	    			"type": "icon",
	    			"children": null
        		}
	    	}	
    	});
	}

	var results = "";
	links.map(function(l){
			results += renderLinkHtml(l);
	});
	return results;
}

renderLinkHtml = function(l){
	//Additional logic for spacers, labels and children will go here.
	return 	"<img data-title=\""+l.title+"\" data-url=\""+l.link+"\" src=\""+l.icon+"\" onerror=\"this.src='http://www.google.com/s2/favicons?domain_url=" + l.link + "';\" >";
}

saveLinks = function(barObject) {
	var links = [];

	$("img",barObject).each(function(i,val){
		links.push( {
	    	"title": $(val).data("title"),
	    	"link": $(val).data("url"),
	    	"icon": $(val).attr("src"),
	    	"label": false,
	    	"type": "icon",
	    	"children": null
		});
	});
	
	localStorage.setItem('links', JSON.stringify(links));
}

getNameFromLink = function(cURL){
	var array=cURL.split("/")[2].split(".");
	if ((array.length == 2) || (array[array.length-2].length > 3)) {
		var sld=array[array.length-2];
	} else if (array[array.length-3].length > 3) {
		var sld=array[array.length-3];
	} else if (array[0] == "www") {
		var sld=array[1];
	} else {
		var sld=array[array.length-3];
	}
	return sld.charAt(0).toUpperCase()+sld.slice(1);
}

settingsChanged = function(event){
	console.log("Settings changed. Details: " + JSON.stringify(event));
	if ((event.key == "iconSize") || (event.key == "centerBar")) {
		restyleBars();
	}
	else if(event.key == "settingsCheckbox") {
		launchSettings();
	}
}

launchSettings = function() {
		// safari.extension.settings.settingsCheckbox = false;
		console.log("Go to settings page");
		safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + "settings.html";
}

addNewLink = function(l){
	if(l){
	    link = {
	    	"title": getNameFromLink(l.trim()),
	    	"link": l.trim(),
	    	"icon": getFavicon(l.trim()),
	    	"label": false,
	    	"type": "icon",
	    	"children": null
	    };
    	    
		barData += renderLinkHtml(link);
		renderBars();
	}
}

onBarDragenter = function(event) {
	event.preventDefault();
	return true;
}

onBarDragover = function(event) {
	if (!event.dataTransfer) {
		return false;
	}
	event.dataTransfer.dropEffect = "copy";
	event.preventDefault();
	return true;
}

onBarDrop = function(event) {
	if(!event.dataTransfer){
		return false;
	}
	var link = event.dataTransfer.getData("Text");
	addNewLink(link);
	return true;
}

clickHandler = function(event,dd) {
	if (event.target.nodeName == "IMG") {
		if ((event.button == 2) || ((event.ctrlKey) && (event.button == 0))) {
			createMenu(event,dd);
		} else if ((event.button == 1) || ((event.metaKey) && (event.button == 0))) {
			launch($(event.target).data("url"),"tab");
		} else if ((event.button == 0) && (event.altKey)) {
			launch($(event.target).data("url"),"win");
		} else if (event.button == 0) {
			launch($(event.target).data("url"));
		}
	}
	event.preventDefault();
}

createMenu = function(event, dd) {

	var items = new Array();

	items[0] = { text: $(event.target).data("title"), value: 0, default: "default" };
	items[1] = { text: $(event.target).data("url"), value: 1, disabled: "disabled" };
	items[2] = { text: "──────────────────", value: 97, disabled: "disabled" };
	items[3] = { text: "Open in New Tab", value: 2 };
	items[4] = { text: "Open in New Window", value: 3 };
	items[5] = { text: "──────────────────", value: 98, disabled: "disabled" };
	items[6] = { text: "Edit Title", value: 4 };
	items[7] = { text: "Edit Link", value: 5 };
	items[8] = { text: "Change Icon", value: 6 };
	items[9] = { text: "Remove Link", value: 7 };

	$(dd).empty();

	$.each(items,function(i,item){
		
		$(dd).append($("<option>",{
			value: item.value,
			text: item.text,
			disabled: item.disabled,
			default: item.default
		}));
		
	});	
	

	$(dd).unbind("change").change(function() {

		switch(this.value) {
			case "0":
				break;
			case "2": 
				launch($(event.target).data("url"),'tab');
				break;
			case "3":
				launch($(event.target).data("url"),'win');
				break;
			case "4":
				newtitle = prompt("Title for this link:\n",$(event.target).data("title"));
				if (newtitle) { $(event.target).data("title", newtitle);
				barData = $(event.target).parent("#linksTable").html();
				renderBars();
				}
				break;
			case "5":
				newtitle = prompt("Address for this link:\n",$(event.target).data("url"));
				if (newtitle) { $(event.target).data("url", newtitle);
				barData = $(event.target).parent("#linksTable").html();
				renderBars();
				}
				break;
			case "6":
				break;
			case "7":
				var par = $(event.target).parent("#linksTable");
				$(event.target).remove();
				barData = $(par).html();
				renderBars();
				break;
		}
	});
		
			dd.style.left = event.pageX + "px";
			evt = document.createEvent('MouseEvents');
    		evt.initMouseEvent('mousedown', true, true, window);
    		dd.dispatchEvent(evt);
	
}

launch = function(link,type) {
	switch(type) {
		case "tab":
			safari.application.activeBrowserWindow.openTab().url = link;
			break;
		case "win":
			safari.application.openBrowserWindow().activeTab.url = link;
			break;
		default:
			var tmptab = safari.application.activeBrowserWindow.activeTab;
			tmptab.url = link;
			safari.application.activeBrowserWindow.openTab().close();
			tmptab.activate();
			break;
		}
}

getFavicon = function(link) {

	result = $.ajax({
		method: "GET",
		dataType: "json",
		url: "https://icons.better-idea.org/allicons.json?url="+link, 
		async: false
	}).responseJSON;
	
	favicon = result.icons.filter(function (fv) {
	  	return fv.width > 64 &&
	  	fv.width < 129;
  	});

  	if (favicon.length == 0) {
  		favicon = result.icons.filter(function (fv) {
	  		return fv.width > 16 &&
	  		fv.width < 65;
  		});  
  	}
  
	if (favicon.length == 0) {
		favicon = result.icons.filter(function (fv) {
	  		return fv.width > 128;
  		});  
  	}
  
  	if (favicon.length == 0) {
  		favicon = result.icons.filter(function (fv) {
	  		return fv.width <= 16;
  		});  
  	}
  
	if (favicon.length > 0) {
		return favicon[0].url;
	} else {
		return null;
	} 
}

safari.extension.settings.addEventListener("change", settingsChanged, false);