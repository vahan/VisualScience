var vsUserlist = (function() {
	var sendSearchToSave;

	sendSearchToSave = function (search) {
		console.log('Implement search saving for:' + search);
	};

	return {
		search: function () {
			console.log('Searched for: ' + jQuery('#visualscience-search-bar').val());
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
		}


	};
})();
