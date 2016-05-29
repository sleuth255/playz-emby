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
				id: "video"
			    },{
					nodeName: "div",
					id: "video-controls",
					className: "video-controls",
					childNodes: [{
					    nodeName: "button",
					    className: "play",
					    id: "play-pause",
					    text: "Pause"
				    }, {
						nodeName: "button",
						className: "stop",
						id: "stop-exit",
						text: "Stop"
				    }, {
						nodeName: "button",
						className: "info-button",
						id: "info-button",
						text: "0:00/0:00"
				    }, {
					    nodeName: "input",
					    "type": "range",
					    className: "seek-bar",
					    id: "seek-bar",
					    "value": "0",
				    }]
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
		var playerRegion = document.getElementById("player");		
		var playButton = document.getElementById("play-pause");
		var stopButton = document.getElementById("stop-exit");
		var infoButton = document.getElementById("info-button");
		var seekBar = document.getElementById("seek-bar");

		
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
					

			}
			// Update the slider value
			var value = (100 / video.duration) * video.currentTime;
			seekBar.value = value;
			console.log("ReportPlaybackProgress - " + time + " : " + ticks);
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
		
		// Event listener for the play/pause button
		playButton.addEventListener("click", function() {
			if (video.paused == true) {
				// Play the video
				video.play();

				// Update the button text to 'Pause'
				playButton.innerHTML = "Pause";
			} else {
				// Pause the video
				video.pause();

				// Update the button text to 'Play '
				playButton.innerHTML = "Play";
			}
		});

		// Event listener for the stop button
		stopButton.addEventListener("click", function() {
			self.close();
		});

		// Event listener for the seek bar
		seekBar.addEventListener("change", function() {
			// Calculate the new time
			var time = video.duration * (seekBar.value / 100);

			// Update the video time
			video.currentTime = time;
		});

	
		// Pause the video when the seek handle is being dragged
		seekBar.addEventListener("mousedown", function() {
			video.pause();
			playButton.innerHTML = "Play";
		});

		// Play the video when the seek handle is dropped
		seekBar.addEventListener("mouseup", function() {
			video.play();
			playButton.innerHTML = "Pause";
		});

		video.addEventListener("mousemove",function(){
			self.showControls({duration: 6000});
		});
		
		video.addEventListener("timeupdate", function() {

			// update the time/duration and slider values
			var durmin = video.duration / 60;
			var durhr = (durmin - (durmin % 60)) / 60;
			durmin = durmin % 60;
			
			var curmin = video.currentTime / 60;
			var curhr = (curmin - (curmin % 60)) / 60;
			curmin = curmin % 60;

			durmin = durmin.toFixed(0);
			durhr = durhr.toFixed(0);
			curmin = curmin.toFixed(0);
			curhr = curhr.toFixed(0);
			if (durmin.length < 2)
				durmin = "0" + durmin;
			if (curmin.length < 2)
				curmin = "0" + curmin;
			var tmpstr = curhr+":"+curmin+"/"+durhr+ ":"+durmin;
			infoButton.innerHTML = tmpstr;

			var value = (100 / video.duration) * video.currentTime;
			seekBar.value = value;
		});

		video.load();
		video.play();			
	}
};

Player.prototype.close = function() {
	time = Math.floor(event.target.currentTime);	
	var ticks = time * 10000000;

	emby.postSessionPlayingStopped({
		data: {
			ItemId: item.Id,
			MediaSourceId: item.Id,
			QueueableMediaTypes: "video",
			CanSeek: true,
			PositionTicks: ticks,
			PlayMethod: "DirectStream"
		}
	});
	dom.remove("#player");	
	dom.remove("#video-controls");
};
Player.prototype.skip = function() {
	var video = document.getElementById("video");
	video.currentTime += 60;
};

Player.prototype.backskip = function() {
	var video = document.getElementById("video");
	video.currentTime -= 30;
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
	
	playerpopup.show({
		duration: 1000,
		text: "Fast Forward " + video.playbackRate + "x"
	});	

};
Player.prototype.rewind = function() {
	var video = document.getElementById("video");
	if (video.playbackRate > 0)
		video.playbackRate = 0;
	video.playbackRate -= .5;
	playerpopup.show({
		duration: 1000,
		text: "Rewind " + video.playbackRate* -1 + "x"
	});	
};
Player.prototype.showControls = function(settings){
	var duration = settings.duration || 3000;
	var persist = settings.persist || false;

	window.clearTimeout(this.interval);
	dom.show("#video-controls");
	if (!persist)
    	this.interval = window.setTimeout(function() {
		   dom.hide("#video-controls");
	    }, duration);

};
Player.prototype.hideControls = function(){
	dom.hide("#video-controls");
};
