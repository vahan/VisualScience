<?php
/**
 * @file(visualscience.searchtable.class.php)
 * File to generate and handle search and user related queries
 */
class Search {
  /**
   * Makes the search string safe for PHP
   * @param  string $search the search string
   * @return string         safe search string query
   */
  private function ensureSearchSafety($search) {
    //TODO: Implement it in a better way!
    return check_plain($search);
  }

  /**
   * Returns the current fields in the visualscience configuration page.
   * @return array of those fields with their values
   */
  private function getFieldsFromConfig() {
    $query = db_select('visualscience_search_config', 'f')
    ->fields('f', array('name', 'mini', 'full', 'first', 'last', ));
    $result = $query->execute();
    $final = array();
    for ($i=0; $record = $result->fetchAssoc(); $i++) {
      $final[$record['name']] = $record;
    }
    return $final;
  }

  /**
   * Gets the value of a given field and given user
   * @param  array $field containing the field configuration
   * @param  object $user  user object from db
   * @return string        the content of the queried field
   */
  private function getValueOfField($field, $user) {
    $value = $user->$field['name'];
    $ifDefField = field_view_field('user', $user, $field['name']);
    if (gettype($value) == 'object') {
      $value = 'Object';
    }
    if (gettype($value) == 'array' && !empty($ifDefField)) {
      $value = $ifDefField[0]['#markup'];
    }
    if (gettype($value) == 'array') {
      $list = '';
      foreach ($value as $innerVal) {
        if (gettype($innerVal) == 'array') {
          $list .= 'Array';
          break;
        }
        else {
          $list .= $innerVal . '; ';
        }
      }
      $value = $list;
    }
    return $value . '';
  }

  /**
   * Gets the fields'values for a range of users
   * @param  array  $fields the fields asked for
   * @param  integer $from   start index of users to get
   * @param  integer $to     end index of users to get
   * @return array          the array of fields for queried users
   */
  private function getUsersFields($fields, $from=0, $to=0) {
    if ($to != 0) {
      $usersIds = array();
      while ($from <= $to) {
        array_push($usersIds, $from);
        $from++;
      }
    }
    else {
      $usersIds = $this->getAllUsersIds();
    }
    $users = user_load_multiple($usersIds);
    $userFields = array();
    foreach ($users as $user) {
      if ($user->name != '') { // check for anonymous user
        $userFields[$user->uid] = array();
        foreach ($fields as $field) {
          $valueOfField = $this->getValueOfField($field, $user);
          if ($field['first'] == 1) {
            $userFields[$user->uid]['first'] = $valueOfField;
          }
          elseif ($field['last'] == 1) {
            $userFields[$user->uid]['last'] = $valueOfField;
          }
          else {
            $userFields[$user->uid][$field['name']] = $valueOfField;
          }
        }
      }
    }
    return $userFields;
  }

  /**
   * Gets the range users' fields in a json format
   * @param  array $fields the fields to get
   * @param  integer $from   start index to get users
   * @param  integer $to     end index to get users
   * @return string         json string of all fields for queried useres
   */
  private function getJsonUsersFields($fields, $from, $to) {
    return json_encode($this->getUsersFields($fields, $from, $to));
  }

  /**
   * Returns the display configuration for search table in json format
   * @param  array $fields fields that should be displayed
   * @return string         Json format of the configuration
   */
  private function getJsonDisplayConfig($fields) {
    $config = '{"fields": [';
    $endConfig = ']';
    foreach ($fields as $field) {
      $config .= '{"name": "' . $field['name'] . '","mini": ' . $field['mini'] . ', "full": ' . $field['full'] . '},';
      if ($field['first'] == 1) {
        $endConfig .= ', "first": "' . $field['name'] . '"';
      }
      if ($field['last'] == 1) {
        $endConfig .= ', "last": "' . $field['name'] . '"';
      }
    }
    $config = substr($config, 0, strlen($config) -1) . $endConfig . '}';
    return $config;
  }

  /**
   * Returns the ui dof every user in db
   * @return array array of all uids
   */
  private function getAllUsersIds() {
    $query = db_select('users', 'f')
    ->fields('f', array('uid'));
    $result = $query->execute();
    $final = array();
    for ($i=0; $record = $result->fetchAssoc(); $i++) {
      array_push($final, $record['uid']);
    }
    return $final;
  }

  /**
   * Returns the max user id
   * @return integer the max user id
   */
  private function getMaxUserId() {
    $max_id = db_select('users', 'x')
    ->fields('x', array('uid'))
    ->orderby('uid', 'DESC')
    ->range(0, 1)
    ->execute()
    ->fetchCol();

    return $max_id[0];
  }

  /**
   * Counts the number of users in the db
   * @return integer number of users in db
   */
  private function getCountOfUsers() {
    $query = db_select('users', 'f')
    ->fields(NULL, array('uid'));
    $result = $query->execute()->fetchAll();
    return count($result);
  }

  /**
   * Returns the saved searched
   * @return string to be implemented.
   */
  public function getSavedSearch() {
    //TODO: Implement it
    if (isset($_GET['search'])) {
      return $_GET['search'];
    }
    return '';
  }

