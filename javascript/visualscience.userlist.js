var vsUserlist = (function() {
	var sendSearchToSave, startAutoComplete, searchDB;

	sendSearchToSave = function (search) {
		console.log('Implement search saving for:' + search);
	};

	jQuery(document).ready(function() {
		//vsSearchDB is defined by the backend.
		searchDB = vsSearchDB;
		startAutoComplete();
		//Timeout so that the views have time to load.
		setTimeout(function() {
			//vsUserlist.search();
		}, 5000);
	});

	startAutoComplete = function (inputId, source) {
		source = source || vsUserlist.getUsersNamesFromDB();
		inputId = inputId || 'visualscience-search-bar';
		jQuery('#'+inputId).autocomplete({
			source: source,
			select: vsUserlist.search()
		});
	};

	getSearchResult = function (search) {
		return {
			"searchQuery": search
		};
	}

	return {
		search: function () {
			var search = jQuery('#visualscience-search-bar').val() || '';
			console.log('Searched for: ' + search);
			var searchResult = getSearchResult(search);
			vsInterface.openUserListTab(searchResult);
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
