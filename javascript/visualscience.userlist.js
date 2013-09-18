/*
 * @file 
 * File that manages everything linked with storing the data of users in JS.
 *
 * Note that it also provide the searching functions.
 */
 var nddbSelSearchAll, addLikeOperator, currentSearchNDDB, tagMarkNameFields, getFilteredDatabase, getSearchDataFromServer, allRequestHaveArrived, createFullNDDB, searchNDDB, maxNumberOfTableEntries, getUsersFor, mergeUsersSelections, findBestLogicalOperator, getLogicalCondition, sendSearchToSave, startAutoComplete, searchDB, maxAutocompleteEntries, delayBeforeTableCreation, getSearchResult, formatFieldTitle;

 var vsUserlist = (function() {
 	"use strict";



   maxAutocompleteEntries = 5;
   delayBeforeTableCreation = 3000;
   maxNumberOfTableEntries = 150;

   /*
    * Saves a user-defined search into the server, only for this user. 
    * Don't forget to add it to the list of saved searches, 
    * so that the user can see it directly form the load searches view.
    * (Not implemented yet.)
    */
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
     addLikeOperator(searchNDDB);
   };

   /*
    * Adds the SQL Like operator to the NDDB passed as parameter. 
    * It firstly needs to define the a way to escape a strign to put it into a regex.
    */
    addLikeOperator = function (db) {

      RegExp.escape = function(str) {
        return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
      };

   /*
    * These lines add the SQL Like operator to an NDDB.(Case Sensitive)
    */
    // db.query.registerOperator('~s', function registerLikeOperator(d, value, comparator) {
      db.addFilter('~s', function registerLikeOperator(d, value, comparator) {
        var regex;
        regex = value;
        regex = RegExp.escape(value);
        regex = regex.replace(/%/g, '.*').replace(/_/g, '.');
        regex = new RegExp('^' + regex + '$', 'g');
        if ('object' === typeof d) {
          return function(elem) {
            var i, len;
            len = d.length;
            for (i = 0; i < len ; i++) {
              if (regex.test(elem[d])) {
                return elem;
              }
            }
          };
        }
        else if (d === '*') {
          return function(elem) {
            var d, c;
            for (d in elem) {
              c = db.getComparator(d);
              value[d] = value[0]['*'];
              if (regex.test(elem[d])) {
                return elem;
              }
            }
          };
        }
        else {
          return function(elem) {
            if (regex.test(elem[d])) {
              return elem;
            }
          };
        }
      });


   /*
    * These lines add the SQL Like operator to an NDDB.(Case Insensitive)
    */
    // db.query.registerOperator('~i', function registerLikeOperator(d, value, comparator) {
      db.addFilter('~i', function registerLikeOperator(d, value, comparator) {
        var regex;
        regex = value;
        regex = RegExp.escape(value);
        regex = regex.replace(/%/g, '.*').replace(/_/g, '.');
        regex = new RegExp('^' + regex + '$', 'i');
        if ('object' === typeof d) {
          return function(elem) {
            var i, len;
            len = d.length;
            for (i = 0; i < len ; i++) {
              if (regex.test(elem[d[i]])) {
                return elem;
              }
            }
          };
        }
        else if (d === '*') {
          return function(elem) {
            var d, c;
            for (d in elem) {
              c = db.getComparator(d);
              value[d] = value[0]['*'];
              if (regex.test(elem[d])) {
                return elem;
              }
            }
          };
        }
        else {
          return function(elem) {
            if (regex.test(elem[d])) {
              return elem;
            }
          };
        }
      });
};

  /*
   * True if the number of users in the main DB (searchDB) is equal or 
   * greater than the number of users on the server.
   */
   allRequestHaveArrived = function (total) {
        var threshold = 5; // Should be >= 1 -> anonymous user not counted
        return searchDB.users.length >= total - threshold;
      };

      /*
       * Gets Users form the server's DB, stores them asynchornuously into a variable and
       * tries to store them into the localStorage of the browser. (Throws exception if it can't.) 
       */
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

     /*
      * Initializes and enables the autocomplete feature.
      * (Not usefull yet and never called in document.ready())
      */
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

     /*
      * Input: search string and whether it is a full (type = 0) or minimum search
      * Returns: An NDDB, with the search results, and the good type of fields, ready to be printed.
      */
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
      result.users = getUsersFor(search, fieldsInTable);
      result.limit = maxNumberOfTableEntries;
      return result;
    };

    /*
     * Input: Search string and fields to show
     * Returns: an NDDB, whose entries have an id, are even or odd and only contains the asked fields.
     */
     getUsersFor = function (search, fields) {
       currentSearchNDDB = getFilteredDatabase(search, fields);
       var temp, result, el;
       result = currentSearchNDDB.fetch();
       for (el in result) {
        temp = {
         id: result[el].id,
         type: el%2 === 0 ? 'even':'odd'
       };
       temp.fields = JSUS.subobj(result[el], fields);
       result[el] = temp;
     }
     return result;
   };

   /*
    * This function receives the search string and returns the results from the search in the main searchNDDB, in a cloned variable.
    * The optional parameter fields(is an array) specifies which fields to make the search on. If not defined, the search will be on evry fields.(Default)
    * 
    *  To change for general NDDB implementation: 
    * - searchNDDB
    * - operators in addLikeOperators
    * - like-operation symbols in the code (ie, ~i and ~s)
    */
    getFilteredDatabase = function(search, fields) {
      var queries, filtered, iter, operators, wildcard;
      if (typeof search !== 'string') {
        return searchNDDB.breed();
      }
      search = search.trim();
      if (search == '') {
        return searchNDDB.breed();
      }
      wildcard = fields || '*';
      operators = Object.keys(searchNDDB.filters);
      operators[0] = '=';
      for (iter = 0; iter < operators.length; iter++) {
        /*
         * We don't want the the operators containing 'in', as they could 
         * modify the search query in an unexpected way. 
         * Example: nameinhelbing -> name in helb in g
         * That's also why we changed operators[0] = '=', to avoid having 
         * the E operator.
         */
         if (!(/[a-z]/.test(operators[iter]))) { // operators[iter].indexOf('in') == -1
          search = search.replace(new RegExp('\\s*' + operators[iter] + '\\s*', 'g'), ' ' + operators[iter] + ' ');
      }
    }
    filtered = searchNDDB.breed();
    addLikeOperator(filtered);
    queries = search.split(' ');
    if (!queries[1] || queries[1].toLowerCase() === 'and' || queries[1].toLowerCase() === 'or') {
      filtered.select(wildcard, '~i', '%' + queries[0] + '%');
      iter = 1;
    }
    else {
      filtered.select(queries[0], queries[1], queries[2]);
      iter = 3;
    }
    while (iter < queries.length) {
     if (queries[iter].toLowerCase() === 'and') {

      if (!queries[iter+2] || queries[iter+2].toLowerCase() === 'and' || queries[iter+2].toLowerCase() === 'or') {
        filtered.and(wildcard, '~i', '%' + queries[iter+1] + '%');
        iter -= 2;
      }
      else {
        filtered.and(queries[iter+1], queries[iter+2], queries[iter+3]);
      }
    }
    else {
      if (!queries[iter+2] || queries[iter+2].toLowerCase() === 'and' || queries[iter+2].toLowerCase() === 'or') {
        filtered.or(wildcard, '~i', '%' + queries[iter+1] + '%');
        iter -= 2;
      }
      else {
        filtered.or(queries[iter+1], queries[iter+2], queries[iter+3]);
      }

    }
    iter += 4;
  }
  return filtered.execute();
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

  totalNumberOfUsers: function totalNumberOfUsers () {
    return searchNDDB.count();
  },

  getUserFromId: function(id) {
    return searchNDDB.select('id', '=', id).execute().fetch()[0];
  },

  search: function (type) {
    var search, searchResult;
    search = document.getElementById('visualscience-search-bar').value || '';
    searchResult = getSearchResult(search, type);
    vsDatabase.resetSelectedUser();
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
