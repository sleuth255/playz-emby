// Author: Kevin Wilcox
// Modifed: 07/20/2016
// The Paradigm Grid
// --------------------------------------------

var prefs = new Prefs();

function Prefs() {
	this.settingsSubmit;
	this.userViewsItemSettings;
	this.navigation;
	this.doViewItem_1_0_click;	
	this.doViewItem_1_1_click;	
	this.doViewItem_1_2_click;	
	this.doViewItem_1_3_click;	
	this.settings = "emby.settings.prefs";
	this.backSkip = 30;
	this.fwdSkip = 60;
	this.showSubTitles = false;
	this.videoBitrate = 10000000;
	this.audioBitrate = 128000;
	this.resumeTicks = 0;
	this.durationTicks = 0;
};


Prefs.prototype.load = function() {
	var prefs = new Array;
	if (storage.exists(this.settings)) 
	{
		prefs = (storage.get(this.settings));
		this.backSkip = prefs[0];
		this.fwdSkip = prefs[1];
		this.showSubTitles = prefs[2];
		this.videoBitrate = prefs[3];
		this.audioBitrate = prefs[4];
	} 
};

Prefs.prototype.save = function(){
	var self = this;
	var prefs = new Array;
	
	prefs.push(this.backSkip,this.fwdSkip, this.showSubTitles, this.videoBitrate, this.audioBitrate);
	storage.set(self.settings,prefs);
};

Prefs.prototype.reset = function(){
	storage.remove(this.settings);
	this.backSkip = 30;
	this.fwdSkip = 60;
	this.showSubTitles = false;
	this.videoBitrate = 10000000;
	this.audioBitrate = 128000;
}

