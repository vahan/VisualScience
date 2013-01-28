var vsInterface = (function() {

	var tabbedInterfaceExists, tabbedInterface, tabId;

	//This variable checks if the whole tabbed interface has been created yet.
	tabbedInterfaceExists = false;

	//Variable who contains the name of the actual tabbed interface.
	tabbedInterface = 'tabbed-interface';

	//Variable to differentiate each tab from each other
	tabId = 0;

	return {

		getTabId : function() {
			return tabId;
		},

		setTabId : function(newTabId) {
			tabId = newTabId;
		},

		/*
		 * This function is called when the user launches the search from the bar.
		 * It will first check if the tabbed interface is loaded and load it if not.
		 * Then it adds a new tab to the interface, with the result of the search.
		 */
		openUserListTab : function(dialogNumber_) {
			dialogNumber = dialogNumber_;
			setTimeout(function() {//(Bad style) The tab creation should be delayed, so that the ajax results can be put in the display:none; div(#visualscience-user_list-dialogNumber)
				createTabbedInterface(dialogNumber);
				var title = jQuery("#visualscience-search-query-" + dialogNumber).val();
				title = (title == '' ? 'All Users' : title);
				var idOfThisTab = tabId;
				addTab('<img src="' + installFolder + '../images/search.png" width="13px" alt="image for visualscience search" /> ', title, '#visualscience-search-tab-content-' + idOfThisTab);
				//Insert the table result in a new div
				var content = createUserSearchResult(dialogNumber, idOfThisTab);
				jQuery('#visualscience-search-tab-content-' + idOfThisTab).html(content).css('display', 'block');
				makeActionBarMoveable(idOfThisTab);
				makeTableSortable('visualscience-user_list-result-' + idOfThisTab);
				makeRowsSelectable();
			}, 1);
		},
		/*
		 * This function adds a new tab to the tabbed interface.
		 * The url parameter should be a local url and it can contain a fragment identifier(#something)
		 * The name parameter is the name you want the tab to have.
		 */
		addTab : function(icon, name, url) {
			var nameMaxLength = 25;
			if (name.length > nameMaxLength) {
				name = name.substring(0, nameMaxLength) + '... ';
			}
			tabId++;
			var nbTabs = jQuery('#' + tabbedInterface).tabs('length');
			jQuery('#' + tabbedInterface).tabs('add', url, icon + name + '<span class="close-tab-cross" onClick="closeTab(\'' + url + '\')">X</span>');
			jQuery('#' + tabbedInterface).tabs('select', nbTabs);
			jQuery('#' + tabbedInterface + ' > .ui-tabs-panel').css({
				'display' : 'inline-block',
				'width' : '95.4%',
				'min-height' : '300px'
			});
		},
		/*
		 * This function closes the tab indicated by tabIndex.
		 * TabIndex can either be the zero-position of the tab, or the href parameter.
		 */
		closeTab : function(tabIndex) {
			jQuery('#' + tabbedInterface).tabs('remove', tabIndex);
			//Now we want to delete the database in the array of NDDB
			var tabNb = parseInt(tabIndex.charAt(tabIndex.length - 1));
			lsDB[tabNb] = undefined;
		},

		/*
		 * This function creates a tabbed-interface, out of the variable tabbedInterface.
		 * Firstly, it however checks if the interface does not already exists, because otherwise this could create bugs.
		 */
		createTabbedInterface : function(dialogNumber) {
			if (!tabbedInterfaceExists) {
				tabbedInterfaceExists = true;
				jQuery('#container-' + dialogNumber + '-0').append('<div id="' + tabbedInterface + '"><ul id="tab-list"></ul></div>');
				jQuery('#' + tabbedInterface).tabs({
					cache : true
				});
			}
		}
	};

})();
