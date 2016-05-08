// Author: Simon J. Hogan
// Modifed: 24/04/2016
// Sith'ari Consulting Australia
// --------------------------------------------

function Player() {

};

Player.prototype.load = function(data, settings) {
	settings = settings || {};
	var self = this;
	var item = data;
	var time = 0;
	
	if (item.VideoType && item.VideoType == "VideoFile") {				
		dom.append("body", {
			nodeName: "div",
			className: "player",
			id: "player",
			childNodes: [{
				nodeName: "video",
				className: "video",
				id: "video",
				controls: "controls"		
			}]
		});	

		dom.append("#video", {
			nodeName: "source",
			src: emby.getVideoStreamUrl({
				itemId: item.Id,					
				extension: item.MediaSources[0].Container
			}),
			"type": mime.lookup(item.MediaSources[0].Container)
		});
	
		dom.append("#video", {
			nodeName: "source",
			src: emby.getVideoHlsStreamUrl({
				itemId: item.Id
			}),
			"type": mime.lookup("m3u8")
		});	

			
		var video = document.getElementById("video");		
		
		video.onplay = function() {
			time = Math.floor(event.target.currentTime);	
			var ticks = time * 10000000;

			emby.postSessionPlayingStarted({
				data: {
					ItemId: item.Id,
					MediaSourceId: item.Id,
					QueueableMediaTypes: "video",
					CanSeek: true,
					PositionTicks: ticks,
					PlayMethod: "DirectStream"
				}
			});
							
			console.log("Play Started - " + time + " : " + ticks);
		};
		
		video.ontimeupdate = function(event) {
			if (Math.floor(event.target.currentTime) > time + 4) {
				time = Math.floor(event.target.currentTime);	
				var ticks = time * 10000000;
					
				emby.postSessionPlayingProgress({
					data: {
						ItemId: item.Id,
						MediaSourceId: item.Id,
						QueueableMediaTypes: "video",
						CanSeek: true,
						PositionTicks: ticks,
						PlayMethod: "DirectStream"
					}
				});
					
				console.log("ReportPlaybackProgress - " + time + " : " + ticks);
			}
		};

		video.onpause = function() {
			time = Math.floor(event.target.currentTime);	
			var ticks = time * 10000000;

			emby.postSessionPlayingProgress({
				data: {
					ItemId: item.Id,
					MediaSourceId: item.Id,
					QueueableMediaTypes: "video",
					CanSeek: true,
					PositionTicks: ticks,
					PlayMethod: "DirectStream",
					IsPaused: true
				}
			});
							
			console.log("Play Paused - " + time + " : " + ticks);
		};
		
		video.load();
		video.play();			
	}
};

Player.prototype.close = function() {
	dom.remove("#player");	
};
Player.prototype.skip = function() {
	var video = document.getElementById("video");
	video.currentTime += 60;
};

Player.prototype.play = function() {
	var video = document.getElementById("video");
	video.play();
	if (video.playbackRate != 1)
	    video.playbackRate = 1;
};
Player.prototype.pause = function() {
	var video = document.getElementById("video");
	video.pause();
};
Player.prototype.fastforward = function() {
	var video = document.getElementById("video");
	video.playbackRate += .5;
	
	message.show({
		messageType: message.notice,			
		duration: 1000,
		text: "Fast Forward " + video.playbackRate + "x"
	});	

};
Player.prototype.rewind = function() {
	var video = document.getElementById("video");
	if (video.playbackRate > 0)
		video.playbackRate = 0;
	video.playbackRate -= .5;
	message.show({
		messageType: message.notice,
		duration: 1000,
		text: "Rewind " + video.playbackRate* -1 + "x"
	});	
};
