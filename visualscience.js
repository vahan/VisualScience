/**
 * Functions used in visualscience module
 */

// TODO result insertion should be reconsidered. So it's possible to have full result insertions, insted of 
// just insterting the result before the string. So something like inserting between two " || ", " && "-s, or 
// between a " || ", " && " and one of "[" or "]"

// The row count used to style the items
var autocompleteRowCount = 1;

// An array where the preselected items are being saved
var autocompleteCheckedItems = new Array();

// The variables where the search type is being saved
var autocompletePreviousType = null;

// The variable which determines if the given autocompletion had the same type as the previous one
var autocompleteCurrentTypeIsTheSame = true;

// The insertion position for the autocomplete
var autocompleteCaretPosition = 0;

var skypeListParticipants = new Array();

// The AND and OR signs
// TODO for now works only for the first sign in the array. exend it so that it works for all of them
var andSign = " && ";
var orSign = " || ";

var AndRegEx = new RegExp("( AND )","ig");
var OrRegEx = new RegExp("( OR )","ig");

var checkActionsInterval;

jQuery(document).ready(function() {
		activateEventHandlers();
		setAutocompletes();
	
		checkActionsInterval = setInterval(function() {checkActions();},300);
});

function checkActions() {
	if (jQuery("#activate_actions").length > 0) {
		var parentId = jQuery("#activate_actions").parent().parent().attr("id");
		var dialogNumber = parentId.substring(parentId.lastIndexOf("-")+"-".length,parentId.length);
		jQuery("#activate_actions").remove();
	}
}

/**
 * getTerm(inputString, caretPosition)
 * Function that returns the autocomplete term
 * @param valBefore the string before the curret position
 */
function getTerm(valBefore) {	
	// Find the starting position of the term
	var startPos = Math.max(valBefore.lastIndexOf("["), valBefore.lastIndexOf(","), valBefore.lastIndexOf("]"), valBefore.toLowerCase().lastIndexOf(andSign), valBefore.toLowerCase().lastIndexOf(orSign));
	// The length of symbols ",", "{", "}"
	var offset = 1;
	
	// if the separator is long, we need more offset
	if (startPos == valBefore.toLowerCase().lastIndexOf(andSign) && startPos!=-1) {
		offset = andSign.length;
	} else if (startPos == valBefore.toLowerCase().lastIndexOf(orSign) && startPos!=-1) {
		offset = orSign.length;		
	}
	
	// trimming and getting rid of unneeded signs
	return ltrim(valBefore.substring(startPos + offset, valBefore.length));
}

/**
 * setCaretPosition(ctrl, pos)
 * Sets the cursor position to @pos in @ctrl textfield element 
 * @param ctrl the textfield object
 * @param pos position of the cursor to be set to
 */
function setCaretPosition(ctrl, pos) {
	if(ctrl.setSelectionRange)
	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}
	else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}

/**
 * getCaretPosition(ctrl)
 * return the cursor position in the given ctrl html textfield element
 * @param ctrl the html textfield element
 * @returns {Number} the position of the cursor
 */
function getCaretPosition(ctrl) {
	var CaretPos = 0;	// IE Support
	if (document.selection) {
		ctrl.focus ();
		var Sel = document.selection.createRange ();
		Sel.moveStart ('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
		CaretPos = ctrl.selectionStart;
	return (CaretPos);
}

function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}
function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}

/**
 * 
 * @param result
 */
