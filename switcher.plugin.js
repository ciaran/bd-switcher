//META{"name":"switcher"}*//
var switcher = function () {}

switcher.prototype.getAuthor = function(){
	return "Ciarán Walsh";
}
switcher.prototype.getName = function(){
	return "Switcher";
};
switcher.prototype.getDescription = function(){
	return "Use Control/Command+K to show quick channel switcher dialog.";
};
switcher.prototype.getVersion = function(){
	return "0.2";
};

switcher.prototype.goToChannel = function(id){
	var link = $('.channel a[href="' + id + '"]')[0];
	if(link)
		link.click();
};

switcher.prototype.currentGuildChannelList = function(){
	return $('.guild-channels .channel-text a, .private-channels .private a').toArray().map(function(link){
		var type = $(link.parentNode).hasClass("private") ? "private" : "channel"
		var name = $(link).text();

		var activity = $(link).find(".channel-activity").text();
		if (activity.length > 0)
			name = name.slice(0, -activity.length);

		return {
			title: name,
			id: link.pathname,
			type: type,
		};
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
		#switcher-header { margin: 0 auto; padding-bottom: 0; } \
		#switcher-filter { width: 100%; font-weight: bold; height: 40px; font-size: 30px; padding: 4px; box-sizing: border-box; border: 0; } \
		#switcher-list-container span.channel:before { content: "#"; } \
		#switcher-list-container span { padding: 5px 5px; margin: 5px 0; border-radius: 5px; display: block; } \
		#switcher-list-container span.badge { font-size: 1em; line-height: 1em; font-weight: normal; } \
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
var SELECTED_CLASS = "badge";

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
	$(CHANNEL_FILTER_LIST_QUERY + "." + SELECTED_CLASS).removeClass(SELECTED_CLASS);
	$(CHANNEL_FILTER_LIST_QUERY + ":nth-child("+(this.selectionIndex+1)+")").addClass(SELECTED_CLASS);
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
	var selection = $(CHANNEL_FILTER_LIST_QUERY + "." + SELECTED_CLASS);
	this.switcher.goToChannel(selection.attr('data-channel-id'));
	this.dismiss();
};

SwitcherDialog.prototype.updateFilter = function(){
	var query = this.filterField.val().toLowerCase();
	var list = this.channels;
	if (query != '') {
		list = list.filter(function(channel){
			return channel.title.toLowerCase().includes(query);
		});
	}
	this.showChannels(list);
};

SwitcherDialog.prototype.showChannels = function(channels){
	var switcher = this.switcher;

	$("#switcher-list-container").empty();
	$(channels).each(function(){
		var link = $('<span />', { text: this.title, "data-channel-id": this.id, class: this.type });
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
	            <div class="markdown-modal-header" id="switcher-header">\
	                <input type="text" id="switcher-filter" /> \
	            </div>\
	            <div class="scroller-wrap fade">\
	                <div style="font-weight:700; padding-top: 0" class="scroller"> \
		                <div id="switcher-list-container"></div> \
	                </div>\
	            </div>\
	            <div class="markdown-modal-footer">\
	                <span style="float: right"> \
		                Use <code>↑↓</code> to move, <code>↩</code> to select \
	                </span> \
	            </div>\
	        </div>\
	    </div>\
	</div>\
	';
	$("body").append(html);
	Utils.prototype.addBackdrop(this.alertIdentifier);
};
