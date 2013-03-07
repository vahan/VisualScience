var vsConference = (function() {
	var renameConferenceTab, insertEmailIntoRecipientsDiv;

	renameConferenceTab =  function (thisTabId) {
		var nbRecipients = jQuery('#visualscience-recipient-div-content-'+thisTabId+' p').size();
		var title = '';
		if (nbRecipients == 1) {
			title = ' ' + jQuery('#visualscience-recipient-div-content-'+thisTabId+' p a:nth-child(2)').text();
		}
		else if (nbRecipients == 0) {
			title = ' No User';
		}
		else {
			title = ' ' + nbRecipients + ' Users';
		}
		var oldTitle = jQuery('a[href="#conference-tab-' + thisTabId + '"]').text();
		oldTitle = oldTitle.substring(0, oldTitle.length -1);
		var tabTitleContent = jQuery('a[href="#conference-tab-' + thisTabId + '"]').html().replace(oldTitle, title);
		jQuery('a[href="#conference-tab-' + thisTabId + '"]').html(tabTitleContent);
	};

	insertEmailIntoRecipientsDiv = function(thisTabId, email, nbRecipients) {
		nbRecipients += 1;
		vsInterface.getView('confNewRecipientsEntry.html', function(newEntry) {
			var parameters = {
				thisTabId: thisTabId,
				email: email,
				nbRecipients: nbRecipients
			};
			jQuery('#visualscience-recipient-div-content-' + thisTabId).append(newEntry(parameters));
		});
	};

	return {
		/*
		 * Creates a tab for a conference.
		 */
		 createTabConference : function(idOfTheTab) {
		 	selectedUsers = vsSearch.getSelectedUsersFromSearchTable(idOfTheTab);
		 	if (selectedUsers.length > 0) {
		 		var title = vsUtils.getTitleFromUsers(selectedUsers);
		 		var thisTabId = vsInterface.getTabId();
		 		vsInterface.addTab('<img src="' + vsUtils.getInstallFolder() + 'images/conference.png" width="13px" alt="image for conference tab" /> ', title, '#conference-tab-' + thisTabId);

				//Create the conference tab
				vsInterface.getView('conferenceTabLayout.html', function(confTabView) {
					var usersEmail = vsSearch.getSelectedUsersEmailFromSearchTable(idOfTheTab);
					var users = new Array();
					for (var i=0; i < usersEmail.length; i++) {
						users[i] = {
							id: i,
							name: selectedUsers[i],
							email: usersEmail[i],
							tab: thisTabId
						};
					}
					var parameters = {
						thisTabId: thisTabId,
						user: users,
						nbUsers: users.length
					};
					var recipients = vsInterface.getView('confRecipientsLayout.html', function(data) {
						return data;
					});
					parameters.recipients = recipients(parameters);
					jQuery('#conference-tab-'+thisTabId).html(confTabView(parameters));
					jQuery('.datepicker').datepicker();
					vsUtils.loadTimepickr(function(){
						//TODO: Need jQuery 1.7+ to work...
						jQuery('#timepicker').timepicker();
					});
					vsUtils.loadCLEditor('lceEditor'+thisTabId);
		 			vsUtils.loadDrupalHTMLUploadForm('no', 'upload-form-' + thisTabId, thisTabId);
				});
			} else {
				alert('Please select at least one user.');
			}
		},
		addRecipientForConference : function(thisTabId) {
			var email = jQuery('#visualscience-conference-add-recipient-email-' + thisTabId).val();
			if (email.indexOf('@') != -1) {
				var nbRecipients = parseInt(jQuery('#visualscience-conference-add-recipient-button-' + thisTabId).attr('nbRecipients'));
				insertEmailIntoRecipientsDiv(thisTabId, email, nbRecipients);
				jQuery('#visualscience-conference-add-recipient-button-' + thisTabId).attr('nbRecipients', nbRecipients + 1);
				renameConferenceTab(thisTabId);
				jQuery('#visualscience-recipient-div-content-' + thisTabId).scrollTop(jQuery('#visualscience-recipient-div-content-'+thisTabId)[0].scrollHeight);
			} else {
				alert('Please enter a valid email');
			}
		},
		deleteRecipientToConference : function(thisTabId, entryNb) {
			jQuery('#visualscience-recipients-entry-' + thisTabId + '-' + entryNb).hide(350, function() {
				jQuery('#visualscience-recipients-entry-' + thisTabId + '-' + entryNb).remove();
				renameConferenceTab(thisTabId);
			});
		}
	};
})();
