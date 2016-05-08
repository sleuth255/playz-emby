// Author: Simon J. Hogan
// Modifed: 24/04/2016
// Sith'ari Consulting Australia
// --------------------------------------------

function Server() {
	this.settings = "emby.settings.servers";
	this.current = "emby.settings.current.server";	
	this.servers = new Array;
};

Server.prototype.load = function() {
	if (storage.exists(this.current)) {
		this.open(storage.get(this.current));
	} else {
		this.add();
	}	
};

Server.prototype.open = function(url, add) {
	var self = this;
		
	emby.getPublicUsers({
			server: url,
			success: success,
			error: error
		}
	);
	
	function success(data)
	{	
		emby.settings.ServerUrl = url;
		storage.set(self.current, url);
				
		if (add) {
			message.show({
				messageType: message.success,			
				text: "Server located ..."
			});		
			self.servers.push({"url": url});
			storage.set(self.settings, self.servers);		
			self.close();
		}
		
		dom.dispatchCustonEvent(document, "serverOpened", data);
	}	
	
	function error(data)
	{
		message.show({
			messageType: message.error,			
			text: "Server not found! Please check the server address is correct and try again."
		});
		dom.dispatchCustonEvent(document, "serverOpenFailed", data);
	}			
};

Server.prototype.remove = function(index) {
	
};

Server.prototype.add = function() {
	var self = this;
	
	dom.append("body", {
		nodeName: "div",
		className: "settings",
		id: "serverSettings",
		childNodes: [
			{
				nodeName: "div",
				id: "keyHeader",
				className: "key-heading",
				text: "Add Server"							
			}, {
				nodeName: "div",
				id: "keyEntry",
				className: "key-column"	
			}, {
				nodeName: "div",
				id: "keyFields",
				className: "key-column key-column-fields",	
				childNodes: [{
					nodeName: "form",
					id: "keyForm",
					className: "key-form",	
					method: "get",					
					childNodes: [
						{
							nodeName: "div",
							id: "keyInstructions",
							className: "key-instructions",
							text: "Enter an Emby server url below:"
						}, {
							nodeName: "label",
							className: "key-label",
							htmlFor: "serverUrl",
							text: "URL"
						}, {
							nodeName: "input",
							className: "key-field",
							id: "serverUrl",
							"type": "text",
							"required": "required",
							"value": "10.1.0.8",
							"placeholder": "http://server.ip"
						}, {
							nodeName: "input",
							className: "key-field",
							id: "serverUrl",
							"type": "submit",
							"required": "required"
						}
					]	
				}]					
			}
		]	
	});	

	dom.on("#keyForm", "submit", enterPress, false);

	keys.load({
		url: "script/keys/en.default.json",
		success: keysLoaded,
		error: error,
		enter: enterPress,
		clear: clearPress,
		space: spacePress,
		'delete': deletePress,									
		press: keyPress,
		close: close,
		rightKeyQuery: ".key-field" 
	});
		
	function keysLoaded() {		
		keys.settings.actions.enter = "Add";
		keys.open("#keyEntry");
		keys.focus();
		dom.on("body", "keydown", lostFocus);
		dom.on(".key-field", "keydown", fieldKeyEvent);		
	}	
	
	function lostFocus(event) {
		if (event.target.tagName != "A" && event.target.tagName != "INPUT") {
			keys.focus("#" + dom.data("#" + keys.id, "lastFocus"));
		}
	}	
	
	function fieldKeyEvent(event) {
		event.stopPropagation();
		if (event.which == keys.KEY_LEFT) {
			if (caret.position(".key-field") == 0) {
				keys.focus(".key-row .key-focus");
			}	
		}
	}
	
	function error(data)
	{
		message.show({
			messageType: message.error,			
			text: data.ResponseStatus.StackTrace
		});	
		console.log(data.ResponseStatus.StackTrace);
	}	
	
	function enterPress(event)
	{
		event.preventDefault();
		event.stopPropagation();
		
		var value = dom.val("#serverUrl");
		
		if (value.length > 0) {
			if (!message.visible()) {
				message.show({
					messageType: message.notice,				
					text: "Attempting to locate server ...",
					persist: true
				});					
				self.open(self.formatServerUrl(value), true);
			}
			dom.dispatchCustonEvent(document, "serverLocate", {url: self.formatServerUrl(value)});
		} else {
			message.show({
				messageType: message.error,
				text: "You must enter a valid server url. Please try again."
			});
			dom.dispatchCustonEvent(document, "serverInputError", {error: "Invalid URL", url: value});				
		}
	}	

	function spacePress(event)
	{
		var value = dom.val("#serverUrl");
		dom.val("#serverUrl", value + " ");
	}
	
	function clearPress(event)
	{
		dom.val("#serverUrl", "");
	}
	
	function deletePress(event)
	{
		var value = dom.val("#serverUrl");
		
		if (value.length == 1) {
			dom.val("#serverUrl", "");
		} else {
			dom.val("#serverUrl", value.substring(0, value.length - 1));
		}
	}				
	
	function keyPress(key)
	{
		var value = dom.val("#serverUrl");
		dom.val("#serverUrl", value + key);
	}	
	
	function close() {		
		dom.off("body", "keydown", lostFocus);	
	}
};

Server.prototype.display = function() {
	
};

Server.prototype.close = function(index) {
	keys.close();
	dom.hide("#serverSettings");
	dom.remove("#serverSettings");
};

Server.prototype.formatServerUrl = function(url) {
	url = url.trim();
	
	if (!url.includes("http://")) {
		url = "http://" + url;
	}
	
	if (!url.substr(5).includes(":")) {
		url = url + ":8096";
	}
	
	return url;
};