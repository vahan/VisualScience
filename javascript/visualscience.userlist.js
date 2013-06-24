/*
 * @file 
 * File that manages everything linked with storing the data of users in JS.
 *
 * Note that it also provide the searching functions.
 */
 var currentSearchNDDB, tagMarkNameFields, getFilteredDatabase, getSearchDataFromServer, allRequestHaveArrived, createFullNDDB, searchNDDB, maxNumberOfTableEntries, getUsersFor, mergeUsersSelections, findBestLogicalOperator, getLogicalCondition, sendSearchToSave, startAutoComplete, searchDB, maxAutocompleteEntries, delayBeforeTableCreation, getSearchResult, formatFieldTitle;

 var vsUserlist = (function() {
 	"use strict";



   maxAutocompleteEntries = 5;
   delayBeforeTableCreation = 3000;
   maxNumberOfTableEntries = 150;

   sendSearchToSave = function (search) {
     console.log('Implement search saving for:' + search);
   };

   jQuery(document).ready(function() {
     if (typeof store != 'undefined' && store('vsSearchDB')) {
      searchDB = store('vsSearchDB');
      createFullNDDB();
	        //Timeout so that the views have time to load.
          setTimeout(function () {
           vsUserlist.search();
         }, delayBeforeTableCreation);
        }
        else {
          vsUserlist.reloadUserDatabase();
        }
        //startAutoComplete();
      });

    /*
     * You only need full table, because when fetching you pass the array of fields you are interested in.
     */
     createFullNDDB = function () {
     	searchNDDB = new NDDB();
      var user, id;
      for (id in searchDB.users) {
       user = searchDB.users[id];
       user.id = id;
       searchNDDB.insert(user);
     }
     searchNDDB = searchNDDB.shuffle();
   };

   allRequestHaveArrived = function (total) {
        var threshold = 5; // Should be >= 1 -> anonymous user not counted
        return searchDB.users.length >= total - threshold;
      };

      getSearchDataFromServer = function (from) {
       jQuery.get(vsUtils.getUsersPath(), {
        userId: from 
      }, function(data) {
        var response = jQuery.parseJSON(data);
        jQuery('#vs-db-loading').progressbar({
         value: jQuery('#vs-db-loading').progressbar('value') + (response.howMany/response.total)*100
       });
        if (response.from == 0) {
         for (var i = response.howMany; i < response.total; i += response.howMany) {
          getSearchDataFromServer(i);
        }
      }
      for (var user in response.users) {
       searchDB.users.push(response.users[user]);
     }
     if (allRequestHaveArrived(response.total)) {
       vsInterface.closeDialog();
       searchDB.config = response.config;
       createFullNDDB();
       vsUserlist.search();
       store.onquotaerror = function () {
        vsInterface.dialog(vsText.dbTooLargeError, null, null, null, '40%');
      };
      store.localStorage('vsSearchDB', searchDB);
    }
  });
     };

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
      var fieldsInTable = vsUserlist.getSearchFields(type);
      result.fields = fieldsInTable;
      result.fields = tagMarkNameFields(result.fields);
      result.users = [];
      result.searchQuery = search;
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
    	currentSearchNDDB = getFilteredDatabase(search.toLowerCase());
      var temp, result, el;
      result = currentSearchNDDB.fetch();
      for (el in result) {
        temp = {
         id: result[el].id,
         type: el%2 == 0 ? 'even':'odd'
       };
       temp.fields = JSUS.subobj(result[el], fields);
       result[el] = temp;
     }
     return result;
   };

   getFilteredDatabase = function (search) {
    var filtered, operators, queries, queryRest, iter, breakQueryInThree;
    breakQueryInThree = function breakQueryInThree(query) {
      /*
      Should break a query like : A=B into ['A', '=', 'B']
       */
      var paramters;
      parameters = [];
      return 
    };
    operators = ['AND', 'and', 'OR', 'or'];
    queries = JSUS.tokenize(search, operators);
    filtered = searchNDDB;
    queryRest = search;
    filtered.select(breakQueryInThree(queries[0]));
    for (iter=1; queryRest.indexOf(' ') != -1; iter++) {

    }
    return filtered;
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

  getUserFromId: function(id) {
    return searchNDDB.select('id', '=', id).execute().fetch()[0];
  },

  search: function (type) {
    var search = document.getElementById('visualscience-search-bar').value || '';
    var searchResult = getSearchResult(search, type);
    vsInterface.manageNewSearch(searchResult);
  },

  reloadUserDatabase: function (from) {
    from = from || 0;
    searchDB = {config:{}, users:[]};
    vsInterface.dialog('<br />' + vsText.waitLoadingDB + '<br /><br /><div id="vs-db-loading"></div>', vsText.loadDBTitle, null, function() {
     jQuery('#vs-db-loading').progressbar({
      value: 1
    });
     getSearchDataFromServer(from);
   }, '40%', '250');
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
   vsInterface.dialog(content, vsText.saveSearchTitle, button, undefined, 'auto');
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
},

getSearchFields: function (type) {
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
},

getCurrentUsersFrom: function(from, howMany) {
  return currentSearchNDDB.db.splice(from, howMany);
}
};
})();
