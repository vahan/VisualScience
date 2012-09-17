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

var AndRegEx = new RegExp("( AND )", "ig");
var OrRegEx = new RegExp("( OR )", "ig");

var checkActionsInterval;

jQuery(document).ready(function() {
	activateEventHandlers();
	setAutocompletes();

	checkActionsInterval = setInterval(function() {
		checkActions();
	}, 300);
});

function checkActions() {
	if (jQuery("#activate_actions").length > 0) {
		var parentId = jQuery("#activate_actions").parent().parent().attr("id");
		var dialogNumber = parentId.substring(parentId.lastIndexOf("-") + "-".length, parentId.length);
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
	if (startPos == valBefore.toLowerCase().lastIndexOf(andSign) && startPos != -1) {
		offset = andSign.length;
	} else if (startPos == valBefore.toLowerCase().lastIndexOf(orSign) && startPos != -1) {
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
	if (ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(pos, pos);
	} else if (ctrl.createTextRange) {
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
	var CaretPos = 0;
	// IE Support
	if (document.selection) {
		ctrl.focus();
		var Sel = document.selection.createRange();
		Sel.moveStart('character', -ctrl.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (ctrl.selectionStart || ctrl.selectionStart == '0')
		CaretPos = ctrl.selectionStart;
	return (CaretPos);
}

function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g, "");
}

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/, "");
}

function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/, "");
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

		var endPos = Math.min(firstIndexOfOr, firstIndexOfAnd, firstIndexOfClosing, firstIndexOfComma);
		// When we write in brackets, we want to close them automatically
		var endSymbol;

		// If the insertion is after the { and there are no any "}" at the remaining text afterwards, inster "}" at the end

		(oldValAfter.indexOf("]") == -1 || (oldValAfter.indexOf("[") < oldValAfter.indexOf("]")) && oldValAfter.indexOf("[") != -1) ? endSymbol = "]" : endSymbol = "";

		// The length of symbols ",", "{", "}"
		var offset = 1;

		// if the separator is long, we need more offset
		if (startPos == lastIndexOfAnd && startPos != -1) {
			offset = andSign.length;
		} else if (startPos == lastIndexOfOr && startPos != -1) {
			offset = orSign.length;
		}

		// Find the checked values
		var inputVal = result;
		// Build the new Value of the textbox
		newVal = oldVal.substring(0, startPos + offset) + inputVal + endSymbol + oldValAfter.substring(endPos, oldValAfter.length);
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
	if (!jQuery("#visualscience-container-" + dialogNumber).hasClass('ui-dialog-content')) {
		jQuery("#visualscience-search-query-" + dialogNumber).autocomplete("destroy");
	}
	setVisualScienceDialogs(dialogNumber);
	jQuery(".remove_after_loaded").remove();
}

/**
 * setVisualScienceDialogs
 * @param dialog the dialog id to set. If null, sets by classname
 */
