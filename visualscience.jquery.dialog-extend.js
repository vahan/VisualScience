/**
 * Extending jquery dialog to add minimize functionality
 */

(function($){
	var _init = $.ui.dialog.prototype._init;
 
	//Custom Dialog Init
	$.ui.dialog.prototype._init = function() {
		var self = this;
        _init.apply(this, arguments);
 
        //Reference to the titlebar
        var uiDialogTitlebar = this.uiDialogTitlebar;
                                                
        //we need two variables to preserve the original width and height so that can be restored.
        this.options.originalWidth = this.options.width;
        this.options.originalHeight = this.options.height;
        
        this.uiDialog.bind("resize", function(event) {
            this.options.originalWidth = this.options.width;
            this.options.originalHeight = this.options.height;
        })
        
        this.options.originalWasMaximized = -1;
        //this.options.originalTop =
        //this.options.originalLeft = 
                        
        //save a reference to the resizable handle so we can hide it when necessary.
        this.resizeableHandle =  this.uiDialog.resizable().find('.ui-resizable-se');
                        
        uiDialogTitlebar.append('<a href="#" class="dialog-minimize ui-dialog-titlebar-min ui-corner-all" title="minimize"><span class="ui-icon ui-icon-minusthick"></span></a>');
        uiDialogTitlebar.append('<a href="#" class="dialog-maximize ui-dialog-titlebar-max ui-corner-all" title="maximize"><span class="ui-icon ui-icon-extlink"></span></a>');
        uiDialogTitlebar.append('<a href="#" class="dialog-restore ui-dialog-titlebar-rest ui-corner-all" title="restore"><span class="ui-icon ui-icon-newwin"></span></a>');
        
        //Minimize Button
        this.uiDialogTitlebarMin = $('.dialog-minimize', uiDialogTitlebar).hover(function(){
        	$(this).addClass('ui-state-hover');
        }, function(){
        	$(this).removeClass('ui-state-hover');
        }).click(function(){
        	self.minimize();
        	return false;
        });

        this.uiDialogTitlebarMax = $('.dialog-maximize', uiDialogTitlebar).hover(function(){
        	$(this).addClass('ui-state-hover');
        }, function(){
        	$(this).removeClass('ui-state-hover');
        }).click(function(){
        	self.maximize();
        	return false;
        });
           
        //Restore Button
        this.uiDialogTitlebarRest = $('.dialog-restore', uiDialogTitlebar).hover(function(){
        	$(this).addClass('ui-circle-all').addClass('ui-state-hover');
        }, function(){
        	$(this).removeClass('ui-state-hover');
        }).click(function(){
        	self.restore();
        	self.moveToTop(true);
        	return false;
        }).hide();
        
        // This is neccessary, because otherwise first-time restore does not get
        // The correct coordinates
        this.uiDialog.css("position", "fixed");
	};
	$.extend($.ui.dialog.prototype, {
		restore: function() {
			if (this.options.originalWasMaximized > 0) {
				this.maximize();
				return;
			}
			//restore resizable functionality
			this.uiDialog.resizable( "option", "disabled", false );
			this.uiDialog.draggable( "option", "disabled", false );
			//show the resizeable handle
			this.resizeableHandle.show();
		 
			//We want to prevent the dialog from expanding off the screen
			var windowHeight = $(window).height();
			var dialogHeight = this.options.originalHeight;
			var dialogTop = this.options.originalTop;
			if(dialogHeight+dialogTop > windowHeight)
			{
				this.options.originalTop = windowHeight - dialogHeight - 8;
			}			
			var windowWidth = $(window).width();
			var dialogWidth = this.options.originalWidth;
			var dialogLeft = this.options.originalLeft;
			if(dialogWidth + dialogLeft > windowWidth)
			{
				this.options.originalLeft = windowWidth - dialogWidth - 8;
			}

			this.uiDialog.css({ 'top': this.options.originalTop,  marginLeft: 0, marginTop: 0, 'left': this.options.originalLeft });
			//restore the orignal dimensions
			this.uiDialog.css({width: this.options.originalWidth, height:this.options.originalHeight});
			this.uiDialog.find(".ui-dialog-content").css({width: "auto", height: this.options.originalHeight - 50});
			this.uiDialog.find(".ui-dialog-title").css("width",this.options.originalWidth - 90);				
			//show the dialog content
			this.element.show();
		 
			//swap the buttons
			this.uiDialogTitlebarRest.hide();
			this.uiDialogTitlebarMax.show();
			this.uiDialogTitlebarMin.show();
			
			// scroll down the inner conversation div (in FF does this automatically)
			skypeConversationDiv = this.uiDialog.find('.skype_conversation');
			skypeConversationDiv[0].scrollTop = skypeConversationDiv[0].scrollHeight;
			
			//Organizing minimized windows after restore
			this.uiDialog.removeClass('dialogs-minimized');			
			this.uiDialog.removeClass('dialogs-maximized');			

			width = getMinimizedWidth();
			
			// order the remaining minimized dialogs
			orderMinimized(width);
		},
		minimize: function() { 
			this.options.originalWasMaximized = this.uiDialog.attr("class").indexOf("dialogs-maximized");
			//set this window as "minimized" class
			this.uiDialog.addClass("dialogs-minimized");
			this.uiDialog.removeClass('dialogs-maximized');			

			//disable resizable
			this.uiDialog.resizable( "option", "disabled", true );
			//disable draggable
			this.uiDialog.draggable( "option", "disabled", true );
			this.resizeableHandle.hide();
		 
			//Store the original height/width
			this.options.originalWidth = this.options.width;
			this.options.originalHeight = this.options.height;
			
			var position = this.uiDialog.position();
			
			// Dont want to change the original top and left if we are minimizing from the maximized state
			
			// we dont save the original top if we are minimized from a maximized state
			if (this.options.originalWasMaximized < 0) {
				this.options.originalTop = parseInt(this.uiDialog.css('top'));
				this.options.originalLeft = parseInt(this.uiDialog.css('left'));
			}
			
			
			width = getMinimizedWidth();
			//Pratik: Don't think we need this anymore: hide the content
			//this.element.hide();						
			//animate to the width, and move to the corner
			this.uiDialog.animate({width: width, height: this.uiDialogTitlebar.height() + 14},200);
			//this.uiDialog.css({position:"fixed", right:0, left:"auto", bottom: -5, top:"auto"});
			//collapse dialog
			this.uiDialog.find(".ui-dialog-title").css("width",width - 60);				
			//make sure the minimized windows are ordered correctly
			orderMinimized(width);
			//swap buttons to show restore
			this.uiDialogTitlebarMin.hide();
			this.uiDialogTitlebarMax.hide();
			this.uiDialogTitlebarRest.show();
		},
		maximize: function() {
			//set this window as "minimized" class
			this.uiDialog.addClass("dialogs-maximized");
			this.uiDialog.removeClass('dialogs-minimized');			
			//disable resizable
			this.uiDialog.resizable( "option", "disabled", true );
//			//disable draggable
			this.uiDialog.draggable( "option", "disabled", true );
			this.uiDialog.removeClass("ui-state-disabled");
			this.resizeableHandle.hide();
					 
			//Store the original height/width
			this.options.originalWidth = this.options.width;
			this.options.originalHeight = this.options.height;
			
			var position = this.uiDialog.position();
			
			// We dont save the original top position in case of being maximized
			// from a minimized position
			if (this.options.originalWasMaximized < 0) {
				this.options.originalTop = parseInt(this.uiDialog.css('top'));
				this.options.originalLeft = parseInt(this.uiDialog.css('left'));
			}
			
			
			width = $(document).width() - 20;
			height = $(window).height() - 60;

			this.uiDialog.find(".ui-dialog-content").css({width: "auto", height: height - 50});
			this.uiDialog.find(".ui-dialog-title").css("width",width - 60);				
			//Pratik: Don't think we need this anymore: hide the content
			//this.element.hide();						
			//animate to the width, and move to the corner
			this.uiDialog.css({position: 'fixed', top: "50%", width: width, left: "50%", marginLeft: -width/2, height: height, marginTop: -height/2 - 20});
			//collapse dialog
			this.options.originalWasMaximized = -1;
			
			//swap buttons to show restore
			this.uiDialogTitlebarMax.hide();
			this.uiDialogTitlebarMin.show();
			this.uiDialogTitlebarRest.show();
			
			minimizedWidth = getMinimizedWidth();
			orderMinimized(minimizedWidth);		
		}
	});
})(jQuery);

/**
 * getMinimizedWidth()
 * the function responsible for calculating the width of minimized dialogs
 * @returns the width of the minimized dialogs
 */
function getMinimizedWidth() {
	var tot_w = jQuery(document).width();
	//Find the number of minimized dialogs
	var num_min = jQuery(".dialogs-minimized").size();
	//Dividing the width of the page equally, and setting width to min of division or 200px
	var width = Math.min((tot_w-2*20-(num_min-1)*5)/num_min,200);
	return width;
}

/**
 * orderMinimized(width)
 * the function responsible for oreding minimized dialogs
 * @param width the desired width of minimized dialogs
 */
function orderMinimized(width) {
	var right = 10;
	jQuery(".dialogs-minimized").each(function(){
		var t = jQuery(this);
		var height = t.find(".ui-dialog-titlebar").height() + 14;
		t.find(".ui-dialog-title").css("width", width - 60);
		t.css({position: 'fixed', bottom: -5, top: 'auto', left: 'auto', right: right, width: width, height: height});
		right += width + 5;
	});
}