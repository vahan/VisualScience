var vsUserlist = (function() {
	var mergeUsersSelections, findBestLogicalOperator, getUsersFor, sendSearchToSave, startAutoComplete, searchDB, isInterfaceCreated, maxAutocompleteEntries, delayBeforeTableCreation, getSearchFields, getSearchResult, formatFieldTitle;

	maxAutocompleteEntries = 5;
	delayBeforeTableCreation = 1000;

	isInterfaceCreated = false;

	sendSearchToSave = function (search) {
		console.log('Implement search saving for:' + search);
	};

	jQuery(document).ready(function() {
		//vsSearchDB is defined by the backend.
		searchDB = vsSearchDB;
		startAutoComplete();
		//Timeout so that the views have time to load.
		setTimeout(function() {
			vsUserlist.search();
		}, delayBeforeTableCreation);
	});

	startAutoComplete = function (inputId, source) {
		source = source || vsUserlist.getUsersNamesFromDB();
		inputId = inputId || 'visualscience-search-bar';
		jQuery('#'+inputId).autocomplete({
			source: function (request, response) {
				var results = jQuery.ui.autocomplete.filter(source, request.term);
				response(results.slice(0, maxAutocompleteEntries));
				return response;
			},
			change: function (event, ui) {
				vsUserlist.search();
			}
		});
	};

	// type = 0 ->full
	getSearchResult = function (search, type) {
		type = type || 1;
		var result = {};
		result.fields = getSearchFields(type);
		result.fields = tagMarkNameFields(result.fields);
		result.users = [];
		result.searchQuery = search;
		var fieldsInTable = getSearchFields(type);
		var lastIndex = fieldsInTable.indexOf(searchDB.config.last);
		var firstIndex = fieldsInTable.indexOf(searchDB.config.first);
		if (lastIndex != -1) {
			fieldsInTable[lastIndex] = 'last';
		}
		if (firstIndex != -1) {
			fieldsInTable[firstIndex] = 'first';
		}
		result.users = getUserFor(search.toLowerCase(), fieldsInTable);
		// Old implementation of Search: 
		// var id=0;
		// searchKeys = search.split(' ');
		// for (var user in searchDB.users) {
		// 	var singleUser = searchDB.users[user];
		// 	var isIn = 0;
		// 	for (var searchKey in searchKeys) {
		// 		search = searchKeys[searchKey];
		// 		for (var field in fieldsInTable) {
		// 			if (isIn != 1 && singleUser[fieldsInTable[field]].toLowerCase().indexOf(search.toLowerCase()) !== -1) {

		// 				var temp = {
		// 					id: id,
		// 					type: id%2 == 0 ? 'even':'odd'
		// 				};
		// 				temp.fields = [];
		// 				for (var innerField in fieldsInTable) {
		// 					temp.fields.push(singleUser[fieldsInTable[innerField]]);
		// 				}
		// 				result.users.push(temp);
		// 				isIn = 1;
		// 				id++;
		// 			}
		// 		}
		// 	}
		// }
		return result;
	}

	// We assume that search is always in lower case form.
	getUsersFor = function (search, fields) {
		var logical = findBestLogicalOperator(search);
		if (logical == -1) {
			return false;
		}
		else {
			var leftSearch = search.substring(0, search.indexOf(logical));
			var rightSearch = search.substring(search.indexOf(logical+logical.length+1));
			var leftResult = getUsersFor(leftSearch, fields);
			var rightResult = getUsersFor(rightSearch, fields);
			return mergeUsersSelections(leftResult, rightResult, logical);
		}
	};

	mergeUsersSelections = function (left, right, logical) {
		var merged = [];
		var leftFields = [];
		var rightFields = [];
		var mergedFields = [];
		for (var entry in left) {
			leftFields.push(left[entry].fields);
		}
		for (var entry in right) {
			rightFields.push(right[entry].fields);
		}

		if (logical == 'and') {
			for (var entry in left) {
				if (jQuery.inArray(left[entry].fields, rightFields) != -1 && jQuery.inArray(left[entry].fields, mergedFields) == -1) {
					merged.push(left[entry]);
					mergedFields.push(left[entry].fields);
				}
			}
		}
		else if (logical == 'or') {
			merged = left;
			mergedFields = leftFields;
			for (var entry in right) {
				if (jQuery.inArray(right[entry].fields, mergedFields) == -1) {
					merged.push(right[entry]);
					mergedFields.push(right[entry].fields);
				}
			}
		}
		return merged;
	};

	findBestLogicalOperator = function (search) {
		var orderOperations = ['and', 'or'];
		for (var operator in orderOperations) {
			if (search.indexOf(orderOperations[operator]) != -1) {
				return orderOperations[operator];
			}
		}
		return -1;
	}

	getSearchFields = function (type) {
		var result = [];
		if (type != 0) {
			for (var field in searchDB.config.fields) {
				if (searchDB.config.fields[field].mini == 1) {
					result.push(searchDB.config.fields[field].name);
				}
			}
		}
		else {
			for (var field in searchDB.config.fields) {
				result.push(searchDB.config.fields[field].name)
			}
		}
		return result;
	};

	tagMarkNameFields = function (fields) {
		var first = searchDB.config.first;
		var last = searchDB.config.last;
		var formattedFields = new Array();
		for (var field in fields) {
			var formatted = formatFieldTitle(fields[field]);
			if (fields[field] == first) {
				formatted = '<span class="visualscience-search-field-first">'+formatted+'</span>';
			}
			else if (fields[field] == last) {
				formatted = '<span class="visualscience-search-field-last">'+formatted+'</span>';
			}
			formattedFields.push(formatted);

		}
		return formattedFields;
	};

	formatFieldTitle = function (field) {
		field = field.replace(/_/gi, " ");
		return field.replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	};


	return {
		search: function (type) {
			var search = jQuery('#visualscience-search-bar').val() || '';
			var searchResult = getSearchResult(search, type);
			if (!isInterfaceCreated) {
				vsInterface.openUserListTab(searchResult);
				isInterfaceCreated = true;
			}
			else {
				vsInterface.manageNewSearch(searchResult);
			}
		},

		saveSearch: function () {
			var search = jQuery('#visualscience-search-bar').val();
			vsInterface.getView('saveSearchDialog.html', function(dialogContent) {
				var parameters = {
					search: search
				}
				var content = dialogContent(parameters);
				var button = [{
					text: 'Save',
					click: function () {
						var toSaveSearch = jQuery('#visualscience-save-search').val();
						sendSearchToSave(toSaveSearch);
						vsInterface.closeDialog();
					}
				}];
				vsInterface.dialog(content, 'Save a Search', button, undefined, 'auto');
			});
		},

		getUsersNamesFromDB: function () {
			var names = [];
			var users = searchDB.users;
			for (var user in users) {
				names.push(vsUserlist.getFullName(users[user]));
			}
			return names;
		},

		getFullName: function (user) {
			if (!user.first) {
				return 'anonymous';
			}
			if (!user.last) {
				return user.first;
			}
			return user.first + ' ' + user.last;
		}


	};
})();