function insertResult(result, textBox) {
	var inputBox = jQuery(textBox);
	var oldVal = inputBox.val();
	
	// If the textbox has no initial input with conditions, just replace the whole thing
	// TODO might need to change this when we add the NOT condition
	if (oldVal.lastIndexOf("[") == -1 && oldVal.lastIndexOf(",") == -1 && oldVal.lastIndexOf(orSign) == -1 && oldVal.lastIndexOf(andSign) == -1) {
		inputBox.val(response.item.value);
	} else {
		// Split the text into to parts, before the insertion point and after
		// To be able to build the final string afterwards
		var oldValBefore = oldVal.substring(0, autocompleteCaretPosition);
		var oldValAfter = oldVal.substring(autocompleteCaretPosition, oldVal.length);

		var lastIndexOfOr = oldValBefore.toLowerCase().lastIndexOf(orSign);
		var lastIndexOfAnd = oldValBefore.toLowerCase().lastIndexOf(andSign);
		var lastIndexOfOpening = oldValBefore.lastIndexOf("[");
		var lastIndexOfClosing = oldValBefore.lastIndexOf("]");
		var lastIndexOfComma = oldValBefore.lastIndexOf(",");
		
		var firstIndexOfOr = oldValAfter.toLowerCase().indexOf(orSign);
		var firstIndexOfAnd = oldValAfter.toLowerCase().indexOf(andSign);
		var firstIndexOfClosing = oldValAfter.indexOf("]");
		var firstIndexOfComma = oldValAfter.indexOf(",");
		
		firstIndexOfOr < 0 ? firstIndexOfOr = 999999 : firstIndexOfOr;
		firstIndexOfAnd < 0 ? firstIndexOfAnd = 999999 : firstIndexOfAnd;
		firstIndexOfClosing < 0 ? firstIndexOfClosing = 999999 : firstIndexOfClosing;
		firstIndexOfComma < 0 ? firstIndexOfComma = 999999 : firstIndexOfComma;

		// Find the starting position of the insertion
		var startPos = Math.max(lastIndexOfOr, lastIndexOfAnd, lastIndexOfOpening, lastIndexOfClosing, lastIndexOfComma);
		
		var endPos = Math.min(firstIndexOfOr,firstIndexOfAnd,firstIndexOfClosing,firstIndexOfComma);
		// When we write in brackets, we want to close them automatically
		var endSymbol;
		
		// If the insertion is after the { and there are no any "}" at the remaining text afterwards, inster "}" at the end
		 
		(oldValAfter.indexOf("]") == -1 || (oldValAfter.indexOf("[") < oldValAfter.indexOf("]")) && oldValAfter.indexOf("[") != -1) ? 
							endSymbol = "]" : endSymbol = "";
		
		// The length of symbols ",", "{", "}"
		var offset = 1;
		
		// if the separator is long, we need more offset
		if (startPos == lastIndexOfAnd && startPos!=-1) {
			offset = andSign.length;
		} else if (startPos == lastIndexOfOr && startPos!=-1) {
			offset = orSign.length;
		}

		// Find the checked values
		var inputVal = result;
		// Build the new Value of the textbox
		newVal = oldVal.substring(0, startPos + offset) + inputVal + endSymbol + oldValAfter.substring(endPos,oldValAfter.length);
		inputBox.val(newVal);
		
		// Put the cursor position in the correct place
		setCaretPosition(inputBox[0], startPos + inputVal.length + offset);
		
		// Clear the list of previously selected items
		autocompleteCheckedItems = new Array();
	}			
		
}
/**
 * 
 * @param string
 * @param cursorPosition
 */
function getSearchType(valBefore, caretPosition) {
		
	var search_type = "generic";
	
	var lastParamOpenPos = valBefore.lastIndexOf("[");
	var lastParamClosePos = valBefore.lastIndexOf("]");
	
	// define the search type by extracting the word before "="
	if (lastParamOpenPos != -1 && lastParamOpenPos > lastParamClosePos) {
    		// If there is an opening bracket, and there is no closing bracket after it before the cursor
			// search using the string before "=" sign as a type
			var bracketPos = valBefore.lastIndexOf("[");
			var stringBeforeEquals = valBefore.substring(0, bracketPos - 1);
			var positionOfSpaceBeforeSearchType = stringBeforeEquals.lastIndexOf(" ");
			search_type = stringBeforeEquals.substring(positionOfSpaceBeforeSearchType + 1, bracketPos - 1);
	}
	return search_type;
}

function valueInArray(array, value) {
	for (a in array) {
		if (a == value)
			return true;
	}
	return false;
}

/**
 * Function that opens the dialog given the content
 * @param content the content of the dialog
 */
function openDialog(dialogNumber) {
	if (!jQuery("#visualscience-container-"+dialogNumber).hasClass('ui-dialog-content')) {
		jQuery("#visualscience-search-query-"+dialogNumber).autocomplete("destroy");			
	}
	setVisualScienceDialogs(dialogNumber);
	jQuery(".remove_after_loaded").remove();
}

/**
 * setVisualScienceDialogs
 * @param dialog the dialog id to set. If null, sets by classname
 */
