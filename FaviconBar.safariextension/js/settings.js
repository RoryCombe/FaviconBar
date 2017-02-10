
var settings = {};

messageHandler = function(msg) {
	if(msg.name == 'returnSetting') {
	settings[msg.message.name] = msg.message.value;
	updateSettings();
	} else if (msg.name == 'returnLinks') {
		var results = "";
		var links = msg.message;
		settings.links = JSON.parse(links);	
		settings.links.map(function(l){
			results += renderLinkHtml(l);
		});
		$('#linksContainer').html(results);
		finishBinds();
		targetIcon = window.location.href.slice(window.location.href.indexOf("?")+1);
		if (targetIcon) {
			$("p[data-icon='"+targetIcon+"']>img").click();
		}
	} else if (msg.name == 'returnLinkObject') {

	    $('#linksContainer').append(renderLinkHtml(msg.message));	
	    saveLinks();	
		safari.self.tab.dispatchMessage('getLinks', true);
		alert("Link added to the end of the list");

	}
}


updateSettings = function() {
	if (settings.centerBar) {	if (settings.centerBar == "center") { $("#centerBar").prop('checked',true); } else { $("#centerBar").prop('checked',false); }}
	if (settings.iconSize) {	$("p.iconrow img").removeClass("small normal large 0").addClass(settings.iconSize);$("#iconSize").val(settings.iconSize);}
	if (settings.roundIcons) {	$("p.iconrow img").removeClass("round 0").addClass(settings.roundIcons);if (settings.roundIcons == "round") { $("#roundIcons").prop('checked',true); } else { $("#roundIcons").prop('checked',false); }}
	if (settings.blendMode) {	if (settings.blendMode == "blend") { $("#blendMode").prop('checked',true); } else { $("#blendMode").prop('checked',false); }}
	if (settings.filterdropshadow) {	if (settings.filterdropshadow == "true") { $("#filterdropshadow").prop('checked',true); } else { $("#filterdropshadow").prop('checked',false); }}
	if (settings.filtergrayscale) {	if (settings.filtergrayscale == "true") { $("#filtergrayscale").prop('checked',true); } else { $("#filtergrayscale").prop('checked',false); }}
	if (settings.filterlighten) {	if (settings.filterlighten == "true") { $("#filterlighten").prop('checked',true); } else { $("#filterlighten").prop('checked',false); }}
	if (settings.filtercustomCSS) {	if (settings.filtercustomCSS) { $("#filtercustomCSS").val(settings.filtercustomCSS); } else { $("#filterlighten").val(""); }}
	if (settings.settingsIcon) {	if (settings.settingsIcon == "fullwidth") { $("#settingsIcon").prop('checked',true); } else { $("#settingsIcon").prop('checked',false); }}
}

saveSettings = function() {
	safari.self.tab.dispatchMessage('setSetting',{name: "centerBar", value: settings.centerBar});
	safari.self.tab.dispatchMessage('setSetting',{name: "iconSize", value: settings.iconSize});
	safari.self.tab.dispatchMessage('setSetting',{name: "roundIcons", value: settings.roundIcons});
	safari.self.tab.dispatchMessage('setSetting',{name: "blendMode", value: settings.blendMode});
	safari.self.tab.dispatchMessage('setSetting',{name: "filterdropshadow", value: settings.filterdropshadow});
	safari.self.tab.dispatchMessage('setSetting',{name: "filtergrayscale", value: settings.filtergrayscale});
	safari.self.tab.dispatchMessage('setSetting',{name: "filterlighten", value: settings.filterlighten});
	safari.self.tab.dispatchMessage('setSetting',{name: "filtercustomCSS", value: settings.filtercustomCSS});
	safari.self.tab.dispatchMessage('setSetting',{name: "settingsIcon", value: settings.settingsIcon});
}


