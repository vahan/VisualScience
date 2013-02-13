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
		 		vsInterface.addTab('<img src="' + installFolder + '../images/conference.png" width="13px" alt="image for message tab" /> ', title, '#conference-tab-' + thisTabId);

				//Create the conference tab
				jQuery('#conference-tab-' + thisTabId).html('<h3>conference Tab</h3>');
			} else {
				alert('Please select at least one user.');
			}
		}
	};

})();
