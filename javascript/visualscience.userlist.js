var vsUserlist = (function() {
	var sendSearchToSave, startAutoComplete, searchDB, isInterfaceCreated, maxAutocompleteEntries, delayBeforeTableCreation, getSearchFields, getSearchResult;

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
		var id=0;
		searchKeys = search.split(' ');
		for (var user in searchDB.users) {
			var singleUser = searchDB.users[user];
			var isIn = 0;
			for (var searchKey in searchKeys) {
				search = searchKeys[searchKey];
				for (var field in fieldsInTable) {
					if (isIn != 1 && singleUser[fieldsInTable[field]].toLowerCase().indexOf(search.toLowerCase()) !== -1) {
						id++;
						var temp = {
							id: id,
							type: id%2 == 0 ? 'even':'odd'
						};
						temp.fields = [];
						for (var innerField in fieldsInTable) {
							temp.fields.push(singleUser[fieldsInTable[innerField]]);
						}
						result.users.push(temp);
						isIn = 1;
					}
				}
			}
		}
		return result;
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
	}

	tagMarkNameFields = function (fields) {
		var first = searchDB.config.first;
		var last = searchDB.config.last;
		for (var field in fields) {
			if (fields[field] == first) {
				fields[field] = '<span class="visualscience-search-field-first">'+fields[field]+'</span>';
			}
			else if (fields[field] == last) {
				fields[field] = '<span class="visualscience-search-field-last">'+fields[field]+'</span>';
			}

		}
		return fields;
	}


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
