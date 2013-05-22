var vsUserlist = (function () {
	"use strict";
	var createFullNDDB, searchNDDB, maxNumberOfTableEntries, getUsersFor, mergeUsersSelections, findBestLogicalOperator, getLogicalCondition, sendSearchToSave, startAutoComplete, searchDB, isInterfaceCreated, maxAutocompleteEntries, delayBeforeTableCreation, getSearchFields, getSearchResult, formatFieldTitle;

	maxAutocompleteEntries = 5;
	delayBeforeTableCreation = 1000;
	maxNumberOfTableEntries = 150;

	isInterfaceCreated = false;

	sendSearchToSave = function (search) {
		console.log('Implement search saving for:' + search);
	};

	jQuery(document).ready(function () {
		startAutoComplete();
		if (store('vsSearchDB')) {
			searchDB = store('vsSearchDB');
		}
		else {
			vsUserlist.reloadUserDatabase();
		}
		//startAutoComplete();
		//Timeout so that the views have time to load.
		setTimeout(function () {
			vsUserlist.search();
		}, delayBeforeTableCreation);
	});

	/*
	You only need full table, because when fetching you pass the array of fields you are interested in.
	*/
	createFullNDDB = function () {
		searchNDDB = new NDDB();
		for (var user in searchDB.users) {
			user = searchDB.users[user];
			user.selected = false;
			searchNDDB.insert(user);
		}
	};



	getSearchDataFromServer = function (from) {
		jQuery.get(vsUtils.getRootFolder() + 'visualscience/users', {
			userId: from 
		}, function(data) {
			var response = jQuery.parseJSON(data);
			jQuery('#vs-db-loading').progressbar({
				value: (response.to/response.total)*100
			});
			if (!response.finished) {
				getSearchDataFromServer(response.to);
			}
			else {
				vsInterface.closeDialog();
				searchDB.config = response.config;
				createFullNDDB();
				vsUserlist.search();
				store('vsSearchDB', searchDB);
			}
			for (var user in response.users) {
				searchDB.users.push(response.users[user]);
			}
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
		result.users = getUsersFor(search.toLowerCase(), fieldsInTable);
		result.limit = maxNumberOfTableEntries;
		return result;
	};

	getUsersFor = function (search, fields) {
		var filtered = searchNDDB.filter(getFilterFunction(search.toLowerCase()));
		var result = filtered.fetch();
		for (var el in result) {
			var temp = {
				id: el,
				type: el%2 == 0 ? 'even':'odd'
			};
			temp.fields = JSUS.subobj(result[el], fields);
			result[el] = temp;
		}
		return result;
	};

	getFilterFunction = function (search) {
		search = vsUtils.stripSpacesStartEnd(search);
		if (search == '') {
			search = 'true';
		}
		else {
			searchArray = search.split(' ');
			for (var index in searchArray) {
				word = searchArray[index];
				if (word == 'and') {
					word = '&&';
				}
				else if (word == 'or') {
					word = '||';
				}
				else if (word.indexOf('=') != -1) {
					word = 'el.' + word.replace('=', '== "') + '"';
				}
				else {
					word = 'el.indexOf("'+word+'") != -1';
				}
				searchArray[index] = word;
			}
			search = searchArray.join(' ');
		}
		var funcCode = 'if ('+search+') { return true;} return false;';
		console.log(funcCode);
		var filter = new Function('el', funcCode);
		return filter;
	};

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

		reloadUserDatabase: function () {
			searchDB = {config:{}, users:[]};
			vsInterface.dialog('<br />Please wait while we load the users database. No worries, it only happens the first time.<br /><br /><div id="vs-db-loading"></div>', 'Loading Users Database', null, function() {
				getSearchDataFromServer(0);
			}, '40%', '300');
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
