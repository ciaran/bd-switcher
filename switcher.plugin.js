//META{"name":"switcher"}*//
var switcher = function () {}

switcher.prototype.getAuthor = function(){
	return "Ciarán Walsh";
}
switcher.prototype.getName = function(){
	return "Switcher";
};
switcher.prototype.getDescription = function(){
	return "Switcher";
};
switcher.prototype.getVersion = function(){
	return "0.0.1";
};

switcher.prototype.goToChannel = function(id){
	var link = $('.guild-channels .channel-text a[href="' + id + '"]')[0];
	if(link)
		link.click();
};

switcher.prototype.currentGuildChannelList = function(){
	return $('.guild-channels .channel-text a').toArray().map(function(link){
		var channelId = link.pathname;
		return { title: $(link).text(), id: channelId };
	});
};

switcher.prototype.showSwitcher = function(){
	var channels = this.currentGuildChannelList();

	new SwitcherDialog(channels, this);
}

switcher.prototype.load = function(){
	this.addStyles();

	document.addEventListener('keydown', function(event){
		var modifier = (process.platform == "darwin" ? event.metaKey : event.ctrlKey);
		if (modifier && event.keyCode == 75) {
			this.showSwitcher();
			event.preventDefault();
		}
	}.bind(this));
};

switcher.prototype.addStyles = function(){
	var html = ' \
		<style> \
		#switcher-filter { width: 100%; } \
		#switcher-list-container span:before { content: "#"; } \
		#switcher-list-container span { padding: 5px 5px; margin: 5px 0; border-radius: 5px; xcolor: black; display: block; } \
		#switcher-list-container span.selected { background-color: rgba(0, 0, 255, 0.12); } \
		</style> \
	';
	$("head").append(html);
};

var Keys = {
	ENTER: 13,
	ESCAPE: 27,
	UP: 38,
	DOWN: 40,
};

var CHANNEL_FILTER_LIST_QUERY = "#switcher-list-container span";

var SwitcherDialog = function(channels, switcher) {
	this.alertIdentifier = "switcher";
	this.channels = channels;
	this.switcher = switcher;
	this.dialog = this.createDialog();
	this.filterField = $("#switcher-filter");

	this.filterField.focus();

	this.filterField.on('input', function(e){
		this.updateFilter();
	}.bind(this));

	this.filterField.on('keydown', function(e){
		if (e.keyCode == Keys.ENTER) {
			this.confirm();
			return e.preventDefault();
		} else if (e.keyCode == Keys.ESCAPE) {
			this.dismiss();
			return e.preventDefault();
		} else if (e.keyCode == Keys.DOWN) {
			this.moveSelection(1);
			return e.preventDefault();
		} else if (e.keyCode == Keys.UP) {
			this.moveSelection(-1);
			return e.preventDefault();
		}
	}.bind(this));

	this.updateFilter();
}

SwitcherDialog.prototype.setSelectionIndex = function(index){
	this.selectionIndex = index;
	$(CHANNEL_FILTER_LIST_QUERY + ".selected").removeClass('selected');
	$(CHANNEL_FILTER_LIST_QUERY + ":nth-child("+(this.selectionIndex+1)+")").addClass('selected');
};

SwitcherDialog.prototype.moveSelection = function(change){
	var displayedChannelCount = $(CHANNEL_FILTER_LIST_QUERY).length;
	var index = this.selectionIndex + change;
	if (index == displayedChannelCount)
		index = 0;
	else if (index == -1)
		index = displayedChannelCount-1;
	this.setSelectionIndex(index);
};

SwitcherDialog.prototype.confirm = function(){
	var selection = $(CHANNEL_FILTER_LIST_QUERY + ".selected");
	this.switcher.goToChannel(selection.attr('data-channel-id'));
	this.dismiss();
};

SwitcherDialog.prototype.updateFilter = function(){
	var query = this.filterField.val();
	var list = this.channels;
	if (query != '') {
		list = list.filter(function(channel){
			return channel.title.includes(query);
		});
	}
	this.showChannels(list);
};

SwitcherDialog.prototype.showChannels = function(channels){
	var switcher = this.switcher;

	$("#switcher-list-container").empty();
	$(channels).each(function(){
		var link = $('<span />', { text: this.title, "data-channel-id": this.id });
		link.on('click', function(){
			var channelId = $(this).attr('data-channel-id');
			switcher.goToChannel(channelId);
		})
		$("#switcher-list-container").append(link);
	});

	this.setSelectionIndex(0);
};

SwitcherDialog.prototype.dismiss = function(){
	Utils.prototype.removeBackdrop(this.alertIdentifier);
	$("#bda-alert-" + this.alertIdentifier).remove();
};

SwitcherDialog.prototype.createDialog = function(){
	var title = "Switcher";
	var html = '\
	<div id="bda-alert-'+this.alertIdentifier+'" class="modal bda-alert" style="opacity:1" data-bdalert="'+this.alertIdentifier+'">\
	    <div class="modal-inner" style="box-shadow:0 0 8px -2px #000;">\
	        <div class="markdown-modal">\
	            <div class="markdown-modal-header">\
	                <strong style="float:left"><span>Channel Switcher</span></strong>\
	                <span></span>\
	                <button class="markdown-modal-close" onclick=\'document.getElementById("bda-alert-'+this.alertIdentifier+'").remove(); utils.removeBackdrop("'+this.alertIdentifier+'");\'></button>\
	            </div>\
	            <div class="scroller-wrap fade">\
	                <div style="font-weight:700; padding-top: 0" class="scroller"> \
	                    <input type="text" id="switcher-filter" /> \
		                <div id="switcher-list-container"></div> \
	                </div>\
	            </div>\
	            <div class="markdown-modal-footer">\
	                <span style="float:right"> for support.</span>\
	                <a style="float:right" href="https://discord.gg/0Tmfo5ZbOR9NxvDd" target="_blank">#support</a>\
	                <span style="float:right">Join </span>\
	            </div>\
	        </div>\
	    </div>\
	</div>\
	';
	$("body").append(html);
	Utils.prototype.addBackdrop(this.alertIdentifier);
};