function setVisualScienceDialogs(dialogNumber) {
	var title = jQuery("#visualscience-search-query-" + dialogNumber).val();
	if (title == "") {
		title = "All users";
	} else {
		title = "Searched: " + title;
	}
	selector = "#visualscience-container-" + dialogNumber;
	if (jQuery("#visualscience-container-" + dialogNumber).hasClass('ui-dialog-content')) {
		// Dialog already exists, just changing the title
		var titleId = "ui-dialog-title-visualscience-container-" + dialogNumber;
		var title = jQuery("#visualscience-search-query-" + dialogNumber).val();
		if (title == "") {
			title = "All users";
		} else {
			title = "Searched: " + title;
		}
		jQuery("#" + titleId).html(title);
	} else {
		// Creating the dialogs
		jQuery(selector).dialog({
			title : title,
			autoOpen : true,
			height : 400,
			width : 800,
			minHeight : 400,
			minWidth : 800,
			resizable : true,
			close : function(event, ui) {
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
			url : "?q=visualscience/searchform&ajax=1",
			context : document.body,
			success : function(data, textStatus, jqXHR) {
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
	var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
	var htmlToFill = "<div id='container-" + dialogNumber + "-1' class='ui-layout-south' style='height: 400px;'>";
	htmlToFill += "<div class='ui-layout-center'>";
	htmlToFill += "<div id='mapcontainer-" + dialogNumber + "-1' class='mapcontainer' style='width: 100%; height: 100%'></div></div>";
	htmlToFill += "<div class='ui-layout-west'><div class='watchProgress' id='watchProgress-" + dialogNumber + "-1' class='ui-layout-north'></div><div id='searchResults-" + dialogNumber + "-1' class='searchResults'></div><div class='ls-pagination' id='ls-pagination-" + dialogNumber + "-1'></div></div>";
	htmlToFill += "</div></div>";

	jQuery("#visualscience-container-" + dialogNumber).append(htmlToFill);
	jQuery("#container-" + dialogNumber + "-0").addClass("ui-layout-center");
	jQuery("#container-" + dialogNumber + "-1").layout({
		applyDefaultStyles : true
	}).sizePane("west", 800);
	var mainLayout = jQuery("#visualscience-container-" + dialogNumber).layout({
		applyDefaultStyles : true
	});
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
		var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
		skypeListParticipants[dialogNumber] = "";
		var userListCheckboxes = jQuery("#user_list-list-" + dialogNumber).find(':checkbox:checked').each(function(index) {
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
			jQuery(dialog).dialog('option', "zIndex", zIndex);
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
	var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
	var opentokParticipants = new Array();
	var userListCheckboxes = jQuery("#user_list-list-" + dialogNumber).find(':checkbox:checked').each(function(index) {
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
		jQuery(dialog).dialog('option', "zIndex", zIndex);
		jQuery(dialog).dialog('open');
	}
}

/**
 * Function to activete event handlers for searchbox
 * @param idSuffix give "" for all, and a number for a specific searchbox
 */
function activateEventHandlers() {
	jQuery(".vs-datepicker").datepicker({
		onSelect : function(dateText, inst) {
			var thisId = jQuery(this).attr("id");
			var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
			insertResult(dateText, document.getElementById("visualscience-search-query-" + dialogNumber));
			jQuery(this).css("display", "none");
			return false;
		},
		dateFormat : "dd-mm-yy",
		changeMonth : true,
		changeYear : true
	});

	jQuery(".visualscience-search-query").bind("keyup.autocomplete", function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		var thisId = jQuery(this).attr("id");
		var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
		// TODO for FF4 the keycode is somehow 61. Correct this// Turns out that 61 is the keycode for + in other browsers
		// Now would put "[" if you type bot + and =
		var searchType = getSearchType(jQuery(this).val().substring(0, getCaretPosition(jQuery(this)[0])), getCaretPosition(jQuery(this)[0]));
		// TODO check for the browser. Somehow the keycode is 107 for a 3.6 version of FF
		if (code == 187 || code == 61 || code == 107) {
			jQuery(this).val(jQuery(this).val() + "[");
		}
		if (code == 27 || searchType != "date") {
			jQuery("#vs-datepicker-" + dialogNumber).css("display", "none");
		} else {
			jQuery("#vs-datepicker-" + dialogNumber).css("display", "block");
		}
	});

	//	jQuery("input#edit-text").parent().css("margin-bottom","0px");
	jQuery(".visualscience-search-query").bind("keypress.autocomplete", function(e) {
		var inputBox = jQuery(this);
		var code = (e.keyCode ? e.keyCode : e.which);
		var thisId = jQuery(this).attr("id");
		var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
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
			jQuery("#vs-datepicker-" + dialogNumber).css("display", "none");
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
				minLength : 0,
				source : function(request, response) {
					var inputBox = jQuery(this.element);
					var thisId = inputBox.attr("id");
					var dialogNumber = thisId.substring(thisId.lastIndexOf("-") + "-".length, thisId.length);
					autocompleteRowCount = 0;
					var value = inputBox.val().replace(OrRegEx, orSign).replace(AndRegEx, andSign);

					autocompleteCaretPosition = getCaretPosition(inputBox[0]);

					var valBefore = value.substring(0, autocompleteCaretPosition);

					request.term = getTerm(valBefore);
					request.search_type = getSearchType(valBefore, autocompleteCaretPosition);
					if (request.search_type == "date") {
						jQuery("#vs-datepicker-" + dialogNumber).css("display", "block");
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

						var url = location.href.substring(0, location.href.lastIndexOf("?q=")) + urlAdd + "visualscience/autocomplete/" + request.term + "/" + request.search_type;

						jQuery.ajax({
							url : url,
							data : null,
							success : function(data, status, xhr) {
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
								response(dataArray);
							}
						});
					}
				},
				focus : function(request, response) {
					// The function that is fired when the cursor goes over
					// and item in a select box
					return false;
				},
				open : function(request, response) {
					jQuery(this).autocomplete("widget").find("input.selected").attr("checked", true);
					jQuery(this).autocomplete("widget").find("input.not-selected").attr("checked", false);
				},
				select : function(request, response) {
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
			}).data("autocomplete")._renderItem = function(ul, item) {
				var inputBox = jQuery(this.element);
				var itemValue = item.value;
				// If the values in not in the previously already selected values
				var valBefore = inputBox.val().substring(0, getCaretPosition(inputBox[0]));
				var term = getTerm(valBefore);

				var regex = new RegExp("(" + term + ")", "ig");
				if (term != "") {
					itemValue = itemValue.replace(regex, '<span class="highlight">$1</span>');
				}
				// Here the list is built up, and any html can be insterted
				autocompleteRowCount % 2 == 0 ? autocompleteRowCount = 1 : autocompleteRowCount = 0;

				// If the value was already selected in the previous suggestions box, add it with the selected classname
				var selectedClass = "selected";
				var selectedDecorationClass = "preselected";
				if (autocompleteCheckedItems[item.value] === undefined || autocompleteCheckedItems[item.value] == "") {
					selectedClass = "not-selected";
					selectedDecorationClass = "not-preselected";
				}

				return jQuery("<li></li>").data("item.autocomplete", item).append("<a onclick='return false;'><span class='autocomplete_row_" + autocompleteRowCount + " " + selectedDecorationClass + "'><input type='checkbox' class='" + selectedClass + "' />&nbsp;" + itemValue + "</span><span class='autocomplete-value " + selectedClass + "' style='display: none;'>" + item.value + "</span></a>").appendTo(ul);
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

/**
 * Code for new Design (Sebastien)
 */
//This variable checks if the whole tabbed interface has been created yet.
var tabbedInterfaceExists = false;

//Variable who contains the name of the actual tabbed interface.
var tabbedInterface = 'tabbed-interface';

//Variable to differentiate each tab from each other
var tabId = 0;

//Object to instatiate the livingscience results (Thanks to this, you will be able to have the ls results) /!\ Needs to be loaded after the file livingscience.nocache.js
var livingscience; //API instance to make search
var lslist; //API instance to generate list
var lsmap; //API instance to generate map
var lsrelations; //API instance to generate relations
var db;
window.onload = function() {
	db = new NDDB();
	livingscience = new ch.ethz.livingscience.gwtclient.api.LivingScienceSearch();
	lslist = new ch.ethz.livingscience.gwtclient.api.LivingScienceList();
	lsmap = new ch.ethz.livingscience.gwtclient.api.LivingScienceMap();
	lsrelations = new ch.ethz.livingscience.gwtclient.api.LivingScienceRelations();
}

//This is the array containing all the databases result from LivingScience
var lsDB = new Array();

//This is the DialogNumber variable. Setting it global makes everything much more easier to use.
var dialogNumber;


/*
 * This function is called when the user launches the search from the bar.
 * It will first check if the tabbed interface is loaded and load it if not.
 * Then it adds a new tab to the interface, with the result of the search.
 */
function openUserListTab(dialogNumber_) {
	dialogNumber = dialogNumber_;
	setTimeout(function() {//(Bad style) The tab creation should be deleted, so that the ajax results can be put in the display:none; div(#visualscience-user_list-dialogNumber)
		createTabbedInterface(dialogNumber);
		var title = jQuery("#visualscience-search-query-" + dialogNumber).val();
		title = (title == '' ? 'All Users' : 'Search: ' + title);

		var nbTabs = jQuery('#' + tabbedInterface).tabs('length');
		addTab(title, '#visualscience-search-tab-content-' + nbTabs);
		//Insert the table result in a new div
		var idOfThisTab = tabId;
		var content = createUserSearchResult(dialogNumber, idOfThisTab);
		jQuery('#visualscience-search-tab-content-' + nbTabs).html(content).css('display', 'block');
		jQuery('#visualscience-user_list-result-' + idOfThisTab).tablesorter(); //Enables the table to be sorted
	}, 1);
}

/*
 * This function creates the whole tab, which will be displayed to the user.
 * It contains :
 * -the action bar, which is the bar with every buttons(Message, CSV, LS and Conference)
 * -The table with the result and its options.(Sort table, hide fields, etc...)
 */
function createUserSearchResult(dialogNumber, idOfThisTab) {
	var actionBar = createActionBar(idOfThisTab);
	var tableUserList = createTableUserList(dialogNumber, idOfThisTab);
	return actionBar + tableUserList;
}

/*
 * This creates the action bar, with the different buttons.
 */
function createActionBar(idOfThisTab) {
	var finalDiv = '<div id="actionBar' + idOfThisTab + '" class="action-bar"><h3>Actions<span class="small-addition-in-title">to selected users</span></h3>';
	var sendMessage = '<input class="form-submit" value="Send a Message" type="button" onClick="createTabSendMessage();"  />';
	var csvExport = '<input class="form-submit" value="Export to CSV" type="button" onClick="exportUsersCSV();"  />';
	var livingscience = '<input class="form-submit" value="Living Science" type="button" onClick="createTabLivingScience('+idOfThisTab+');"  />';
	var conference = '<input class="form-submit" value="Conference" type="button" onClick="createTabConference();" />';
	finalDiv += sendMessage + csvExport + livingscience + conference + '</div>';
	makeActionBarMoveable(idOfThisTab);//Change this if it doesn't work.
	return finalDiv;
}

/*
 * Depending on what the user sees, the action bar will be static at the top of the page,
 * or fixed on the left, when he scrolls down.
 * TODO: Strangely, the animation is not the same in Firefox and in Chrome. Fixing this may be important for a unified UX.
 */
function makeActionBarMoveable(idOfThisTab) {
	/*
	 * The problem with this technique, is that it is triggered too often,
	 *  and the browser crashes because of the number of alerts... 
	 * The real challenge is to find a correct event.	
	 */
	/*window.onscroll = function () {
		var actionBar = jQuery('#actionBar' + idOfThisTab);
		if (jQuery(window).scrollTop() >= 650 && actionBar.attr('moveable') != 'true') {
			actionBar.attr('moveable', 'true');
			alert('coucou');
		}
		else if (jQuery(window).scrollTop() < 650 && actionBar.attr('moveable') == 'true') {
			actionBar.attr('moveable', 'false');
		}
	}
	*/
	setInterval(function() {
		if (jQuery('#visualscience-user_list-result-' + idOfThisTab).position().top - jQuery(window).scrollTop() <= -220 && jQuery('#actionBar' + idOfThisTab).attr('moveable') != 'true') {
			jQuery('#actionBar' + idOfThisTab).css({
				top : '0%',
				right : '65%',
				position : 'fixed'
			}).animate({
				right : '62px',
				top : '68%'
			}, 1500).attr('moveable', 'true');
		} else if (jQuery('#visualscience-user_list-result-' + idOfThisTab).position().top - jQuery(window).scrollTop() > -150 && jQuery('#actionBar' + idOfThisTab).attr('moveable') == 'true') {
			jQuery('#actionBar' + idOfThisTab).animate({
				right : '62%',
				top : '30%'
			}, 1000, function() {
				jQuery('#actionBar' + idOfThisTab).css({
					position : 'static',
					right : '65%',
					top : '0%'
				}).attr('moveable', 'false');
			});
		}
	}, 200);
}

function createTabSendMessage() {
	alert('More to come later...');
}

function exportUsersCSV() {
	alert('Please be patient !');
}

/*
 * In this function we create a new LivingScience tab, with the names the end-user checkd in the userlist.
 * idOfTheTab is the id of the tab where the livingscience request was sent.
 */
function createTabLivingScience(idOfTheTab) {
	var selectedUsers = getSelectedUsersFromSearchTable(idOfTheTab);
	if (selectedUsers != ''){
		var nbTabs = jQuery('#' + tabbedInterface).tabs('length');
		addTab('LivingScience', '#livingscience-tab-'+nbTabs);
		var thisTabId = tabId;
		livingscience.searchAuthor(selectedUsers, function(results) {onLivingScienceResults(results, 'livingscience-tab-'+nbTabs, thisTabId); });
		//TODO: Replace with a Drupal loading picture
		jQuery('#livingscience-tab-'+nbTabs).html('<center><h4>Search lauched, please be patient...</h4><img src="sites/all/modules/visualscience/includes/loading.gif" width="100px" alt="loading" /></center>');

	}
}

function getSelectedUsersFromSearchTable (idOfTheTab) {
	var tableId = 'visualscience-user_list-result-'+idOfTheTab;
	/*
	 * Enable the comments to have a working version, for the other computers and the general version of VisualScience
	 */
	var firstFieldNumber = getThWithContent(tableId, 'name');//To delete when comments enabled
	//var firstFieldToTake = getThWithContent('#'+tableId, 'First Name');
	//var secondFieldToTake = getThWithContent('#'+tableId, 'Last Name');
	
	var completeNamesArray = new Array();
	var nbRows = 0;
	jQuery('#'+tableId+' > tbody > tr').each(function(index) {
		if (jQuery('#'+tableId+' > tbody > tr:nth-child('+index+') input').is(':checked')) {
			completeNamesArray.push(jQuery('#'+tableId+' > tbody > tr:nth-child('+index+') > td:nth-child('+firstFieldNumber+')').text());//To delete when comments enabled
			
			//completeNamesArray.push(jQuery('#'+tableId+' > tbody > tr:nth-child('+index+') > td:nth-child('+firstFieldNumber+')').text()+\' \'+jQuery('#'+tableId+' > tbody > tr:nth-child('+index+') > td:nth-child('+secondFieldNumber+')').text());
		}
		nbRows = index;
	});
	nbRows++;
	if (jQuery('#'+tableId+' > tbody > tr:nth-child('+nbRows+') input').is(':checked')) {
			completeNamesArray.push(jQuery('#'+tableId+' > tbody > tr:nth-child('+nbRows+') > td:nth-child('+firstFieldNumber+')').text());//To delete when comments enabled
			
			//completeNamesArray.push(jQuery('#'+tableId+' > tbody > tr:nth-child('+nbRows+') > td:nth-child('+firstFieldNumber+')').text()+\' \'+jQuery('#'+tableId+' > tbody > tr:nth-child('+nbRows+') > td:nth-child('+secondFieldNumber+')').text());
		}
	
	//From now, we will generate a string out of the array, with the names separated with an OR.
	var string = '';
	for (var i=0; i < completeNamesArray.length; i++) {
		if (i == completeNamesArray.length -1) {
			string += completeNamesArray[i]
		}
		else{
			string += completeNamesArray[i]+' OR ';
		}
	}
	
	return string;//completeNamesArray;
}

/*
 * With this function, you get the column number from a table, whose column's th contains fieldContent.
 * tableId is the id of the table you want to check for the column number.
 * fieldContent is the content of the th the column should have. 
 */
function getThWithContent(tableId, fieldContent) {
	for (var i=0; i <= countColumnsInTable(tableId); i++) {
		if (jQuery('#'+tableId+' > thead > tr > th:nth-child('+i+')').text() == fieldContent) {
			return i;
		}
	}
}

/*
 * This function is the callback when a livingscience search is done.
 * First we get the list of publications, and store them in a NDDB object, which is just a NoSQL database inside JavaScript.
 * (More infos: https://github.com/nodeGame/NDDB)
 * Then, thanks to this database, we generate the nice table in the div under the tab. 
 */
function onLivingScienceResults (listOfPublications, idDivUnderTab, thisTabId) {
	//Replace this line with db.import(listOfPublications), when the NDDB Module will be imported.
	jQuery('#'+idDivUnderTab).empty();
	lslist.set(listOfPublications);
	db.importDB(lslist.getPubs());
	lsDB[thisTabId] = db;
	generateLivingScienceFromDB(lsDB[thisTabId], idDivUnderTab, thisTabId);
}

function generateLivingScienceFromDB (database, location, thisTabId) {
	jQuery('#'+location).html('<div id="ls-list-'+thisTabId+'"></div><div id="ls-map-'+thisTabId+'"></div><div id="ls-relations-'+thisTabId+'"></div>');
	generatePublicationsDiv(database, 0, 10, 'ls-list-'+thisTabId);
	generateMapDiv(database, 'ls-map-'+thisTabId);
	generateRelationsDiv(database, 'ls-relations-'+thisTabId);
}

function generatePublicationsDiv (database, start, howMany, location) {
	lslist.set(database);
	lslist.generateList(start, howMany, location);
}

function generateRelationsDiv (database, location) {
	lsrelations.set(database);
	lsrelations.setParent(location);
}

function generateMapDiv (database, location) {
	lsmap.set(database);
	lsmap.setParent(location);
}

function createTabConference() {
	alert('Come back later.');
}

/*
 * Creates the table of users, which can be sorted.
 */

function createTableUserList(dialogNumber, idOfThisTab) {
	var divFinalContent = createTableUserListHead(idOfThisTab, dialogNumber);
	var arrayOfUserResults = getArrayFromTable('user_list-list-' + dialogNumber);
	var nbColsInTable = countColumnsInTable('user_list-list-' + dialogNumber);
	for (var i = 1; i < arrayOfUserResults.length + 1; i++) {
		divFinalContent += '<td>' + arrayOfUserResults[i - 1] + '</td>';
		if (i % nbColsInTable == 0 && i != arrayOfUserResults.length) {
			if ((i/nbColsInTable)%2 == 0) {
				divFinalContent += '</tr><tr class="odd">';
			} else {
				divFinalContent += '</tr><tr class="even">';
			}
		}
	}
	divFinalContent += '</tr></tbody></table>';
	divFinalContent += getTableUserListOptions('user_list-list-' + dialogNumber, idOfThisTab, nbColsInTable);
	return divFinalContent;
}

/*
 * This functin creates the visibility options for the user list search.
 * firstly it takes every th field from the header table, and generates the checkbox witht these labels.
 * On the checkbox there is a function that toggles the visibility of the wanted element. 
 */
function getTableUserListOptions (tableId, idOfThisTab, nbColsInTable) {
	var divOptions = '<fieldset class="collapsible collapsed form-wrapper" id="edit-fields"><legend><span class="fieldset-legend"><a onClick="jQuery(\'#edit-fields > .fieldset-wrapper\').slideToggle();">Choose fields to show</a></span></legend><div class="fieldset-wrapper"><div style="max-height: 300px; overflow: auto">';
	jQuery('#' + tableId + ' > thead > tr > th').each(function(i) {
		if (jQuery(this).text() != '') {
			divOptions += '<div class="form-item form-type-checkbox form-item-user-data-name" style="width:50%; display:inline-block;"><label for="checkbox-visibility-'+jQuery(this).text()+idOfThisTab+'" class="option"><input type="checkbox" onClick="toggleColNbFromTable(\'visualscience-user_list-result-'+idOfThisTab+'\','+i+');" checked="checked" class="form-checkbox" name="checkbox-visibility-'+jQuery(this).text()+idOfThisTab+'" id="checkbox-visibility-'+jQuery(this).text()+idOfThisTab+'" /> '+jQuery(this).text()+' </label></div>';
		}
	});
	divOptions += '</div></div></fieldset>';
	return divOptions;
}

/*
 * This creates the thead of the user list search table.
 * It takes every thead from the hidden table and generates the thead witht that.
 */
function createTableUserListHead (idOfThisTab, dialogNumber) {
	var header = '<h3>User List</h3><table id="visualscience-user_list-result-' + idOfThisTab + '" class="tablesorter sticky-enabled table-select-processed tableheader-processed sticky-table"><thead><tr>';
	jQuery('#user_list-list-'+dialogNumber+' > thead > tr > th').each(function() {
		header += '<th>'+jQuery(this).html()+'</th>';
	});
	header += '</tr></thead><tbody><tr class="odd">';
	return header;
}

/*
 * toggles the visibility of a column in a table.
 * tableId is the id of the table and colNb the number (from 0)  of the col to toggle.
 */
function toggleColNbFromTable (tableId, colNb) {
	jQuery('#'+tableId+' td:nth-child('+(colNb+1)+')').toggle();
	jQuery('#'+tableId+' th:nth-child('+(colNb+1)+')').toggle();
}

/*
 * Count and returns the number of columns in a table.
 * tableId is the id of the table.
 */
function countColumnsInTable(tableId) {
	var colCount = 0;
	jQuery('#' + tableId + ' > thead > tr > th').each(function() {
		colCount++;
	});
	return colCount;
}

/*
 * Transform the content of a table into an array. It doesn't take in account the tr,
 * so it only returns the value of the table, without any hierarchic order.(NO array in array)
 */
function getArrayFromTable(tableId) {
	var values = new Array();
	var td = jQuery('#' + tableId + ' > tbody > tr > td');
	td.each(function(i) {
		values[i] = jQuery(this).html();
	})
	return values;
}

/*
 * This function adds a new tab to the tabbed interface.
 * The url parameter should be a local url and it can contain a fragment identifier(#something)
 * The name parameter is the name you want the tab to have.
 */
function addTab(name, url) {
	tabId++;
	var nbTabs = jQuery('#' + tabbedInterface).tabs('length');
	jQuery('#' + tabbedInterface).tabs('add', url, name + '<span class="close-tab-cross" onClick="closeTab(\'' + url + '\')">X</span>');
	jQuery('#' + tabbedInterface).tabs('select', nbTabs);
}

/*
 * This function closes the tab indicated by tabIndex.
 * TabIndex can either be the zero-position of the tab, or the href parameter.
 */
function closeTab(tabIndex) {
	jQuery('#' + tabbedInterface).tabs('remove', tabIndex);
}

/*
 * This function creates a tabbed-interface, out of the variable tabbedInterface.
 * Firstly, it however checks if the interface does not already exists, because otherwise this could create bugs.
 */
function createTabbedInterface(dialogNumber) {
	if (!tabbedInterfaceExists) {
		tabbedInterfaceExists = true;
		jQuery('#container-' + dialogNumber + '-0').append('<div id="' + tabbedInterface + '"><ul id="tab-list"></ul></div>');
		jQuery('#' + tabbedInterface).tabs({
			cache : true
		});
	}
}