renderLinkHtml = function(l){
	//Additional logic for separators, labels and children will go here.
	if (l) {
	if (l.type == "icon") {
		if (l.label) { var checked = "checked" } else { var checked = "" }
		return 	"<p class='iconrow' data-title=\""+l.title+"\" data-url=\""+l.link+"\" data-icon=\""+l.icon+"\" data-label=\""+l.label+"\"><img title='Click to choose image' class=\""+settings.iconSize+" "+settings.roundIcons+"\" src=\""+l.icon+"\" /><span title='Click to edit' class='icontitle'>"+l.title+"</span><span title='Click to edit' class='iconlink'>"+l.link+"</span><span title='Click to delete' class='icondelete'>&#9587;</span><label class='iconlabel'><input type='checkbox' "+checked+"> Show text label</label></p>";
	} else if (l.type == "separator") {
		return 	"<hr />";
	}
	} else {
	return "";
	}
}

iconLookup = function(link) {
	var retval = "";
	
	result = $.ajax({
		method: "GET",
		dataType: "json",
		url: "https://icons.better-idea.org/allicons.json?url="+link, 
		async: false
	}).responseJSON;
	
	$.each(result.icons, function(i, itm) {
		retval += "<img class='favicon "+settings.iconSize+" "+settings.roundIcons+"'  src='" + itm.url + "'>";
	});
	
	retval += "<img class='favicon "+settings.iconSize+" "+settings.roundIcons+"' src='http://www.google.com/s2/favicons?domain_url=" + link + "'>";

	return retval; 
}

