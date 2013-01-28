var vsUtils = (function () {
	var rootFolder, UploadModuleURL, SendMailURL,;
	//This is the root folder, where the installation has been done. 
	rootFolder = document.location.href.substring(0, document.location.href.substring(document.location.href.indexOf('http://')+10).indexOf('/visualscience')+10);
	//This is the URL to the php upload module
	UploadModuleURL = rootFolder + '/visualscience/upload/';
	//This is the URL to the php that handles the mail
	SendMailURL = rootFolder + '/visualscience/mail/';
	//This is the folder in which visualscience is installed (Should be already defined thanks to PHP.)
	//var installFolder = 'sites/all/modules/visualscience/';

	return {
		
	
		}
	};

})();
