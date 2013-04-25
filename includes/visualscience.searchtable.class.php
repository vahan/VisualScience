<?php
class Search {

	private function ensureSearchSafety ($search) {
		//TODO: Implement it !
		return $search;
	}

	private function getFieldsFromConfig () {
		$query = db_select('visualscience_search_config', 'f')
		->fields('f', array('name','mini','full','first','last'));
		$result = $query->execute();
		$final = array();
		for ($i=0; $record = $result->fetchAssoc(); $i++) {
			$final[$record['name']] = $record;
		}
		return $final;
	}

	private function getValueOfField ($field, $user) {
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
		return $value.'';
	}

	private function getUsersFields ($fields) {
		$usersIds = $this->getAllUsersIds();
		$users = user_load_multiple($usersIds);
		$userFields = array();
		foreach ($users as $user) {
			$userFields[$user->uid] = array();
			foreach ($fields as $field) {
				$valueOfField = $this->getValueOfField($field, $user);
				if ($field['first'] == 1) {
					$userFields[$user->uid]['first'] = $valueOfField;
				}
				else if ($field['last'] == 1) {
					$userFields[$user->uid]['last'] = $valueOfField;
				}
				else {
					$userFields[$user->uid][$field['name']] = $valueOfField;
				}
			}
		}
		return $userFields;
	}

	private function getJsonUsersFields ($fields) {
		return json_encode($this->getUsersFields($fields));
	}

	private function getJsonDisplayConfig ($fields) {
		$config = '{"fields": [';
		$endConfig = ']';
		foreach ($fields as $field) {
			$config .= '{"name": "'.$field['name'].'","mini": '.$field['mini'].', "full": '.$field['full'].'},';
			if ($field['first'] == 1) {
				$endConfig .= ', first: "'.$field['name'].'"';
			}
			if ($field['last'] == 1) {
				$endConfig .= ', last: "'.$field['name'].'"';
			}
		}
		$config = substr($config, 0, strlen($config) -1) .$endConfig. '}';
		return $config;
	}

	private function getAllUsersIds () {
		$query = db_select('users', 'f')
		->fields('f', array('uid'));
		$result = $query->execute();
		$final = array();
		for ($i=0; $record = $result->fetchAssoc(); $i++) {
			array_push($final, $record['uid']);
		}
		return $final;
	}

	public function getSavedSearch () {
		//TODO: Implement it
		if (isset($_GET['search'])) {
			return $_GET['search'];
		}
		return '';
	}

	public function getHtmlSearchBar ($searchValue= "") {
		$safeSearchVal = $this->ensureSearchSafety($searchValue);

		return '<div align="center">
		<input type="search" placeholder="Search..." val="'.$safeSearchVal.'" class="visualscience-search-main" id="visualscience-search-bar" onKeyUp="vsUserlist.search();" />
		</div>';
	}

	public function getHtmlSearchTable () {
		return '<div id="visualscience-container"></div>';
	}

	public function getJsonDatabase () {
		$fields = $this->getFieldsFromConfig();
		$jsonUsersAndFields = $this->getJsonUsersFields($fields);
		$jsonDisplayConfig = $this->getJsonDisplayConfig($fields);
		$searchDB = '{"users": '.$jsonUsersAndFields.', "config":'.$jsonDisplayConfig.'}';
		return '<script type="text/javascript" charset="utf-8">var vsSearchDB = '. $searchDB .';</script>';
	}

	public function getClientSideFiles () {
		global $user;
		drupal_add_library('system', 'ui.autocomplete');
		drupal_add_library('system', 'ui.datepicker');
		drupal_add_library('system', 'ui.dialog');
		drupal_add_library('system', 'ui.tabs');

		drupal_add_js('http://livingscience.ethz.ch/livingscience/livingscience/livingscience.nocache.js', 'external');
		drupal_add_css(drupal_get_path('module', 'visualscience') .'/css/visualscience.css');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.jquery.layout.js');
		drupal_add_css(drupal_get_path('module', 'visualscience') .'/css/visualscience.jquery.layout.css');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.jquery.tablesorter.js');
		drupal_add_css(drupal_get_path('module', 'visualscience') .'/css/visualscience.jquery.tablesorter.css');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.handlebars.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/lib/visualscience.nddb.js');
  		//Settings necessary to VisualScience:
		drupal_add_js(array('installFolder' => url(drupal_get_path('module', 'visualscience')).'/'), 'setting');
		if (isset($user->name)) {
			drupal_add_js(array('username' => $user->name), 'setting');
		}
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.utils.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.database.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.interface.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.search.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.message.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.csv.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.userlist.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.lscomparison.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.search.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.conference.js');
		drupal_add_js(drupal_get_path('module', 'visualscience') .'/javascript/visualscience.livingscience.js');
	}
}