  /**
   * Returns the basic HTML for the search bar.
   * @param  string $searchValue search string
   * @return string              the HTML of the searchbar
   */
  public function getHtmlSearchBar($searchValue= "") {
    $safeSearchVal = $this->ensureSearchSafety($searchValue);
    return '<div align="center">
    <input type="search" placeholder="Search..." val="' . $safeSearchVal . '" class="visualscience-search-main visualscience-search" id="visualscience-search-bar" " onKeyUp="vsUserlist.search();" />
    <div style="width:98%;" align="left">
    <p class="visualscience-right" align="right" style="display:inline;max-width:30%;">' . l(t("Help"), "admin/help/visualscience") . '</p>
    <p class="clickable" style="display:inline;max-width:30%;text-align:center;" align="center"><a onClick="vsUserlist.reloadUserDatabase(0);">Reload User Database</a></p>
    <p class="visualscience-left" align="right" style="visibility:hidden;display:inline;max-width:30%;text-align:center;margin-left:30%;"><a onClick="vsUserlist.saveSearch();">Save/Load</a></p>
    </div>
    </div>';
  }

  /**
   * Returns the HTML for the visualscience page
   * @return string the html where VisualScience is going to be set up
   */
  public function getHtmlSearchTable() {
    return '<div id="visualscience-container"></div>';
  }

  /**
   * Gets the JSON of the user database with the config
   * @return string script tage with the database in json format.
   */
  public function getJsonDatabase() {
    $fields = $this->getFieldsFromConfig();
    $jsonUsersAndFields = $this->getJsonUsersFields($fields);
    $jsonDisplayConfig = $this->getJsonDisplayConfig($fields);
    $searchDB = '{"users": ' . $jsonUsersAndFields . ', "config":' . $jsonDisplayConfig . '}';
    return '<script type="text/javascript" charset="utf-8">var vsSearchDB = ' . $searchDB . ';</script>';
  }

  /**
   * Adds client-side files needed for the application
   * @return none files added with druapal api.
   */
  public function getClientSideFiles() {
    global $user;
    global $base_path;
    drupal_add_library('system', 'ui.autocomplete');
    drupal_add_library('system', 'ui.datepicker');
    drupal_add_library('system', 'ui.dialog');
    drupal_add_library('system', 'ui.tabs');
    drupal_add_library('system', 'ui.progressbar');

    drupal_add_js('http://livingscience.ethz.ch/livingscience/livingscience/livingscience.nocache.js', 'external');
    drupal_add_css(drupal_get_path('module', 'visualscience') . '/css/visualscience.css');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/lib/visualscience.jquery.layout.js');
    drupal_add_css(drupal_get_path('module', 'visualscience') . '/css/visualscience.jquery.layout.css');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/lib/visualscience.jquery.tablesorter.js');
    drupal_add_css(drupal_get_path('module', 'visualscience') . '/css/visualscience.jquery.tablesorter.css');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/lib/visualscience.handlebars.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/lib/visualscience.nddb.js');
      //Settings necessary to VisualScience:
    drupal_add_js(array('installFolder' => $base_path . drupal_get_path('module', 'visualscience') . '/'), 'setting');
    if (isset($user->name)) {
      drupal_add_js(array('username' => $user->name), 'setting');
    }
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.utils.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.database.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.interface.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.text.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.message.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.csv.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.userlist.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.lscomparison.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.search.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.conference.js');
    drupal_add_js(drupal_get_path('module', 'visualscience') . '/javascript/visualscience.livingscience.js');
  }

  /**
   * Returns the configuration for the export action of pattern
   * @return array with the search table fields configuration
   */
  public function getPatternConfiguration() {
    return $this->getFieldsFromConfig();
  }

  /**
   * Gets every informations needed for the client-side DB, called through ajax
   * @param  integer $from    from which user to load the configurations
   * @param  integer $howMany how many users to load from $from
   * @return string           JSON of the full data containing client-side configuration and users' data
   */
  public function getUsersEntries($from=0, $howMany=1000) {
    $final = $from + $howMany;
    $fields = $this->getFieldsFromConfig();
    $jsonUsersAndFields = $this->getJsonUsersFields($fields, $from, $final);
    if ($from == 0) {
      $maxId = $this->getMaxUserId();
      $nbUsersPerPage = variable_get('visualscience_user_per_search_page', 150);
      $nbUserPerAjax = variable_get('visualscience_user_sent_per_ajax_request', 500);
      $nbUsersinServerDB = $this->getCountOfUsers();
      $showMessagesButton = variable_get('visualscience_show_messages_button');
      $showCSVButton = variable_get('visualscience_show_csv_button');
      $showLivingScienceButton = variable_get('visualscience_show_livingscience_button');
      // $showConferenceButton = variable_get('visualscience_show_conference_button');
      $showConferenceButton = 0;
    }
    else {
      $maxId = 0;
      $nbUsersPerPage = 150;
      $nbUserPerAjax = 500;
      $nbUsersinServerDB = 0;
      $showMessagesButton = 1;
      $showCSVButton = 1;
      $showLivingScienceButton = 1;
      $showConferenceButton = 1;
    }
    $jsonDisplayConfig = $this->getJsonDisplayConfig($fields);
    $searchDB = '{"users": ' . $jsonUsersAndFields . ', "config":' . $jsonDisplayConfig . ', "from": ' . $from . ',  "howMany":' . $howMany . ', "nbUsersPerPage": ' . $nbUsersPerPage . ', "nbUsersInServerDB": ' . $nbUsersinServerDB . ', "total": ' . $maxId . ', "csv": ' . $showCSVButton . ', "messages": ' . $showMessagesButton . ', "livingscience": ' . $showLivingScienceButton . ', "conference": ' . $showConferenceButton . ' }';
    return $searchDB;
  }
}