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
	filter = buildFilter();
	$(bar).html(barData).removeClass("small normal large center fullwidth round 0").addClass(safari.extension.settings.iconSize+" "+safari.extension.settings.centerBar+" "+safari.extension.settings.settingsIcon+" "+safari.extension.settings.roundIcons);
	$("img",bar).attr("style",filter);

	if (safari.extension.settings.settingsIcon == "fullwidth") {
			$("#settings",$(bar).parent()).hide();
	} else {
			$("#settings",$(bar).parent()).show();		
	}	
}

restyleBars = function() {
	filter = buildFilter();
	for (var i=0;i<safari.extension.bars.length;++i) {
		$("#linkBar",safari.extension.bars[i].contentWindow.document).removeClass("small normal large center fullwidth round 0").addClass(safari.extension.settings.iconSize+" "+safari.extension.settings.centerBar+" "+safari.extension.settings.settingsIcon+" "+safari.extension.settings.roundIcons);
		$("#linkBar > img",safari.extension.bars[i].contentWindow.document).attr("style",filter);
		
		if (safari.extension.settings.settingsIcon == "fullwidth") {
			$("#settings",safari.extension.bars[i].contentWindow.document).hide();
		} else {
			$("#settings",safari.extension.bars[i].contentWindow.document).show();		
		}
	}
}

buildFilter = function() {
	var filter = "filter: ";
	if (safari.extension.settings.filtergrayscale == "true") { filter+="grayscale(100%) "; }
	if (safari.extension.settings.filterdropshadow == "true") { filter+="drop-shadow(1px 1px 1px gray) "; }
	if (safari.extension.settings.filterlighten == "true") { filter+="contrast(50%) brightness(150%) "; }
	filter+=";"
	if (safari.extension.settings.filtercustomCSS) {
		filter+=safari.extension.settings.filtercustomCSS;
	}
	return filter;
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
    } else if (msg.name == 'updateBars') {
    	localStorage.setItem('links', JSON.stringify(msg.message));
    	barData = renderLinks();
    	renderBars();
    } else if (msg.name == 'getLinks') {
    	safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('returnLinks',localStorage.getItem('links'));
    }
}

renderLinks = function(){
	var links = localStorage.getItem('links');
	if (links) {
		links = JSON.parse(links);	
	} else {
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
	var retval = "";
	if (l) {
		if (l.type == "icon") {
			retval = "<img data-title=\""+l.title+"\" data-url=\""+l.link+"\" data-label=\""+l.label+"\" data-icon=\""+l.icon+"\" src=\""+l.icon+"\" onerror=\"this.src='http://www.google.com/s2/favicons?domain_url=" + l.link + "';\" >";
			if (l.label) {
				retval += "<label class='iconlabel'>"+l.title+"</label>";
			}
		} else if (l.type == "separator") {
			retval = "<hr>";
		}
	}
	return retval;
}

saveLinks = function(barObject) {
	var links = [];

	$(barObject).children().each(function(i,val){
	if ($(val).prop("tagName") == "IMG") {
		links.push( {
	    	"title": $(val).data("title"),
	    	"link": $(val).data("url"),
	    	"icon": $(val).attr("src"),
	    	"label": $(val).data("label"),
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
	if(event.key == "settingsCheckbox") {
		launchSettings();
	} else {
		restyleBars();
		var setting = {
			name: event.key,
			value: event.newValue
		}
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('returnSetting', setting);
	}
}

launchSettings = function(qs) {
		launch(safari.extension.baseURI + "settings.html?"+qs,"tab");
}

addLink = function(l,event){
	if (!l) { l = safari.application.activeBrowserWindow.activeTab.url; }
	if(l){
	    link = {
	    	"title": getNameFromLink(l.trim()),
	    	"link": l.trim(),
	    	"icon": getFavicon(l.trim()),
	    	"label": false,
	    	"type": "icon",
	    	"children": null
	    };
	    if (event.target.nodeName == "IMG") {
    	    $(renderLinkHtml(link)).insertBefore(event.target);
    	    barData = $(event.target).parent().html();
    	    } else {
			barData += renderLinkHtml(link);
		}
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
		return false;
	}
	
	$(event.target).removeClass("drag");
	
	if (event.dataTransfer.getData("Text") == "dragItem") { 
		if (event.target == $("#dragItem",event.target.parentNode)[0]) {
			return false;
		} else {
			moveLink(event);
		}
	
	} else { 
		var link = event.dataTransfer.getData("Text");
		addLink(link,event);
	
	}


	return true;
}

onBarMousedown = function(event) {
	if((event.target.nodeName == "IMG") || (event.target.nodeName == "LABEL") || (event.target.nodeName == "SPAN")) {
		$(event.target).addClass("hover");
	}
	return true;
}

onBarMouseup = function(event) {
	if((event.target.nodeName == "IMG") || (event.target.nodeName == "LABEL") || (event.target.nodeName == "SPAN")) {
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
	} else if (event.target.nodeName == "LABEL") {
		if ((event.button == 2) || ((event.ctrlKey) && (event.button == 0))) {
			createMenu(event);
		} else if ((event.button == 1) || ((event.metaKey) && (event.button == 0))) {
			launch($(event.target).prev().data("url"),"tab");
		} else if ((event.button == 0) && (event.altKey)) {
			launch($(event.target).prev().data("url"),"win");
		} else if (event.button == 0) {
			launch($(event.target).prev().data("url"));
		}
	}
	event.preventDefault();
}

createMenu = function(event) {

	var dd = $("#dropdown",event.target.parentNode.parentNode)[0];
	var items = new Array();
	var target = event.target;
	$(target).removeClass("hover");

	if (event.target.nodeName == "LABEL") {
		target = $(event.target).prev()[0];
	}	
	$(target).removeClass("hover");

	if (target.nodeName == "IMG") {

	items[0] = { text: $(target).data("title"), value: 0, default: "default" };
	items[1] = { text: $(target).data("url"), value: 1, disabled: "disabled" };
	items[2] = { text: "──────────────────", value: 9, disabled: "disabled" };
	items[3] = { text: "Open in New Tab", value: 2 };
	items[4] = { text: "Open in New Window", value: 3 };
	items[5] = { text: "──────────────────", value: 10, disabled: "disabled" };
	items[6] = { text: "Add Separator After", value: 8 };
	items[7] = { text: "Rename…", value: 4 };
	items[8] = { text: "Edit Address…", value: 5 };
	items[9] = { text: "Change Icon…", value: 6 };
	items[10] = { text: "Delete", value: 7 };
	
	} else if (target.nodeName == "HR") {
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
				launch($(target).data("url"),'tab');
				break;
			case "3":
				launch($(target).data("url"),'win');
				break;
			case "4":
				newtitle = prompt("Title for this link:\n",$(target).data("title"));
				if (newtitle) { $(target).data("title", newtitle);
				barData = $(target).parent("#linkBar").html();
				renderBars();
				}
				break;
			case "5":
				newtitle = prompt("Address for this link:\n",$(target).data("url"));
				if (newtitle) { $(target).data("url", newtitle);
				barData = $(target).parent("#linkBar").html();
				renderBars();
				}
				break;
			case "6":
					launchSettings($(target).data("icon"));
				break;
			case "7":
				if (confirm("Delete this link?")) {
					var par = $(target).parent("#linkBar");
					$(target).remove();
					barData = $(par).html();
					renderBars();
				}
				break;
			case "8":
				addSeparator($(target));
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