function setVisualScienceDialogs(dialogNumber) {
	var title = jQuery("#visualscience-search-query-"+dialogNumber).val();
	if (title == "") {
		title =  "All users";
	} else {
		title = "Searched: " + title;
	}
	selector = "#visualscience-container-"+dialogNumber;
	if (jQuery("#visualscience-container-"+dialogNumber).hasClass('ui-dialog-content')) {
		// Dialog already exists, just changing the title
		var titleId = "ui-dialog-title-visualscience-container-"+dialogNumber;
		var title = jQuery("#visualscience-search-query-"+dialogNumber).val();
		if (title == "") {
			title =  "All users";
		} else {
			title = "Searched: " + title;
		}
		jQuery("#"+titleId).html(title);
	} else {
		// Creating the dialogs
		jQuery(selector).dialog({
			title: title,
			autoOpen: true,
			height: 400, 
			width: 800, 
			minHeight: 400, 
			minWidth: 800,
			resizable: true,
			close: function(event, ui) {
				// to check if the dialogs need to be rearranged after closing one
				var toRearrange = false;
				var targetDialog = jQuery(event.target);
			
				// if the closed dialog was minimized
				if (targetDialog.parent().hasClass("dialogs-minimized")) {
					toRearrange = true;
				}

				jQuery(this).dialog('destroy');
				jQuery(this).parent().remove();
			
				// rearrange the minimized dialogs
				if (toRearrange) {
					orderMinimized(getMinimizedWidth());				
				}
			}
		});
		jQuery(selector).dialog("maximize");
		// Creating the next form on the main page
		jQuery.ajax({
			  url: "?q=visualscience/searchform&ajax=1",
			  context: document.body,
			  success: function(data, textStatus, jqXHR){
				  // TODO this is not a nice way, it is template dependent.. so try to find the good way..
				  jQuery("#main-content").html(data);
			  }
		});
	}
}

/**
 * function to execute when the button to show the map is clicked
 * @param btn the button objcontentChangeect
 */
function lsMapOpen(btn) {
	var thisId = btn.id;
	var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
	var htmlToFill = "<div id='container-"+dialogNumber+"-1' class='ui-layout-south' style='height: 400px;'>";
	htmlToFill += "<div class='ui-layout-center'>";
	htmlToFill += "<div id='mapcontainer-"+dialogNumber+"-1' class='mapcontainer' style='width: 100%; height: 100%'></div></div>";
	htmlToFill += "<div class='ui-layout-west'><div class='watchProgress' id='watchProgress-"+dialogNumber+"-1' class='ui-layout-north'></div><div id='searchResults-"+dialogNumber+"-1' class='searchResults'></div></div>";
	htmlToFill += "</div></div>";
	
	
	jQuery("#visualscience-container-"+dialogNumber).append(htmlToFill);
	jQuery("#container-"+dialogNumber+"-0").addClass("ui-layout-center");
	jQuery("#container-"+dialogNumber+"-1").layout({ applyDefaultStyles: true }).sizePane("west", 800);
	var mainLayout = jQuery("#visualscience-container-"+dialogNumber).layout({ applyDefaultStyles: true });
	mainLayout.sizePane("south", 400);
	mainLayout.open("south");
	
	lsSearch(dialogNumber);
//	jQuery("#visualscience-search-query-"+dialogNumber).autocomplete("destroy");
//	setAutocompletes();
}

/**
 * function to execute when the button to start skype conv. is clicked
 * @param btn the button objcontentChangeect
 */
function skypeOpen(btn) {
	// Checking to see if skype stuff is loaded
	if (globalContactList) {
		var thisId = btn.id;
		var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
		skypeListParticipants[dialogNumber] = "";
		var userListCheckboxes = jQuery("#user_list-list-"+dialogNumber).find(':checkbox:checked').each(function(index){
			// TODO handle this part to have a better search quiery. Look for the skypename
			var skypename = jQuery(this).parent().parent().next().next().next().next().next().next().next().text();
			if (skypename != "") {
				skypeListParticipants[dialogNumber] += skypename;
				skypeListParticipants[dialogNumber] += ",";
			}
		});
		var zIndex = 0;
		jQuery(".dialogs-maximized").each(function() {
			if (jQuery(this).css("zIndex") > zIndex) {
				zIndex = jQuery(this).css("zIndex");
			}
		});
		// If there are users with a given skypename among them
		if (skypeListParticipants[dialogNumber] != "") {
			skypeListParticipants[dialogNumber] = skypeListParticipants[dialogNumber].substring(0, skypeListParticipants[dialogNumber].length - 1);
			var dialog = getDialogByParticipants(skypeListParticipants[dialogNumber]);
			jQuery(dialog).dialog('option',"zIndex", zIndex);
			jQuery(dialog).dialog('open');			
		}
	} else {
		alert("please login to skype!");
	}
}
/**
 * function to execute when the button to show the map is clicked
 * @param btn the button objcontentChangeect
 */