Prefs.prototype.clientSettingsClose = function(){
	dom.off("body","keydown", this.navigation);
	dom.off(".settings-submit", "click", this.settingsSubmit);
	dom.off(".user-views-item-settings", "click", this.userViewsItemSettings)
	dom.off("#viewItem_1_0", "click", this.doViewItem_1_0_click);
	dom.off("#viewItem_1_1", "click", this.doViewItem_1_1_click);
	dom.off("#viewItem_1_2", "click", this.doViewItem_1_2_click);
	dom.off("#viewItem_1_3", "click", this.doViewItem_1_3_click);
	dom.remove("#screenplaySettings")
}
Prefs.prototype.clientSettings = function(){
	var self = this;

	this.backdrops = new Array();
	this.total = 0;
	this.count = 0;

	dom.hide("#server");
	dom.hide("#user");
	dom.show("#homeLink");

	this.navigation = dom.on("body","keydown",navigation)

	dom.html("#view", {
		nodeName: "div",
		className: "home-view",
		id: "home2",
		childNodes: [{
			nodeName: "div",
			className: "user-views-column",
			id: "userViews_0"
		}]
	});

	
	var limit = 5;
	var rowCount = 4;
	var columnCount = 1;		
	var currentColumn = 0;
	var currentRow = 0;
	var column = 0;
	var row = 0;
	var currentHighlight = "";
	var settingsItemfocus = false;
	var homeFocus = false;
	dom.append("#userViews", {
		nodeName: "div",
		className: "user-views-column",
		id: "userViews_" + currentColumn
	});
		
	dom.append("#userViews_" + currentColumn, {
		nodeName: "a",
		href: "#",
		className: "user-views-item-settings",
		id: "viewItem_" + currentColumn + "_" + row,
		childNodes: [{
			nodeName: "span",
			className: "user-views-item-name",	
			text: "Settings"				
		}]
	});		

	dom.remove("#screenplaySettings");
	dom.append("body", {
		nodeName: "div",
		className: "key-form-settings",
		id: "screenplaySettings"
		});
		
	    var body = document.getElementById("screenplaySettings");
	    var tbl  = document.createElement('table');
	    tbl.style.borderSpacing = '10px';
	    var caption = tbl.createCaption();
	    var tr, td;
	    caption.style.fontSize = '40px';
	    caption.style.textAlign = 'left';
	    caption.innerHTML = "<b>Playback Settings</b>";
	    tr = tbl.insertRow(-1);
	    td = tr.insertCell(-1);
	    td.appendChild(document.createTextNode('Forward Skip:'));
	    td = tr.insertCell(-1);
	    td.innerHTML = '<input style="font-size:30px; color: #fff; text-align:right; padding:0px 10px 0px 0px" id ="viewItem_1_0" class="settings-forward-skip" size="2" type="text" name="fwdskip" value="'+ self.fwdSkip + '"/>';
	    td = tr.insertCell(-1);
	    td.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
	    tr = tbl.insertRow(-1);
	    td = tr.insertCell(-1);
	    td.appendChild(document.createTextNode('Back Skip:'));
	    td = tr.insertCell(-1);
	    td.innerHTML = '<input style="font-size:30px; color: #fff; text-align:right; padding:0px 10px 0px 0px" id ="viewItem_1_1" class="settings-back-skip" size="2" type="text" name="backskip" value="'+ self.backSkip + '"/>';
	    td = tr.insertCell(-1);
	    td.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
	    body.appendChild(tbl);
	    
	    tbl  = document.createElement('table');
	    tr = tbl.insertRow(-1);
	    td = tr.insertCell(-1);
	    td.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
	    body.appendChild(tbl);

	    
	    tbl  = document.createElement('table');
	    caption = tbl.createCaption();
	    caption.style.fontSize = '40px';
	    caption.style.textAlign = 'left';
	    caption.innerHTML = "<b>Server Settings</b>";
	    tbl.style.borderSpacing = '10px';
	    tr = tbl.insertRow(-1);
	    td = tr.insertCell(-1);
	    td.appendChild(document.createTextNode('Video BitRate:'));
	    td = tr.insertCell(-1);
	    td.innerHTML = '<input style="font-size:30px; color: #fff; text-align:right; padding:0px 10px 0px 0px" id ="viewItem_1_2" class="settings-video-bitrate" size="4" type="text" name="videorate" value="'+ self.videoBitrate + '"/>';
	    td = tr.insertCell(-1);
        td.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
	    tr = tbl.insertRow(-1);
	    td = tr.insertCell(-1);
	    td.appendChild(document.createTextNode('Audio BitRate:'));
	    td = tr.insertCell(-1);
	    td.innerHTML = '<input style="font-size:30px; color: #fff; text-align:right; padding:0px 10px 0px 0px" id ="viewItem_1_3" class="settings-audio-bitrate" size="4" type="text" name="audiorate" value="'+ self.audioBitrate + '"/>';
	    td = tr.insertCell(-1);
        td.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
	    body.appendChild(tbl);

	    tbl  = document.createElement('table');
	    tr = tbl.insertRow(-1);
	    td = tr.insertCell(-1);
	    td.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
	    body.appendChild(tbl);

	    tbl  = document.createElement('table');
	    tbl.style.borderSpacing = '0px';
	    tbl.style.padding = '25px';
	    tr = tbl.insertRow();
	    td = tr.insertCell();
	    td.innerHTML = '<button id ="viewItem_1_4" class="settings-submit">Update</button>';
	    body.appendChild(tbl);
	    
		this.settingsSubmit = dom.on(".settings-submit", "click", settingsSubmit);
		this.userViewsItemSettings = dom.on(".user-views-item-settings", "click", userViewsItemSettings)
		this.doViewItem_1_0_click = dom.on("#viewItem_1_0", "click", doViewItem_1_0_click)
		this.doViewItem_1_1_click = dom.on("#viewItem_1_1", "click", doViewItem_1_1_click)
		this.doViewItem_1_2_click = dom.on("#viewItem_1_2", "click", doViewItem_1_2_click)
		this.doViewItem_1_3_click = dom.on("#viewItem_1_3", "click", doViewItem_1_3_click)
		dom.focus("#viewItem_0_0");

	function userViewsItemSettings (event){
		dom.dispatchCustonEvent(document, "userPrefsSelected", this.dataset);
	}

	function settingsSubmit (event){
		self.fwdSkip = dom.querySelector("#viewItem_1_0").value;
		self.backSkip = dom.querySelector("#viewItem_1_1").value;
		self.videoBitrate = dom.querySelector("#viewItem_1_2").value;
		self.audioBitrate = dom.querySelector("#viewItem_1_3").value;
		playerpopup.show({
			duration: 1000,
			text: "Settings changed"
		});	
		self.save();
		dom.querySelector("#viewItem_1_4").focus();
		currentColumn = 1;
		currentRow = 4;
	}
	function doViewItem_1_0_click (event){
		currentColumn = 1
		currentRow = 0
		highlight("#viewItem_1_0")
		settingsItemfocus = true;
	}
	
	function doViewItem_1_1_click (event){
		currentColumn = 1
		currentRow = 1
		highlight("#viewItem_1_1")
		settingsItemfocus = true;
	}
	
	function doViewItem_1_2_click (event){
		currentColumn = 1
		currentRow = 2
		highlight("#viewItem_1_2")
		settingsItemfocus = true;
	}
	
	function doViewItem_1_3_click (event){
		currentColumn = 1
		currentRow = 3
		highlight("#viewItem_1_3")
		settingsItemfocus = true;
	}
	
	function navigation(event) {

			switch (event.which) {
			    case keys.KEY_OK:
			    	focusHandler();
			    	return;
				case keys.KEY_LEFT: 
					currentRow = 0;
					if (currentColumn ==  0)
						currentColumn = columnCount;
					else
						currentColumn--;
					break;
				case keys.KEY_UP: 
				    if (currentRow < 1)
				    {	
					    homeFocus = true;
					    currentRow = -1
				    }
				    else
					    currentRow--;
				    break;
				case keys.KEY_RIGHT:
					currentRow = 0;
					if (currentColumn ==  columnCount)
						currentColumn = 0;
					else
						currentColumn++;
					break;
				case keys.KEY_DOWN: 
					if (currentColumn > 0)
						if (currentRow == rowCount)
						    currentRow = 0;
					    else
						    currentRow++;
					else
						currentRow = 0;
					break;		
				default:
					return;
			}
		    highlight("#viewItem_"+currentColumn+"_"+currentRow)
	}
	function highlight(query){
		settingsItemfocus = false;
		for(var col = 0;col <= columnCount; col++)
			for (var row = 0; row <= rowCount; row++)
				if (dom.hasClass("#viewItem_"+ col + "_" +row, "viewItem_highlight"))
					dom.removeClass("#viewItem_"+ col + "_" +row, "viewItem_highlight");

		if (homeFocus)
		{	
			dom.querySelector(".home-link").focus()
			homeFocus = false;
			return;
	    }

		if (query == "#viewItem_0_0")
			dom.querySelector("#viewItem_0_0").focus();
		else
			dom.querySelector("#viewItem_0_0").blur();

		if (query == "#viewItem_1_4")
			dom.querySelector("#viewItem_1_4").focus();
		else
			dom.querySelector("#viewItem_1_4").blur();
		
		dom.addClass(query,"viewItem_highlight");
		currentHighlight = query;
	}

	function focusHandler(){

		if (currentHighlight == "#viewItem_1_4" || currentHighlight == "#viewItem_0_0")
		{
			dom.querySelector(currentHighlight).click();
			return;
		}
		if (!settingsItemfocus)
		{
			settingsItemfocus = true;
			dom.querySelector(currentHighlight).select();
			dom.querySelector(currentHighlight).focus();
		}
		else
		{
			settingsItemfocus = false;
			dom.querySelector(currentHighlight).blur();
		}
		
	}
	
};

