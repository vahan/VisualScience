/*
 * @file 
 * File that manages everything linked with the display of users in a table.
 *
 * Note: For searching users functionnalities, you have to check userlist.js
 */
 var vsSearch = (function() {
 	var getHTMLSearchTable, NumberUsersPerPage;

 	NumberUsersPerPage = 150;

 	getHTMLSearchTable = function getHTMLSearchTable(parameters) {
 		var html = [];
 		html.push('<div style="display:inline-block;width:80%;overflow-x:scroll;"><table id="visualscience-user_list-result-' + parameters.tabId + '" class="vs-userlist-table tablesorter sticky-header"><thead><tr><th style="min-width:35px;" onclick="vsSearch.selectAllBoxes(' + parameters.tabId + ', this)" ><input type="checkbox" id="user-list_master_checkbox-' + parameters.tabId + '" class="form-checkbox" title="Select all rows in this table" onclick="vsSearch.selectAllBoxes(' + parameters.tabId + ', this)" /></th>');
 		for (var i=0; i < parameters.header.length; i++) {
 			html.push('<th style="min-width:35px;" class="header">' + parameters.header[i] + '</th>');
 		}
 		html.push('</tr></thead><tbody>');
 		var length = parameters.showHowMany ? parameters.showHowMany : parameters.users.length;
 		for (var j=0; j < length; j++) {
 			var user = parameters.users[j];
 			html.push('<tr class="' + user.type + ' clickable clickToSelect" onClick="vsSearch.selectThisUser(' + user.id + ', this);" ><td><div class="form-item form-type-checkbox form-item-list-' + user.id + '"><input type="checkbox" name="list[' + user.id + ']" value="' + user.id + '" class="form-checkbox" onClick="vsSearch.selectThisUser(' + user.id + ', this);" /></div></td>');
 			for (var prop in user.fields) {
 				html.push('<td>' + user.fields[prop] + '</td>');
 			}
 			html.push('</tr>');
 		}
 		html.push('</tbody></table></div><br /><div align="center"><input type="button" class="vsLongButton" value="' + vsText.addMoreUsers + '" onclick="vsSearch.showMoreUsers(\'visualscience-user_list-result-' + parameters.tabId + '\', ' + parameters.showHowMany + ', this); return false;"  /></div>');
 		// Un comment to re-enable the Display options.
 		//  if (parameters.displayOptions) {
 		// 	html.push('<fieldset class="collapsible form-wrapper" id="edit-fields"><legend><span class="fieldset-legend"><a onClick="jQuery(\'#edit-fields > .fieldset-wrapper\').slideToggle();">Choose fields to show</a></span></legend><div class="fieldset-wrapper" style="display:none;"><div style="max-height: 300px; overflow: auto">');
 		// 	for (var i=0; i < parameters.header.length; i++) {
 		// 		var header = parameters.header[i];
 		// 		html.push('<div class="form-item form-type-checkbox form-item-user-data-name" style="width:50%; display:inline-block;"><label for="checkbox-visibility-' + header.replace(/(<([^>]+)>)/ig,"") + '' + parameters.tabId + '" class="option"><input type="checkbox" onClick="vsSearch.toggleColNbFromTable(\'visualscience-user_list-result-' + parameters.tabId + '\',\'' + i + '\');" checked="checked" class="form-checkbox" name="checkbox-visibility-' + header.replace(/(<([^>]+)>)/ig,"") + '' + parameters.tabId + '" id="checkbox-visibility-' + header.replace(/(<([^>]+)>)/ig,"") + '' + parameters.tabId + '" />' + header + '</label></div>');
 		// 	}
 		// 	html.push('</div></div></fieldset>');
 		// }
 		html = html.join('');
 		return html;
 	};

 	return {
 		nbUsersHideOptions : 1000,

 		selectThisUser : function(userId, row, state) {
 			if (row.nodeName === 'INPUT') {
 				row.checked = !row.checked;
 				return false;
 			}
 			var cur = row.getElementsByClassName('form-checkbox')[0];
 			if (typeof state === 'undefined') {
 				state = !cur.checked;
 			}
 			cur.checked = state;
 			var classes = row.getAttribute('class');
 			if (state) {
 				row.setAttribute('class', classes + ' vsSelectedRow');
 				vsDatabase.addSelectedUserId(userId);
 			}
 			else {
 				classes = classes.replace(/vsSelectedRow/g, '');
 				row.setAttribute('class', classes);
 				vsDatabase.removeSelectedUserId(userId);
 			}
		 	vsSearch.updateActionBar();
 		},

		/*
		 * This function creates the whole tab, which will be displayed to the user.
		 * It contains :
		 * -the action bar, which is the bar with every buttons(Message, CSV, LS and Conference)
		 * -The table with the result and its options.(Sort table, hide fields, etc...)
		 */
		 createUserSearchResult : function(searchObject, idOfThisTab, callback) {
		 	if (callback) {
		 		var exeCallback = function exeCallback() {
		 			var actionBar = vsSearch.createActionBar(idOfThisTab);
		 			var tableUserList = vsSearch.createTableUserList(searchObject, idOfThisTab);
		 			callback('<h3>' + vsText.userList + '</h3>' + actionBar + tableUserList);
		 		};
		 		var timeout = setTimeout(exeCallback, 1);
		 	}
		 	else {
		 		var actionBar = vsSearch.createActionBar(idOfThisTab);
		 		var tableUserList = vsSearch.createTableUserList(searchObject, idOfThisTab);
		 		return '<h3>' + vsText.userList + '</h3>' + actionBar + tableUserList;
		 	}
		 },

		/*
		 * This creates the action bar, with the different buttons.
		 */
		 createActionBar : function(idOfThisTab) {
		 	var actionBar = vsInterface.getView('actionBar.html', function(data) {
		 		return data;
		 	});
		 	var parameters = {
		 		idOfThisTab: idOfThisTab,
		 		installFolder: vsUtils.getInstallFolder()
		 	};
		 	return actionBar(parameters);
		 },	
		/*
		 * Depending on what the user sees, the action bar will be static at the top of the page,
		 * or fixed on the left, when he scrolls down.
		 */
		 makeActionBarMoveable : function(idOfThisTab) {
		 	var execFunction = function execFunction() {
		 		var top_offset = jQuery('#action-bar-container' + idOfThisTab).offset().top;
		 		var tableHeight = jQuery('#visualscience-user_list-result-' + idOfThisTab).height();
		 		var actionBarHeight = jQuery('#actionBar' + idOfThisTab).height();
		 		if (tableHeight > actionBarHeight) {
		 			jQuery('#action-bar-container' + idOfThisTab).height(tableHeight);
		 		}
		 		var el = jQuery('#actionBar' + idOfThisTab);
		 		jQuery(window).bind('scroll', function() {
		 			var scroll_top = jQuery(window).scrollTop();
		 			var threshold = 100;
		 			//a threshold so the bar does not stick to the top
		 			var tabHeight = jQuery('#visualscience-search-tab-content-' + idOfThisTab).height();
		 			if (scroll_top + threshold + actionBarHeight > top_offset + tableHeight && tabHeight > 350) {
		 				el.css('top', tableHeight - actionBarHeight);
		 			} else if (scroll_top > top_offset - threshold) {
		 				el.css('top', scroll_top - top_offset + threshold);
		 			} else {
		 				el.css('top', '');
		 			}
		 		});
		 	};
		 	
		 	setTimeout(execFunction, 1);
		 },
		/*
		 * This function gets every selected user from the user-list of results.
		 * It returns an array with the full name of each users.
		 */
		 getSelectedUsersFromSearchTable : function(idOfTheTab) {
		 	var usersId, completeNamesArray, iter, user;
		 	completeNamesArray = [];
		 	usersId = vsDatabase.getSelectedUsers();
		 	for (iter=0; iter < usersId.length; iter++) {
		 		user = vsUserlist.getUserFromId(usersId[iter]);
		 		completeNamesArray.push(user.first + ' ' + user.last);
		 	}

		 	return completeNamesArray;
		 },
		/*
		 * This function gets every selected user's email from the user-list of results.
		 * It returns an array with the email of each users.
		 */
		 getSelectedUsersEmailFromSearchTable : function(idOfTheTab) {
		 	var usersId, emailsArray, iter, user;
		 	emailsArray = [];
		 	usersId = vsDatabase.getSelectedUsers();
		 	if (!(vsUserlist.getUserFromId(0).mail)) {
		 		vsInterface.dialog(vsText.emailNotEnabled);
		 		return false;
		 	}
		 	for (iter=0; iter < usersId.length; iter++) {
		 		user = vsUserlist.getUserFromId(usersId[iter]);
		 		emailsArray.push(user.mail);
		 	}

		 	return emailsArray;
		 },

		/*
		 * Creates the table of users, which can be sorted.
		 */
		 createTableUserList : function(searchObject, idOfThisTab) {
		 	var parameters = {
		 		header: searchObject.fields,
		 		tabId: idOfThisTab,
		 		users: searchObject.users,
		 		nbEntries: searchObject.limit,
		 		displayOptions: NumberUsersPerPage > vsSearch.nbUsersHideOptions ? false: true,
		 		showHowMany: NumberUsersPerPage > searchObject.users.length ? searchObject.users.length : NumberUsersPerPage
		 	};
		 	var divFinalContent = getHTMLSearchTable(parameters);
		 	return divFinalContent;
		 },


		 showMoreUsers: function(table, from, button) {
		 	var tbody, nbRows, users, user, i, j, row, cell, actionbarContainer;
		 	users = vsUserlist.getCurrentUsersFrom(from, NumberUsersPerPage);
		 	table = document.getElementById(table)
		 	tbody = table.getElementsByTagName('tbody')[0];
		 	for (i=0; i < users.length; i++) {
		 		user = users[i];
		 		row = tbody.insertRow(from+i);
		 		cell = '<td><div class="form-item form-type-checkbox form-item-list-' + user.id + '"><input type="checkbox" name="list[' + user.id + ']" value="' + user.id + '" class="form-checkbox" onClick="vsSearch.selectThisUser(' + user.id + ', this);" /></div></td>';
		 		j=0;
		 		for (j in user.fields) {
		 			cell += '<td>' + user.fields[j] + '</td>';
		 		}
		 		row.className += (user.type + ' clickable clickToSelect');
		 		row.setAttribute('onclick', 'vsSearch.selectThisUser(' + (user.id) + ', this); return false;');
		 		row.innerHTML = cell;
		 	}
		 	button.setAttribute('onclick', 'vsSearch.showMoreUsers(\'' + table.id +'\', ' + (from + NumberUsersPerPage) + ', this); return false;');
		 	vsSearch.makeActionBarMoveable(0);
		 	vsSearch.updateActionBar();
		 },

		 updateActionBar: function() {
		 	document.getElementById('action-bar-selected').innerText = vsDatabase.getSelectedUsers().length;
		 	document.getElementById('action-bar-displayed').innerText = document.getElementById('visualscience-user_list-result-0').getElementsByTagName('tbody')[0].getElementsByTagName("tr").length;
		 },

		/*
		 * This function creates the visibility options for the user list search.
		 * firstly it takes every th field from the header table, and generates the checkbox witht these labels.
		 * On the checkbox there is a function that toggles the visibility of the wanted element.
		 */
		 getTableUserListOptions : function(fields, idOfThisTab) {
		 	var divOptions = '<fieldset class="collapsible form-wrapper" id="edit-fields"><legend><span class="fieldset-legend"><a onClick="jQuery(\'#edit-fields > .fieldset-wrapper\').slideToggle();">' + vsText.optionsToShow + '</a></span></legend><div class="fieldset-wrapper" style="display:none;"><div style="max-height: 300px; overflow: auto">';
		 	jQuery.each(fields, function(i, el) {
		 		el = el.replace(/<(?:.|\n)*?>/gm, '');
		 		if (el != '') {
		 			divOptions += '<div class="form-item form-type-checkbox form-item-user-data-name" style="width:50%; display:inline-block;"><label for="checkbox-visibility-' + el + idOfThisTab + '" class="option"><input type="checkbox" onClick="vsSearch.toggleColNbFromTable(\'visualscience-user_list-result-' + idOfThisTab + '\',' + (i + 1) + ');" checked="checked" class="form-checkbox" name="checkbox-visibility-' + el + idOfThisTab + '" id="checkbox-visibility-' + el + idOfThisTab + '" /> ' + el + ' </label></div>';
		 		}
		 	});
		 	divOptions += '</div></div></fieldset>';
		 	return divOptions;
		 },
		/*
		 * This function selects all checkboxes once you click on the top
		 * checkbox of a user-list search table. It firstly checks if the
		 * top box is checked or not, and then apply the state to all the boxes.
		 */
		 selectAllBoxes : function(idOfThisTab, clickTarget) {
		 	var master, state, lines;
		 	if (clickTarget.nodeName === 'INPUT') {
		 		clickTarget.checked = !clickTarget.checked;
		 		return false;
		 	}
		 	master = document.getElementById('user-list_master_checkbox-' + idOfThisTab);
		 	master.checked = !master.checked;
		 	state = master.checked;
		 	lines = document.getElementById('visualscience-user_list-result-'+idOfThisTab).getElementsByTagName('tr');
		 	for (var i=1; i < lines.length; i++) {
		 		vsSearch.selectThisUser((i-1), lines[i], state);
		 	}
		 },
		/*
		 * toggles the visibility of a column in a table.
		 * tableId is the id of the table and colNb the number (from 0)  of the col to toggle.
		 */
		 toggleColNbFromTable : function(tableId, colNb) {
		 	jQuery('#' + tableId + ' td:nth-child(' + (colNb + 2) + ')').toggle();
		 	jQuery('#' + tableId + ' th:nth-child(' + (colNb + 2) + ')').toggle();
		 },
		};

	})();