function opentokCreate(btn) {
	var thisId = btn.id;
	var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
	var opentokParticipants = new Array();
	var userListCheckboxes = jQuery("#user_list-list-"+dialogNumber).find(':checkbox:checked').each(function(index){
		// TODO handle this part to have a better search quiery. Look for the username and email
		var username = jQuery(this).parent().parent().next().text();
		var email = jQuery(this).parent().parent().next().next().text();
		if (username != "") {
			opentokListParticipants[dialogNumber] += username;
			opentokListParticipants[dialogNumber] += ",";
		}
	});
	var zIndex = 0;
	jQuery(".dialogs-maximized").each(function() {
		if (jQuery(this).css("zIndex") > zIndex) {
			zIndex = jQuery(this).css("zIndex");
		}
	});
	// If there are users with a given skypename among them
	if (skypeListParticipants[dialogNumber] != "") {
		skypeListParticipants[dialogNumber] = skypeListParticipants[dialogNumber].substring(0, skypeListParticipants[dialogNumber].length - 1);
		var dialog = getDialogByParticipants(skypeListParticipants[dialogNumber]);
		jQuery(dialog).dialog('option',"zIndex", zIndex);
		jQuery(dialog).dialog('open');			
	}
}
/**
 * Function to activete event handlers for searchbox
 * @param idSuffix give "" for all, and a number for a specific searchbox
 */
function activateEventHandlers() {
	jQuery(".vs-datepicker").datepicker({
			onSelect: function(dateText, inst) {
				var thisId = jQuery(this).attr("id");
				var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
				insertResult(dateText, document.getElementById("visualscience-search-query-"+dialogNumber));
				jQuery(this).css("display", "none");
				return false;
			},
			dateFormat: "dd-mm-yy",
			changeMonth: true,
			changeYear: true
	});

	jQuery(".visualscience-search-query").bind("keyup.autocomplete", function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		var thisId = jQuery(this).attr("id");
		var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
		// TODO for FF4 the keycode is somehow 61. Correct this// Turns out that 61 is the keycode for + in other browsers
		// Now would put "[" if you type bot + and =
		var searchType = getSearchType(jQuery(this).val().substring(0, getCaretPosition(jQuery(this)[0])),getCaretPosition(jQuery(this)[0]));
		// TODO check for the browser. Somehow the keycode is 107 for a 3.6 version of FF
		if(code == 187 || code == 61 || code == 107) {
			jQuery(this).val(jQuery(this).val() + "[");
		} if (code == 27 || searchType != "date") {
			jQuery("#vs-datepicker-"+dialogNumber).css("display","none");			
		} else {
			jQuery("#vs-datepicker-"+dialogNumber).css("display","block");			
		}
	});
	
//	jQuery("input#edit-text").parent().css("margin-bottom","0px");
	jQuery(".visualscience-search-query").bind("keypress.autocomplete", function(e) {
		var inputBox = jQuery(this);
		var code = (e.keyCode ? e.keyCode : e.which);
		var thisId = jQuery(this).attr("id");
		var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
		// If space is pressed, and if there is an item selected, check/uncheck the checkbox next to it
		if (code == 32) {
			var autocomplete = jQuery(this).autocomplete("widget");
			console.debug(autocomplete);
			var autocompleteOpen = false;
			if (autocomplete.css("display") == "block") {
				var selectedCheckbox = autocomplete.find("a#ui-active-menuitem").find("input");
				var selectedValue = autocomplete.find("a#ui-active-menuitem").find(".autocomplete-value");
				if (selectedCheckbox.length > 0) {
					if (selectedCheckbox.attr("checked") == false) {
						selectedCheckbox.attr("checked", true);	
						selectedValue.addClass("selected").removeClass("not-selected");
						autocompleteCheckedItems[selectedValue.html()] = selectedValue.html();
					} else {
						selectedCheckbox.attr("checked", false);								
						selectedValue.addClass("not-selected").removeClass("selected");
						autocompleteCheckedItems[selectedValue.html()] = "";
					}
					return false;					
				}
			};
		} else if (code == 13) {
			jQuery("#vs-datepicker-"+dialogNumber).css("display","none");			
		}
		// Check for the search type
	});
}

