var vsLscomparison = (function() {
	var createComparisonInterface, createComparisonStatisticTable, getComparisonTableStatistics, getSprikiColor, createComparisonSpriki, createComparisonPublication;

	createComparisonInterface = function(idOfThisTab) {
		jQuery('#livingscience-tab-' + idOfThisTab).html('<div id="ls-compare-statistics-' + idOfThisTab + '" style="width:100%;"></div><div id="ls-compare-spriki-' + idOfThisTab + '"></div><div id="ls-compare-pubs-' + idOfThisTab + '"></div>');
	};
	createComparisonStatisticTable = function(idOfThisTab, idFirstDB, idSecondDB) {
		var objectOfStatistics = {
			//Databases to work out
			db : [idFirstDB, idSecondDB],
			//Fields of the table. 0:fieldname, 1:function to fill field.
			fields : [['N° Publications', vsDatabase.getNbPublicationsOfLSDB], ['Journals', vsDatabase.getListJournalsFromLSDB], ['Co-Authors', vsDatabase.getListCoauthorsFromLSDB], ['Period of activity', vsDatabase.getPeriodActivityFromLSDB], ['Top 3 Publications', vsDatabase.getFamousPublicationFromLSDB]]
		};

		var finalTable = getComparisonTableStatistics(idOfThisTab, objectOfStatistics);
		jQuery('#ls-compare-statistics-' + idOfThisTab).html('<h3>Statistics</h3>' + finalTable);
		vsUtils.makeTableSortable('ls-compare-statistics-table-' + idOfThisTab);
	};
	getComparisonTableStatistics = function(idOfTab, object) {
		var table = '<table id="ls-compare-statistics-table-' + idOfTab + '" style="display:inline-block;max-width:100%;overflow-x:scroll;" class="tablesorter sticky-enabled table-select-processed tableheader-processed sticky-table"><thead><tr><th></th>';

		jQuery.each(object.fields, function(i) {
			table += '<th>' + object.fields[i][0] + '</th>';
		});

		table += '</tr></thead><tbody>';

		jQuery.each(object.db, function(i) {
			table += '<tr><td style="color:' + getSprikiColor(i) + ';"><strong>' + vsLivingscience.getLSTabName(object.db[i]) + '</strong></td>';
			jQuery.each(object.fields, function(j) {
				table += '<td>' + object.fields[j][1](object.db[i]) + '</td>';
			});
			table += '</tr>'
		});

		table += '</tbody></table>';
		return table;
	};
	getSprikiColor = function(idColor) {
		switch (idColor) {
			case 0:
			return '#0000C8';

			case 1:
			return '#FF9600';

			case 2:
			return '#1C9500';

			case 3:
			return '#F7FA00';

			case 4:
			return '#A30086';

			default:
			return '';
		}
	};

	createComparisonSpriki = function(idOfThisTab, firstDbId, secondDbId) {
		jQuery('#ls-compare-spriki-' + idOfThisTab).html('<h3>Relations</h3><center><div id="ls-compare-spriki-relations-' + idOfThisTab + '" style="display:inline-block;text-align:center;width:100%;height:500px;"></div></center>');
		var mergedDB = vsDatabase.mergeLSDB(firstDbId, secondDbId);
		vsLivingscience.generateRelationsDiv(mergedDB, 0, mergedDB.count(), 'ls-compare-spriki-relations-' + idOfThisTab);
		vsDatabase.lsDBOriginal[idOfThisTab] = mergedDB;
	};

	createComparisonPublication = function(idOfThisTab, idFirstDB, idSecondDB) {
		jQuery('#ls-compare-pubs-' + idOfThisTab).html('<h3>Publications</h3><div id="ls-compare-left-pubs-' + idOfThisTab + '" style="display:inline-block;width:48%;"></div><div id="ls-compare-right-pubs-' + idOfThisTab + '" style="display:inline-block;width:48%;float:right;"></div>');
		vsLivingscience.generatePublicationsDiv(vsDatabase.lsDBOriginal[idFirstDB], vsDatabase.getFirstPublicationForLivingScience(), vsDatabase.getNumberOfPublicationsForLivingScience(), 'ls-compare-left-pubs-' + idOfThisTab);
		vsLivingscience.generatePublicationsDiv(vsDatabase.lsDBOriginal[idSecondDB], vsDatabase.getFirstPublicationForLivingScience(), vsDatabase.getNumberOfPublicationsForLivingScience(), 'ls-compare-right-pubs-' + idOfThisTab);
	};

	return {
		/*
		 * This function creates a new tab, where two LS search tabs are compared.
		 */
		 compareLSTabsTogether : function(thisTabId) {
		 	var selectedTabId = parseInt(jQuery('#comparison-ls-result-' + thisTabId).val());
		 	var title = 'Comparison Interface';
		 	var idOfThisTab = vsInterface.getTabId();
		 	vsInterface.addTab('<img src="' + vsUtils.getInstallFolder() + 'images/earth.png" width="13px" alt="image for LivingScience" /> ', title, '#livingscience-tab-' + idOfThisTab);
		 	createComparisonInterface(idOfThisTab);
		 	createComparisonStatisticTable(idOfThisTab, thisTabId, selectedTabId);
		 	createComparisonSpriki(idOfThisTab, thisTabId, selectedTabId);
		 	createComparisonPublication(idOfThisTab, thisTabId, selectedTabId);
		 },
		/*
		 * This function lists the others tabs as an option to compare with. It is called
		 * when the user clicks on the scrollable select. It creates the <option> tags in the select
		 * tags.
		 */
		 getListOfTabsForLSComparison : function(thisTabId) {
		 	var currentTabs = vsLscomparison.getLSTabs(thisTabId);
		 	var newSelectList = '<option value="nothing">Select a tab...</option>';
		 	jQuery(currentTabs).each(function(i) {
		 		newSelectList += '<option value="' + currentTabs[i][1] + '">' + currentTabs[i][0] + '</option>';
		 	});
		 	jQuery('#comparison-ls-result-' + thisTabId).html(newSelectList);
		 },
		/*
		 * This function returns all the LS that are actually opened.
		 * If we want not to have a tab in it, the optional parameter
		 * tabNotWanted is the number of the tab we don't want in the final array.
		 */
		 getLSTabs : function(tabNotWanted) {
		 	var tabs = new Array();
		 	var oldI = 0;
		 	for (var i = 0; i <= vsDatabase.lsDB.length; i++) {
		 		if (vsDatabase.lsDB[i] != undefined && i != tabNotWanted) {
		 			tabs[oldI] = new Array();
		 			var tabName = vsLivingscience.getLSTabName(i);
		 			tabs[oldI][0] = tabName;
		 			tabs[oldI][1] = i;
		 			oldI++;
		 		}
		 	}
		 	return tabs;
		 }
		};

	})();
