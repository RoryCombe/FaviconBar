var barData = false;

$(document).ready(function() {
	safari.application.addEventListener("message", messageHandler, false);
	safari.application.addEventListener("open", openHandler, true);
	barData = renderLinks();
	renderBars();
});

renderBars = function() {
	for (var i=0;i<safari.extension.bars.length;++i) {
		if (!safari.extension.bars[i].contentWindow.barInit) {
		
				safari.extension.bars[i].contentWindow.barInit = true;	
				safari.extension.bars[i].contentWindow.document.addEventListener("dragstart",onBarDragstart);
				safari.extension.bars[i].contentWindow.document.addEventListener("dragenter",onBarDragenter);
				safari.extension.bars[i].contentWindow.document.addEventListener("dragover",onBarDragover);
				safari.extension.bars[i].contentWindow.document.addEventListener("dragleave",onBarDragleave);
				safari.extension.bars[i].contentWindow.document.addEventListener("drop",onBarDrop);
				safari.extension.bars[i].contentWindow.document.addEventListener("contextmenu",clickHandler);
				safari.extension.bars[i].contentWindow.document.addEventListener("click",clickHandler);
				safari.extension.bars[i].contentWindow.document.addEventListener("mousedown",onBarMousedown);
				safari.extension.bars[i].contentWindow.document.addEventListener("mouseup",onBarMouseup);
				$("#settings",safari.extension.bars[i].contentWindow.document).on("click",launchSettings);
				
		}
		initBar($("#linkBar",safari.extension.bars[i].contentWindow.document));
		if (i==0) {
			saveLinks($("#linkBar",safari.extension.bars[0].contentWindow.document));
		}
	}
}

openHandler = function(event) {
    if (event.target instanceof SafariBrowserWindow) {
    	//ugly hack for new window because I can't access the extension bar until after it loads faviconBar.html
    	//right now added code back into faviconBar.html to init on new window to fix tab dragging bug, so this is redundant
		//this commenting out, will remove in the future if a better solution doesn't present itself.
		//setTimeout(renderBars,500);
    }
}

initBar = function(bar) {
	$(bar).html(barData).removeClass("small normal large center fullwidth 0").addClass(safari.extension.settings.iconSize+" "+safari.extension.settings.centerBar+" "+safari.extension.settings.settingsIcon);
	if (safari.extension.settings.settingsIcon == "fullwidth") {
			$("#settings",$(bar).parent()).hide();
	} else {
			$("#settings",$(bar).parent()).show();		
	}	
}

restyleBars = function() {
	for (var i=0;i<safari.extension.bars.length;++i) {
		$("#linkBar",safari.extension.bars[i].contentWindow.document).removeClass("small normal large center fullwidth 0").addClass(safari.extension.settings.iconSize+" "+safari.extension.settings.centerBar+" "+safari.extension.settings.settingsIcon);
		if (safari.extension.settings.settingsIcon == "fullwidth") {
			$("#settings",safari.extension.bars[i].contentWindow.document).hide();
		} else {
			$("#settings",safari.extension.bars[i].contentWindow.document).show();		
		}
	}
}