saveLinks = function() {
	var links = [];

	$("#linksContainer").children().each(function(i,val){
	if ($(val).prop("tagName") == "P") {
		links.push( {
	    	"title": $(val).data("title"),
	    	"link": $(val).data("url"),
	    	"icon": $(val).data("icon"),
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
	safari.self.tab.dispatchMessage('updateBars',links);
	
}

finishBinds = function() {
	$(".icontitle").bind("click", function() {
		$(this).attr("contentEditable", true);
		$(this).addClass("editable");
		$(this).trigger("focus");
	}).blur(function() {
		$(this).parent().data("title",this.textContent);
		$(this).attr("contentEditable", false);
		$(this).removeClass("editable");
		saveLinks();
	});
	
	$(".iconlink").bind("click", function() {
		$(this).attr("contentEditable", true);
		$(this).addClass("editable");
		$(this).trigger("focus");
	}).blur(function() {
		$(this).parent().data("url",this.textContent);
		$(this).attr("contentEditable", false);
		$(this).removeClass("editable");
		saveLinks();
	});
	
	$(".icondelete").bind("click", function() {
	if (confirm("Delete this link?")) {
		$(this).parent().remove();
		saveLinks();
	}	
	});
	
	$("#linksContainer hr").bind("click",function(event) {
		if (($(window).width()-event.pageX) < 60) {
				if (confirm("Delete this separator?")) {
					$(this).remove();
					saveLinks();
				}	
			}
	});
	
	$("[type=checkbox]",".iconrow").change(function () {
		if (this.checked) {
			$(this).parent().parent().data("label",true);
		} else {
			$(this).parent().parent().data("label",false);
		}
		saveLinks();
	});

		
	$(".iconrow > img").bind("click", function() {
		$("#iconContainer").html("<div class='loader'>Loading...</div>");
		$("#iconURL").val($(this).parent().data("icon")).change();
		$("#lnktitle").text($(this).parent().data("title"));
		$("#btnsave").data("referrer",$(this).parent());
		$("#popOver").show();
		var link = $(this).parent().data("url");
		setTimeout(function() {
			var returnhtml = iconLookup(link);
			$("#iconContainer").html(returnhtml);
		}, 10);
	});
}


$(document).ready(function(){

	safari.self.addEventListener('message', messageHandler, false);
	safari.self.tab.dispatchMessage('getSetting', 'centerBar');
	safari.self.tab.dispatchMessage('getSetting', 'iconSize');
	safari.self.tab.dispatchMessage('getSetting', 'settingsIcon');
	safari.self.tab.dispatchMessage('getSetting', 'roundIcons');
	safari.self.tab.dispatchMessage('getSetting', 'blendMode');
	safari.self.tab.dispatchMessage('getSetting', 'filterdropshadow');
	safari.self.tab.dispatchMessage('getSetting', 'filtergrayscale');
	safari.self.tab.dispatchMessage('getSetting', 'filterlighten');
	safari.self.tab.dispatchMessage('getSetting', 'filtercustomCSS');
	safari.self.tab.dispatchMessage('getLinks', true);

	$("[type=checkbox]",".settingrow").change(function () {
		if (this.checked) { 
			if ((this.value) != "on") {
				val = this.value;
			} else {
				val = "true";
			}
		} else {
			val = "0";
		}
		var setting = {
			name: this.id,
			value: val
		}
		safari.self.tab.dispatchMessage('setSetting',setting);
	});

	$("#filtercustomCSS").blur(function () {
		val = $(this).val();
		var setting = {
			name: this.id,
			value: val
		}
		safari.self.tab.dispatchMessage('setSetting',setting);
	});

	$("#iconSize").change(function () {
		var setting = {
			name: "iconSize",
			value: $(this).val()
		}
		safari.self.tab.dispatchMessage('setSetting',setting);
	});
	
	$("#iconURL").bind("change", function() {
		$(this).css("backgroundImage","url("+$(this).val()+")");
	});
	
	$("#iconContainer").on("click", "img", function(){
		$("#iconURL").val($(this).attr("src")).change();
	});

	$("#dlsettings").bind("click", function() {
		var data = JSON.stringify(settings);
		var a = document.getElementById("settingsdl");
		var file = new Blob([data], {type: 'text/plain'});
		a.href = URL.createObjectURL(file);
		a.download = "faviconbar.backup";
		a.click();
	});
	
	$("#ulsettings").bind("change", function(event) {
		if (event.target.files.length > 0) {
		if (confirm("This will replace all settings and links in your bar\ncontinue?")) {
	    	reader = new FileReader();
		    reader.onload = function() {
	        	var newvars = JSON.parse(this.result);
				settings = newvars;
				updateSettings();
				var msg = {
					name: 'returnLinks',
					message: JSON.stringify(newvars.links)
				}
				messageHandler(msg);
				saveLinks();
				saveSettings();
	    	};
		    reader.readAsText(event.target.files[0]);	
	    }
	    }
	});
	
	$("#btnsave").bind("click", function() {
		$($("#btnsave").data("referrer")).data("icon",$("#iconURL").val());
		$("img",$("#btnsave").data("referrer")).attr("src",$("#iconURL").val());
		$("#popOver").hide();
		saveLinks();
	});

	$("#btncancel").bind("click", function() {
			$("#popOver").hide();
	});

	$("#popOver").bind("dragenter dragover drop", function(event) {
	    event.stopPropagation();
		event.preventDefault();
	});

	$("#iconURL").bind("dragenter dragover", function(event) {
		if (!event.originalEvent.dataTransfer) {
			return false;
		}
		event.originalEvent.dataTransfer.dropEffect = "copy";	
	    event.stopPropagation();
		event.preventDefault();
	});
	
	$("#iconURL").bind("drop", function(event) {
		if (!event.originalEvent.dataTransfer) {
			return false;
		}
	    event.stopPropagation();
		event.preventDefault();

        if(event.originalEvent.dataTransfer.files.length > 0) {
        
        file = event.originalEvent.dataTransfer.files[0];
        if (file.size > 102400) {
        	alert("This icon is too large.\n\nPlease limit icon file size to less than 100KB");
        } else {
            var fileReader = new FileReader();
                fileReader.onload = (function(file) {
                   return function(event) { 
                     $("#iconURL").val(event.target.result).change(); 
                   }; 
                })(file);
            fileReader.readAsDataURL(file);
		}
		}

	});
	
	$("#addlink").bind("click",function() {
	
		var l = prompt("Address for this link:\n");
		if (l) {
		safari.self.tab.dispatchMessage('getLinkObject',l);
		}
	});

});

