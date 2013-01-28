var vsMessage = (function() {
	var uploadDB;

	//This variable will store every file that will be uploaded. The first part of the array represent the tab, and the second is the index of the file
	uploadDB = new Array();

	return {
		/*
		 * This function creates a new Tab where it is possible to send a message to the selected user(s)
		 */
		createTabSendMessage : function(idOfTheTab) {
			selectedUsers = getSelectedUsersFromSearchTable(idOfTheTab);
			if (selectedUsers.length > 0) {
				var selectedUsersEmail = getSelectedUsersEmailFromSearchTable(idOfTheTab);
				var title = getTitleFromUsers(selectedUsers);
				var thisTabId = tabId;
				addTab('<img src="' + installFolder + '../images/message.png" width="13px" alt="image for message tab" /> ', title, '#message-tab-' + thisTabId);

				//Create the message tab's HTML
				var subjectDiv = createSubjectDiv(thisTabId);
				var messageDiv = createMessageDiv(thisTabId);
				var attachmentDiv = createAttachmentsDiv(thisTabId);
				var recipientsDiv = createRecipientsDiv(thisTabId, selectedUsers, selectedUsersEmail);
				var sendButton = createSendMessageButton(thisTabId);
				var messageTab = '<h3>Message</h3><div width="100%"><div style="width:45%;display:inline-block;">' + subjectDiv + messageDiv + sendButton + '</div><div style="float:right;width:45%;display:inline-block;">' + recipientsDiv + attachmentDiv + '</div></div>';
				jQuery('#message-tab-' + thisTabId).html(messageTab);
				loadCLEditor('visualscience-message-input-' + thisTabId);
				loadDrupalHTMLUploadForm('no', 'upload-form-' + thisTabId, thisTabId);
				loadUploadScripts('upload-button-' + thisTabId, function() {
					//addAttachments();
				});
			} else {
				alert('Please select at least one user.');
			}
		},
		/*
		 * The subject input for messages and conferences
		 */
		createSubjectDiv : function(thisTabId) {
			return '<input type="text" name="visualscience-subject-input-' + thisTabId + '" id="visualscience-subject-input-' + thisTabId + '" style="width:98%;" placeholder="Subject" />';
		},

		/*
		 * The div for the message
		 */
		createMessageDiv : function(thisTabId) {
			return '<textarea name="visualscience-message-input-' + thisTabId + '" id="visualscience-message-input-' + thisTabId + '" style="width:100%;" rows="10" placeholder="Your message"></textarea>';
		},
		/*
		 * The attachment div for messages and conferences
		 */
		createAttachmentsDiv : function(thisTabId) {
			var content = '<div id="visualscience-message-attachments-div-show-' + thisTabId + '" style="height:150px;overflow-y:scroll;"></div><div id="upload-form-' + thisTabId + '"></div> <div id="progress-upload-' + thisTabId + '" style="margin:5px;padding:5px;background-color:red;font-size:12px;display:none;" >Progress</div>';
			return '<div id="visualscience-attachments-div-' + thisTabId + '" style="display:inline-block;width:100%;border:solid black 1px;margin-top:20px;">' + content + '</div>';
		},
		/*
		 * The recipients div for messages and conferences
		 */
		createRecipientsDiv : function(thisTabId, selectedUsers, selectedUsersEmail) {
			var content = '<div id="visualscience-recipient-div-content-' + thisTabId + '" style="width:100%;overflow-y:scroll;height:200px;">';
			for (var i = 0; i < selectedUsers.length; i++) {
				content += '<p id="visualscience-recipients-entry-' + thisTabId + '-' + i + '" style="border-bottom:solid black 1px;margin:0px;padding:0px;"><a onMouseOut="jQuery(this).css(\'color\', \'\');" onMouseOver="jQuery(this).css({\'color\': \'#FF0000\', \'text-decoration\':\'none\'});" onClick="deleteRecipientToMessage(' + thisTabId + ', ' + i + ');" id="visualscience-message-close-cross-' + thisTabId + '-' + i + '" style="border-right:solid black 1px;font-size:20px;padding-right:15px;padding-left:15px;margin-right:20px;">X</a><a class="visualscience-message-recipients-infos" href="mailto:' + selectedUsersEmail[i] + '">' + selectedUsers[i] + '</a></p>';
			}
			content += '</div>';
			return '<div id="visualscience-recipients-div-' + thisTabId + '" style="border:solid black 1px;display:inline-block;width:100%;">' + content + '<input type="button" style="margin-left:10px;margin-right:10px;" value="Add Recipient" id="visualscience-message-add-recipient-button-' + thisTabId + '" nbRecipients="' + selectedUsers.length + '" onClick="addRecipientForMessage(' + thisTabId + ');" /><input type="email" name="visualscience-message-add-recipient-email-' + thisTabId + '" id="visualscience-message-add-recipient-email-' + thisTabId + '" placeholder="Type an email" onKeyPress="if (event.keyCode == 13) addRecipientForMessage(' + thisTabId + ');" /></div>';
		},
		/*
		 * The send button, only for messages
		 */
		createSendMessageButton : function(thisTabId) {
			return '<div style="text-align:right;"><input type="button" onClick="sendVisualscienceMessage(' + thisTabId + ');" value="Send Message" id="visualscience-send-message-button-' + thisTabId + '" style="padding-right:15px;padding-left:15px;" /></div>';
		},
		/*
		 * Get informations and send them to the server through ajax
		 */
		sendVisualscienceMessage : function(thisTabId) {
			var mailURL = SendMailURL;
			jQuery('#visualscience-send-message-button-' + thisTabId).attr({
				'value' : 'Sending Message... Please wait',
				'disabled' : 'disabled'
			});
			var subjectVal = jQuery('#visualscience-subject-input-' + thisTabId).val();
			var messageVal = jQuery('#visualscience-message-input-' + thisTabId).val();
			var attachmentJson = getJsonOfAttachments(thisTabId);
			var recipientsArray = getRecipientsOfMessage(thisTabId);
			var flagAllDone = false;
			if (recipientsArray.length < 1) {
				alert('Please insert at least one recipient.');
				jQuery('#visualscience-send-message-button-' + thisTabId).attr({
					'value' : 'Send Message',
					'disabled' : false
				});
				return false;
			}
			for (var i = 0; i < recipientsArray.length; i++) {
				var recipientsVal = {
					name : recipientsArray[i][0],
					email : recipientsArray[i][1]
				};
				var jsonObject = {
					subject : subjectVal,
					message : messageVal,
					recipients : recipientsVal,
					attachments : attachmentJson
				};
				jQuery.ajax({
					url : mailURL,
					type : 'POST',
					data : jsonObject,
					error : function(req, msg, obj) {
						alert('An error occured on the server side while sending the message. Please contact the administrator if this happens again.');
						console.log(req);
						console.log(msg);
						console.log(obj);
						jQuery('#visualscience-send-message-button-' + thisTabId).attr({
							'value' : 'Re-try now',
							'disabled' : false
						});
					},
					success : function(data) {
						if (parseInt(data) != 1) {
							alert('There was a problem while sending the email. Please try again later.');
							jQuery('#visualscience-send-message-button-' + thisTabId).attr({
								'value' : 'Re-try now',
								'disabled' : false
							});
						}
					}
				});
				if (i == recipientsArray.length - 1) {
					flagAllDone = true;
				}
			}
			while (!flagAllDone);//Barrier to wait until all the requests has been made
			jQuery('#visualscience-send-message-button-' + thisTabId).attr({
				'value' : 'Message Sent. Send again ?',
				'disabled' : false
			});
		},
		/*
		 * Gets the value of the email to add and insert it into the div
		 */
		addRecipientForMessage : function(thisTabId) {
			var email = jQuery('#visualscience-message-add-recipient-email-' + thisTabId).val();
			if (email.indexOf('@') != -1) {
				var nbRecipients = parseInt(jQuery('#visualscience-message-add-recipient-button-' + thisTabId).attr('nbRecipients'));
				insertEmailIntoRecipientsDiv(thisTabId, email, nbRecipients);
				jQuery('#visualscience-message-add-recipient-button-' + thisTabId).attr('nbRecipients', nbRecipients + 1);
				var oldTitle = parseInt(jQuery('a[href="#message-tab-' + thisTabId + '"]').text());
				if (isNaN(oldTitle)) {
					var newTitle = ' 2 Users ';
					oldTitle = jQuery('#visualscience-recipients-div-' + thisTabId + ':first-child').text().substring(1, jQuery('#visualscience-recipients-div-' + thisTabId + ':first-child').text().substring(2).indexOf('X') + 2);
				} else if (oldTitle == 0) {
					var newTitle = ' ' + jQuery('#visualscience-recipients-div-' + thisTabId + ':first-child').text().substring(1) + ' ';
					oldTitle = ' 0 User ';
				} else {
					var newTitle = ' ' + (oldTitle + 1) + ' ';
					oldTitle = ' ' + oldTitle + ' ';
				}
				newTitle = jQuery('a[href="#message-tab-' + thisTabId + '"]').html().replace(oldTitle, newTitle);
				jQuery('a[href="#message-tab-' + thisTabId + '"]').html(newTitle);
				jQuery('#visualscience-recipient-div-content-' + thisTabId).scrollTop(jQuery('#visualscience-recipient-div-content-'+thisTabId)[0].scrollHeight);
			} else {
				alert('Please enter a valid email');
			}
		},
		insertEmailIntoRecipientsDiv : function(thisTabId, email, nbRecipients) {
			nbRecipients += 1;
			var entryToAppend = '<p id="visualscience-recipients-entry-' + thisTabId + '-' + nbRecipients + '" style="border-bottom:solid black 1px;margin:0px;padding:0px;"><a onMouseOut="jQuery(this).css(\'color\', \'\');" onMouseOver="jQuery(this).css({\'color\': \'#FF0000\', \'text-decoration\':\'none\'});" onClick="deleteRecipientToMessage(' + thisTabId + ', ' + nbRecipients + ');" id="visualscience-message-close-cross-' + thisTabId + '-' + nbRecipients + '" style="border-right:solid black 1px;font-size:20px;padding-right:15px;padding-left:15px;margin-right:20px;">X</a><a class="visualscience-message-recipients-infos" href="mailto:' + email + '">' + email + '</a></p>';
			jQuery('#visualscience-recipient-div-content-' + thisTabId).append(entryToAppend);
		},
		deleteRecipientToMessage : function(thisTabId, entryNb) {
			jQuery('#visualscience-recipients-entry-' + thisTabId + '-' + entryNb).hide(350, function() {
				jQuery('#visualscience-recipients-entry-' + thisTabId + '-' + entryNb).remove();
				var oldTitle = parseInt(jQuery('a[href="#message-tab-' + thisTabId + '"]').text());
				if (oldTitle == 2) {
					var newTitle = ' ' + jQuery('#visualscience-recipients-div-' + thisTabId + ':first-child').text().substring(1) + ' ';
					oldTitle = '2 Users';
				} else if (isNaN(oldTitle)) {
					var newTitle = ' 0 User ';
					oldTitle = jQuery('a[href="#message-tab-' + thisTabId + '"]').text().substring(0, jQuery('a[href="#message-tab-' + thisTabId + '"]').text().indexOf('X'));
				} else {
					var newTitle = ' ' + (oldTitle - 1) + ' ';
					oldTitle = ' ' + oldTitle + ' ';
				}
				newTitle = jQuery('a[href="#message-tab-' + thisTabId + '"]').html().replace(oldTitle, newTitle);
				jQuery('a[href="#message-tab-' + thisTabId + '"]').html(newTitle);
			});
		},
		/*
		 * Gets the name and email of every recipients of a message.
		 */
		getRecipientsOfMessage : function(thisTabId) {
			var recipientsEmailAndName = new Array();
			jQuery('p[id*="visualscience-recipients-entry-' + thisTabId + '"]').each(function(i) {
				recipientsEmailAndName[i] = new Array(2);
				recipientsEmailAndName[i][0] = jQuery(this).children(':nth-child(2)').text();
				recipientsEmailAndName[i][1] = jQuery(this).children(':nth-child(2)').attr('href').substring(7);
			});
			return recipientsEmailAndName;
		}
	};

})();
