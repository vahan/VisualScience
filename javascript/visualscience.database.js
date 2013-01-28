var vsDatabase = (function() {

	var numberOfPublicationsForLivingScience, firstPublicationForLivingScience, optionsForNDDB, lsDB, lsDBOriginal, db;

	//Constant: The number of publications displayed by default in LS tab
	numberOfPublicationsForLivingScience = 10;

	//Constant: Where to start the display of the LivingScience publications
	firstPublicationForLivingScience = 0;

	//Options for the NDDB database
	optionsForNDDB = {
		tags : {
			'howMany' : numberOfPublicationsForLivingScience,
			'start' : firstPublicationForLivingScience
		}
	};

	return {
		//This is the array containing all the databases result from LivingScience (modified throught time by search, display, etc...)
		lsDB : new Array(),
		//The array containing the original result from LS. (as above, but won't be modified)
		lsDBOriginal : new Array(),
		//variable that contain every new NDDB.(the latest created)
		db : new NDDB(optionsForNDDB),

		getOptionsForNDDB : function() {
			return optionsForNDDB;
		},
		setParametersForLSDB : function(thisTabId) {
			jQuery(lsDB[thisTabId].db).each(function(i) {
				if (lsDB[thisTabId].db[i].authors && lsDB[thisTabId].db[i].authors[0] && lsDB[thisTabId].db[i].authors[0].name) {
					lsDB[thisTabId].db[i].author = lsDB[thisTabId].db[i].authors[0].name;
				} else {
					lsDB[thisTabId].db[i].author = 'Unknown';
					lsDB[thisTabId].db[i].authors = new Array();
					lsDB[thisTabId].db[i].authors[0] = {
						name : 'Unknown'
					}
				}
			});
		},
		searchAndSortNDDB : function(thisTabId) {
			var wordToSearch = jQuery('#search-ls-result-' + thisTabId).val().toLowerCase();
			var howMany = lsDB[thisTabId].resolveTag('howMany');
			var start = lsDB[thisTabId].resolveTag('start')
			var optionsNDDB = {
				tags : {
					'start' : start,
					'howMany' : howMany
				}
			};
			lsDB[thisTabId] = new NDDB(optionsNDDB);
			for (var i = 0; i <= lsDBOriginal[thisTabId].length - 1; i++) {
				var authors = lsDBOriginal[thisTabId].db[i].author && lsDBOriginal[thisTabId].db[i].author.toLowerCase().indexOf(wordToSearch) != -1;
				var title = lsDBOriginal[thisTabId].db[i].title && lsDBOriginal[thisTabId].db[i].title.toLowerCase().indexOf(wordToSearch) != -1;
				var year = lsDBOriginal[thisTabId].db[i].year && lsDBOriginal[thisTabId].db[i].year.toString().toLowerCase().indexOf(wordToSearch) != -1;
				var journal = lsDBOriginal[thisTabId].db[i].journal && lsDBOriginal[thisTabId].db[i].journal.toLowerCase().indexOf(wordToSearch) != -1;

				if (authors || title || year || journal) {
					lsDB[thisTabId].insert(lsDBOriginal[thisTabId].db[i]);
				}
			}

			var wordResult = 'Result';
			if (lsDB[thisTabId].length == 0) {
				actualizeLivingScienceDisplay(lsDB[thisTabId], thisTabId);
				jQuery('#ls-list-' + thisTabId).html('<p align="center"><strong>There is no result for your search.</strong></p>');
			} else if (lsDB[thisTabId].length == 1) {
				actualizeLivingScienceDisplay(lsDB[thisTabId], thisTabId);
			} else {
				actualizeLivingScienceDisplay(lsDB[thisTabId], thisTabId);
				wordResult = 'Results';
			}
			jQuery('#search-ls-nb-result-' + thisTabId).html(lsDB[thisTabId].length + ' ' + wordResult);
		},
		getNbPublicationsOfLSDB : function(idOfDB) {
			return lsDBOriginal[idOfDB].count();
		},

		getListJournalsFromLSDB : function(idOfDB) {
			var journalsAll = lsDBOriginal[idOfDB].fetchArray('journal');
			journalsAll.sort();
			var journals = new Array();
			var html = '<div style="overflow-y:scroll;max-width:250px;max-height:250px;"><ul>';
			jQuery.each(journalsAll, function(i, el) {
				if (jQuery.inArray(el[0], journals) == -1 && el[0] != 'undefined' && el[0] && el[0] != 'NULL') {
					journals.push(el[0]);
					html += '<li>' + journalsAll[i][0] + '</li>';
				}
			});
			html += '</ul></div>';
			var nbJournals = journals.length;
			return '<p><strong>' + nbJournals + ' Journals</strong></p>' + html;
		},
		getListCoauthorsFromLSDB : function(idOfDB) {
			var allAuthors = new Array();
			var authors = new Array();
			authorName = getLSTabName(idOfDB);
			allAuthors.push(authorName);
			allAuthors.push(getInitialLastname(authorName));
			allAuthors.push(getLastNameCommaFirstName(authorName));
			allAuthors.push(authorName + '...');
			allAuthors.push(authorName.substring(0, authorName.length - 3));
			var html = '<div style="overflow-y:scroll;max-width:250px;max-height:250px;"><ul>';
			jQuery.each(lsDBOriginal[idOfDB].db, function(i, el) {
				jQuery.each(el.authors, function(j, element) {
					if (jQuery.inArray(element.name, allAuthors) == -1) {
						allAuthors.push(element.name);
						allAuthors.push(element.name.substring(0, element.name.length - 3));
						allAuthors.push(element.name + '...');
						allAuthors.push(getInitialLastname(element.name));
						allAuthors.push(getLastNameCommaFirstName(element.name));
						authors.push(element.name);
					}
				});
			});
			authors.sort();
			jQuery.each(authors, function(i, el) {
				html += '<li><a href="#" onclick="createTabLivingScience(undefined, [\'' + el + '\'])">' + el + '</a></li>';
			});
			html += '</ul></div>';
			var nbOfCoauthors = authors.length;

			return '<p><strong>' + nbOfCoauthors + ' Co-authors</strong></p>' + html;
		},
		getPeriodActivityFromLSDB : function(idOfDB) {
			var min = lsDBOriginal[idOfDB].min('year');
			var max = lsDBOriginal[idOfDB].max('year');
			return min + ' - ' + max;
		},
		getFamousPublicationFromLSDB : function(idOfDB) {
			var html = '';
			for ( i = 0; i < 3; i++) {
				html += '<p style="min-width:250px;"><a href="' + lsDBOriginal[idOfDB].db[i].url + '" target="_blank">' + lsDBOriginal[idOfDB].db[i].title + '</a></p>';
			}
			return html;
		},
		/*
		 * This function is called when someone selects how to sort the database.
		 * thisTabId is the id of the tab where the database should be sorted, which is also the
		 * index of the database in lsDB.
		 */
		orderLSResultDatabase : function(thisTabId) {
			var orderSetting = jQuery('#sorting-ls-result-' + thisTabId).val();
			switch (orderSetting) {
				case 'increasing':
					lsDB[thisTabId].sort('year');
					break;
				case 'decreasing':
					lsDB[thisTabId].sort('year');
					lsDB[thisTabId].reverse();
					break;
				case 'authors':
					lsDB[thisTabId].sort('author');
					break;
				case 'random':
					lsDB[thisTabId].shuffle();
					break;
				case 'own':
					lsDB[thisTabId].sort('livingscienceID');
					break;
				default:
					lsDB[thisTabId].sort(orderSetting);
					break;
			}
			actualizeLivingScienceDisplay(lsDB[thisTabId], thisTabId);
		},
		mergeLSDB : function(idFirstDB, idSecondDB) {
			var newDB = new NDDB(optionsForNDDB);
			var length = lsDBOriginal[idFirstDB].length > lsDBOriginal[idSecondDB].length ? lsDBOriginal[idFirstDB].length : lsDBOriginal[idSecondDB].length;
			var biggerDB = lsDBOriginal[idFirstDB].length > lsDBOriginal[idSecondDB].length ? idFirstDB : idSecondDB;
			for (var i = 0; i < length; i++) {
				newDB.insert(lsDBOriginal[idFirstDB].db[i]);
				newDB.insert(lsDBOriginal[idSecondDB].db[i]);
			}
			for (var i = length; i < lsDBOriginal[biggerDB].length; i++) {
				newDB.insert(lsDBOriginal[biggerDB].db[i]);
			}
			return newDB;
		}
	};

})();