/**
 * Function to set autocomplete(s)
 * @param idSuffix "" for all, specify a number for a specific dialog
 */
function setAutocompletes() {
	jQuery(".visualscience-search-query").each(function(index, element) {
		// Check to see if it already doesnt have an autocomplete attached
		if (!jQuery(this).autocomplete("widget").hasClass("ui-autocomplete-input")) {
			console.debug("setting autocomplete: " + jQuery(this).attr("id"));
		jQuery(this).autocomplete({
			minLength: 0,
		    source: function(request, response) {
		    	var inputBox = jQuery(this.element);
		    	var thisId = inputBox.attr("id");
		    	var dialogNumber = thisId.substring(thisId.lastIndexOf("-")+"-".length,thisId.length);
		    	autocompleteRowCount = 0;
		    	var value = inputBox.val().replace(OrRegEx, orSign).replace(AndRegEx, andSign);
		    	
		    	autocompleteCaretPosition = getCaretPosition(inputBox[0]);	    		
		    		
		    	var valBefore = value.substring(0, autocompleteCaretPosition);

		    	request.term = getTerm(valBefore);
	    		request.search_type = getSearchType(valBefore, autocompleteCaretPosition);
		    	if (request.search_type == "date") {
		    		jQuery("#vs-datepicker-"+dialogNumber).css("display","block");
		    	} else {
		    		// If the first autocomplete cycle
		    		if (autocompletePreviousType == null) {
		    			// No preselected results should be loaded
		    			autocompleteCurrentTypeIsTheSame = false;
					// If the types are not the same
		    		} else if (autocompletePreviousType != request.search_type) {
						// No preselected results loaded
						autocompleteCurrentTypeIsTheSame = false;
						// And the list should be empty now
						autocompleteCheckedItems = new Array();
		    		} else {
					// Otherwise, if they are the same, let the preselected results be loaded
		    			autocompleteCurrentTypeIsTheSame = true;
		    		}
				
		    		// Set the previous type equal to the current type
		    		autocompletePreviousType = request.search_type;

		    		var urlAdd = "";
		    		// TODO find a better solution
		    		// checking if clean urls are used or not
		    		if (location.href.indexOf("?q=") != -1) {
		    			urlAdd = "?q=";
		    		}
		    	
		    		var url = location.href.substring(0,location.href.lastIndexOf("?q=")) + urlAdd + "visualscience/autocomplete/" + request.term + "/" + request.search_type;
		    	
		    		jQuery.ajax({
		    		  url: url,
		    		  data: null,
		    		  success: function( data, status, xhr ) {
		    			// Adding/moveing the data from autocompleteCheckedItems to the very end
		    			var dataArray = eval(data);
		    			// Check if this autocompletion type is the same or not
		    			// If not the same, we do not load any preselected results
		    			if (autocompleteCurrentTypeIsTheSame) {
		    				// For each preselected item
		    				for (item in autocompleteCheckedItems) {
		    					// And if it was not already unchecked before
		    					if (autocompleteCheckedItems[item] != "") {
		    						// Compare it with the current results
		    						for (var i = 0; i < dataArray.length; i++) {
			    	    				// And see if it is in the current results
		    							if (dataArray[i] == autocompleteCheckedItems[item]) {
		    								// If yes, remove that value from the current results
		    								dataArray.splice(i, 1);
		    							}
		    						}
		    						// And put it at the end as a preselected result
		    						dataArray.push(item);
		    					}
		    				}
		    			}
						response( dataArray );
		    		  }

		    		});
		    	}
		    },
		    focus: function( request, response ) {
		    	// The function that is fired when the cursor goes over 
		    	// and item in a select box
				return false;
			},
			open: function (request, response) {
				jQuery(this).autocomplete("widget").find("input.selected").attr("checked", true);
				jQuery(this).autocomplete("widget").find("input.not-selected").attr("checked", false);
			},
			select: function( request, response ) {
				var inputVal = "";
				for (item in autocompleteCheckedItems) {
					if (autocompleteCheckedItems[item] != "") {
						inputVal += item + andSign;
					}
				}
				if (inputVal == "") {
		    		inputVal = response.item.value;
				} else {
					inputVal = inputVal.substring(0, inputVal.length - andSign.length);
				}
				insertResult(inputVal, this);
				// Insert Result
				return false;
			}
		}).data( "autocomplete" )._renderItem = function( ul, item ) {
			var inputBox = jQuery(this.element);
			var itemValue = item.value;
			// If the values in not in the previously already selected values
		    var valBefore = inputBox.val().substring(0, getCaretPosition(inputBox[0]));
		    var term = getTerm(valBefore);
			
		    var regex = new RegExp("("+term+")","ig");
		    if (term != "") {
		    	itemValue = itemValue.replace(regex,'<span class="highlight">$1</span>');
		    }
		    // Here the list is built up, and any html can be insterted
		    autocompleteRowCount % 2 == 0 ? autocompleteRowCount = 1 : autocompleteRowCount = 0;
		    
		    // If the value was already selected in the previous suggestions box, add it with the selected classname
		    var selectedClass = "selected";
		    var selectedDecorationClass = "preselected";
		    if (autocompleteCheckedItems[item.value] ===  undefined || autocompleteCheckedItems[item.value] == "") {
		    	selectedClass = "not-selected";
		    	selectedDecorationClass = "not-preselected";
		    }
		    
		    return jQuery( "<li></li>" )
		    	.data( "item.autocomplete", item )
		    	.append( "<a onclick='return false;'><span class='autocomplete_row_" + autocompleteRowCount + " " + selectedDecorationClass
					+ "'><input type='checkbox' class='" + selectedClass + "' />&nbsp;" + itemValue 
					+ "</span><span class='autocomplete-value " + selectedClass + "' style='display: none;'>" 
					+ item.value + "</span></a>" )
				.appendTo( ul );
		};
		}
	});
}