messageHandler = function(msg) {

    if (msg.name === 'getSetting') {
        var setting = {
        name: msg.message,
        value: safari.extension.settings[msg.message]
        };
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('returnSetting', setting);
    } else if (msg.name == 'setSetting') {
        safari.extension.settings[msg.message.name] = msg.message.value;
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
	//Additional logic for separators, labels and children will go here.
	console.log('renderlinkHtml - got a link here we go');

if (l) {
	if (l.type == "icon") {
	console.log('renderlinkHtml - link is an icon, rendering');
		return 	"<img data-title=\""+l.title+"\" data-url=\""+l.link+"\" src=\""+l.icon+"\" onerror=\"this.src='http://www.google.com/s2/favicons?domain_url=" + l.link + "';\" >";
	} else if (l.type == "separator") {
	console.log('renderlinkHtml - link is a separator, rendering');
		return 	"<hr>";
	}
	} else {
	console.log('renderlinkHtml - link is nothing, so sad');
	return "";
	}
}

saveLinks = function(barObject) {
	var links = [];

	$(barObject).children().each(function(i,val){
	if ($(val).prop("tagName") == "IMG") {
		links.push( {
	    	"title": $(val).data("title"),
	    	"link": $(val).data("url"),
	    	"icon": $(val).attr("src"),
	    	"label": false,
	    	"type": "icon",
	    	"children": null
		});
		} else if ($(val).prop("tagName") == "HR") {
		links.push( {
	    	"title": null,
	    	"link": null,
	    	"icon": null,
	    	"label": false,
	    	"type": "separator",
	    	"children": null
		});		
		}
	});
	
	localStorage.setItem('links', JSON.stringify(links));
}

getNameFromLink = function(cURL){
	console.log('getNamefromlink - this is easy, shouldnt fail...');
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
	console.log('getNamefromlink - returning value');
	return sld.charAt(0).toUpperCase()+sld.slice(1);
}

settingsChanged = function(event){
	if ((event.key == "iconSize") || (event.key == "centerBar") || (event.key == "settingsIcon")) {
		restyleBars();
		var setting = {
			name: event.key,
			value: event.newValue
		}
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('returnSetting', setting);
	}
	else if(event.key == "settingsCheckbox") {
		launchSettings();
	}
}

launchSettings = function() {
		safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + "settings.html";
}

addLink = function(l,event){
	console.log('addLink - here we are adding a link');
	if (!l) { l = safari.application.activeBrowserWindow.activeTab.url; }
	if(l){
	console.log('addlink - link found, happiness');
	    link = {
	    	"title": getNameFromLink(l.trim()),
	    	"link": l.trim(),
	    	"icon": getFavicon(l.trim()),
	    	"label": false,
	    	"type": "icon",
	    	"children": null
	    };
	console.log(link);
	    if (event.target.nodeName == "IMG") {
	console.log('addlink - dropped on an image, rendering link');

    	    $(renderLinkHtml(link)).insertBefore(event.target);
	console.log('addlink - updating bar data');
    	    barData = $(event.target).parent().html();
    	    } else {
	console.log('addlink - link dropped on empty space, rendering link & bardata');
			barData += renderLinkHtml(link);
		}
	console.log('addlink - rendering bars');
		renderBars();
	}
}

addSeparator = function(target) {
	$("<hr>").insertAfter(target);
    barData = $(target).parent().html();
    renderBars();
}

moveLink = function(event){
	
	    if (event.target.nodeName == "IMG") {
		    $("#dragItem",event.target.parentNode).remove().insertBefore(event.target).removeAttr('id');
    	    barData = $(event.target).parent().html();
    	    } else {
    	    $("#dragItem",event.target).remove().appendTo(event.target).removeAttr('id');
    	    barData = $(event.target).html();
		}
		renderBars();
}

onBarDragstart = function(event) {
	if (event.target.nodeName == "IMG") {
		$(event.target).removeClass("hover");
		event.target.id = "dragItem";
		event.dataTransfer.setData("Text","dragItem");
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
	if (event.target.nodeName == "IMG") {
	$(event.target).addClass("drag");
	}
	event.dataTransfer.dropEffect = "move";
	event.preventDefault();
	return true;
}

onBarDragleave = function(event) {
	if (!event.dataTransfer) {
		return false;
	}
	if (event.target.nodeName == "IMG") {
	$(event.target).removeClass("drag");
	}
	return true;
}


onBarDrop = function(event) {
	if(!event.dataTransfer){
	console.log('drop - no data transfer, cancel');
		return false;
	}
	
	$(event.target).removeClass("drag");
	console.log('drop - removed drag class');
	
	if (event.dataTransfer.getData("Text") == "dragItem") { 
	console.log('drop - drag reorder detected');
		if (event.target == $("#dragItem",event.target.parentNode)[0]) {
	console.log('drop - icon dropped on itself, cancel');
			return false;
		} else {
	console.log('drop - icon dropped elsewhere, moving');
			moveLink(event);
		}
	
	} else { 
	console.log('drop - new item dropped adding link');
		var link = event.dataTransfer.getData("Text");
	console.log('drop - wait do we have text? '+link);
	console.log(event);
		addLink(link,event);
	
	}


	return true;
}

onBarMousedown = function(event) {
	if(event.target.nodeName == "IMG") {
		$(event.target).addClass("hover");
	}
	return true;
}

onBarMouseup = function(event) {
	if(event.target.nodeName == "IMG") {
		$(event.target).removeClass("hover");
	}
	return true;
}

clickHandler = function(event) {
	if ((event.target.nodeName == "IMG") || (event.target.nodeName == "HR")) {
		if ((event.button == 2) || ((event.ctrlKey) && (event.button == 0))) {
			createMenu(event);
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

createMenu = function(event) {

	var dd = $("#dropdown",event.target.parentNode.parentNode)[0];
	var items = new Array();
	
	if (event.target.nodeName == "IMG") {

	items[0] = { text: $(event.target).data("title"), value: 0, default: "default" };
	items[1] = { text: $(event.target).data("url"), value: 1, disabled: "disabled" };
	items[2] = { text: "──────────────────", value: 9, disabled: "disabled" };
	items[3] = { text: "Open in New Tab", value: 2 };
	items[4] = { text: "Open in New Window", value: 3 };
	items[5] = { text: "──────────────────", value: 10, disabled: "disabled" };
	items[6] = { text: "Add Separator After", value: 8 };
	items[7] = { text: "Rename…", value: 4 };
	items[8] = { text: "Edit Address…", value: 5 };
	items[9] = { text: "Change Icon…", value: 6 };
	items[10] = { text: "Delete", value: 7 };
	
	} else if (event.target.nodeName == "HR") {
	items[0] = { text: "Separator", value: 0, default: "default" };
	items[1] = { text: "──────────────────", value: 9, disabled: "disabled" };
	items[2] = { text: "Delete", value: 7 };
	
	}
	
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
				barData = $(event.target).parent("#linkBar").html();
				renderBars();
				}
				break;
			case "5":
				newtitle = prompt("Address for this link:\n",$(event.target).data("url"));
				if (newtitle) { $(event.target).data("url", newtitle);
				barData = $(event.target).parent("#linkBar").html();
				renderBars();
				}
				break;
			case "6":
				break;
			case "7":
				if (confirm("Delete this link?")) {
					var par = $(event.target).parent("#linkBar");
					$(event.target).remove();
					barData = $(par).html();
					renderBars();
				}
				break;
			case "8":
				addSeparator($(event.target));
				break;
		}
	});
		
			$(dd).css("left",event.pageX + "px");
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
	console.log('getting favicon - could be dicey here we go');

	result = $.ajax({
		method: "GET",
		dataType: "json",
		url: "https://icons.better-idea.org/allicons.json?url="+link, 
		async: false
	}).responseJSON;
	console.log('getting favicon - ajax request called and we have a response');
	
	favicon = result.icons.filter(function (fv) {
	  	return fv.width > 64 &&
	  	fv.width < 129;
  	});
	console.log('getting favicon - filtered for big icons');

  	if (favicon.length == 0) {
	console.log('getting favicon - no big icons, going smaller');
  		favicon = result.icons.filter(function (fv) {
	  		return fv.width > 16 &&
	  		fv.width < 65;
  		});  
  	}
  
	if (favicon.length == 0) {
	console.log('getting favicon - no small icons, going bigger');
		favicon = result.icons.filter(function (fv) {
	  		return fv.width > 128;
  		});  
  	}
  
  	if (favicon.length == 0) {
	console.log('getting favicon - no big icons, maybe tiny?');
  		favicon = result.icons.filter(function (fv) {
	  		return fv.width <= 16;
  		});  
  	}
  
	if (favicon.length > 0) {
	console.log('getting favicon - returning first icon');
		return favicon[0].url;
	} else {
	console.log('getting favicon - we didnt find any, that sucks');
		return null;
	} 
}

safari.extension.settings.addEventListener("change", settingsChanged, false);