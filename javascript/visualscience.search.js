var vsSearch = (function() {

	return {
		makeRowsSelectable : function() {
			jQuery('.clickToSelect').click(function() {
				var cur = jQuery(this).children().children().children();
				var newState = !(cur.attr('checked'));
				cur.attr('checked', newState);
			});
			jQuery('.clickToSelect').children().children().children().click(function() {
				var newState = !(jQuery(this).attr('checked'));
				jQuery(this).attr('checked', newState);
			});
		},

		/*
		 * This function creates the whole tab, which will be displayed to the user.
		 * It contains :
		 * -the action bar, which is the bar with every buttons(Message, CSV, LS and Conference)
		 * -The table with the result and its options.(Sort table, hide fields, etc...)
		 */
		 createUserSearchResult : function(searchObject, idOfThisTab) {
		 	var actionBar = vsSearch.createActionBar(idOfThisTab);
		 	var tableUserList = vsSearch.createTableUserList(searchObject, idOfThisTab);
		 	return '<h3>User List</h3>' + actionBar + tableUserList;
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
		 },
		/*
		 * This function gets every selected user from the user-list of results.
		 * It returns an array with the full name of each users.
		 */
		 getSelectedUsersFromSearchTable : function(idOfTheTab) {
		 	var tableId = 'visualscience-user_list-result-' + idOfTheTab;
		 	var completeNamesArray = new Array();
		 	if (!isNaN(parseInt(vsUtils.getThWithContent(tableId, 'First Name')))) {
		 		var firstFieldNumber = vsUtils.getThWithContent(tableId, 'First Name');
		 		var secondFieldNumber = vsUtils.getThWithContent(tableId, 'Last Name');
		 		jQuery('#' + tableId + ' > tbody > tr').each(function(index) {
		 			index++;
					//That's because index will go from 0(no nth-child) to n-1, missing n(interesting)
					if (jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') input').is(':checked')) {
						var first = jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') > td:nth-child(' + firstFieldNumber + ')').text();
						var last = jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') > td:nth-child(' + secondFieldNumber + ')').text();
						completeNamesArray.push(first + ' ' + last);
					}
				});
		 	} else {
		 		var firstFieldNumber = vsUtils.getThWithContent(tableId, 'name');
		 		jQuery('#' + tableId + ' > tbody > tr').each(function(index) {
		 			index++;
					//That's because index will go from 0(no nth-child) to n-1, missing n(interesting)
					if (jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') input').is(':checked')) {
						completeNamesArray.push(jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') > td:nth-child(' + firstFieldNumber + ')').text());
						//To delete when comments enabled
					}
				});
		 	}
		 	return completeNamesArray;
		 },
		/*
		 * This function gets every selected user's email from the user-list of results.
		 * It returns an array with the full name of each users.
		 */
		 getSelectedUsersEmailFromSearchTable : function(idOfTheTab) {
		 	var tableId = 'visualscience-user_list-result-' + idOfTheTab;
		 	var firstFieldNumber = vsUtils.getThWithContent(tableId, 'mail');
		 	var emailArray = new Array();
		 	jQuery('#' + tableId + ' > tbody > tr').each(function(index) {
		 		index++;
				//That's because index will go from 0(no nth-child) to n-1, missing n (interesting)
				if (jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') input').is(':checked')) {
					emailArray.push(jQuery('#' + tableId + ' > tbody > tr:nth-child(' + index + ') > td:nth-child(' + firstFieldNumber + ')').text());
				}
			});
		 	return emailArray;
		 },
		/*
		 * Creates the table of users, which can be sorted.
		 */

		 createTableUserList : function(searchObject, idOfThisTab) {
		 	var searchTable = vsInterface.getView('tableUserSearch.html');
		 	var parameters = {
		 		header: ['name','email','field'],
		 		tabId: idOfThisTab,
		 		users: [
		 		{type: 'odd', id: 1, fields: ['asdf','asdf@asdf', 'qwer']},
		 		{type: 'even', id: 2, fields: ['asdf1','asdf@asdf1', 'qwer1']},
		 		{type: 'odd', id: 3, fields: ['asdf2', 'asdf@asdf2', 'qwer2']}
		 		]
		 	};
		 	var divFinalContent = searchTable(parameters);
		 	console.log(divFinalContent);
		 	var nbColsInTable = 0;
		 	divFinalContent += vsSearch.getTableUserListOptions('user_list-list-0', idOfThisTab, nbColsInTable);
		 	return divFinalContent;
		 },
		/*
		 * This function creates the visibility options for the user list search.
		 * firstly it takes every th field from the header table, and generates the checkbox witht these labels.
		 * On the checkbox there is a function that toggles the visibility of the wanted element.
		 */
		 getTableUserListOptions : function(tableId, idOfThisTab, nbColsInTable) {
		 	var divOptions = '<fieldset class="collapsible form-wrapper" id="edit-fields"><legend><span class="fieldset-legend"><a onClick="jQuery(\'#edit-fields > .fieldset-wrapper\').slideToggle();">Choose fields to show</a></span></legend><div class="fieldset-wrapper" style="display:none;"><div style="max-height: 300px; overflow: auto">';
		 	jQuery('#' + tableId + ' > thead > tr > th').each(function(i) {
		 		if (jQuery(this).text() != '') {
		 			divOptions += '<div class="form-item form-type-checkbox form-item-user-data-name" style="width:50%; display:inline-block;"><label for="checkbox-visibility-' + jQuery(this).text() + idOfThisTab + '" class="option"><input type="checkbox" onClick="vsSearch.toggleColNbFromTable(\'visualscience-user_list-result-' + idOfThisTab + '\',' + i + ');" checked="checked" class="form-checkbox" name="checkbox-visibility-' + jQuery(this).text() + idOfThisTab + '" id="checkbox-visibility-' + jQuery(this).text() + idOfThisTab + '" /> ' + jQuery(this).text() + ' </label></div>';
		 		}
		 	});
		 	divOptions += '</div></div></fieldset>';
		 	return divOptions;
		 },
		/*
		 * This creates the thead of the user list search table.
		 * It takes every thead from the hidden table and generates the thead witht that.
		 */
		 createTableUserListHead : function(idOfThisTab, dialogNumber) {
		 	var header = '<div style="display:inline-block;max-width:80%;overflow-x:scroll;"><table id="visualscience-user_list-result-' + idOfThisTab + '" class="tablesorter sticky-enabled table-select-processed tableheader-processed sticky-table"><thead><tr>';
		 	jQuery('#user_list-list-' + dialogNumber + ' > thead > tr > th').each(function() {
				//header += '<th style="min-width:35px;">'+jQuery(this).html()+'</th>';
				if (jQuery(this).html().indexOf('form-checkbox') != -1) {
					header += '<th style="min-width:35px;" onClick="vsSearch.selectAllBoxes(' + idOfThisTab + ')"><input type="checkbox" id="user-list_master_checkbox-' + idOfThisTab + '" class="form-checkbox" title="Select all rows in this table" onClick="vsSearch.selectAllBoxes(' + idOfThisTab + ')" /></th>';
				} else {
					header += '<th style="min-width:35px;">' + jQuery(this).html() + '</th>';
				}
			});
		 	header += '</tr></thead><tbody><tr class="odd clickable clickToSelect" >';
		 	return header;
		 },
		/*
		 * This function selects all checkboxes once you click on the top
		 * checkbox of a user-list search table. It firstly checks if the
		 * top box is checked or not, and then apply the state to all the boxes.
		 */
		 selectAllBoxes : function(idOfThisTab) {
		 	var newState;
		 	if (jQuery('#user-list_master_checkbox-' + idOfThisTab).attr('checked') == true) {
		 		newState = false;
		 	} else {
		 		newState = true;
		 	}
		 	jQuery('#user-list_master_checkbox-' + idOfThisTab).attr('checked', newState);
		 	jQuery('#visualscience-user_list-result-' + idOfThisTab + ' input[id|="user_list-list"]').each(function() {
		 		jQuery(this).attr('checked', newState);
		 	});
		 },
		/*
		 * toggles the visibility of a column in a table.
		 * tableId is the id of the table and colNb the number (from 0)  of the col to toggle.
		 */
		 toggleColNbFromTable : function(tableId, colNb) {
		 	jQuery('#' + tableId + ' td:nth-child(' + (colNb + 1) + ')').toggle();
		 	jQuery('#' + tableId + ' th:nth-child(' + (colNb + 1) + ')').toggle();
		 },
		};

	})();