/** FOR THE PRESENTATION **/

//TODO change the query parsing scheme to really get the first and last name, and the skypename
// FINISH THE FUNCTION IN USER_LIST.js

/** FOR MONDAY **/

//TODO ask Christian to change the z-index behaviour, zoom in/out spoils positioning

//TODO put urls to the articles

//TODO loading a saved search doesnt work/ something happened, it also doesn't load the saved fields-to-show data

//TODO make sure the anonymous user does not show up

//TODO minimize all maximized dialogs, when skype is opened

/** FURTHER DEVELOPMENT & BUGS**/

//TODO autocomplete: when inserting something in between, it crashes....

//TODO try using jQuery's live()

//TODO after loading the map, autocomplete goes behind the dialog

//TODO when putting the columns-to-show in the database, also take care of the id of the table, because if you have
//two tables at the same time with which you tweak around, after you perform a search on either of those, you will get
//not neccessarily the fields specified for that one, but actually the fields determined by the last check/uncheck event

//TODO styling - clone the scroll on top, and also the behavour of the following table headers should be fixed

//TODO ajax doesn't work on a newly loaded page if the GO button is clicked, with enter it works

//TODO check everything for clean urls

//TODO datepicker behavior when clicked on the textfield, it doesnt close or open (should it be like this??)

//TODO minimization does not rearrange correctly

//TODO more actions on minimize, like closing autocompletes, and also unfocusing boxes, but do this without messing up the extension code

//TODO move rearrangeMinimized and getwidth function in the dialog specific functions, so that they are
// called like .dialog("getWidht")
  
//TODO sorting doesnt work
  
//TODO living science map should be in a separate module, and clicking the lsmap should just invoke the hook at that module
  
//TODO adding/removing new windows

//TODO get rid of all the unusable code from tabs (VAHAN)
  
//TODO save the whole interface
  
//TODO focusing and key bindings
   
//TODO get rid of user_list.js

//TODO enable double click for maximize/restore
