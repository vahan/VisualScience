var vsConference = (function() {

	return {
		/*
		 * Creates a tab for a conference.
		 */
		 createTabConference : function(idOfTheTab) {
		 	selectedUsers = vsSearch.getSelectedUsersFromSearchTable(idOfTheTab);
		 	if (selectedUsers.length > 0) {
		 		var title = vsUtils.getTitleFromUsers(selectedUsers);
		 		var thisTabId = vsInterface.getTabId();
		 		vsInterface.addTab('<img src="' + vsUtils.getInstallFolder() + 'images/conference.png" width="13px" alt="image for message tab" /> ', title, '#conference-tab-' + thisTabId);

				//Create the conference tab
				vsInterface.getView('conferenceTabLayout.html', function(confTabView) {
					var parameters = {
						idOfThisTab: thisTabId
					};
					jQuery('#conference-tab-'+thisTabId).html(confTabView(parameters));
				});
			} else {
				alert('Please select at least one user.');
			}
		}
	};

})();
